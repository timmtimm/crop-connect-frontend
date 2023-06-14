import Loading from "@/components/modules/loading";
import Seo from "@/components/elements/seo";
import Default from "@/components/layouts/default";
import { fetcher, get, postWithJSON, triggerfetcher } from "@/lib/axios";
import { runOnce } from "@/lib/swr";
import { setParamRegionFetch } from "@/utils/url";
import {
  checkObjectIsNotNullExist,
  dateFormatToIndonesia,
  findErrorMessageFromResponse,
  setNumberFormat,
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
import { roleUser, transactionType } from "@/constant/constant";
import { HttpStatusCode } from "axios";
import Status, { convertStatusForBatch } from "@/components/elements/status";
import Modal from "@/components/elements/modal";

export default () => {
  const router = useRouter();
  const { id } = router.query;
  const queryParam = router.query;
  const { isLoadingProfile, isAuthenticated, checkRole } = useProfileUser();

  /* Snackbar */
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  /* Modal */
  const [openModal, setOpenModal] = useState(false);
  const handleModal = () => (validateInput() ? setOpenModal(!openModal) : null);

  /* State */
  const [input, setInput] = useState({
    country: "Indonesia",
    province: "",
    regency: "",
    district: "",
    subdistrict: "",
    address: "",
  });
  const [oldInput, setOldInput] = useState(input);
  const [error, setError] = useState({
    address: "",
    regionID: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  /* Fetch */
  const {
    data: dataProposal,
    trigger: triggerProposal,
    isMutating: mutatingProposal,
  } = useSWRMutation(`api/v1/proposal/id/${id}`, triggerfetcher);
  const {
    data: dataBatch,
    trigger: triggerBatch,
    isMutating: mutatingBatch,
  } = useSWRMutation(`api/v1/batch/transaction/id/${id}`, triggerfetcher);

  useEffect(() => {
    if (id && queryParam.transactionType == transactionType.perennials) {
      triggerBatch();
    } else if (id && queryParam.transactionType == transactionType.annuals) {
      triggerProposal();
    }
  }, [queryParam, id]);

  /* Function */
  const handleChange = ({ target: { name, value } }) => {
    setInput({ ...input, [name]: value });
    setError({ ...error, [name]: "" });
  };

  /* useEffect */
  useEffect(() => {
    if (!Cookies.get("token")) {
      router.replace({
        pathname: "/login",
        query: {
          redirect: router.pathname,
        },
      });
    } else if (
      !isLoadingProfile &&
      isAuthenticated &&
      !checkRole(true, roleUser.buyer)
    ) {
      router.replace("/");
    } else if (
      !isLoadingProfile &&
      isAuthenticated &&
      checkRole(true, roleUser.buyer)
    ) {
      setIsLoading(false);
    }
  }, [isLoadingProfile, isAuthenticated]);

  /* Region */
  const { data: province, isLoading: provinceLoading } = useSWR(
    ["/api/v1/region/province", { country: input.country }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

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

  /* Submit */
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (validateInput()) {
      const data = await postWithJSON(`/api/v1/transaction`, {
        transactionType: queryParam.transactionType,
        address: input.address,
        proposalID:
          queryParam.transactionType == transactionType.annuals ? id : null,
        batchID:
          queryParam.transactionType == transactionType.perennials ? id : null,
        regionID:
          subdistrict?.data?.find(
            (item) => item.subdistrict == input.subdistrict
          )?._id || "",
      });

      if (data?.status == HttpStatusCode.Created) {
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
    handleModal();
  };

  if (mutatingProposal || mutatingBatch || isLoading) return <Loading />;

  return (
    <>
      <Seo title="Perjanjian Transaksi Pembelian" />
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Slide}
        autoHideDuration={3000}
        onClose={handleClose}
        message={error.message}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {error.message}
        </Alert>
      </Snackbar>
      {openModal && (
        <Modal>
          <Image
            src="/search _ find, research, scan, article, document, file, magnifier_lg.png"
            width={160}
            height={160}
            alt="ilustrasi Batal Transaksi"
          />
          <h2 className="text-xl text-center mt-4 font-bold">
            Apakah anda sudah yakin dengan data yang anda masukkan?
          </h2>
          <div className="flex flex-row gap-2">
            <Button
              className="text-right bg-[#DB3546] hover:bg-[#BA2D3C] normal-case font-bold mt-2"
              variant="contained"
              onClick={handleModal}
            >
              Cek Kembali
            </Button>
            <Button
              className="text-right bg-[#53A06C] hover:bg-[#3E8A4F] normal-case font-bold mt-2"
              variant="contained"
              onClick={handleSubmit}
            >
              Yakin
            </Button>
          </div>
        </Modal>
      )}
      {(mutatingProposal ||
        mutatingBatch ||
        provinceLoading ||
        mutatingRegency ||
        mutatingDistrict ||
        mutatingSubdistrict) && <Loading />}
      <Default>
        {/* {JSON.stringify(dataBatch?.data)}
        {JSON.stringify(dataProposal)} */}
        <h1 className="text-2xl font-bold mb-4">
          Perjanjian Transaksi Pembelian
        </h1>
        {queryParam.transactionType == transactionType.annuals &&
          (dataProposal?.status != HttpStatusCode.Ok ? (
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
              <Link href={`/commodity/${dataProposal?.data.commodity._id}`}>
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
                          {dataProposal?.data.commodity?.name}
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
                          {setPriceFormat(
                            dataProposal?.data.commodity.pricePerKg
                          )}{" "}
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
                          {dataProposal?.data.name}
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
                          {dataProposal?.data.address}
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
                          {dataProposal?.data.plantingArea} km
                          <sup>2</sup>
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
                          {setNumberFormat(
                            dataProposal?.data.estimatedTotalHarvest
                          )}{" "}
                          kg
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
                  <h2 className="text-lg font-bold my-2">Rincian pembayaran</h2>
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
                              dataProposal?.data.commodity.pricePerKg
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="flex flex-row justify-between">
                              <span>Estimasi berat panen</span>
                              <span className="hidden md:flex text-right">
                                :
                              </span>
                            </div>
                          </td>
                          <td className="px-2 text-right md:text-left">
                            {dataProposal?.data.estimatedTotalHarvest} kilogram
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div>
                      <h3 className="text-lg text-right mt-2">
                        Total Pembayaran{" "}
                        <span className="font-bold">
                          {setPriceFormat(
                            dataProposal?.data.estimatedTotalHarvest *
                              dataProposal?.data.commodity.pricePerKg
                          )}
                        </span>
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full justify-end">
                <Button
                  className="text-right bg-[#52A068] normal-case font-bold mt-2"
                  variant="contained"
                  onClick={handleModal}
                >
                  Lanjutkan Transaksi
                </Button>
              </div>
            </>
          ))}
        {queryParam.transactionType == transactionType.perennials &&
          (dataBatch?.status != HttpStatusCode.Ok ? (
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
              <Link
                href={`/commodity/${dataBatch?.data?.proposal.commodity._id}`}
              >
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
                  <div className="flex flex-row items-start gap-x-6">
                    <Image
                      src={
                        dataBatch?.data.proposal.commodity?.imageURLs[0]
                          ? dataBatch?.data.proposal.commodity?.imageURLs[0]
                          : "/logo-no-background.png"
                      }
                      width={100}
                      height={100}
                    />
                    <table className="w-full md:w-fit">
                      <tbody>
                        <tr>
                          <td className="flex flex-row items-center justify-between">
                            <span>Nama</span>
                            <span className="hidden md:flex text-right">:</span>
                          </td>
                          <td className="px-2 text-right md:text-left">
                            {dataBatch?.data?.proposal.commodity?.name}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="flex flex-row justify-between">
                              <span>Bibit</span>
                              <span className="hidden md:flex text-right">
                                :
                              </span>
                            </div>
                          </td>
                          <td className="px-2 text-right md:text-left">
                            {dataBatch?.data?.proposal.commodity.seed}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="flex flex-row justify-between">
                              <span>Harga</span>
                              <span className="hidden md:flex text-right">
                                :
                              </span>
                            </div>
                          </td>
                          <td className="px-2 text-right md:text-left">
                            {setPriceFormat(
                              dataBatch?.data?.proposal.commodity.pricePerKg
                            )}{" "}
                            / kilogram
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <div>
                    <h2 className="text-lg font-bold my-2">
                      Periode yang dipilih
                    </h2>
                    <table className="w-full md:w-fit">
                      <tbody>
                        <tr>
                          <td className="flex flex-row items-center justify-between">
                            <span>Nama</span>
                            <span className="hidden md:flex text-right">:</span>
                          </td>
                          <td className="px-2 text-right md:text-left">
                            {dataBatch?.data.name}
                          </td>
                        </tr>
                        <tr>
                          <td className="flex flex-row items-center justify-between">
                            <span>Estimasi Tanggal Panen</span>
                            <span className="hidden md:flex text-right">:</span>
                          </td>
                          <td className="px-2 text-right md:text-left">
                            {dateFormatToIndonesia(
                              dataBatch?.data.estimatedHarvestDate
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="flex flex-row items-center justify-between">
                            <span>Status</span>
                            <span className="hidden md:flex text-right">:</span>
                          </td>
                          <td className="px-2 text-right md:text-left">
                            <div className="w-fit">
                              <Status
                                type={convertStatusForBatch(
                                  dataBatch?.data.status
                                )}
                                status={dataBatch?.data.status}
                              />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <div>
                    <h2 className="text-lg font-bold my-2">
                      Proposal yang digunakan
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
                          {dataBatch?.data?.proposal.name}
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
                          {dataBatch?.data?.proposal.address}
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
                          {dataBatch?.data?.proposal.plantingArea} km
                          <sup>2</sup>
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
                          {setNumberFormat(
                            dataBatch?.data?.proposal.estimatedTotalHarvest
                          )}{" "}
                          kg
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
                  <h2 className="text-lg font-bold my-2">Rincian pembayaran</h2>
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
                              dataBatch?.data?.proposal.commodity.pricePerKg
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="flex flex-row justify-between">
                              <span>Estimasi berat panen</span>
                              <span className="hidden md:flex text-right">
                                :
                              </span>
                            </div>
                          </td>
                          <td className="px-2 text-right md:text-left">
                            {dataBatch?.data?.proposal.estimatedTotalHarvest}{" "}
                            kilogram
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div>
                      <h3 className="text-lg text-right mt-2">
                        Total Pembayaran{" "}
                        <span className="font-bold">
                          {setPriceFormat(
                            dataBatch?.data?.proposal.estimatedTotalHarvest *
                              dataBatch?.data?.proposal.commodity.pricePerKg
                          )}
                        </span>
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full justify-end">
                <Button
                  className="text-right bg-[#52A068] normal-case font-bold mt-2"
                  variant="contained"
                  onClick={handleModal}
                >
                  Lanjutkan Transaksi
                </Button>
              </div>
            </>
          ))}
      </Default>
    </>
  );
};
