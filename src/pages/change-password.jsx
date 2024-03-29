import Loading from "@/components/modules/loading";
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
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
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

  /* Function */
  const handleChangeInput = ({ target: { name, value } }) => {
    setInput({ ...input, [name]: value });
  };

  /* Submit */
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

      if (data.status != HttpStatusCode.Ok) {
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

  return (
    <>
      <Seo title="Ganti Kata Sandi" />
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
          {error.message ? error.message : "Berhasil mengubah kata sandi"}
        </Alert>
      </Snackbar>
      {isLoading ? <Loading /> : <></>}
      <Default isAuth={true} roles={null}>
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-xl drop-shadow-md">
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
