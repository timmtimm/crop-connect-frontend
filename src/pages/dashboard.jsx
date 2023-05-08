import Default from "@/components/layouts/default";
import { get } from "@/lib/axios";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default () => {
  const router = useRouter();
  const checkRole = async () => {
    const { data } = await get("/api/v1/user/profile");

    console.log(data);

    if (data) {
      if (data?.role == "buyer") {
        router.replace("/");
      }
    }
  };

  useEffect(() => {
    checkRole();
  }, []);

  return <Default>dashboard</Default>;
};
