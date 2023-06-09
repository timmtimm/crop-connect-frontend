import Image from "next/image";
import Default from "@/components/layouts/default";
import Seo from "@/components/elements/seo";
import { Button } from "@mui/material";
import { BsArrowRight, BsPersonHeart } from "react-icons/bs";
import Link from "next/link";
import { GiFarmTractor, GiFarmer, GiPlantSeed } from "react-icons/gi";
import { SiOpenaccess } from "react-icons/si";
import { FaExchangeAlt, FaMoneyBillWave, FaSearch } from "react-icons/fa";
import { RiShoppingCartLine } from "react-icons/ri";
import { TbReportSearch } from "react-icons/tb";
import { AiFillEye } from "react-icons/ai";
import { BiHappy } from "react-icons/bi";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { VscVerified } from "react-icons/vsc";

const reason = [
  {
    title: "Penanaman dipantau oleh ahli",
    icon: <SiOpenaccess className="text-6xl text-[#52A068]" />,
  },
  {
    title: "Kualitas komoditas terjamin",
    icon: <GiPlantSeed className="text-6xl text-[#52A068]" />,
  },
  {
    title: "Harga yang kompetitif",
    icon: <FaMoneyBillWave className="text-6xl text-[#52A068]" />,
  },
  {
    title: "Dukungan terhadap petani lokal",
    icon: <GiFarmTractor className="text-6xl text-[#52A068]" />,
  },
];

const ways = [
  {
    title: "Pilih komoditas",
    description: "Pilih komoditas yang Anda inginkan",
    icon: <FaSearch className="text-6xl text-[#52A068]" />,
  },
  {
    title: "Lihat riwayat perawatan",
    description:
      "Lihat riwayat perawatan komoditas, apakah sesuai dengan standar yang Anda inginkan",
    icon: <TbReportSearch className="text-6xl text-[#52A068]" />,
  },
  {
    title: "Lakukan transaksi",
    description:
      "Lakukan transaksi komoditas berdasarkan periode penanaman atau proposal",
    icon: <FaExchangeAlt className="text-6xl text-[#52A068]" />,
  },
  {
    title: "Pantau periode",
    description:
      "Validator akan memantau periode penanaman dan memastikan kualitas komoditas yang Anda beli",
    icon: <AiFillEye className="text-6xl text-[#52A068]" />,
  },
  {
    title: "Dapatkan komoditas",
    description:
      "Dapatkan komoditas setelah panen terverifikasi oleh validator",
    icon: <BiHappy className="text-6xl text-[#52A068]" />,
  },
];

const role = [
  {
    title: "Pembeli",
    icon: <RiShoppingCartLine className="text-6xl text-[#52A068]" />,
  },
  {
    title: "Petani",
    icon: <GiFarmer className="text-6xl text-[#52A068]" />,
  },
  {
    title: "Validator",
    icon: <VscVerified className="text-6xl text-[#52A068]" />,
  },
];

