import axios, { RawAxiosRequestHeaders } from 'axios';
import FormData from 'form-data';
import moment from 'moment';
import { Validate } from '../../middlewares';
import { ZanibalValidation } from '../../validations/zanibal.validations';
import { ZanibalCustomerCreateDto } from '../../_dtos/zanibal-customer-create.dto';
import { CustomError, Exception } from '../../errors';
import { EmailBuilderService } from '../email-builder.service';


export class ZanibalService {
   headers: RawAxiosRequestHeaders;
   async init() {
      const data = new FormData();
      data.append('username', process.env.ZANIBAL_USER!);
      data.append('password', process.env.ZANIBAL_PASSWORD!);
      const config = {
         method: 'post',
         maxBodyLength: Infinity,
         url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/security/request/access-token`,
         headers: {
            ...data.getHeaders(),
         },
         data: data,
      };
      const response = await axios.request(config);
      this.headers = {
         Authorization: `Bearer ${response.data.access_token}`,
         'Content-Type': 'application/json',
      };
      return this;
   }
   createUpdateCustomer = async (user: ZanibalCustomerCreateDto) => {
      let post: ZanibalCustomerCreateDto, emailError = null;
      try {
          if (!user.validatorType) throw new Exception({code: 400, message: `Please specify a validator type to proceed`});
         post = {
            ...user,
            active: true,
            birthDate: user.birthDate?moment(user.birthDate).format('YYYY-MM-DD'):null,
            businessOfficeName: (['staging', 'development'].includes(process.env.NODE_ENV) ? "0000000001":"0000000001-1"),
            customerGroupName: "0000000001", customerType: 'REGULAR', partnerType: "INDIVIDUAL", // 'INDIVIDUAL' : 'ORGANIZATION',
            portfolioTypeName: "0000000203", // NSE regular with direct settlement
         };
         if (user.id) {
            ['customerGroupName', 'businessOfficeName', 'customerType', 'partnerType', 'channel', 'portfolioTypeName'].forEach((key: string) => delete (post as { [key: string]: any })[key]);
         }
         
         // if (picture && /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(picture)) {
         //     post['picture'] = picture;
         //     post['pictureMimeType'] = help.getMimeType(picture);
         //     post['pictureFileName'] = 'Face Image';
         // }
         Object.keys(post).forEach((key) => {
            if ((post as { [key: string]: any })[key] === undefined || typeof (post as { [key: string]: any })[key] == 'undefined' || (post as { [key: string]: any })[key] === null)
               delete (post as { [key: string]: any })[key];
         })
         // console.log({postReqToCr8InZanibal: post, time: new Date()})
         const error = Validate(ZanibalValidation[user.validatorType], { body: post })
         if (error) {
            emailError = error
            throw new Exception({code: 400, message: error.message});
         }
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/partner/customer/${post.id ? 'update' : 'create'}`,
            method: `${post.id ? 'PUT' : 'POST'}`,
            headers: this.headers,
            data: JSON.stringify(post),
         });
         // if (!response) throw new AppError('Customer could not be created', __line, __path.basename(__filename), { status: 404 });
         // // await this.createPortfolio({customerId: response.data.msgCode, label: `${firstName} ${lastName}`})

