import axios from "axios";
import type {
  GetTransactionsParams,
  TransactionsResponse,
} from "../models/transactionModel";

export type { GetTransactionsParams };

const baseUrl = import.meta.env.VITE_BASE_URL;

// Fetches the customer's transactions — shared by the Overview page's
// "Recent Transactions" teaser and the dedicated Transactions feature
// (all/incoming/outgoing), which filter/paginate the same endpoint
// differently via `params`.
const getTransactions = async (
  params: GetTransactionsParams,
): Promise<TransactionsResponse> => {
  const {
    channel = "",
    source = "",
    type = "",
    start = "",
    end = "",
    status = "",
    ...rest
  } = params;
  const response = await axios.get<TransactionsResponse>(
    `${baseUrl}/transactions/my-transactions`,
    { params: { channel, source, type, start, end, status, ...rest } },
  );
  return response.data;
};

export interface BeneficiaryPayload {
  bankName: string;
  bankCode: string;
  bankAccountName: string;
  bankAccountNumber: string;
}

const addBeneficiary = async (payload: BeneficiaryPayload): Promise<any> => {
  const response = await axios.post(`${baseUrl}/transactions/beneficiary`, payload);
  return response.data;
};

const getBeneficiaries = async (): Promise<any> => {
  const response = await axios.get(`${baseUrl}/transactions/beneficiary`);
  return response.data;
};

const updateBeneficiary = async (payload: any): Promise<any> => {
  const response = await axios.post(`${baseUrl}/transactions/beneficiary`, payload);
  return response.data;
};

export { getTransactions, addBeneficiary, getBeneficiaries, updateBeneficiary };
