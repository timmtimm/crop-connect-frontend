import { fetcher, triggerfetcher } from "@/lib/axios";
import { runOnce } from "@/lib/swr";
import useSWRMutation from "swr/mutation";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { setParamRegionFetch } from "@/utils/url";
import { useRouter } from "next/router";
import { setIfNotNull } from "@/utils/utilities";

export default (props) => {
  const { type, onSubmit } = props;
  const router = useRouter();

  const [input, setInput] = useState({
    country: "Indonesia",
    province: router.query.province || "none",
    regency: router.query.regency || "none",
    district: router.query.district || "none",
    subdistrict: "none",
    minPrice: router.query.minPrice || null,
    maxPrice: router.query.maxPrice || null,
  });
  const [oldInput, setOldInput] = useState(input);

  useEffect(() => {
    setInput({
      ...input,
      ...router.query,
    });
  }, [router.query]);

  const handleChangeInput = ({ target: { name, value } }) => {
    setInput({ ...input, [name]: value });
  };

  const {
    data: province,
    error: provinceError,
    isLoading: provinceLoading,
  } = useSWR(
    ["/api/v1/region/province", { country: input.country }],
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
        input.province != "none" &&
        input.province != oldInput.province) ||
      (!regency && input.province != "none")
    ) {
      triggerRegency(setParamRegionFetch(input, "province"));
      setInput({
        ...input,
        regency: "none",
        district: "none",
        subdistrict: "none",
      });
    }

    if (
      (district &&
        input.regency != "none" &&
        input.regency != oldInput.regency) ||
      (!district && input.regency != "none")
    ) {
      triggerDistrict(setParamRegionFetch(input, "district"));
      setInput({ ...input, district: "none", subdistrict: "none" });
    }

    if (
      (subdistrict &&
        input.district != "none" &&
        input.district != oldInput.district) ||
      (!subdistrict && input.district != "none")
    ) {
      triggerSubdistrict(setParamRegionFetch(input, "subdistrict"));
      setInput({ ...input, subdistrict: "none" });
    }

    setOldInput(input);
  }, [input.province, input.regency, input.district]);

  const setIfNotNone = (object, key, value) => {
    if (value != "none") {
      object[key] = value;
    } else {
      delete object[key];
    }

    return object;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let query = {
      ...router.query,
    };

    query = setIfNotNone(query, "province", input.province);
    query = setIfNotNone(query, "regency", input.regency);
    query = setIfNotNone(query, "district", input.district);

    if (input.subdistrict) {
      const regionID =
        subdistrict?.data?.find((item) => item.subdistrict == input.subdistrict)
          ?._id || "";

      if (regionID) {
        query.regionID = regionID;
      }
    }

    query = setIfNotNull(query, "minPrice", input.minPrice);
    query = setIfNotNull(query, "maxPrice", input.maxPrice);

    onSubmit();

    router.push({
      pathname: "/search",
      query,
    });
  };

  return (
    <div className="flex flex-col gap-2 divide-y">
      <span className="text-lg font-bold mb-2">Lokasi</span>
      <FormControl>
        <InputLabel>Provinsi</InputLabel>
        <Select
          name="province"
          value={input.province}
          disabled={provinceLoading}
          label="Provinsi"
          onChange={handleChangeInput}
          inputProps={{
            className: "py-3",
          }}
        >
          <MenuItem key="none" value="none">
            Semua Provinsi
          </MenuItem>
          {province?.data?.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <InputLabel>Kabupaten</InputLabel>
        <Select
          name="regency"
          disabled={mutatingRegency}
          value={input.regency}
          label="Kabupaten"
          onChange={handleChangeInput}
          inputProps={{
            className: "py-3",
          }}
        >
          <MenuItem value={"none"}>Semua Kabupaten</MenuItem>
          {input.province != "none" &&
            regency?.data?.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <FormControl>
        <InputLabel>Kecamatan</InputLabel>
        <Select
          name="district"
          value={input.district}
          disabled={mutatingDistrict}
          label="Kecamatan"
          onChange={handleChangeInput}
          inputProps={{
            className: "py-3",
          }}
        >
          <MenuItem value={"none"}>Semua Kecamatan</MenuItem>
          {input.regency != "none" &&
            district?.data?.map((item) => (
              <MenuItem key={item.subdistrict} value={item}>
                {item}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <FormControl className="mb-2">
        <InputLabel>Kelurahan</InputLabel>
        <Select
          name="subdistrict"
          value={input.subdistrict}
          disabled={mutatingSubdistrict}
          label="Kelurahan"
          onChange={handleChangeInput}
          inputProps={{
            className: "py-3",
          }}
        >
          <MenuItem value={"none"}>Semua Kelurahan</MenuItem>
          {input.district != "none" &&
            subdistrict?.data?.map((item) => (
              <MenuItem key={item.subdistrict} value={item.subdistrict}>
                {item.subdistrict}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      {type == "komoditas" ? (
        <>
          <div className="flex flex-col gap-2">
            <span className="text-lg font-bold my-2">Harga</span>
            <TextField
              label="Harga minimum"
              type="number"
              name="minPrice"
              sx={{ "& input": { padding: "0.75rem" } }}
              onChange={handleChangeInput}
              value={input.minPrice}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">Rp</InputAdornment>
                ),
              }}
              props
            />
            <TextField
              label="Harga maksimal"
              type="number"
              name="maxPrice"
              onChange={handleChangeInput}
              value={input.maxPrice}
              sx={{ "& input": { padding: "0.75rem" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">Rp</InputAdornment>
                ),
              }}
            />
          </div>
        </>
      ) : (
        <></>
      )}
      <Button
        className="bg-[#52A068] normal-case font-bold"
        variant="contained"
        onClick={handleSubmit}
      >
        Terapkan
      </Button>
    </div>
  );
};
