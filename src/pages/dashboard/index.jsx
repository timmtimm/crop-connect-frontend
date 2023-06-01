import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import StatisticCard from "@/components/modules/statisticCard";
import { roleUser } from "@/constant/constant";
import { useProfileUser } from "@/context/profileUserContext";
import { get } from "@/lib/axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { GiClockwiseRotation } from "react-icons/gi";
import { TbMoneybag, TbPlant, TbUsers } from "react-icons/tb";
import { RiShoppingCartLine } from "react-icons/ri";
import { BsBag } from "react-icons/bs";
import { SumObjectByKey } from "@/utils/utilities";
import { HttpStatusCode } from "axios";
import { FaUserCheck } from "react-icons/fa";
import Loading from "@/components/modules/loading";

export default () => {
  const router = useRouter();
  const { profileUser, checkRole, isLoadingProfile, isAuthenticated } =
    useProfileUser();

  /* State */
  const [statisticCard, setStatisticCard] = useState([]);
  const [statisticGraph, setStatisticGraph] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* Function */
  const setColorForIcon = (differences) =>
    differences >= 1 ? "text-green-500" : "text-red-500";

  const setBgColorForIcon = (differences) =>
    differences >= 1 ? "bg-green-100" : "bg-red-100";

  const countDifferences = (now, last) => {
    const lastDivider = last == 0 ? 1 : last;
    return (now - last) / lastDivider;
  };

  /* Fetch */
  const getStatistic = async () => {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    let tempStatisticCard = [];
    let tempStatisticGraph = [];

    if (profileUser?.role == roleUser.admin) {
      /* Fetch Statistic For Card */
      const dataTotalCommodityNow = await get(
        "/api/v1/commodity/statistic-total",
        {
          year,
        }
      );
      const dataTotalCommodityLastYear = await get(
        "/api/v1/commodity/statistic-total",
        {
          year: year - 1,
        }
      );

      if (
        dataTotalCommodityNow.status == HttpStatusCode.Ok &&
        dataTotalCommodityLastYear.status == HttpStatusCode.Ok
      ) {
        const diff = countDifferences(
          dataTotalCommodityNow.data,
          dataTotalCommodityLastYear.data
        );
        tempStatisticCard.push({
          content: "Komoditas",
          total: dataTotalCommodityNow.data,
          icon: <TbPlant className={setColorForIcon(diff)} size={25} />,
          bgColor: setBgColorForIcon(diff),
          differences: diff,
          timeBased: "tahun",
        });
      }

      const dataTotalBatchNow = await get("/api/v1/batch/statistic-total", {
        year,
      });
      const dataTotalBatchLastYear = await get(
        "/api/v1/commodity/statistic-total",
        {
          year: year - 1,
        }
      );

      if (
        dataTotalBatchNow.status == HttpStatusCode.Ok &&
        dataTotalBatchLastYear.status == HttpStatusCode.Ok
      ) {
        const diff = countDifferences(
          dataTotalBatchNow.data,
          dataTotalBatchLastYear.data
        );
        tempStatisticCard.push({
          content: "Periode penanaman",
          total: dataTotalBatchNow.data,
          icon: (
            <GiClockwiseRotation className={setColorForIcon(diff)} size={25} />
          ),
          bgColor: setBgColorForIcon(diff),
          differences: diff,
          timeBased: "tahun",
        });
      }

      const dataTotalTransaction = await get("/api/v1/transaction/statistic");
      if (dataTotalTransaction.status == HttpStatusCode.Ok) {
        const now = dataTotalTransaction.data.find(
          (item) => item.month == month
        );
        const last = dataTotalTransaction.data.find(
          (item) => item.month == month - 1
        );
        const diffTransaction = countDifferences(
          now?.totalTransaction,
          last?.totalTransaction
        );
        const diffWeight = countDifferences(
          now?.totalWeight,
          last?.totalWeight
        );

        tempStatisticCard.push(
          {
            content: "Transaksi",
            total: now?.totalTransaction,
            icon: (
              <RiShoppingCartLine
                className={setColorForIcon(diffTransaction)}
                size={25}
              />
            ),
            bgColor: setBgColorForIcon(diffTransaction),
            differences: diffTransaction,
            timeBased: "bulan",
          },
          {
            content: "Berat transaksi",
            total: now?.totalWeight,
            icon: <BsBag className={setColorForIcon(diffWeight)} size={25} />,
            bgColor: setBgColorForIcon(diffWeight),
            differences: diffWeight,
            timeBased: "bulan",
          }
        );
      }

      /* Fetch Statistic For Graph */
    } else if (profileUser?.role == roleUser.farmer) {
      /* Fetch Statistic For Card */
      const dataTotalTransactionNow = await get(
        "/api/v1/transaction/statistic",
        {
          year,
        }
      );

      const dataTotalTransactionLastYear = await get(
        "/api/v1/transaction/statistic",
        {
          year: year - 1,
        }
      );

      if (
        dataTotalTransactionNow.status == HttpStatusCode.Ok &&
        dataTotalTransactionLastYear.status == HttpStatusCode.Ok
      ) {
        const diffIncome = countDifferences(
          SumObjectByKey(dataTotalTransactionNow.data, "totalIncome"),
          SumObjectByKey(dataTotalTransactionLastYear.data, "totalIncome")
        );

        const diffTransaction = countDifferences(
          SumObjectByKey(dataTotalTransactionNow.data, "totalTransaction"),
          SumObjectByKey(dataTotalTransactionLastYear.data, "totalTransaction")
        );

        const diffWeight = countDifferences(
          SumObjectByKey(dataTotalTransactionNow.data, "totalWeight"),
          SumObjectByKey(dataTotalTransactionLastYear.data, "totalWeight")
        );

        console.log(
          month - 1,
          month,
          dataTotalTransactionNow.data[month - 1].totalUniqueBuyer
        );
        console.log(
          month - 2,
          month - 1,
          dataTotalTransactionNow.data[month - 2].totalUniqueBuyer
        );

        const diffUniqueBuyer = countDifferences(
          dataTotalTransactionNow.data[month - 1].totalUniqueBuyer,
          dataTotalTransactionLastYear.data[month - 2].totalUniqueBuyer
        );

        tempStatisticCard.push(
          {
            content: "Pendapatan",
            total: SumObjectByKey(dataTotalTransactionNow.data, "totalIncome"),
            icon: (
              <TbMoneybag className={setColorForIcon(diffIncome)} size={25} />
            ),
            bgColor: setBgColorForIcon(diffIncome),
            differences: diffIncome,
            timeBased: "tahun",
            money: true,
          },
          {
            content: "Berat transaksi",
            total: SumObjectByKey(dataTotalTransactionNow.data, "totalWeight"),
            icon: <BsBag className={setColorForIcon(diffWeight)} size={25} />,
            bgColor: setBgColorForIcon(diffWeight),
            differences: diffWeight,
            timeBased: "tahun",
            weight: true,
          },
          {
            content: "Transaksi",
            total: SumObjectByKey(
              dataTotalTransactionNow.data,
              "totalTransaction"
            ),
            icon: (
              <RiShoppingCartLine
                className={setColorForIcon(diffTransaction)}
                size={25}
              />
            ),
            bgColor: setBgColorForIcon(diffTransaction),
            differences: diffTransaction,
            timeBased: "tahun",
          },
          {
            content: "Pembeli",
            total: dataTotalTransactionNow.data[month - 1].totalUniqueBuyer,
            icon: (
              <TbUsers className={setColorForIcon(diffUniqueBuyer)} size={25} />
            ),
            bgColor: setBgColorForIcon(diffUniqueBuyer),
            differences: diffUniqueBuyer,
            timeBased: "bulan",
          }
        );
      }

      /* Fetch Statistic For Graph */
    } else if (profileUser?.role == roleUser.validator) {
      const dataTotalCommodityNow = await get(
        "/api/v1/commodity/statistic-total",
        {
          year,
        }
      );
      const dataTotalCommodityLastYear = await get(
        "/api/v1/commodity/statistic-total",
        {
          year: year - 1,
        }
      );

      if (
        dataTotalCommodityNow.status == HttpStatusCode.Ok &&
        dataTotalCommodityLastYear.status == HttpStatusCode.Ok
      ) {
        const diff = countDifferences(
          dataTotalCommodityNow.data,
          dataTotalCommodityLastYear.data
        );
        tempStatisticCard.push({
          content: "Komoditas",
          total: dataTotalCommodityNow.data,
          icon: <TbPlant className={setColorForIcon(diff)} size={25} />,
          bgColor: setBgColorForIcon(diff),
          differences: diff,
          timeBased: "tahun",
        });
      }

      const dataTotalBatchNow = await get("/api/v1/batch/statistic-total", {
        year,
      });

      const dataTotalBatchLastYear = await get(
        "/api/v1/commodity/statistic-total",
        {
          year: year - 1,
        }
      );

      if (
        dataTotalBatchNow.status == HttpStatusCode.Ok &&
        dataTotalBatchLastYear.status == HttpStatusCode.Ok
      ) {
        const diff = countDifferences(
          dataTotalBatchNow.data,
          dataTotalBatchLastYear.data
        );
        tempStatisticCard.push({
          content: "Periode",
          total: dataTotalBatchNow.data,
          icon: (
            <GiClockwiseRotation className={setColorForIcon(diff)} size={25} />
          ),
          bgColor: setBgColorForIcon(diff),
          differences: diff,
          timeBased: "tahun",
        });
      }

      const totalValidateNow = await get(
        "/api/v1/treatment-record/statistic-total",
        {
          year,
        }
      );

      const totalValidateLastYear = await get(
        "/api/v1/treatment-record/statistic-total",
        {
          year: year - 1,
        }
      );

      if (
        totalValidateNow.status == HttpStatusCode.Ok &&
        totalValidateLastYear.status == HttpStatusCode.Ok
      ) {
        const diff = countDifferences(
          totalValidateNow.data,
          totalValidateLastYear.data
        );
        tempStatisticCard.push({
          content: "Validasi",
          total: totalValidateNow.data,
          icon: (
            <GiClockwiseRotation className={setColorForIcon(diff)} size={25} />
          ),
          bgColor: setBgColorForIcon(diff),
          differences: diff,
          timeBased: "tahun",
        });
      }

      const dataTotalValidatorNow = await get(
        "/api/v1/user/statistic-validator",
        {
          year,
        }
      );

      const dataTotalValidatorLastYear = await get(
        "/api/v1/user/statistic-validator",
        {
          year: year - 1,
        }
      );

      if (
        dataTotalValidatorNow.status == HttpStatusCode.Ok &&
        dataTotalValidatorLastYear.status == HttpStatusCode.Ok
      ) {
        const diff = countDifferences(
          dataTotalValidatorNow.data,
          dataTotalValidatorLastYear.data
        );
        tempStatisticCard.push({
          content: "Validator",
          total: dataTotalValidatorNow.data,
          icon: <FaUserCheck className={setColorForIcon(diff)} size={25} />,
          bgColor: setBgColorForIcon(diff),
          differences: diff,
          timeBased: "tahun",
        });
      }
    }

    setStatisticCard(tempStatisticCard);
    setStatisticGraph(tempStatisticGraph);
    setIsLoading(false);
  };

  useEffect(() => {
    if (
      Array.isArray(statisticCard) &&
      statisticCard.length == 0 &&
      !isLoadingProfile &&
      isAuthenticated &&
      checkRole(false, roleUser.buyer)
    ) {
      getStatistic();
    }
    setIsLoading(false);
  }, [isLoadingProfile, isAuthenticated]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Seo title="Dashboard" />
      <Dashboard roles={[roleUser.admin, roleUser.admin, roleUser.validator]}>
        <h1 className="text-xl font-bold mb-4">Dashboard</h1>
        <div className="flex flex-col gap-2 w-full">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-2">
            {statisticCard?.map((item, index) => (
              <StatisticCard key={index} data={item} />
            ))}
          </div>
        </div>

        {/* {profileUser?.role == roleUser.admin && <>admin</>}
        {profileUser?.role == roleUser.farmer && <>farmer</>}
        {profileUser?.role == roleUser.validator && <>validator</>} */}
      </Dashboard>
    </>
  );
};
