import Default from "@/components/layouts/default";

export default () => {
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
      <Default>
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-xl shadow-custom">
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
