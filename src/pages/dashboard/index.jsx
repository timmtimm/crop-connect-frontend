import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import { get } from "@/lib/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default () => {
  const router = useRouter();

  return (
    <>
      <Seo title="Dashboard" />
      <Dashboard>asd</Dashboard>
    </>
  );
};
