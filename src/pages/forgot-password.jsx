import Seo from "@/components/elements/seo";
import Auth from "@/components/layouts/auth";
import Head from "next/head";

export default () => {
  return (
    <>
      <Seo title="Lupa Password" />
      <Auth srcBanner="">
        <h1>Forgot Password</h1>
      </Auth>
    </>
  );
};
