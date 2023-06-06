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
import { dateFormatToIndonesia } from "@/utils/utilities";

const headCells = [
  {
    id: "_id",
    label: "ID",
    customDisplayRow: null,
  },
  {
    id: "name",
    label: "Nama",
    isSort: true,
    customDisplayRow: null,
  },
  {
    id: "email",
    label: "Email",
    isSort: true,
    customDisplayRow: null,
  },
  {
    id: "phoneNumber",
    label: "Nomor handphone",
    isSort: true,
    customDisplayRow: null,
  },
  {
    id: "province",
    label: "Provinsi",
    customDisplayRow: (data) => data.region.province,
  },
  {
    id: "regency",
    label: "Kabupaten",
    customDisplayRow: (data) => data.region.regency,
  },
  {
    id: "district",
    label: "Kecamatan",
    customDisplayRow: (data) => data.region.district,
  },
  {
    id: "subdistrict",
    label: "Kelurahan",
    customDisplayRow: (data) => data.region.subdistrict,
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

  const { data, isLoading } = useSWR(
    ["/api/v1/user", { ...pagination, role: roleUser.validator }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  return (
    <>
      <Seo title="Daftar Validator" />
      {isLoading && <Loading />}
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
        {!isLoading && (
          <Table
            minWidth={400}
            headCells={headCells}
            data={data}
            menuAction={null}
          />
        )}
      </Dashboard>
    </>
  );
};
