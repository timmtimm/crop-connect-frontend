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
    <div className="cursor-pointer shadow rounded-lg hover:bg-[#161D22] bg-[#222C34] text-white">
      {type == "komoditas" ? (
        <Link href={`/commodity/${data._id}`}>
          <div className="pt-[75%] relative">
            <Image
              className="rounded-lg"
              src={
                data.imageURLs[0]
                  ? data.imageURLs[0]
                  : "/logo-no-background-white.png"
              }
              fill
              style={{ objectFit: "cover" }}
              alt={
                data.imageURLs[0]
                  ? `Gambar Komoditas ${data.name}`
                  : "Ilustrasi Komoditas"
              }
            />
          </div>

          <div className="flex flex-col pt-2 p-4">
            <div className="flex flex-row items-center gap-1">
              <TbPlant size={15} />
              <span className="text-white text-md md:text-xl truncate">
                {data.name}
              </span>
            </div>
            <span className="flex flex-row gap-1 items-center font-bold text-white">
              <ImPriceTag size={15} />
              <span className="text-sm sm:text-base">
                {setPriceFormat(data.pricePerKg)} / kg
              </span>
            </span>
            <div
              className={`text-white text-base truncate flex flex-row items-center gap-1 ${
                !withName && "hidden"
              }`}
            >
              <GiFarmer size={15} />
              <span>{data.farmer.name}</span>
            </div>
            <div className="flex flex-row gap-1 items-center text-white ">
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
