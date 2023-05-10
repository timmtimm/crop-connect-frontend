import Seo from "@/components/elements/seo";
import Default from "@/components/layouts/default";
import { useRouter } from "next/router";

export default () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      {/* <Seo title={`Komoditas ${profileFarmer?.data?.name}`} /> */}
      <Default>
        <h1>Commodity: {id}</h1>
      </Default>
    </>
  );
};
