import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import { harvestStatus, roleUser } from "@/constant/constant";
import {
  Alert,
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
  dateFormatToIndonesia,
  getLastURLSegment,
  isURL,
  setNumberFormat,
} from "@/utils/utilities";
import { useRouter } from "next/router";
import Loading from "@/components/modules/loading";
import { PutWithForm, get } from "@/lib/axios";
import { HttpStatusCode } from "axios";
import Status, { convertStatusForBatch } from "@/components/elements/status";
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

export default () => {
  const router = useRouter();

  const formColumn = [
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

  const [harvest, setharvest] = useState({});
  const [input, setInput] = useState({});
  const [oldInput, setOldInput] = useState({});
  const [error, setError] = useState({
    imageURLs: "",
  });
  const [isLoadingGet, setIsLoadingGet] = useState(true);
  const [isLoadingPut, setIsLoadingPut] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setError({ ...error, [name]: "" });
    setInput({ ...input, [name]: value });
  };

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
      date: dayjs(input.date).format("YYYY-MM-DD"),
      condition: input.condition,
      totalHarvest: parseFloat(input.totalHarvest),
      note1: input.notes[0],
      note2: input.notes[1],
      note3: input.notes[2],
      note4: input.notes[3],
      note5: input.notes[4],
    };
  };

  const putToAPI = async () => {
    const data = await PutWithForm(
      `/api/v1/harvest/${router.query.id}`,
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
    setIsLoadingPut(true);

    if (validateInput()) {
      const isSuccess = await putToAPI();
      if (isSuccess) {
        router.push("/dashboard/harvest");
      } else {
        handleClick();
      }
    }
    setIsLoadingPut(false);
  };

  const getHarvest = async () => {
    const data = await get(`/api/v1/harvest/${router.query.id}`);

    if (data.status == HttpStatusCode.Ok) {
      setharvest({
        ...data.data,
      });

      const imageAndNotes = constructImageURLFromImageAndNote(
        data.data.harvest || []
      );

      const tempInput = {
        date: data.data.date,
        totalHarvest: data.data.totalHarvest,
        condition: data.data.condition,
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

    setIsLoadingGet(false);
  };

  useEffect(() => {
    if (router.query.id) {
      getHarvest();
    }
  }, [router.query.id]);

  return (
    <>
      <Seo title="Ubah Panen" />
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
      {(isLoadingPut || isLoadingGet) && <Loading />}
      <Dashboard roles={roleUser.farmer}>
        <h1 className="text-2xl mb-4 font-bold">Ubah Panen</h1>
        {!isLoadingGet &&
          harvest._id &&
          harvest.status != harvestStatus.approved && (
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
                                  ? column.customDisplayRow(harvest)
                                  : harvest[column.id]}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full bg-white rounded-xl p-4">
                <div className="w-full">
                  <h2 className="text-xl font-bold mb-4 divide-y-0">
                    Formulir Pengisian
                  </h2>
                  <div className="flex flex-row justify-between sm:justify-start gap-2">
                    <h3 className="font-semibold">Tanggal panen:</h3>
                    <span>{dateFormatToIndonesia(harvest.date)}</span>
                  </div>
                  {harvest.revisionNote && (
                    <>
                      <h3 className="font-semibold">Catatan Revisi</h3>
                      <p className="mb-4">{harvest.revisionNote}</p>
                    </>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4">
                      {formColumn.map((column) => (
                        <div className="flex flex-col">
                          <div className="flex flex-row items-center gap-2">
                            <h2 className="text-lg font-bold">
                              {column.label}
                            </h2>
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
                                    ? column.optionsWithData(
                                        commodityData?.data
                                      )
                                    : column.optionsWithData(batchData?.data)
                                  : column.options.map((option) => (
                                      <MenuItem
                                        key={option.value}
                                        value={option.value}
                                      >
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
                    <div>
                      <div className="flex flex-row items-center gap-2">
                        <h3 className="text-lg font-bold">
                          Gambar dan Penjelasan Panen
                        </h3>
                        <Status status="Wajib" />
                      </div>
                      <span>
                        Masukkan panen menggunakan gambar beserta penjelasan
                        pada masing-masing gambar yang dimasukkan. Jelaskan
                        dengan sebaik mungkin agar tidak direvisi oleh
                        validator. Gambar yang dapat dimasukkan maksimal 5
                        dengan format JPG, JPEG, dan PNG.
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
                              Pilih atau tarik gambar panen
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-red-500 text-sm">
                        {error.imageURLs && error.imageURLs}
                      </span>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
                        {input.imageURLs.map((file, key) => (
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
                                  src={
                                    isURL(file)
                                      ? file
                                      : URL.createObjectURL(file)
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold">Nama gambar</span>
                              <span className="truncate w-full ">
                                {isURL(file)
                                  ? getLastURLSegment(file)
                                  : file.name}
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
        {!isLoadingGet && !harvest._id && (
          <div className="flex flex-col justify-center items-center">
            <Image
              src="/navigation _ location, map, destination, direction, question, lost, need help_lg.png"
              width={400}
              height={400}
              alt="Ilustrasi Not Found"
            />
            <h2 className="text-xl font-bold">Panen tidak ditemukan</h2>
            <Link href="/dashboard/harvest">
              <span className="text-[#53A06C]">
                Kembali ke halaman daftar panen
              </span>
            </Link>
          </div>
        )}
        {!isLoadingGet &&
          harvest._id &&
          harvest.status == harvestStatus.approved && (
            <div className="flex flex-col justify-center items-center">
              <Image
                src="/navigation _ location, map, destination, direction, question, lost, need help_lg.png"
                width={400}
                height={400}
                alt="Ilustrasi Not Found"
              />
              <h2 className="text-xl font-bold">Panen sudah diterima</h2>
              <Link href="/dashboard/harvest">
                <span className="text-[#53A06C]">
                  Kembali ke halaman daftar panen
                </span>
              </Link>
            </div>
          )}
      </Dashboard>
    </>
  );
};
