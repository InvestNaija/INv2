import moment from 'moment';

export class Calculator {

   static compounding (initialAmt=0, PMT: number, frequency: string, interestRate: number, startDate: Date, endDate: Date) {
      // endDate = moment(endDate).subtract(1, 'days').toDate();
      const {P, t, n, r} = Calculator.initialize(initialAmt, frequency, interestRate, startDate, endDate);
      // console.log('PMT=',PMT, 'f=',frequency, 'r=',interestRate);
      // console.log('P=', P, 't=', t, 'n=', n, 'r=',  r);
  
      PMT -= P;
      //[ P(1+r/n)^(nt) ]  + PMT × p {[(1 + r/n)^(nt) - 1] / (r/n)}
      const futureValue = Math.round(( (
         (P * Math.pow(1 + (r/n), n* t) + (PMT * ((Math.pow(1 + (r/n), n*t) - 1) / (r/n))))
      ) + Number.EPSILON) * 100) / 100;
      const totalContributionAmount = Math.round(( (P + (PMT * t  * n)) + Number.EPSILON) * 100) / 100;
      const interestEarned =  Math.round(( (futureValue - totalContributionAmount) + Number.EPSILON) * 100) / 100;
      const effectiveInterestRate =  Math.round(( (interestEarned / (totalContributionAmount==0?1:totalContributionAmount)) * 100 + Number.EPSILON) * 100) / 100;
  
      return { PMT: Number(PMT).toFixed(2), futureValue: Number(futureValue).toFixed(2), totalContributionAmount: Number(totalContributionAmount).toFixed(2), interestEarned: Number(interestEarned).toFixed(2), effectiveInterestRate: Number(effectiveInterestRate).toFixed(2), };
   };
   static plan (initialAmt=0, futureValue: number, frequency: string, interestRate: number, startDate: Date, endDate: Date) {
      const {P, t, n, r} = Calculator.initialize(initialAmt, frequency, interestRate, startDate, endDate);
      const originalFutureValue = futureValue;
      futureValue -= P;
      //PMT= Future Value/{[(1 + r/n)^(nt) - 1] / (r/n)}
      const PMT =  Math.round(( futureValue / ((Math.pow(1 + (r/n), n* t) -1) /(r/n)) + Number.EPSILON) * 100) / 100;
      const totalContributionAmount =  Math.round(( (PMT * t  * n) + Number.EPSILON) * 100) / 100;
      const interestEarned =  Math.round(( (futureValue - totalContributionAmount) + Number.EPSILON) * 100) / 100;
      const effectiveInterestRate =  Math.round(( (interestEarned / totalContributionAmount) * 100 + Number.EPSILON) * 100) / 100;
  
      return { PMT: Number(PMT).toFixed(2), futureValue: Number(originalFutureValue).toFixed(2), totalContributionAmount: Number(totalContributionAmount).toFixed(2), interestEarned: Number(interestEarned).toFixed(2), effectiveInterestRate: Number(effectiveInterestRate).toFixed(2), };
   };
   static once (PMT: number, frequency: string, interestRate: number, startDate: Date, endDate: Date) {
      const {P, t, n, r} = Calculator.initialize(PMT, frequency, interestRate, startDate, endDate);
      
      //Future Value = A = P * ((1 + r / n)^nt)
      const futureValue =  Math.round(( P * Math.pow((1+(r/n)), (n*t)) + Number.EPSILON) * 100) / 100;
      const totalContributionAmount =  Math.round(( P + Number.EPSILON) * 100) / 100;
      const interestEarned =  Math.round(( (futureValue - totalContributionAmount) + Number.EPSILON) * 100) / 100;
      const effectiveInterestRate = Math.round(( (interestEarned / totalContributionAmount) * 100 + Number.EPSILON) * 100) / 100;
  
      return { PMT: Number(PMT).toFixed(2), futureValue: Number(futureValue).toFixed(2), totalContributionAmount: Number(totalContributionAmount).toFixed(2), interestEarned: Number(interestEarned).toFixed(2), effectiveInterestRate: Number(effectiveInterestRate).toFixed(2), };
   };
   static initialize (P: number, frequency: string, interestRate: number, startDate: Date, endDate: Date) {
      const t = Number((moment(endDate).diff(startDate, 'days') / 365).toFixed(2)); //tenure in years
      const n = Calculator.getFrequency(frequency);
      const r = interestRate/100;
      return {P, t, n, r};
   };

   static getFrequency(strFreq: string) {
      let numFreq = 1;
      strFreq = strFreq.toLowerCase();
      switch(strFreq) {
      case 'weekly':
         numFreq = 52;
         break;
      case 'daily':
         numFreq = 365;
         break;
      case 'monthly':
         numFreq = 12;
         break;
      default:
         numFreq = 1;
      }
      return numFreq;
   };
}