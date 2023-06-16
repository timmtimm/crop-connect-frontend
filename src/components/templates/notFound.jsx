import Image from "next/image";
import Link from "next/link";

export default (props) => {
  const { urlRedirect, content, redirectPageTitle, customExplanation } = props;

  return (
    <div className=" flex min-w-screen flex-col items-center text-center">
      <Image
        src="/navigation _ location, map, destination, direction, question, lost, need help_lg.png"
        className="mb-16"
        style={{ objectFit: "contain" }}
        width={400}
        height={400}
        alt="Ilustrasi Not Found"
      />
      <h2 className="text-xl font-bold">
        {content || "Konten"} tidak ditemukan
      </h2>
      {customExplanation ? (
        customExplanation
      ) : (
        <Link href={urlRedirect || "/"}>
          <span className="text-[#53A06C]">
            Kembali ke halaman{" "}
            {redirectPageTitle || content.toLowerCase() || "utama"}
          </span>
        </Link>
      )}
    </div>
  );
};
