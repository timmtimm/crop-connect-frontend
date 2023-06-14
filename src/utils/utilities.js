import dayjs from "dayjs";

export const setNumberFormat = (number) => {
  const formatter = new Intl.NumberFormat("en-US", {});

  return formatter.format(number).replace(/,/g, ".");
};

export const setWeightFormat = (weight) => setNumberFormat(weight) + " Kg";

export const setPriceFormat = (price) => "Rp" + setNumberFormat(price);

export const validatePassword = (string) => {
  var pattern = new RegExp(
    "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
  );

  return pattern.test(string);
};

export const validateEmail = (string) => {
  var pattern = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");

  return pattern.test(string);
};

export const validateStringInputLogic = (string, validateResult, result) => {
  if (!string) {
    return result.empty;
  } else if (!validateResult) {
    return result.invalid;
  } else {
    return "";
  }
};

export const validatePhoneNumber = (number) =>
  !isNaN(number) && number > 0 && number.toString().length < 13;

export const checkObjectIsNotNullExist = (object, checkKey) => {
  for (const key of checkKey) {
    if (object[key]) {
      return true;
    }
  }

  return false;
};

export const findErrorMessageFromResponse = (errorArray, key) => {
  const errorMessage = errorArray?.find(
    (error) => error.field === key
  )?.message;
  return errorMessage;
};

export const setIfNotNone = (object, key, value) => {
  if (value != "none") {
    object[key] = value;
  } else {
    delete object[key];
  }

  return object;
};

export const setIfNotNull = (object, key, value) => {
  if (value) {
    object[key] = value;
  } else {
    delete object[key];
  }

  return object;
};

export const dateFormatToIndonesia = (date, withTime = false) => {
  if (!date) return;
  const dateObject = {
    date: dayjs(date).date(),
    month: dayjs(date).month(),
    year: dayjs(date).year(),

    hour: dayjs(date).hour(),
    minute: dayjs(date).minute(),
  };
  let month = "";

  switch (dateObject.month) {
    case 0:
      month = "Januari";
      break;
    case 1:
      month = "Februari";
      break;
    case 2:
      month = "Maret";
      break;
    case 3:
      month = "April";
      break;
    case 4:
      month = "Mei";
      break;
    case 5:
      month = "Juni";
      break;
    case 6:
      month = "Juli";
      break;
    case 7:
      month = "Agustus";
      break;
    case 8:
      month = "September";
      break;
    case 9:
      month = "Oktober";
      break;
    case 10:
      month = "November";
      break;
    case 11:
      month = "Desember";
      break;
  }

  return withTime
    ? `${dateObject.date} ${month} ${dateObject.year} ${dateObject.hour}:${
        dateObject.minute < 10 ? "0" + dateObject.minute : dateObject.minute
      }`
    : `${dateObject.date} ${month} ${dateObject.year}`;
};

export const dayUnitToIndonesiaDisplayFormat = (dayUnit) => {
  switch (dayUnit) {
    case dayUnit > 365:
      return `${Math.floor(dayUnit / 365)} tahun`;
    case dayUnit > 30:
      return `${Math.floor(dayUnit / 30)} bulan`;
    case dayUnit > 7:
      return `${Math.floor(dayUnit / 7)} minggu`;
    case dayUnit > 1:
      return `${dayUnit} hari`;
    default:
      return `${dayUnit} hari`;
  }
};

export const unitToIndonesiaTotalFormat = (unit) => {
  switch (unit) {
    case unit > 1000000:
      return `${Math.floor(unit / 1000000)} juta`;
    case unit > 1000:
      return `${Math.floor(unit / 1000)} ribu`;
    case unit > 100:
      return `${Math.floor(unit / 100)} ratus`;
    case unit > 10:
      return `${Math.floor(unit / 10)} puluh`;
    default:
      return `${unit}`;
  }
};

export const isValidDate = (stringDate) => {
  const date = new Date(stringDate);
  return isNaN(date.getMonth()) ? false : true;
};

export const SumObjectByKey = (array, key) => {
  return array.reduce((a, b) => a + (b[key] || 0), 0);
};

export const isURL = (string) => {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
};

export const getLastURLSegment = (url) => {
  const urlArray = url.split("/");
  return urlArray[urlArray.length - 1];
};

export const getFilenameWithoutExtension = (filename) => {
  return filename.split(".").slice(0, -1).join(".");
};

export const getObjectWihoutKey = (object, key) => {
  const { [key]: deletedKey, ...otherKeys } = object;

  return otherKeys;
};
