
export interface WithdrawPlanDTO {
    type: string;
    amount?: number;
    
}

export interface WithdrawFormLabel {
    value: string;
    name: string;
    description: string;
    
}

export interface buyPlanDTO {
    planName?: string;
    amount: number;
    initialAmount?: number | undefined;
    frequency: string;
    startDate: Date;
    year: string;
    month: string; 
    endDate?: Date;
}