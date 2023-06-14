import Loading from "@/components/modules/loading";
import { roleUser, transactionStatus } from "@/constant/constant";
import { fetcher, putWithJSON } from "@/lib/axios";
import { runOnce } from "@/lib/swr";
import { getPagination } from "@/utils/url";
import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slide,
  Snackbar,
  TextField,
} from "@mui/material";
import { HttpStatusCode } from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import Dashboard from "@/components/layouts/dashboard";
import { GoPlus } from "react-icons/go";
import Table from "@/components/modules/table";
import Status, {
  convertStatusForTransaction,
} from "@/components/elements/status";
import Seo from "@/components/elements/seo";
import {
  dateFormatToIndonesia,
  isValidDate,
  setIfNotNone,
  setIfNotNull,
  setPriceFormat,
} from "@/utils/utilities";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { Global } from "@emotion/react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { FaFilter } from "react-icons/fa";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const headCells = [
  {
    id: "_id",
    label: "ID",
    isSort: false,
    customDisplayRow: null,
  },
  {
    id: "commodity",
    label: "Komoditas",
    isSort: false,
    customDisplayRow: (data) => data.commodity.name,
  },
  {
    id: "transactionType",
    label: "Tipe Transaksi",
    isSort: false,
    customDisplayRow: null,
  },
  {
    id: "proposal",
    label: "Proposal",
    isSort: false,
    customDisplayRow: (data) => data.proposal.name,
  },
  {
    id: "batch",
    label: "Periode",
    isSort: false,
    customDisplayRow: (data) => data.batch.name || "-",
  },
  {
    id: "buyer",
    label: "Nama Pembeli",
    isSort: false,
    customDisplayRow: (data) => data.buyer.name,
  },
  {
    id: "totalPrice",
    label: "Total Harga",
    isSort: true,
    customDisplayRow: (data) => setPriceFormat(data.totalPrice),
  },
  {
    id: "status",
    label: "Status",
    isSort: true,
    customDisplayRow: (data) => (
      <div className="flex w-full justify-center">
        <Status
          className="w-fit"
          type={convertStatusForTransaction(data.status)}
          status={data.status}
        />
      </div>
    ),
  },
  {
    id: "createdAt",
    label: "Dibuat waktu",
    isSort: true,
    customDisplayRow: (data) => dateFormatToIndonesia(data.createdAt, true),
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

const listStatus = [
  {
    text: "Semua Status",
    value: "none",
  },
  {
    text: "Pending",
    value: transactionStatus.pending,
  },
  {
    text: "Diterima",
    value: transactionStatus.accepted,
  },
  {
    text: "Ditolak",
    value: transactionStatus.cancel,
  },
];

export default () => {
  const router = useRouter();
  const pagination = getPagination();

  /* Snackbar */
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const handleClickSnackbar = () => setOpenSnackbar(true);
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  /* Drawer */
  const [open, setOpen] = useState(null);
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const [result, setResult] = useState({
    errorMessage: "",
    successMessage: "",
  });

  const [input, setInput] = useState({
    status: "none",
    commodity: "",
    proposal: "",
    batch: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = ({ target: { name, value } }) => {
    setInput({ ...input, [name]: value });
  };

  const setQueryparam = () => {
    let query = { ...pagination };
    query = setIfNotNull(query, "commodity", router.query.commodity);
    query = setIfNotNull(query, "proposal", router.query.proposal);
    query = setIfNotNull(query, "batch", router.query.batch);
    query = setIfNotNone(query, "status", router.query.status);

    if (isValidDate(router.query.startDate)) {
      query.startDate = router.query.startDate;
    }

    if (isValidDate(router.query.endDate)) {
      query.endDate = router.query.endDate;
    }

    return query;
  };

  /* Fetch */
  const { data, isLoading, mutate } = useSWR(
    ["/api/v1/transaction", setQueryparam()],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  const handleFilter = () => {
    const query = { ...router.query };
    setIfNotNull(query, "commodity", input.commodity);
    setIfNotNull(query, "proposal", input.proposal);
    setIfNotNull(query, "batch", input.batch);
    setIfNotNone(query, "status", input.status);

    if (isValidDate(input.startDate)) {
      setIfNotNull(query, "startDate", input.startDate);
    } else {
      delete query.startDate;
    }

    if (isValidDate(input.endDate)) {
      setIfNotNull(query, "endDate", input.endDate);
    } else {
      delete query.endDate;
    }

    router.push({
      pathname: router.pathname,
      query,
    });
  };

  const handleDecision = async (e, id, isAccept) => {
    e.preventDefault();

    if (!id) return;

    const data = await putWithJSON(`/api/v1/transaction/${id}`, {
      decision: isAccept,
    });

    if (data.status == HttpStatusCode.Ok) {
      mutate();
      setResult({
        errorMessage: "",
        successMessage: "Berhasil mengubah status penjualan",
      });
    } else {
      setResult({
        errorMessage: data.message,
        successMessage: "",
      });
    }

    handleClickSnackbar();
  };

  useEffect(() => {
    setInput({
      commodity: router.query.commodity || "",
      proposal: router.query.proposal || "",
      batch: router.query.batch || "",
      status: router.query.status || "none",
      startDate: router.query.startDate || "",
      endDate: router.query.endDate || "",
    });
  }, [router.query]);

  return (
    <>
      <Seo title="Daftar Penjualan" />
      <Snackbar
        open={openSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Slide}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={result.successMessage || result.errorMessage}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={result.successMessage ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {result.successMessage || result.errorMessage}
        </Alert>
      </Snackbar>
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
              <div className="flex flex-row justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Filter</h2>
                <Button
                  className="font-semibold"
                  onClick={() => {
                    setInput({
                      commodity: "",
                      status: "none",
                      startDate: "",
                      endDate: "",
                    });
                  }}
                >
                  Reset
                </Button>
              </div>
              <TextField
                label="Komoditas"
                variant="outlined"
                name="commodity"
                value={input.commodity}
                onChange={handleChange}
              />
              <TextField
                label="Proposal"
                name="proposal"
                variant="outlined"
                onChange={handleChange}
                value={input.proposal || ""}
              />
              <TextField
                label="Periode"
                name="batch"
                variant="outlined"
                onChange={handleChange}
                value={input.batch || ""}
              />
              <FormControl className="min-w-[10rem]">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={input.status}
                  label="Status"
                  onChange={handleChange}
                >
                  {listStatus.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.text}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Rentang awal transaksi"
                  maxDate={dayjs()}
                  value={input.startDate ? dayjs(input.startDate) : null}
                  views={["year", "month", "day"]}
                  onChange={(newValue) => {
                    handleChange({
                      target: {
                        name: "startDate",
                        value: dayjs(newValue).format("YYYY-MM-DD"),
                      },
                    });
                  }}
                />
                <DatePicker
                  label="Rentang akhir transaksi"
                  minDate={dayjs(input.startDate)}
                  maxDate={dayjs()}
                  value={input.endDate ? dayjs(input.endDate) : null}
                  onChange={(newValue) =>
                    handleChange({
                      target: {
                        name: "endDate",
                        value: dayjs(newValue).format("YYYY-MM-DD"),
                      },
                    })
                  }
                />
              </LocalizationProvider>
              <Button
                variant="contained"
                className="text-white bg-[#52A068] normal-case font-bold"
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
      {isLoading && <Loading />}
      <Dashboard roles={roleUser.farmer}>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Daftar Penjualan</h1>
          <Button
            variant="contained"
            className="w-fit text-black normal-case bg-white hover:bg-white flex md:hidden"
            onClick={toggleDrawer(true)}
          >
            <FaFilter className="text-[#52A068] mr-2" />
            Filter
          </Button>
          <div className="w-fit bg-white rounded-lg p-4 shadow-md hidden md:block">
            <div className="flex flex-row justify-between items-center mb-2">
              <h2 className="text-md font-semibold">Filter</h2>
              <Button
                className="font-semibold"
                onClick={() => {
                  setInput({
                    commodity: "",
                    status: "none",
                    startDate: "",
                    endDate: "",
                  });
                }}
              >
                Reset
              </Button>
            </div>
            <div className="flex flex-row justify-between gap-4">
              <div className="flex flex-row gap-2">
                <TextField
                  label="Komoditas"
                  name="commodity"
                  variant="outlined"
                  onChange={handleChange}
                  value={input.commodity || ""}
                />
                <TextField
                  label="Proposal"
                  name="proposal"
                  variant="outlined"
                  onChange={handleChange}
                  value={input.proposal || ""}
                />
                <TextField
                  label="Periode"
                  name="batch"
                  variant="outlined"
                  onChange={handleChange}
                  value={input.batch || ""}
                />
                <FormControl className="min-w-[10rem]">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={input.status}
                    label="Status"
                    onChange={handleChange}
                  >
                    {listStatus.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.text}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Rentang awal transaksi"
                    maxDate={dayjs()}
                    value={input.startDate ? dayjs(input.startDate) : null}
                    views={["year", "month", "day"]}
                    onChange={(newValue) => {
                      handleChange({
                        target: {
                          name: "startDate",
                          value: dayjs(newValue).format("YYYY-MM-DD"),
                        },
                      });
                    }}
                  />
                  <DatePicker
                    label="Rentang akhir transaksi"
                    minDate={dayjs(input.startDate)}
                    maxDate={dayjs()}
                    value={input.endDate ? dayjs(input.endDate) : null}
                    onChange={(newValue) =>
                      handleChange({
                        target: {
                          name: "endDate",
                          value: dayjs(newValue).format("YYYY-MM-DD"),
                        },
                      })
                    }
                  />
                </LocalizationProvider>
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
          {!isLoading && data.pagination && (
            <Table
              minWidth={400}
              headCells={headCells}
              data={data}
              canDetail={false}
              menuAction={(data) => (
                <>
                  {data?.status == "pending" && (
                    <>
                      <MenuItem
                        onClick={(e) =>
                          handleDecision(
                            e,
                            data._id,
                            transactionStatus.accepted
                          )
                        }
                      >
                        Terima
                      </MenuItem>
                      <MenuItem
                        onClick={(e) =>
                          handleDecision(
                            e,
                            data._id,
                            transactionStatus.rejected
                          )
                        }
                      >
                        Tolak
                      </MenuItem>
                    </>
                  )}
                  <Link href={`${router.pathname}/detail/${data?._id}`}>
                    <MenuItem>Lihat Detail</MenuItem>
                  </Link>
                </>
              )}
            />
          )}
        </div>
      </Dashboard>
    </>
  );
};
