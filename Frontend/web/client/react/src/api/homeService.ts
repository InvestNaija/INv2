import axios from "axios";
import type { NewProductsResponse } from "../models/homeModel";

const baseUrl = import.meta.env.VITE_BASE_URL;

const getNewProducts = async (): Promise<NewProductsResponse> => {
  const response = await axios.get<NewProductsResponse>(
    `${baseUrl}/customers/dashboard/new-products`,
  );
  return response.data;
};

export { getNewProducts };
