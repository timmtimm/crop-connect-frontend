import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import { Alert, Button, Menu, MenuItem, Slide, Snackbar } from "@mui/material";
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
  setNumberFormat,
  setPriceFormat,
} from "@/utils/utilities";

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

  const { data, isLoading, mutate } = useSWR(
    ["/api/v1/commodity", { ...pagination }],
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

  if (isLoading) return <Loading />;

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
      <Dashboard roles={roleUser.farmer}>
        <div className="flex flex-row justify-between items-center mb-4">
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
      </Dashboard>
    </>
  );
};
