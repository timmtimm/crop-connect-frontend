import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import { roleUser } from "@/constant/constant";
import {
  Alert,
  AlertTitle,
  Button,
  FormControl,
  FormHelperText,
  InputAdornment,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import Slide from "@mui/material/Slide";
import {
  checkObjectIsNotNullExist,
  findErrorMessageFromResponse,
  validateStringInputLogic,
} from "@/utils/utilities";
import { useRouter } from "next/router";
import Loading from "@/components/modules/loading";
import { fetcher, postWithJSON, triggerfetcher } from "@/lib/axios";
import { HttpStatusCode } from "axios";
import Status from "@/components/elements/status";
import useSWR from "swr";
import { runOnce } from "@/lib/swr";
import useSWRMutation from "swr/mutation";

export default () => {
  const router = useRouter();

  const formColumn = [
    {
      name: "commodityID",
      label: "Komoditas",
      placeholder: "",
      description:
        "Pilih komoditas yang akan ditanam untuk periode ini. Pastikan komoditas ini merupakan tanaman perennial dan sedang dalam kondisi tersedia.",
      type: null,
      prefix: null,
      suffix: null,
      multiline: false,
      required: true,
      isSelect: true,
      optionsWithData: (data) =>
        Array.isArray(data) &&
        data.map((item) => (
          <MenuItem
            key={item._id}
            value={item._id}
            onClick={() =>
              handleChange({
                target: {
                  name: "commodityID",
                  value: item._id,
                },
              })
            }
          >
            {item.name}
          </MenuItem>
        )),
    },
    {
      name: "proposalID",
      label: "Proposal",
      placeholder: "",
      description:
        "Proposal yang akan dijadikan acuan untuk batch ini. Jika daftar proposal kosong, silahkan pilih komoditas yang ingin ditanam terlebih dahulu agar daftar proposal dapat ditampilkan. Pastikan proposal yang ingin digunakan telah tersedia dan disetujui oleh validator.",
      type: null,
      prefix: null,
      suffix: null,
      multiline: false,
      required: true,
      isSelect: true,
      optionsWithData: (data) =>
        Array.isArray(data) &&
        data.map((item) => (
          <MenuItem
            key={item._id}
            value={item._id}
            onClick={() =>
              handleChange({
                target: {
                  name: "proposalID",
                  value: item._id,
                },
              })
            }
          >
            {item?.name}
          </MenuItem>
        )),
    },
  ];

  /* Snackbar */
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const [input, setInput] = useState({
    commodityID: "",
    proposalID: "",
  });
  const [error, setError] = useState({
    commodityID: "",
    proposalID: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setError({ ...error, [name]: "" });
    setInput({ ...input, [name]: value });
  };

  const postToAPI = async () => {
    const data = await postWithJSON(
      `/api/v1/batch/create/${input.proposalID}`,
      {}
    );

    if (data.status == HttpStatusCode.Created) {
      return true;
    } else {
      setError({
        ...error,
        message: data.message,
      });
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const isSuccess = await postToAPI();
    if (isSuccess) {
      router.push("/dashboard/batch");
    } else {
      handleClick();
    }

    setIsLoading(false);
  };

  const handleSubmitAgain = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const isSuccess = await postToAPI();
    if (isSuccess) {
      setInput({
        commodityID: "",
        proposalID: "",
      });

      handleClick();
    }

    setIsLoading(false);
  };

  const { data: commodityData, isLoading: commodityLoading } = useSWR(
    ["/api/v1/commodity/perennials", {}],
    ([url, params]) => fetcher(url, params),
    runOnce
  );
  const {
    data: proposalData,
    trigger: triggerProposal,
    isMutating: mutatingProposal,
  } = useSWRMutation(
    `/api/v1/proposal/perennials/${input.commodityID}`,
    triggerfetcher
  );

  useEffect(() => {
    if (input.commodityID) {
      triggerProposal();
    }
  }, [input.commodityID]);

  return (
    <>
      <Seo title="Tambah Periode" />
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
          {error.message ? error.message : "Berhasil menambah periode"}
        </Alert>
      </Snackbar>
      {(isLoading || commodityLoading || mutatingProposal) && <Loading />}
      <Dashboard roles={roleUser.farmer}>
        <h1 className="text-2xl mb-4 font-bold">Tambah Periode</h1>
        <Alert className="mb-4 border-[1px] border-[#0288D1]" severity="info">
          <AlertTitle className="font-semibold">Informasi</AlertTitle>
          <span>
            Pembuatan periode ini dikhususkan untuk komoditas perennials yang
            dimana setiap panen dilakukan akan membutuhkan petani untuk membuat
            kembali periode baru. Jika komoditas yang anda tanam bukan
            perennials, maka anda tidak perlu membuat periode baru karena jika
            transaksi telah berhasil, sistem akan membuat periode baru secara
            otomatis.
          </span>
        </Alert>
        <div className="w-full bg-white rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formColumn.map((column) => (
              <div className="flex flex-col">
                <div className="flex flex-row items-center gap-2">
                  <h2 className="text-lg font-bold">{column.label}</h2>
                  {column.required && <Status status="Wajib" />}
                </div>
                <span className="mb-2">{column.description}</span>
                {column.isSelect ? (
                  <FormControl disabled={column.disabled}>
                    <Select
                      error={error[column.name] ? true : false}
                      className="w-full"
                      value={input[column.name]}
                      onChange={handleChange}
                      name={column.name}
                    >
                      {column.optionsWithData
                        ? column.name == "commodityID"
                          ? column.optionsWithData(commodityData?.data)
                          : column.optionsWithData(proposalData?.data)
                        : column.options.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                    </Select>
                    <FormHelperText className="text-[#d32f2f]">
                      {error[column.name]}
                    </FormHelperText>
                  </FormControl>
                ) : (
                  <TextField
                    error={error[column.name] ? true : false}
                    name={column.name}
                    placeholder={column.placeholder}
                    onChange={handleChange}
                    type={column.type || "text"}
                    value={input[column.name]}
                    InputProps={{
                      startAdornment: column?.prefix && (
                        <InputAdornment position="start">
                          {column.prefix}
                        </InputAdornment>
                      ),
                      endAdornment: column?.suffix && (
                        <InputAdornment position="end">
                          {column.suffix}
                        </InputAdornment>
                      ),
                    }}
                    helperText={error[column.name]}
                    multiline={column.multiline}
                    rows={column.multiline ? 4 : 1}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex mt-2 gap-2 justify-end">
            <Button
              className="normal-case text-gray-500 bg-white hover:bg-white font-bold"
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
