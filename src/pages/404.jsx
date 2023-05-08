import Default from "@/components/layouts/default";
import Image from "next/image";
import Link from "next/link";

export default () => {
  return (
    <Default>
      <div className=" flex min-w-screen flex-col items-center text-center">
        <Image
          src="/navigation _ location, map, destination, direction, question, lost, need help_lg.png"
          className="mb-16"
          style={{ objectFit: "contain" }}
          width={400}
          height={400}
          alt="Ilustrasi Not Found"
        ></Image>
        <span className="text-2xl font-bold">
          Halaman yang kamu cari tidak dapat ditemukan
        </span>
        <Link href="/">
          <span className="text-[#53A06C]">Kembali ke halaman utama</span>
        </Link>
        <span></span>
      </div>
    </Default>
  );
};
