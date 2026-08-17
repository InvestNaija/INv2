import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ThemeModeProvider from "./contexts/themeContext";
import Auth from "./contexts/authContext";
import { TradeProvider } from "./contexts/tradeContext";
import { InvestmentProvider } from "./contexts/investmentsContext";
import { SaveProvider } from "./contexts/saveContext";
import WalletFeatures from "./contexts/walletContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import AuthPage from "./features/auth";
import Login from "./features/auth/login";
import SignUp from "./features/auth/sign-up";
import CreatePassword from "./features/auth/create-password";
import ForgotPassword from "./features/auth/forgot-password";
import HelpPage from "./features/pages";
import Faq from "./features/pages/faq";
import SetPassword from "./features/auth/set-password";
import Help from "./features/pages/help";
import VerifyAccountOtp from "./features/auth/verify-account-otp";
import VerifyBvn from "./features/auth/verify-bvn";
import Welcome from "./features/auth/welcome";
import Legal from "./features/auth/legal";
import Home from "./features/ui/home";
import Learn from "./features/ui/learn";
import Save from "./features/ui/save";
import Invest from "./features/ui/invest";
import Transactions from "./features/ui/transactions";
import Overview from "./features/ui/home/overview";
import Portfolio from "./features/ui/home/portfolio";
import Wallet from "./features/ui/home/wallet";
import All from "./features/ui/transactions/all";
import Incoming from "./features/ui/transactions/incoming";
import Outgoing from "./features/ui/transactions/outgoing";
import Settings from "./features/ui/settings";
import Profile from "./features/ui/settings/profile";
import BankAccounts from "./features/ui/settings/bank-accounts";
import Accounts from "./features/ui/settings/accounts";
import Statements from "./features/ui/settings/statements";
import Notifications from "./features/ui/settings/notifications";
import Security from "./features/ui/settings/security";
import InvestmentDashboard from "./features/ui/invest/investments/dashboard";
import Investments from "./features/ui/invest/investments";
import TradeDashboard from "./features/ui/invest/trade/dashboard";
import Trade from "./features/ui/invest/trade";
import AllAssets from "./features/ui/invest/investments/see-all-assets";
import AssetsDetails from "./features/ui/invest/investments/details";
import SecuritiesDetails from "./features/ui/invest/trade/details";
import UserStocksBreakdown from "./features/ui/invest/trade/user-stocks-breakdown";
import UserAssetsBreakdown from "./features/ui/invest/investments/users-assets-breakdown";
import SavePlanDashboard from "./features/ui/save/dashboard";
import SavePlanDrilldown from "./features/ui/save/plan-drilldown";
import UserSaveBreakdown from "./features/ui/save/user-save-breakdown";
import LearnDashboard from "./features/ui/learn/dashboard";
import SeeMore from "./features/ui/learn/see-more";
import ArticleDetails from "./features/ui/learn/details/article-details";
import NotificationCenter from "./features/ui/notifications";

