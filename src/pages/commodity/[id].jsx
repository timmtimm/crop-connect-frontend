import { useRouter } from "next/router";

export default () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1>Commodity: {id}</h1>
    </div>
  );
};
