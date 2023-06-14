import Seo from "@/components/elements/seo";
import Status from "@/components/elements/status";
import Dashboard from "@/components/layouts/dashboard";
import { roleUser } from "@/constant/constant";
import { fetcher, postWithJSON, triggerfetcher } from "@/lib/axios";
import { runOnce } from "@/lib/swr";
import {
  Alert,
  Button,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Slide,
  Snackbar,
  TextField,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import useSWR from "swr";
import { setParamRegionFetch } from "@/utils/url";
import { HttpStatusCode } from "axios";
import {
  checkObjectIsNotNullExist,
  findErrorMessageFromResponse,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateStringInputLogic,
} from "@/utils/utilities";

const formColumn = [
  {
    name: "name",
    label: "Nama Validator",
    placeholder: "Budi",
    description: "Nama lengkap validator.",
    type: "text",
    prefix: null,
    suffix: null,
    multiline: false,
    required: true,
  },
  {
    name: "email",
    label: "Email",
    placeholder: "budi@email.com",
    description: "Email aktif yang digunakan validator.",
    type: "text",
    prefix: null,
    suffix: null,
    multiline: false,
    required: true,
  },
  {
    name: "description",
    label: "Deskripsi",
    placeholder: "Pakar komoditas pangan",
    description:
      "Deskripsikan validator tersebut merupakan pakar pada komoditas apa.",
    type: "text",
    prefix: null,
    suffix: null,
    multiline: true,
    required: false,
  },
  {
    name: "phoneNumber",
    label: "Nomor handphone",
    placeholder: "081234567890",
    description:
      "Nomor handphone validator yang digunakan oleh validator jika ada yang ingin menghubungi validator.",
    type: "number",
    prefix: null,
    suffix: null,
    multiline: false,
    required: true,
  },
  {
    name: "password",
    label: "Kata sandi",
    placeholder: "",
    description:
      "Kata sandi sementara untuk pemberian akun kepada validator. Validator dapat melakukan pembaruan kata sandi pada pengaturan akun.",
    type: "password",
    isPrice: true,
    suffix: null,
    multiline: false,
    required: true,
  },
  {
    name: "passwordConfirmation",
    label: "Konfirmasi kata sandi",
    placeholder: "",
    description:
      "Konfirmasi kata sandi agar tidak ada kesalahan pada pengetikan.",
    type: "password",
    prefix: null,
    suffix: null,
    multiline: false,
    required: true,
  },
];

export default () => {
  const router = useRouter();
  /* Snackbar */
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const [input, setInput] = useState({});
  const [error, setError] = useState({});

  const handleChange = ({ target: { name, value } }) => {
    setError({ ...error, [name]: "" });
    setInput({ ...input, [name]: value });
  };

  const validateInput = () => {
    let flag = true;
    let tempError = { ...error };

    tempError.name = validateStringInputLogic(input.name, true, {
      empty: "Nama tidak boleh kosong",
      invalid: "",
    });
    tempError.email = validateStringInputLogic(
      input.email,
      validateEmail(input.email),
      {
        empty: "Email tidak boleh kosong",
        invalid: "Email tidak valid",
      }
    );
    tempError.phoneNumber = validateStringInputLogic(
      input.phoneNumber,
      validatePhoneNumber(input.phoneNumber),
      {
        empty: "Nomor telepon tidak boleh kosong",
        invalid: "Nomor telepon harus berupa angka",
      }
    );
    tempError.password = validateStringInputLogic(
      input.password,
      validatePassword(input.password),
      {
        empty: "Kata sandi tidak boleh kosong",
        invalid:
          "Kata sandi minimal 8 karakter dan harus mengandung huruf besar, kecil, angka, dan simbol",
      }
    );
    tempError.passwordConfirmation = validateStringInputLogic(
      input.passwordConfirmation,
      input.passwordConfirmation === input.password,
      {
        empty: "Konfirmasi kata sandi tidak boleh kosong",
        invalid: "Konfirmasi kata sandi tidak sama dengan kata sandi",
      }
    );

    tempError.province = validateStringInputLogic(region.province, true, {
      empty: "Provinsi tidak boleh kosong",
      invalid: "",
    });
    tempError.regency = validateStringInputLogic(region.regency, true, {
      empty: "Kabupaten tidak boleh kosong",
      invalid: "",
    });
    tempError.district = validateStringInputLogic(region.district, true, {
      empty: "Kecamatan tidak boleh kosong",
      invalid: "",
    });
    tempError.subdistrict = validateStringInputLogic(region.subdistrict, true, {
      empty: "Kelurahan tidak boleh kosong",
      invalid: "",
    });

    if (
      checkObjectIsNotNullExist(tempError, [
        "name",
        "email",
        "phoneNumber",
        "password",
        "passwordConfirmation",
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

  const postToAPI = async () => {
    const data = await postWithJSON("/api/v1/user/register-validator", input);

    if (data.status == HttpStatusCode.Created) {
      return true;
    } else {
      setError({
        ...error,
        message: data?.message,
        name: findErrorMessageFromResponse(data?.error, "name"),
        email: findErrorMessageFromResponse(data?.error, "email"),
        phoneNumber: findErrorMessageFromResponse(data?.error, "phoneNumber"),
        password: findErrorMessageFromResponse(data?.error, "password"),
      });
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateInput()) {
      const isSuccess = await postToAPI();
      if (isSuccess) {
        router.push("/dashboard/validator");
      } else {
        handleClick();
      }
    }
  };

  const handleSubmitAgain = async (e) => {
    e.preventDefault();

    if (validateInput()) {
      const isSuccess = await postToAPI();
      if (isSuccess) {
        setInput({});
      }
      handleClick();
    }
  };

  const [region, setRegion] = useState({
    country: "Indonesia",
    province: null,
    regency: null,
    district: null,
    subdistrict: null,
  });
  const [oldRegion, setOldRegion] = useState(region);

  const handleChangeRegion = ({ target: { name, value } }) => {
    setError({ ...error, [name]: "" });
    setRegion({ ...region, [name]: value });
  };

  /* Region */
  const { data: province, isLoading: provinceLoading } = useSWR(
    ["/api/v1/region/province", { country: region.country }],
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
        region.province != null &&
        region.province != oldRegion.province) ||
      (!regency && region.province != null)
    ) {
      triggerRegency(setParamRegionFetch(region, "regency"));
      setRegion({
        ...region,
        regency: null,
        district: null,
        subdistrict: null,
      });
    }

    if (
      (district && region.regency && region.regency != oldRegion.regency) ||
      (!district && region.regency)
    ) {
      triggerDistrict(setParamRegionFetch(region, "district"));
      setRegion({ ...region, district: null, subdistrict: null });
    }

    if (
      (subdistrict &&
        region.district &&
        region.district != oldRegion.district) ||
      (!subdistrict && region.district)
    ) {
      triggerSubdistrict(setParamRegionFetch(region, "subdistrict"));
      setRegion({ ...region, subdistrict: null });
    }

    setOldRegion(region);
  }, [region.province, region.regency, region.district]);

  return (
    <>
      <Seo title="Tambah Validator" />
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Slide}
        autoHideDuration={3000}
        onClose={handleClose}
        message={error.message}
      >
        <Alert
          onClose={handleClose}
          severity={error.message ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error.message ? error.message : "Berhasil menambah validator"}
        </Alert>
      </Snackbar>
      <Dashboard roles={roleUser.admin}>
        <h1 className="text-2xl mb-4 font-bold">Tambah Validator</h1>
        <div className="w-full bg-white rounded-xl shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4 w-full">
              {formColumn.map((column) => (
                <div className="flex flex-col">
                  <div className="flex flex-row items-center gap-2">
                    <h2 className="text-lg font-bold">{column.label}</h2>
                    {column.required && <Status status="Wajib" />}
                  </div>
                  <span className="mb-2">{column.description}</span>
                  <TextField
                    error={error[column.name] ? true : false}
                    name={column.name}
                    placeholder={column.placeholder}
                    onChange={handleChange}
                    type={column.type || "text"}
                    value={input[column.name]}
                    InputProps={{
                      startAdornment: column.prefix && (
                        <InputAdornment position="start">
                          {column.prefix}
                        </InputAdornment>
                      ),
                      endAdornment: column.suffix && (
                        <InputAdornment position="end">
                          {column.suffix}
                        </InputAdornment>
                      ),
                    }}
                    helperText={error[column.name]}
                    multiline={column.multiline}
                    rows={column.multiline ? 4 : 1}
                  />
                </div>
              ))}
            </div>
            <div className="w-full">
              <div className="flex flex-row items-center gap-2">
                <h2 className="text-lg font-bold">Daerah Validator</h2>
                <Status status="Wajib" />
              </div>
              <span>
                Masukkan tempat tinggal validator. Jika validator tinggal di
                beberapa tempat, masukkan tempat tinggal yang paling sering
                ditinggali.
              </span>
              <div className="flex flex-col gap-4 mt-2">
                <FormControl error={error.province ? true : false}>
                  <InputLabel>Provinsi</InputLabel>
                  <Select
                    name="province"
                    disabled={provinceLoading}
                    label="Provinsi"
                    defaultValue=""
                    onChange={handleChangeRegion}
                    value={region.province || ""}
                  >
                    {province?.data?.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{error.province}</FormHelperText>
                </FormControl>

                {region.province && (
                  <FormControl error={error.regency ? true : false}>
                    <InputLabel>Kabupaten</InputLabel>
                    <Select
                      name="regency"
                      disabled={mutatingRegency}
                      label="Kabupaten"
                      defaultValue=""
                      onChange={handleChangeRegion}
                      value={region.regency || ""}
                    >
                      {regency?.data?.map((item) => (
                        <MenuItem key={item} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{error.regency}</FormHelperText>
                  </FormControl>
                )}

                {region.regency && (
                  <FormControl error={error.district ? true : false}>
                    <InputLabel>Kecamatan</InputLabel>
                    <Select
                      name="district"
                      disabled={mutatingDistrict}
                      label="Kecamatan"
                      defaultValue=""
                      onChange={handleChangeRegion}
                      value={region.district || ""}
                    >
                      {district?.data?.map((item) => (
                        <MenuItem key={item} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {region.district && (
                  <FormControl error={error.regency ? true : false}>
                    <InputLabel>Kelurahan</InputLabel>
                    <Select
                      name="subdistrict"
                      disabled={mutatingSubdistrict}
                      label="Kelurahan"
                      defaultValue=""
                      onChange={handleChangeRegion}
                      value={region.subdistrict || ""}
                    >
                      {subdistrict?.data?.map((item) => (
                        <MenuItem
                          name="subdistrict"
                          key={item.subdistrict}
                          value={item.subdistrict}
                          onClick={() =>
                            handleChange({
                              target: {
                                name: "regionID",
                                value: item._id,
                              },
                            })
                          }
                        >
                          {item.subdistrict}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </div>
            </div>
          </div>
          <div className="flex mt-2 gap-2 justify-end">
            <Button
              className="normal-case text-gray-500 hover:bg-white font-bold"
              variant="contained"
              onClick={handleSubmitAgain}
            >
              Simpan dan tambah lagi
            </Button>
            <Button
              className="text-white bg-[#52A068] normal-case font-bold"
              variant="contained"
              onClick={handleSubmit}
            >
              Simpan
            </Button>
          </div>
        </div>
      </Dashboard>
    </>
  );
};
