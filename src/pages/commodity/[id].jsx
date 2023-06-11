import Loading from "@/components/modules/loading";
import Seo from "@/components/elements/seo";
import Default from "@/components/layouts/default";
import { fetcher, triggerfetcher } from "@/lib/axios";
import { runOnce } from "@/lib/swr";
import {
  dateFormatToIndonesia,
  getLastURLSegment,
  setNumberFormat,
  setPriceFormat,
} from "@/utils/utilities";
import {
  Alert,
  Button,
  MenuItem,
  Select,
  Slide,
  Snackbar,
  TextField,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaShoppingBasket } from "react-icons/fa";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper";
import { HttpStatusCode } from "axios";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { roleUser, transactionType } from "@/constant/constant";
import Status, {
  convertStatusForBatch,
  convertStatusForTreatmentRecord,
} from "@/components/elements/status";
import { useProfileUser } from "@/context/profileUserContext";
import { AiOutlineShareAlt } from "react-icons/ai";
import Modal from "@/components/elements/modal";
import QRCode from "react-qr-code";
import { GrClose } from "react-icons/gr";

export default () => {
  const router = useRouter();
  const { id } = router.query;
  const { profileUser } = useProfileUser();

  /* Modal */
  const [openModal, setOpenModal] = useState(false);
  const handleModal = () => setOpenModal(!openModal);

  /* Snackbar */
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  /* State */
  const [input, setInput] = useState({
    proposalTransaction: {},
    batchTransaction: {},
    batch: {},
    treatmentRecord: {},
  });
  const [dataCommodity, setDataCommodity] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const getCommodity = async () => {
    const data = await fetcher(`api/v1/commodity/${id}`, {});

    if (data.status == HttpStatusCode.Ok) {
      setDataCommodity(data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (id) {
      getCommodity();
    }
  }, [id]);

  const { data: dataTotalTransaction, isLoading: totalTransactionLoading } =
    useSWR(
      [`api/v1/transaction/total-commodity/${id}`, {}],
      ([url, params]) => fetcher(url, params),
      runOnce
    );

  const {
    data: dataProposal,
    trigger: triggerProposal,
    isMutating: mutatingProposal,
  } = useSWRMutation(`api/v1/proposal/commodity/${id}`, triggerfetcher);
  const {
    data: dataBatchTransaction,
    trigger: triggerBatchTransaction,
    isMutating: mutatingBatchTransaction,
  } = useSWRMutation(
    `api/v1/batch/transaction/commodity/${id}`,
    triggerfetcher
  );
  const {
    data: dataBatch,
    trigger: triggerBatch,
    isMutating: mutatingBatch,
  } = useSWRMutation(`api/v1/batch/commodity/${id}`, triggerfetcher);

  const {
    data: dataharvest,
    trigger: triggerHarvest,
    isMutating: mutatingHarvest,
  } = useSWRMutation("/api/v1/harvest/batch", triggerfetcher);
  const {
    data: dataTreatmentRecord,
    trigger: triggerTreatmentRecord,
    isMutating: mutatingTreatmentRecord,
  } = useSWRMutation("/api/v1/treatment-record/batch", triggerfetcher);
  const {
    data: dataTotalCommodityFarmer,
    trigger: triggerTotalCommodity,
    isMutating: mutatingTotalCommodity,
  } = useSWRMutation(
    `/api/v1/commodity/farmer-total/${dataCommodity?.data?.farmer?._id}`,
    triggerfetcher
  );
  const {
    data: dataTotalProposal,
    trigger: triggerTotalProposal,
    isMutating: mutatingTotalProposal,
  } = useSWRMutation(
    `/api/v1/proposal/farmer-total/${dataCommodity?.data?.farmer?._id}`,
    triggerfetcher
  );

  /* UseEffect */
  useEffect(() => {
    if (!dataCommodity?.data) return;
    else {
      if (dataCommodity?.data.isPerennials) {
        triggerBatchTransaction();
      } else {
        triggerProposal();
      }

      triggerBatch();
      triggerTotalCommodity({});
      triggerTotalProposal({});
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
        title={
          isLoading
            ? "Loading..."
            : `Komoditas ${
                dataCommodity?.status != HttpStatusCode.Ok
                  ? `Tidak Ditemukan`
                  : `${dataCommodity?.data?.name}`
              }`
        }
      />
      {(mutatingProposal ||
        mutatingBatch ||
        mutatingHarvest ||
        mutatingTotalCommodity ||
        mutatingTreatmentRecord ||
        mutatingTotalProposal ||
        totalTransactionLoading ||
        mutatingProposal ||
        mutatingBatchTransaction ||
        mutatingTotalCommodity ||
        mutatingTotalProposal) && <Loading />}
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Slide}
        autoHideDuration={3000}
        onClose={handleClose}
        message="Berhasil menyalin tautan komoditas"
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Berhasil menyalin tautan komoditas
        </Alert>
      </Snackbar>
      {openModal && (
        <Modal>
          <div className="flex flex-row justify-end gap-4 items-center mb-4 w-full">
            <h2 className="text-xl text-center font-bold">
              Sebar tautan komoditas ini
            </h2>
            <GrClose
              className="cursor-pointer"
              size={20}
              onClick={handleModal}
            />
          </div>
          <div className="w-full flex flex-row items-center rounded p-2 bg-gray-200 mb-4">
            <div className="flex flex-wrap mr-2">
              <img
                className="h-12 w-12 rounded object-cover"
                src={
                  Array.isArray(dataCommodity?.data?.imageURLs) &&
                  dataCommodity?.data?.imageURLs[0]
                    ? dataCommodity?.data?.imageURLs[0]
                    : "/logo.png"
                }
              />
            </div>
            <span className="truncate w-2/3 font-semibold cursor-default">
              {dataCommodity?.data?.name}
            </span>
          </div>
          <QRCode value={process.env.APP_DOMAIN + router.asPath} />
          <div class="inline-flex items-center justify-center w-full">
            <hr class="w-full bg-black h-[1px] my-6 border-0 rounded" />
            <div class="absolute px-4 -translate-x-1/2 bg-white left-1/2">
              <span className="font-semibold">Atau</span>
            </div>
          </div>
          <Button
            className="bg-[#53A06C] hover:bg-[#53A06C] w-full text-white normal-case font-bold"
            onClick={() => {
              navigator.clipboard.writeText(
                process.env.APP_DOMAIN + router.asPath
              );
              handleModal();
              handleClick();
            }}
          >
            Salin Tautan
          </Button>
        </Modal>
      )}
      <Default>
        {!isLoading && dataCommodity?.status != HttpStatusCode.Ok && (
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
        )}
        {!isLoading && dataCommodity?.status == HttpStatusCode.Ok && (
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col lg:flex-row items-start gap-5">
              <div className="w-full lg:w-fit flex justify-center ">
                <div className="max-w-[20rem] sm:max-w-[28rem]">
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
                          <div className="h-[300px] w-full">
                            <img
                              src={image}
                              className="h-full w-full object-cover"
                            />
                          </div>
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
                          <div className="h-[80px]">
                            <img
                              src={image}
                              className="h-full w-full object-cover"
                            />
                          </div>
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
                        {setNumberFormat(
                          Math.floor(dataTotalTransaction?.data?.totalWeight)
                        )}{" "}
                        kilogram
                      </span>{" "}
                      dari{" "}
                      <span className="font-bold">
                        {setNumberFormat(
                          dataTotalTransaction?.data?.totalTransaction
                        )}{" "}
                        transaksi
                      </span>
                    </p>
                    <div className="flex flex-row justify-between gap-4">
                      <h2 className="text-2xl font-bold mt-4 mb-5">
                        {setPriceFormat(dataCommodity?.data?.pricePerKg)} /
                        kilogram
                      </h2>
                      <div
                        className="flex flex-row items-center gap-2 cursor-pointer"
                        onClick={handleModal}
                      >
                        <AiOutlineShareAlt size={20} />
                        <span className="font-semibold">Sebar</span>
                      </div>
                    </div>
                  </div>
                  {dataCommodity?.data?.isAvailable ? (
                    <div className="flex flex-col gap-y-2">
                      {dataCommodity?.data?.isPerennials ? (
                        <>
                          <h3 className="text-xl font-bold mt-3">
                            Periode Transaksi
                          </h3>
                          <div className="flex flex-row flex-wrap gap-2 mt-2 mb-4">
                            {dataBatchTransaction?.data == null ? (
                              <div className="flex w-full justify-center items-center">
                                <span className="text-xl text-center mt-4">
                                  Komoditas ini tidak memiliki periode transaksi
                                </span>
                              </div>
                            ) : (
                              dataBatchTransaction?.data?.map((batch) => (
                                <button
                                  value={batch?._id}
                                  className={`py-1 px-3 border-2 rounded-lg cursor-pointer hover:border-[#53A06C] hover:text-[#53A06C] ${
                                    !batch.isAvailable &&
                                    batch._id != input.batchTransaction._id
                                      ? "text-[#AAB4C8] bg-[#F0F3F7] cursor-default border-gray-200"
                                      : batch._id == input.batchTransaction._id
                                      ? "border-[#53A06C] text-[#53A06C] bg-[#53A06C]/[.05]"
                                      : "border-gray-600"
                                  } `}
                                  onClick={() => {
                                    setInput({
                                      ...input,
                                      batchTransaction: batch,
                                    });
                                  }}
                                >
                                  {batch?.name}
                                </button>
                              ))
                            )}
                          </div>
                          {input.batchTransaction._id && (
                            <>
                              <h4 className="text-lg font-bold">
                                Deskripsi Proposal
                              </h4>
                              <span>
                                Deskripsi:{" "}
                                <span className="font-bold">
                                  {input?.batchTransaction.proposal
                                    .description || "Tidak ada deskripsi"}
                                </span>
                              </span>
                              <span>
                                Alamat lahan:{" "}
                                <span className="font-bold">
                                  {input?.batchTransaction.proposal.address}
                                </span>
                              </span>
                              <span>
                                Estimasi berat panen:{" "}
                                <span className="font-bold">
                                  {input?.batchTransaction.proposal
                                    .estimatedTotalHarvest &&
                                    `${input?.batchTransaction.proposal.estimatedTotalHarvest} kilogram`}
                                </span>
                              </span>
                              <h4 className="text-lg font-bold">
                                Deskripsi Periode
                              </h4>
                              <span>
                                Tanggal tanam:{" "}
                                <span className="font-bold">
                                  {dateFormatToIndonesia(
                                    input?.batchTransaction.createdAt
                                  )}
                                </span>
                              </span>
                              <div className="flex flex-row items-center">
                                <span className="mr-2">Status:</span>
                                {
                                  <Status
                                    type={convertStatusForBatch(
                                      input?.batchTransaction.status
                                    )}
                                    status={input?.batchTransaction.status}
                                  />
                                }
                              </div>
                              <span>
                                Estimasi Tanggal Panen:{" "}
                                <span className="font-bold">
                                  {dateFormatToIndonesia(
                                    input?.batchTransaction.estimatedHarvestDate
                                  )}
                                </span>
                              </span>
                              <span className="font-bold">
                                Total:{" "}
                                {input.batchTransaction.proposal
                                  .estimatedTotalHarvest &&
                                  setPriceFormat(
                                    dataCommodity?.data?.pricePerKg *
                                      input.batchTransaction.proposal
                                        .estimatedTotalHarvest
                                  )}
                              </span>
                              {input.batchTransaction.isAvailable ? (
                                <Link
                                  href={{
                                    pathname: `/transaction/${input.batchTransaction._id}`,
                                    query: {
                                      transactionType: dataCommodity?.data
                                        .isPerennials
                                        ? transactionType.perennials
                                        : transactionType.annuals,
                                    },
                                  }}
                                >
                                  <Button
                                    className={`w-full bg-[#52A068] normal-case font-bold mt-2 ${
                                      profileUser.role != roleUser.buyer &&
                                      "hidden"
                                    }`}
                                    disabled={
                                      input.batchTransaction._id &&
                                      input.batchTransaction.isAvailable
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
                                    input.batchTransaction._id &&
                                    input.batchTransaction.isAvailable
                                      ? false
                                      : true
                                  }
                                >
                                  Lanjutkan Transaksi
                                </Button>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <h3 className="text-xl font-bold mt-3">
                            Proposal Transaksi
                          </h3>
                          <div className="flex flex-row flex-wrap gap-2 mt-2 mb-4">
                            {dataProposal?.data == null ? (
                              <div className="flex w-full justify-center items-center">
                                <span className="text-xl text-center mt-4">
                                  Komoditas ini tidak memiliki proposal
                                  transaksi
                                </span>
                              </div>
                            ) : (
                              dataProposal?.data?.map((proposal) => (
                                <button
                                  value={proposal?._id}
                                  className={`py-1 px-3 border-2 rounded-lg cursor-pointer hover:border-[#53A06C] hover:text-[#53A06C] ${
                                    !proposal.isAvailable &&
                                    proposal._id !=
                                      input.proposalTransaction._id
                                      ? "text-[#AAB4C8] bg-[#F0F3F7] cursor-default border-gray-200"
                                      : proposal._id ==
                                        input.proposalTransaction._id
                                      ? "border-[#53A06C] text-[#53A06C] bg-[#53A06C]/[.05]"
                                      : "border-gray-600"
                                  } `}
                                  onClick={() => {
                                    setInput({
                                      ...input,
                                      proposalTransaction: proposal,
                                    });
                                  }}
                                >
                                  {proposal?.name}
                                </button>
                              ))
                            )}
                          </div>
                          {input.proposalTransaction._id && (
                            <>
                              <h4 className="text-lg font-bold">
                                Deskripsi Proposal
                              </h4>
                              <span>
                                Deskripsi:{" "}
                                <span className="font-bold">
                                  {input?.proposalTransaction.description}
                                </span>
                              </span>
                              <span>
                                Alamat lahan:{" "}
                                <span className="font-bold">
                                  {input?.proposalTransaction.address}
                                </span>
                              </span>
                              <span>
                                Estimasi berat panen:{" "}
                                <span className="font-bold">
                                  {input?.proposalTransaction
                                    .estimatedTotalHarvest &&
                                    `${input?.proposalTransaction.estimatedTotalHarvest} kilogram`}
                                </span>
                              </span>
                              <span className="font-bold">
                                Total:
                                {input.proposalTransaction
                                  .estimatedTotalHarvest &&
                                  setPriceFormat(
                                    dataCommodity?.data?.pricePerKg *
                                      input.proposalTransaction
                                        ?.estimatedTotalHarvest
                                  )}
                              </span>
                              {input.proposalTransaction.isAvailable ? (
                                <Link
                                  href={{
                                    pathname: `/transaction/${input.proposalTransaction._id}`,
                                    query: {
                                      transactionType: dataCommodity?.data
                                        .isPerennials
                                        ? transactionType.perennials
                                        : transactionType.annuals,
                                    },
                                  }}
                                >
                                  <Button
                                    className="w-full bg-[#52A068] normal-case font-bold mt-2"
                                    disabled={
                                      input.proposalTransaction._id &&
                                      input.proposalTransaction.isAvailable
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
                                    input.proposalTransaction._id &&
                                    input.proposalTransaction.isAvailable
                                      ? false
                                      : true
                                  }
                                  variant="contained"
                                >
                                  Lanjutkan Transaksi
                                </Button>
                              )}
                            </>
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
                      Proposal: {JSON.stringify(dataTotalProposal?.data)}{" "}
                      proposal
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
                  <p>
                    {setNumberFormat(dataCommodity?.data?.plantingPeriod)} hari
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="w-full py-1 px-3 bg-[#655C56] text-xl text-white font-bold">
                  Periode Penanaman
                </h2>
                <div>
                  <h3 className="text-lg font-bold">Pemilihan periode</h3>
                  <div>
                    Menampilkan periode penanaman{" "}
                    <Select
                      className="bg-white"
                      value={input.proposalTransaction.name}
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
                    <span className="font-semibold">
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
                      <p>{input?.batch?.proposal?.address}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Panen</h3>
                      <p>
                        Penanaman komoditas dimulai tanggal{" "}
                        <span className="font-semibold">
                          {dateFormatToIndonesia(input?.batch?.createdAt)}
                        </span>
                      </p>
                      <table>
                        <tbody>
                          <tr>
                            <td>Estimasi</td>
                            <td>
                              <div className="flex flex-row px-1 sm:px-4 gap-x-2 items-center">
                                <FaCalendarAlt size={20} />
                                <span>
                                  {dateFormatToIndonesia(
                                    input?.batch.estimatedHarvestDate
                                  )}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="flex flex-row px-1 sm:px-4 gap-x-2 items-center">
                                <FaShoppingBasket size={20} />
                                <span>
                                  {input.batch._id &&
                                    `${setNumberFormat(
                                      input?.batch?.proposal
                                        .estimatedTotalHarvest
                                    )} kilogram`}
                                </span>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>Hasil</td>
                            <td>
                              <div className="flex flex-row px-1 sm:px-4 gap-x-2 items-center">
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
                              <div className="flex flex-row px-1 sm:px-4 gap-x-2 items-center">
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
                    {dataharvest?.data?.harvest && (
                      <>
                        <div>
                          <h3 className="text-lg font-semibold">Kondisi</h3>
                          <p>{dataharvest?.data?.condition}</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            Gambar dan Catatan Panen
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.isArray(dataharvest?.data?.harvest) &&
                              dataharvest?.data?.harvest?.map((item, index) => (
                                <div
                                  key={index}
                                  className="w-full flex flex-col rounded-lg p-3 gap-2 bg-gray-200"
                                >
                                  <h4 className="font-bold text-center">
                                    Gambar {index + 1}
                                  </h4>
                                  <div className="w-full flex flex-row items-start justify-between gap-2">
                                    <div>
                                      <img
                                        className="rounded"
                                        src={item.imageURL}
                                      />
                                    </div>
                                  </div>
                                  <div className="w-full p-2 bg-white rounded-md">
                                    <span className="font-semibold mb-2">
                                      Catatan
                                    </span>
                                    <br />
                                    {item.note}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </>
                    )}
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
                        className: `py-1 ${
                          input.treatmentRecord?.warningNote && "text-red-500"
                        }`,
                      }}
                    >
                      {Array.isArray(dataTreatmentRecord?.data) &&
                        dataTreatmentRecord?.data.map((treatmentRecord) => (
                          <MenuItem
                            className={`${
                              treatmentRecord?.warningNote && "text-red-500"
                            }`}
                            key={treatmentRecord.number}
                            value={treatmentRecord.number}
                            onClick={() => {
                              setInput({ ...input, treatmentRecord });
                            }}
                          >
                            {treatmentRecord.number}
                          </MenuItem>
                        ))}
                    </Select>{" "}
                    <span className="font-semibold">
                      {(Array.isArray(dataTreatmentRecord?.data) &&
                        dataTreatmentRecord?.data.length) ||
                        0}{" "}
                      riwayat perawatan
                    </span>
                  </div>
                  {input.treatmentRecord._id && (
                    <div>
                      <h3 className="text-lg font-bold mt-4 mb-2">
                        Catatan perawatan
                      </h3>
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold">Instruksi</h3>
                        <span>Tanggal Pengisian: </span>
                        <span>
                          {dateFormatToIndonesia(input.treatmentRecord?.date)}
                        </span>
                        <h4>Deskripsi</h4>
                        <p>{input.treatmentRecord?.description}</p>
                      </div>
                      {input.treatmentRecord?.warningNote && (
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold">
                            Catatan Peringatan
                          </h3>
                          <p>{input.treatmentRecord?.warningNote}</p>
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
                                <div className="w-full flex flex-row items-start justify-between gap-2">
                                  <div>
                                    <img
                                      className="rounded"
                                      src={item.imageURL}
                                    />
                                  </div>
                                </div>
                                <div className="w-full p-2 bg-white rounded-md">
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
            </div>
          </div>
        )}
      </Default>
    </>
  );
};
