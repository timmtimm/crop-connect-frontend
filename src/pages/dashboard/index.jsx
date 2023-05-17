import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import { useProfileUser } from "@/context/profileUserContext";
import { get } from "@/lib/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default () => {
  const router = useRouter();
  const { profileUser } = useProfileUser();

  /* State */
  const [statistic, setStatistic] = useState({});

  /* Fetch */
  const getStatistic = async () => {
    // switch(profileUser?.role) {
  };

  return (
    <>
      <Seo title="Dashboard" />
      <Dashboard>asd</Dashboard>
    </>
  );
};
