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

const headCells = [
  {
    id: "_id",
    label: "ID",
    numeric: false,
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
    id: "email",
    label: "Email",
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
    id: "phoneNumber",
    label: "Nomor handphone",
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
    id: "province",
    label: "Provinsi",
    isSort: false,
    prefix: null,
    suffix: null,
    isNumber: false,
    isStatus: false,
    isDate: false,
    statusComponent: false,
    optDataLocation: (data) => data.region.province,
  },
  {
    id: "regency",
    label: "Kabupaten",
    isSort: false,
    prefix: null,
    suffix: null,
    isNumber: false,
    isStatus: false,
    isDate: false,
    statusComponent: false,
    optDataLocation: (data) => data.region.regency,
  },
  {
    id: "district",
    label: "Kecamatan",
    isSort: false,
    prefix: null,
    suffix: null,
    isNumber: false,
    isStatus: false,
    isDate: false,
    statusComponent: false,
    optDataLocation: (data) => data.region.district,
  },
  {
    id: "subdistrict",
    label: "Kelurahan",
    isSort: false,
    prefix: null,
    suffix: null,
    isNumber: false,
    isStatus: false,
    isDate: false,
    statusComponent: false,
    optDataLocation: (data) => data.region.subdistrict,
  },
  {
    id: "createdAt",
    numeric: false,
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
    ["/api/v1/user", { ...pagination, role: roleUser.validator }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  if (isLoading) return <Loading />;

  return (
    <>
      <Seo title="Daftar Validator" />
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
      <Dashboard roles={roleUser.admin}>
        <div className="flex flex-row justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Daftar Validator</h1>
          <Link href={`${router.pathname}/create`}>
            <Button
              className="text-white bg-[#52A068] normal-case font-bold"
              variant="contained"
            >
              <GoPlus className="sm:mr-2" />
              <span className="hidden sm:block">Tambah Validator</span>
            </Button>
          </Link>
        </div>
        <Table
          minWidth={400}
          headCells={headCells}
          data={data}
          //   menuAction={(data) => (
          //     <>
          //       <Link href={`${router.pathname}/edit/${data._id}`}>
          //         <MenuItem>Ubah</MenuItem>
          //       </Link>
          //       <MenuItem onClick={(e) => handleDelete(e, data._id)}>
          //         Hapus
          //       </MenuItem>
          //     </>
          //   )}
        />
      </Dashboard>
    </>
  );
};
