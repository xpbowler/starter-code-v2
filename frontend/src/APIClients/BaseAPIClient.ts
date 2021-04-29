import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { camelizeKeys, decamelizeKeys } from "humps";
import jwt from "jsonwebtoken";

import USER_ACCESS_TOKEN_KEY from "../constants/AuthConstants";

const baseAPIClient = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
});

// Python API uses snake_case, frontend uses camelCase
// convert request and response data to/from snake_case and camelCase through axios interceptors
// python {
baseAPIClient.interceptors.response.use((response: AxiosResponse) => {
  if (
    response.data &&
    response.headers["content-type"] === "application/json"
  ) {
    response.data = camelizeKeys(response.data);
  }
  return response;
});
// } python

baseAPIClient.interceptors.request.use(async (config: AxiosRequestConfig) => {
  const newConfig = { ...config };

  // if access token in header has expired, do a refresh
  const authHeaderParts = config.headers.Authorization?.split(" ");
  if (
    authHeaderParts &&
    authHeaderParts.length >= 2 &&
    authHeaderParts[0].toLowerCase() === "bearer"
  ) {
    const decodedToken: any = jwt.decode(authHeaderParts[1]);

    if (
      decodedToken &&
      decodedToken.exp <= Math.round(new Date().getTime() / 1000)
    ) {
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const accessToken = data.accessToken || data.access_token;
      localStorage.setItem(USER_ACCESS_TOKEN_KEY, accessToken);

      newConfig.headers.Authorization = accessToken;
    }
  }

  // python {
  if (config.params) {
    newConfig.params = decamelizeKeys(config.params);
  }
  if (config.data) {
    newConfig.data = decamelizeKeys(config.data);
  }
  // } python

  return newConfig;
});

export default baseAPIClient;