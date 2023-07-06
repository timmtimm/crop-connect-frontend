import Seo from "@/components/elements/seo";
import Status, {
  convertStatusForBatch,
  convertStatusForTreatmentRecord,
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
    customDisplayRow: (data) => data?.requester?.name,
  },
  {
    id: "email",
    label: "Email",
    customDisplayRow: (data) => data?.requester?.email,
  },
  {
    id: "phoneNumber",
    label: "Nomor Telepon",
    customDisplayRow: (data) => data?.requester?.phoneNumber,
  },
];

export default () => {
  const router = useRouter();
  const { id } = router.query;

  const [dataTreatment, setDataTreatment] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState({
    errorMessage: "",
  });

  /* Function */
  const getTreatmentRecord = async () => {
    const data = await get(`/api/v1/treatment-record/${id}`, {});

    if (data?.data) {
      setDataTreatment(data.data);
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
            : dataTreatment._id
            ? `Detail Riwayat Perawatan ${dataTreatment.batch?.name} - ${dataTreatment.number}`
            : "Riwayat Perawatan Tidak Ditemukan"
        }
      />
      {isLoading && <Loading />}
      <Dashboard roles={roleUser.farmer}>
        <h1 className="text-2xl mb-4 font-bold">Detail Riwayat Perawatan</h1>
        {result.errorMessage && (
          <NotFound
            content="Riwayat Perawatan"
            urlRedirect="/dashboard/treatment-record"
            redirectPageTitle="daftar riwayat perawatan"
          />
        )}
        {dataTreatment._id && (
          <>
            <div className=" w-full bg-white p-4 rounded-xl shadow-md mb-4">
              <h2 className="text-lg font-bold mb-2">
                Informasi Periode Penanaman
              </h2>
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
                              <span className="hidden md:flex text-right">
                                :
                              </span>
                            </td>
                            <td className="ml-2 text-right md:text-left">
                              {column.customDisplayRow
                                ? column.customDisplayRow(dataTreatment)
                                : dataTreatment[column.id]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
            <div className=" w-full bg-white p-4 rounded-xl shadow-md mb-4">
              <h2 className="text-lg font-bold mb-2">
                Kontak Validator Pengaju
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
                          ? column.customDisplayRow(dataTreatment)
                          : dataTreatment[column.id]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {dataTreatment?.accepter && (
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
                            ? column.customDisplayRow(dataTreatment)
                            : dataTreatment[column.id]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className=" w-full bg-white p-4 rounded-xl shadow-md mb-4">
              <h2 className="text-lg font-bold mb-2">Informasi Perawatan</h2>
              <div className="flex flex-row justify-between items-center sm:justify-start gap-2 mb-4">
                <h3 className="text-lg font-semibold">Status</h3>
                <div className="w-fit">
                  <Status
                    type={convertStatusForTreatmentRecord(
                      dataTreatment?.status
                    )}
                    status={dataTreatment?.status}
                  />
                </div>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Instruksi</h3>
                <table className="w-full md:w-fit">
                  <tbody>
                    <tr>
                      <td className="flex flex-row items-center justify-between">
                        <span>Tanggal Pengisian</span>
                        <span className="hidden md:flex text-right">:</span>
                      </td>
                      <td className="ml-2 text-right md:text-left">
                        {dateFormatToIndonesia(dataTreatment?.date)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <h4>Deskripsi</h4>
                <p className="whitespace-pre-line">
                  {dataTreatment?.description}
                </p>
              </div>
              {(dataTreatment?.revisionNote || dataTreatment?.warningNote) && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Catatan</h3>
                  <div className="flex flex-col gap-2">
                    {dataTreatment?.revisionNote && (
                      <div>
                        <h4>Revisi</h4>
                        <p className="whitespace-pre-line">
                          {dataTreatment?.revisionNote}
                        </p>
                      </div>
                    )}
                    {dataTreatment?.warningNote && (
                      <div>
                        <h4>Peringatan</h4>
                        <p className="whitespace-pre-line">
                          {dataTreatment?.warningNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <h3 className="text-lg font-bold">
                Gambar dan Catatan Perawatan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(dataTreatment?.treatment) &&
                  dataTreatment?.treatment?.map((item, index) => (
                    <div
                      key={index}
                      className="w-full flex flex-col rounded-lg p-3 gap-2 bg-gray-200"
                    >
                      <h4 className="font-bold text-center">
                        Gambar {index + 1}
                      </h4>
                      <div className="w-full flex flex-row items-start justify-center">
                        <img className="w-full rounded" src={item.imageURL} />
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
