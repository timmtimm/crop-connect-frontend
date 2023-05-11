import Loading from "@/components/elements/loading";
import Seo from "@/components/elements/seo";
import Status from "@/components/elements/status";
import Default from "@/components/layouts/default";
import { get } from "@/lib/axios";
import { dateFormatToIndonesia, setPriceFormat } from "@/utils/utilities";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
      case "":
        return "error";
      default:
        return;
    }
  };

  return (
    <>
      <Seo title={`Detail Transaksi ${id}`} />
      {isLoading ? <Loading /> : <></>}
      <Default>
        <h1 className="text-2xl font-bold mb-4">Detail Transaksi</h1>
        <div className="flex flex-col gap-4 w-full bg-white p-4 rounded-xl divide-y-2">
          {error ? (
            <div className="flex flex-col justify-center items-center">
              <Image
                src="/navigation _ location, map, destination, direction, question, lost, need help_lg.png"
                alt="Ilustrasi Not Found"
              />
              <h2 className="text-xl">Transaksi tidak ditemukan</h2>
              <Link href="/transaction-history">
                <span>Kembali ke halaman riwayat transaksi</span>
              </Link>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-bold mb-2">Informasi Transaksi</h2>
                <div className="flex flex-col gap-y-1">
                  <span>Kode transaksi: {dataTransaction._id}</span>
                  <div className="flex flex-row gap-x-2">
                    <span>Status:</span>
                    <Status
                      type={convertStatusForComponent(dataTransaction.status)}
                      status={dataTransaction.status}
                    />
                  </div>
                  <span>
                    Waktu transaksi:{" "}
                    {dateFormatToIndonesia(dataTransaction.createdAt)}
                  </span>
                  <span>Alamat kirim: {dataTransaction.address}</span>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold my-2">Informasi Komoditas</h2>
                <div className="flex flex-row gap-x-6">
                  <Image
                    src={
                      dataTransaction.commodity?.imageURLs[0]
                        ? dataTransaction.commodity?.imageURLs[0]
                        : "/logo-no-background.png"
                    }
                    width={100}
                    height={100}
                  />
                  <div className="flex flex-col gap-y-2">
                    <span>Nama: {dataTransaction.commodity?.name}</span>
                    <span>Jenis bibit: {dataTransaction.commodity?.seed}</span>
                    <span>
                      Estimasi panen:{" "}
                      {dataTransaction.commodity?.plantingPeriod}
                    </span>
                    <span>
                      Harga: Rp{" "}
                      {setPriceFormat(dataTransaction.commodity?.pricePerKg)} /
                      kilogram
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold my-2">Informasi Proposal</h2>
                <div className="flex flex-col gap-y-1">
                  <span>Proposal: {dataTransaction.proposal?.name}</span>
                  <span>Alamat lahan: {dataTransaction.proposal?.address}</span>
                  <span>
                    Luas lahan tanam: {dataTransaction.proposal?.plantingArea}{" "}
                    km
                    <sup>2</sup>
                  </span>
                  <span>
                    Estimasi berat panen:{" "}
                    {dataTransaction.proposal?.estimatedTotalHarvest} kilogram
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold my-2">Rincian Pembayaran</h2>
                <div className="flex flex-col gap-y-1 divide-y divide-dashed">
                  <div className="flex flex-col gap-y-1">
                    <span>
                      Harga per kilogram: Rp{" "}
                      {setPriceFormat(dataTransaction.commodity?.pricePerKg)}
                    </span>
                    <span className="mb-2">
                      Estimasi berat panen:{" "}
                      {dataTransaction.proposal?.estimatedTotalHarvest} kilogram
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg text-right mt-2">
                      Total Pembayaran{" "}
                      <span className="font-bold">
                        Rp {setPriceFormat(dataTransaction.totalPrice)}
                      </span>
                    </h3>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Default>
    </>
  );
};
