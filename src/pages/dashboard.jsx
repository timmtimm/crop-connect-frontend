import Seo from "@/components/elements/seo";
import Default from "@/components/layouts/default";
import { get } from "@/lib/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default () => {
  const router = useRouter();
  const checkRole = async () => {
    const { data } = await get("/api/v1/user/profile");

    if (data) {
      if (data?.role == "buyer") {
        router.replace("/");
      }
    }
  };

  useEffect(() => {
    if (!Cookies.get("token")) {
      router.replace({
        pathname: "/login",
        query: {
          redirect: router.pathname,
        },
      });
    } else {
      checkRole();
    }
  }, []);

  return (
    <>
      <Seo title="Dashboard" />
      <Default>dashboard</Default>
    </>
  );
};
