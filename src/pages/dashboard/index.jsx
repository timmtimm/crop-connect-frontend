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
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";

const listMonth = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

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
      if (dataTotalTransaction.status == HttpStatusCode.Ok) {
        const tempTotalTransaction = [];
        const tempTotalSuccessTransaction = [];
        const tempTotalUniqueBuyer = [];

        if (Array.isArray(dataTotalTransaction.data)) {
          dataTotalTransaction.data.forEach((item) => {
            tempTotalTransaction.push(item.totalTransaction);
            tempTotalSuccessTransaction.push(item.totalAccepted);
            tempTotalUniqueBuyer.push(item.totalUniqueBuyer);
          });
        }

        tempStatisticGraph.push(
          {
            label: "Statistik Transaksi",
            render: (
              <Bar
                options={{
                  responsive: true,
                  interaction: {
                    mode: "index",
                    intersect: false,
                  },
                  scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                    },
                  },
                }}
                data={{
                  labels: listMonth,
                  datasets: [
                    {
                      label: "Total transaksi",
                      data: tempTotalTransaction,
                      backgroundColor: "rgb(53, 162, 235)",
                      stack: "Stack 0",
                    },
                    {
                      label: "Transaksi berhasil",
                      data: tempTotalSuccessTransaction,
                      backgroundColor: "rgb(75, 192, 192)",
                      stack: "Stack 1",
                    },
                  ],
                }}
              />
            ),
          },
          {
            label: "Statistik Pembeli",
            render: (
              <Line
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                }}
                data={{
                  labels: listMonth,
                  datasets: [
                    {
                      label: "Pembeli",
                      data: tempTotalUniqueBuyer,
                      backgroundColor: "#52A068",
                      stack: "Stack 0",
                    },
                  ],
                }}
              />
            ),
          }
        );
      }

      const dataTopCommodity = await get(
        "/api/v1/transaction/statistic-commodity",
        {
          year,
        }
      );

      if (dataTopCommodity.status == HttpStatusCode.Ok) {
        tempStatisticGraph.push({
          label: "Statistik Komoditas Terlaris",
          render: (
            <div className="relative overflow-x-auto rounded-lg">
              <table className="w-full text-center text-gray-500">
                <thead className="text-sm md:text-md text-gray-800 bg-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Nama komoditas
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Bibit
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Jumlah transaksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(dataTopCommodity.data) &&
                    dataTopCommodity.data.map((item, index) => (
                      <tr
                        className={`${
                          index % 2 != 0 ? "bg-gray-50" : "bg-white"
                        } text-center ${
                          index != dataTopCommodity.data.length - 1
                            ? "border-b"
                            : ""
                        } text-sm sm:text-md `}
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                          {item.commodity.name}
                        </th>
                        <td className="px-6 py-4">{item.commodity.seed}</td>
                        <td className="px-6 py-4">{item.total}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ),
        });

        const dataTopProvince = await get(
          "/api/v1/transaction/statistic-province",
          {
            year,
          }
        );

        if (dataTopProvince.status == HttpStatusCode.Ok) {
          tempStatisticGraph.push({
            label: "Provinsi Terlaris",
            render: (
              <div className="relative overflow-x-auto rounded-lg">
                <table className="w-full text-center text-gray-500">
                  <thead className="text-sm md:text-md text-gray-800 bg-gray-200">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Provinsi
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Jumlah transaksi
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Transaksi berhasil
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(dataTopProvince.data) &&
                      dataTopProvince.data.map((item, index) => (
                        <tr
                          className={`${
                            index % 2 != 0 ? "bg-gray-50" : "bg-white"
                          } text-center ${
                            index != dataTopCommodity.data.length - 1
                              ? "border-b"
                              : ""
                          } text-sm sm:text-md `}
                        >
                          <th
                            scope="row"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                          >
                            {item.province}
                          </th>
                          <td className="px-6 py-4">{item.totalTransaction}</td>
                          <td className="px-6 py-4">{item.totalAccepted}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ),
          });
        }
      }
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
      if (dataTotalTransactionNow.status == HttpStatusCode.Ok) {
        const tempTotalTransaction = [];
        const tempTotalSuccessTransaction = [];
        const tempTotalWeight = [];
        const tempTotalIncome = [];

        if (Array.isArray(dataTotalTransactionNow.data)) {
          dataTotalTransactionNow.data.forEach((item) => {
            tempTotalTransaction.push(item.totalTransaction);
            tempTotalSuccessTransaction.push(item.totalAccepted);
            tempTotalWeight.push(item.totalWeight);
            tempTotalIncome.push(item.totalIncome);
          });
        }

        tempStatisticGraph.push(
          {
            label: "Statistik Transaksi",
            render: (
              <Bar
                options={{
                  responsive: true,
                  interaction: {
                    mode: "index",
                    intersect: false,
                  },
                  scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                    },
                  },
                }}
                data={{
                  labels: listMonth,
                  datasets: [
                    {
                      label: "Total transaksi",
                      data: tempTotalTransaction,
                      backgroundColor: "rgb(53, 162, 235)",
                      stack: "Stack 0",
                    },
                    {
                      label: "Transaksi berhasil",
                      data: tempTotalSuccessTransaction,
                      backgroundColor: "rgb(75, 192, 192)",
                      stack: "Stack 1",
                    },
                  ],
                }}
              />
            ),
          },
          {
            label: "Statistik Perkiraan Berat Transaksi",
            render: (
              <Line
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                }}
                data={{
                  labels: listMonth,
                  datasets: [
                    {
                      label: "Berat (Kg)",
                      data: tempTotalWeight,
                      backgroundColor: "#52A068",
                      stack: "Stack 0",
                    },
                  ],
                }}
              />
            ),
          },
          {
            label: "Statistik Pendapatan",
            render: (
              <Line
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                }}
                data={{
                  labels: listMonth,
                  datasets: [
                    {
                      label: "Pendapatan (Rp)",
                      data: tempTotalIncome,
                      backgroundColor: "#52A068",
                      stack: "Stack 0",
                    },
                  ],
                }}
              />
            ),
          }
        );
      }

      const dataTopCommodity = await get(
        "/api/v1/transaction/statistic-commodity",
        {
          year,
        }
      );

      if (dataTopCommodity.status == HttpStatusCode.Ok) {
        tempStatisticGraph.push({
          label: "Komoditas Terlaris",
          render: (
            <div className="relative overflow-x-auto rounded-lg">
              <table className="w-full text-center text-gray-500">
                <thead className="text-xs text-gray-800 bg-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Nama komoditas
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Bibit
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Jumlah transaksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(dataTopCommodity.data) &&
                    dataTopCommodity.data.map((item, index) => (
                      <tr
                        className={`${
                          index % 2 != 0 ? "bg-gray-50" : "bg-white"
                        } text-center ${
                          index != dataTopCommodity.data.length - 1
                            ? "border-b"
                            : ""
                        } text-sm sm:text-md `}
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                          {item.commodity.name}
                        </th>
                        <td className="px-6 py-4">{item.commodity.seed}</td>
                        <td className="px-6 py-4">{item.total}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ),
        });
      }
    } else if (profileUser?.role == roleUser.validator) {
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

      /* Fetch Statistic For Graph */
      const tempTotalCommodity = [];
      const labelYear = [];
      for (let i = 5; i >= 0; i--) {
        labelYear.push(year - i);
        const dataTotalCommodity = await get(
          "/api/v1/commodity/statistic-total",
          {
            year: year - i,
          }
        );

        if (dataTotalCommodity.status == HttpStatusCode.Ok) {
          tempTotalCommodity.push(dataTotalCommodity.data);
        }
      }

      tempStatisticGraph.push({
        label: "Statistik Komoditas",
        render: (
          <Line
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
              },
            }}
            data={{
              labels: labelYear,
              datasets: [
                {
                  label: "Komoditas",
                  data: tempTotalCommodity,
                  backgroundColor: "#52A068",
                  stack: "Stack 0",
                },
              ],
            }}
          />
        ),
      });

      const tempTotalBatch = [];
      for (let i = 0; i < labelYear.length; i++) {
        const dataTotalBatch = await get("/api/v1/batch/statistic-total", {
          year: labelYear[i],
        });

        if (dataTotalBatch.status == HttpStatusCode.Ok) {
          tempTotalBatch.push(dataTotalBatch.data);
        }
      }

      tempStatisticGraph.push({
        label: "Statistik Periode Terlaksana",
        render: (
          <Line
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
              },
            }}
            data={{
              labels: labelYear,
              datasets: [
                {
                  label: "Periode",
                  data: tempTotalBatch,
                  backgroundColor: "#52A068",
                  stack: "Stack 0",
                },
              ],
            }}
          />
        ),
      });

      const dataTotalValidation = await get(
        "/api/v1/treatment-record/statistic",
        {
          year,
        }
      );

      if (dataTotalValidation.status == HttpStatusCode.Ok) {
        const tempTotalValidation = [];
        console.log("data validasi", dataTotalValidation.data);
        if (Array.isArray(dataTotalValidation.data)) {
          dataTotalValidation.data.map((item) => {
            tempTotalValidation.push(item.total);
          });
        }

        tempStatisticGraph.push({
          label: "Statistik Validasi Perawatan",
          render: (
            <Line
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
              data={{
                labels: listMonth,
                datasets: [
                  {
                    label: "Periode",
                    data: tempTotalValidation,
                    backgroundColor: "#52A068",
                    stack: "Stack 0",
                  },
                ],
              }}
            />
          ),
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
  }, [isLoadingProfile, isAuthenticated]);

  return (
    <>
      <Seo title="Dashboard" />
      {isLoading && <Loading />}
      <Dashboard roles={[roleUser.admin, roleUser.admin, roleUser.validator]}>
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="flex flex-col gap-4 w-full">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-2">
            {statisticCard?.map((item, index) => (
              <StatisticCard key={index} data={item} />
            ))}
          </div>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {statisticGraph.map((item) => (
              <div className="min-h-[12rem] bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-md sm:text-lg md:text-xl text-center mb-4 font-bold cursor-default">
                  {item.label}
                </h2>
                {item.render}
              </div>
            ))}
          </div>
        </div>
      </Dashboard>
    </>
  );
};
