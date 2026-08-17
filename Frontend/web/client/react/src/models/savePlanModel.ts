export interface SavePlanCalculatorType {
  id: string;
  type_name: string;
}

export interface SavePlan {
  id: string;
  title: string;
  slug: string | null;
  icon: string;
  type: string;
  logo: string | null;
  description: string;
  interest_rate: number;
  min_duration: number;
  max_duration: number | null;
  min_amount: number;
  currency: string;
  saveplan_calculator_type: SavePlanCalculatorType;
}

export interface SavePlanListResponse {
  success: boolean;
  data: {
    count: number;
    rows: SavePlan[];
  };
}
