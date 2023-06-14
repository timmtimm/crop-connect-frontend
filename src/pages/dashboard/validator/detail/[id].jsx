import Modal from "@/components/elements/modal";
import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import Loading from "@/components/modules/loading";
import { roleUser, transactionStatus } from "@/constant/constant";
import { get, putWithJSON } from "@/lib/axios";
import {
  dateFormatToIndonesia,
  setNumberFormat,
  setPriceFormat,
  setWeightFormat,
} from "@/utils/utilities";
import { Alert, Button, Slide, Snackbar } from "@mui/material";
import { HttpStatusCode } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const informationColumn = [
  {
    id: "_id",
    label: "ID",
    customDisplayRow: null,
  },
  {
    id: "name",
    label: "Nama",
    customDisplayRow: null,
  },
  {
    id: "email",
    label: "Email",
    customDisplayRow: null,
  },
  {
    id: "phoneNumber",
    label: "Nomor handphone",
    customDisplayRow: null,
  },
  {
    id: "description",
    label: "Deskripsi",
    customDisplayRow: (data) => data.description || "Tidak ada deskripsi",
  },
  {
    id: "region",
    label: "Daerah",
    customDisplayRow: (data) =>
      `${data.region?.province}, ${data.region?.regency}, ${data.region?.district}, ${data.region?.subdistrict}`,
  },
  {
    id: "createdAt",
    label: "Terdaftar pada",
    customDisplayRow: (data) => dateFormatToIndonesia(data.createdAt, true),
  },
];

export default () => {
  const router = useRouter();
  const { id } = router.query;

  const [dataUser, setDataUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState({
    errorMessage: "",
  });

  /* Function */
  const getValidator = async () => {
    const data = await get(`/api/v1/user/${id}`, {});

    if (data?.data) {
      setDataUser(data.data);
    } else {
      setResult({
        errorMessage: data.message,
      });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (id) {
      getValidator();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  return (
    <>
      <Seo title="Detail Validator" />
      {isLoading && <Loading />}
      <Dashboard roles={roleUser.admin}>
        <h1 className="text-2xl mb-4 font-bold">Detail Validator</h1>
        {result.errorMessage && (
          <div className="flex flex-col justify-center items-center">
            <Image
              src="/navigation _ location, map, destination, direction, question, lost, need help_lg.png"
              width={400}
              height={400}
              alt="Ilustrasi Not Found"
            />
            <h2 className="text-xl font-bold">Validator tidak ditemukan</h2>
            <Link href="/validator">
              <span className="text-[#53A06C]">
                Kembali ke halaman daftar validator
              </span>
            </Link>
          </div>
        )}
        {!isLoading && dataUser && (
          <div className=" w-full bg-white p-4 rounded-xl shadow-md mb-4">
            <div className="flex flex-col gap-4 divide-y-2">
              <table className="w-full md:w-fit">
                <tbody>
                  {informationColumn.map((column, index) => (
                    <tr key={index}>
                      <td className="flex flex-row items-center justify-between">
                        <span>{column.label}</span>
                        <span className="hidden md:flex text-right">:</span>
                      </td>
                      <td className="ml-2 text-right md:text-left">
                        {column.customDisplayRow
                          ? column.customDisplayRow(dataUser)
                          : dataUser[column.id]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Dashboard>
    </>
  );
};
