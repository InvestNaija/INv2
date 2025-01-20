export class DBEnums {
   static get AssetCategory() {
      return [
         {code: 105, name: 'bond', label: 'Bond', desc: `Preserve your principal and enjoy guaranteed income for the medium to long term`},
         {code: 110, name: 'fund', label: 'Fund', desc: `Invest in secure, regulated and professionally managed funds`},
         {code: 110, name: 'tbills', label: 'Treasury Bills', desc: `A great option to invest in the short term`},
         {code: 110, name: 'cp', label: 'Commercial Paper', desc: `Great for medium term investmnts`},
         {code: 110, name: 'po', label: 'Primary Offer', desc: `Subscribe into the primary markets for stocks and other types of investments`},
      ];
   }
}