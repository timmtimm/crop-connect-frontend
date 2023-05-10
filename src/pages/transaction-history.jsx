import Default from "@/components/layouts/default";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Seo from "@/components/elements/seo";

export default () => {
  const router = useRouter();

  useEffect(() => {
    if (!Cookies.get("token")) {
      router.replace({
        pathname: "/login",
        query: {
          redirect: router.pathname,
        },
      });
    }
  }, []);

  return (
    <>
      <Seo title="Riwayat Transaksi" />
      <Default>
        <div className="flex flex-col gap-4">
          <h1 className="text-lg font-bold">Riwayat Transaksi</h1>
          <div className="w-full bg-white rounded-xl p-4">asd</div>
        </div>
      </Default>
    </>
  );
};
