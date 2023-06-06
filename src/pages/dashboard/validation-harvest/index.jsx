import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import { Alert, AlertTitle, MenuItem, Slide, Snackbar } from "@mui/material";
import Link from "next/link";
import { GoPlus } from "react-icons/go";
import useSWR from "swr";
import { getPagination } from "@/utils/url";
import { runOnce } from "@/lib/swr";
import Loading from "@/components/modules/loading";
import { Delete, fetcher, putWithJSON } from "@/lib/axios";
import { useEffect, useState } from "react";
import { proposalStatus, roleUser } from "@/constant/constant";
import { HttpStatusCode } from "axios";
import Table from "@/components/modules/table";
import { useRouter } from "next/router";
import Status, {
  convertStatusForBatch,
  convertStatusForHarvest,
  convertStatusForProposal,
} from "@/components/elements/status";
import { dateFormatToIndonesia, setWeightFormat } from "@/utils/utilities";

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
    ["/api/v1/harvest", { ...pagination }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

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
      {isLoading && <Loading />}
      <Dashboard roles={roleUser.validator}>
        <h1 className="text-2xl font-bold mb-4">Daftar Panen</h1>
        <Alert className="mb-4 border-[1px] border-[#0288D1]" severity="info">
          <AlertTitle className="font-semibold">Informasi</AlertTitle>
          <ul className="list-inside list-decimal">
            {information.map((info, index) => (
              <li key={index}>{info}</li>
            ))}
          </ul>
        </Alert>
        {!isLoading && (
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
      </Dashboard>
    </>
  );
};