export default () => {
  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  return (
    <>
      <Seo />
      <Default homepage={true}>
        {domLoaded && (
          <div className="flex flex-col w-full gap-10 lg:gap-24 mb-10 cursor-default">
            <div className="w-full bg-[#EDECE3] py-8 lg:py-16 px-8">
              <div className="container mx-auto flex lg:flex-row flex-col-reverse justify-center items-cnter lg:justify-between items-center gap-0 md:gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-center lg:text-left mb-2 md:mb-4">
                    Selamat datang di{" "}
                    <span
                      className="text-[#52A068] underline decoration-solid cursor-pointer"
                      onClick={() =>
                        navigator.clipboard.writeText(process.env.APP_DOMAIN)
                      }
                    >
                      Crop Connect
                    </span>
                  </h1>
                  <h2 className="text-2xl md:text-xl lg:text-2xl xl:text-3xl font-bold text-center lg:text-left">
                    Platform Marketplace untuk{" "}
                    <span className="text-[#2C5456]">
                      {" "}
                      Komoditas Pertanian Segar{" "}
                    </span>
                  </h2>
                  <p className="hidden md:block md:text-md lg:text-lg my-6">
                    Kami berkomitmen untuk menghubungkan petani dengan pembeli
                    komoditas pertanian secara langsung, memungkinkan Anda
                    mendapatkan komoditas pertanian segar langsung dari
                    sumbernya dengan harga terbaik. Crop Connect menjadi
                    jembatan yang menghubungkan petani yang terpercaya di
                    seluruh Indonesia dengan Anda.
                  </p>
                  {!Cookies.get("token") && (
                    <div className="flex justify-center lg:justify-start mt-4 md:mt-0">
                      <Link href="/register">
                        <Button
                          className="bg-[#52A068] text-lg normal-case font-semibold lg:font-bold mb-3 rounded-3xl"
                          variant="contained"
                          type="submit"
                        >
                          Bergabung
                          <span className="hidden sm:ml-1 sm:block">
                            dengan kami
                          </span>
                          <BsPersonHeart className="ml-2" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
                <div className="flex justify-center w-full min-w-[20rem] md:min-w-[24rem] lg:min-w-[36rem]">
                  <Image
                    src="/agriculture _ woman, gardening, plants, plant, pots, house plants_lg.png"
                    width={600}
                    height={600}
                    alt="Hero Crop Connect"
                  />
                </div>
              </div>
            </div>
            <div className="container mx-auto px-2">
              <h1 className="text-3xl font-bold text-center">
                Mengapa menggunakan Crop Connect?
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                {reason.map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-[#EDECE3] flex justify-center items-center">
                      {item.icon}
                    </div>
                    <h2 className="text-xl lg:text-2xl font-semibold text-center">
                      {item.title}
                    </h2>
                  </div>
                ))}
              </div>
            </div>
            <div
              className={`container mx-auto ${
                Cookies.get("token") ? "mb-10" : ""
              } px-2`}
            >
              <h1 className="text-3xl font-bold text-center">
                Bagaimana cara kerja Crop Connect?
              </h1>
              <p className="text-lg mt-6 md:my-6 text-center">
                Memulai dengan Crop Connect sangatlah mudah. Cari komoditas yang
                Anda inginkan, lakukan pembelian dengan cepat. Kami menjamin
                kualitas komoditas yang Anda beli dengan memantau penanaman
                secara langsung oleh ahlinya.
              </p>
              <div className="flex flex-row justify-center flex-wrap gap-4 mt-10">
                {ways.map((item, index) => (
                  <>
                    <div
                      key={index}
                      className="flex flex-col items-center bg-[#EDECE3] p-6 gap-2 rounded-xl grow shrink basis-0 shadow-md min-w-[12rem]"
                    >
                      <span className="text-2xl font-semibold">
                        {index + 1}
                      </span>
                      {item.icon}
                      <h2 className="lg:text-xl font-semibold text-center">
                        {item.title}
                      </h2>
                      <p className="lg:text-lg text-center">
                        {item.description}
                      </p>
                    </div>
                    {index !== ways.length - 1 && (
                      <div className="hidden xl:flex flex-col justify-center items-center">
                        <BsArrowRight className="text-4xl text-gray-500" />
                      </div>
                    )}
                  </>
                ))}
              </div>
            </div>
            {!Cookies.get("token") && (
              <div className="w-full">
                <div className="container mx-auto flex flex-col lg:flex-row justify-center lg:justify-between items-center text-center">
                  <div className="min-w-[16rem] md:min-w-[24rem] lg:min-w-[30rem] mr-8">
                    <Image
                      src="/e-commerce, shopping _ shop, purchase, store, check out, shopping bags, woman_lg.png"
                      width={450}
                      height={450}
                      alt="Ilustrasi Bergabung Ke CropConnect"
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">
                      Bergabunglah dengan kami
                    </h1>
                    <p className="text-lg my-6">
                      Bersama dengan Crop Connect, temukan kenyamanan serta
                      kualitas dalam berbelanja komoditas pertanian segar.
                      Bersama-sama, mari kita dukung pertanian lokal dan petani
                      Indonesia.
                    </p>
                    <div className="flex flex-row justify-center gap-6">
                      {role.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center bg-[#EDECE3] p-6 gap-2 rounded-xl grow shrink basis-0 shadow-md"
                        >
                          {item.icon}
                          <h2 className="text-xl font-semibold text-center">
                            {item.title}
                          </h2>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Default>
    </>
  );
};
