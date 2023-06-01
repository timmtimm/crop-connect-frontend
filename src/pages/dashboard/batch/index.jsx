import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import { Alert, Button, MenuItem, Slide, Snackbar } from "@mui/material";
import Link from "next/link";
import { GoPlus } from "react-icons/go";
import useSWR from "swr";
import { getPagination } from "@/utils/url";
import { runOnce } from "@/lib/swr";
import Loading from "@/components/modules/loading";
import { Delete, fetcher } from "@/lib/axios";
import { useEffect, useState } from "react";
import { harvestStatus, roleUser } from "@/constant/constant";
import { HttpStatusCode } from "axios";
import Table from "@/components/modules/table";
import { useRouter } from "next/router";
import { convertStatusForBatch } from "@/components/elements/status";

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
    optDataLocation: (data) => data.proposal.commodity.name,
  },
  {
    id: "proposal",
    label: "Proposal",
    isSort: false,
    prefix: null,
    suffix: null,
    isNumber: false,
    isStatus: false,
    isDate: false,
    statusComponent: false,
    optDataLocation: (data) => data.proposal.name,
  },
  {
    id: "name",
    label: "Nama Periode",
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
    id: "estimatedHarvestDate",
    label: "Estimasi waktu panen",
    isSort: false,
    isStatus: false,
    prefix: null,
    suffix: null,
    isNumber: false,
    isDate: true,
    statusComponent: false,
    optDataLocation: null,
  },
  {
    id: "status",
    label: "Status",
    isSort: false,
    isStatus: false,
    prefix: null,
    suffix: null,
    isNumber: false,
    isDate: false,
    statusComponent: true,
    convertStatusComponent: (data) => convertStatusForBatch(data),
    optDataLocation: null,
  },
  {
    id: "createdAt",
    label: "Dibuat waktu",
    isSort: false,
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
    ["/api/v1/batch", { ...pagination }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  if (isLoading) return <Loading />;

  return (
    <>
      <Seo title="Daftar Periode" />
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
          <h1 className="text-2xl font-bold">Daftar Periode</h1>
          <Link href={`${router.pathname}/create`}>
            <Button
              className="text-white bg-[#52A068] normal-case font-bold"
              variant="contained"
            >
              <GoPlus className="sm:mr-2" />
              <span className="hidden sm:block">Tambah Periode</span>
            </Button>
          </Link>
        </div>
        <Table
          minWidth={400}
          headCells={headCells}
          data={data}
          menuAction={(data) => (
            <>
              <Link href={`${router.pathname}/detail/${data._id}`}>
                <MenuItem>Lihat detail</MenuItem>
              </Link>
            </>
          )}
        />
      </Dashboard>
    </>
  );
};
