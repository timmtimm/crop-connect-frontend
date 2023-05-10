import Image from "next/image";
import Default from "@/components/layouts/default";
import { Inter } from "next/font/google";
import Seo from "@/components/elements/seo";

export default () => {
  return (
    <>
      <Seo />
      <Default>
        <div className="container mx-auto">home page</div>
      </Default>
    </>
  );
};
