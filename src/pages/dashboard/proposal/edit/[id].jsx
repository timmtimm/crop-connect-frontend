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
  findErrorMessageFromResponse,
  validateStringInputLogic,
} from "@/utils/utilities";
import { useRouter } from "next/router";
import Loading from "@/components/modules/loading";
import {
  fetcher,
  get,
  postWithJSON,
  putWithJSON,
  triggerfetcher,
} from "@/lib/axios";
import { HttpStatusCode } from "axios";
import Status from "@/components/elements/status";
import useSWR from "swr";
import { runOnce } from "@/lib/swr";
import useSWRMutation from "swr/mutation";
import { setParamRegionFetch } from "@/utils/url";

export default () => {
  const router = useRouter();
  const { id } = router.query;

  const [formColumn, setFormColumn] = useState([
    {
      name: "commodityName",
      label: "Komoditas",
      placeholder: "",
      description: "Pilih komoditas yang akan dijual pada proposal ini.",
      type: null,
      prefix: null,
      suffix: null,
      multiline: false,
      required: true,
      disabled: true,
      isSelect: false,
    },
    {
      name: "name",
      label: "Nama",
      placeholder: "Proposal A",
      description:
        "Nama komoditas digunakan untuk menampilkan jenis komoditas yang dijual. Disarankan untuk tidak menggunakan huruf kapital berlebih dan kata-kata promosi.",
      type: "text",
      prefix: null,
      suffix: null,
      multiline: false,
      required: true,
    },
    {
      name: "description",
      label: "Deskripsi",
      placeholder: "Proposal ini berisi...",
      description:
        "Deskripsikan proposal ini sebaik mungin agar dapat menarik minat pembeli serta memudahkan pembeli untuk memahami proposal ini.",
      type: "text",
      prefix: null,
      suffix: null,
      multiline: true,
      required: false,
    },
    {
      name: "estimatedTotalHarvest",
      label: "Estimasi berat panen",
      placeholder: 1000,
      description:
        "Estimasi berat panen yang akan dihasilkan dari proposal ini. Estimasi berat panen yang dimasukkan berupa satuan kilogram.",
      type: "number",
      prefix: null,
      suffix: "kg",
      multiline: false,
      required: true,
      isSelect: false,
    },
    {
      name: "address",
      label: "Alamat lahan",
      placeholder: "Jl. Jendral Sudirman No. 1",
      description:
        "Alamat lahan yang digunakan untuk menanam komoditas yang dijual pada proposal ini.",
      type: "text",
      prefix: null,
      suffix: null,
      multiline: false,
      required: true,
      isSelect: false,
    },
    {
      name: "plantingArea",
      label: "Luas lahan tanam",
      placeholder: 1000,
      description:
        "Luas lahan tanam yang digunakan untuk menanam komoditas yang dijual pada proposal ini. Luas lahan tanam yang dimasukkan berupa satuan kilometer persegi.",
      type: "number",
      prefix: null,
      suffix: (
        <span>
          km<sup>2</sup>
        </span>
      ),
      multiline: false,
      required: true,
    },
    {
      name: "isAvailable",
      label: "Tersedia",
      placeholder: "",
      description:
        "Apakah proposal yang dibuat tersedia untuk ditransaksikan saat ini?",
      type: "text",
      prefix: null,
      suffix: null,
      disabled: false,
      isBoolean: true,
      required: true,
      isSelect: true,
      options: [
        { value: true, label: "Ya" },
        { value: false, label: "Tidak" },
      ],
    },
  ]);

  /* Snackbar */
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const [input, setInput] = useState({});
  const [error, setError] = useState({
    message: "",
    name: "",
    description: "",
    estimatedTotalHarvest: "",
    plantingArea: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const handleChange = ({ target: { name, value } }) => {
    setError({ ...error, [name]: "" });
    setInput({ ...input, [name]: value });
  };

  const getProposal = async () => {
    setIsLoading(true);

    const data = await get(`/api/v1/proposal/${id}`);

    if (data.status == HttpStatusCode.Ok) {
      setInput({
        ...data.data,
        regionID: data.data.region._id,
        commodityName: data.data.commodity.name,
      });
      setRegion({
        country: data.data.region.country,
        province: data.data.region.province,
        regency: data.data.region.regency,
        district: data.data.region.district,
        subdistrict: data.data.region.subdistrict,
      });
      let tempFormColumn = [...formColumn];
      tempFormColumn[6].disabled = data.data.commodity.isPerennials;
      setFormColumn([...tempFormColumn]);
    } else {
      setError({
        message: data.message,
      });
    }

    setIsLoading(false);
  };

  /* Region */
  const [region, setRegion] = useState({
    country: "Indonesia",
    province: null,
    regency: null,
    district: null,
    subdistrict: null,
  });
  const [oldRegion, setOldRegion] = useState(region);

  const handleChangeRegion = ({ target: { name, value } }) => {
    setRegion({ ...region, [name]: value });
    setError({ ...error, [name]: "" });
  };

  const { data: province, isLoading: provinceLoading } = useSWR(
    ["/api/v1/region/province", { country: region.country }],
    ([url, params]) => fetcher(url, params),
    runOnce
  );

  const {
    data: regency,
    trigger: triggerRegency,
    isMutating: mutatingRegency,
  } = useSWRMutation("/api/v1/region/regency", triggerfetcher);
  const {
    data: district,
    trigger: triggerDistrict,
    isMutating: mutatingDistrict,
  } = useSWRMutation("/api/v1/region/district", triggerfetcher);
  const {
    data: subdistrict,
    trigger: triggerSubdistrict,
    isMutating: mutatingSubdistrict,
  } = useSWRMutation("/api/v1/region/sub-district", triggerfetcher);

  useEffect(() => {
    if (
      (regency &&
        region.province != null &&
        region.province != oldRegion.province) ||
      (!regency && region.province != null)
    ) {
      triggerRegency(setParamRegionFetch(region, "regency"));
      setRegion({
        ...region,
        regency: null,
        district: null,
        subdistrict: null,
      });
    }

    if (
      (district && region.regency && region.regency != oldRegion.regency) ||
      (!district && region.regency)
    ) {
      triggerDistrict(setParamRegionFetch(region, "district"));
      setRegion({ ...region, district: null, subdistrict: null });
    }

    if (
      (subdistrict &&
        region.district &&
        region.district != oldRegion.district) ||
      (!subdistrict && region.district)
    ) {
      triggerSubdistrict(setParamRegionFetch(region, "subdistrict"));
      setRegion({ ...region });
    }

    setOldRegion(region);
  }, [region.province, region.regency, region.district]);

  const validateInput = () => {
    let flag = true;
    let tempError = {};

    tempError.name = validateStringInputLogic(input.name, true, {
      empty: "Nama proposal tidak boleh kosong",
      invalid: "",
    });
    tempError.estimatedTotalHarvest = validateStringInputLogic(
      input.estimatedTotalHarvest,
      !isNaN(input.estimatedTotalHarvest),
      {
        empty: "Estimasi berat panen tidak boleh kosong",
        invalid: "Estimasi berat panen harus berupa angka",
      }
    );
    tempError.plantingArea = validateStringInputLogic(
      input.plantingArea,
      !isNaN(input.plantingArea),
      {
        empty: "Luas lahan tanam tidak boleh kosong",
        invalid: "Luas lahan tanam harus berupa angka",
      }
    );
    tempError.address = validateStringInputLogic(input.address, true, {
      empty: "Alamat lahan tidak boleh kosong",
      invalid: "",
    });

    tempError.province = validateStringInputLogic(region.province, true, {
      empty: "Provinsi tidak boleh kosong",
      invalid: "",
    });
    tempError.regency = validateStringInputLogic(region.regency, true, {
      empty: "Kabupaten tidak boleh kosong",
      invalid: "",
    });
    tempError.district = validateStringInputLogic(region.district, true, {
      empty: "Kecamatan tidak boleh kosong",
      invalid: "",
    });
    tempError.subdistrict = validateStringInputLogic(region.subdistrict, true, {
      empty: "Kelurahan tidak boleh kosong",
      invalid: "",
    });

    if (
      checkObjectIsNotNullExist(tempError, [
        "name",
        "estimatedTotalHarvest",
        "plantingArea",
        "address",
        "province",
        "regency",
        "district",
        "subdistrict",
      ])
    ) {
      flag = false;
    }

    setError(tempError);
    return flag;
  };

  const putToAPI = async () => {
    const data = await putWithJSON(`/api/v1/proposal/${id}`, {
      ...input,
      estimatedTotalHarvest: parseFloat(input.estimatedTotalHarvest),
      plantingArea: parseFloat(input.plantingArea),
    });

    if (data.status == HttpStatusCode.Ok) {
      return true;
    } else {
      setError({
        ...error,
        message: data.message,
        name: findErrorMessageFromResponse(data?.error, "name"),
        estimatedTotalHarvest: findErrorMessageFromResponse(
          data?.error,
          "estimatedTotalHarvest"
        ),
        plantingArea: findErrorMessageFromResponse(data?.error, "plantingArea"),
        address: findErrorMessageFromResponse(data?.error, "address"),
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
        router.push("/dashboard/proposal");
      } else {
        handleClick();
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (id) {
      getProposal();
    }
  }, [id]);

  return (
    <>
      <Seo title="Edit Proposal" />
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
        <h1 className="text-2xl mb-4 font-bold">Edit Proposal</h1>
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
                      value={
                        column.isBoolean
                          ? Boolean(input[column.name])
                          : input[column.name]
                      }
                      onChange={handleChange}
                      name={column.name}
                    >
                      {column.options.map((option) => {
                        return (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    <FormHelperText className="text-[#d32f2f]">
                      {error[column.name]}
                    </FormHelperText>
                  </FormControl>
                ) : (
                  <TextField
                    disabled={column.disabled}
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
            <div className="flex flex-col">
              <div className="flex flex-row items-center gap-2">
                <h2 className="text-lg font-bold">Provinsi</h2>
                <Status status="Wajib" />
              </div>
              <span className="mb-2">
                Lokasi lahan penanaman komoditas pada proposal ini berada di
                provinsi apa.
              </span>
              <FormControl error={error.province ? true : false}>
                <Select
                  name="province"
                  disabled={provinceLoading}
                  defaultValue=""
                  onChange={handleChangeRegion}
                  value={region.province || ""}
                >
                  {province?.data?.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{error.province}</FormHelperText>
              </FormControl>
            </div>

            {region.province && (
              <div className="flex flex-col">
                <div className="flex flex-row items-center gap-2">
                  <h2 className="text-lg font-bold">Kabupaten</h2>
                  <Status status="Wajib" />
                </div>
                <span className="mb-2">
                  Lokasi lahan penanaman komoditas pada proposal ini berada di
                  kabupaten apa.
                </span>
                <FormControl error={error.regency ? true : false}>
                  <Select
                    name="regency"
                    disabled={mutatingRegency}
                    defaultValue=""
                    onChange={handleChangeRegion}
                    value={region.regency || ""}
                  >
                    {regency?.data?.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{error.regency}</FormHelperText>
                </FormControl>
              </div>
            )}

            {region.regency && (
              <div className="flex flex-col">
                <div className="flex flex-row items-center gap-2">
                  <h2 className="text-lg font-bold">Kecamatan</h2>
                  <Status status="Wajib" />
                </div>
                <span className="mb-2">
                  Lokasi lahan penanaman komoditas pada proposal ini berada di
                  kecamatan apa.
                </span>
                <FormControl error={error.district ? true : false}>
                  <Select
                    name="district"
                    disabled={mutatingDistrict}
                    defaultValue=""
                    onChange={handleChangeRegion}
                    value={region.district || ""}
                  >
                    {district?.data?.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{error.district}</FormHelperText>
                </FormControl>
              </div>
            )}

            {region.district && (
              <div className="flex flex-col">
                <div className="flex flex-row items-center gap-2">
                  <h2 className="text-lg font-bold">Kelurahan</h2>
                  <Status status="Wajib" />
                </div>
                <span className="mb-2">
                  Lokasi lahan penanaman komoditas pada proposal ini berada di
                  kelurahan apa.
                </span>
                <FormControl error={error.subdistrict ? true : false}>
                  <Select
                    name="subdistrict"
                    disabled={mutatingSubdistrict}
                    defaultValue=""
                    onChange={handleChangeRegion}
                    value={region.subdistrict}
                  >
                    {subdistrict?.data?.map((item) => (
                      <MenuItem
                        name="subdistrict"
                        key={item.subdistrict}
                        value={item.subdistrict}
                        onClick={() =>
                          handleChange({
                            target: {
                              name: "regionID",
                              value: item._id,
                            },
                          })
                        }
                      >
                        {item.subdistrict}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{error.subdistrict}</FormHelperText>
                </FormControl>
              </div>
            )}
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
      </Dashboard>
    </>
  );
};
