import Modal from "@/components/elements/modal";
import Seo from "@/components/elements/seo";
import Status, {
  convertStatusForBatch,
  convertStatusForTransaction,
  convertStatusForTreatmentRecord,
} from "@/components/elements/status";
import Dashboard from "@/components/layouts/dashboard";
import Loading from "@/components/modules/loading";
import NotFound from "@/components/templates/notFound";
import {
  roleUser,
  transactionStatus,
  treatmentRecordStatus,
} from "@/constant/constant";
import { get, putWithJSON } from "@/lib/axios";
import {
  dateFormatToIndonesia,
  getLastURLSegment,
  setNumberFormat,
  setPriceFormat,
  setWeightFormat,
} from "@/utils/utilities";
import { Alert, Button, Slide, Snackbar, TextField } from "@mui/material";
import { HttpStatusCode } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const informationColumn = [
  {
    section: "Petani",
    tableColumn: [
      {
        id: "_id",
        label: "ID",
        customDisplayRow: (data) => data?.proposal?.commodity?.farmer?._id,
      },
      {
        id: "name",
        label: "Nama",
        customDisplayRow: (data) => data?.proposal?.commodity?.farmer?.name,
      },
      {
        id: "email",
        label: "Email",
        customDisplayRow: (data) => data?.proposal?.commodity?.farmer?.email,
      },
      {
        id: "phoneNumber",
        label: "Nomor handphone",
        customDisplayRow: (data) =>
          data?.proposal?.commodity?.farmer?.phoneNumber,
      },
    ],
  },
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

const requesterColumn = [
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

const accepterColumn = [
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

  /* Modal */
  const [openModal, setOpenModal] = useState(false);
  const handleModal = () => setOpenModal(!openModal);

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

  const [input, setInput] = useState({
    status: "",
    revisionNote: "",
    warningNote: "",
  });

  const handleChange = ({ target: { name, value } }) => {
    setInput({ ...input, [name]: value });
  };

  const handleUpdate = async (e) => {
    setIsLoading(true);
    setOpenModal(false);

    const data = await putWithJSON(`/api/v1/treatment-record/validate/${id}`, {
      ...input,
    });
    if (data.status == HttpStatusCode.Ok) {
      router.push("/dashboard/validation-treatment-record");
    } else {
      setResult({ errorMessage: data.message });
    }

    setIsLoading(false);
  };

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
      {openModal && (
        <Modal>
          <Image
            src="/search _ find, research, scan, article, document, file, magnifier_lg.png"
            width={160}
            height={160}
            alt="ilustrasi Cek Kembali"
          />
          <h2 className="text-xl text-center mt-4 font-bold">
            {input.status == treatmentRecordStatus.approved
              ? "Apakah anda yakin ingin menyetujui riwayat perawatan ini?"
              : "Apakah anda yakin ingin menolak riwayat perawatan ini?"}
          </h2>
          {input.status == treatmentRecordStatus.revision && (
            <div className="flex flex-col gap-2 w-full">
              <div className="flex flex-row gap-2 items-center">
                <label className="text-sm font-bold">Catatan Revisi</label>
                <Status status="Wajib" />
              </div>
              <TextField
                className="bg-white"
                required
                name="revisionNote"
                value={input.revisionNote}
                onChange={handleChange}
                multiline
                rows={3}
              />
              <label className="text-sm font-bold">Catatan Peringatan</label>
              <TextField
                className="bg-white"
                name="warningNote"
                value={input.warningNote}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </div>
          )}
          <div
            className={`flex flex-row w-full gap-2 ${
              input.status == treatmentRecordStatus.revision
                ? "mt-2 justify-end"
                : "justify-center"
            }`}
          >
            <Button
              className="text-right bg-[#DB3546] hover:bg-[#BA2D3C] normal-case font-bold mt-2"
              variant="contained"
              onClick={() => {
                handleModal();
                handleChange({
                  target: { name: "status", value: "" },
                });
              }}
            >
              Tidak
            </Button>
            <Button
              className="text-right bg-[#53A06C] hover:bg-[#3E8A4F] normal-case font-bold mt-2"
              variant="contained"
              onClick={handleUpdate}
            >
              Ya
            </Button>
          </div>
        </Modal>
      )}
      <Dashboard roles={roleUser.validator}>
        <h1 className="text-2xl mb-4 font-bold">Detail Riwayat Perawatan</h1>
        {result.errorMessage && (
          <NotFound
            content="Riwayat Perawatan"
            urlRedirect="/dashboard/validation-treatment-record"
            redirectPageTitle="daftar riwayat perawatan"
          />
        )}
        {!isLoading && dataTreatment._id && (
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
                  {requesterColumn.map((column, index) => (
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
                    {accepterColumn.map((column, index) => (
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
              <h2 className="text-xl font-bold mb-4">Informasi Perawatan</h2>
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
              <h3 className="text-lg font-semibold">
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
                      <div className="w-full p-2 bg-white rounded-md">
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
        {Array.isArray(dataTreatment?.treatment) &&
          dataTreatment?.treatment?.length > 0 &&
          dataTreatment?.status == treatmentRecordStatus.pending &&
          !isLoading && (
            <div className="flex w-full gap-2 justify-end">
              <Button
                className="text-right bg-[#DB3546] hover:bg-[#BA2D3C] normal-case font-bold mt-2"
                variant="contained"
                onClick={() => {
                  handleModal();
                  handleChange({
                    target: {
                      name: "status",
                      value: treatmentRecordStatus.revision,
                    },
                  });
                }}
              >
                Tolak
              </Button>
              <Button
                className="text-right bg-[#53A06C] hover:bg-[#3E8A4F] normal-case font-bold mt-2"
                variant="contained"
                onClick={() => {
                  handleModal();
                  handleChange({
                    target: {
                      name: "status",
                      value: treatmentRecordStatus.approved,
                    },
                  });
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
