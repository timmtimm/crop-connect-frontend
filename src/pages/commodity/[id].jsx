import Loading from "@/components/modules/loading";
import Seo from "@/components/elements/seo";
import Default from "@/components/layouts/default";
import { fetcher, triggerfetcher } from "@/lib/axios";
import { runOnce } from "@/lib/swr";
import { dateFormatToIndonesia, setPriceFormat } from "@/utils/utilities";
import { Button, MenuItem, Select } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaShoppingBasket } from "react-icons/fa";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

export default () => {
  const router = useRouter();
  const { id } = router.query;

  /* State */
  const [input, setInput] = useState({
    proposal: {},
    batch: {},
    treatmentRecord: {},
  });
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  /* Fetch */
  const { data: dataCommodity, isLoading: commodityLoading } = useSWR(
    [`api/v1/commodity/${id}`, {}],
    ([url, params]) => fetcher(url, params),
    runOnce
  );
  const { data: dataProposal, isLoading: proposalLoading } = useSWR(
    [`api/v1/proposal/commodity/${id}`, {}],
    ([url, params]) => fetcher(url, params),
    runOnce
  );
  const { data: dataBatch, isLoading: batchLoading } = useSWR(
    [`api/v1/batch/commodity/${id}`, {}],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  const {
    data: dataharvest,
    trigger: triggerHarvest,
    isMutating: mutatingHarvest,
  } = useSWRMutation("/api/v1/harvest/batch", triggerfetcher);
  const {
    data: dataTreatmentRecord,
    trigger: triggerTreatmentRecord,
    isMutating: mutatingTreatmentRecord,
  } = useSWRMutation("/api/v1/harvest/batch", triggerfetcher);
  const {
    data: dataTotalCommodityFarmer,
    trigger: triggerTotalCommodity,
    isMutating: mutatingTotalCommodity,
  } = useSWRMutation(
    `/api/v1/commodity/farmer-total/${dataCommodity?.data?.farmer?._id}`,
    triggerfetcher
  );
  // const {
  //   data: dataTotalProposal,
  //   trigger: triggerTotalProposal,
  //   isMutating: mutatingTotalProposal,
  // } = useSWRMutation("/api/v1/harvest/batch", triggerfetcher);

  /* UseEffect */
  useEffect(() => {
    if (!dataCommodity?.data) return;
    else {
      triggerTotalCommodity({});
      // triggerTotalProposal({});
    }
  }, [dataCommodity]);

  useEffect(() => {
    if (!input.batch._id) return;
    else {
      triggerHarvest({
        "batch-id": input.batch._id,
      });
      triggerTreatmentRecord({
        "batch-id": input.batch._id,
      });
    }
  }, [input.batch]);

  return (
    <>
      <Seo
        title={`Komoditas ${
          dataCommodity?.status != 200
            ? `Tidak Ditemukan`
            : `${dataCommodity?.data?.name}`
        }`}
      />
      {(commodityLoading ||
        proposalLoading ||
        batchLoading ||
        mutatingHarvest ||
        mutatingTotalCommodity ||
        mutatingTreatmentRecord) && <Loading />}
      <Default>
        {dataCommodity?.status != 200 ? (
          <div className="flex flex-col justify-center items-center">
            <Image
              src="/navigation _ location, map, destination, direction, question, lost, need help_lg.png"
              width={400}
              height={400}
              alt="Ilustrasi Not Found"
            />
            <h2 className="text-xl font-bold">Komoditas tidak ditemukan</h2>
            <Link href="/">
              <span className="text-[#53A06C]">Kembali ke halaman utama</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col lg:flex-row items-start gap-5">
              <div className="w-full lg:w-fit flex justify-center ">
                <div className="max-w-[28rem]">
                  <Swiper
                    style={{
                      "--swiper-navigation-color": "#fff",
                      "--swiper-pagination-color": "#fff",
                    }}
                    loop={true}
                    spaceBetween={10}
                    navigation={true}
                    thumbs={{
                      swiper:
                        thumbsSwiper && !thumbsSwiper.destroyed
                          ? thumbsSwiper
                          : null,
                    }}
                    modules={[FreeMode, Navigation, Thumbs]}
                    className="mySwiper2"
                  >
                    {Array.isArray(dataCommodity?.data?.imageURLs) &&
                    dataCommodity?.data?.imageURLs[0] != "" &&
                    dataCommodity?.data?.imageURLs.length > 0 ? (
                      dataCommodity?.data?.imageURLs?.map((image) => (
                        <SwiperSlide>
                          <img src={image} />
                        </SwiperSlide>
                      ))
                    ) : (
                      <SwiperSlide>
                        <img src="/logo.png" />
                      </SwiperSlide>
                    )}
                  </Swiper>
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    loop={true}
                    spaceBetween={10}
                    slidesPerView={4}
                    freeMode={true}
                    watchSlidesProgress={true}
                    modules={[FreeMode, Navigation, Thumbs]}
                    className="mySwiper mt-2"
                  >
                    {Array.isArray(dataCommodity?.data?.imageURLs) &&
                    dataCommodity?.data?.imageURLs[0] != "" &&
                    dataCommodity?.data?.imageURLs.length > 0 ? (
                      dataCommodity?.data?.imageURLs?.map((image) => (
                        <SwiperSlide>
                          <img src={image} />
                        </SwiperSlide>
                      ))
                    ) : (
                      <SwiperSlide>
                        <img src="/logo.png" />
                      </SwiperSlide>
                    )}
                  </Swiper>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row justify-between gap-6 w-full">
                <div className="divide-y divide-black w-full">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {dataCommodity?.data?.name}
                    </h1>
                    <p className="mt-2">
                      Terjual{" "}
                      <span className="font-bold">
                        {`belom implement`} kilogram
                      </span>{" "}
                      dari{" "}
                      <span className="font-bold">
                        {`belom implement`} transaksi
                      </span>
                    </p>
                    <h2 className="text-2xl font-bold mt-4 mb-5">
                      {setPriceFormat(dataCommodity?.data?.pricePerKg)} /
                      kilogram
                    </h2>
                  </div>
                  {dataCommodity?.data?.isAvailable ? (
                    <div className="flex flex-col gap-y-2">
                      <h3 className="text-xl font-bold mt-3">
                        Proposal Transaksi
                      </h3>
                      <div className="flex flex-row flex-wrap gap-2 mt-2 mb-4">
                        {Array.isArray(dataProposal?.data) &&
                          (dataProposal?.data?.length == 0 ? (
                            <span className="text-xl font-bold mt-4">
                              Komoditas tidak memiliki proposal transaksi
                            </span>
                          ) : (
                            dataProposal?.data?.map((proposal) => (
                              <button
                                value={proposal?._id}
                                className={`py-1 px-3 border-2 rounded-lg cursor-pointer hover:border-[#53A06C] hover:text-[#53A06C] ${
                                  !proposal.isAvailable &&
                                  proposal._id != input.proposal._id
                                    ? "text-[#AAB4C8] bg-[#F0F3F7] cursor-default border-gray-200"
                                    : proposal._id == input.proposal._id
                                    ? "border-[#53A06C] text-[#53A06C] bg-[#53A06C]/[.05]"
                                    : "border-gray-600"
                                } `}
                                onClick={() => {
                                  setInput({ ...input, proposal: proposal });
                                }}
                              >
                                {proposal?.name}
                              </button>
                            ))
                          ))}
                      </div>
                      {input.proposal._id && (
                        <>
                          <h4 className="text-lg font-bold">
                            Deskripsi Proposal
                          </h4>
                          <span>
                            Deskripsi:{" "}
                            <span className="font-bold">
                              {input?.proposal.description}
                            </span>
                          </span>
                          <span>
                            Alamat lahan:{" "}
                            <span className="font-bold">
                              {input?.proposal.address}
                            </span>
                          </span>
                          <span>
                            Estimasi berat panen:{" "}
                            <span className="font-bold">
                              {input?.proposal.estimatedTotalHarvest &&
                                `${input?.proposal.estimatedTotalHarvest} kilogram`}
                            </span>
                          </span>
                          <span className="font-bold">
                            Total:
                            {input.proposal.estimatedTotalHarvest &&
                              setPriceFormat(
                                dataCommodity?.data?.pricePerKg *
                                  input.proposal?.estimatedTotalHarvest
                              )}
                          </span>
                          {input.proposal.isAvailable ? (
                            <Link href={`/transaction/${input.proposal._id}`}>
                              <Button
                                className="w-full bg-[#52A068] normal-case font-bold mt-2"
                                disabled={
                                  input.proposal._id &&
                                  input.proposal.isAvailable
                                    ? false
                                    : true
                                }
                                variant="contained"
                              >
                                Lanjutkan Transaksi
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              className="w-full bg-[#52A068] normal-case font-bold mt-2"
                              disabled={
                                input.proposal._id && input.proposal.isAvailable
                                  ? false
                                  : true
                              }
                              variant="contained"
                              // onClick={handleSubmit}
                            >
                              Lanjutkan Transaksi
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex justify-center items-center">
                      <span className="text-xl font-bold mt-4">
                        Komoditas tidak sedang dalam masa penjualan
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-white h-min rounded-xl p-4 divide-y-2 min-w-max">
                  <Link href={`/farmer/${dataCommodity?.data?.farmer?._id}`}>
                    <p className="text-xl font-bold mb-2">
                      {dataCommodity?.data?.farmer?.name}
                    </p>
                  </Link>
                  <div>
                    <p className="font-bold mt-2">
                      Bergabung sejak{" "}
                      {dateFormatToIndonesia(
                        dataCommodity?.data?.farmer?.createdAt
                      )}
                    </p>
                    <p>
                      Komoditas:{" "}
                      {JSON.stringify(dataTotalCommodityFarmer?.data)} jenis
                    </p>
                    <p>
                      Transaksi:{" "}
                      {/*JSON.stringify(dataTotalProposal)*/ `belom implement`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h2 className="w-full py-1 px-3 bg-[#655C56] text-xl text-white font-bold">
                  Detail Komoditas
                </h2>
                <div>
                  <h3 className="text-lg font-bold">Deskripsi</h3>
                  <p>
                    {dataCommodity?.data?.description || "Tidak ada deskripsi"}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Jenis bibit</h3>
                  <p>{dataCommodity?.data?.seed}</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Estimasi panen</h3>
                  <p>{dataCommodity?.data?.plantingPeriod} hari</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="w-full py-1 px-3 bg-[#655C56] text-xl text-white font-bold">
                  Periode Penanaman
                </h2>
                <div>
                  <h3 className="text-lg font-bold">Pemilihan periode</h3>
                  <div>
                    Menampilkan periode penanaman ke -{" "}
                    <Select
                      className="bg-white"
                      value={input.proposal.name}
                      inputProps={{
                        className: "py-1",
                      }}
                    >
                      {Array.isArray(dataBatch?.data) &&
                        dataBatch?.data.map((batch) => (
                          <MenuItem
                            key={batch.name}
                            value={batch.name}
                            onClick={() => {
                              setInput({ ...input, batch });
                            }}
                          >
                            {batch.name}
                          </MenuItem>
                        ))}
                    </Select>{" "}
                    dari{" "}
                    <span className="font-bold">
                      {(Array.isArray(dataBatch?.data) &&
                        dataBatch?.data.length) ||
                        0}{" "}
                      periode
                    </span>
                  </div>
                </div>
                {input.batch._id && (
                  <>
                    <div>
                      <h3 className="text-lg font-bold">Lokasi penanaman</h3>
                      <p>{input?.batch?.transaction?.proposal?.address}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Panen</h3>
                      <p>
                        Penanaman komoditas dimulai tanggal{" "}
                        {dateFormatToIndonesia(input?.batch?.createdAt)}
                      </p>
                      <div>
                        <table>
                          <tbody>
                            <tr>
                              <td>Estimasi</td>
                              <td>
                                <div className="flex flex-row px-4 gap-x-2">
                                  <FaCalendarAlt size={20} />
                                  <span>
                                    {dateFormatToIndonesia(
                                      input?.batch?.estimatedHarvestDate
                                    )}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className="flex flex-row px-4 gap-x-2">
                                  <FaShoppingBasket size={20} />
                                  <span>
                                    {input.batch._id &&
                                      `${input?.batch?.transaction?.proposal?.estimatedTotalHarvest} kilogram`}
                                  </span>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>Hasil</td>
                              <td>
                                <div className="flex flex-row px-4 gap-x-2">
                                  <FaCalendarAlt size={20} />
                                  <span>
                                    {input.batch._id &&
                                      (dataharvest?.data?.createdAt
                                        ? dateFormatToIndonesia(
                                            dataharvest?.data?.createdAt
                                          )
                                        : "Dalam masa penanaman")}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className="flex flex-row px-4 gap-x-2">
                                  <FaShoppingBasket size={20} />
                                  <span>
                                    {input.batch._id &&
                                      (dataharvest?.data?.totalHarvest
                                        ? `${dataharvest?.data?.totalHarvest} kilogram`
                                        : "Dalam masa penanaman")}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="w-full py-1 px-3 bg-[#655C56] text-xl text-white font-bold">
                  Riwayat Perawatan
                </h2>
                <div>
                  <h3 className="text-lg font-bold">
                    Pemilihan riwayat perawatan
                  </h3>
                  <div>
                    Menampilkan riwayat perawatan ke -{" "}
                    <Select
                      className="bg-white"
                      value={input.treatmentRecord.number}
                      inputProps={{
                        className: "py-1",
                      }}
                    >
                      {Array.isArray(dataTreatmentRecord?.data) &&
                        dataTreatmentRecord?.data.map((treatmentRecord) => (
                          <MenuItem
                            key={dataTreatmentRecord.number}
                            value={dataTreatmentRecord.number}
                            onClick={() => {
                              setInput({ ...input, treatmentRecord });
                            }}
                          >
                            {dataTreatmentRecord.number}
                          </MenuItem>
                        ))}
                    </Select>{" "}
                    dari{" "}
                    <span className="font-bold">
                      {(Array.isArray(dataTreatmentRecord?.data) &&
                        dataTreatmentRecord?.data.length()) ||
                        0}{" "}
                      riwayat perawatan
                    </span>
                  </div>
                  {input.treatmentRecord._id && (
                    <div>
                      <h3 className="text-lg font-bold">Catatan perawatan</h3>
                      <div className="flex flex-row gap-6"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Default>
    </>
  );
};
