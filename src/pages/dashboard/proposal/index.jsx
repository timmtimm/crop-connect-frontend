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
  convertStatusForBatch,
  convertStatusForProposal,
} from "@/components/elements/status";

const headCells = [
  {
    id: "commodity",
    label: "Komoditas",
    isSort: false,
    prefix: null,
    suffix: null,
    isNumber: false,
    isStatus: false,
    isDate: false,
    statusComponent: false,
    optDataLocation: (data) => data.commodity.name,
  },
  {
    id: "name",
    label: "Nama",
    isSort: true,
    prefix: null,
    suffix: null,
    isNumber: false,
    isStatus: false,
    isDate: false,
    statusComponent: false,
    optDataLocation: null,
  },
  {
    id: "estimatedTotalHarvest",
    label: "Estimasi berat panen",
    isSort: true,
    prefix: null,
    suffix: " kg",
    isNumber: true,
    isStatus: false,
    isDate: false,
    statusComponent: false,
    optDataLocation: null,
  },
  {
    id: "address",
    label: "Alamat",
    isSort: false,
    prefix: null,
    suffix: null,
    isNumber: false,
    isStatus: false,
    isDate: false,
    statusComponent: false,
    optDataLocation: null,
  },
  {
    id: "plantingArea",
    label: "Luas lahan tanam",
    isSort: true,
    prefix: null,
    suffix: " km2",
    isNumber: true,
    isStatus: false,
    isDate: false,
    isBoolean: false,
    statusComponent: false,
    optDataLocation: null,
  },
  {
    id: "status",
    label: "Status",
    isSort: true,
    prefix: null,
    suffix: null,
    isNumber: false,
    isStatus: true,
    isDate: false,
    statusComponent: true,
    convertStatusComponent: (data) => convertStatusForProposal(data),
    optDataLocation: null,
  },
  {
    id: "isAvailable",
    label: "Tersedia",
    isSort: true,
    prefix: null,
    suffix: null,
    isNumber: false,
    isStatus: true,
    isDate: false,
    statusComponent: false,
    optDataLocation: null,
  },
  {
    id: "createdAt",
    label: "Dibuat waktu",
    isSort: true,
    prefix: null,
    suffix: null,
    isNumber: false,
    isStatus: false,
    isDate: true,
    statusComponent: false,
    optDataLocation: null,
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
    ["/api/v1/proposal", { ...pagination }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  const handleDelete = async (e, id) => {
    e.preventDefault();
    const dataDelete = await Delete(`/api/v1/proposal/${id}`);

    if (dataDelete.status == HttpStatusCode.Ok) {
      mutate();
      setResult({
        successMessage: "Berhasil menghapus proposal",
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
      <Seo title="Daftar Proposal" />
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
          <h1 className="text-2xl font-bold">Daftar Proposal</h1>
          <Link href={`${router.pathname}/create`}>
            <Button
              className="text-white bg-[#52A068] normal-case font-bold"
              variant="contained"
            >
              <GoPlus className="sm:mr-2" />
              <span className="hidden sm:block">Tambah Proposal</span>
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
