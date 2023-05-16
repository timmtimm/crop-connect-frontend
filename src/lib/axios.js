import Cookies from "js-cookie";
import axios from "axios";

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

export const fetcher = async (url, params = {}) => {
  try {
    const { data } = await instance.get(url, {
      params,
    });
    console.log(url);
    console.log(data);
    return data;
  } catch (err) {
    console.log(err.response);
    return err.response;
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
    return err.response.data;
  }
};

// export const PostWithForm = async (url, input) => {
//   try {
//     return await instance.post(url, input, {
//       headers: {
//         Authorization: token,
//       },
//     });
//   } catch (err) {
//     throw new Error(err.response);
//   }
// };

export const postWithJSON = async (url, input) => {
  try {
    const { data } = await instance.post(url, input, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(data);
    return data;
  } catch (err) {
    console.log(err.response);
    return err.response.data;
  }
};

// export const PutWithForm = async (url, input) => {
//   try {
//     return await instance.put(url, input, {
//       headers: {
//         Authorization: token,
//       },
//     });
//   } catch (err) {
//     throw new Error({
//       message: err.response.message,
//       error: err.response.error,
//     });
//   }
// };

export const putWithJSON = async (url, input) => {
  try {
    const { data } = await instance.put(url, input, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (err) {
    return err.response.data;
  }
};

// export const Delete = async (url) => {
//   try {
//     return await instance.delete(url, {
//       headers: {
//         Authorization: token,
//       },
//     });
//   } catch (err) {
//     throw new Error(err.response.data);
//   }
// };

export default instance;
