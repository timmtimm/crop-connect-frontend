import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import { roleUser } from "@/constant/constant";
import {
  Alert,
  Button,
  InputAdornment,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { BsCardImage } from "react-icons/bs";
import { FaTrashAlt } from "react-icons/fa";
import Slide from "@mui/material/Slide";
import {
  checkObjectIsNotNullExist,
  findErrorMessageFromResponse,
  validateStringInputLogic,
} from "@/utils/utilities";
import { useRouter } from "next/router";
import Loading from "@/components/modules/loading";
import { PostWithForm } from "@/lib/axios";
import { HttpStatusCode } from "axios";
import Status from "@/components/elements/status";
import { validateImage, setInputImageCreate } from "@/utils/image";

const formColumn = [
  {
    name: "name",
    label: "Nama Komoditas",
    placeholder: "Kopi",
    description:
      "Nama komoditas digunakan untuk menampilkan jenis komoditas yang dijual. Disarankan untuk tidak menggunakan huruf kapital berlebih dan kata-kata promosi.",
    type: "text",
    isPrice: false,
    isDay: false,
    multiline: false,
    required: true,
  },
  {
    name: "seed",
    label: "Benih",
    placeholder: "Arabika",
    description: "Benih yang digunakan untuk menanam komoditas ini.",
    type: "text",
    isPrice: false,
    isDay: false,
    multiline: false,
    required: true,
  },
  {
    name: "isPerennials",
    label: "Perennial",
    placeholder: "",
    description:
      "Apakah komoditas yang dibuat merupakan tanaman tahunan? Tanaman perennial bisa berbunga dan bertahan hidup selama bertahun-tahun. Contoh: kopi, coklat, teh, dan lain-lain.",
    type: "text",
    isPrice: false,
    isDay: false,
    multiline: false,
    required: true,
    isSelect: true,
    options: [
      { value: true, label: "Ya" },
      { value: false, label: "Tidak" },
    ],
  },
  {
    name: "description",
    label: "Deskripsi",
    placeholder: "Kopi Arabika adalah...",
    description:
      "Pastikan deskripsi komoditas memuat penjelasan detail terkait komoditasmu agar pembeli mudah mengerti komoditasmu.",
    type: "text",
    isPrice: false,
    isDay: false,
    multiline: true,
    required: false,
  },
  {
    name: "plantingPeriod",
    label: "Masa tanam",
    placeholder: "300",
    description:
      "Perkiraan masa penanaman komoditas yang dijual sampai waktu panen tiba. Masa tanam yang dimasukkan berupa satuan hari.",
    type: "number",
    isPrice: false,
    isDay: true,
    multiline: false,
    required: true,
  },
  {
    name: "pricePerKg",
    label: "Harga per kilogram",
    placeholder: "100000",
    description: `Harga per kilogram komoditas yang dijual. Disarankan untuk melakukan pengecekan harga indeks komoditas terlebih dahulu agar dapat memberikan harga yang bersaing. Harga yang dimasukkan berupa satuan rupiah.`,
    type: "number",
    isPrice: true,
    isDay: false,
    multiline: false,
    required: true,
  },
  {
    name: "isAvailable",
    label: "Tersedia",
    placeholder: "",
    description:
      "Apakah komoditas yang dibuat tersedia untuk ditransaksikan saat ini?",
    type: "text",
    isPrice: false,
    isDay: false,
    multiline: false,
    required: true,
    isSelect: true,
    options: [
      { value: true, label: "Ya" },
      { value: false, label: "Tidak" },
    ],
  },
];

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

  const [input, setInput] = useState({
    name: "",
    seed: "",
    description: "",
    plantingPeriod: "",
    pricePerKg: "",
    images: [],
    isPerennials: false,
    isAvailable: true,
  });
  const [error, setError] = useState({
    message: "",
    name: "",
    seed: "",
    description: "",
    plantingPeriod: "",
    pricePerKg: "",
    images: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setError({ ...error, [name]: "" });
    setInput({ ...input, [name]: value });
  };

  const handleImage = (e) => {
    if (input.images.length == 5) {
      setError({ ...error, message: "maksimal gambar hanya 5" });
      return;
    } else {
      let file = e.target.files[0];

      if (validateImage(file, 5)) {
        setError({ ...error, message: "" });
        setInput({ ...input, images: [...input.images, file] });
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

  const validateInput = () => {
    let flag = true;
    let tempError = {};

    tempError.name = validateStringInputLogic(input.name, true, {
      empty: "Nama komoditas tidak boleh kosong",
      invalid: "",
    });
    tempError.seed = validateStringInputLogic(input.seed, true, {
      empty: "Benih tidak boleh kosong",
      invalid: "",
    });
    tempError.plantingPeriod = validateStringInputLogic(
      input.plantingPeriod,
      !isNaN(input.plantingPeriod),
      {
        empty: "Masa tanam tidak boleh kosong",
        invalid: "Masa tanam harus berupa angka",
      }
    );
    tempError.pricePerKg = validateStringInputLogic(
      input.pricePerKg,
      !isNaN(input.pricePerKg),
      {
        empty: "Harga per kilogram tidak boleh kosong",
        invalid: "Harga per kilogram harus berupa angka",
      }
    );

    if (
      checkObjectIsNotNullExist(tempError, [
        "name",
        "seed",
        "plantingPeriod",
        "pricePerKg",
      ])
    ) {
      flag = false;
    }

    setError(tempError);
    return flag;
  };

  const postToAPI = async () => {
    const data = await PostWithForm("/api/v1/commodity", {
      name: input.name,
      seed: input.seed,
      description: input.description,
      plantingPeriod: input.plantingPeriod,
      pricePerKg: input.pricePerKg,
      isPerennials: input.isPerennials,
      isAvailable: input.isAvailable,
      ...setInputImageCreate(input.images, 5),
    });

    if (data.status == HttpStatusCode.Created) {
      return true;
    } else {
      setError({
        ...error,
        message: data.message,
        name: findErrorMessageFromResponse(data?.error, "name"),
        seed: findErrorMessageFromResponse(data?.error, "seed"),
        description: findErrorMessageFromResponse(data?.error, "description"),
        plantingPeriod: findErrorMessageFromResponse(
          data?.error,
          "plantingPeriod"
        ),
        pricePerKg: findErrorMessageFromResponse(data?.error, "pricePerKg"),
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
        router.push("/dashboard/commodity");
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
          name: "",
          seed: "",
          description: "",
          pricePerKg: "",
          images: [],
        });
      }

      handleClick();
    }

    setIsLoading(false);
  };

  return (
    <>
      <Seo title="Tambah Komoditas" />
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
          severity={
            error.message ||
            checkObjectIsNotNullExist(error, [
              "name",
              "seed",
              "description",
              "plantingPeriod",
              "pricePerKg",
            ])
              ? "error"
              : "success"
          }
          sx={{ width: "100%" }}
        >
          {error.message ||
          checkObjectIsNotNullExist(error, [
            "name",
            "seed",
            "description",
            "plantingPeriod",
            "pricePerKg",
          ])
            ? error.message
            : "Berhasil menambah komoditas"}
        </Alert>
      </Snackbar>
      {isLoading && <Loading />}
      <Dashboard roles={roleUser.farmer}>
        <h1 className="text-2xl mb-4 font-bold">Tambah Komoditas</h1>
        <div className="w-full bg-white rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4 w-full">
              {formColumn.map((column) => (
                <div className="flex flex-col">
                  <div className="flex flex-row items-center gap-2">
                    <h2 className="text-lg font-bold">{column.label}</h2>
                    {column.required && <Status status="Wajib" />}
                  </div>
                  <span className="mb-2">{column.description}</span>
                  {column.isSelect ? (
                    <Select
                      className="w-full"
                      value={input[column.name]}
                      onChange={handleChange}
                      name={column.name}
                    >
                      {column.options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <TextField
                      error={error[column.name] ? true : false}
                      name={column.name}
                      placeholder={column.placeholder}
                      onChange={handleChange}
                      type={column.type || "text"}
                      value={input[column.name]}
                      InputProps={{
                        startAdornment: column?.isPrice && (
                          <InputAdornment position="start">Rp</InputAdornment>
                        ),
                        endAdornment: column?.isDay && (
                          <InputAdornment position="end">hari</InputAdornment>
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
              <h2 className="text-lg font-bold">Gambar Komoditas</h2>
              <span>
                Pilih foto komoditas atau tarik dan letakkan di sini. Format
                gambar .jpg .jpeg .png dan disarankan menggunakan gambar dengan
                resolusi lebar dan panjang yang sama. Pilih foto komoditas yang
                menarik sehingga bisa menarik perhatian pembeli. Maksimal Gambar
                yang dapat dimasukkan 5 gambar.
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
                      Pilih atau tarik gambar komoditas
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
                    <div className="w-full flex flex-row items-start justify-between gap-2">
                      <div>
                        <img
                          className="rounded"
                          src={URL.createObjectURL(file)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">Nama gambar</span>
                      <span className="truncate w-full ">{file.name}</span>
                    </div>
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
