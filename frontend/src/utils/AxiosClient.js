import axios from "axios";

export const AxiosClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});
