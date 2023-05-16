import dayjs from "dayjs";

export const setPriceFormat = (price) => {
  const formatter = new Intl.NumberFormat("en-US", {});

  return formatter.format(price).replace(/,/g, ".");
};

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

export const setIfNotNull = (object, key, value) => {
  if (value) {
    object[key] = value;
  } else {
    delete object[key];
  }

  return object;
};

export const dateFormatToIndonesia = (date) => {
  if (!date) return;
  const dateObject = {
    date: dayjs(date).date(),
    month: dayjs(date).month(),
    year: dayjs(date).year(),
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

  return `${dateObject.date} ${month} ${dateObject.year}`;
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

export const checkIsValidDate = (stringDate) => {
  const date = new Date(stringDate);
  return isNaN(date.getMonth()) ? false : true;
};