function App() {
  return (
    <ThemeModeProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Auth>
        <SaveProvider>
          <InvestmentProvider>
            <TradeProvider>
              <WalletFeatures>
                <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Navigate to="/auth" replace />} />
                  <Route path="/auth" element={<AuthPage />}>
                    <Route
                      path="/auth"
                      element={<Navigate to="/auth/login" replace />}
                    />
                    <Route path="login" element={<Login />} />
                    <Route path="sign-up" element={<SignUp />} />
                    <Route path="create-password" element={<CreatePassword />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="set-password" element={<SetPassword />} />
                    <Route path="verify-account" element={<VerifyAccountOtp />} />
                    <Route path="verify-bvn" element={<VerifyBvn />} />
                    <Route path="welcome" element={<Welcome />} />
                    <Route path="legal" element={<Legal />} />
                    <Route path="legal/:tab" element={<Legal />} />
                  </Route>

                  <Route path="/page" element={<HelpPage />}>
                    <Route
                      path="/page"
                      element={<Navigate to="/page/help" replace />}
                    />

                    <Route path="help" element={<Help />} />
                    <Route path="faq" element={<Faq />} />
                  </Route>

                  <Route path="/app" element={<ProtectedRoute />}>
                    <Route
                      path="/app"
                      element={<Navigate to="/app/home" replace />}
                    />
                    <Route path="home" element={<Home />}>
                      <Route
                        path="/app/home"
                        element={<Navigate to="/app/home/overview" replace />}
                      />
                      <Route path="overview" element={<Overview />} />
                      <Route path="portfolio" element={<Portfolio />} />
                      <Route path="wallet" element={<Wallet />} />
                    </Route>
                    <Route path="save" element={<Save />}>
                      <Route
                        path="/app/save"
                        element={<Navigate to="/app/save/dashboard" replace />}
                      />
                      <Route path="dashboard" element={<SavePlanDashboard />} />
                      <Route path="drill-down/:id" element={<SavePlanDrilldown />} />
                      <Route path="drill-down" element={<SavePlanDrilldown />} />
                      <Route
                        path="breakdown"
                        element={<UserSaveBreakdown />}
                      />
                    </Route>
                    <Route path="invest" element={<Invest />}>
                      <Route
                        path="/app/invest"
                        element={<Navigate to="/app/invest/investments" replace />}
                      />
                      {/* Redirect /investments bare path to the investments dashboard */}
                      <Route
                        path="investments"
                        element={
                          <Navigate to="/app/invest/investments/dashboard" replace />
                        }
                      />
                      <Route path="investments" element={<Investments />}>
                        <Route
                          path="dashboard"
                          element={<InvestmentDashboard />}
                        />
                        <Route path="see-all-assets" element={<AllAssets />} />
                        <Route path="details/:id" element={<AssetsDetails />} />
                        <Route path="details" element={<AssetsDetails />} />
                        <Route
                          path="breakdown"
                          element={<UserAssetsBreakdown />}
                        />
                      </Route>
                      {/* Redirect /trade bare path to the trade dashboard */}
                      <Route
                        path="trade"
                        element={<Navigate to="/app/invest/trade/dashboard" replace />}
                      />
                      <Route path="trade" element={<Trade />}>
                        <Route path="dashboard" element={<TradeDashboard />} />
                        <Route path="details/:id" element={<SecuritiesDetails />} />
                        <Route path="details" element={<SecuritiesDetails />} />
                        <Route
                          path="breakdown"
                          element={<UserStocksBreakdown />}
                        />
                      </Route>
                    </Route>
                    <Route path="transactions" element={<Transactions />}>
                      <Route
                        path="/app/transactions"
                        element={<Navigate to="/app/transactions/all" replace />}
                      />
                      <Route path="all" element={<All />} />
                      <Route path="incoming" element={<Incoming />} />
                      <Route path="outgoing" element={<Outgoing />} />
                    </Route>
                    <Route path="learn" element={<Learn />}>
                      <Route
                        path="/app/learn"
                        element={<Navigate to="/app/learn/dashboard" replace />}
                      />
                      <Route path="dashboard" element={<LearnDashboard />} />
                      <Route path="see-more" element={<SeeMore />} />
                      <Route path="details/:id" element={<ArticleDetails />} />
                      <Route path="details" element={<ArticleDetails />} />
                    </Route>
                    <Route path="settings" element={<Settings />}>
                      <Route
                        path="/app/settings"
                        element={<Navigate to="/app/settings/profile" replace />}
                      />
                      <Route path="profile" element={<Profile />} />
                      <Route path="bank-accounts" element={<BankAccounts />} />
                      <Route path="dependents" element={<Accounts />} />
                      <Route path="statements" element={<Statements />} />
                      <Route path="notifications" element={<Notifications />} />
                      <Route path="security" element={<Security />} />
                    </Route>
                    <Route path="help" element={<Help />} />
                    <Route path="faq" element={<Faq />} />
                    <Route path="notifications" element={<NotificationCenter />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </WalletFeatures>
          </TradeProvider>
        </InvestmentProvider>
        </SaveProvider>
      </Auth>
    </ThemeModeProvider>
  );
}

export default App;
