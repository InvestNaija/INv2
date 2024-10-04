export class Helper {
   static generateOTCode (size = 6, alpha = true)  {
      const chars = alpha ? "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-" : "0123456789";
      const characters = chars.split("");
      let selections = "";
      for (let i = 0; i < size; i++) {
         const index = Math.floor(Math.random() * characters.length);
         selections += characters[index];
      // characters.splice(index, 1);
      }
      return selections;
   }

   static generatePassword (length: number, {includeNumbers=true, includeUpperChars=true, includeLowerChars=true, includeSpecialChars=true})  {
      const numberChars = "0123456789";
      const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lowerChars = "abcdefghiklmnopqrstuvwxyz";
      const specialChars = "`~!@#$%^&*()_-+=<>,.?|";
      const allChars = (includeNumbers?numberChars:'') + (includeUpperChars?upperChars:'') + (includeLowerChars?lowerChars:'') + (includeSpecialChars?specialChars:'');
      let randPasswordArray = Array(length);
      randPasswordArray[0] = numberChars;
      randPasswordArray[1] = upperChars;
      randPasswordArray[2] = lowerChars;
      randPasswordArray[3] = specialChars;
      randPasswordArray = randPasswordArray.fill(allChars, 3);
      return shuffleArray(randPasswordArray.map(function(x) { return x[Math.floor(Math.random() * x.length)]; })).join('');

      function shuffleArray(array: string[]) {
         for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
         }
         return array;
      }
   }
   static capitalize (s: string)  {
      return s && s[0].toUpperCase() + s.slice(1);
   }
   static getMimeType  (base64: string) {
      const signatures: {[key: string]: string} = {
         'JVBERi0': 'application/pdf',
         'R0lGODdh': 'image/gif',
         'R0lGODlh': 'image/gif',
         'iVBORw0KGgo': 'image/png',
         '/9j/': 'image/jpg',
      };
      for(const sign in signatures)
         if(base64.startsWith(sign)) 
            return signatures[sign];
      return '';
   }

   static async checkToken   (params: {duration: string, tokenTime: Date}) {
      const now = new Date();
      now.setMinutes(now.getMinutes());
      // now = new Date(now);
      const diff = new Date(now).getTime() - new Date(params.tokenTime).getTime();
      if(diff >= (Number(params.duration)*60000)){
         return false;
      }
      return true;
   }

   static async faq  ()  {
      const faqs = [
         {
            "id": 1,
            "question": "What is a Rights Issue?",
            "answer": "A Rights Issue is an offer made by a company to its existing shareholders to buy additional shares of the company’s stock, thereby increasing their stakes in the company’s future and increasing their wealth."
         },
         {
            "id": 2,
            "question": "Why is Access Holdings executing a Rights Issue?",
            "answer": "Access Holdings is executing a Rights Issue to consolidate its position as the leading financial services institution in Nigeria and transform to become the largest in Africa. Access Holdings wants shareholders to be a part of this transformation. This is your chance to increase your investment in a company poised for transformative growth."
         },
         {
            "id": 3,
            "question": "Is the Rights Issue in response to the Central Bank of Nigeria’s announcement on recapitalisation?",
            "answer": "No, the Rights Issue is not in direct response to the Central Bank’s announcement on recapitalisation. Rather, the Rights Issue is a proactive step by Access Holdings to further strengthen its flagship subsidiary, Access Bank’s balance sheet, and support the Group’s growth objectives. By participating in this Rights Issue, you are joining a journey driven by optimism and ambition, where every investor plays a vital role in shaping a brighter future."
         },
         {
            "id": 4,
            "question": "Who can participate in the Rights Issue?",
            "answer": "The Rights Issue is intended for Access Holdings’ Shareholders who were on the Company’s register as at the qualification date of June 7, 2024. Shareholders who qualify can participate directly in the offer (the details of the shares offered to each shareholder will be stated in the Rights Circular or can be obtained through the Primary Offer web and mobile applications). However, non-shareholders who are interested in participating in the Rights Issue can purchase Traded Rights through Chapel Hill Denham Securities on the floor of the Nigerian Exchange."
         },
         {
            "id": 5,
            "question": "Why is Access Holdings not embarking on a Public Offer?",
            "answer": "Access Holdings isn’t pursuing a public offer because of the value placed on Shareholder support, loyalty, and partnership. Access Holdings believes that Shareholders should benefit from the value accretion that will come following the Issue and should not be diluted."
         },
         {
            "id": 6,
            "question": "Does Access Holdings have all the approvals required for this transaction?",
            "answer": "Yes! Access Holdings has all the necessary approvals for this transaction - from the Board and Shareholders as well as the Securities & Exchange Commission (SEC), Nigerian Exchange Limited (NGX) and Central Bank of Nigeria (CBN)."
         },
         {
            "id": 7,
            "question": "Who is the Lead Issuing House to the Rights Issue?",
            "answer": "Chapel Hill Denham Advisory Limited is the Lead Issuing House."
         },
         {
            "id": 8,
            "question": "What is the Rights Issue ratio?",
            "answer": "You will receive one (1) share for every two (2) shares held as at the qualification date of June 7, 2024."
         },
         {
            "id": 9,
            "question": "What is the price of the Rights Issue?",
            "answer": "The Rights shares are being sold at N19.75k per share. This is an incredible opportunity to invest in a company you trust, at a price that offers real potential for growth."
         },
         {
            "id": 10,
            "question": "What information will Shareholders need to buy their Rights using the Primary Offer Application?",
            "answer": "The Shareholders would be required to input their CHN or RIN / Shareholder ID which will validate their details to ensure a quick and seamless application and payment process."
         },
         {
            "id": 11,
            "question": "How do Shareholders get their RIN / Shareholder’s ID?",
            "answer": "Shareholders who have previously submitted their active phone number and email address to the Registrar of Access Holdings will receive the Rights Circular and their Shareholder ID via SMS or email respectively. Shareholders that have not yet submitted their e-contact details to the Registrars - but whose physical addresses are in the Registrar’s database - will receive their Rights Circular via post (the Shareholder ID will be indicated on the Rights Circular). You can also call 0700 242 735 4455 or send an email to info@primaryofferng.com to retrieve your Shareholder ID."
         },
         {
            "id": 12,
            "question": "How do Shareholders know how many shares they have been provisionally allotted?",
            "answer": "The provisional allotment of shares has already been automatically computed and communicated to each Shareholder with the Rights Circular. The Provisional Rights allotment is the Rights due to each Shareholder based on their holdings as at the qualification date."
         },
         {
            "id": 13,
            "question": "How do Shareholders purchase additional share units above their Provisional Allotment?",
            "answer": "To get more shares than your provisional allotment, simply select the additional rights option on Primary Offer. Seize this chance to increase your investment. Please note that you must have taken up your full Rights before you can purchase additional shares."
         },
         {
            "id": 14,
            "question": "What is the period for the Rights Issue?",
            "answer": "The Rights Issue opens on Monday, July 8, 2024, and closes on Wednesday, August 14, 2024. This limited-time window is your chance to secure additional shares and increase your investment in Access Holdings."
         },
         {
            "id": 15,
            "question": "What are the participation options available to Shareholders?",
            "answer": "The Rights Circular outlines the details of the offer, including the subscription price, ratio, deadline for participation, etc. Shareholders can participate by either opting to i. Buy All their Rights and Buy Additional Rights, ii. Buy some of their Rights, iii. Trade some of their Rights iv. Renounce their Rights or v Do Nothing."
         },
         {
            "id": 16,
            "question": "Is it mandatory for Shareholders to collect their Rights Issue Payment Receipt?",
            "answer": "Yes, collecting the payment receipt is mandatory as it confirms the transaction and secures your investment."
         },
         {
            "id": 17,
            "question": "What can Shareholders do if they do not want to accept their Rights?",
            "answer": "If you choose not to accept your Rights, you can; i. renounce your Rights, ii. you can trade them on the floor of the Nigerian Exchange during the Offer Period (at the token price prevailing on the date of the trade). On the other hand, Shareholders that are eager to invest more can purchase Traded Rights or apply for additional shares. We are here to help you every step of the way."
         },
         {
            "id": 18,
            "question": "How will the Rights Issue affect the value of the Shareholders’ existing shares?",
            "answer": "While the issuance of new shares might dilute the current value of your holdings initially, the capital raised will fuel Access Holdings’ growth, potentially increasing the long-term value of your investment. Think of it as planting seeds for a bountiful future."
         },
         {
            "id": 19,
            "question": "Where can Shareholders get more information about the Rights Issue?",
            "answer": "For detailed information, including terms, subscription processes, and how the proceeds will be used, refer to the Rights Circular. You can also reach out to Chapel Hill Denham by visiting the Lagos office at 10 Bankole Oki Street, Ikoyi, or the Abuja office at 3rd Floor, Grand Square, 270 Muhammed Buhari Way, Central Business District, Abuja. Alternatively, you can call 0700 242 735 4455, send an email to info@primaryofferng.com or visit www.chapelhilldenham.com for more information about the offer. We are here to ensure you have all the details to make an informed and exciting investment."
         },
         {
            "id": 20,
            "question": "When will the Rights be allotted?",
            "answer": "After the Rights Issue closes, approvals would be received from the regulatory authorities including the Central Bank of Nigeria (CBN), the Securities & Exchange Commission (SEC), etc. before allotment."
         },
         {
            "id": 21,
            "question": "How do shareholders purchase additional share units above their Provisional Allotment?",
            "answer": "Only clients who have made full subscriptions can apply for additional rights on the application."
         },
         {
            "id": 22,
            "question": "I live abroad, I am Nigerian, can I buy?",
            "answer": "Yes, you can buy with your valid Bank Verification Number (BVN) and CHN and eligible for the rights."
         },
         {
            "id": 23,
            "question": "What information should I keep after I submit the application?",
            "answer": "If your application is successfully submitted through PrimaryOffer, you will receive a confirmation email."
         },
         {
            "id": 24,
            "question": "Could you please provide step by step guide on how to register and apply for the Access Bank Rights Issue using the PrimaryOffer app?",
            "answer": `<p><b>Follow the steps below to subscribe</b></p>
                        <ol>
                            <li>Select “Access Rights Issue”</li>
                            <li>View details of the Offer</li>
                            <li>Input your Bank details for verification</li>
                            <li>Input your CHN or RIN (Shareholder ID) for eligibility</li>
                            <li>If you are eligible for the rights, the app will display the total rights available for purchase.</li>
                            <li>Input amount you wish to purchase and other required information</li>
                            <li>App displays transaction summary</li>
                            <li>Read and accept the terms and conditions</li>
                            <li>Proceed to Make Payment</li>
                            <li>You will receive a notification of the successful submission in your email</li>
                            <li>Only clients who have made full subscriptions can apply for additional rights</li>
                        </ol>`
         },
         {
            "id": 25,
            "question": "Will there be any added charges when making payment for shares on the PrimaryOffer app?",
            "answer": "There is no cost to use the application. However, payment processing fees will apply as specified by the payment option selected."
         },
         {
            "id": 26,
            "question": "I want to create an account, but I don’t remember my BVN",
            "answer": "Kindly dial *565*0# on the phone number linked to your BVN profile for retrieval or contact your bank’s customer care or app for retrieval."
         },
         {
            "id": 27,
            "question": "I get an error “Date of birth does not match Bank Verification Number (BVN) details”",
            "answer": "Kindly confirm that you are inputting the correct date of birth on your BVN profile. If you still receive an error message, please visit your Bank to validate your BVN information."
         },
         {
            "id": 28,
            "question": "I am unable to get the OTP",
            "answer": "The OTP is sent only to your registered email address. Please refresh your email and check your junk/spam folder. In addition, kindly check to confirm that you are properly connected to the internet."
         },
         {
            "id": 29,
            "question": "I am unable to log in to the app",
            "answer": "Please ensure that you have entered your correct login details (email and password) and that your device has a stable internet connection."
         },
         {
            "id": 30,
            "question": "Can I change my password? How do I go about it?",
            "answer": "Kindly select the “forgot password” option on the landing page and follow the instructions for a password reset."
         },
         {
            "id": 31,
            "question": "I forgot my password. How do I retrieve it?",
            "answer": "Kindly select the “forgot password” option on the landing page and follow the instructions for a password reset."
         },
         {
            "id": 32,
            "question": "I am unable to change my password",
            "answer": "The password field is case and space sensitive. Please ensure that you input your details correctly, and if it persists, please log out and log in again or call our support number at 0700 242735 4455 or send an email to info@primaryofferng.com."
         },
         {
            "id": 33,
            "question": "I already have a CHN what do I do?",
            "answer": "If you have a CHN, simply input your details in the relevant field and follow the steps to confirm your eligibility to participate in the offer."
         },
         {
            "id": 34,
            "question": "The app keeps timing out",
            "answer": "The application automatically logs you out if idle for a period of 10 minutes."
         },
         {
            "id": 35,
            "question": "How do I pay?",
            "answer": `<p><b>Select one of the options available on the payment page:</b></p>
                      <ol>
                          <li>Pay with card</li>
                          <li>Direct debit from your account</li>
                          <li>Pay via Electronic transfer</li>
                          <li>Pay with QR Code</li>
                          <li>Pay with USSD Code</li>
                          <li>Pay at the bank</li>
                          <li>Confirm the amount to be paid</li>
                          <li>Click on the Continue button</li>
                      </ol>`
         },
         {
            "id": 36,
            "question": "I get an error to contact my Bank when I try to make payment with my Card",
            "answer": "Kindly contact your bank to enable you use your card for online payments or make use of other available payment options."
         },
         {
            "id": 37,
            "question": "I got a failed error response after funding but was debited",
            "answer": "Reversal of funds typically takes 24 working hours. However, you may need to contact your bank for further assistance."
         },
         {
            "id": 38,
            "question": "I have been debited, but my payment status shows pending",
            "answer": "Kindly check the application again after a while to confirm status. If the status remains same, please forward your proof of payment to info@primaryofferng.com for further review."
         },
         {
            "id": 39,
            "question": "I received an error response, “Page could not be found”, while making a payment with the USSD option",
            "answer": "Kindly refresh the page to confirm if payment was successful. However, you can subscribe via other payment options."
         },
         {
            "id": 40,
            "question": "I am unable to relaunch the app after your recent update.",
            "answer": "Kindly update your device Operating System (OS) and try again."
         },
         {
            "id": 41,
            "question": "How will I know if my transaction is successful?",
            "answer": "If you subscribe through PrimaryOffer, you will receive a confirmation via email advising that your application has been successfully submitted."
         },
         {
            "id": 42,
            "question": "My Bank details are not validating on the portal",
            "answer": "Please confirm that you have selected the correct Bank name and input the correct account number and try again. Please note that the Bank account name must match the name on your BVN."
         },
         {
            "id": 43,
            "question": "How do I contact your customer care?",
            "answer": `
            <ul>
                <li>Telephone - 0700 242735 4455</li>
                <li>Email - <a href="mailto:info@primaryofferng.com">info@primaryofferng.com</a></li>
            </ul>
          `
         }
      ];
    
      return faqs;
   }

   static countries () {
      return [
         'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia','Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin','Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi','Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia','Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia', 'Denmark', 'Djibouti', 'Dominica','Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini','Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada','Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia','Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati','Korea, North', 'Korea, South', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia','Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta','Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro','Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger','Nigeria', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru','Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia','Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia','Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa','South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan','Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan','Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan','Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
      ];
   }

   static getCurrencyCodes () {
      return [
         {id: "1", name: "Nigerian Naira", symbol: "₦", code: "NGN"},
         {id: "2", name: "US Dollar", symbol: "$", code: "USD"},
         {id: "3", name: "Euro", symbol: "€", code: "EUR"},
         {id: "4", name: "Pounds", symbol: "£", code: "GBP"},
      ];
   }
   static getBankList() {
      return [
         {
            "name": "Access Bank Plc",
            "slug": "access-bank",
            "code": "044"
         },
         {
            "name": "Citibank Nigeria Limited",
            "slug": "citibank-nigeria",
            "code": "023"
         },
         {
            "name": "Ecobank Nigeria Plc",
            "slug": "ecobank-nigeria",
            "code": "050"
         },
         {
            "name": "Fidelity Bank Plc",
            "slug": "fidelity-bank",
            "code": "070"
         },
         {
            "name": "First Bank Nigeria Limited",
            "slug": "first-bank-of-nigeria",
            "code": "011"
         },
         {
            "name": "First City Monument Bank Plc",
            "slug": "first-city-monument-bank",
            "code": "214"
         },
         {
            "name": "Globus Bank Limited",
            "slug": "globus-bank",
            "code": "00103"
         },
         {
            "name": "Guaranty Trust Bank Plc",
            "slug": "guaranty-trust-bank",
            "code": "058"
         },
         {
            "name": "Keystone Bank Limited",
            "slug": "keystone-bank",
            "code": "082"
         },
         {
            "name": "Parallex Bank Ltd",
            "slug": "parallex-bank",
            "code": "104"
         },
         {
            "name": "Polaris Bank Plc",
            "slug": "polaris-bank",
            "code": "076"
         },
         {
            "name": "Premium Trust Bank",
            "slug": "premium-trust-bank",
            "code": "100"
         },
         {
            "name": "Providus Bank",
            "slug": "providus-bank",
            "code": "101"
         },
         {
            "name": "Stanbic IBTC Bank Plc",
            "slug": "stanbic-ibtc-bank",
            "code": "221"
         },
         {
            "name": "Standard Chartered Bank Nigeria Ltd.",
            "slug": "standard-chartered-bank",
            "code": "068"
         },
         {
            "name": "Sterling Bank Plc",
            "slug": "sterling-bank",
            "code": "232"
         },
         {
            "name": "SunTrust Bank Nigeria Limited",
            "slug": "suntrust-bank",
            "code": "100"
         },
         {
            "name": "Titan Trust Bank Ltd",
            "slug": "titan-trust-bank",
            "code": "102"
         },
         {
            "name": "Union Bank of Nigeria Plc",
            "slug": "union-bank-of-nigeria",
            "code": "032"
         },
         {
            "name": "United Bank For Africa Plc",
            "slug": "united-bank-for-africa",
            "code": "033"
         },
         {
            "name": "Unity Bank Plc",
            "slug": "unity-bank",
            "code": "215"
         },
         {
            "name": "Wema Bank Plc",
            "slug": "wema-bank",
            "code": "035"
         },
         {
            "name": "Zenith Bank Plc",
            "slug": "zenith-bank",
            "code": "057"
         },
         {
            "name": "Optimus Bank",
            "slug": "optimus-bank",
            "code": "100"
         },
         {
            "name": "Signature Bank Limited",
            "slug": "signature-bank",
            "code": "103"
         }
      ];
   }
}
