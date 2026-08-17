import { createContext, useContext, useReducer, type ReactNode } from "react";
import {
  topUpCustomerSavePlan,
  getPlaninList,
  getSaveinList,
  getSavePlanById,
  getCustomSavePlan,
  calculatePlanin,
  calculateSavein,
  createCustomerSavePlan,
  getOngoingPlaninPlans,
  getOngoingSaveinPlans,
  getCustomerPlanTransactions,
  getCustomerPlanMetricLiquidate,
  liquidateCustomerSavePlan,
} from "../api/saveService";
import type { SavePlanListResponse, SavePlan } from "../models/savePlanModel";

export interface SaveState {
  isLoading: boolean;
  error: string | null;
  planinListCache: SavePlanListResponse | null;
  saveinListCache: SavePlanListResponse | null;
  ongoingPlaninCache: any | null;
  ongoingSaveinCache: any | null;
}

export type SaveAction =
  | { type: "API_CALL_START" }
  | { type: "API_CALL_SUCCESS" }
  | { type: "API_CALL_FAILURE"; payload: string }
  | { type: "SET_CACHE"; key: string; payload: any }
  | { type: "INVALIDATE_SAVE_CACHE" };

export interface SaveContextType extends SaveState {
  topUpPlan: (payload: any) => Promise<any>;
  fetchPlaninList: (forceRefresh?: boolean) => Promise<SavePlanListResponse>;
  fetchSaveinList: (forceRefresh?: boolean) => Promise<SavePlanListResponse>;
  fetchSavePlanById: (id: string) => Promise<{ success: boolean; data: SavePlan }>;
  fetchCustomSavePlan: (type: string) => Promise<{ success: boolean; data: SavePlan }>;
  calculatePlaninValues: (payload: any) => Promise<any>;
  calculateSaveinValues: (payload: any) => Promise<any>;
  createSavePlan: (payload: any) => Promise<any>;
  fetchOngoingPlanin: (forceRefresh?: boolean) => Promise<{ success: boolean; data: any[]; total: number }>;
  fetchOngoingSavein: (forceRefresh?: boolean) => Promise<{ success: boolean; data: any[]; total: number }>;
  fetchPlanTransactions: (planId: string, page?: number, size?: number) => Promise<{ success: boolean; data: any; totalElements?: number }>;
  fetchPlanMetricLiquidate: (planId: string) => Promise<{ success: boolean; data: any; message: string }>;
  liquidatePlan: (payload: any) => Promise<{ success: boolean; data: any; message: string }>;
}

const initialState: SaveState = {
  isLoading: false,
  error: null,
  planinListCache: null,
  saveinListCache: null,
  ongoingPlaninCache: null,
  ongoingSaveinCache: null,
};

const saveReducer = (state: SaveState, action: SaveAction): SaveState => {
  switch (action.type) {
    case "API_CALL_START":
      return { ...state, isLoading: true, error: null };
    case "API_CALL_SUCCESS":
      return { ...state, isLoading: false, error: null };
    case "API_CALL_FAILURE":
      return { ...state, isLoading: false, error: action.payload };
    case "SET_CACHE":
      return { ...state, [action.key]: action.payload };
    case "INVALIDATE_SAVE_CACHE":
      return {
        ...state,
        planinListCache: null,
        saveinListCache: null,
        ongoingPlaninCache: null,
        ongoingSaveinCache: null,
      };
    default:
      return state;
  }
};

const SaveContext = createContext<SaveContextType | undefined>(undefined);

export const SaveProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(saveReducer, initialState);

  const handleApiCall = async <T,>(apiCall: () => Promise<T>): Promise<T> => {
    dispatch({ type: "API_CALL_START" });
    try {
      const response = await apiCall();
      dispatch({ type: "API_CALL_SUCCESS" });
      return response;
    } catch (error: any) {
      dispatch({
        type: "API_CALL_FAILURE",
        payload: error?.response?.data?.message || error?.message || "An error occurred",
      });
      throw error;
    }
  };

  const topUpPlan = async (payload: any) => {
    const response = await handleApiCall(() => topUpCustomerSavePlan(payload));
    dispatch({ type: "INVALIDATE_SAVE_CACHE" });
    return response;
  };
  
  const fetchPlaninList = async (forceRefresh = false) => {
    if (!forceRefresh && state.planinListCache) {
      return state.planinListCache;
    }
    return handleApiCall(async () => {
      const response = await getPlaninList();
      dispatch({ type: "SET_CACHE", key: "planinListCache", payload: response });
      return response;
    });
  };

  const fetchSaveinList = async (forceRefresh = false) => {
    if (!forceRefresh && state.saveinListCache) {
      return state.saveinListCache;
    }
    return handleApiCall(async () => {
      const response = await getSaveinList();
      dispatch({ type: "SET_CACHE", key: "saveinListCache", payload: response });
      return response;
    });
  };
  const fetchSavePlanById = (id: string) => handleApiCall(() => getSavePlanById(id));
  const fetchCustomSavePlan = (type: string) => handleApiCall(() => getCustomSavePlan(type));
  const calculatePlaninValues = (payload: any) => handleApiCall(() => calculatePlanin(payload));
  const calculateSaveinValues = (payload: any) => handleApiCall(() => calculateSavein(payload));
  const createSavePlan = async (payload: any) => {
    const response = await handleApiCall(() => createCustomerSavePlan(payload));
    dispatch({ type: "INVALIDATE_SAVE_CACHE" });
    return response;
  };
  
  const fetchOngoingPlanin = async (forceRefresh = false) => {
    if (!forceRefresh && state.ongoingPlaninCache) {
      return state.ongoingPlaninCache;
    }
    return handleApiCall(async () => {
      const response = await getOngoingPlaninPlans();
      dispatch({ type: "SET_CACHE", key: "ongoingPlaninCache", payload: response });
      return response;
    });
  };

  const fetchOngoingSavein = async (forceRefresh = false) => {
    if (!forceRefresh && state.ongoingSaveinCache) {
      return state.ongoingSaveinCache;
    }
    return handleApiCall(async () => {
      const response = await getOngoingSaveinPlans();
      dispatch({ type: "SET_CACHE", key: "ongoingSaveinCache", payload: response });
      return response;
    });
  };

  const fetchPlanTransactions = (planId: string, page = 0, size = 10) => handleApiCall(() => getCustomerPlanTransactions(planId, page, size));
  const fetchPlanMetricLiquidate = (planId: string) => handleApiCall(() => getCustomerPlanMetricLiquidate(planId));
  const liquidatePlan = async (payload: any) => {
    const response = await handleApiCall(() => liquidateCustomerSavePlan(payload));
    dispatch({ type: "INVALIDATE_SAVE_CACHE" });
    return response;
  };

  return (
    <SaveContext.Provider
      value={{
        ...state,
        topUpPlan,
        fetchPlaninList,
        fetchSaveinList,
        fetchSavePlanById,
        fetchCustomSavePlan,
        calculatePlaninValues,
        calculateSaveinValues,
        createSavePlan,
        fetchOngoingPlanin,
        fetchOngoingSavein,
        fetchPlanTransactions,
        fetchPlanMetricLiquidate,
        liquidatePlan,
      }}
    >
      {children}
    </SaveContext.Provider>
  );
};

export const useSave = () => {
  const context = useContext(SaveContext);
  if (context === undefined) {
    throw new Error("useSave must be used within a SaveProvider");
  }
  return context;
};
