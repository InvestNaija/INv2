import axios from "axios";
import type { SavePlanListResponse, SavePlan } from "../models/savePlanModel";

const savePlanBaseUrl = `${import.meta.env.VITE_SAVEPLAN_BASE_URL}/save-plan`;

export const topUpCustomerSavePlan = async (payload: any): Promise<any> => {
  const response = await axios.post(`${savePlanBaseUrl}/product/top-up`, payload);
  return response.data;
};

export const getPlaninList = async (): Promise<SavePlanListResponse> => {
  const response = await axios.get<SavePlanListResponse>(`${savePlanBaseUrl}/list/planin`);
  return response.data;
};

export const getSaveinList = async (): Promise<SavePlanListResponse> => {
  const response = await axios.get<SavePlanListResponse>(`${savePlanBaseUrl}/list/savein`);
  return response.data;
};

export const getSavePlanById = async (id: string): Promise<{ success: boolean; data: SavePlan }> => {
  const response = await axios.get<{ success: boolean; data: SavePlan }>(`${savePlanBaseUrl}/single/${id}`);
  return response.data;
};

export const getCustomSavePlan = async (type: string): Promise<{ success: boolean; data: SavePlan }> => {
  const response = await axios.get<{ success: boolean; data: SavePlan }>(`${savePlanBaseUrl}/custom/${type}`);
  return response.data;
};

export const calculatePlanin = async (payload: {
  initial_amt: number;
  amount: number;
  frequency: string;
  startDate: string;
  endDate: string;
  interest_rate: number;
}): Promise<{
  success: boolean;
  data: {
    PMT: string;
    future_value: string;
    total_contribution_amount: string;
    interest_earned: string;
    effective_interest_rate: string;
    startDate: string;
    endDate: string;
  };
  message: string;
}> => {
  const response = await axios.post(`${savePlanBaseUrl}/calculator/planin`, payload);
  return response.data;
};

export const calculateSavein = async (payload: {
  initial_amt: number;
  amount: number;
  frequency: string;
  startDate: string;
  endDate: string;
  interest_rate: number;
}): Promise<{
  success: boolean;
  data: {
    PMT: string;
    future_value: string;
    total_contribution_amount: string;
    interest_earned: string;
    effective_interest_rate: string;
    startDate: string;
    endDate: string;
  };
  message: string;
}> => {
  const response = await axios.post(`${savePlanBaseUrl}/calculator/savein`, payload);
  return response.data;
};

export const createCustomerSavePlan = async (payload: any): Promise<any> => {
  const response = await axios.post(`${savePlanBaseUrl}/customer/create`, payload);
  return response.data;
};

export const getOngoingPlaninPlans = async (): Promise<{ success: boolean; data: any[]; total: number }> => {
  const response = await axios.get(`${savePlanBaseUrl}/customer/fetch/planin?status=ongoing`);
  return response.data;
};

export const getOngoingSaveinPlans = async (): Promise<{ success: boolean; data: any[]; total: number }> => {
  const response = await axios.get(`${savePlanBaseUrl}/customer/fetch/savein?status=ongoing`);
  return response.data;
};

export const getCustomerPlanTransactions = async (planId: string, page = 0, size = 10): Promise<{ success: boolean; data: any; totalElements?: number }> => {
  const response = await axios.get(`${savePlanBaseUrl}/customer/single/transactions/${planId}?page=${page}&size=${size}`);
  return response.data;
};

export const getCustomerPlanMetricLiquidate = async (planId: string): Promise<{ success: boolean; data: any; message: string }> => {
  const response = await axios.get(`${savePlanBaseUrl}/customer/metric-liquidate/${planId}`);
  return response.data;
};

export const liquidateCustomerSavePlan = async (payload: any): Promise<{ success: boolean; data: any; message: string }> => {
  const response = await axios.post(`${savePlanBaseUrl}/customer/plan/liquidate`, payload);
  return response.data;
};
