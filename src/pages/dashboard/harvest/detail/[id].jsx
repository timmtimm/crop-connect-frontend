import Seo from "@/components/elements/seo";
import Status, {
  convertStatusForBatch,
  convertStatusForHarvest,
} from "@/components/elements/status";
import Dashboard from "@/components/layouts/dashboard";
import Loading from "@/components/modules/loading";
import NotFound from "@/components/templates/notFound";
import { roleUser } from "@/constant/constant";
import { get } from "@/lib/axios";
import {
  dateFormatToIndonesia,
  getLastURLSegment,
  setNumberFormat,
  setWeightFormat,
} from "@/utils/utilities";
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
            {setNumberFormat(data?.proposal?.plantingArea)} m<sup>2</sup>
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
        customDisplayRow: (data) => data?.batch?._id,
      },
      {
        id: "name",
        label: "Nama Periode",
        customDisplayRow: (data) => data?.batch?.name,
      },
      {
        id: "status",
        label: "Status",
        customDisplayRow: (data) => (
          <div className="flex items-center w-full justify-end md:justify-start">
            <Status
              type={convertStatusForBatch(data?.batch?.status)}
              status={data?.batch?.status}
            />
          </div>
        ),
      },
      {
        id: "createdAt",
        label: "Tanggal Mulai Tanam",
        customDisplayRow: (data) =>
          dateFormatToIndonesia(data?.batch?.createdAt, false),
      },
      {
        id: "estimatedHarvestDate",
        label: "Estimasi Tanggal Panen",
        customDisplayRow: (data) =>
          dateFormatToIndonesia(data?.batch?.estimatedHarvestDate, false),
      },
    ],
  },
];

const validatorColumn = [
  {
    id: "name",
    label: "Nama",
    customDisplayRow: (data) => data?.accepter?.name,
  },
  {
    id: "email",
    label: "Email",
    customDisplayRow: (data) => data?.accepter?.email,
  },
  {
    id: "phoneNumber",
    label: "Nomor Telepon",
    customDisplayRow: (data) => data?.accepter?.phoneNumber,
  },
];

export default () => {
  const router = useRouter();
  const { id } = router.query;

  const [dataHarvest, setDataHarvest] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState({
    errorMessage: "",
  });

  /* Function */
  const getTreatmentRecord = async () => {
    const data = await get(`/api/v1/harvest/${id}`, {});

    if (data?.data) {
      setDataHarvest(data.data);
    } else {
      setResult({
        errorMessage: data.message,
      });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (id) {
      getTreatmentRecord();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  return (
    <>
      <Seo
        title={
          isLoading
            ? "Loading..."
            : dataHarvest?.batch?.name
            ? `Detail Panen ${dataHarvest?.batch?.name}`
            : "Panen Tidak Ditemukan"
        }
      />
      {isLoading && <Loading />}
      <Dashboard roles={roleUser.farmer}>
        <h1 className="text-2xl mb-4 font-bold">Detail Panen</h1>
        {result.errorMessage && (
          <NotFound
            content="Panen"
            urlRedirect="/dashboard/harvest"
            redirectPageTitle="daftar panen"
          />
        )}
        {dataHarvest._id && (
          <>
            <div className=" w-full bg-white shadow-md p-4 rounded-xl mb-4">
              <h2 className="text-lg font-bold mb-2">
                Informasi Periode Penanaman
              </h2>
              <div className="flex flex-col gap-4 divide-y-2">
                {informationColumn.map((section, index) => (
                  <div key={index}>
                    <h2
                      className={`text-lg font-semibold ${
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
                              <span className="hidden md:flex text-right">
                                :
                              </span>
                            </td>
                            <td className="ml-2 text-right md:text-left">
                              {column.customDisplayRow
                                ? column.customDisplayRow(dataHarvest)
                                : dataHarvest[column.id]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
            {dataHarvest?.accepter && (
              <div className=" w-full bg-white p-4 rounded-xl shadow-md mb-4">
                <h2 className="text-lg font-bold mb-2">
                  Kontak Validator Penerima
                </h2>
                <table className="w-full md:w-fit">
                  <tbody>
                    {validatorColumn.map((column, index) => (
                      <tr key={index}>
                        <td className="flex flex-row items-center justify-between">
                          <span>{column.label}</span>
                          <span className="hidden md:flex text-right">:</span>
                        </td>
                        <td className="ml-2 text-right md:text-left">
                          {column.customDisplayRow
                            ? column.customDisplayRow(dataHarvest)
                            : dataHarvest[column.id]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className=" w-full bg-white p-4 rounded-xl shadow-md mb-4">
              <h2 className="text-lg font-bold mb-2">Informasi Panen</h2>
              <div className="mb-4">
                <table className="w-full md:w-fit">
                  <tbody>
                    <tr>
                      <td className="flex flex-row items-center justify-between">
                        <span className="font-semibold">Tanggal Panen</span>
                        <span className="hidden md:flex text-right">:</span>
                      </td>
                      <td className="ml-2 text-right md:text-left">
                        {dateFormatToIndonesia(dataHarvest?.date)}
                      </td>
                    </tr>
                    <tr>
                      <td className="flex flex-row items-center justify-between">
                        <span className="font-semibold">Status</span>
                        <span className="hidden md:flex text-right">:</span>
                      </td>
                      <td className="ml-2 text-right md:text-left">
                        <div className="flex items-center w-full justify-end md:justify-start">
                          <Status
                            type={convertStatusForHarvest(dataHarvest?.status)}
                            status={dataHarvest?.status}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="flex flex-row items-center justify-between">
                        <span className="font-semibold">Berat Panen</span>
                        <span className="hidden md:flex text-right">:</span>
                      </td>
                      <td className="ml-2 text-right md:text-left">
                        {setWeightFormat(dataHarvest?.totalHarvest)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <h3 className="font-semibold">Kondisi Panen</h3>
                <p className="whitespace-pre-line">{dataHarvest?.condition}</p>
              </div>
              <h3 className="text-lg font-semibold">
                Gambar dan Catatan Panen
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(dataHarvest?.harvest) &&
                  dataHarvest?.harvest?.map((item, index) => (
                    <div
                      key={index}
                      className="w-full flex flex-col rounded-lg p-3 gap-2 bg-gray-200"
                    >
                      <h4 className="font-bold text-center">
                        Gambar {index + 1}
                      </h4>
                      <div className="w-full flex flex-row items-start justify-center">
                        <img className="rounded" src={item.imageURL} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">Nama gambar</span>
                        <span className="truncate w-full ">
                          {getLastURLSegment(item.imageURL)}
                        </span>
                      </div>
                      <div className="w-full p-2 bg-white rounded-md whitespace-pre-line">
                        <span className="font-semibold mb-2">Catatan</span>
                        <br />
                        {item.note}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </Dashboard>
    </>
  );
};
