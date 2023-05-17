import Loading from "@/components/modules/loading";
import Seo from "@/components/elements/seo";
import Default from "@/components/layouts/default";
import { fetcher, get, postWithJSON, triggerfetcher } from "@/lib/axios";
import { runOnce } from "@/lib/swr";
import { setParamRegionFetch } from "@/utils/url";
import {
  checkObjectIsNotNullExist,
  findErrorMessageFromResponse,
  setPriceFormat,
  validateStringInputLogic,
} from "@/utils/utilities";
import {
  Alert,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import Slide from "@mui/material/Slide";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { useProfileUser } from "@/context/profileUserContext";

export default () => {
  const router = useRouter();
  const { id } = router.query;
  const { checkRole } = useProfileUser();

  const { data: dataProposal, isLoading: proposalLoading } = useSWR(
    [`api/v1/proposal/id/${id}`, {}],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  const [input, setInput] = useState({
    country: "Indonesia",
    province: "",
    regency: "",
    district: "",
    subdistrict: "",
    address: "",
  });

  const handleChange = ({ target: { name, value } }) => {
    setInput({ ...input, [name]: value });
    setError({ ...error, [name]: "" });
  };

  const [oldInput, setOldInput] = useState(input);
  const [error, setError] = useState({
    address: "",
    regionID: "",
  });

  const { data: province, isLoading: provinceLoading } = useSWR(
    ["/api/v1/region/province", { country: input.country }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  const [isLoading, setIsLoading] = useState(false);

  const {
    data: regency,
    trigger: triggerRegency,
    isMutating: mutatingRegency,
  } = useSWRMutation("/api/v1/region/regency", triggerfetcher);
  const {
    data: district,
    trigger: triggerDistrict,
    isMutating: mutatingDistrict,
  } = useSWRMutation("/api/v1/region/district", triggerfetcher);
  const {
    data: subdistrict,
    trigger: triggerSubdistrict,
    isMutating: mutatingSubdistrict,
  } = useSWRMutation("/api/v1/region/sub-district", triggerfetcher);

  useEffect(() => {
    if (
      (regency &&
        input.province != "" &&
        input.province != oldInput.province) ||
      (!regency && input.province != "")
    ) {
      triggerRegency(setParamRegionFetch(input, "province"));
      setInput({
        ...input,
        regency: "",
        district: "",
        subdistrict: "",
      });
    }

    if (
      (district && input.regency != "" && input.regency != oldInput.regency) ||
      (!district && input.regency != "")
    ) {
      triggerDistrict(setParamRegionFetch(input, "district"));
      setInput({ ...input, district: "", subdistrict: "" });
    }

    if (
      (subdistrict &&
        input.district != "" &&
        input.district != oldInput.district) ||
      (!subdistrict && input.district != "")
    ) {
      triggerSubdistrict(setParamRegionFetch(input, "subdistrict"));
      setInput({ ...input, subdistrict: "" });
    }

    setOldInput(input);
  }, [input.province, input.regency, input.district]);

  const validateInput = () => {
    let flag = true;
    let tempError = { ...error };

    tempError.address = validateStringInputLogic(input.address, true, {
      empty: "Alamat tidak boleh kosong",
      invalid: "",
    });
    tempError.province = validateStringInputLogic(input.province, true, {
      empty: "Provinsi tidak boleh kosong",
      invalid: "",
    });
    tempError.regency = validateStringInputLogic(input.regency, true, {
      empty: "Kabupaten tidak boleh kosong",
      invalid: "",
    });
    tempError.district = validateStringInputLogic(input.district, true, {
      empty: "Kecamatan tidak boleh kosong",
      invalid: "",
    });
    tempError.subdistrict = validateStringInputLogic(input.subdistrict, true, {
      empty: "Kelurahan tidak boleh kosong",
      invalid: "",
    });

    if (
      checkObjectIsNotNullExist(tempError, [
        "address",
        "province",
        "regency",
        "district",
        "subdistrict",
      ])
    ) {
      flag = false;
    }

    setError({
      ...tempError,
    });

    return flag;
  };

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (validateInput()) {
      const data = await postWithJSON(`/api/v1/transaction/${id}`, {
        address: input.address,
        regionID:
          subdistrict?.data?.find(
            (item) => item.subdistrict == input.subdistrict
          )?._id || "",
      });

      if (data?.status == 201) {
        setIsSuccess(true);
      } else {
        setError({
          ...error,
          status: data?.status,
          message: data?.message,
          address: findErrorMessageFromResponse(data?.error, "address"),
        });

        if (data?.status != 409) {
          handleClick();
        }
      }
    }

    setIsLoading(false);
  };

  const handleCheckRole = async () => {
    setIsLoading(true);

    if (checkRole(true, "buyer")) {
      router.replace("/");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (!Cookies.get("token")) {
      router.replace({
        pathname: "/login",
        query: {
          redirect: router.pathname,
        },
      });
    } else {
      handleCheckRole();
    }
  }, []);

  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen(true);
  };
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <Seo title="Perjanjian Transaksi Pembelian" />
      {(proposalLoading || isLoading) && <Loading />}
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Slide}
        autoHideDuration={6000}
        onClose={handleClose}
        message={error.message}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {error.message}
        </Alert>
      </Snackbar>
      <Default>
        <h1 className="text-2xl font-bold mb-4">
          Perjanjian Transaksi Pembelian
        </h1>
        {dataProposal?.status != 200 ? (
          <div className="flex flex-col justify-center items-center">
            <Image
              src="/navigation _ location, map, destination, direction, question, lost, need help_lg.png"
              width={400}
              height={400}
              alt="Ilustrasi Not Found"
            />
            <h2 className="text-xl font-bold">Transaksi tidak ditemukan</h2>
            <Link href="/">
              <span className="text-[#53A06C]">Kembali ke halaman utama</span>
            </Link>
          </div>
        ) : isSuccess ? (
          <div className="flex flex-col justify-center items-center">
            <Image
              src="/e-commerce, shopping _ shop, purchase, store, check out, shopping bags, woman_lg.png"
              width={400}
              height={400}
              alt="Ilustrasi Success Transaction"
            />
            <h2 className="text-xl font-bold">Transaksi berhasil dibuat</h2>
            <Link href={`/commodity/${dataProposal.data.commodity._id}`}>
              <span className="text-[#53A06C]">
                Kembali ke halaman detail komoditas
              </span>
            </Link>
            <span>atau</span>
            <Link href={`/transaction-history`}>
              <span className="text-[#53A06C]">
                Menuju halaman riwayat transaksi
              </span>
            </Link>
          </div>
        ) : error.status == 409 ? (
          <div className="flex flex-col justify-center items-center">
            <Image
              src="/workflow _ multitasking, stress, work, woman, desk, office, tasks, to do_lg.png"
              width={400}
              height={400}
              alt="Ilustrasi Not Found"
            />
            <h2 className="text-xl font-bold">Transaksi sedang diproses</h2>
            <Link href="/">
              <span className="text-[#53A06C]">Kembali ke halaman utama</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 w-full bg-white p-4 rounded-xl divide-y-2">
              <div>
                <h2 className="text-lg font-bold mb-2">
                  Komoditas yang ditransaksikan
                </h2>
                <table className="w-full md:w-fit">
                  <tbody>
                    <tr>
                      <td className="flex flex-row items-center justify-between">
                        <span>Nama</span>
                        <span className="hidden md:flex text-right">:</span>
                      </td>
                      <td className="px-2 text-right md:text-left">
                        {dataProposal.data.commodity?.name}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="flex flex-row justify-between">
                          <span>Harga</span>
                          <span className="hidden md:flex text-right">:</span>
                        </div>
                      </td>
                      <td className="px-2 text-right md:text-left">
                        {setPriceFormat(dataProposal.data.commodity.pricePerKg)}{" "}
                        / kilogram
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <div>
                  <h2 className="text-lg font-bold my-2">
                    Proposal yang dipilih
                  </h2>
                </div>
                <table className="w-full md:w-fit">
                  <tbody>
                    <tr>
                      <td className="flex flex-row items-center justify-between">
                        <span>Nama</span>
                        <span className="hidden md:flex text-right">:</span>
                      </td>
                      <td className="px-2 text-right md:text-left">
                        {dataProposal.data.name}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="flex flex-row justify-between">
                          <span>Alamat lahan</span>
                          <span className="hidden md:flex text-right">:</span>
                        </div>
                      </td>
                      <td className="px-2 text-right md:text-left">
                        {dataProposal.data.address}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="flex flex-row justify-between">
                          <span>Lahan</span>
                          <span className="hidden md:flex text-right">:</span>
                        </div>
                      </td>
                      <td className="px-2 text-right md:text-left">
                        {dataProposal.data.plantingArea} km
                        <sup>2</sup>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold my-2">Alamat pengiriman</h2>
                <TextField
                  required
                  error={error.address ? true : false}
                  name="address"
                  label="Alamat"
                  variant="outlined"
                  onChange={handleChange}
                  helperText={error.address || ""}
                />
                <FormControl
                  required
                  error={error.province ? true : false}
                  className="w-full"
                >
                  <InputLabel>Provinsi</InputLabel>
                  <Select
                    name="province"
                    value={input.province || ""}
                    disabled={provinceLoading}
                    label="Provinsi"
                    onChange={handleChange}
                  >
                    {province?.data?.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{error.province}</FormHelperText>
                </FormControl>
                {input.province != "" && (
                  <FormControl
                    required
                    error={error.regency ? true : false}
                    className="w-full"
                  >
                    <InputLabel>Kabupaten</InputLabel>
                    <Select
                      name="regency"
                      disabled={mutatingRegency}
                      value={input.regency}
                      label="Kabupaten"
                      onChange={handleChange}
                    >
                      {input.province != "" &&
                        regency?.data?.map((item) => (
                          <MenuItem key={item} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>{error.regency}</FormHelperText>
                  </FormControl>
                )}
                {input.regency != "" && (
                  <FormControl
                    required
                    error={error.district ? true : false}
                    className="w-full"
                  >
                    <InputLabel>Kecamatan</InputLabel>
                    <Select
                      name="district"
                      value={input.district}
                      disabled={mutatingDistrict}
                      label="Kecamatan"
                      onChange={handleChange}
                    >
                      {input.regency != "" &&
                        district?.data?.map((item) => (
                          <MenuItem key={item.subdistrict} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>{error.district}</FormHelperText>
                  </FormControl>
                )}
                {input.district != "" && (
                  <FormControl
                    required
                    error={error.subdistrict ? true : false}
                    className="w-full"
                  >
                    <InputLabel>Kelurahan</InputLabel>
                    <Select
                      name="subdistrict"
                      value={input.subdistrict}
                      disabled={mutatingSubdistrict}
                      label="Kelurahan"
                      onChange={handleChange}
                    >
                      {input.district != "" &&
                        subdistrict?.data?.map((item) => (
                          <MenuItem
                            key={item.subdistrict}
                            value={item.subdistrict}
                          >
                            {item.subdistrict}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>{error.subdistrict}</FormHelperText>
                  </FormControl>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold my-2">Detail pembayaran</h2>
                <div className="flex flex-col gap-y-1 divide-y divide-dashed">
                  <table className="w-full md:w-fit">
                    <tbody>
                      <tr>
                        <td className="flex flex-row items-center justify-between">
                          <span>Harga per kilogram</span>
                          <span className="hidden md:flex text-right">:</span>
                        </td>
                        <td className="px-2 text-right md:text-left">
                          {setPriceFormat(
                            dataProposal.data.commodity.pricePerKg
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="flex flex-row justify-between">
                            <span>Estimasi berat panen</span>
                            <span className="hidden md:flex text-right">:</span>
                          </div>
                        </td>
                        <td className="px-2 text-right md:text-left">
                          {dataProposal.data.estimatedTotalHarvest} kilogram
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex w-full justify-end">
              <Button
                className="text-right bg-[#52A068] normal-case font-bold mt-2"
                variant="contained"
                onClick={handleSubmit}
              >
                Lanjutkan Transaksi
              </Button>
            </div>
          </>
        )}
      </Default>
    </>
  );
};
