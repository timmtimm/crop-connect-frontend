import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import {
  Alert,
  AlertTitle,
  Button,
  InputAdornment,
  MenuItem,
  Step,
  StepLabel,
  Stepper,
  TextField,
} from "@mui/material";
import Link from "next/link";
import { GoPlus } from "react-icons/go";
import useSWRMutation from "swr/mutation";
import { getPagination } from "@/utils/url";
import { runOnce } from "@/lib/swr";
import Loading from "@/components/modules/loading";
import { Delete, fetcher, putWithJSON, triggerfetcher } from "@/lib/axios";
import { useEffect, useState } from "react";
import {
  batchStatus,
  proposalStatus,
  roleUser,
  treatmentRecordStatus,
} from "@/constant/constant";
import { HttpStatusCode } from "axios";
import Table from "@/components/modules/table";
import { useRouter } from "next/router";
import Status, {
  convertStatusForBatch,
  convertStatusForProposal,
  convertStatusForTreatmentRecord,
} from "@/components/elements/status";
import { FaSearch } from "react-icons/fa";
import {
  dateFormatToIndonesia,
  setNumberFormat,
  setPriceFormat,
} from "@/utils/utilities";
import useSWR from "swr";

const headCells = [
  {
    id: "commodity",
    label: "Komoditas",
    isSort: false,
    customDisplayRow: (data) => data.proposal.commodity.name,
  },
  {
    id: "batch",
    label: "Periode",
    isSort: false,
    customDisplayRow: (data) => data.batch.name,
  },
  {
    id: "number",
    label: "Riwayat ke-",
    isSort: false,
    customDisplayRow: null,
  },
  {
    id: "date",
    label: "Tanggal pengisian",
    isSort: false,
    customDisplayRow: null,
  },
  {
    id: "status",
    label: "Status",
    isSort: true,
    customDisplayRow: (data) => (
      <div className="flex w-full justify-center">
        <Status
          className="w-fit"
          type={convertStatusForTreatmentRecord(data.status)}
          status={data.status}
        />
      </div>
    ),
  },
  {
    id: "validator",
    label: "Diterima oleh",
    isSort: false,
    customDisplayRow: (data) => data?.accepter?.name,
  },
  {
    id: "createdAt",
    label: "Terdaftar waktu",
    isSort: true,
    customDisplayRow: (data) => dateFormatToIndonesia(data.createdAt, true),
  },
];

const steps = ["Pilih Komoditas", "Pilih Periode"];

