import Modal from "@/components/elements/modal";
import Seo from "@/components/elements/seo";
import Status, { convertStatusForBatch } from "@/components/elements/status";
import Dashboard from "@/components/layouts/dashboard";
import Loading from "@/components/modules/loading";
import { roleUser, transactionStatus } from "@/constant/constant";
import { get, putWithJSON } from "@/lib/axios";
import {
  dateFormatToIndonesia,
  setNumberFormat,
  setPriceFormat,
  setWeightFormat,
} from "@/utils/utilities";
import { Button } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const informationColumn = [
  {
    section: "Komoditas",
    tableColumn: [
      {
        id: "code",
        label: "Kode",
        customDisplayRow: (data) => data?.proposal?.commodity?.code,
      },
      {
        id: "name",
        label: "Nama",
        customDisplayRow: (data) => data?.proposal?.commodity?.name,
      },
      {
        id: "seed",
        label: "Bibit",
        customDisplayRow: (data) => data?.proposal?.commodity?.seed,
      },
      {
        id: "pricePerKg",
        label: "Harga per Kg",
        customDisplayRow: (data) =>
          setPriceFormat(data?.proposal?.commodity?.pricePerKg),
      },
    ],
  },
  {
    section: "Proposal",
    tableColumn: [
      {
        id: "code",
        label: "Kode",
        customDisplayRow: (data) => data?.proposal?.code,
      },
      {
        id: "name",
        label: "Nama",
        customDisplayRow: (data) => data?.proposal?.name,
      },
      {
        id: "address",
        label: "Alamat lahan",
        customDisplayRow: (data) =>
          `${data?.proposal?.address}, ${data?.proposal?.region?.province}, ${data?.proposal?.region?.regency}, ${data?.proposal?.region?.district}, ${data?.proposal?.region?.subdistrict}`,
      },
      {
        id: "plantingArea",
        label: "Luas lahan",
        customDisplayRow: (data) => (
          <span>
            {setNumberFormat(data?.proposal?.plantingArea)} km<sup>2</sup>
          </span>
        ),
      },
      {
        id: "estimatedTotalHarvest",
        label: "Estimasi total panen",
        customDisplayRow: (data) =>
          setWeightFormat(data?.proposal?.estimatedTotalHarvest),
      },
    ],
  },
  {
    section: "Periode",
    tableColumn: [
      {
        id: "_id",
        label: "ID",
        customDisplayRow: (data) => data?._id,
      },
      {
        id: "name",
        label: "Nama Periode",
        customDisplayRow: (data) => data?.name,
      },
      {
        id: "status",
        label: "Status",
        customDisplayRow: (data) => (
          <div className="flex items-center w-full justify-end md:justify-start">
            <Status
              type={convertStatusForBatch(data?.status)}
              status={data?.status}
            />
          </div>
        ),
      },
      {
        id: "createdAt",
        label: "Tanggal Mulai Tanam",
        customDisplayRow: (data) =>
          dateFormatToIndonesia(data?.createdAt, false),
      },
      {
        id: "estimatedHarvestDate",
        label: "Estimasi Tanggal Panen",
        customDisplayRow: (data) =>
          dateFormatToIndonesia(data?.estimatedHarvestDate, false),
      },
    ],
  },
];

export default () => {
  const router = useRouter();
  const { id } = router.query;

  const [dataBatch, setDataBatch] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState({
    errorMessage: "",
  });

  /* Function */
  const getBatch = async () => {
    const data = await get(`/api/v1/batch/${id}`, {});

    if (data?.data) {
      setDataBatch(data.data);
    } else {
      setResult({
        errorMessage: data.message,
      });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (id) {
      getBatch();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  return (
    <>
      <Seo title="Detail Periode" />
      {isLoading && <Loading />}
      <Dashboard roles={roleUser.farmer}>
        <h1 className="text-2xl mb-4 font-bold">Detail Periode</h1>
        {result.errorMessage && (
          <div className="flex flex-col justify-center items-center">
            <Image
              src="/navigation _ location, map, destination, direction, question, lost, need help_lg.png"
              width={400}
              height={400}
              alt="Ilustrasi Not Found"
            />
            <h2 className="text-xl font-bold">Periode tidak ditemukan</h2>
            <Link href="/transaction-history">
              <span className="text-[#53A06C]">
                Kembali ke halaman daftar periode
              </span>
            </Link>
          </div>
        )}
        {dataBatch && (
          <div className=" w-full bg-white p-4 rounded-xl shadow-md mb-4">
            <div className="flex flex-col gap-4 divide-y-2">
              {informationColumn.map((section, index) => (
                <div key={index}>
                  <h2
                    className={`text-lg font-bold ${
                      index == 0 ? "mb-2" : "my-2"
                    }`}
                  >
                    {section.section}
                  </h2>
                  <table className="w-full md:w-fit">
                    <tbody>
                      {section.tableColumn.map((column, index) => (
                        <tr key={index}>
                          <td className="flex flex-row items-center justify-between">
                            <span>{column.label}</span>
                            <span className="hidden md:flex text-right">:</span>
                          </td>
                          <td className="ml-2 text-right md:text-left">
                            {column.customDisplayRow
                              ? column.customDisplayRow(dataBatch)
                              : dataBatch[column.id]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}
        {!isLoading && dataBatch.status == transactionStatus.pending && (
          <div className="flex w-full gap-2 justify-end">
            <Button
              className="text-right bg-[#DB3546] hover:bg-[#BA2D3C] normal-case font-bold mt-2"
              variant="contained"
              onClick={() => {
                handleModal();
                setDecision(transactionStatus.rejected);
              }}
            >
              Tolak
            </Button>
            <Button
              className="text-right bg-[#53A06C] hover:bg-[#3E8A4F] normal-case font-bold mt-2"
              variant="contained"
              onClick={() => {
                handleModal();
                setDecision(transactionStatus.accepted);
              }}
            >
              Terima
            </Button>
          </div>
        )}
      </Dashboard>
    </>
  );
};
