import Loading from "@/components/modules/loading";
import Seo from "@/components/elements/seo";
import Status from "@/components/elements/status";
import Default from "@/components/layouts/default";
import { get, putWithJSON } from "@/lib/axios";
import { dateFormatToIndonesia, setPriceFormat } from "@/utils/utilities";
import { Alert, Button, Snackbar } from "@mui/material";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Slide from "@mui/material/Slide";

export default () => {
  const router = useRouter();
  const { id } = router.query;

  const [dataTransaction, setDataTransaction] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getTransactionData = async () => {
    setIsLoading(true);
    const data = await get(`/api/v1/transaction/${id}`, {});

    if (data?.data) {
      setDataTransaction(data.data);
    } else {
      setError(data.message);
    }

    setIsLoading(false);
  };

  const checkRole = async () => {
    const { data } = await get("/api/v1/user/profile");

    if (data) {
      if (data?.role != "buyer") {
        router.replace("/");
      }
    }
  };

  useEffect(() => {
    if (!Cookies.get("token")) {
      router.replace({
        pathname: "/login",
        query: {
          redirect: router.pathname,
        },
      });
    } else {
      checkRole();
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    else {
      getTransactionData();
    }
  }, [id]);

  const convertStatusForComponent = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "accepted":
        return "success";
      case "cancelled":
        return "error";
      default:
        return;
    }
  };

  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen(true);
  };
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleCancel = async (e) => {
    e.preventDefault();

    const data = await putWithJSON(`/api/v1/transaction/cancel/${id}`, {});
    if (data.status == 200) {
      setDataTransaction({
        ...dataTransaction,
        status: "cancelled",
      });
    } else {
      setError(data.message);
      handleClick();
    }
  };

  return (
    <>
      <Seo title={`Detail Transaksi ${id}`} />
      {isLoading ? <Loading /> : <></>}
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Slide}
        autoHideDuration={6000}
        onClose={handleClose}
        message={error.message}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {error.message}
        </Alert>
      </Snackbar>
      <Default>
        <h1 className="text-2xl font-bold mb-4">Detail Transaksi</h1>
        {error ? (
          <div className="flex flex-col justify-center items-center">
            <Image
              src="/navigation _ location, map, destination, direction, question, lost, need help_lg.png"
              width={400}
              height={400}
              alt="Ilustrasi Not Found"
            />
            <h2 className="text-xl font-bold">Transaksi tidak ditemukan</h2>
            <Link href="/transaction-history">
              <span className="text-[#53A06C]">
                Kembali ke halaman riwayat transaksi
              </span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full bg-white p-4 rounded-xl divide-y-2">
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
                        type={convertStatusForComponent(dataTransaction.status)}
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
                      {dateFormatToIndonesia(dataTransaction.createdAt)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h2 className="text-lg font-bold my-2">Informasi Komoditas</h2>
              <div className="flex flex-row items-start gap-x-6">
                <Image
                  src={
                    dataTransaction.commodity?.imageURLs[0]
                      ? dataTransaction.commodity?.imageURLs[0]
                      : "/logo-no-background.png"
                  }
                  width={100}
                  height={100}
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
                      {dataTransaction.proposal?.plantingArea} km
                      <sup>2</sup>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex flex-row justify-between">
                        <span>Luas lahan tanam</span>
                        <span className="hidden md:flex text-right">:</span>
                      </div>
                    </td>
                    <td className="flex items-center w-full gap-2 px-2 justify-end md:justify-start">
                      {dataTransaction.proposal?.address}
                    </td>
                  </tr>
                  <tr>
                    <td className="flex flex-row justify-between">
                      <span>Estimasi berat panen</span>
                      <span className="hidden md:flex text-right">:</span>
                    </td>
                    <td className="px-2 text-right md:text-left">
                      {dataTransaction.proposal?.estimatedTotalHarvest} kilogram
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
                        {dataTransaction.proposal?.estimatedTotalHarvest}{" "}
                        kilogram
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
              onClick={handleCancel}
            >
              Batalkan Transaksi
            </Button>
          </div>
        )}
      </Default>
    </>
  );
};