         new EmailBuilderService({ recipient: ['tadejuwon@chapelhilldenham.com', 'ahassan@chapelhilldenham.com'], sender: 'info@investnaija.com', subject: 'Zanibal Customer Creation'})
            .setCustomerDetails({firstName: 'Admin'})
            .setEmailType({type: 'zanibal-report', meta: {
                  status: true,
                  response: response.data,
                  payload: post,
                  userEmail: user.emailAddress1,
                  firstName: user.firstName, middleName: user.middleName, lastName: user.lastName
            }}).execute();
         return { success: true, status: 200, data: response.data }
      } catch (error) {
            new EmailBuilderService({recipient: ['tadejuwon@chapelhilldenham.com'], subject: 'Zanibal Creation', sender: 'info@investnaija.com'})
               .setCustomerDetails({firstName: 'Admin'})
               .setEmailType({type: 'zanibal-report', meta: {
                     status: false,
                     error: emailError ?? error,
                     payload: post,
                     userEmail: user.emailAddress1,
                     firstName: user.firstName, middleName: user.middleName, lastName: user.lastName
            }}).execute()
         //  Logger.error(`File: ${error.file || __path.basename(__filename)}, Line: ${error.line || __line} => ${error.message} <=> ${JSON.stringify(error?.response?.data)}`);
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }//60843
   };
   createPortfolio = async (
      { customerId, label, portfolioType= (['staging', 'development'].includes(process.env.NODE_ENV) ? "0000000001":"ASSET_MGMT")}:
      {customerId: number, label: string, portfolioType: string}
   ) => {
      try{
         const data = { customerId, label, portfolioType }
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/portfolio/create`,
            method: 'POST',
            headers: this.headers,
            data: JSON.stringify(data),
         });
         return { success: true, status: 200, message: 'Portfolio created successfully.' }
      }catch(error){
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   }

   fetchCustomer = async (zanibalId: number|string) => {
      try {
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/partner/customer/id/${zanibalId}`,
            method: 'GET',
            headers: this.headers
         });
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   searchCustomerByBvn = async (bvn: number|string) => {
      try{
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/security/customer/bvn/${bvn}`,
            method: 'GET',
            headers: this.headers
         });
         return { success: true, status: 200, data: response.data }
      }catch(error){
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   }
   getSecurities = async ({ exchange = 'NGX', secType = 'CS', security_type = null, page = null, size = null }) => {
      try {
         let params = ``;
         if (page || size) {
            if (!page || !size) throw new Exception({code: 400, message: 'Pagination parameters are invalid'});
            params += `&b=${page}&c=${size}`;
         }
         if (security_type) {
            params += `&t=${security_type}`;
         }

         const response = await axios.request({
            url: `${process.env.ZANIBAL_MDS_BASE_URL}/security/list?marketId=${exchange}&secType=${secType}`,
            method: 'GET',
         });
         if (!response) throw new Exception({code: 400, message: 'Could not fetch securities'});
         return { success: true, status: 200, data: response.data.filter((sec: any) => ['OTC', 'MFUND', 'ETF'].indexOf(sec.secSubType) == -1) }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   }
   getCashAccount = async (id: number|string) => {
      try {
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/finance/account/customer/id/${id}`,
            method: 'GET',
            headers: this.headers
         });
         if (!response) throw new Exception({code: 400, message: 'Cannot fetch customer cash account'});
         return { success: true, status: 200, data: response.data.result }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getAllFunds = async () => {
      try {
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/fund/list/active`,
            method: 'GET',
            headers: this.headers
         });
         if (!response) throw new Exception({code: 400, message: 'Cannot fetch assets'});
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   createFundTransaction = async (data: any) => {
      try {
         const response = await axios.request({
            url: data.transType === 'SUBSCRIPTION'
                  ? `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/fundtransaction/submit/get-cash-account`
                  : `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/fundtransaction/submit`,
            method: 'POST',
            headers: this.headers,
            data: JSON.stringify(data),
         });
         return { success: true, status: response.status, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getContractNote = async (
      { zanibalId, portfolioId, startDate, endDate, page, size }:
      { zanibalId: number|string, portfolioId: number|string, startDate: Date, endDate: Date, page: number, size: number }
   ) => {
      try {
         let params = ``;
         if (!zanibalId) throw new Exception({code: 400, message: 'Zanibal Id is a required parameter.'});
         if (startDate || endDate) {
            if (!startDate || !endDate) throw new Exception({code: 400, message: 'Error with parameters passed.'});
            params += `&sd=${startDate}&ed=${endDate}`
         }
         if (portfolioId) params += `&p=${portfolioId}`;
         if (page || size) {
            if (!page || !size) throw new Exception({code: 400, message: 'Error with parameters passed.'});
            params += `&b=${page}&s=${size}`
         };
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/customer/contractnote/id/${zanibalId}?${params}`,
            method: 'GET',
            headers: this.headers
         });
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   postFundTransaction = async (txn_id: number|string) => {
      try {
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/fundtransaction/post/${txn_id}`,
            method: 'PUT',
            headers: this.headers,
         });
         return { success: true, status: response.status, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getPortfolioBalance = async (portfolioId: string|number, uParams: {startDate: Date, endDate: Date, currency: string}) => {
      try {
         let params = '';
         if (uParams.startDate || uParams.endDate) {
            if (!uParams.startDate || !uParams.endDate) throw new Exception({code: 400, message: 'Error with parameters passed.'});
            params = `?sd=${uParams.startDate}&ed=${uParams.endDate}`;
         }
         if(uParams.currency) {
            params += (params.includes("?") ? `&cu=` : `?cu=`) + uParams.currency
         }
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/partner/portfolio-valuation-for-date-range/id/${portfolioId}${params}`,
            method: 'GET',
            headers: this.headers
         });
         if (!response) throw new Exception({code: 400, message: 'Cannot fetch balance for portfolio'});
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getCustomerBalance = async (zanibalId: string|number, uParams: {startDate: Date, endDate: Date, currency: string}) => {
      try {
         let params = '';
         if (uParams.startDate || uParams.endDate) {
            if (!uParams.startDate || !uParams.endDate) throw new Exception({code: 400, message: 'Error with parameters passed.'});
            params = `?sd=${uParams.startDate}&ed=${uParams.endDate}`;
         }
         if(uParams.currency) {
            params += (params.includes("?") ? `&cu=` : `?cu=`) + uParams.currency
         }
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/partner/customer-valuation-for-date-range/id/${zanibalId}${params}`,
            method: 'GET',
            headers: this.headers
         });
         if (!response) throw new Exception({code: 400, message: 'Cannot fetch balance for portfolio'});
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getFundTransactions = async (
      { zanibalId, portfolioId, startDate, endDate, status, fundId, page, size }:
      { zanibalId: string|number, portfolioId: string|number, startDate: Date, endDate: Date, status: string, fundId: string|number, page: number, size: number }
   ) => {
      try {
         if (!zanibalId) throw new Exception({code: 400, message: 'Zanibal Id is a required parameter.'});
         let params = `c=${zanibalId}`;
         if (page || size) {
            if (!page || !size) throw new Exception({code: 400, message: 'Pagination parameters are invalid'});
            params += `&b=${page-1}&s=${size}`;
         }
         if (portfolioId) params += `&p=${portfolioId}`;
         if(fundId) params += `&f=${fundId}`
         if (status) params += `&t=${status}`; // t = Transaction status. This can either be PENDING, APPROVED, or EXECUTED.
         if (startDate || endDate) {
            if (!startDate || !endDate || !moment(startDate).isValid() || !moment(endDate).isValid())
                  throw new Exception({code: 400, message: 'Date range parameters supplied are invalid'});
            params += `&sd=${moment(startDate).format('YYYY-MM-DD')}&ed=${moment(endDate).format('YYYY-MM-DD')}`;
         }
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/fundtransaction/customer/list?${params}`,
            method: 'GET',
            headers: this.headers
         });
         if (!response) throw new Exception({code: 400, message: 'Cannot fetch customer balance'});
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   deleteFundTransaction = async (transactionId: string|number) => {
      try {
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/fundtransaction/delete/id/${transactionId}`,
            method: 'DELETE',
            headers: this.headers
         });
         if (!response || !response.data.success) throw new Exception({code: 400, message: 'Cannot delete transaction'});
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getSecurityOverview = async ({ market = 'NGX', security }: {market: string, security: string}) => {
      try {
         /**
         * market: e.g. NGX
         * security: e.g. MTNN
         */
         const response = await axios.request({
            url: `${process.env.ZANIBAL_MDS_BASE_URL}/security/overview/${market}/${security}`,
            method: 'GET',
         });
         if (response.data.success == false) throw new Exception({code: 400, message: `Security ${security} not found`});
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getSecurityDetail = async ({ market = 'NGX', security }: {market: string, security: string}) => {
      try {
         /**
         * market: e.g. NGX
         * security: e.g. MTNN
         */
         const response = await axios.request({
            url: `${process.env.ZANIBAL_MDS_BASE_URL}/security/order-book-with-chart/${market}/${security}`,
            method: 'GET',
         });
         if (response.data.success == false) throw new Exception({code: 400, message: `Security ${security} not found`});
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getCustomerPortfolio = async (customerZanibalId: string|number) => {
      try {
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/portfolio/customer/id/${customerZanibalId}`,
            method: 'GET',
            headers: this.headers
         });
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getCustomerPurchasingPower = async (id: string|number) => {
      try {
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/partner/customer-net-trade-balance/id/${id}`,
            method: 'GET',
            headers: this.headers
         });
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getPortfolioPurchasingPower = async (id: string|number) => {
      try {
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/partner/portfolio-net-trade-balance/id/${id}`,
            method: 'GET',
            headers: this.headers
         });
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getChartData = async ({ market = 'NGX', name, date, interval = 120 }: { market: string, name: string, date: Date, interval: number}) => {
      try {
         /**
         * market (marketId)= NGX, etc
         * name=security (or secId), e.g MTNN;
         * timeStamp= date- Format = 'yyyy-MM-dd'
         * interval = Refresh rate, default is 120s
         * */
         const response = await axios.request({
            url: `${process.env.ZANIBAL_MDS_BASE_URL}/security/ohlcv/${market}/${name}?fieldList=d,c,v,o,h,l,a`,
            method: 'GET',
         });
         return { success: true, status: 200, data: response.data?.result?.filter((chart: any) => chart[0] > date) }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getOrderTerms = async () => {
      try {
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/tradeorderterm/list/active`,
            method: 'GET',
            headers: this.headers
         });
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getTopGainersLoosers = async ({ market = 'NGX', secType = 'CS', secSubType = 'EQTY', type='', page = 1, size = 10 }) => {
      try {
         let params = ``;
         if (page || size) {
            if (!page || !size) throw new Exception({code: 400, message: 'Pagination parameters are invalid',});
            params += `&b=${page}&c=${size}`;
         }
         if (secSubType) {
            params += `&secSubType=${secSubType}`;
         }
         /**
         * perfType: Options are MOST_ACTIVE, TOP_PERCENT_GAINER, TOP_PERCENT_LOOSER, TOP_VALUE_GAINER, TOP_VALUE_LOOSER
         * secType: Security type. Options are CS, GO, COMM, FUT, NONE
         * secSubType: Security sub type. Options are OTC, MFUND, ETF, EQTY
         */
         const perfType = {
            pg: 'TOP_PERCENT_GAINER',
            pl: 'TOP_PERCENT_LOOSER',
            vg: 'TOP_VALUE_GAINER',
            vl: 'TOP_VALUE_LOOSER',
            ma: 'MOST_ACTIVE'
         }
         const response = await axios.request({
            url: `${process.env.ZANIBAL_MDS_BASE_URL}/security/performance?marketId=${market}&secType=${secType}&perfType=${(perfType as { [key: string]: any })[type]}${params}`,
            method: 'GET',
         });
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getPortfolioDistribution = async (id: number|string) => {
      try {
         /**
         * id: Portfolio Id
         * type: Options are C=customer, P=Portfolio. If 'P', return data for the specified portfolio. If 'C', return data for all portfolios that belong to that client ID.
         * cash: Should we include cash in the report (true/false)
         */
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/research/get-sector-allocation?id=${id}&type=C&cash=true`,
            method: 'GET',
            headers: this.headers
         });
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getCustomerPortfolios = async (customerId: number|string) => {
      // Retrieve all the portfolios for a customer
      try {
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/portfolio/customer/id/${customerId}`,
            method: 'GET',
            headers: this.headers
         });
         let data = response.data?.result?.filter((p: any) => p.active === true);
         for (const p of data) {
            // p.portfolioHoldings = p.portfolioHoldings?.filter(ph => ph.securityType?.toUpperCase() == "EQUITY")
            p.currentValuation.amount = p.portfolioHoldings?.reduce((n:number, { marketValue }: {marketValue: number}) => n + marketValue, 0)
         }
         return { success: true, status: 200, data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getPortfolioHoldings = async (portfolioId: number|string) => {
      // Retrieve the holdings for a particular portfolio
      try {
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/portfolio/holdings/id/${portfolioId}`,
            method: 'GET',
            headers: this.headers
         });
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getTradeOrders = async (id: number, filters:{ page: number, size: number, orderStatus: string, startDate: Date, endDate: Date }) => {
      try {

         const { page, size, orderStatus, startDate, endDate } = filters;
         let params = ``;
         if (page || size) {
            if (!page || !size) throw new Exception({code: 400, message: 'Pagination parameters are invalid'});
            params += `&b=${page}&c=${size}`;
         }
         if (orderStatus) {
            params += `&s=${orderStatus}`;
         }
         if (startDate || endDate) {
            if (!startDate || !endDate || !moment(startDate).isValid() || !moment(endDate).isValid())
               throw new Exception({code: 500, message: 'Date range parameters are invalid'});
            params += `&sd=${moment(startDate).format('YYYY-MM-DD')}&ed=${moment(endDate).format('YYYY-MM-DD')}`;
         }

         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/tradeorder/portfolio/list?p=${id}${params}`,
            method: 'GET',
            headers: this.headers
         });
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   cancelTradeOrders = async (id: string|number) => {
      try {
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/tradeorder/cancel/id/${id}`,
            method: 'PUT',
            headers: this.headers
         });
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   validateTradeOrder = async (data: any) => {
      try {
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/tradeorder/validate`,
            method: 'POST',
            headers: this.headers,
            data: JSON.stringify(data),
         });
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   createTradeOrder = async (data: any) => {
      try {
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/tradeorder/submit`,
            method: 'POST',
            headers: this.headers,
            data: JSON.stringify(data),
         });
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   createCashTransaction = async (data: any) => {
      try {
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/finance/cash-transaction/create`,
            method: 'POST',
            headers: this.headers,
            data: JSON.stringify(data),
         });
         return { success: true, status: response.status, data: response.data?.msgArgs[0] }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   postCashTransaction = async (transaction_id: string|number) => {
      try {
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/finance/cash-transaction/post/id/${transaction_id}`,
            method: 'PUT',
            headers: this.headers,
            data: null,
         });
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         // if (error?.response?.data?.msgCode) return error?.response.data
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   // updateCustomerPortfolio = async (zanibalId) => {
   //    let portfolioId = null;
   //    try {
   //       const response: { success: boolean, status: number, data: any, result: []} = await this.getCustomerPortfolio(zanibalId);
   //       if (response) {
   //          const { result } = response;
   //          if (result && result instanceof Array && result.length > 0) {
   //                const { id } = result[0];
   //                portfolioId = id;
   //                await postgres.models.customer.update(
   //                   { zanibalPortfolioId: portfolioId },
   //                   { where: { zanibalId } }
   //                );
   //          }
   //       }
   //    } catch (error) {
   //       const err = (error as Error);
   //       if(error instanceof CustomError) throw new Exception(error);
   //       throw new Exception({code: 500, message: err.message});
   //    }
   //    return portfolioId;
   // };
   createCashTransResolver = async (
      { zanibalId, portfolioId, cashAccountId, amount, currency="NGN", options }:
      {zanibalId: string|number, portfolioId: string|number, cashAccountId: string|number, amount: number, currency: string|number, options: any}
   ) => {
       let cashAccounts: any = (await this.getCashAccount(zanibalId));
       if (!cashAccounts || !cashAccounts.success)
           throw new Exception({code: 400, message: cashAccounts.message || 'Error getting portfolio. Please try again later'});
       const cashBalance = cashAccounts.data.find((c: any) => c.id == cashAccountId);
       if(!cashBalance || cashBalance === undefined || cashBalance === null)
           throw new Exception({code: 400, message: `No cash account on this portfolio. Please choose another portfolio or contact admin`});
       if (amount > +cashBalance.clearedBalance && options.transfer) 
           throw new Exception({code: 500, message: `${amount} > ${cashBalance.clearedBalance}. Insufficient cash balance`});
       let cashData = {
           amount,
           cashAccountId,
           currency,
           partnerId: zanibalId,
           transMethod: 'ECHANNEL',
           transType: options.transType,
           contraAcctId: options.contraAcctId,
           ...(options.valueDate && {valueDate: options.valueDate})
       };
       return await this.createCashTransaction(cashData);
   };
   postCashTransactionCheck = async (createCashTransResponse: any, post = false) => {
       if (!createCashTransResponse || !createCashTransResponse.success) throw new Exception({code: 500, message: 'error processing transaction'});
       let transaction_id = createCashTransResponse.data;
       if (post) {
           const finalizeTransaction: any = await this.postCashTransaction(transaction_id);
           if (!finalizeTransaction || !finalizeTransaction.success) {
               if (finalizeTransaction.msgArgs && finalizeTransaction.msgArgs[0] === 'POSTED') return { success: true, message: 'Posted successfully', data: transaction_id }
               throw new Exception({code: 500, message: finalizeTransaction.msgCode || 'error processing transaction'});
           }
       }
       return { success: true, message: 'Posted successfully', data: transaction_id }
   };
   createAndPostCashTxn = async (createCashTransResponse: any, post = false) => {
       if (!createCashTransResponse || !createCashTransResponse.success) throw new Exception({code: 500, message: 'error processing transaction'});
       let transaction_id = createCashTransResponse.data;
       if (post) {
           const finalizeTransaction: any = await this.postCashTransaction(transaction_id);
           if (!finalizeTransaction || !finalizeTransaction.success) {
               if (finalizeTransaction.msgArgs && finalizeTransaction.msgArgs[0] === 'POSTED') return { success: true, message: 'Posted successfully', data: transaction_id }
               throw new Exception({code: 500, message: finalizeTransaction.msgCode || 'error processing transaction'});
           }
       }
       return { success: true, message: 'Posted successfully', data: transaction_id }
   };
   calculatePrice = async (
      orderType: string, quantity: number, marketPrice: number, limitPrice: number, priceType: string,
   ) => {
       let consideration =
           quantity *
           (priceType.toLowerCase() === 'limit' ? limitPrice : marketPrice);
       let totalConsideration =
           (priceType.toLowerCase() === 'limit' || orderType.toLowerCase() == 'sell')
               ? consideration
               : consideration * 0.1 + consideration;
       /**
        * BUY and SELL Transctions share the following variable amounts
        *      X-Alert Fee: this is N4.00
        *      VAT on X-Alert fee: this is 7.5% of Alert Fee
        *      Consideration: price * quantity
        *      Stamp Duty: this  is 0.08% of consideration
        *      NGX/SEC Fees: this is 0.3% of consideration
        */
       let alertFee = 4;
       let alertFeeVAT = alertFee * 0.075;
       let stampDuty = 0.0008 * totalConsideration;
       let NGX_SEC_Fees = 0.003 * totalConsideration;
       /**
        * SELL TRANSACTION VARIABLES
        * Sell transactions use the following variables:
        *      7.5% VAT on Brokerage
        *      Alert Fees (Defined above)
        *      VAT on Alert Fees (Defined above)
        *      Stamp Duty (Defined above)
        *      NGX Fees (Defined above as NGX_SEC_Fees)
        *      CSCS Fees: this is 0.3% of consideration
        *      7.5% VAT on NGX Fee and
        *      7.5% on CSCS Fee
        */
       let cscsFee = 0.003 * totalConsideration;
       let nseFeeVAT = 0.075 * NGX_SEC_Fees;
       let cscsFeeVAT = 0.075 * cscsFee;
       /**
        *
        * Calculate Brokerage Commision and VAT on Brokerage Commision
        * Brokerage Commision: this is 1.35% of the consideraton for regular customers which is what will be used on all online platforms (mobile/web)
        * VAT on Brokerage Commision: this is 7.5% of brokerage commision
        *
        */

       let brokerageCommision = 0.0135 * totalConsideration;
       let brokerageCommisionVAT = 0.075 * brokerageCommision;

       /**
        * Perform final calculations for posting to exchange
        */
       let amount = 0;
       let fees = 0;

       if (orderType == 'BUY') {
           fees =
               alertFee +
               alertFeeVAT +
               stampDuty +
               NGX_SEC_Fees +
               brokerageCommision +
               brokerageCommisionVAT;
           amount = totalConsideration + fees;
       } else {
           fees =
               alertFee +
               alertFeeVAT +
               stampDuty +
               NGX_SEC_Fees +
               nseFeeVAT +
               cscsFee +
               cscsFeeVAT +
               brokerageCommision +
               brokerageCommisionVAT;
           amount = totalConsideration - fees;
       }
       return {
           orderType,
           fees,
           consideration,
           totalConsideration,
           amount: Math.ceil((amount + Number.EPSILON) * 100) / 100,
       };
   };
   fundCashAccount = async ({ cashAccountId, amount, user, cashBalance = 0.00 }: {cashAccountId: string|number, amount: number, user: any, cashBalance: number}) => {
      try {
         if (amount && user) {
            let nairaString = new Intl.NumberFormat('NGN', {
                  style: 'currency',
                  currency: 'NGN',
                  minimumFractionDigits: 3,
            });
            
            if (cashBalance >= amount) return { status: true, message: `Debit trading wallet ${nairaString.format(amount)}` };
            else throw new Exception({code: 500, message: 'Fund your cash account before proceeding!'});

            // const wallet = await SavePlanService.getUserWallet({ customer_id: user.id });
            // if (!wallet.success) throw new AppError(wallet.message ?? `Couldn't fetch wallet`, __line, __path.basename(__filename), { status: 404 });
            // if (wallet.data.saveplan_users[0].total_paid >= amount - cashBalance) {
            //     if (user.status !== 'active') throw Error('verify your bvn to proceed!')

            //     let cashData = {
            //         amount: amount - cashBalance,
            //         cashAccountId: cashAccountId,
            //         currency: 'NGN',
            //         partnerId: user.zanibalId,
            //         transMethod: 'ECHANNEL',
            //         transType: 'RECEIPT',
            //     };

            //     let reference = help.generateOTCode(20, true);
            //     const wallet_txn = await TransactionService.postWalletTransaction({
            //         user, amount: (amount - cashBalance),
            //         description: `${cashBalance > 0 && cashBalance < amount ?
            //             'Top-up trading cash account for stock purchase ' :
            //             'Fund trading cash account'}`
            //         , source: utils.MODULE.WALLET, reference, type: 'debit', gateway: 'wallet', currency: 'NGN', module: utils.MODULE.TRADEIN, wallet: wallet.data.saveplan_users[0]
            //     });
            //     if (!wallet_txn.success) throw new AppError(wallet_txn.message ?? `Error logging debit from wallet for transaction`, __line, __path.basename(__filename), { status: 500 });

            //     const createCashTransResponse = await this.createCashTransaction(cashData);
            //     if (!createCashTransResponse || !createCashTransResponse.success) throw new AppError(`Error creating cash transaction for trade`, __line, __path.basename(__filename), { status: 500 });
            //     let transaction_id = createCashTransResponse.data;
            //     const finalizeTransaction = await this.postCashTransaction(transaction_id);
            //     if (!finalizeTransaction) throw new AppError(`Error posting cash transaction for trade`, __line, __path.basename(__filename), { status: 500 });
            //     if (!finalizeTransaction.success) throw Error(finalizeTransaction.msgCode)

            //     await postgres.models.transaction.update({ gatewayReference: transaction_id }, { where: { reference } });
            //     return {
            //         status: true,
            //         message: `${cashBalance > 0 && cashBalance < amount ?
            //             'Debit trading wallet ' + nairaString.format(cashBalance) + ' + IN wallet ' + nairaString.format(amount - cashBalance) :
            //             'Debit IN wallet ' + nairaString.format(amount)}`,
            //         transactionDetails: wallet_txn.data,
            //     };
            // } else {
            //     throw new AppError('Insufficient wallet balance!', __line, __path.basename(__filename), { status: 500 });
            // }
         } else {
            throw new Exception({code: 500, message: 'Invalid Parameter passed!'});
         }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   };
   getMarketNews = async ({ marketId = 'NGX', security = null, page = null, size = null, startDate = null }) => {
      try {
         let params = ``;
         if (page || size) {
            if (!page || !size) throw new Exception({code: 500, message: `Pagination parameters are invalid`});
            params += `start=${page}&pageSize=${size}`;
         }
         if (startDate) {
            params += `${params ? '&' : ''}startDate=${new Date(startDate)}`;
         }
         if (security) {
            params += `${params ? '&' : ''}secId=${security}`;
         }

         const response = await axios.request({
            url: `${process.env.ZANIBAL_MDS_BASE_URL}/market/news/${marketId}?${params} `,
            method: 'GET',
         });
         if (!response) throw new Exception({code: 404, message: 'Could not fetch securities'});
         return { success: true, status: 200, data: response.data.content }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   }
   updateZanibalCSCSAndCHN = async ({zanibalId, cscs, chn}: {zanibalId: number|string, cscs: string, chn: string}) => {
      try {
         const portfolioResponse = await this.getCustomerPortfolio(zanibalId);
         let zanibalPortfolioId;
         if (portfolioResponse) {
            const { result } = portfolioResponse.data;
            const finder = result.find(({portfolioType}: {portfolioType: string}) => portfolioType === 'NGX REGULAR')
            zanibalPortfolioId = finder.name
            // if (result && result instanceof Array && result.length > 0) {
            //     const { id } = result[0];
            //     zanibalPortfolioId = id;
            // }
         }
         const response = await axios.request({
            url: `${process.env.ZANIBAL_APPSERVER_BASE_URL}/order/portfolio/account/update?accountNo=${cscs}&chnNumber=${chn}&name=${zanibalPortfolioId}`,
            method: 'PUT',
            headers: this.headers
         });
         if (!response) throw new Exception({code: 404, message: 'Cannot fetch assets'});
         return { success: true, status: 200, data: response.data }
      } catch (error) {
         const err = (error as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: err.message});
      }
   }
}
