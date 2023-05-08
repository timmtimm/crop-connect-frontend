import Image from "next/image";
import Link from "next/link";

export default (props) => {
  const { altBanner, srcBanner, children } = props;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <section className="relative p-32 hidden min-h-screen flex-col lg:flex">
        <div className="relative h-full w-full">
          <Image
            src={srcBanner}
            fill
            style={{ objectFit: "contain" }}
            alt={"Ilustrasi " + altBanner}
          />
        </div>
      </section>
      <section className="flex flex-col justify-center min-h-screen bg-[#2C5456] overflow-y-scroll max-h-screen">
        <div className="min-h-0 my-2 mx-8 md:my-4 md:mx-16">
          <div className="mx-auto mb-8 w-1/2 md:w-2/5">
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
          <div className="rounded-xl flex flex-col gap-4 bg-white p-6 pb-8 shadow-custom divide-y-2">
            {children}
          </div>
        </div>
      </section>
    </div>
  );
};
