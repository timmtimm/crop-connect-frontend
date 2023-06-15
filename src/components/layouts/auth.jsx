import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default (props) => {
  const { altBanner, srcBanner, children } = props;
  const router = useRouter();

  useEffect(() => {
    if (Cookies.get("token")) {
      router.replace("/");
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
      <section className="relative md:p-16 lg:p-20 xl:p-32 hidden flex-col lg:flex">
        <div className="relative h-full w-full">
          <Image
            src={srcBanner}
            fill
            style={{ objectFit: "contain" }}
            alt={"Ilustrasi " + altBanner}
          />
        </div>
      </section>
      <section className="bg-[#2C5456] overflow-hidden">
        <div className="flex flex-col overflow-y-scroll h-full w-full">
          <div className="grow flex flex-col justify-center items-center py-8 px-8 md:px-16">
            <div className="mb-8 w-1/3 md:w-2/5">
              <Link href={"/"}>
                <Image
                  className="mx-auto"
                  src={"/logo.svg"}
                  width={160}
                  height={160}
                  alt="Logo Crop Connect"
                />
              </Link>
            </div>
            <div className="rounded-xl flex flex-col gap-4 bg-white p-6 pb-8 drop-shadow-md divide-y-2 w-full">
              {children}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
