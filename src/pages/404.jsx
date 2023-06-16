import Seo from "@/components/elements/seo";
import Default from "@/components/layouts/default";
import NotFound from "@/components/templates/notFound";
import Image from "next/image";
import Link from "next/link";

export default () => {
  return (
    <>
      <Seo title="Halaman Tidak Ditemukan" />
      <Default>
        <NotFound content="Halaman" redirectPageTitle="utama" />
      </Default>
    </>
  );
};
