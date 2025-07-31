import axios from "axios";
import { toast } from "react-toastify";

export const postApiCaller = async (endPoint, data, header) => {
  const baseUrl = process.env.REACT_APP_PUBLIC_BASE_URL;
  try {
    const url = baseUrl + endPoint;
    const response = await axios.post(url, data, header);
    // response?.data?.status === "success" && toast.success(response?.data?.message)
    return response.data;
  } catch (error) {
    return error.response
    // toast.error(error?.response?.data?.message)
  }
};

export const putApiCaller = async (endPoint, data, header) => {
  const baseUrl = process.env.REACT_APP_PUBLIC_BASE_URL;
  try {
    let url = baseUrl + endPoint;
    const response = await axios.put(url, data, header);
    // response?.data?.status === "success" && toast.success(response?.data?.message)
    return response.data;
  } catch (error) {
    // toast.error(error?.response?.data?.message)
    
  }
};

export const getApiCaller = async (endPoint, header) => {
  const baseUrl = process.env.REACT_APP_PUBLIC_BASE_URL;
  try {
    let url = baseUrl + endPoint;
    const response = await axios.get(url, header);
    // response?.data?.status === "success" && toast.success(response?.data?.message)
    return response.data;
  } catch (error) {
    // toast.error(error?.response?.data?.message)
  }
};
export const deleteApiCaller = async (endPoint, header) => {
  const baseUrl = process.env.REACT_APP_PUBLIC_BASE_URL;
  try {
    let url = baseUrl + endPoint;
    const response = await axios.delete(url, header);
    // response?.data?.status === "success" && toast.success(response?.data?.message)
    return response.data;
  } catch (error) {
    // toast.error(error?.response?.data?.message)
  }
};