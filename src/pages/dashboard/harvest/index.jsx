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
import { harvestStatus, roleUser } from "@/constant/constant";
import { HttpStatusCode } from "axios";
import Table from "@/components/modules/table";
import { useRouter } from "next/router";
import { dateFormatToIndonesia, setWeightFormat } from "@/utils/utilities";
import Status, { convertStatusForHarvest } from "@/components/elements/status";

const headCells = [
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
    id: "batch",
    label: "Periode",
    isSort: false,
    customDisplayRow: (data) => data.batch.name,
  },
  {
    id: "date",
    label: "Tanggal Panen",
    isSort: false,
    customDisplayRow: (data) => dateFormatToIndonesia(data.date),
  },
  {
    id: "totalHarvest",
    label: "Total berat panen",
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

export default () => {
  const router = useRouter();
  const pagination = getPagination();

  const [result, setResult] = useState({
    errorMessage: "",
    successMessage: "",
  });

  const { data, isLoading, mutate } = useSWR(
    ["/api/v1/harvest", { ...pagination }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  if (isLoading) return <Loading />;

  return (
    <>
      <Seo title="Daftar Panen" />

      <Dashboard roles={roleUser.farmer}>
        <div className="flex flex-row justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Daftar Panen</h1>
          <Link href={`${router.pathname}/create`}>
            <Button
              className="text-white bg-[#52A068] normal-case font-bold"
              variant="contained"
            >
              <GoPlus className="sm:mr-2" />
              <span className="hidden sm:block">Tambah Panen</span>
            </Button>
          </Link>
        </div>
        <Table
          minWidth={400}
          headCells={headCells}
          data={data}
          menuAction={(data) => (
            <>
              {data?.status != harvestStatus.approved && (
                <Link href={`${router.pathname}/edit/${data._id}`}>
                  <MenuItem>Ubah</MenuItem>
                </Link>
              )}
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
