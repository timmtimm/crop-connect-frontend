import Cookies from "js-cookie";
import axios, { HttpStatusCode } from "axios";

const instance = axios.create({
  baseURL: process.env.BACKEND_BASE_URL,
  Headers: {
    Accept: "application/json",
  },
});

export const isHandlerEnabled = (config) => {
  return config.hasOwnProperty("handlerEnabled") && !config.handlerEnabled
    ? false
    : true;
};

export const requestHandler = async (config) => {
  if (isHandlerEnabled(config)) {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = token;
    }
  }

  return config;
};

instance.interceptors.request.use((request) => requestHandler(request));

const errorHandler = (error) => {
  if (error.response?.data) {
    if (error.response.status === HttpStatusCode.Unauthorized) {
      Cookies.remove("token");
      window.location.href = "/login";
    }
    return error.response.data;
  } else if (error.code == "ERR_NETWORK") {
    return { message: "Terjadi kesalahan. Silahkan coba beberapa saat lagi" };
  }

  return { message: error.message };
};

export const fetcher = async (url, params = {}) => {
  try {
    const { data } = await instance.get(url, {
      params,
    });
    return data;
  } catch (err) {
    return errorHandler(err);
  }
};

export const triggerfetcher = async (url, { arg }) => {
  return await fetcher(url, arg);
};

export const get = async (url, params = {}) => {
  try {
    const { data } = await instance.get(url, {
      params: params,
    });
    return data;
  } catch (err) {
    return errorHandler(err);
  }
};

export const PostWithForm = async (url, input) => {
  try {
    return await instance.post(url, input, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (err) {
    return errorHandler(err);
  }
};

export const postWithJSON = async (url, input) => {
  try {
    const { data } = await instance.post(url, input, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (err) {
    return errorHandler(err);
  }
};

export const PutWithForm = async (url, input) => {
  try {
    const { data } = await instance.put(url, input, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (err) {
    return errorHandler(err);
  }
};

export const putWithJSON = async (url, input) => {
  try {
    const { data } = await instance.put(url, input, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (err) {
    return errorHandler(err);
  }
};

export const Delete = async (url) => {
  try {
    return await instance.delete(url);
  } catch (err) {
    return errorHandler(err);
  }
};

export default instance;
