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
  dateFormatToIndonesia,
  findErrorMessageFromResponse,
  getLastURLSegment,
  isURL,
  setNumberFormat,
  validateStringInputLogic,
} from "@/utils/utilities";
import { useRouter } from "next/router";
import Loading from "@/components/modules/loading";
import {
  PostWithForm,
  PutWithForm,
  fetcher,
  get,
  triggerfetcher,
} from "@/lib/axios";
import { HttpStatusCode } from "axios";
import Status, {
  convertStatusForBatch,
  convertStatusForProposal,
} from "@/components/elements/status";
import useSWR from "swr";
import { runOnce } from "@/lib/swr";
import useSWRMutation from "swr/mutation";
import { setParamRegionFetch } from "@/utils/url";
import { FaTrashAlt } from "react-icons/fa";
import { BsCardImage } from "react-icons/bs";
import {
  constructImageURLFromImageAndNote,
  initiateUpdateImage,
  setChangeImage,
  setDeleteImage,
  setInputImageUpdate,
  validateImage,
} from "@/utils/image";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Link from "next/link";
import Image from "next/image";

const informationColumn = [
  {
    section: "Komoditas",
    tableColumn: [
      {
        id: "code",
        label: "Kode",
        customDisplayRow: (data) => data?.proposal.commodity?.code,
      },
      {
        id: "name",
        label: "Nama",
        customDisplayRow: (data) => data?.proposal.commodity?.name,
      },
      {
        id: "seed",
        label: "Benih",
        customDisplayRow: (data) => data?.proposal.commodity?.seed,
      },
      {
        id: "plantingPeriod",
        label: "Jangka waktu penanaman",
        customDisplayRow: (data) =>
          `${setNumberFormat(data?.proposal.commodity?.plantingPeriod)} hari`,
      },
      {
        id: "perennials",
        label: "Perennials",
        customDisplayRow: (data) =>
          data?.proposal.commodity?.perennials ? "Ya" : "Tidak",
      },
    ],
  },
  {
    section: "Proposal",
    tableColumn: [
      {
        id: "code",
        label: "Kode",
        customDisplayRow: (data) => data?.proposal.code,
      },
      {
        id: "name",
        label: "Nama",
        customDisplayRow: (data) => data?.proposal.name,
      },
      {
        id: "description",
        label: "Deskripsi",
        customDisplayRow: (data) =>
          data?.proposal.description || "Tidak ada deskripsi",
      },
      {
        id: "address",
        label: "Alamat",
        customDisplayRow: (data) => data?.proposal.address,
      },
      {
        id: "plantingArea",
        label: "Luas Lahan tanam",
        customDisplayRow: (data) => (
          <span>
            {setNumberFormat(data?.proposal.plantingArea)} km<sup>2</sup>
          </span>
        ),
      },
    ],
  },
  {
    section: "Periode",
    tableColumn: [
      {
        id: "_id",
        label: "ID",
        customDisplayRow: (data) => data?.batch._id,
      },
      {
        id: "name",
        label: "Nama Periode",
        customDisplayRow: (data) => data?.batch.name,
      },
      {
        id: "status",
        label: "Status",
        customDisplayRow: (data) => (
          <div className="flex items-center w-full justify-end md:justify-start">
            <Status
              type={convertStatusForBatch(data?.batch.status)}
              status={data?.batch.status}
            />
          </div>
        ),
      },
      {
        id: "createdAt",
        label: "Tanggal Mulai Tanam",
        customDisplayRow: (data) =>
          dateFormatToIndonesia(data?.batch.createdAt, false),
      },
      {
        id: "estimatedHarvestDate",
        label: "Estimasi Tanggal Panen",
        customDisplayRow: (data) =>
          dateFormatToIndonesia(data?.batch.estimatedHarvestDate, false),
      },
    ],
  },
];

