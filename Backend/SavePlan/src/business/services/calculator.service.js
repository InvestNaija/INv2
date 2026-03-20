import moment from 'moment';

class Calculator {

  static compounding = (initial_amt=0, PMT, frequency, interest_rate, start_date, end_date) => {
    const {P, t, n, r} = Calculator.initialize(initial_amt, frequency, interest_rate, start_date, end_date);
    
    // Calculate future value of initial amount
    let initial_future_value = P * Math.pow(1 + (r/n), n * t);
    
    // Calculate future value of regular payments (PMT)
    let payment_future_value = PMT * ((Math.pow(1 + (r/n), n * t) - 1) / (r/n));
    
    // Total future value is sum of both
    let future_value = Math.round((initial_future_value + payment_future_value + Number.EPSILON) * 100) / 100;
    
    // Total contribution is initial amount plus all payments
    let total_contribution_amount = Math.round((P + (PMT * t * n) + Number.EPSILON) * 100) / 100;
    
    // Interest earned is future value minus total contributions
    let interest_earned = Math.round((future_value - total_contribution_amount + Number.EPSILON) * 100) / 100;
    //push
    // Effective interest rate
    let effective_interest_rate = Math.round((interest_earned / (total_contribution_amount == 0 ? 1 : total_contribution_amount) * 100 + Number.EPSILON) * 100) / 100;

    return { 
      PMT: Number(PMT).toFixed(2), 
      future_value: Number(future_value).toFixed(2), 
      total_contribution_amount: Number(total_contribution_amount).toFixed(2), 
      interest_earned: Number(interest_earned).toFixed(2), 
      effective_interest_rate: Number(effective_interest_rate).toFixed(2)
    };
  };

  static plan = (initial_amt=0, future_value, frequency, interest_rate, start_date, end_date) => {
    if (initial_amt >= future_value) {
      throw new Error('Initial amount cannot be greater than or equal to the target future value');
    }
    const {P, t, n, r} = Calculator.initialize(initial_amt, frequency, interest_rate, start_date, end_date);
    const originalFutureValue = future_value
    future_value -= P;
    //PMT= Future Value/{[(1 + r/n)^(nt) - 1] / (r/n)}
    let PMT =  Math.round(( future_value / ((Math.pow(1 + (r/n), n* t) -1) /(r/n)) + Number.EPSILON) * 100) / 100;
    let total_contribution_amount =  Math.round(( P + (PMT * t  * n) + Number.EPSILON) * 100) / 100;
    let interest_earned =  Math.round(( (originalFutureValue - total_contribution_amount) + Number.EPSILON) * 100) / 100;
    let effective_interest_rate =  Math.round(( (interest_earned / total_contribution_amount) * 100 + Number.EPSILON) * 100) / 100;

    return { PMT: Number(PMT).toFixed(2), future_value: Number(originalFutureValue).toFixed(2), total_contribution_amount: Number(total_contribution_amount).toFixed(2), interest_earned: Number(interest_earned).toFixed(2), effective_interest_rate: Number(effective_interest_rate).toFixed(2), };
  };

  static once = (PMT, frequency, interest_rate, start_date, end_date) => {
    const {P, t, n, r} = Calculator.initialize(PMT, frequency, interest_rate, start_date, end_date);

    //Future Value = A = P * ((1 + r / n)^nt)
    let future_value =  Math.round(( P * Math.pow((1+(r/n)), (n*t)) + Number.EPSILON) * 100) / 100;
    let total_contribution_amount =  Math.round(( P + Number.EPSILON) * 100) / 100;
    let interest_earned =  Math.round(( (future_value - total_contribution_amount) + Number.EPSILON) * 100) / 100;
    let effective_interest_rate = Math.round(( (interest_earned / total_contribution_amount) * 100 + Number.EPSILON) * 100) / 100;

    return { PMT: Number(PMT).toFixed(2), future_value: Number(future_value).toFixed(2), total_contribution_amount: Number(total_contribution_amount).toFixed(2), interest_earned: Number(interest_earned).toFixed(2), effective_interest_rate: Number(effective_interest_rate).toFixed(2), };
  };

  static initialize = (P, frequency, interest_rate, start_date, end_date) => {
    let t = Number((moment(end_date).diff(start_date, 'days') / 365).toFixed(2)); //tenure in years
    let n = Calculator.calculate_payment_frequency(frequency);
    const r = interest_rate/100
    return {P, t, n, r}
  }

  static calculate_payment_frequency = (frequency) => {
    let frequency_num = 1;
    frequency = frequency.toLowerCase();
    if (frequency === 'once') {
        frequency_num = 1;
    } else if (frequency === 'weekly') {
        frequency_num = 52;
    } else if (frequency === 'daily') {
        frequency_num = 365;
    } else if (frequency === 'monthly') {
        frequency_num = 12;
    }
    return frequency_num;
  };
}

module.exports = Calculator;
