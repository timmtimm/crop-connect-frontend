import Loading from "@/components/elements/loading";
import Auth from "@/components/layouts/auth";
import { get, postWithJSON } from "@/lib/axios";
import {
  checkObjectIsNullExist,
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

export default () => {
  const router = useRouter();

  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState({
    message: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

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
        invalid: "Kata sandi harus mengandung huruf besar, kecil, dan angka",
      }
    );

    if (checkObjectIsNullExist(input, ["email", "password"])) {
      flag = false;
    }

    setError({
      ...tempError,
    });

    return flag;
  };

  const handleChange = ({ target: { name, value } }) => {
    setInput({ ...input, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (validateInput()) {
      const { data } = await postWithJSON("/api/v1/user/login", input);

      console.log(data);
      if (data?.data) {
        Cookies.set("token", data.data, { expires: 1 });

        const { data: dataProfile } = await get("/api/v1/user/profile");

        router.push(
          dataProfile.role == "buyer"
            ? router.query.redirect || "/"
            : "/dashboard"
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

  useEffect(() => {
    if (Cookies.get("token")) {
      router.replace("/");
    }
  }, []);

  return (
    <>
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
      {isLoading ? <Loading /> : <></>}
      <Auth
        srcBanner="/accounts _ profile, account, user, dating, employee, woman, hiring, casting_lg.png"
        altBanner="Masuk"
      >
        <div>
          <h2 className="text-center text-2xl font-semibold mb-4">
            Masuk ke Akun
          </h2>

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
            <Link
              href={"/forgot-password"}
              className="text-[#52A068] font-bold"
            >
              Atur Ulang Kata Sandi
            </Link>
          </div>
        </div>
      </Auth>
    </>
  );
};
