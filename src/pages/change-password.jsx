import Loading from "@/components/elements/loading";
import Seo from "@/components/elements/seo";
import Default from "@/components/layouts/default";
import { putWithJSON } from "@/lib/axios";
import {
  checkObjectIsNotNullExist,
  findErrorMessageFromResponse,
  validatePassword,
  validateStringInputLogic,
} from "@/utils/utilities";
import { Alert, Button, Snackbar, TextField } from "@mui/material";
import Slide from "@mui/material/Slide";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default () => {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState({
    oldPassword: "",
    newPassword: "",
    newPasswordConfirmation: "",
  });
  const [error, setError] = useState({
    message: "",
    oldPassword: "",
    newPassword: "",
    newPasswordConfirmation: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChangeInput = ({ target: { name, value } }) => {
    setInput({ ...input, [name]: value });
  };

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
    let tempError = {};

    tempError.oldPassword = validateStringInputLogic(
      input.oldPassword,
      validatePassword(input.oldPassword),
      {
        empty: "Kata sandi lama tidak boleh kosong",
        invalid:
          "Kata sandi lama minimal 8 karakter dan harus mengandung huruf besar, kecil, angka, dan simbol",
      }
    );

    tempError.newPassword = validateStringInputLogic(
      input.newPassword,
      validatePassword(input.newPassword),
      {
        empty: "Kata sandi baru tidak boleh kosong",
        invalid:
          "Kata sandi baru minimal 8 karakter dan harus mengandung huruf besar, kecil, angka, dan simbol",
      }
    );

    tempError.newPasswordConfirmation = validateStringInputLogic(
      input.newPasswordConfirmation,
      input.newPasswordConfirmation === input.newPassword,
      {
        empty: "Konfirmasi kata sandi baru tidak boleh kosong",
        invalid: "Konfirmasi kata sandi baru tidak sama dengan kata sandi baru",
      }
    );

    if (
      checkObjectIsNotNullExist(tempError, [
        "oldPassword",
        "newPassword",
        "newPasswordConfirmation",
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
      const data = await putWithJSON("/api/v1/user/change-password", {
        oldPassword: input.oldPassword,
        newPassword: input.newPassword,
      });

      console.log(data);
      if (data.status != 200) {
        setError({
          message: data.message,
          oldPassword: findErrorMessageFromResponse(data?.error, "oldPassword"),
          newPassword: findErrorMessageFromResponse(data?.error, "newPassword"),
        });
      } else {
        setError({
          message: "",
          oldPassword: "",
          newPassword: "",
        });
      }

      handleClick();
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
    }
  }, []);

  return (
    <>
      <Seo title="Ganti Kata Sandi" />
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Slide}
        autoHideDuration={6000}
        onClose={handleClose}
        message={error.message}
      >
        <Alert
          onClose={handleClose}
          severity={
            error.message ||
            checkObjectIsNotNullExist(error, [
              "oldPassword",
              "newPassword",
              "newPasswordConfirmation",
            ])
              ? "error"
              : "success"
          }
          sx={{ width: "100%" }}
        >
          {error.message ||
          checkObjectIsNotNullExist(error, [
            "oldPassword",
            "newPassword",
            "newPasswordConfirmation",
          ])
            ? error.message
            : "Berhasil mengubah kata sandi"}
        </Alert>
      </Snackbar>
      {isLoading ? <Loading /> : <></>}
      <Default>
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-xl shadow-custom">
          <section className="relative p-32 hidden flex-col lg:flex">
            <div className="relative h-full w-full">
              <Image
                className="flex justify-center items-center contents-center relative h-full w-full"
                src="/security _ password, safe, vault, hand gesture, pincode, privacy_lg.png"
                width={500}
                height={500}
                style={{ objectFit: "contain" }}
                alt="Ilustrasi Ganti Password"
              />
            </div>
          </section>
          <section className="flex flex-col gap-8 jutify-center p-6">
            <div className="flex flex-col gap-8 jutify-center">
              <span className="text-2xl text-center font-bold mb-4">
                Ganti Kata Sandi
              </span>
              <form className="flex flex-col gap-4">
                <TextField
                  required
                  error={error.oldPassword ? true : false}
                  InputProps={{
                    className: "w-full",
                  }}
                  type="password"
                  name="oldPassword"
                  label="Kata Sandi Lama"
                  variant="outlined"
                  onChange={handleChangeInput}
                  helperText={error.oldPassword}
                  value={input.oldPassword || ""}
                />
                <TextField
                  required
                  error={error.newPassword ? true : false}
                  InputProps={{
                    className: "w-full",
                  }}
                  type="password"
                  name="newPassword"
                  label="Kata Sandi Baru"
                  variant="outlined"
                  onChange={handleChangeInput}
                  helperText={error.newPassword}
                  value={input.newPassword || ""}
                />
                <TextField
                  required
                  error={error.newPasswordConfirmation ? true : false}
                  InputProps={{
                    className: "w-full",
                  }}
                  type="password"
                  name="newPasswordConfirmation"
                  label="Konfirmasi Kata Sandi Baru"
                  variant="outlined"
                  onChange={handleChangeInput}
                  helperText={error.newPasswordConfirmation}
                  value={input.newPasswordConfirmation || ""}
                />
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
          </section>
        </div>
      </Default>
    </>
  );
};
