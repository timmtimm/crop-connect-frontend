import Loading from "@/components/modules/loading";
import Seo from "@/components/elements/seo";
import Auth from "@/components/layouts/auth";
import { get, postWithJSON } from "@/lib/axios";
import {
  checkObjectIsNotNullExist,
  findErrorMessageFromResponse,
  validateEmail,
  validatePassword,
  validateStringInputLogic,
} from "@/utils/utilities";
import { Alert, Button, Snackbar, TextField } from "@mui/material";
import Slide from "@mui/material/Slide";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useProfileUser } from "@/context/profileUserContext";
import { roleUser } from "@/constant/constant";

export default () => {
  const router = useRouter();
  const { profileUser, getProfileUser, isLoadingProfile, isAuthenticated } =
    useProfileUser();

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
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    message: "",
    email: "",
    password: "",
  });

  /* Function */
  const handleChange = ({ target: { name, value } }) => {
    setInput({ ...input, [name]: value });
  };

  /* Submit */
  const validateInput = () => {
    let flag = true;
    let tempError = { ...error };

    tempError.email = validateStringInputLogic(
      input.email,
      validateEmail(input.email),
      {
        empty: "Email tidak boleh kosong",
        invalid: "Email tidak valid",
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

    if (checkObjectIsNotNullExist(tempError, ["email", "password"])) {
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
      const data = await postWithJSON("/api/v1/user/login", input);

      if (data?.data) {
        Cookies.set("token", data.data, { expires: 1 });

        await getProfileUser();

        router.push(
          profileUser.role == roleUser.buyer
            ? router.query.redirect || "/"
            : router.query.redirect || "/dashboard"
        );
      } else {
        setError({
          ...error,
          message: data.message,
          email: findErrorMessageFromResponse(data?.error, "email"),
          password: findErrorMessageFromResponse(data?.error, "password"),
        });

        handleClick();
      }
    }

    setIsLoading(false);
  };

  /* useEffect */
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, []);

  return (
    <>
      <Seo title="Masuk Akun" />
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
      {isLoading || isLoadingProfile ? <Loading /> : <></>}
      <Auth
        srcBanner="/accounts _ profile, account, user, dating, employee, woman, hiring, casting_lg.png"
        altBanner="Masuk"
      >
        <div>
          <h1 className="text-center text-2xl font-semibold mb-4">
            Masuk ke Akun
          </h1>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
              value={input.email || ""}
            />
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
            <Button
              className="bg-[#52A068] normal-case font-bold mb-3"
              variant="contained"
              type="submit"
              onClick={handleSubmit}
            >
              Masuk
            </Button>
          </form>
        </div>
        <div className="flex flex-col gap-2">
          <div className=" mt-6 text-center text-sm md:text-base">
            Belum memiliki akun?{" "}
            <Link href={"/register"} className="text-[#52A068] font-bold">
              Daftar
            </Link>
          </div>
          <div className="text-center text-sm md:text-base">
            Lupa kata sandi?{" "}
            <Link href={"/reset-password"} className="text-[#52A068] font-bold">
              Atur Ulang Kata Sandi
            </Link>
          </div>
        </div>
      </Auth>
    </>
  );
};
