import Default from "@/components/layouts/default";
import { PutWithJSON, get, putWithJSON, triggerfetcher } from "@/lib/axios";
import {
  Alert,
  Button,
  Slide,
  Snackbar,
  TextField,
  FormControl,
  InputLabel,
  FormHelperText,
  Select,
  MenuItem,
} from "@mui/material";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import useSWR from "swr";
import { setParamRegionFetch } from "@/utils/url";
import { runOnce } from "@/lib/swr";
import Loading from "@/components/modules/loading";
import {
  checkObjectIsNotNullExist,
  validateEmail,
  validatePhoneNumber,
  validateStringInputLogic,
} from "@/utils/utilities";
import Seo from "@/components/elements/seo";
import { useProfileUser } from "@/context/profileUserContext";
import { roleUser } from "@/constant/constant";
import { HttpStatusCode } from "axios";

export default () => {
  const router = useRouter();
  const { profileUser, isLoadingProfile, isAuthenticated } = useProfileUser();

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
  const [profile, setProfile] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [region, setRegion] = useState({
    country: "Indonesia",
    province: null,
    regency: null,
    district: null,
    subdistrict: null,
  });
  const [error, setError] = useState({
    message: "",
  });
  const [message, setMessage] = useState("");
  const [oldRegion, setOldRegion] = useState(region);

  /* Function */
  const handleChange = ({ target: { name, value } }) => {
    setProfile({ ...profile, [name]: value });
  };

  const handleChangeRegion = ({ target: { name, value } }) => {
    setRegion({ ...region, [name]: value });
    setError({ ...error, [name]: "" });
  };

  const handleGetProfile = async () => {
    setIsLoading(true);

    let tempProfile = profileUser;

    tempProfile.regionID = tempProfile.region._id;
    setProfile(tempProfile);
    setRegion(tempProfile.region);

    setIsLoading(false);
  };

  /* Region */
  const [province, setProvince] = useState([]);
  const getProvince = async () => {
    const { data } = await get("/api/v1/region/province", {
      country: region.country,
    });
    setProvince(data);
  };

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
    getProvince();
  }, []);

  useEffect(() => {
    if (!Cookies.get("token")) {
      router.replace({
        pathname: "/login",
        query: {
          redirect: router.pathname,
        },
      });
    } else if (!isLoadingProfile && isAuthenticated) {
      handleGetProfile();
    }
  }, [isLoadingProfile, isAuthenticated]);

  /* Submit */
  const validateInput = () => {
    let flag = true;
    let tempError = { ...error };

    tempError.name = validateStringInputLogic(profile.name, true, {
      empty: "Nama tidak boleh kosong",
      invalid: "",
    });

    tempError.email = validateStringInputLogic(
      profile.email,
      validateEmail(profile.email),
      {
        empty: "Email tidak boleh kosong",
        invalid: "Email tidak valid",
      }
    );

    tempError.phoneNumber = validateStringInputLogic(
      profile.phoneNumber,
      validatePhoneNumber(profile.phoneNumber),
      {
        empty: "Nomor handphone tidak boleh kosong",
        invalid: "Nomor handphone tidak valid",
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
        "province",
        "regency",
        "district",
        "subdistrict",
      ])
    ) {
      flag = false;
    }

    setError(tempError);
    return flag;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateInput()) {
      const tempError = { ...error };
      const data = await putWithJSON("/api/v1/user/profile", {
        ...profile,
      });

      if (data.status == HttpStatusCode.Ok) {
        setMessage(data.message);
      } else {
        tempError.message = data.message;
        setError(tempError);
      }

      handleClick();
    }
  };

  return (
    <>
      <Seo title="Pengaturan Akun" />
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Slide}
        autoHideDuration={3000}
        onClose={handleClose}
        message={message ? message : error.message}
      >
        <Alert
          onClose={handleClose}
          severity={message ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {message ? message : error.message}
        </Alert>
      </Snackbar>
      {isLoading ? <Loading /> : <></>}
      <Default>
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-xl drop-shadow-md">
          <section className="relative p-32 hidden flex-col lg:flex">
            <div className="relative h-full w-full">
              <Image
                className="flex justify-center items-center contents-center relative h-full w-full"
                src="/office _ filing, archive, storage, sort, folder, file, woman_lg.png"
                width={500}
                height={500}
                style={{ objectFit: "contain" }}
                alt="Ilustrasi Pengaturan Akun"
              />
            </div>
          </section>
          <section className="flex flex-col gap-8 jutify-center p-6 divide-y-2">
            <div className="flex flex-col gap-8 jutify-center">
              <span className="text-2xl text-center font-bold mb-4">
                Pengaturan Akun
              </span>
              <form className="flex flex-col gap-4">
                <TextField
                  required
                  error={error.name ? true : false}
                  InputProps={{
                    className: "w-full",
                  }}
                  name="name"
                  label="Nama"
                  variant="outlined"
                  onChange={handleChange}
                  helperText={error.name}
                  value={profile.name || ""}
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
                  helperText={error.email}
                  value={profile.email || ""}
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
                  helperText={error.phoneNumber}
                  value={profile.phoneNumber || ""}
                />
                {profile.role != roleUser.buyer ? (
                  <TextField
                    error={error.description ? true : false}
                    InputProps={{
                      className: "w-full",
                    }}
                    name="description"
                    label="Deskripsi"
                    variant="outlined"
                    onChange={handleChange}
                    helperText={error.description}
                    value={profile.description || ""}
                  />
                ) : (
                  <></>
                )}
                <FormControl error={error.province ? true : false} required>
                  <InputLabel>Provinsi</InputLabel>
                  <Select
                    name="province"
                    label="Provinsi"
                    defaultValue=""
                    onChange={handleChangeRegion}
                    value={region.province || ""}
                  >
                    {province?.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{error.province}</FormHelperText>
                </FormControl>

                <FormControl error={error.regency ? true : false} required>
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

                <FormControl error={error.district ? true : false} required>
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

                <FormControl error={error.regency ? true : false} required>
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

                <Button
                  className="bg-[#52A068] normal-case font-bold mb-3"
                  variant="contained"
                  type="submit"
                  onClick={handleSubmit}
                >
                  Simpan
                </Button>
              </form>
            </div>
            <div>
              <div className=" mt-6 text-center text-sm md:text-base">
                Mau mengganti kata sandi?{" "}
                <Link
                  href={"/change-password"}
                  className="text-[#52A068] font-bold"
                >
                  Ganti Kata Sandi
                </Link>
              </div>
            </div>
          </section>
        </div>
      </Default>
    </>
  );
};