export default () => {
  const router = useRouter();
  const pagination = getPagination();

  const headCellsCommodity = [
    {
      id: "code",
      label: "Kode",
      isSort: false,
      customDisplayRow: (data) => (
        <span
          className="cursor-pointer"
          onClick={() => {
            setInput({
              ...input,
              commodityID: data._id,
              commodityName: data.name,
              batchID: "",
              batchName: "",
            });
            triggerBatch({
              ...pagination,
              commodityID: data._id,
            });
            setActiveStep(1);
          }}
        >
          {data._id}
        </span>
      ),
    },
    {
      id: "name",
      label: "Nama",
      isSort: true,
      customDisplayRow: null,
    },
    {
      id: "plantingPeriod",
      label: "Jangka waktu penanaman",
      isSort: true,
      customDisplayRow: (data) =>
        `${setNumberFormat(data.plantingPeriod)} hari`,
    },
    {
      id: "pricePerKg",
      label: "Harga per kilogram",
      isSort: true,
      customDisplayRow: (data) => setPriceFormat(data.pricePerKg),
    },
    {
      id: "isPerennials",
      label: "Perennials",
      isSort: false,
      customDisplayRow: (data) => (data.isPerennials ? "Ya" : "Tidak"),
    },
    {
      id: "isAvailable",
      label: "Tersedia",
      isSort: true,
      customDisplayRow: (data) => (data.isAvailable ? "Ya" : "Tidak"),
    },
    {
      id: "createdAt",
      label: "Dibuat waktu",
      customDisplayRow: (data) => dateFormatToIndonesia(data.createdAt),
    },
  ];

  const headCellsBatch = [
    {
      id: "id",
      label: "ID",
      isSort: false,
      customDisplayRow: (data) => (
        <span
          className="cursor-pointer"
          onClick={() => {
            setInput({
              ...input,
              batchID: data._id,
              batchName: data.name,
              batchStatus: data.status,
            });
          }}
        >
          {data._id}
        </span>
      ),
    },
    {
      id: "proposal",
      label: "Proposal",
      isSort: false,
      customDisplayRow: (data) => data.proposal.name,
    },
    {
      id: "name",
      label: "Nama Periode",
      isSort: false,
      customDisplayRow: null,
    },
    {
      id: "estimatedHarvestDate",
      label: "Estimasi waktu panen",
      isSort: false,
      customDisplayRow: null,
    },
    {
      id: "status",
      label: "Status",
      isSort: false,
      convertStatusComponent: (data) => convertStatusForBatch(data),
      customDisplayRow: (data) => (
        <div className="flex w-full justify-center">
          <Status
            className="w-fit"
            type={convertStatusForBatch(data.status)}
            status={data.status}
          />
        </div>
      ),
    },
    {
      id: "createdAt",
      label: "Dibuat waktu",
      isSort: false,
      customDisplayRow: (data) => dateFormatToIndonesia(data.createdAt),
    },
  ];

  /* Modal */
  const [openModal, setOpenModal] = useState(false);
  const handleModal = () => setOpenModal(!openModal);

  const [activeStep, setActiveStep] = useState(0);
  const [input, setInput] = useState({
    commodityID: "",
    commodityName: "",
    batchID: "",
    batchName: "",
    batchStatus: "",
  });
  const [search, setSearch] = useState({
    commodity: "",
    batch: "",
  });

  const handleChangeSearch = ({ target: { name, value } }) => {
    setSearch({ ...search, [name]: value });
  };

  const {
    data: dataTreatmentRecord,
    trigger: triggerTreatmentRecord,
    isMutating: mutatingTreatmentRecord,
  } = useSWRMutation("/api/v1/treatment-record", triggerfetcher);

  const {
    data: dataTreatmentRecordPending,
    isLoading: treamentRecordPendingLoading,
  } = useSWR(
    ["/api/v1/treatment-record", { status: treatmentRecordStatus.pending }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );
  const {
    data: dataTreatmentRecordRevision,
    isLoading: treamentRecordRevisionLoading,
  } = useSWR(
    ["/api/v1/treatment-record", { status: treatmentRecordStatus.revision }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  useEffect(() => {
    if (input.batchID && input.commodityID) {
      triggerTreatmentRecord({
        ...pagination,
        batchID: input.batchID,
      });
    }
  }, [input.batchID]);

  const {
    data: dataCommodity,
    trigger: triggerCommodity,
    isMutating: mutatingCommodity,
  } = useSWRMutation("/api/v1/commodity/farmer", triggerfetcher);

  const handleSearchCommodity = () => {
    if (search.commodity || input.farmerID) {
      triggerCommodity({
        ...pagination,
        farmerID: input.farmerID,
        name: search.commodity,
      });
    } else {
      triggerCommodity({
        ...pagination,
      });
    }
  };

  const {
    data: dataBatch,
    trigger: triggerBatch,
    isMutating: mutatingBatch,
  } = useSWRMutation("/api/v1/batch", triggerfetcher);

  const handleSearchBatch = () => {
    if (search.batch || input.commodityID) {
      triggerBatch({
        ...pagination,
        commodityID: input.commodityID,
        name: search.batch,
      });
    } else {
      triggerBatch({
        ...pagination,
      });
    }
  };

  useEffect(() => {
    handleSearchCommodity();
  }, []);

  return (
    <>
      <Seo title="Daftar Riwayat Perawatan" />
      {(mutatingTreatmentRecord || mutatingBatch || mutatingCommodity) && (
        <Loading />
      )}
      <Dashboard roles={roleUser.farmer}>
        <h1 className="text-2xl font-bold mb-4">Daftar Riwayat Perawatan</h1>
        <Alert className="mb-4 border-[1px] border-[#0288D1]" severity="info">
          <AlertTitle className="font-semibold">Informasi</AlertTitle>
          <span>
            Pemilihan periode komoditas digunakan untuk menampilkan riwayat
            perawatan secara spesifik pada periode penananaman tersebut. Untuk
            melihat riwayat perawatan pada spesifik periode, silahkan isi
            pemilihan periode komoditas.
          </span>
        </Alert>
        <div className="bg-white w-full mb-4 p-4 rounded-xl shadow-md">
          <div className="flex flex-row justify-between items-start">
            <div>
              <h2 className="font-semibold mb-2">
                Pemilihan periode komoditas
              </h2>
              <p className="text-sm sm:text-base mb-4">
                Silahkan melakukan pengisian formulir ini untuk menampilkan
                riwayat perawatan pada periode penanaman komoditas
              </p>
            </div>
            <Button
              className="font-semibold"
              onClick={() => {
                setInput({
                  commodityID: "",
                  commodityName: "",
                  batchID: "",
                  batchName: "",
                });
                setActiveStep(0);
                setSearch({
                  commodity: "",
                  batch: "",
                });
              }}
            >
              Reset
            </Button>
          </div>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>
                  <span
                    className="cursor-pointer"
                    onClick={() => setActiveStep(index)}
                  >
                    {label}
                  </span>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <div className="mt-4">
            {activeStep == 0 ? (
              <>
                <h3 className="font-semibold mb-2">Pemilihan komoditas</h3>
                <p className="text-sm sm:text-base">
                  Silahkan melakukan pencarian komoditas melalui kolom pencarian
                  dan pilih komoditas melalui ID pada tabel.
                </p>
                {input.commodityID && (
                  <span>
                    Komoditas yang dipilih:{" "}
                    <span className="font-semibold">
                      {input.commodityID} - {input.commodityName}
                    </span>
                  </span>
                )}
                {input.farmerID && (
                  <div className="flex justify-end mt-2">
                    <TextField
                      placeholder="Komoditas"
                      variant="outlined"
                      name="commodity"
                      required
                      InputProps={{
                        className:
                          "bg-white rounded-lg text-sm md:text-base focus:border-0 hover:border-0",
                        endAdornment: (
                          <InputAdornment position="end">
                            <FaSearch
                              className="cursor-pointer"
                              onClick={(e) => handleSearchCommodity(e)}
                              size={20}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ "& input": { padding: "0.75rem" } }}
                      value={search.commodity}
                      onChange={handleChangeSearch}
                      onKeyDown={(e) =>
                        e.keyCode === 13 ? handleSearchCommodity(e) : null
                      }
                    />
                  </div>
                )}
                {dataCommodity && !mutatingCommodity && (
                  <div className="mt-4">
                    <Table
                      minWidth={400}
                      headCells={headCellsCommodity}
                      data={dataCommodity}
                      menuAction={null}
                      uniqueKeyPagination="commodity"
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="font-semibold mb-2">Pemilihan periode</h3>
                <p className="text-sm sm:text-base">
                  Silahkan melakukan pencarian periode melalui kolom pencarian
                  dan pilih periode melalui ID pada tabel.
                </p>
                {input.batchID && (
                  <span>
                    Periode yang dipilih:{" "}
                    <span className="font-semibold">
                      {input.batchID} - {input.batchName}
                    </span>
                  </span>
                )}
                {input.commodityID && input.farmerID && (
                  <div className="flex justify-end mt-2">
                    <TextField
                      placeholder="Periode"
                      variant="outlined"
                      name="batch"
                      required
                      InputProps={{
                        className:
                          "bg-white rounded-lg text-sm md:text-base focus:border-0 hover:border-0",
                        endAdornment: (
                          <InputAdornment position="end">
                            <FaSearch
                              className="cursor-pointer"
                              onClick={(e) => handleSearchBatch(e)}
                              size={20}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ "& input": { padding: "0.75rem" } }}
                      value={search.batch}
                      onChange={handleChangeSearch}
                      onKeyDown={(e) =>
                        e.keyCode === 13 ? handleSearchBatch(e) : null
                      }
                    />
                  </div>
                )}
                {dataBatch && !mutatingBatch && (
                  <div className="mt-4">
                    <Table
                      minWidth={400}
                      headCells={headCellsBatch}
                      data={dataBatch}
                      menuAction={null}
                      uniqueKeyPagination={"batch"}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {!mutatingTreatmentRecord && input.batchID && (
          <>
            <div className="flex flex-row justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {input.batchID &&
                  `Riwayat Perawatan Periode ${input.batchName}`}
              </h3>
            </div>
            {dataTreatmentRecord && !mutatingTreatmentRecord && (
              <Table
                minWidth={400}
                headCells={headCells}
                data={dataTreatmentRecord}
                menuAction={(data) => (
                  <>
                    {data.status != treatmentRecordStatus.approved && (
                      <Link href={`${router.pathname}/fill/${data._id}`}>
                        <MenuItem>Pengisian</MenuItem>
                      </Link>
                    )}
                    <Link href={`${router.pathname}/detail/${data._id}`}>
                      <MenuItem>Lihat Detail</MenuItem>
                    </Link>
                  </>
                )}
                uniqueKeyPagination={"treatmentRecord"}
              />
            )}
          </>
        )}
        {!input.batchID && (
          <>
            <div className="flex flex-row justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Permintaan Pengisian Riwayat Perawatan
              </h3>
            </div>
            {dataTreatmentRecordPending && !treamentRecordPendingLoading && (
              <Table
                minWidth={400}
                headCells={headCells}
                data={dataTreatmentRecordPending}
                menuAction={(data) => (
                  <>
                    {data.status != treatmentRecordStatus.approved && (
                      <Link href={`${router.pathname}/fill/${data._id}`}>
                        <MenuItem>Pengisian</MenuItem>
                      </Link>
                    )}
                    <Link href={`${router.pathname}/detail/${data._id}`}>
                      <MenuItem>Lihat Detail</MenuItem>
                    </Link>
                  </>
                )}
                uniqueKeyPagination={"treatmentRecordPending"}
              />
            )}
            <div className="flex flex-row justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Revisi Riwayat Perawatan
              </h3>
            </div>
            {dataTreatmentRecordRevision && !treamentRecordRevisionLoading && (
              <Table
                minWidth={400}
                headCells={headCells}
                data={dataTreatmentRecordRevision}
                menuAction={(data) => (
                  <>
                    {data.status != treatmentRecordStatus.approved && (
                      <Link href={`${router.pathname}/fill/${data._id}`}>
                        <MenuItem>Pengisian</MenuItem>
                      </Link>
                    )}
                    <Link href={`${router.pathname}/detail/${data._id}`}>
                      <MenuItem>Lihat Detail</MenuItem>
                    </Link>
                  </>
                )}
                uniqueKeyPagination={"treatmentRecordRevision"}
              />
            )}
          </>
        )}
      </Dashboard>
    </>
  );
};
