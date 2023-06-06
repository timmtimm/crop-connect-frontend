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

const headCells = [
  {
    id: "farmer",
    label: "Petani",
    isSort: false,
    customDisplayRow: (data) => data.proposal.commodity.farmer.name,
  },
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
    customDisplayRow: (data) => setNumberFormat(data.number),
  },
  {
    id: "date",
    label: "Tanggal pengisian",
    isSort: false,
    customDisplayRow: (data) => dateFormatToIndonesia(data.date),
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
    customDisplayRow: (data) => data?.accpeter?.name,
  },
  {
    id: "createdAt",
    label: "Terdaftar waktu",
    isSort: true,
    customDisplayRow: (data) => dateFormatToIndonesia(data.date, true),
  },
];

const steps = ["Pilih Petani", "Pilih Komoditas", "Pilih Periode"];

export default () => {
  const router = useRouter();
  const pagination = getPagination();

  const headCellsFarmer = [
    {
      id: "_id",
      label: "ID",
      isSort: false,
      customDisplayRow: (data) => (
        <span
          className="cursor-pointer"
          onClick={() => {
            setInput({
              farmerID: data._id,
              farmerName: data.name,
              commodityID: "",
              commodityName: "",
              batchID: "",
              batchName: "",
            });
            handleSearchCommodity();
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
      id: "email",
      label: "Email",
      isSort: true,
      customDisplayRow: null,
    },
    {
      id: "phoneNumber",
      label: "Nomor handphone",
      isSort: true,
      customDisplayRow: null,
    },
    {
      id: "province",
      label: "Provinsi",
      isSort: false,
      customDisplayRow: (data) => data.region.province,
    },
    {
      id: "regency",
      label: "Kabupaten",
      isSort: false,
      customDisplayRow: (data) => data.region.regency,
    },
    {
      id: "district",
      label: "Kecamatan",
      isSort: false,
      customDisplayRow: (data) => data.region.district,
    },
    {
      id: "subdistrict",
      label: "Kelurahan",
      isSort: false,
      customDisplayRow: (data) => data.region.subdistrict,
    },
    {
      id: "createdAt",
      label: "Terdaftar waktu",
      isSort: true,
      customDisplayRow: (data) => dateFormatToIndonesia(data.createdAt, true),
    },
  ];

  const headCellsCommodity = [
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
              commodityID: data._id,
              commodityName: data.name,
              batchID: "",
              batchName: "",
            });
            triggerBatch({
              ...pagination,
              commodityID: data._id,
            });
            setActiveStep(2);
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
      label: "Status",
      isSort: true,
      customDisplayRow: (data) =>
        data.isAvailable ? "Tersedia" : "Tidak tersedia",
    },
    {
      id: "createdAt",
      label: "Dibuat waktu",
      isSort: true,
      customDisplayRow: (data) => dateFormatToIndonesia(data.createdAt, true),
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
      customDisplayRow: (data) =>
        dateFormatToIndonesia(data.estimatedHarvestDate, true),
    },
    {
      id: "status",
      label: "Status",
      isSort: false,
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
      customDisplayRow: (data) => dateFormatToIndonesia(data.createdAt, true),
    },
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [input, setInput] = useState({
    farmerID: "",
    farmerName: "",
    commodityID: "",
    commodityName: "",
    batchID: "",
    batchName: "",
    batchStatus: "",
  });
  const [search, setSearch] = useState({
    farmer: "",
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

  useEffect(() => {
    if (input.batchID && input.commodityID && input.farmerID) {
      triggerTreatmentRecord({
        ...pagination,
        batchID: input.batchID,
      });
    } else {
      triggerTreatmentRecord({
        ...pagination,
        status: treatmentRecordStatus.pending,
      });
    }
  }, [input.batchID]);

  const {
    data: dataFarmer,
    trigger: triggerFarmer,
    isMutating: mutatingFarmer,
  } = useSWRMutation("/api/v1/user/farmer", triggerfetcher);

  const handleSearchFarmer = () => {
    if (search.farmer) {
      triggerFarmer({
        ...pagination,
        name: search.farmer,
      });
    } else {
      triggerFarmer({
        ...pagination,
      });
    }
  };

  const {
    data: dataCommodity,
    trigger: triggerCommodity,
    isMutating: mutatingCommodity,
  } = useSWRMutation("/api/v1/commodity", triggerfetcher);

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
    handleSearchFarmer();
  }, []);

  return (
    <>
      <Seo title="Daftar Riwayat Perawatan" />
      {(mutatingTreatmentRecord ||
        mutatingBatch ||
        mutatingCommodity ||
        mutatingFarmer) && <Loading />}
      <Dashboard roles={roleUser.validator}>
        <h1 className="text-2xl font-bold mb-4">Daftar Riwayat Perawatan</h1>
        <Alert className="mb-4 border-[1px] border-[#0288D1]" severity="info">
          <AlertTitle className="font-semibold">Informasi</AlertTitle>
          <span>
            Pemilihan periode komoditas digunakan untuk menampilkan riwayat
            perawatan secara spesifik pada periode penananaman tersebut. Untuk
            melakukan permintaan pengisian riwayat perawatan, validator perlu
            mengisi pemilihan periode komoditas terlebih dahulu baru dapat
            melakukan permintaan pada tombol di kanan.
          </span>
        </Alert>
        <div className="bg-white w-full mb-4 p-4 rounded-xl shadow-lg">
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
                  farmerID: "",
                  farmerName: "",
                  commodityID: "",
                  commodityName: "",
                  batchID: "",
                  batchName: "",
                });
                setActiveStep(0);
                setSearch({
                  farmer: "",
                  commodity: "",
                  batch: "",
                });
              }}
            >
              Reset Periode yang dipilih
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
                <h3 className="font-semibold mb-2">Pemilihan petani</h3>
                <p className="text-sm sm:text-base">
                  Silahkan melakukan pencarian petani melalui kolom pencarian
                  dan pilih petani melalui ID pada tabel.
                </p>
                {input.farmerID && (
                  <span>
                    Petani yang dipilih:{" "}
                    <span className="font-semibold">
                      {input.farmerID} - {input.farmerName}
                    </span>
                  </span>
                )}
                <div className="flex justify-end mt-2">
                  <TextField
                    placeholder="Petani"
                    variant="outlined"
                    name="farmer"
                    required
                    InputProps={{
                      className:
                        "bg-white rounded-lg text-sm md:text-base focus:border-0 hover:border-0",
                      endAdornment: (
                        <InputAdornment position="end">
                          <FaSearch
                            className="cursor-pointer"
                            onClick={(e) => handleSearchFarmer(e)}
                            size={20}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ "& input": { padding: "0.75rem" } }}
                    value={search.farmer}
                    onChange={handleChangeSearch}
                    onKeyDown={(e) =>
                      e.keyCode === 13 ? handleSearchFarmer(e) : null
                    }
                  />
                </div>
                {dataFarmer && !mutatingFarmer && (
                  <div className="mt-4">
                    <Table
                      minWidth={400}
                      headCells={headCellsFarmer}
                      data={dataFarmer}
                      menuAction={null}
                    />
                  </div>
                )}
              </>
            ) : activeStep == 1 ? (
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
                {input.batchID && input.farmerID && (
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
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex flex-row justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {input.batchID
              ? "Riwayat Perawatan"
              : "Permintaan Validasi Riwayat Perawatan"}
          </h3>
          {input.batchID &&
            input.commodityID &&
            input.farmerID &&
            input.batchStatus == batchStatus.planting && (
              <Link href={`${router.pathname}/create/${input.batchID}`}>
                <Button
                  className="text-white bg-[#52A068] normal-case font-bold"
                  variant="contained"
                >
                  <GoPlus className="sm:mr-2" />
                  <span className="hidden sm:block">Permintaan Pengisian</span>
                </Button>
              </Link>
            )}
        </div>
        {dataTreatmentRecord && !mutatingTreatmentRecord && (
          <Table
            minWidth={400}
            headCells={headCells}
            data={dataTreatmentRecord}
            menuAction={(data) => (
              <>
                <Link href={`${router.pathname}/notes/${data._id}`}>
                  <MenuItem>Ubah Catatan</MenuItem>
                </Link>
                <Link href={`${router.pathname}/detail/${data._id}`}>
                  <MenuItem>Lihat Detail</MenuItem>
                </Link>
              </>
            )}
          />
        )}
      </Dashboard>
    </>
  );
};
