import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import {
  Alert,
  AlertTitle,
  Button,
  Menu,
  MenuItem,
  Slide,
  Snackbar,
} from "@mui/material";
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
  convertStatusForProposal,
} from "@/components/elements/status";
import {
  dateFormatToIndonesia,
  setNumberFormat,
  setWeightFormat,
} from "@/utils/utilities";

const headCells = [
  {
    id: "farmer",
    label: "Petani",
    isSort: false,
    customDisplayRow: (data) => data.commodity.farmer.name,
  },
  {
    id: "commodity",
    label: "Komoditas",
    isSort: false,
    customDisplayRow: (data) => data.commodity.name,
  },
  {
    id: "name",
    label: "Nama",
    isSort: true,
    customDisplayRow: null,
  },
  {
    id: "estimatedTotalHarvest",
    label: "Estimasi berat panen",
    isSort: true,
    customDisplayRow: (data) => setWeightFormat(data.estimatedTotalHarvest),
  },
  {
    id: "address",
    label: "Alamat",
    isSort: false,
    customDisplayRow: null,
  },
  {
    id: "plantingArea",
    label: "Luas lahan tanam",
    isSort: true,
    customDisplayRow: (data) => (
      <span>
        {setNumberFormat(data?.plantingArea)} km<sup>2</sup>
      </span>
    ),
  },
  {
    id: "status",
    label: "Status",
    isSort: true,
    customDisplayRow: (data) => (
      <div className="flex w-full justify-center">
        <Status
          className="w-fit"
          type={convertStatusForProposal(data.status)}
          status={data.status}
        />
      </div>
    ),
  },
  {
    id: "validator",
    label: "Divalidasi oleh",
    isSort: false,
    customDisplayRow: (data) => data?.validator?.name,
  },
  {
    id: "createdAt",
    label: "Dibuat waktu",
    isSort: true,
    customDisplayRow: (data) => dateFormatToIndonesia(data.createdAt, true),
  },
];

const information = [
  "Untuk melakukan penolakan proposal, silahkan masuk ke halaman detail proposal.",
  "Pastikan proposal yang ada terima masuk dalam cangkupan wilayah anda dan merupakan komoditas pakar anda.",
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

  /* Modal */
  const [openModal, setOpenModal] = useState(false);
  const handleModal = () => setOpenModal(!openModal);

  const [result, setResult] = useState({
    errorMessage: "",
    successMessage: "",
  });

  const { data, isLoading, mutate } = useSWR(
    ["/api/v1/proposal", { ...pagination }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  const handleAccept = async (e, id) => {
    e.preventDefault();
    const dataDelete = await putWithJSON(`/api/v1/proposal/validate/${id}`, {
      status: proposalStatus.approved,
    });

    if (dataDelete.status == HttpStatusCode.Ok) {
      mutate();
      setResult({
        successMessage: "Berhasil menerima proposal",
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
      {isLoading && <Loading />}
      <Dashboard roles={roleUser.validator}>
        <h1 className="text-2xl font-bold mb-4">Daftar Proposal</h1>
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
              <>
                {data.status == proposalStatus.pending && (
                  <MenuItem
                    onClick={(e) => {
                      handleAccept(e, data._id);
                    }}
                  >
                    Terima
                  </MenuItem>
                )}
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
