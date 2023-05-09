import Head from "next/head";
import { useRouter } from "next/router";

export default (props) => {
  const router = useRouter();
  const { title, description } = props;

  const defaultMeta = {
    title: title
      ? `${title} | Crop Connect`
      : "Crop Connect: Dapatkan produk pertanian segar langsung dari sumbernya",
    description:
      description ||
      "Crop Connect adalah platform marketplace yang menghubungkan petani dengan pembeli produk pertanian secara langsung. Dapatkan produk pertanian segar langsung dari sumbernya dengan harga terbaik. Temukan berbagai macam produk pertanian dari petani terpercaya di seluruh Indonesia",
    url: `${process.env.APP_DOMAIN}${router.asPath}`,
    type: "website",
    image: "/favicon.ico",
  };

  return (
    <Head>
      <title>{defaultMeta.title}</title>
      <meta name="description" content={defaultMeta.description} />
      <meta property="og:title" content={defaultMeta.title} />
      <meta property="og:description" content={defaultMeta.description} />
      <meta property="og:url" content={defaultMeta.url} />
      <meta property="og:type" content={defaultMeta.type} />
      <link rel="icon" href={defaultMeta.image} />
    </Head>
  );
};
