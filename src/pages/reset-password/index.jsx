import Seo from "@/components/elements/seo";
import Auth from "@/components/layouts/auth";
import { findErrorMessageFromResponse, validateEmail } from "@/utils/utilities";
import { Alert, Button, Snackbar, TextField } from "@mui/material";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Slide from "@mui/material/Slide";
import { postWithJSON } from "@/lib/axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { HttpStatusCode } from "axios";

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
  const [input, setInput] = useState("");
  const [error, setError] = useState({
    message: "",
    email: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);

  /* Function */
  const handleChange = ({ target: { value } }) => {
    setInput(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateEmail(input)) {
      const data = await postWithJSON("/api/v1/user/forgot-password", {
        email: input,
      });

      if (data.status == HttpStatusCode.Created) {
        setIsSuccess(true);
      } else {
        setError({
          essage: data.message,
          email: findErrorMessageFromResponse(data?.error, "email"),
        });
        handleClick();
      }
    } else {
      setError({
        ...error,
        email: "Email tidak valid",
      });
    }
  };

  /* useEffect */
  useEffect(() => {
    if (Cookies.get("token")) {
      router.replace("/");
    }
  }, []);

  return (
    <>
      <Seo title="Atur Ulang Password" />
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
      <Auth
        srcBanner={
          isSuccess
            ? "/emails, messages _ message, envelope, email, mail, inbox, unread, read_lg.png"
            : "/security _ lock, padlock, man, protection, safety, privacy_lg.png"
        }
        altBanner="Atur Ulang Password"
      >
        <div className="text-center">
          {isSuccess ? (
            <>
              <h1 className="text-center text-2xl font-semibold mb-6">
                Link Reset Password Telah Dikirim
              </h1>
              <p className="mb-4">
                Link untuk reset password telah dikirim ke email anda. Silahkan
                cek email anda untuk mengatur ulang password
              </p>
              <div className="text-center">
                <Link href="/">
                  <span className="text-[#53A06C] font-bold">
                    Kembali ke halaman utama
                  </span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-center text-2xl font-semibold mb-6">
                Atur Ulang Kata Sandi
              </h1>
              <p className="mb-4">
                Masukkan email yang terdaftar. Kami akan mengirimkan link ke
                email anda untuk atur ulang kata sandi
              </p>
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
                  value={input || ""}
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
