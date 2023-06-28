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
import { deleteUniquePagination, getUniquePagination } from "@/utils/url";
import { runOnce } from "@/lib/swr";
import Loading from "@/components/modules/loading";
import { triggerfetcher } from "@/lib/axios";
import { useEffect, useState } from "react";
import {
  batchStatus,
  roleUser,
  treatmentRecordStatus,
} from "@/constant/constant";
import Table from "@/components/modules/table";
import { useRouter } from "next/router";
import Status, {
  convertStatusForBatch,
  convertStatusForTreatmentRecord,
} from "@/components/elements/status";
import { FaSearch } from "react-icons/fa";
import {
  dateFormatToIndonesia,
  setIfNotNull,
  setNumberFormat,
  setPriceFormat,
} from "@/utils/utilities";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { Global } from "@emotion/react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { FaFilter } from "react-icons/fa";

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
    customDisplayRow: (data) => data?.accepter?.name,
  },
  {
    id: "createdAt",
    label: "Terdaftar waktu",
    isSort: true,
    customDisplayRow: (data) => dateFormatToIndonesia(data.date, true),
  },
];

/* Menu */
const Root = styled("div")(({ theme }) => ({
  height: "100%",
}));

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
}));

const Puller = styled(Box)(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: "#52A068",
  borderRadius: 3,
  position: "relative",
  top: 8,
  left: "calc(50% - 15px)",
}));

const steps = ["Pilih Petani", "Pilih Periode"];

