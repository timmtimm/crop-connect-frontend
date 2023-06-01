import { isURL } from "./utilities";

export const initiateUpdateImage = (lengthArray) => {
  const array = [];
  for (let i = 0; i < lengthArray; i++) {
    array.push(false);
  }
  return array;
};

export const validateImage = (file, fileSizeInMB = 5) => {
  console.log(file);
  const validTypes = ["image/jpeg", "image/jpg", "image/png"];
  return (
    validTypes.includes(file?.type) && file?.size < fileSizeInMB * 1024 * 1024
  );
};

export const setChangeImage = (input, oldInput, index) => {
  let isChange = false;
  let isDelete = false;

  if (input.imageURLs[index] !== oldInput.imageURLs[index]) {
    isChange = true;
  }

  input.isChange[index] = isChange;
  input.isDelete[index] = isDelete;

  return input;
};

export const setDeleteImage = (input, oldInput, index) => {
  let isChange = false;
  let isDelete = false;

  if (oldInput.imageURLs[index]) {
    isDelete = true;
  }

  input.isChange[index] = isChange;
  input.isDelete[index] = isDelete;

  return input;
};

export const setInputImageCreate = (input, maxImage) => {
  const objectResult = {};

  for (let i = 0; i < maxImage - 1; i++) {
    if (input.images[i]) {
      objectResult[`image${i + 1}`] = input.images[i];
    }
  }

  return objectResult;
};

export const setInputImageUpdate = (input, maxImage) => {
  const objectResult = {};

  for (let i = 0; i < maxImage - 1; i++) {
    if (!isURL(input.imageURLs[i]) && input.isChange[i]) {
      objectResult[`image${i + 1}`] = input.imageURLs[i];
    }
  }

  return objectResult;
};

export const setArrayToFomData = (input, key) => {
  const formData = {};

  input[key].forEach((element) => {
    formData[`${key}[]`] = element;
  });

  return formData;
};
