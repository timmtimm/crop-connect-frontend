import Loading from "@/components/modules/loading";
import { roleUser, transactionStatus } from "@/constant/constant";
import { fetcher, putWithJSON } from "@/lib/axios";
import { runOnce } from "@/lib/swr";
import { getPagination } from "@/utils/url";
import { Alert, Button, MenuItem, Slide, Snackbar } from "@mui/material";
import { HttpStatusCode } from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";
import Dashboard from "@/components/layouts/dashboard";
import { GoPlus } from "react-icons/go";
import Table from "@/components/modules/table";
import { convertStatusForTransaction } from "@/components/elements/status";

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
    id: "transactionType",
    label: "Tipe Transaksi",
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
    id: "batch",
    label: "Periode",
    isSort: false,
    prefix: null,
    suffix: null,
    isNumber: false,
    isStatus: false,
    isDate: false,
    statusComponent: false,
    optDataLocation: (data) => data.batch.name || "-",
  },
  {
    id: "buyer",
    label: "Nama Pembeli",
    isSort: false,
    isStatus: false,
    prefix: null,
    suffix: null,
    isNumber: false,
    isDate: false,
    statusComponent: false,
    optDataLocation: (data) => data.buyer.name,
  },
  {
    id: "totalPrice",
    label: "Total Harga",
    isSort: true,
    prefix: "Rp",
    suffix: null,
    isNumber: true,
    isStatus: false,
    isDate: false,
    statusComponent: false,
    optDataLocation: null,
  },
  {
    id: "status",
    label: "Status",
    isSort: true,
    isStatus: false,
    prefix: null,
    suffix: null,
    isNumber: false,
    isDate: false,
    statusComponent: true,
    convertStatusComponent: (data) => convertStatusForTransaction(data),
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

  /* Fetch */
  const { data, isLoading, mutate } = useSWR(
    ["/api/v1/transaction", { ...pagination }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

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

  if (isLoading) return <Loading />;

  return (
    <>
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
        <h1 className="text-2xl font-bold mb-4">Daftar Penjualan</h1>
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
                      handleDecision(e, data._id, transactionStatus.accepted)
                    }
                  >
                    Terima
                  </MenuItem>
                  <MenuItem
                    onClick={(e) =>
                      handleDecision(e, data._id, transactionStatus.rejected)
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
      </Dashboard>
      {/* <List
        allowedRole={roleUser.farmer}
        usedFor="Penjualan"
        canAdd={false}
        tableProps={{
          minWidth: 400,
          headCells,
          canDetail: false,
          logicCanEdit: () => true,
          logicCanDelete: () => true,
          canAction: true,
          customMenuAction: (data) => (
            <>
              {data?.status == "pending" && (
                <>
                  <MenuItem
                    onClick={(e) =>
                      handleDecision(e, data._id, transactionStatus.accepted)
                    }
                  >
                    Terima
                  </MenuItem>
                  <MenuItem
                    onClick={(e) =>
                      handleDecision(e, data._id, transactionStatus.rejected)
                    }
                  >
                    Batal
                  </MenuItem>
                </>
              )}
              <Link href={`${router.pathname}/detail/${data?._id}`}>
                <MenuItem>Lihat Detail</MenuItem>
              </Link>
            </>
          ),
        }}
      /> */}
    </>
  );
};