const validatorColumn = [
  {
    id: "name",
    label: "Nama",
    customDisplayRow: (data) => data?.requester?.name,
  },
  {
    id: "email",
    label: "Email",
    customDisplayRow: (data) => data?.requester?.email,
  },
  {
    id: "phoneNumber",
    label: "Nomor Telepon",
    customDisplayRow: (data) => data?.requester?.phoneNumber,
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

  const [treatmentRecord, setTreatmentRecord] = useState({});
  const [input, setInput] = useState({});
  const [oldInput, setOldInput] = useState({});
  const [error, setError] = useState({
    imageURLs: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const handleImage = (e) => {
    if (input.imageURLs.length == 5) {
      setError({ ...error, message: "maksimal gambar hanya 5" });
      return;
    } else {
      let file = e.target.files[0];

      if (validateImage(file, 5)) {
        let tempInput = { ...input, imageURLs: [...input.imageURLs, file] };
        tempInput = setChangeImage(
          tempInput,
          oldInput,
          tempInput.imageURLs.length - 1
        );
        tempInput = { ...tempInput };

        setError({ ...error, message: "", imageURLs: "" });
        setInput({
          ...input,
          imageURLs: [...input.imageURLs, file],
          notes: [...input.notes, ""],
        });
      } else {
        setError({
          ...error,
          imageURLs:
            "tipe data gambar yang diperbolehkan hanya image/jpg, image/jpeg, dan image/png dan ukuran maksimal 10MB",
        });
      }
    }
  };

  const removeImage = (i) => {
    let tempInput = { ...input };
    tempInput = setDeleteImage(tempInput, oldInput, i);

    if (input.imageURLs.length == 1) {
      setInput({ ...input, imageURLs: [], notes: [] });
    } else {
      setInput({
        ...input,
        imageURLs: input.imageURLs.filter((_, index) => index != i),
        notes: input.notes.filter((_, index) => index != i),
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

    if (input.imageURLs > 5) {
      tempError.imageURLs = "Gambar yang dapat dimasukkan maksimal 5";
    } else if (input.imageURLs.length == 0) {
      tempError.imageURLs = "Gambar tidak boleh kosong";
    } else if (countNotes() != input.imageURLs.length) {
      tempError.imageURLs = "Setiap gambar harus diberi penjelasan";
    }

    if (tempError.imageURLs) {
      flag = false;
    }

    setError(tempError);
    return flag;
  };

  const setInputToAPI = () => {
    let tempInput = { ...input };
    tempInput = { ...tempInput, ...setInputImageUpdate(tempInput, 5) };
    tempInput.isChange = JSON.stringify(input.isChange);
    tempInput.isDelete = JSON.stringify(input.isDelete);

    return {
      ...tempInput,
      note1: input.notes[0],
      note2: input.notes[1],
      note3: input.notes[2],
      note4: input.notes[3],
      note5: input.notes[4],
    };
  };

  const putToAPI = async () => {
    const data = await PutWithForm(
      `/api/v1/treatment-record/${router.query.id}`,
      setInputToAPI()
    );

    if (data.status == HttpStatusCode.Ok) {
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

    if (validateInput()) {
      const isSuccess = await putToAPI();
      if (isSuccess) {
        router.push("/dashboard/treatment-record");
      } else {
        handleClick();
      }
    }
    setIsLoading(false);
  };

  const getTreatmentRecord = async () => {
    setIsLoading(true);

    const data = await get(`/api/v1/treatment-record/${router.query.id}`);

    if (data.status == HttpStatusCode.Ok) {
      setTreatmentRecord({
        ...data.data,
      });

      const imageAndNotes = constructImageURLFromImageAndNote(
        data.data.treatment || []
      );

      const tempInput = {
        imageURLs: imageAndNotes.images,
        notes: imageAndNotes.notes,
        isChange: initiateUpdateImage(5),
        isDelete: initiateUpdateImage(5),
      };

      setInput({ ...tempInput });
      setOldInput({ ...tempInput });
    } else {
      setError({
        message: data.message,
      });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (router.query.id) {
      getTreatmentRecord();
    }
  }, [router.query.id]);

  return (
    <>
      <Seo title="Pengisian Riwayat Perawatan" />
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
      {isLoading && <Loading />}
      <Dashboard roles={roleUser.farmer}>
        <h1 className="text-2xl mb-4 font-bold">Pengisian Riwayat Perawatan</h1>
        {!isLoading && treatmentRecord._id && (
          <>
            <div className=" w-full bg-white p-4 rounded-xl shadow-md mb-4">
              <h2 className="text-xl font-bold mb-4 divide-y-0">
                Informasi Periode Penanaman
              </h2>
              <div className="flex flex-col gap-4 divide-y-2">
                {informationColumn.map((section, index) => (
                  <div key={index}>
                    <h2
                      className={`text-lg font-bold ${
                        index == 0 ? "mb-2" : "my-2"
                      }`}
                    >
                      {section.section}
                    </h2>
                    <table className="w-full md:w-fit">
                      <tbody>
                        {section.tableColumn.map((column, index) => (
                          <tr key={index}>
                            <td className="flex flex-row items-center justify-between">
                              <span>{column.label}</span>
                              <span className="hidden md:flex text-right">
                                :
                              </span>
                            </td>
                            <td className="ml-2 text-right md:text-left">
                              {column.customDisplayRow
                                ? column.customDisplayRow(treatmentRecord)
                                : treatmentRecord[column.id]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
            <div className=" w-full bg-white p-4 rounded-xl mb-4">
              <h2 className="text-lg font-bold mb-2">
                Kontak Validator Pengaju
              </h2>
              <table className="w-full md:w-fit">
                <tbody>
                  {validatorColumn.map((column, index) => (
                    <tr key={index}>
                      <td className="flex flex-row items-center justify-between">
                        <span>{column.label}</span>
                        <span className="hidden md:flex text-right">:</span>
                      </td>
                      <td className="ml-2 text-right md:text-left">
                        {column.customDisplayRow
                          ? column.customDisplayRow(treatmentRecord)
                          : treatmentRecord[column.id]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="w-full bg-white rounded-xl p-4">
              <div className="w-full">
                <h2 className="text-xl font-bold mb-4 divide-y-0">
                  Formulir Pengisian
                </h2>
                <div className="mb-4">
                  <h3 className="text-lg font-bold">Instruksi</h3>
                  <table className="w-full md:w-fit">
                    <tbody>
                      <tr>
                        <td className="flex flex-row items-center justify-between font-bold">
                          <span>Tanggal Pengisian</span>
                          <span className="hidden md:flex text-right">:</span>
                        </td>
                        <td className="ml-2 text-right md:text-left">
                          {dateFormatToIndonesia(treatmentRecord?.date)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <h4 className="font-bold">Deskripsi</h4>
                  <p>{treatmentRecord?.description}</p>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <h3 className="text-lg font-bold">
                    Gambar dan Penjelasan Perawatan
                  </h3>
                  <Status status="Wajib" />
                </div>
                <span>
                  Masukkan riwayat perawatan menggunakan gambar beserta
                  penjelasan pada masing-masing gambar yang dimasukkan. Jelaskan
                  dengan sebaik mungkin agar tidak direvisi oleh validator.
                  Gambar yang dapat dimasukkan maksimal 5 dengan format JPG,
                  JPEG, dan PNG.
                </span>
                <div
                  className={`h-32 mt-2 w-full overflow-hidden relative shadow-md border-2 items-center rounded-md cursor-pointer border-gray-400 border-dotted ${
                    input.imageURLs.length >= 5 && "hidden"
                  } ${error.imageURLs && "border-red-500"}`}
                >
                  <input
                    type="file"
                    accept="image/png, image/jpg, image/jpeg"
                    onChange={handleImage}
                    className="h-full w-full opacity-0 z-10 absolute"
                    name="imageURLs"
                  />
                  <div className="h-full w-full bg-gray-200 absolute z-1 flex justify-center items-center top-0">
                    <div className="flex flex-col items-center justify-center">
                      <BsCardImage className="text-gray-400" size={30} />
                      <span className="text-sm mt-1">
                        Pilih atau tarik gambar perawatan
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-red-500 text-sm">
                  {error.imageURLs && error.imageURLs}
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {input.imageURLs.map((file, key) => (
                    <div
                      key={key}
                      className="w-full flex flex-col rounded-lg p-3 gap-2 bg-gray-200"
                    >
                      <h4 className="font-bold text-center">
                        Gambar {key + 1}
                      </h4>
                      <div className="w-full flex flex-row items-start justify-between gap-2">
                        <div>
                          <img
                            className="rounded"
                            src={isURL(file) ? file : URL.createObjectURL(file)}
                          />
                        </div>
                        <div
                          onClick={() => {
                            removeImage(key);
                          }}
                          className="bg-red-400 flex items-center cursor-pointer justify-center rounded-md ml-4 p-2"
                        >
                          <FaTrashAlt className="text-white" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">Nama gambar</span>
                        <span className="truncate w-full ">
                          {isURL(file) ? getLastURLSegment(file) : file.name}
                        </span>
                      </div>

                      <TextField
                        className="bg-white"
                        required
                        label="Catatan"
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
                className="text-white bg-[#52A068] normal-case font-bold"
                variant="contained"
                onClick={handleSubmit}
              >
                Simpan
              </Button>
            </div>
          </>
        )}
        {!isLoading && !treatmentRecord._id && (
          <div className="flex flex-col justify-center items-center">
            <Image
              src="/navigation _ location, map, destination, direction, question, lost, need help_lg.png"
              width={400}
              height={400}
              alt="Ilustrasi Not Found"
            />
            <h2 className="text-xl font-bold">
              Riwayat Perawatan tidak ditemukan
            </h2>
            <Link href="/dashboard/treatment-record">
              <span className="text-[#53A06C]">
                Kembali ke halaman daftar riwayat perawatan
              </span>
            </Link>
          </div>
        )}
      </Dashboard>
    </>
  );
};
