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
  isValidDate,
  checkObjectIsNotNullExist,
  findErrorMessageFromResponse,
  validateStringInputLogic,
  isURL,
} from "@/utils/utilities";
import { useRouter } from "next/router";
import Loading from "@/components/modules/loading";
import { PostWithForm, fetcher, triggerfetcher } from "@/lib/axios";
import { HttpStatusCode } from "axios";
import Status from "@/components/elements/status";
import useSWR from "swr";
import { runOnce } from "@/lib/swr";
import useSWRMutation from "swr/mutation";
import { setParamRegionFetch } from "@/utils/url";
import { FaTrashAlt } from "react-icons/fa";
import { BsCardImage } from "react-icons/bs";
import { setInputImageCreate, validateImage } from "@/utils/image";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default () => {
  const router = useRouter();

  const formColumn = [
    {
      name: "commodityID",
      label: "Komoditas",
      placeholder: "",
      description: "Pilih komoditas yang akan dijual pada proposal ini.",
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
      name: "batchID",
      label: "Periode",
      placeholder: "",
      description: "Pilih periode yang akan dijual pada proposal ini.",
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
                  name: "batchID",
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
      name: "totalHarvest",
      label: "Total Panen",
      placeholder: "",
      description:
        "Masukkan total panen yang dihasilkan pada pada periode penanaman ini.",
      type: "number",
      prefix: null,
      suffix: "kg",
      multiline: false,
      required: true,
    },
    {
      name: "condition",
      label: "Kondisi Panen",
      placeholder: "Kondisi panen yang dihasilkan ...",
      description:
        "Masukkan Kondisi panen yang dihasilkan. Deskrsikan sebaik mungkin agar tidak ada perbaikan yang diminta dari validator.",
      type: "text",
      prefix: null,
      suffix: null,
      multiline: true,
      required: true,
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
    date: dayjs(),
    totalHarvest: "",
    condition: "",
    images: [],
    notes: [],
  });
  const [error, setError] = useState({
    commodityID: "",
    date: "",
    totalHarvest: "",
    condition: "",
    images: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setError({ ...error, [name]: "" });
    setInput({ ...input, [name]: value });
  };

  const handleDate = ({ target: { name, value } }) => {
    if (!isValidDate(value)) {
      setError({ ...error, [name]: "Tanggal yang dimasukkan tidak valid" });
    }

    setInput({ ...input, [name]: value });
  };

  const handleImage = (e) => {
    if (input.images.length == 5) {
      setError({ ...error, message: "maksimal gambar hanya 5" });
      return;
    } else {
      let file = e.target.files[0];

      if (validateImage(file, 5)) {
        setError({ ...error, message: "", images: "" });
        setInput({
          ...input,
          images: [...input.images, file],
          notes: [...input.notes, ""],
        });
      } else {
        setError({
          ...error,
          images:
            "tipe data gambar yang diperbolehkan hanya image/jpg, image/jpeg, dan image/png dan ukuran maksimal 10MB",
        });
      }
    }
  };

  const removeImage = (i) => {
    if (input.images.length == 1) {
      setInput({ ...input, images: [] });
    } else {
      setInput({
        ...input,
        images: input.images.filter((_, index) => index != i),
      });
    }
  };

  const handleNotes = (e, i) => {
    let tempNotes = [...input.notes];
    tempNotes[i] = e.target.value;
    setInput({ ...input, notes: tempNotes });
  };

  const countNotes = () => {
    let count = 0;
    input.notes.forEach((note) => {
      if (note) count++;
    });
    return count;
  };

  const validateInput = () => {
    let flag = true;
    let tempError = {};

    tempError.commodityID = validateStringInputLogic(input.commodityID, true, {
      empty: "Komoditas tidak boleh kosong",
      invalid: "",
    });
    tempError.batchID = validateStringInputLogic(input.batchID, true, {
      empty: "Periode tidak boleh kosong",
      invalid: "",
    });
    tempError.totalHarvest = validateStringInputLogic(
      input.totalHarvest,
      !isNaN(input.totalHarvest),
      {
        empty: "Total panen tidak boleh kosong",
        invalid: "Total panen harus berupa angka",
      }
    );
    tempError.condition = validateStringInputLogic(input.condition, true, {
      empty: "Kondisi panen tidak boleh kosong",
      invalid: "",
    });
    if (input.images > 5) {
      tempError.images = "Gambar yang dapat dimasukkan maksimal 5";
    } else if (input.images.length == 0) {
      tempError.images = "Gambar tidak boleh kosong";
    } else if (countNotes() != input.images.length) {
      tempError.images = "Setiap gambar harus diberi penjelasan";
    }

    if (
      checkObjectIsNotNullExist(tempError, [
        "commodityID",
        "batchID",
        "date",
        "totalHarvest",
        "condition",
        "images",
      ])
    ) {
      flag = false;
    }

    setError(tempError);
    return flag;
  };

  const postToAPI = async () => {
    const data = await PostWithForm(`/api/v1/harvest/${input.batchID}`, {
      ...setInputImageCreate(input.images, 5),
      date: dayjs(input.date).format("YYYY-MM-DD"),
      condition: input.condition,
      totalHarvest: parseFloat(input.totalHarvest),
      note1: input.notes[0],
      note2: input.notes[1],
      note3: input.notes[2],
      note4: input.notes[3],
      note5: input.notes[4],
    });

    if (data.status == HttpStatusCode.Created) {
      return true;
    } else {
      setError({
        ...error,
        message: data.message,
        date: findErrorMessageFromResponse(data?.error, "date"),
        totalHarvest: findErrorMessageFromResponse(data?.error, "totalHarvest"),
        condition: findErrorMessageFromResponse(data?.error, "condition"),
      });
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (validateInput()) {
      const isSuccess = await postToAPI();
      if (isSuccess) {
        router.push("/dashboard/harvest");
      } else {
        handleClick();
      }
    }
    setIsLoading(false);
  };

  const handleSubmitAgain = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (validateInput()) {
      const isSuccess = await postToAPI();
      if (isSuccess) {
        setInput({
          commodityID: "",
          date: dayjs(),
          totalHarvest: 0,
          condition: "",
          images: [],
          notes: [],
        });
      }

      handleClick();
    }

    setIsLoading(false);
  };

  const { data: commodityData, isLoading: commodityLoading } = useSWR(
    ["/api/v1/commodity/farmer", {}],
    ([url, params]) => fetcher(url, params),
    runOnce
  );
  const {
    data: batchData,
    trigger: triggerBatch,
    isMutating: mutatingBatch,
  } = useSWRMutation(
    `/api/v1/batch/harvest/${input.commodityID}`,
    triggerfetcher
  );

  useEffect(() => {
    if (input.commodityID) {
      setInput({ ...input, batchID: "" });
      triggerBatch();
    }
  }, [input.commodityID]);

  return (
    <>
      <Seo title="Tambah Panen" />
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
          {error.message ? error.message : "Berhasil menambah proposal"}
        </Alert>
      </Snackbar>
      {(isLoading || commodityLoading || mutatingBatch) && <Loading />}
      <Dashboard roles={roleUser.farmer}>
        <h1 className="text-2xl mb-4 font-bold">Tambah Panen</h1>
        <Alert className="mb-4 border-[1px] border-[#0288D1]" severity="info">
          <AlertTitle className="font-semibold">Informasi</AlertTitle>
          <span>
            Pengisian hasil panen diizinkan jika periode telah melakukan
            pengisian dengan minimal sebanyak sekali.
          </span>
        </Alert>
        <div className="w-full bg-white rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col">
                <div className="flex flex-row items-center gap-2">
                  <h2 className="text-lg font-bold">Tanggal Panen</h2>
                  <Status status="Wajib" />
                </div>
                <span className="mb-2">Masukkan tanggal panen</span>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    maxDate={dayjs()}
                    value={dayjs(input.date)}
                    views={["year", "month", "day"]}
                    onChange={(newValue) => {
                      handleDate({
                        target: {
                          name: "date",
                          value: dayjs(newValue).format("YYYY-MM-DD"),
                        },
                      });
                    }}
                  />
                </LocalizationProvider>
              </div>
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
                        value={input[column.name] || ""}
                        onChange={handleChange}
                        name={column.name}
                      >
                        {column.optionsWithData
                          ? column.name == "commodityID"
                            ? column.optionsWithData(commodityData?.data)
                            : column.optionsWithData(batchData?.data)
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
            <div className="w-full">
              <div className="flex flex-row items-center gap-2">
                <h2 className="text-lg font-bold">
                  Gambar dan Penjelasan Hasil Panen
                </h2>
                <Status status="Wajib" />
              </div>
              <span>
                Masukkan hasil dari panen pada periode ini menggunakan gambar
                beserta penjelasan pada masing-masing gambar yang dimasukkan.
                Jelaskan dengan sebaik mungkin agar tidak direvisi oleh
                validator. Gambar yang dapat dimasukkan maksimal 5 dengan format
                JPG, JPEG, dan PNG.
              </span>
              <div
                className={`h-32 mt-2 w-full overflow-hidden relative shadow-md border-2 items-center rounded-md cursor-pointer border-gray-400 border-dotted ${
                  input.images.length >= 5 && "hidden"
                } ${error.images && "border-red-500"}`}
              >
                <input
                  type="file"
                  accept="image/png, image/jpg, image/jpeg"
                  onChange={handleImage}
                  className="h-full w-full opacity-0 z-10 absolute"
                  name="images"
                />
                <div className="h-full w-full bg-gray-200 absolute z-1 flex justify-center items-center top-0">
                  <div className="flex flex-col items-center justify-center">
                    <BsCardImage className="text-gray-400" size={30} />
                    <span className="text-sm mt-1">
                      Pilih atau tarik gambar panen
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-red-500 text-sm">
                {error.images && error.images}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {input.images.map((file, key) => (
                  <div
                    key={key}
                    className="w-full flex flex-col rounded-lg p-3 gap-2 bg-gray-200"
                  >
                    <div className="flex flex-row justify-between w-full items-center">
                      <h4 className="font-bold text-center">
                        Gambar {key + 1}
                      </h4>
                      <div
                        onClick={() => {
                          removeImage(key);
                        }}
                        className="bg-red-400 flex items-center cursor-pointer justify-center rounded-md ml-4 p-2"
                      >
                        <FaTrashAlt className="text-white" />
                      </div>
                    </div>

                    <div className="w-full">
                      <div>
                        <img
                          className="rounded"
                          src={isURL(file) ? file : URL.createObjectURL(file)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">Nama gambar</span>
                      <span className="truncate w-full ">{file.name}</span>
                    </div>

                    <TextField
                      className="bg-white"
                      required
                      label="Deskripsi"
                      key={key}
                      value={input.notes[key]}
                      onChange={(e) => {
                        handleNotes(e, key);
                      }}
                      multiline
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex mt-2 gap-2 justify-end">
            <Button
              className="normal-case text-gray-500 hover:bg-white font-bold"
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
