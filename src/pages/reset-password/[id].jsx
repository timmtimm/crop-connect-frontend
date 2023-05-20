import Loading from "@/components/modules/loading";
import Seo from "@/components/elements/seo";
import Auth from "@/components/layouts/auth";
import { get, putWithJSON } from "@/lib/axios";
import {
  checkObjectIsNotNullExist,
  findErrorMessageFromResponse,
  validatePassword,
  validateStringInputLogic,
} from "@/utils/utilities";
import { Alert, Button, Snackbar, TextField } from "@mui/material";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Slide from "@mui/material/Slide";
import { HttpStatusCode } from "axios";

export default () => {
  const router = useRouter();
  const { id } = router.query;

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
  const [isLoading, setIsLoading] = useState(false);
  const [expired, setExpired] = useState(false);
  const [input, setInput] = useState({
    password: "",
    passwordConfirmation: "",
  });
  const [error, setError] = useState({
    message: "",
    password: "",
    passwordConfirmation: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);

  /* Function */
  const handleChange = ({ target: { name, value } }) => {
    setInput({ ...input, [name]: value });
  };

  const checkToken = async () => {
    setIsLoading(true);
    const data = await get(`/api/v1/user/forgot-password/${id}`);

    if (data.status != HttpStatusCode.Ok) {
      setExpired(true);
    }
    setIsLoading(false);
  };

  /* useEffect */
  useEffect(() => {
    if (!id) {
      return;
    } else {
      checkToken();
    }
  }, [id]);

  useEffect(() => {
    if (Cookies.get("token")) {
      router.replace("/");
    }
  }, []);

  /* Submit */
  const validateInput = () => {
    let flag = true;
    let tempError = {};

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

    if (
      checkObjectIsNotNullExist(tempError, ["password", "passwordConfirmation"])
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
      const data = await putWithJSON(`/api/v1/user/forgot-password/${id}`, {
        password: input.password,
      });
      console.log(data);

      if (data.status == HttpStatusCode.Ok) {
        setIsSuccess(true);
      } else {
        setError({
          message: data.message,
          password: findErrorMessageFromResponse(data?.error, "password"),
        });
        handleClick();
      }
    }
  };

  return (
    <>
      <Seo title="Atur Ulang Password" />
      {isLoading && <Loading />}
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
      <Auth
        srcBanner="/security _ lock, padlock, man, protection, safety, privacy_lg.png"
        altBanner="Atur Ulang Password"
      >
        <div className="text-center">
          <h1 className="text-center text-2xl font-semibold mb-6">
            Atur Ulang Kata Sandi
          </h1>
          {expired ? (
            <>
              <p className="mb-4">
                Link atur ulang kata sandi sudah kadaluwarsa. Silahkan ulangi
                proses untuk mendapatkan link baru
              </p>
              <div className="text-center">
                <Link href="/reset-password">
                  <span className="text-[#53A06C] font-bold">
                    Kembali ke halaman atur ulang kata sandi
                  </span>
                </Link>
              </div>
            </>
          ) : isSuccess ? (
            <>
              <p className="mb-4">
                Kata sandi berhasil diatur ulang. Silahkan masuk ke akun anda
              </p>
              <div className="text-center">
                <Link href="/login">
                  <span className="text-[#53A06C] font-bold">
                    Halaman Login
                  </span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="mb-4">
                Masukkan email yang terdaftar. Kami akan mengirimkan link ke
                email anda untuk atur ulang kata sandi
              </p>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <TextField
                  required
                  error={error.password ? true : false}
                  InputProps={{
                    className: "w-full",
                  }}
                  type="password"
                  name="password"
                  label="Kata Sandi Baru"
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
                  label="Konfirmasi Kata Sandi Baru"
                  variant="outlined"
                  onChange={handleChange}
                  helperText={error.passwordConfirmation}
                  value={input.passwordConfirmation || ""}
                />
                <Button
                  className="bg-[#52A068] normal-case font-bold mb-3"
                  variant="contained"
                  type="submit"
                  onClick={handleSubmit}
                >
                  Kirim
                </Button>
              </form>
            </>
          )}
        </div>
      </Auth>
    </>
  );
};
