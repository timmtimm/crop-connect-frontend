import Image from "next/image";
import Link from "next/link";
import { setPriceFormat } from "@/utils/utilities.js";
import { TbPlant } from "react-icons/tb";
import { MdLocationOn } from "react-icons/md";
import { GiFarmer } from "react-icons/gi";
import { ImPriceTag } from "react-icons/im";

export default (props) => {
  const { type, data, withName } = props;

  return (
    <div className="cursor-pointer shadow rounded-lg hover:scale-105 transition bg-[#EDECE3] text-gray-700">
      {type == "komoditas" ? (
        <Link href={`/commodity/${data._id}`}>
          <div
            className={`pt-[75%] relative ${
              !data.imageURLs[0] ? "bg-white rounded-lg" : ""
            }`}
          >
            <Image
              className="rounded-lg"
              src={data.imageURLs[0] ? data.imageURLs[0] : "/logo.png"}
              fill
              style={{ objectFit: "cover" }}
              alt={
                data.imageURLs[0]
                  ? `Gambar Komoditas ${data.name}`
                  : "Ilustrasi Komoditas"
              }
            />
            {!data.isAvailable && (
              <div className="absolute inset-0 bg-gray-700/60 text-white rounded-lg flex items-center justify-center font-bold">
                Tidak tersedia
              </div>
            )}
          </div>

          <div className="flex flex-col pt-2 p-4">
            <div className="flex flex-row items-center gap-1">
              <TbPlant size={15} />
              <span className=" text-md md:text-lg truncate">{data.name}</span>
            </div>
            <span className="flex flex-row gap-1 items-center font-semibold ">
              <ImPriceTag size={15} />
              <span className="text-sm sm:text-base">
                {setPriceFormat(data.pricePerKg)} / kg
              </span>
            </span>
            <div
              className={` text-base truncate flex flex-row items-center gap-1 ${
                !withName && "hidden"
              }`}
            >
              <GiFarmer size={15} />
              <span>{data.farmer.name}</span>
            </div>
            <div className="flex flex-row gap-1 items-center  ">
              <MdLocationOn size={15} />
              <span className="truncate text-sm sm:text-base">
                {data.farmer.region.province}
              </span>
            </div>
          </div>
        </Link>
      ) : (
        <Link href={`/farmer/${data._id}`}>
          <div className="flex flex-col w-full p-5">
            <span className="font-bold">{data.name}</span>
            <span className="">{data.region.province}</span>
            <span className="truncate">
              {data.description || "Tidak ada deskripsi"}
            </span>
          </div>
        </Link>
      )}
    </div>
  );
};
