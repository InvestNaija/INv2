// const { sendEmail } = require("../../config/emailSendpulse");
import { UserDto } from '../_dtos';
import { sendEmail } from '../config/email';
import moment from 'moment';
export { moment };

interface IEmailBuilder {
  recipient: string|string[];
  sender: string;
  subject: string;
  template?: string;
}
interface IEmailType {
  type: string;
  meta: any;
  message?: string;
}
export class EmailBuilderService {
  declare recipient: string|string[];
  declare sender: string;
  declare subject: string;
  private template: string;
  declare customer: Partial<UserDto>;
  declare emailPayload: any
  declare attachments: any[]
  constructor(params: IEmailBuilder) {
    this.recipient = params.recipient;
    this.sender = params.sender;
    this.subject = params.subject;
    this.template = params.template || 'newDefault.html';
  }

  setCustomerDetails(customer: Partial<UserDto>) {
    this.customer = customer
    return this
  }

  setEmailType(emailType: IEmailType) {
    switch (emailType.type) {
      case 'sign_up': {
        const message = emailType.meta.message ?? `
          <p>Thank you for signing up on InvestNaija</p>
          <br>
          <p>Please use the token below to complete registration.</p>
          <br>
          <div style="text-align:center; background:#219392; width: 25%; padding:3px; color: white; margin-left: auto; margin-right: auto;">
            <h3>${emailType.meta.token}</h3>
          </div>
          <br>
        `
        this.emailPayload = {
          message,
        }
        break
      }
      case 'reject-usd-transaction': {
        const { reason, amount , currency } = emailType.meta;
        
        const message = `Your transaction of ${(new Intl.NumberFormat(`en-${currency=='USD'?'us':'ng'}`, {style: 'currency', currency,})).format(amount)} was rejected.
        <br>
        Reason: ${reason}.
        <br>
        Thank you for choosing InvestNaija.
        <br>
        <i>070046837862452 (0700INVESTNAIJA)</i>
        <br>
        <i>Info@investnaija.com</i>`
        this.emailPayload = {
          message
        }
        break;
      }
      case 'approve-usd-transaction': {
        const { amount , currency } = emailType.meta;
        const message = `Your transaction of ${(new Intl.NumberFormat(`en-${currency=='USD'?'us':'ng'}`, {style: 'currency', currency,})).format(amount)} has been approved}.
        <br>
        Thank you for choosing InvestNaija.
        <br>
        <i>070046837862452 (0700INVESTNAIJA)</i>
        <br>
        <i>Info@investnaija.com</i>`
        this.emailPayload = {
          message
        }
        break;
      }      
      case 'forgot_password': {
        const message = emailType.meta.message ?? `
          <p>
            We received a request to reset your InvestNaija password.
          </p>
          <p>
            If this was you please use the one-time code below to reset your account's password.
          </p>
          <br>
          <div style="text-align:center; background:#219392; width: 25%; padding:3px; color: white; margin-left: auto; margin-right: auto;">
            <h3>${emailType.meta.otp}</h3>
          </div>
          <br>
          <p>
            If you didn’t request a new password, you can safely ignore this email.
          </p>
          <p>
            Please note that this one-time code lasts 10 minutes.
          </p>
          <p>
            <strong>Just a reminder:</strong> Never share your password with anyone.
          </p>
        `
        this.emailPayload = {
          message,
        }
        break;
      }
      case 'cscs-verification': {
        const { firstName, lastName, cscs} = emailType.meta;
        const message = `
          <p>The customer below wants to verify his CSCS.</p>
          <br>
          <p><b>First Name:</b> ${firstName}</p>
          <br>
          <p><b>Last Name:</b> ${lastName}</p>
          <br>
          <p><b>CSCS:</b> ${cscs}</p>
          <br>
          <i>070046837862452 (0700INVESTNAIJA)</i>
          <br>
          <i>Info@investnaija.com</i>`
        this.emailPayload = {
          message
        }
        break;
      }
      case 'login': {
        let now = moment().format('llll');
        const message = emailType.meta.message ?? `
          You successfully logged into your InvestNaija account on <large><b>${now}</b></large>.
          <br>
          <br>
          If you did not initiate this session, please contact our Support Team on 0700 INVESTNAIJA (0700 46837 862452)  
          or send an email to ${process.env.SUPPORT_EMAIL} immediately.
          <br>
          <br>
          <i>
          <b>Please note:<b> Never share your password with anyone. Create passwords that are hard to guess and don’t include personal information in your password.</i>
          <br>
          Thank you for choosing InvestNaija.
          <br>
        `
        this.emailPayload = {
          message,
        }
        break;
      }
      case 'change-password': {
        const message = emailType.meta.message ?? `
          <p>
            We received a request to reset your InvestNaija password.
          </p>
          <p>
            If this was you please use the one-time code below to reset your account's password.
          </p>
          <br>
          <div style="text-align:center; background:#219392; width: 25%; padding:3px; color: white; margin-left: auto; margin-right: auto;">
            <h3>${emailType.meta.otp}</h3>
          </div>
          <br>
          <p>
            If you didn't request a new password, you can safely ignore this email.
          </p>
          <p>
            Please note that this one-time code lasts 10 minutes.
          </p>
          <p>
            <strong>Just a reminder:</strong> Never share your password with anyone. 
            Create passwords that are difficult to guess and don’t include personal information in your password. 
            For added security, include uppercase and lowercase letters, numbers, and symbols. Lastly, try to use different passwords for each of your online accounts.
          </p>
          <p>
            This is an automated message, please do not reply directly to the email.
          </p>
        `
        this.emailPayload = {
          message,
        }
        break
      }
      case 'resend_otp': {
        const otp = emailType.meta.otp;
        const message = emailType.meta.message ? `
        <p>${emailType.meta.message}</p> 
        <br>
        <div style="text-align:center; background:#219392; width: 25%; padding:3px; color: white; margin-left: auto; margin-right: auto;">
          <h3>${otp}</h3>
        </div>
        ` : `
        <p>Please enter this code to verify your account</p>
        <br>
        <div style="text-align:center; background:#219392; width: 25%; padding:3px; color: white; margin-left: auto; margin-right: auto;">
          <h3>${otp}</h3>
        </div>
        `
        this.emailPayload = {
          message,
        }
        break
      }
      case 'register-user': {
        const message = emailType.meta.message ?? `
        Please Login into Invest Naija app <a href="https://app.investnaija.com">here</a> with this password ${emailType.meta.defaultPassword} and reset your password.`
        this.emailPayload = {
          message,
        }
        break
      }
      case 'fund_confirmation': {
        let now = moment().format('ll');
        const message = emailType.meta.message ?? `
          Your IN Wallet has been credited successfully with the sum of N ${emailType.meta.amount}. Here's your updated account balance:
          <br>
          <br>
          Account Name: ${emailType.meta.name}<br>
          Account Number: ${emailType.meta.id}<br>
          Product: ${emailType.meta.product}<br>
          Current Balance: ${emailType.meta.balance}<br>
          <br>
          <br>
          Thank you for choosing InvestNaija.
        `
        this.emailPayload = {
          message,
        }
        break
      }
      case 'fund-purchase-notify-admin': {
        let now = moment().format('ll');
        const message = emailType.meta.message ?? `
          Customer ${emailType.meta.customer?.firstName + ' ' + emailType.meta.customer?.lastName} (${emailType.meta.customer?.email}) made a fund purchase with following details<br><br>
          Amount: ${(new Intl.NumberFormat(`en-${emailType.meta.currency}`, {style: 'currency', currency: emailType.meta.currency,})).format(emailType.meta.amount)}<br>
          Fund Txn Id: ${emailType.meta.fundId}<br>
          Cash Txn Id: ${emailType.meta.cashId}<br>
          Cash has been posted but fund transaction will be posted on: ${moment(emailType.meta.postDate).format('ll')}<br><br><br>
          Best regards,.
        `
        this.emailPayload = {
          message,
        }
        break
      }
      case 'fund-posted-notify-admin': {
        const message = emailType.meta.message ?? `
          Fund subscription ${emailType.meta.fundId} with cash reference ${emailType.meta.ref}
          by customer ${emailType.meta.customer?.firstName + ' ' + emailType.meta.customer?.lastName} (${emailType.meta.customer?.email}) made on ${emailType.meta.created} has now been posted today.<br><br><br>
          Best regards,.
        `
        this.emailPayload = {
          message,
        }
        break
      }
      case 'fund-deleted-notify-admin': {
        const message = emailType.meta.message ?? `
          Fund subscription ${emailType.meta.fundId} made on ${emailType.meta.created} has been deleted because the transaction status is: ${emailType.meta.status}.<br><br><br>
          Best regards,.
        `
        this.emailPayload = {
          message,
        }
        break
      }
      case 'wallet-withdrawal': {
        try {
          const { amount, currency } = emailType.meta
          
          const currencyConverter = (new Intl.NumberFormat(`en-${currency}`, {style: 'currency', currency,})).format(amount)
          const message = emailType.meta.message ?? `Your wallet withdrawal of ${currencyConverter} was successful.<br>Amount deposited into your bank account`;
          this.emailPayload = {
            message,
          }
          break
        } catch (error) {
          console.error(error);
        }
      }
      case 'withdrawal': {
        try {
          const { product, amount, currency, fundApp, fund_name } = emailType.meta
          const currencyConverter = (new Intl.NumberFormat(`en-${currency}`, {style: 'currency', currency,})).format(amount)
          let email_product;
          if (!fundApp) {
            email_product = product.toLowerCase() === 'planin' ? 'PlanIN' : 'SaveIN';
          } else {
            email_product = fund_name
          }

          const message = emailType.meta.message ?? `
            You just successfully redeemed ${currencyConverter} from your ${email_product}.
            <br>
            <br>
            <i>If you have any questions, please call us on 0700 INVESTNAIJA (0700 46837 862452) or send an email to Info@investnaija.com</i>
            <br>
            <br>
            Thank you for choosing InvestNaija. 
          `
          this.emailPayload = {
            message,
          }
          break
        } catch (error) {
          console.error(error);
        }
      }
      case 'tradein': {
        this.emailPayload = {
          subject: 'Thank you for your order',
          template: 'tradeinReciept.html',
          reference: emailType.meta.reference,
          purchase: emailType.meta.purchase,
          order_type: emailType.meta.order_type,
          units: emailType.meta.units,
          price: emailType.meta.price,
          status: 'Processing',
          total: emailType.meta.total,
          email: emailType.meta.email
        }
        break;
      }
      case 'login_failed': {
        let now = moment().format('llll');

        const message = emailType.meta.message ?? `Your login attempt on ${now} was unsuccessful.
        <br>
        If you did not initiate this session, please change your password immediately. 
        <br>
        <br>
        <strong>Just a reminder:</strong> Never share your password with anyone. Create passwords that are hard to guess and don't
        include personal information in your password.</i>
        <br>
        Thank you for choosing InvestNaija.
        <br>
        `
        this.emailPayload = {
          message,
        }
        break;
      }
      case 'change_password_success': {
        const message = emailType.meta.message ?? `
        <p>
        You have successfully changed the password for your InvestNaija account.
        </p>
        <p>
        If you did not make this change, please change your password immediately.  
        </p>
        <p>
        <strong>Just a reminder:</strong> Never share your password with anyone. 
        Create passwords that are difficult to guess and don’t include personal information in your password. For added security, 
        include uppercase and lowercase letters, numbers, and symbols. Lastly, try to use different passwords for each of your online accounts. 
        </p>
        `
        this.emailPayload = {
          message,
        }
        break;
      }
      case 'first-login': {
        const message = emailType.meta.message ?? `
        <p>On behalf of my team, I welcome you to InvestNaija. We are delighted to have you on board, and we look forward to guiding you on your journey to financial security.</p>
        <p>If there’s anything I’ve learned in my nearly two decades leading <a href="https://www.chapelhilldenham.com">Chapel Hill Denham</a>, it's the importance of financial education and market access to lasting prosperity. So, we’ve built InvestNaija with this in mind and will show Nigerians how to plan, save, and invest responsibly.</p>
        <p>We have curated savings and investment products that allow you to reap the full benefits of compounding, so your money works harder for you, as you take your first step towards financial freedom today.</p>
        <p>Of note, we are excited about our 100M65&trade; investment product, which essentially enables you to make SMART financial decisions for tomorrow. No matter where you start, you are guaranteed to end with N100,000,000 by the time you turn 65, ensuring you have a sizeable retirement fund to depend on.</p>
        <p>You can rest assured that your funds are safe and are professionally managed by our experienced investment team.</p>
        <p>My colleague, [Adaora], will be in touch with you over the coming weeks and will serve as your guide to ensure you get the most out of your money with InvestNaija.</p>
        <p>Keep Well.</p>
        <p><strong>Bolaji Balogun</strong></p>
        <p><strong>CEO</strong></p>
        <br>
        <i>PLEASE DO NOT REPLY TO THIS EMAIL</i>
        `
        this.emailPayload = {
          message,
        }
        break;
      }
      case 'cscs-request': {
        const message = `
        <p>Your CSCS account creation has successfully been initiated.</p>
        <br>
        <p>Please be aware that this process may take between 24 to 48 hours to complete.</p>
        <br>
        <p>You will be notified once the process is complete.</p>
        `;
        this.emailPayload = {
          message
        }
        break;
      }
      case 'reset-password': {
        const message = `
        <p>Your password was recently updated. If you did not make this change, please contact our 
        Support Team on 0700 INVESTNAIJA (0700 46837 862452) or send an email to ${process.env.SUPPORT_EMAIL} right away</p>.
        <br>
        <p>
            <strong>Just a reminder:</strong> Never share your password with anyone. 
            Create passwords that are difficult to guess and don’t include personal information in your password. 
            For added security, include uppercase and lowercase letters, numbers, and symbols. Lastly, try to use different passwords for each of your online accounts.
          </p>
         <br>
         `;
        this.emailPayload = {
          message
        }
        break;
      }
      case 'zanibal-created': {
        const message = `Please Login into Invest Naija app <a href="https://app.investnaija.com">here</a> with this password ${emailType.meta.defaultPassword} and reset your password.`;
        this.emailPayload = {
          message
        }
        break;
      }
      case 'zanibal-creation-error': {
        const message = `Please the customer with bvn: ${emailType.meta.customer.bvn} was not registered due to an error, Kindly Fix.`;
        this.emailPayload = {
          message
        }
        break;
      }
      case 'cscs-webhook': {
        const message = `
          <p>Your CSCS webhook received for the client below.</p>
          <p>
            customerEmail: ${emailType.meta.email} <br />
            CSCS:${emailType.meta.cscsNo}<br />
            CHN:${emailType.meta.chn}
          </p>
        `;
        this.emailPayload = {
          message
        }
        break;
      }
      case 'redemption-approved': {
        const message = `
          <p>Your redemption of ${ emailType.meta.currency.toLowerCase() === 'ngn' ? '₦' : '$' }${emailType.meta.amount} for ${emailType.meta.asset} has been approved.</p>
        `;
        this.emailPayload = {
          message
        }
        break;
      }
      case 'cscs-created': {
        const message = `
          <p>Your CSCS account number processing is complete.</p>
          <p>
            ${emailType.meta?.comment?.trim() !== 'Account Already Exist' ? `Comment: ${emailType.meta?.comment}<br />`: 'Sta'}
            CSCS:${emailType.meta.cscsNo}<br />
            CHN:${emailType.meta.chn}
          </p>
        `;
        this.emailPayload = {
          message
        }
        break;
      }
      case 'tokenized-payment': {
        const message = `Your payment of ${emailType.meta.amount} for ${emailType.meta.description} is successful, your application is now confirmed.Your allotment is being processed and would be completed shortly.`;
        this.emailPayload = {
          message
        }
        break;
      }
      case 'wallet-funding-webhook': {
        const message = `Your ${emailType.meta.description} of ${emailType.meta.amount} was successful.`;
        this.emailPayload = {
          message
        }
        break;
      }
      case 'deposit-receipt': {
        const { amount, currency } = emailType.meta;
        const currencyConverter = (new Intl.NumberFormat(`en-${currency}`, {style: 'currency', currency,})).format(amount)
        const message = emailType.meta.message ?? `Your account has been successfully funded with ${currencyConverter}.
        <br>
        Please note that funds received and will be processed on the next business day.
        <br>
        Thank you for choosing InvestNaija.
        <br>
        <i>0700 INVESTNAIJA (0700 46837 862452)</i>
        <br>
        <i>Info@investnaija.com</i>`
        this.emailPayload = {
          message
        }
        break;
      }
      case 'fund-purchase-posted': {
        const { amount, currency } = emailType.meta;
        const currencyConverter = (new Intl.NumberFormat(`en-${currency}`, {style: 'currency', currency,})).format(amount);
        const message = emailType.meta.message ?? `
        Your fund subscription for ${currencyConverter} has now been executed successfully.<br>
        You can log in to the InvestNaija app to check the status of your fund.<br>
        Thank you for choosing InvestNaija.<br>
        <i>0700 INVESTNAIJA (0700 46837 862452)</i>
        <br>
        <i>Info@investnaija.com</i>`
        this.emailPayload = {
          message
        }
        break;
      }
      case 'okhi-init': {
        const { status } = emailType.meta;
        const message = `Your Location verification is ${status.toUpperCase()}.
        <br>
        Please note that, verification takes up to 5 days in extreme cases.
        <br>
        Thank you for choosing InvestNaija.
        <br>
        <i>070046837862452 (0700INVESTNAIJA)</i>
        <br>
        <i>Info@investnaija.com</i>`
        this.emailPayload = {
          message
        }
        break;
      }
      case 'okhi-status-verified': {
        const message = `Your residential address has been successfully verified and added to your InvestNaija profile.     
        <br>
        Thank you for choosing InvestNaija.
        <br>
        InvestNaija Team.
        <br>
        <i>070046837862452 (0700INVESTNAIJA)</i>
        <br>
        <i>Info@investnaija.com</i>`
        this.emailPayload = {
          message
        }
        break;
      }

      case 'okhi-status-unknown': {
        const message = `
        <p>
        We were unable to gather sufficient information to verify your address. This may be due to:
          <br>
          <ul>
            <li>Your device, with the InvestNaija app, was switched off during the verification process</li>
            <li>You disabled the GPS location on your device.</li>
            <li>You revoked the 'always allow' location permission on your device..</li>
            <li>	Your device wasn't connected to the internet during the verification period.</li>
          </ul>
        </p>
        <br>
        Please check your device settings before attempting the address verification process on the InvestNaija app once more.
        We will make another verification attempt over the next few days.
        
        <br>
        Thank you for choosing InvestNaija.
        <br>
        InvestNaija Team.
        <br>
        <i>070046837862452 (0700INVESTNAIJA)</i>
        <br>
        <i>Info@investnaija.com</i>`
        this.emailPayload = {
          message
        }
        break;
      }

      case 'okhi-status-not_at_address': {
        const message = `We were unable to verify that you were at your address. 
        <br>
        <p>
          To enable us verify your address over the next few days, please log in to the InvestNaija app to update your address and attempt another verification.
          Please ensure that the address you provide is your current residential address.
        </p>
        
        <br>
        Thank you for choosing InvestNaija.
        <br>
        InvestNaija Team.
        <br>
        <i>070046837862452 (0700INVESTNAIJA)</i>
        <br>
        <i>Info@investnaija.com</i>`
        this.emailPayload = {
          message
        }
        break;
      }
      case 'device-alert': {
        const { deviceName, location, os } = emailType.meta;
        const message = location ? `There was a new login attempt on your account with a new device.
        <ul>
          <li>Device Name: ${deviceName}</li>
          <li>Time: ${moment().format('llll')}</li>
          <li>Location: ${location}</li>
          <li>OS: ${os}</li>
        </ul>
        <p> If this was you, please ignore this message. If not:
        <br>
        <ul>
          <li>Log in from a trusted device.</li>
          <li>Check your account activity.</li>
          <li>Change your password.</li>
        <br>

        <p>Questions? Contact us at 0700 INVESTNAIJA (0700 46837 862452) or send an email to ${process.env.SUPPORT_EMAIL}.</p>
        ` : `There was a new login attempt on your account with a new device.
        <ul>
          <li>Device Name: ${deviceName}</li>
          <li>Time: ${moment().format('llll')}</li>
          <li>OS: ${os}</li>
        </ul>
        <p> If this was you, please ignore this message. If not:
        <br>
        <ul>
          <li>Log in from a trusted device.</li>
          <li>Check your account activity.</li>
          <li>Change your password.</li>
        <br>

        <p>Questions? Contact us at 0700 INVESTNAIJA (0700 46837 862452) or send an email to ${process.env.SUPPORT_EMAIL}.</p>
        `
        this.emailPayload = {
          message
        }
        break;
      }
      // userEmail: email,
      // firstName, middleName, lastName
      case 'zanibal-report': {
        let {status, error, payload, response, userEmail, firstName, middleName, lastName} = emailType.meta;
        delete payload?.image
        const message = `Zanibal account creation ${status ? `Succeeded`: `Failed`}. 
        <br>
        <p>See details below.</p>
        <br>
        <p><u>User Details</u></p>
        <br>
        <p>First Name: ${firstName}</p>
        <p>Last Name: ${lastName}</p>
        <p>Middle Name: ${middleName}</p>
        <p>Email: ${userEmail}</p>
        <br>
        <div class="box">
          <pre>
            payload = ${JSON.stringify(payload)};
          ${
            status 
            ? 
            `response = ${JSON.stringify(response)}
            ` 
            :
            `<b style="color:red">error = ${JSON.stringify(error)}</b>
            `
          }
          </pre>
        </div>
        
        ${
          status 
          ? 
          `` 
          : 
          `<br>
            Please Take a look at this.
           <br>
          `}`
        this.emailPayload = {
          message
        }
        break;
      }
      case 'user-spool': {
        const message = `
          Newly registered customers for today retrieved successfully. 
          <br />
          Attached to this email, you'll find a spreadsheet containing the details of the newly registered customers.
        `;
        this.emailPayload = {
          message,
        }
        break;
      }
      case 'zanibal-creation-job': {
        const message = `
        Customers created on zanibal for today retrieved successfully. 
          <br />
          Attached to this email, you'll find a spreadsheet containing the details of these customers.
        `;
        this.emailPayload = {
          message,
        }
        break;
      }
      case 'sweep-failed': {
        const { type, amount, accountName } = emailType.meta;
        const message = type === 'DR' ? `
          <p>Movement of ₦${amount} from Wallet to ${accountName} failed.</p>
          <br>
          <p>Please attend to it!!!</p>
        `: 
        `<p>Movement of ₦${amount} from ${accountName} to Wallet failed.</p>
        <br>
        <p>Please attend to it!!!</p>`;
        this.emailPayload = {
          message,
        }
        break;
      }
      default: {
        this.emailPayload = {
          message: emailType.message,
          name: emailType.meta.name
        }
        break;
      }
    }
    return this;
  }
  addAttachments(attachments: any[]) {
    this.attachments = attachments
    return this;
  }
  execute() {
    this.emailPayload.message = `${process.env.NODE_ENV != 'production' ? '<p style="color: red">You are in the <span style="text-transform: uppercase">'+process.env.NODE_ENV +'</span> environment</p><br>':''}` +this?.emailPayload?.message
    const email_ = {
      email: this.recipient,
      sender: this.sender,
      name: this.customer?.firstName,
      subject: this.subject,
      template: this.template,
      attachments: this.attachments,
      ...this.emailPayload,
    }
    sendEmail(email_)
  }
}
