import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import {
  Alert,
  AlertTitle,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slide,
  Snackbar,
  TextField,
} from "@mui/material";
import Link from "next/link";
import useSWR from "swr";
import { getPagination } from "@/utils/url";
import { runOnce } from "@/lib/swr";
import Loading from "@/components/modules/loading";
import { fetcher } from "@/lib/axios";
import { useEffect, useState } from "react";
import { harvestStatus, roleUser } from "@/constant/constant";
import Table from "@/components/modules/table";
import { useRouter } from "next/router";
import Status, { convertStatusForHarvest } from "@/components/elements/status";
import {
  dateFormatToIndonesia,
  setIfNotNone,
  setIfNotNull,
  setWeightFormat,
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
    id: "date",
    label: "Tanggal panen",
    isSort: false,
    customDisplayRow: (data) => dateFormatToIndonesia(data.date),
  },
  {
    id: "totalHarvest",
    label: "Berat panen",
    isSort: true,
    customDisplayRow: (data) => setWeightFormat(data.totalHarvest),
  },
  {
    id: "status",
    label: "Status",
    isSort: true,
    customDisplayRow: (data) => (
      <div className="flex w-full justify-center">
        <Status
          className="w-fit"
          type={convertStatusForHarvest(data.status)}
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
    label: "Dibuat waktu",
    isSort: true,
    customDisplayRow: (data) => dateFormatToIndonesia(data.createdAt, true),
  },
];

const information = [
  "Untuk meminta revisi panen, silahkan masuk ke halaman detail panen.",
  "Pastikan sebelum menerima panen, telah melakukan validasi secara langsung dan memastikan yang telah dimasukkan dalam sistem telah sesuai dan dapat menjelaskan secara keseluruhan hasil panen.",
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
    value: harvestStatus.pending,
  },
  {
    text: "Diterima",
    value: harvestStatus.approved,
  },
  {
    text: "Revisi",
    value: harvestStatus.revision,
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

  const [input, setInput] = useState({
    commodity: "",
    batch: "",
    status: "",
  });

  const handleChange = ({ target: { name, value } }) => {
    setInput({ ...input, [name]: value });
  };

  const handleFilter = () => {
    const query = { ...input };
    setIfNotNull(query, "commodity", input.commodity);
    setIfNotNull(query, "batch", input.batch);
    setIfNotNone(query, "status", input.status);
    router.push({
      pathname: router.pathname,
      query,
    });
  };

  const handleFilterStatus = ({ target: { value } }) => {
    let query = { ...input };
    query = setIfNotNone(query, "status", value);
    setInput(query);
  };

  const [result, setResult] = useState({
    errorMessage: "",
    successMessage: "",
  });

  const { data, isLoading, mutate } = useSWR(
    ["/api/v1/harvest", { ...pagination, ...router.query }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  useEffect(() => {
    setInput({
      commodity: router.query.commodity || "",
      batch: router.query.batch || "",
      status: router.query.status || "none",
    });
  }, [router.query]);

  return (
    <>
      <Seo title="Daftar Panen" />
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
              <h2 className="text-lg font-semibold">Filter</h2>
              <TextField
                label="Komoditas"
                name="commodity"
                variant="outlined"
                onChange={handleChange}
                value={input.commodity || ""}
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
                    <MenuItem
                      key={item.value}
                      value={item.value}
                      onClick={() =>
                        handleFilterStatus({
                          target: {
                            value: item.value,
                          },
                        })
                      }
                    >
                      {item.text}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                className="text-white bg-[#52A068] normal-case"
                variant="contained"
                onClick={(e) => {
                  toggleDrawer(false)();
                  handleFilter(e);
                }}
              >
                Terapkan
              </Button>
            </div>
          </StyledBox>
        </SwipeableDrawer>
      </Root>
      {isLoading && <Loading />}
      <Dashboard roles={roleUser.validator}>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Daftar Panen</h1>
          <Alert className="border-[1px] border-[#0288D1]" severity="info">
            <AlertTitle className="font-semibold">Informasi</AlertTitle>
            <ul className="list-inside list-decimal">
              {information.map((info, index) => (
                <li key={index}>{info}</li>
              ))}
            </ul>
          </Alert>
          <Button
            variant="contained"
            className="w-fit text-black normal-case bg-white hover:bg-white flex md:hidden"
            onClick={toggleDrawer(true)}
          >
            <FaFilter className="text-[#52A068] mr-2" />
            Filter
          </Button>
          <div className="w-fit bg-white rounded-lg p-4 shadow-md hidden md:block">
            <h2 className="text-md font-semibold mb-2">Filter</h2>
            <div className="flex flex-row justify-between gap-4">
              <div className="flex gap-2">
                <TextField
                  label="Komoditas"
                  name="commodity"
                  variant="outlined"
                  onChange={handleChange}
                  value={input.commodity || ""}
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
                      <MenuItem
                        key={item.value}
                        value={item.value}
                        onClick={() =>
                          handleFilterStatus({
                            target: {
                              value: item.value,
                            },
                          })
                        }
                      >
                        {item.text}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
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
          </div>
          {!isLoading && data && (
            <Table
              minWidth={400}
              headCells={headCells}
              data={data}
              menuAction={(data) => (
                <Link href={`${router.pathname}/detail/${data._id}`}>
                  <MenuItem>Lihat Detail</MenuItem>
                </Link>
              )}
            />
          )}
        </div>
      </Dashboard>
    </>
  );
};
