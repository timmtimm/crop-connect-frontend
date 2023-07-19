import Seo from "@/components/elements/seo";
import Dashboard from "@/components/layouts/dashboard";
import { roleUser } from "@/constant/constant";
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
  checkObjectIsNotNullExist,
  dateFormatToIndonesia,
  findErrorMessageFromResponse,
  setNumberFormat,
  validateStringInputLogic,
} from "@/utils/utilities";
import { useRouter } from "next/router";
import Loading from "@/components/modules/loading";
import { fetcher, postWithJSON } from "@/lib/axios";
import { HttpStatusCode } from "axios";
import Status, {
  convertStatusForBatch,
  convertStatusForProposal,
} from "@/components/elements/status";
import useSWR from "swr";
import { runOnce } from "@/lib/swr";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import NotFound from "@/components/templates/notFound";

const informationColumn = [
  {
    section: "Petani",
    tableColumn: [
      {
        id: "_id",
        label: "ID",
        customDisplayRow: (data) => data?.proposal.commodity?.farmer?._id,
      },
      {
        id: "name",
        label: "Nama",
        customDisplayRow: (data) => data?.proposal.commodity?.farmer?.name,
      },
      {
        id: "email",
        label: "Email",
        customDisplayRow: (data) => data?.proposal.commodity?.farmer?.email,
      },
      {
        id: "phoneNumber",
        label: "Nomor Telepon",
        customDisplayRow: (data) =>
          data?.proposal.commodity?.farmer?.phoneNumber,
      },
    ],
  },
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
        id: "status",
        label: "Status",
        customDisplayRow: (data) => (
          <div className="flex items-center w-full justify-end md:justify-start">
            <Status
              type={convertStatusForProposal(data?.proposal.status)}
              status={data?.proposal.status}
            />
          </div>
        ),
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
            {setNumberFormat(data?.proposal.plantingArea)} m<sup>2</sup>
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
        customDisplayRow: null,
      },
      {
        id: "name",
        label: "Nama Periode",
        customDisplayRow: null,
      },
      {
        id: "status",
        label: "Status",
        customDisplayRow: (data) => (
          <div className="flex items-center w-full justify-end md:justify-start">
            <Status
              type={convertStatusForBatch(data?.status)}
              status={data?.status}
            />
          </div>
        ),
      },
      {
        id: "createdAt",
        label: "Tanggal Mulai Tanam",
        customDisplayRow: (data) =>
          dateFormatToIndonesia(data?.createdAt, false),
      },
      {
        id: "estimatedHarvestDate",
        label: "Estimasi Tanggal Panen",
        customDisplayRow: (data) =>
          dateFormatToIndonesia(data?.estimatedHarvestDate, false),
      },
    ],
  },
];

export default () => {
  const router = useRouter();

  const formColumn = [
    {
      name: "description",
      label: "Deskripsi pengisian",
      placeholder: "Silahkan masukkan foto komoditas beserta penjelasannya...",
      description:
        "Masukkan deskripsi yang digunakan sebagai instruksi petani untuk pengisian pada riwayat perawatan ini. Jelaskan sebaik mungkin agar tidak ada revisi dari petani.",
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
    date: dayjs().add(1, "day"),
    description: "",
  });
  const [error, setError] = useState({
    date: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setError({ ...error, [name]: "" });
    setInput({ ...input, [name]: value });
  };

  const handleDate = ({ target: { name, value } }) => {
    setInput({ ...input, [name]: value });
  };

  const validateInput = () => {
    let flag = true;
    let tempError = {};

    tempError.description = validateStringInputLogic(input.description, true, {
      empty: "Deskripsi pengisian harus diisi",
      invalid: "",
    });

    if (checkObjectIsNotNullExist(tempError, ["description"])) {
      flag = false;
    }

    setError(tempError);
    return flag;
  };

  const postToAPI = async () => {
    const data = await postWithJSON(
      `/api/v1/treatment-record/${router.query.id}`,
      {
        date: input.date.format("YYYY-MM-DD"),
        description: input.description,
      }
    );

    if (data.status == HttpStatusCode.Created) {
      return true;
    } else {
      setError({
        ...error,
        message: data.message,
        date: findErrorMessageFromResponse(data?.error, "date"),
        description: findErrorMessageFromResponse(data?.error, "description"),
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
        router.push("/dashboard/validation-treatment-record");
      } else {
        handleClick();
      }
    }

    setIsLoading(false);
  };

  const { data: batchData, isLoading: batchLoading } = useSWR(
    [`/api/v1/batch/${router.query.id}`, {}],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  useEffect(() => {
    if (input.commodityID) {
      setInput({ ...input, batchID: "" });
      triggerBatch();
    }
  }, [input.commodityID]);

  return (
    <>
      <Seo title="Permintaan Pengisian Riwayat Perawatan" />
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
      {(isLoading || batchLoading) && <Loading />}
      <Dashboard roles={roleUser.validator}>
        <h1 className="text-2xl mb-4 font-bold">
          Permintaan Pengisian Riwayat Perawatan
        </h1>
        {!batchLoading && batchData?.status != HttpStatusCode.Ok && (
          <NotFound
            content="Periode Penanaman"
            urlRedirect="/dashboard/validation-treatment-record"
            redirectPageTitle="daftar riwayat perawatan"
          />
        )}
        {!batchLoading && batchData?.status == HttpStatusCode.Ok && (
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
                                ? column.customDisplayRow(batchData?.data)
                                : batchData?.data[column.id]}
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
              <h2 className="text-xl font-bold mb-4">Formulir Pengisian</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <div className="flex flex-row items-center gap-2">
                    <h2 className="text-lg font-bold">Tanggal Pengisian</h2>
                    <Status status="Wajib" />
                  </div>
                  <span className="mb-2">
                    Masukkan tanggal pengisian riwayat perawatan
                  </span>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      minDate={dayjs().add(1, "day")}
                      value={dayjs(input.date)}
                      views={["year", "month", "day"]}
                      onChange={(newValue) => {
                        handleDate({
                          target: {
                            name: "date",
                            value: dayjs(newValue),
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
                          {column.options.map((option) => (
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
                  className="text-white bg-[#52A068] normal-case font-bold"
                  variant="contained"
                  onClick={handleSubmit}
                >
                  Simpan
                </Button>
              </div>
            </div>
          </>
        )}
      </Dashboard>
    </>
  );
};
