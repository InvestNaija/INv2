export class DBEnums {
   static get ChargeTypeFrequency() {
      return [
         {code: 105, name: 'once', label: 'Once',},
         {code: 110, name: 'daily', label: 'Daily',},
         {code: 115, name: 'weekly', label: 'Weekly',},
         {code: 120, name: 'forthnight', label: 'Forthnight',},
         {code: 125, name: 'monthly', label: 'Monthly',},
         {code: 130, name: 'bimonthly', label: 'BiMonthly',},
         {code: 135, name: 'quarterly', label: 'Quarterly',},
         {code: 140, name: 'semiannual', label: 'Semi Annual',},
         {code: 145, name: 'yearly', label: 'Yearly',},
         {code: 150, name: 'beot', label: 'Before End Of Time'}, 
         {code: 155, name: 'eot', label: 'End Of Time'}, 
      ];
   }
   static get ChargeOn() {
      return [
         {code: 105, name: 'principal', label: 'Principal',},
         {code: 110, name: 'interest', label: 'Interest',},
         {code: 115, name: 'both', label: 'Both',},
      ];
   }
   static get GLEntityType() {
      return [
         {code: 105, name: 'bw', label: 'BANKS - WALLET',},
         {code: 110, name: 'bo', label: 'BANKS - ONLINE',},
         {code: 115, name: 'wa', label: 'WALLET AUM',},
         {code: 120, name: 'ip', label: 'IN - PRODUCT',},
         {code: 125, name: 'if', label: 'INVESTMENT(FUNDS)',},
         {code: 130, name: 'ine', label: 'INTEREST EXPENSE',},
         {code: 135, name: 'inp', label: 'INTEREST PAYABLE',},
         {code: 140, name: 'wp', label: 'WHT PAYABLE',},
         {code: 145, name: 'di', label: 'DIVIDEND INCOME',},
         {code: 150, name: 'dr', label: 'DIVIDEND RECEIVABLES',},
         {code: 155, name: 'op', label: 'OTHER INCOME - PRE LIQUIDATION CHARGE',},
      ];
   }
}