export default () => {
  const router = useRouter();
  const paginationFarmer = getUniquePagination("farmer");
  const paginationCommodity = getUniquePagination("commodity");
  const paginationBatch = getUniquePagination("batch");
  const paginationTreatmentRecord = getUniquePagination("treatmentRecord");
  const paginationTreatmentRecordPending = getUniquePagination(
    "treatmentRecordPending"
  );

  /* Drawer */
  const [open, setOpen] = useState(null);
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

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
    batch: "",
  });
  const [filter, setFilter] = useState({
    farmer: "",
    batch: "",
  });

  const handleChangeFilter = ({ target: { name, value } }) => {
    setFilter({ ...filter, [name]: value });
  };

  const handleChangeSearch = ({ target: { name, value } }) => {
    setSearch({ ...search, [name]: value });
  };

  const handleFilter = () => {
    const query = { ...filter };
    setIfNotNull(query, "farmer", filter.farmer);
    setIfNotNull(query, "commodity", filter.commodity);
    setIfNotNull(query, "batch", filter.batch);
    router.push({
      pathname: router.pathname,
      query,
    });
  };

  const handleSearchFarmer = (e) => {
    e.preventDefault();

    let query = { ...router.query };
    if (search.farmer) {
      query.farmerName = search.farmer;
    } else {
      query = deleteUniquePagination(router, "farmer");
      delete query.farmerName;
    }
    router.push({
      pathname: router.pathname,
      query: query,
    });
  };

  const handleSearchBatch = (e) => {
    e.preventDefault();

    let query = { ...router.query };
    if (search.batch) {
      query.batchName = search.batch;
    } else {
      query = deleteUniquePagination(router, "batch");
      delete query.batchName;
    }

    router.push({
      pathname: router.pathname,
      query: query,
    });
  };

  const {
    data: dataTreatmentRecord,
    trigger: triggerTreatmentRecord,
    isMutating: mutatingTreatmentRecord,
  } = useSWRMutation("/api/v1/treatment-record", triggerfetcher);

  useEffect(() => {
    triggerFarmer({
      ...paginationFarmer,
      ...router.query,
      name: router.query.farmerName,
    });
  }, [router.query]);

  useEffect(() => {
    if (input.batchID) {
      triggerTreatmentRecord({
        ...paginationTreatmentRecord,
        batchID: input.batchID,
      });
    } else {
      triggerTreatmentRecord({
        ...paginationTreatmentRecordPending,
        farmer: router.query.farmer,
        commodity: router.query.commodity,
        batch: router.query.batch,
        status: treatmentRecordStatus.pending,
      });
    }
  }, [input.batchID, router.query]);

  useEffect(() => {
    triggerBatch({
      ...paginationBatch,
      ...router.query,
      name: router.query.batchName,
      farmerID: input.farmerID,
      status: batchStatus.planting,
    });
  }, [input.farmerID, router.query]);

  const {
    data: dataFarmer,
    trigger: triggerFarmer,
    isMutating: mutatingFarmer,
  } = useSWRMutation("/api/v1/user/farmer", triggerfetcher);

  const {
    data: dataBatch,
    trigger: triggerBatch,
    isMutating: mutatingBatch,
  } = useSWRMutation("/api/v1/batch", triggerfetcher);

  useEffect(() => {
    setFilter({
      farmer: router.query.farmer || "",
      batch: router.query.batch || "",
    });
    setSearch({
      farmer: router.query.farmerName || "",
      batch: router.query.batchName || "",
    });
  }, [router.query]);

  return (
    <>
      <Seo title="Daftar Riwayat Perawatan" />
      {(mutatingBatch || mutatingFarmer || mutatingTreatmentRecord) && (
        <Loading />
      )}
      <Root>
        <CssBaseline />
        <Global
          styles={{
            ".MuiDrawer-root > .MuiPaper-root": {
              height: `calc(50%)`,
              overflow: "visible",
            },
          }}
        />
        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onClose={toggleDrawer(false)}
          disableSwipeToOpen={false}
          ModalProps={{
            keepMounted: true,
          }}
        >
          <StyledBox
            sx={{
              position: "absolute",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              visibility: "visible",
              right: 0,
              left: 0,
            }}
          >
            <Puller />
          </StyledBox>
          <StyledBox
            sx={{
              px: 2,
              py: 3,
              height: "100%",
              overflow: "auto",
            }}
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Filter</h2>
              <TextField
                label="Petani"
                name="farmer"
                variant="outlined"
                onChange={handleChangeFilter}
                value={filter.farmer || ""}
              />
              <TextField
                label="Komoditas"
                name="commodity"
                variant="outlined"
                onChange={handleChangeFilter}
                value={filter.commodity || ""}
              />
              <TextField
                label="Periode"
                name="batch"
                variant="outlined"
                onChange={handleChangeFilter}
                value={filter.batch || ""}
              />
              <Button
                className="text-white bg-[#52A068] normal-case"
                variant="contained"
                onClick={() => {
                  toggleDrawer(false)();
                  handleFilter();
                }}
              >
                Terapkan
              </Button>
            </div>
          </StyledBox>
        </SwipeableDrawer>
      </Root>
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
                router.push({
                  pathname: router.pathname,
                  query: {},
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
                            onKeyDown={(e) =>
                              e.keyCode === 13
                                ? triggerCommodity({
                                    ...router.query,
                                    farmer: search.farmer,
                                  })
                                : null
                            }
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
                      uniqueKeyPagination={"farmer"}
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
        <div className="flex flex-row justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {input.batchID
              ? `Riwayat Perawatan ${input.batchName}`
              : "Validasi Riwayat Perawatan"}
          </h3>
          {input.batchID &&
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
        {!input.batchID && (
          <>
            <Button
              variant="contained"
              className="w-fit text-black normal-case bg-white hover:bg-white flex md:hidden mb-4"
              onClick={toggleDrawer(true)}
            >
              <FaFilter className="text-[#52A068] mr-2" />
              Filter
            </Button>
            <div className="w-fit bg-white rounded-lg p-4 shadow-md hidden md:block mb-4">
              <h2 className="text-md font-semibold mb-2">Filter</h2>
              <div className="flex flex-row justify-between gap-4">
                <div className="flex gap-2">
                  <TextField
                    label="Petani"
                    name="farmer"
                    variant="outlined"
                    onChange={handleChangeFilter}
                    value={filter.farmer || ""}
                  />
                  <TextField
                    label="Komoditas"
                    name="commodity"
                    variant="outlined"
                    onChange={handleChangeFilter}
                    value={filter.commodity || ""}
                  />
                  <TextField
                    label="Periode"
                    name="batch"
                    variant="outlined"
                    onChange={handleChangeFilter}
                    value={filter.batch || ""}
                  />
                </div>
                <Button
                  className="text-white bg-[#52A068] normal-case"
                  variant="contained"
                  onClick={handleFilter}
                >
                  Terapkan
                </Button>
              </div>
            </div>
          </>
        )}
        {!mutatingTreatmentRecord && dataTreatmentRecord && (
          <Table
            minWidth={400}
            headCells={headCells}
            data={dataTreatmentRecord}
            menuAction={(data) => (
              <>
                {data.status == treatmentRecordStatus.revision && (
                  <Link href={`${router.pathname}/notes/${data._id}`}>
                    <MenuItem>Ubah Catatan</MenuItem>
                  </Link>
                )}
                <Link href={`${router.pathname}/detail/${data._id}`}>
                  <MenuItem>Lihat Detail</MenuItem>
                </Link>
              </>
            )}
            uniqueKeyPagination={
              input.batchID ? "treatmentRecord" : "treatmentRecordPending"
            }
          />
        )}
      </Dashboard>
    </>
  );
};
