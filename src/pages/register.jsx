import Auth from "@/components/layouts/auth";
import { fetcher, postWithJSON, triggerfetcher } from "@/lib/axios";
import { runOnce } from "@/lib/swr";
import {
  checkObjectIsNotNullExist,
  findErrorMessageFromResponse,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
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
import Slide from "@mui/material/Slide";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import useSWR from "swr";
import { setParamRegionFetch } from "@/utils/url";
import Seo from "@/components/elements/seo";
import { roleUser } from "@/constant/constant";
import Loading from "@/components/modules/loading";

const availableRoles = [
  {
    text: "Pembeli",
    value: roleUser.buyer,
  },
  {
    text: "Petani",
    value: roleUser.farmer,
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

  /* State */

  const [input, setInput] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    role: availableRoles[0].value,
    password: "",
    passwordConfirmation: "",
    regionID: "",
  });
  const [error, setError] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    role: "",
    password: "",
    passwordConfirmation: "",
    province: "",
    regency: "",
    district: "",
    subdistrict: "",
  });
  const [region, setRegion] = useState({
    country: "Indonesia",
    province: null,
    regency: null,
    district: null,
    subdistrict: null,
  });
  const [oldRegion, setOldRegion] = useState(region);

  /* Function */
  const handleChange = ({ target: { name, value } }) => {
    setInput({ ...input, [name]: value });
    setError({ ...error, [name]: "" });
  };

  const handleChangeRegion = ({ target: { name, value } }) => {
    setRegion({ ...region, [name]: value });
    setError({ ...error, [name]: "" });
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

  /* useEffect */
  useEffect(() => {
    if (Cookies.get("token")) {
      router.replace("/");
    }
  }, []);

  /* Submit */
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
    tempError.role = validateStringInputLogic(
      input.role,
      availableRoles.find((role) => role.value === input.role),
      {
        empty: "Role tidak boleh kosong",
        invalid: "Role tidak valid",
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
        "role",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateInput()) {
      const data = await postWithJSON("/api/v1/user/register", input);

      if (data?.data) {
        Cookies.set("token", data.data, { expires: 1 });

        router.push(
          input.role == roleUser.buyer
            ? (router.query.redirect && JSON.parse(router.query.redirect)) ||
                "/"
            : (router.query.redirect && JSON.parse(router.query.redirect)) ||
                "/dashboard"
        );
      } else {
        setError({
          ...error,
          message: data?.message,
          name: findErrorMessageFromResponse(data?.error, "name"),
          email: findErrorMessageFromResponse(data?.error, "email"),
          phoneNumber: findErrorMessageFromResponse(data?.error, "phoneNumber"),
          role: findErrorMessageFromResponse(data?.error, "role"),
          password: findErrorMessageFromResponse(data?.error, "password"),
        });
        handleClick();
      }
    }
  };

  return (
    <>
      <Seo title="Daftar Akun" />
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
      {(mutatingSubdistrict ||
        mutatingDistrict ||
        mutatingRegency ||
        provinceLoading) && <Loading />}
      <Auth
        srcBanner="/workflow _ to do list, checklist, list, tasks, woman, chores, requirements_lg.png"
        altBanner="Daftar"
      >
        <div>
          <h2 className="text-center text-2xl font-semibold mb-4">
            Daftar Akun Baru
          </h2>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <TextField
              required
              error={error.name ? true : false}
              InputProps={{
                className: "w-full",
              }}
              name="name"
              label="Nama Lengkap"
              variant="outlined"
              onChange={handleChange}
              helperText={error.name || ""}
            />
            <TextField
              required
              error={error.email ? true : false}
              InputProps={{
                className: "w-full",
              }}
              name="email"
              label="Email"
              variant="outlined"
              onChange={handleChange}
              helperText={error.email || ""}
            />
            <TextField
              required
              error={error.phoneNumber ? true : false}
              InputProps={{
                className: "w-full",
              }}
              type="number"
              name="phoneNumber"
              label="Nomor handphone"
              variant="outlined"
              onChange={handleChange}
              helperText={error.phoneNumber || ""}
            />
            <FormControl required>
              <InputLabel>Peran</InputLabel>
              <Select
                name="role"
                value={input.role || ""}
                label="Peran"
                onChange={handleChange}
              >
                {availableRoles.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.text}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {input.role == availableRoles[1].value && (
              <TextField
                InputProps={{
                  className: "w-full",
                }}
                name="description"
                label="Deskripsi Petani"
                variant="outlined"
                onChange={handleChange}
              />
            )}
            <TextField
              required
              error={error.password ? true : false}
              InputProps={{
                className: "w-full",
              }}
              type="password"
              name="password"
              label="Kata Sandi"
              variant="outlined"
              onChange={handleChange}
              helperText={error.password}
              value={input.password || ""}
            />
            <TextField
              required
              error={error.passwordConfirmation ? true : false}
              InputProps={{
                className: "w-full",
              }}
              type="password"
              name="passwordConfirmation"
              label="Konfirmasi Kata Sandi"
              variant="outlined"
              onChange={handleChange}
              helperText={error.passwordConfirmation}
              value={input.passwordConfirmation || ""}
            />

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
                <FormHelperText>{error.district}</FormHelperText>
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
                <FormHelperText>{error.subdistrict}</FormHelperText>
              </FormControl>
            )}
            <Button
              className="bg-[#52A068] normal-case font-bold mb-3"
              variant="contained"
              type="submit"
              onClick={handleSubmit}
            >
              Daftar
            </Button>
          </form>
        </div>
        <div>
          <div className=" mt-6 text-center text-sm md:text-base">
            Sudah punya akun?{" "}
            <Link href={"/login"} className="text-[#52A068] font-bold">
              Masuk
            </Link>
          </div>
        </div>
      </Auth>
    </>
  );
};
