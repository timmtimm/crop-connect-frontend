import Modal from "@/components/elements/modal";
import Seo from "@/components/elements/seo";
import Status, {
  convertStatusForBatch,
  convertStatusForTransaction,
} from "@/components/elements/status";
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
import { Alert, Button, Slide, Snackbar } from "@mui/material";
import { HttpStatusCode } from "axios";
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
        customDisplayRow: (data) => data?.commodity?.code,
      },
      {
        id: "name",
        label: "Nama",
        customDisplayRow: (data) => data?.commodity?.name,
      },
      {
        id: "seed",
        label: "Bibit",
        customDisplayRow: (data) => data?.commodity?.seed,
      },
      {
        id: "pricePerKg",
        label: "Harga per Kg",
        customDisplayRow: (data) => setPriceFormat(data?.commodity?.pricePerKg),
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
          `${data?.address}, ${data?.region?.province}, ${data?.region?.regency}, ${data?.region?.district}, ${data?.region?.subdistrict}`,
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
  {
    section: "Transaksi",
    tableColumn: [
      {
        id: "_id",
        label: "ID",
        customDisplayRow: null,
      },
      {
        id: "buyer",
        label: "Pembeli",
        customDisplayRow: (data) => data?.buyer?.name,
      },
      {
        id: "address",
        label: "Alamat Pengiriman",
        customDisplayRow: (data) =>
          `${data?.address}, ${data?.region?.province}, ${data?.region?.regency}, ${data?.region?.district}, ${data?.region?.subdistrict}`,
      },
      {
        id: "transactionType",
        label: "Tipe Transaksi",
        customDisplayRow: (data) => data?.transactionType,
      },
      {
        id: "status",
        label: "Status",
        customDisplayRow: (data) => (
          <div className="flex items-center w-full justify-end md:justify-start">
            <Status
              type={convertStatusForTransaction(data?.status)}
              status={data?.status}
            />
          </div>
        ),
      },
      {
        id: "createdAt",
        label: "Tanggal Transaksi",
        customDisplayRow: (data) =>
          dateFormatToIndonesia(data?.createdAt, false),
      },
      {
        id: "totalPrice",
        label: "Total Harga",
        customDisplayRow: (data) => setPriceFormat(data?.totalPrice),
      },
    ],
  },
];

export default () => {
  const router = useRouter();
  const { id } = router.query;

  const [dataTransaction, setDataTransaction] = useState({});
  const [decision, setDecision] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState({
    errorMessage: "",
    successMessage: "",
  });

  /* Snackbar */
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const handleClickSnackbar = () => setOpenSnackbar(true);
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  /* Modal */
  const [openModal, setOpenModal] = useState(false);
  const handleModal = () => setOpenModal(!openModal);

  /* Function */
  const getTransaction = async () => {
    const data = await get(`/api/v1/transaction/${id}`, {});

    if (data?.data) {
      setDataTransaction(data.data);
    } else {
      setResult({
        errorMessage: data.message,
        successMessage: "",
      });
    }

    setIsLoading(false);
  };

  const handleDecision = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    handleModal();

    if (!id) return;

    const data = await putWithJSON(`/api/v1/transaction/${id}`, {
      decision: decision,
    });

    if (data.status == HttpStatusCode.Ok) {
      getTransaction();
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

    setIsLoading(false);
    handleClickSnackbar();
  };

  useEffect(() => {
    if (id) {
      getTransaction();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  return (
    <>
      <Seo title="Detail Penjualan" />
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
      {isLoading && <Loading />}
      {openModal && (
        <Modal>
          <Image
            src="/search _ find, research, scan, article, document, file, magnifier_lg.png"
            width={160}
            height={160}
            alt="ilustrasi Batal Transaksi"
          />
          <h2 className="text-xl text-center mt-4 font-bold">
            {decision == transactionStatus.accepted
              ? "Apakah anda yakin ingin menyetujui transaksi ini?"
              : "Apakah anda yakin ingin menolak transaksi ini?"}
          </h2>
          <div className="flex flex-row gap-2">
            <Button
              className="text-right bg-[#DB3546] hover:bg-[#BA2D3C] normal-case font-bold mt-2"
              variant="contained"
              onClick={() => {
                handleModal();
                setDecision("");
              }}
            >
              Tidak
            </Button>
            <Button
              className="text-right bg-[#53A06C] hover:bg-[#3E8A4F] normal-case font-bold mt-2"
              variant="contained"
              onClick={handleDecision}
            >
              Ya
            </Button>
          </div>
        </Modal>
      )}
      <Dashboard roles={roleUser.farmer}>
        <h1 className="text-2xl mb-4 font-bold">Detail Penjualan</h1>
        {result.errorMessage && (
          <div className="flex flex-col justify-center items-center">
            <Image
              src="/navigation _ location, map, destination, direction, question, lost, need help_lg.png"
              width={400}
              height={400}
              alt="Ilustrasi Not Found"
            />
            <h2 className="text-xl font-bold">Penjualan tidak ditemukan</h2>
            <Link href="/dashboard/sales">
              <span className="text-[#53A06C]">
                Kembali ke halaman daftar penjualan
              </span>
            </Link>
          </div>
        )}
        {dataTransaction._id && (
          <div className=" w-full bg-white p-4 rounded-xl shadow-md mb-4">
            <div className="flex flex-col gap-4 divide-y-2">
              {informationColumn.map((section, index) => {
                return index == 2 && !dataTransaction.batch ? (
                  <></>
                ) : (
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
                                ? column.customDisplayRow(dataTransaction)
                                : dataTransaction[column.id]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {!isLoading && dataTransaction.status == transactionStatus.pending && (
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
