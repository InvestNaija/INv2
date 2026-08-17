import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "../../../contexts/authContext";

const accordionStyle = {
  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
  border: '1px solid #F3F4F6',
  borderRadius: '16px !important',
  '&:before': { display: 'none' },
  mb: 2,
  overflow: 'hidden',
  backgroundColor: '#ffffff',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 10px 30px rgba(0, 134, 141, 0.08)',
    borderColor: 'rgba(0, 134, 141, 0.15)',
  },
  '&.Mui-expanded': {
    margin: '0 0 16px 0',
    boxShadow: '0 10px 30px rgba(0, 134, 141, 0.12)',
    borderColor: 'rgba(0, 134, 141, 0.25)',
  }
};

const htmlStyles = "text-[15px] leading-relaxed text-gray-600 [&>p]:mb-4 last:[&>p]:mb-0 [&>ul]:list-outside [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:mb-4 [&>ul>li]:pl-1 [&>ul>li]:mb-2 last:[&>ul>li]:mb-0 marker:text-cyan-500 [&>ol]:list-outside [&>ol]:list-decimal [&>ol]:ml-5 [&>ol>li]:pl-1 [&>ol>li]:mb-2 [&>strong]:font-semibold [&>strong]:text-gray-900";

const Faq = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [investNaijaFaqs, setInvestNaijaFaqs] = useState<any[]>([]);
  const [saveInFaqs, setSaveInFaqs] = useState<any[]>([]);
  const [planInFaqs, setPlanInFaqs] = useState<any[]>([]);
  const [investInFaqs, setInvestInFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const [inResponse, saveInResponse, planInResponse, investInResponse] = await Promise.all([
          fetch("https://lms-chd.zanibal.com/api/v1/faqs?searchKey=investnaija&size=100"),
          fetch("https://lms-chd.zanibal.com/api/v1/faqs?searchKey=savein&size=100"),
          fetch("https://lms-chd.zanibal.com/api/v1/faqs?searchKey=planin&size=100"),
          fetch("https://lms-chd.zanibal.com/api/v1/faqs?searchKey=investin&size=100")
        ]);
        
        const inData = await inResponse.json();
        const saveInData = await saveInResponse.json();
        const planInData = await planInResponse.json();
        const investInData = await investInResponse.json();

        if (inData.success && inData.response?.allData) {
          setInvestNaijaFaqs(inData.response.allData);
        }
        if (saveInData.success && saveInData.response?.allData) {
          setSaveInFaqs(saveInData.response.allData);
        }
        if (planInData.success && planInData.response?.allData) {
          setPlanInFaqs(planInData.response.allData);
        }
        if (investInData.success && investInData.response?.allData) {
          setInvestInFaqs(investInData.response.allData);
        }
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  // Use the user's first name if available, otherwise fallback
  const firstName = currentUser?.firstName || "there";

  return (
    <>
      {/* Page Container */}
      <div className="w-full h-full text-(--text-content-default) flex flex-col items-center">

        {/* Header - Custom Glassmorphism Back Button */}
        <div className="w-full max-w-[1000px] px-4 py-4 relative z-10 flex justify-start">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-full shadow-sm hover:shadow transition-all duration-300 text-gray-700 hover:text-gray-900 font-medium text-sm group cursor-pointer"
          >
            <i className="ri-arrow-left-line text-lg group-hover:-translate-x-1 transition-transform duration-300"></i>
            Back
          </button>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-[700px] flex flex-col items-center px-4 pt-6 pb-16 relative z-10">
          
          <div className="text-center mb-16 relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-cyan-200/30 rounded-full blur-[60px] -z-10"></div>
            <span className="text-sm font-bold tracking-[0.2em] text-cyan-600 uppercase mb-4 block bg-cyan-50 w-fit mx-auto px-4 py-1.5 rounded-full">
              Hello {firstName}
            </span>
            <h2 className="text-4xl md:text-[46px] font-extrabold tracking-tight text-gray-900 leading-tight">
              How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">help today?</span>
            </h2>
          </div>

          <div className="w-full">
            
            <div className="mb-10 w-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-[#E5F0FF] text-[#0062FF] flex items-center justify-center">
                  <i className="ri-discuss-line text-[24px]"></i>
                </div>
                <h3 className="text-[22px] text-[#0062FF] font-bold">
                  InvestNaija
                </h3>
              </div>
              
              <div className="w-full">
                {loading ? (
                  <div className="flex justify-center py-6">
                    <CircularProgress size={40} sx={{ color: "#00868D" }} />
                  </div>
                ) : investNaijaFaqs.length > 0 ? (
                  investNaijaFaqs.map((faq, index) => (
                    <Accordion sx={accordionStyle} key={`in-${faq.id || index}`}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon className="text-gray-400 group-hover:text-cyan-600 transition-colors duration-300" />}
                        aria-controls={`panel-in-${index}-content`}
                        id={`panel-in-${index}-header`}
                        sx={{ px: 3, py: 1.5 }}
                        className="group"
                      >
                        <Typography component="span" className="font-semibold text-gray-800 text-[16px] group-hover:text-cyan-700 transition-colors duration-300">
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                        <div 
                          className={htmlStyles}
                          dangerouslySetInnerHTML={{ __html: faq.answer }} 
                        />
                      </AccordionDetails>
                    </Accordion>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No InvestNaija FAQs available.
                  </div>
                )}
              </div>
            </div>

            <div className="mb-10 w-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-[#E0F5FF] text-[#009EEB] flex items-center justify-center">
                  <i className="ri-safe-2-line text-[24px]"></i>
                </div>
                <h3 className="text-[22px] text-[#009EEB] font-bold">
                  SaveIn
                </h3>
              </div>
              
              <div className="w-full">
                {loading ? (
                  <div className="flex justify-center py-6">
                    <CircularProgress size={40} sx={{ color: "#00868D" }} />
                  </div>
                ) : saveInFaqs.length > 0 ? (
                  saveInFaqs.map((faq, index) => (
                    <Accordion sx={accordionStyle} key={`savein-${faq.id || index}`}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon className="text-gray-400 group-hover:text-cyan-600 transition-colors duration-300" />}
                        aria-controls={`panel-savein-${index}-content`}
                        id={`panel-savein-${index}-header`}
                        sx={{ px: 3, py: 1.5 }}
                        className="group"
                      >
                        <Typography component="span" className="font-semibold text-gray-800 text-[16px] group-hover:text-cyan-700 transition-colors duration-300">
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                        <div 
                          className={htmlStyles}
                          dangerouslySetInnerHTML={{ __html: faq.answer }} 
                        />
                      </AccordionDetails>
                    </Accordion>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No SaveIn FAQs available.
                  </div>
                )}
              </div>
            </div>

            <div className="mb-10 w-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-[#F1E0FF] text-[#9D00FF] flex items-center justify-center">
                  <i className="ri-calendar-todo-line text-[24px]"></i>
                </div>
                <h3 className="text-[22px] text-[#9D00FF] font-bold">
                  PlanIn
                </h3>
              </div>
              
              <div className="w-full">
                {loading ? (
                  <div className="flex justify-center py-6">
                    <CircularProgress size={40} sx={{ color: "#00868D" }} />
                  </div>
                ) : planInFaqs.length > 0 ? (
                  planInFaqs.map((faq, index) => (
                    <Accordion sx={accordionStyle} key={`planin-${faq.id || index}`}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon className="text-gray-400 group-hover:text-cyan-600 transition-colors duration-300" />}
                        aria-controls={`panel-planin-${index}-content`}
                        id={`panel-planin-${index}-header`}
                        sx={{ px: 3, py: 1.5 }}
                        className="group"
                      >
                        <Typography component="span" className="font-semibold text-gray-800 text-[16px] group-hover:text-cyan-700 transition-colors duration-300">
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                        <div 
                          className={htmlStyles}
                          dangerouslySetInnerHTML={{ __html: faq.answer }} 
                        />
                      </AccordionDetails>
                    </Accordion>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No PlanIn FAQs available.
                  </div>
                )}
              </div>
            </div>

            <div className="mb-10 w-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-[#E0FFEA] text-[#00BA4F] flex items-center justify-center">
                  <i className="ri-line-chart-line text-[24px]"></i>
                </div>
                <h3 className="text-[22px] text-[#00BA4F] font-bold">
                  InvestIn
                </h3>
              </div>
              
              <div className="w-full">
                {loading ? (
                  <div className="flex justify-center py-6">
                    <CircularProgress size={40} sx={{ color: "#00868D" }} />
                  </div>
                ) : investInFaqs.length > 0 ? (
                  investInFaqs.map((faq, index) => (
                    <Accordion sx={accordionStyle} key={`investin-${faq.id || index}`}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon className="text-gray-400 group-hover:text-cyan-600 transition-colors duration-300" />}
                        aria-controls={`panel-investin-${index}-content`}
                        id={`panel-investin-${index}-header`}
                        sx={{ px: 3, py: 1.5 }}
                        className="group"
                      >
                        <Typography component="span" className="font-semibold text-gray-800 text-[16px] group-hover:text-cyan-700 transition-colors duration-300">
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                        <div 
                          className={htmlStyles}
                          dangerouslySetInnerHTML={{ __html: faq.answer }} 
                        />
                      </AccordionDetails>
                    </Accordion>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No InvestIn FAQs available.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Faq;
