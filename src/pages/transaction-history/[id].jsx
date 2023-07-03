import Loading from "@/components/modules/loading";
import Seo from "@/components/elements/seo";
import Status, {
  convertStatusForBatch,
  convertStatusForTransaction,
} from "@/components/elements/status";
import Default from "@/components/layouts/default";
import { get, putWithJSON } from "@/lib/axios";
import {
  dateFormatToIndonesia,
  setNumberFormat,
  setPriceFormat,
  setWeightFormat,
} from "@/utils/utilities";
import { Alert, Button, MenuItem, Select, Snackbar } from "@mui/material";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Slide from "@mui/material/Slide";
import { batchStatus, roleUser, transactionStatus } from "@/constant/constant";
import Modal from "@/components/elements/modal";
import { HttpStatusCode } from "axios";
import NotFound from "@/components/templates/notFound";

export default () => {
  const router = useRouter();
  const { id } = router.query;

  /* Snackbar */
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  /* Modal */
  const [openModal, setOpenModal] = useState(false);
  const handleModal = () => setOpenModal(!openModal);

  /* State */
  const [dataTransaction, setDataTransaction] = useState({});
  const [input, setInput] = useState({
    treatmentRecord: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  /* Function */
  const getTransactionData = async () => {
    const data = await get(`/api/v1/transaction/${id}`, {});

    if (data?.data) {
      let tempTransaction = data.data;
      if (data.data?.batch?.status == batchStatus.harvest) {
        const dataHarvest = await get(`/api/v1/harvest/batch`, {
          "batch-id": data.data.batch._id,
        });

        if (dataHarvest.status == HttpStatusCode.Ok) {
          tempTransaction = {
            ...tempTransaction,
            harvest: dataHarvest.data,
          };
        }
      }
      console.log(data.data);
      if (data.data.status == transactionStatus.accepted) {
        const dataTreatmentRecord = await get(
          `/api/v1/treatment-record/batch`,
          {
            "batch-id": data.data.batch._id,
          }
        );

        if (data.status == HttpStatusCode.Ok) {
          tempTransaction = {
            ...tempTransaction,
            treatmentRecord: dataTreatmentRecord.data,
          };
        }
      }

      setDataTransaction(tempTransaction);
    } else {
      setError(data.message);
    }

    setIsLoading(false);
  };

  const getTreatmentRecord = async () => {};

  /* useEffect */
  useEffect(() => {
    if (!id) return;
    else {
      getTransactionData();
    }
  }, [id]);

  const handleCancel = async (e) => {
    e.preventDefault();

    const data = await putWithJSON(`/api/v1/transaction/cancel/${id}`, {});
    if (data.status == HttpStatusCode.Ok) {
      setDataTransaction({
        ...dataTransaction,
        status: "cancelled",
      });
    } else {
      setError(data.message);
      handleClick();
    }

    handleModal();
  };

  return (
    <>
      <Seo
        title={
          isLoading
            ? "Loading..."
            : dataTransaction?.data
            ? `Transaksi Tidak Ditemukan`
            : `Detail Transaksi ${dataTransaction.commodity?.name}`
        }
      />
      {openModal && (
        <Modal>
          <Image
            src="/search _ find, research, scan, article, document, file, magnifier_lg.png"
            width={160}
            height={160}
            alt="ilustrasi Cek Kembali"
          />
          <h2 className="text-xl text-center mt-4 font-bold">
            Apakah anda yakin ingin membatalkan transaksi ini?
          </h2>
          <div className="flex flex-row gap-2">
            <Button
              className="text-right bg-[#DB3546] hover:bg-[#BA2D3C] normal-case font-bold mt-2"
              variant="contained"
              onClick={handleModal}
            >
              Tidak
            </Button>
            <Button
              className="text-right bg-[#53A06C] hover:bg-[#3E8A4F] normal-case font-bold mt-2"
              variant="contained"
              onClick={handleCancel}
            >
              Ya
            </Button>
          </div>
        </Modal>
      )}
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Slide}
        autoHideDuration={3000}
        onClose={handleClose}
        message={error.message}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {error.message}
        </Alert>
      </Snackbar>
      {isLoading && <Loading />}
      <Default isAuth={true} roles={roleUser.buyer}>
        <h1 className="text-2xl font-bold mb-4">Detail Transaksi</h1>
        {!isLoading && error && (
          <NotFound
            content="Transaksi"
            urlRedirect="/transaction-history"
            redirectPageTitle="daftar riwayat transaksi"
          />
        )}
        {!isLoading && dataTransaction._id && (
          <div className="flex flex-col gap-4 w-full bg-white p-4 rounded-xl shadow-md divide-y-2">
            <div>
              <h2 className="text-lg font-bold mb-2">Informasi Transaksi</h2>
              <table className="w-full md:w-fit">
                <tbody>
                  <tr>
                    <td className="flex flex-row items-center justify-between">
                      <span>Kode transaksi</span>
                      <span className="hidden md:flex text-right">:</span>
                    </td>
                    <td className="px-2 text-right md:text-left">
                      {dataTransaction._id}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex flex-row justify-between">
                        <span>Status</span>
                        <span className="hidden md:flex text-right">:</span>
                      </div>
                    </td>
                    <td className="flex items-center w-full gap-2 px-2 justify-end md:justify-start">
                      {" "}
                      <Status
                        type={convertStatusForTransaction(
                          dataTransaction.status
                        )}
                        status={dataTransaction.status}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="flex flex-row justify-between">
                      <span>Waktu transaksi</span>
                      <span className="hidden md:flex text-right">:</span>
                    </td>
                    <td className="px-2 text-right md:text-left">
                      {dateFormatToIndonesia(dataTransaction.createdAt, true)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h2 className="text-lg font-bold my-2">Informasi Komoditas</h2>
              <div className="flex flex-row items-start gap-x-6">
                <Image
                  className="rounded-lg"
                  src={
                    dataTransaction.commodity?.imageURLs[0]
                      ? dataTransaction.commodity?.imageURLs[0]
                      : "/logo-no-background.png"
                  }
                  width={100}
                  height={100}
                  alt={`Foto ${dataTransaction.commodity?.name}`}
                />
                <table className="w-full md:w-fit">
                  <tbody>
                    <tr>
                      <td className="flex flex-row items-center justify-between">
                        <span>Nama</span>
                        <span className="hidden md:flex text-right">:</span>
                      </td>
                      <td className="px-2 text-right md:text-left">
                        {dataTransaction.commodity?.name}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="flex flex-row justify-between">
                          <span>Jenis bibit</span>
                          <span className="hidden md:flex text-right">:</span>
                        </div>
                      </td>
                      <td className="px-2 text-right md:text-left">
                        {dataTransaction.commodity?.seed}
                      </td>
                    </tr>
                    <tr>
                      <td className="flex flex-row justify-between">
                        <span>Harga</span>
                        <span className="hidden md:flex text-right">:</span>
                      </td>
                      <td className="px-2 text-right md:text-left">
                        {setPriceFormat(dataTransaction.commodity?.pricePerKg)}{" "}
                        / kilogram
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold my-2">Informasi Proposal</h2>
              <table className="w-full md:w-fit">
                <tbody>
                  <tr>
                    <td className="flex flex-row items-center justify-between">
                      <span>Proposal</span>
                      <span className="hidden md:flex text-right">:</span>
                    </td>
                    <td className="px-2 text-right md:text-left">
                      {dataTransaction.proposal?.name}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex flex-row justify-between">
                        <span>Alamat lahan</span>
                        <span className="hidden md:flex text-right">:</span>
                      </div>
                    </td>
                    <td className="px-2 text-right md:text-left">
                      {dataTransaction.proposal?.address}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex flex-row justify-between">
                        <span>Luas lahan tanam</span>
                        <span className="hidden md:flex text-right">:</span>
                      </div>
                    </td>
                    <td className="px-2 text-right md:text-left">
                      {setNumberFormat(dataTransaction.proposal?.plantingArea)}{" "}
                      m<sup>2</sup>
                    </td>
                  </tr>
                  <tr>
                    <td className="flex flex-row justify-between">
                      <span>Estimasi berat panen</span>
                      <span className="hidden md:flex text-right">:</span>
                    </td>
                    <td className="px-2 text-right md:text-left">
                      {setWeightFormat(
                        dataTransaction.proposal?.estimatedTotalHarvest
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {dataTransaction.batch?._id != "000000000000000000000000" && (
              <div>
                <h2 className="text-lg font-bold my-2">Informasi Periode</h2>
                <table className="w-full md:w-fit">
                  <tbody>
                    <tr>
                      <td className="flex flex-row items-center justify-between">
                        <span>Periode</span>
                        <span className="hidden md:flex text-right">:</span>
                      </td>
                      <td className="px-2 text-right md:text-left">
                        {dataTransaction.batch?.name}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="flex flex-row justify-between">
                          <span>Status</span>
                          <span className="hidden md:flex text-right">:</span>
                        </div>
                      </td>
                      <td className="flex items-center w-full gap-2 px-2 justify-end md:justify-start">
                        {" "}
                        <Status
                          type={convertStatusForBatch(
                            dataTransaction.batch.status
                          )}
                          status={dataTransaction.batch?.status}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="flex flex-row justify-between">
                        <span>Ditanam mulai</span>
                        <span className="hidden md:flex text-right">:</span>
                      </td>
                      <td className="px-2 text-right md:text-left">
                        {dateFormatToIndonesia(
                          dataTransaction.batch?.createdAt
                        )}
                      </td>
                    </tr>

                    {dataTransaction?.harvest && (
                      <>
                        <tr>
                          <td className="flex flex-row justify-between">
                            <span>Panen tanggal</span>
                            <span className="hidden md:flex text-right">:</span>
                          </td>
                          <td className="px-2 text-right md:text-left">
                            {dateFormatToIndonesia(
                              dataTransaction.harvest?.createdAt
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="flex flex-row justify-between">
                            <span>Berat panen</span>
                            <span className="hidden md:flex text-right">:</span>
                          </td>
                          <td className="px-2 text-right md:text-left">
                            {setNumberFormat(
                              dataTransaction.harvest?.totalHarvest
                            )}{" "}
                            kilogram
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
                {dataTransaction.status == transactionStatus.accepted && (
                  <div className="flex flex-col mt-2">
                    <h2 className="text-lg font-bold">Riwayat Perawatan</h2>
                    <div>
                      <div>
                        Menampilkan riwayat perawatan ke -{" "}
                        <Select
                          className="bg-white"
                          value={input.treatmentRecord.number}
                          inputProps={{
                            className: `py-1 ${
                              input.treatmentRecord?.warningNote &&
                              "text-red-500"
                            }`,
                          }}
                        >
                          {Array.isArray(dataTransaction?.treatmentRecord) &&
                            dataTransaction?.treatmentRecord.map(
                              (treatmentRecord) => (
                                <MenuItem
                                  className={`${
                                    treatmentRecord?.warningNote &&
                                    "text-red-500"
                                  }`}
                                  key={treatmentRecord.number}
                                  value={treatmentRecord.number}
                                  onClick={() => {
                                    setInput({ ...input, treatmentRecord });
                                  }}
                                >
                                  {treatmentRecord.number}
                                </MenuItem>
                              )
                            )}
                        </Select>{" "}
                        <span className="font-semibold">
                          {(Array.isArray(dataTransaction?.treatmentRecord) &&
                            dataTransaction?.treatmentRecord.length) ||
                            0}{" "}
                          riwayat perawatan
                        </span>
                      </div>
                      {input.treatmentRecord._id && (
                        <div>
                          <h3 className="text-lg font-semibold mt-4 mb-2">
                            Catatan perawatan
                          </h3>
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold">Instruksi</h3>
                            <span>Tanggal Pengisian: </span>
                            <span>
                              {dateFormatToIndonesia(
                                input.treatmentRecord?.date
                              )}
                            </span>
                            <h4>Deskripsi</h4>
                            <p className="whitespace-pre-line">
                              {input.treatmentRecord?.description}
                            </p>
                          </div>
                          {input.treatmentRecord?.warningNote && (
                            <div className="mb-4">
                              <h3 className="text-lg font-semibold">
                                Catatan Peringatan
                              </h3>
                              <p className="whitespace-pre-line">
                                {input.treatmentRecord?.warningNote}
                              </p>
                            </div>
                          )}
                          <h3 className="text-lg font-semibold">
                            Gambar dan Catatan Perawatan
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.isArray(input.treatmentRecord?.treatment) &&
                              input.treatmentRecord?.treatment?.map(
                                (item, index) => (
                                  <div
                                    key={index}
                                    className="w-full flex flex-col rounded-lg p-3 gap-2 bg-gray-200"
                                  >
                                    <h4 className="font-bold text-center">
                                      Gambar {index + 1}
                                    </h4>
                                    <div className="w-full flex flex-row items-start justify-center">
                                      <img
                                        className="rounded w-full"
                                        src={item.imageURL}
                                      />
                                    </div>
                                    <div className="w-full p-2 bg-white rounded-md whitespace-pre-line">
                                      <span className="font-semibold mb-2">
                                        Catatan
                                      </span>
                                      <br />
                                      {item.note}
                                    </div>
                                  </div>
                                )
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {dataTransaction?.harvest && (
                  <>
                    <div className="my-2">
                      <h3 className="font-semibold">Kondisi</h3>
                      <p className="whitespace-pre-line">
                        {dataTransaction.harvest?.condition}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        Gambar dan Catatan Panen
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.isArray(dataTransaction.harvest?.harvest) &&
                          dataTransaction.harvest?.harvest?.map(
                            (item, index) => (
                              <div
                                key={index}
                                className="w-full flex flex-col rounded-lg p-3 gap-2 bg-gray-200"
                              >
                                <h4 className="font-bold text-center">
                                  Gambar {index + 1}
                                </h4>
                                <div className="w-full flex flex-row items-start justify-center">
                                  <img
                                    className="rounded"
                                    src={item.imageURL}
                                  />
                                </div>
                                <div className="w-full p-2 bg-white rounded-md whitespace-pre-line">
                                  <span className="font-semibold mb-2">
                                    Catatan
                                  </span>
                                  <br />
                                  {item.note}
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold my-2">Rincian Pembayaran</h2>
              <div className="flex flex-col gap-y-1 divide-y divide-dashed">
                <table className="w-full md:w-fit">
                  <tbody>
                    <tr>
                      <td className="flex flex-row items-center justify-between">
                        <span>Harga per kilogram</span>
                        <span className="hidden md:flex text-right">:</span>
                      </td>
                      <td className="px-2 text-right md:text-left">
                        {setPriceFormat(dataTransaction.commodity?.pricePerKg)}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="flex flex-row justify-between">
                          <span>Estimasi berat panen</span>
                          <span className="hidden md:flex text-right">:</span>
                        </div>
                      </td>
                      <td className="px-2 text-right md:text-left">
                        {setWeightFormat(
                          dataTransaction.proposal?.estimatedTotalHarvest
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div>
                  <h3 className="text-lg text-right mt-2">
                    Total Pembayaran{" "}
                    <span className="font-bold">
                      {setPriceFormat(dataTransaction.totalPrice)}
                    </span>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        )}
        {dataTransaction.status == "pending" && (
          <div className="flex w-full justify-end">
            <Button
              className="text-right bg-[#DB3546] hover:bg-[#BA2D3C] normal-case font-bold mt-2"
              variant="contained"
              onClick={handleModal}
            >
              Batalkan Transaksi
            </Button>
          </div>
        )}
      </Default>
    </>
  );
};
