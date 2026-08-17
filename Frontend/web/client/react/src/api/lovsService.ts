import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL;

// "lovs" = list-of-values endpoints — small reference lists (dropdown
// options) the backend owns rather than the frontend hardcoding, so they
// stay in sync without a redeploy.
export interface SourceOfFundsOption {
  label: string;
  value: string;
}

const getSourceOfFunds = async (): Promise<SourceOfFundsOption[]> => {
  const response = await axios.get(`${baseUrl}/lovs/source-of-funds`);
  const data = response.data?.data ?? response.data ?? [];

  // Bound to the label itself (not a separate code) — the backend just
  // wants the human-readable source of funds back on submit.
  return (data as unknown[]).map((item) => {
    if (typeof item === "string") {
      return { label: item, value: item };
    }
    const option = item as Record<string, unknown>;
    const label = String(option.label ?? option.name ?? option.description ?? option.value ?? "");
    return { label, value: label };
  });
};

export { getSourceOfFunds };
