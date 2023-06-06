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
import Status, { convertStatusForBatch } from "@/components/elements/status";
import { dateFormatToIndonesia, setNumberFormat } from "@/utils/utilities";

const headCells = [
  {
    id: "_id",
    label: "ID",
    isSort: false,
    customDisplayRow: null,
  },
  {
    id: "commodity",
    label: "Komoditas",
    isSort: false,
    customDisplayRow: (data) => data.proposal.commodity.name,
  },
  {
    id: "proposal",
    label: "Proposal",
    isSort: false,
    customDisplayRow: (data) => data.proposal.name,
  },
  {
    id: "name",
    label: "Nama Periode",
    isSort: false,
    customDisplayRow: null,
  },
  {
    id: "estimatedHarvestDate",
    label: "Estimasi waktu panen",
    isSort: false,
    customDisplayRow: (data) =>
      dateFormatToIndonesia(data.estimatedHarvestDate),
  },
  {
    id: "status",
    label: "Status",
    isSort: false,
    customDisplayRow: (data) => (
      <div className="flex w-full justify-center">
        <Status
          className="w-fit"
          type={convertStatusForBatch(data.status)}
          status={data.status}
        />
      </div>
    ),
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
    ["/api/v1/batch", { ...pagination }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  if (isLoading) return <Loading />;

  return (
    <>
      <Seo title="Daftar Periode" />
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
