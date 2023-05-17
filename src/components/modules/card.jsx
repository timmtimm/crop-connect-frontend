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
          <div className="max-w-[17rem]">
            <Image
              className="max-h-60"
              src={
                data.imageURLs[0]
                  ? data.imageURLs[0]
                  : "/logo-no-background-white.png"
              }
              width={270}
              height={250}
              alt=""
            />

            <div className="flex flex-col p-5">
              <div className="flex flex-row items-center gap-1">
                <TbPlant size={15} />
                <span className="text-white text-xl truncate">{data.name}</span>
              </div>
              <span className="flex flex-row gap-1 items-center font-bold text-white">
                <ImPriceTag size={10} />
                <span className="text-base">
                  {setPriceFormat(data.pricePerKg)} / kg
                </span>
              </span>
              <div
                className={`text-white text-base truncate flex flex-row items-center gap-1 ${
                  !withName && "hidden"
                }`}
              >
                <GiFarmer />
                <span>{data.farmer.name}</span>
              </div>
              <div className="flex flex-row gap-1 items-center text-white text-base">
                <MdLocationOn />
                <span className="truncate">{data.farmer.region.province}</span>
              </div>
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
