import { injectable } from 'inversify';
import axios from 'axios';
import moment from 'moment';
import FormData from 'form-data';

/**
 * Zanibal Service Wrapper
 * Handles authentication and communication with the Zanibal API.
 */
@injectable()
export class ZanibalService {
   private token: string | null = null;
   private tokenCreated: moment.Moment | null = null;

   /**
    * Authenticates with Zanibal and caches the token for 30 minutes.
    * Uses Form-Data for the login request as required by the vendor API.
    */
   private async login() {
      if (this.token && this.tokenCreated && moment().diff(this.tokenCreated, 'minutes') < 30) {
         return this.token;
      }

      const data = new FormData();
      data.append('username', process.env.ZANIBAL_USER || '');
      data.append('password', process.env.ZANIBAL_PASSWORD || '');

      const config = {
         method: 'post',
         url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/security/request/access-token`,
         headers: {
            ...data.getHeaders(),
         },
         data: data,
      };

      const response = await axios.request(config);
      this.token = response.data.access_token;
      this.tokenCreated = moment();
      return this.token;
   }

   /**
    * Generates common request headers including the Bearer token for authorized requests.
    */
   private async getHeaders() {
      const token = await this.login();
      return {
         Authorization: `Bearer ${token}`,
         'Content-Type': 'application/json',
      };
   }

   /**
    * Retrieves all active funds from the Zanibal application.
    */
   async getAllFunds() {
      const headers = await this.getHeaders();
      const response = await axios.get(`${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/fund/list/active`, {
         headers,
      });
      return { success: true, data: response.data };
   }

   /**
    * Initiates a fund transaction (Subscription or Redemption) in the vendor's application.
    * @param data Transaction payload following Zanibal's requirements.
    */
   async createFundTransaction(data: any) {
      const headers = await this.getHeaders();
      const url =
         data.transType === 'SUBSCRIPTION'
            ? `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/fundtransaction/submit/get-cash-account`
            : `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/fundtransaction/submit`;

      const response = await axios.post(url, data, { headers });
      return { success: true, data: response.data };
   }

   /**
    * Posts (approves/commits) a fund transaction in the vendor's application.
    * @param txnId The identifier for the transaction created in the previous step.
    */
   async postFundTransaction(txnId: string) {
      const headers = await this.getHeaders();
      const response = await axios.put(
         `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/fundtransaction/post/${txnId}`,
         {},
         { headers },
      );
      return { success: true, data: response.data };
   }

   /**
    * Retrieves the valuation for a specific portfolio over a date range.
    * @param portfolioId Portfolio ID from Zanibal.
    * @param startDate Start date (YYYY-MM-DD).
    * @param endDate End date (YYYY-MM-DD).
    */
   async getPortfolioBalance(portfolioId: string, startDate: string, endDate: string) {
      const headers = await this.getHeaders();
      const response = await axios.get(
         `${process.env.ZANIBAL_APPSERVER_BASE_URL}/partner/portfolio-valuation-for-date-range/id/${portfolioId}?sd=${startDate}&ed=${endDate}`,
         { headers },
      );
      return { success: true, data: response.data };
   }
}
