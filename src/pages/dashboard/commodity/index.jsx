import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import {
  Alert,
  Button,
  Menu,
  MenuItem,
  Slide,
  Snackbar,
  TextField,
} from "@mui/material";
import Link from "next/link";
import { GoPlus } from "react-icons/go";
import useSWR from "swr";
import { getPagination } from "@/utils/url";
import { runOnce } from "@/lib/swr";
import Loading from "@/components/modules/loading";
import { Delete, fetcher } from "@/lib/axios";
import { useEffect, useState } from "react";
import { roleUser } from "@/constant/constant";
import { HttpStatusCode } from "axios";
import Table from "@/components/modules/table";
import { useRouter } from "next/router";
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
    id: "code",
    label: "Kode",
    isSort: false,
    customDisplayRow: null,
  },
  {
    id: "name",
    label: "Nama",
    isSort: false,
    customDisplayRow: null,
  },
  {
    id: "plantingPeriod",
    label: "Jangka waktu penanaman",
    isSort: true,
    customDisplayRow: (data) => `${setNumberFormat(data.plantingPeriod)} hari`,
  },
  {
    id: "pricePerKg",
    label: "Harga per kilogram",
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

  const [result, setResult] = useState({
    errorMessage: "",
    successMessage: "",
  });

  /* Drawer */
  const [open, setOpen] = useState(null);
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const [input, setInput] = useState({
    name: "",
  });

  const handleChange = ({ target: { name, value } }) => {
    setInput({ ...input, [name]: value });
  };

  const handleFilter = () => {
    const query = { ...input };
    setIfNotNull(query, "name", input.name);
    router.push({
      pathname: router.pathname,
      query,
    });
  };

  const { data, isLoading, mutate } = useSWR(
    ["/api/v1/commodity/farmer", { ...pagination, ...router.query }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  const handleDelete = async (e, id) => {
    e.preventDefault();
    const dataDelete = await Delete(`/api/v1/commodity/${id}`);

    if (dataDelete.status == HttpStatusCode.Ok) {
      mutate();
      setResult({
        successMessage: "Berhasil menghapus komoditas",
        errorMessage: "",
      });
    } else {
      setResult({
        successMessage: "",
        errorMessage: dataDelete.message,
      });
    }

    handleClickSnackbar();
  };

  useEffect(() => {
    setInput({
      name: router.query.name || "",
    });
  }, [router.query]);

  return (
    <>
      <Seo title="Daftar Komoditas" />
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
                label="Nama"
                variant="outlined"
                name="name"
                value={input.name}
                onChange={handleChange}
              />
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
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-2xl font-bold">Daftar Komoditas</h1>
            <Link href={`${router.pathname}/create`}>
              <Button
                className="text-white bg-[#52A068] normal-case font-bold"
                variant="contained"
              >
                <GoPlus className="sm:mr-2" />
                <span className="hidden sm:block">Tambah komoditas</span>
              </Button>
            </Link>
          </div>
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
                  label="Nama"
                  name="name"
                  variant="outlined"
                  onChange={handleChange}
                  value={input.name || ""}
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
          {!isLoading && data.pagination && (
            <Table
              minWidth={400}
              headCells={headCells}
              data={data}
              menuAction={(data) => (
                <>
                  <Link href={`${router.pathname}/edit/${data._id}`}>
                    <MenuItem>Ubah</MenuItem>
                  </Link>
                  <MenuItem onClick={(e) => handleDelete(e, data._id)}>
                    Hapus
                  </MenuItem>
                </>
              )}
            />
          )}
        </div>
      </Dashboard>
    </>
  );
};
