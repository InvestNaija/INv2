import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Call from "../call-us";
import AppLogo from "../../../assets/icons/investnaija-full-logo.svg";

const Help = () => {
    const navigate = useNavigate();

    const [openCallDialog, setCallDialog] = useState(false);

 const handleDialogOpen = () => {
    setCallDialog(true);
 }

  return (
    <>
      <Call openCallDialog={openCallDialog} setCallDialog={setCallDialog} />
      
      {/* Page Container */}
      <div className="w-full h-full text-(--text-content-default) flex flex-col items-center">

        {/* Main Content */}
        <div className="w-full max-w-[640px] flex flex-col items-center px-4 pt-10 pb-16 relative z-10">
          <div className="w-full flex justify-start mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-full shadow-sm hover:shadow transition-all duration-300 text-gray-700 hover:text-gray-900 font-medium text-sm group cursor-pointer"
            >
              <i className="ri-arrow-left-line text-lg group-hover:-translate-x-1 transition-transform duration-300"></i>
              Back
            </button>
          </div>
          
          {/* Heading & Subtitle */}
          <h1 className="text-4xl md:text-[40px] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 text-center mb-4">
            Get help
          </h1>
          <p className="text-[16px] text-gray-500 text-center max-w-[420px] mb-12 leading-relaxed">
            Find the answers to the most common questions or contact us directly.
          </p>

          {/* Options List - Using separated cards for a modern feel */}
          <div className="w-full flex flex-col gap-4">
            
            {/* FAQ Option */}
            <Link to="../faq" className="block w-full">
              <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md hover:border-cyan-100 hover:bg-white transition-all duration-300 cursor-pointer group">
                <div className="flex items-center">
                  <div className="h-14 w-14 rounded-[14px] bg-cyan-50/50 flex items-center justify-center group-hover:bg-cyan-500 group-hover:shadow-md group-hover:shadow-cyan-500/20 transition-all duration-300 shrink-0">
                    <i className="ri-list-check text-cyan-600 text-[28px] group-hover:text-white transition-colors duration-300"></i>
                  </div>
                  <div className="ml-5">
                    <h2 className="text-[17px] text-gray-900 font-bold mb-1 group-hover:text-cyan-700 transition-colors duration-300">
                      FAQ
                    </h2>
                    <p className="text-[14px] text-gray-500 leading-snug">
                      Get answers to most of your questions.
                    </p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-cyan-50 transition-colors duration-300 shrink-0 ml-4">
                  <i className="ri-arrow-right-s-line text-[24px] text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all duration-300"></i>
                </div>
              </div>
            </Link>

            {/* Chat Option */}
            <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md hover:border-orange-100 hover:bg-white transition-all duration-300 cursor-pointer group">
              <div className="flex items-center">
                <div className="h-14 w-14 rounded-[14px] bg-orange-50/50 flex items-center justify-center group-hover:bg-orange-500 group-hover:shadow-md group-hover:shadow-orange-500/20 transition-all duration-300 shrink-0">
                  <i className="ri-chat-smile-3-fill text-orange-500 text-[28px] group-hover:text-white transition-colors duration-300"></i>
                </div>
                <div className="ml-5">
                  <h2 className="text-[17px] text-gray-900 font-bold mb-1 group-hover:text-orange-600 transition-colors duration-300">
                    Chat
                  </h2>
                  <p className="text-[14px] text-gray-500 leading-snug">
                    Available 10:00 am - 02:00 pm (Excluding weekends & holidays)
                  </p>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-orange-50 transition-colors duration-300 shrink-0 ml-4">
                <i className="ri-arrow-right-s-line text-[24px] text-gray-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all duration-300"></i>
              </div>
            </div>

            {/* Contact Us Option */}
            <div 
              className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md hover:border-blue-100 hover:bg-white transition-all duration-300 cursor-pointer group"
              onClick={handleDialogOpen}
            >
              <div className="flex items-center">
                <div className="h-14 w-14 rounded-[14px] bg-blue-50/50 flex items-center justify-center group-hover:bg-blue-600 group-hover:shadow-md group-hover:shadow-blue-600/20 transition-all duration-300 shrink-0">
                  <i className="ri-contacts-book-2-fill text-blue-600 text-[28px] group-hover:text-white transition-colors duration-300"></i>
                </div>
                <div className="ml-5">
                  <h2 className="text-[17px] text-gray-900 font-bold mb-1 group-hover:text-blue-700 transition-colors duration-300">
                    Contact Us
                  </h2>
                  <p className="text-[14px] text-gray-500 leading-snug">
                    Get in touch via phone, email, or visit our office
                  </p>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300 shrink-0 ml-4">
                <i className="ri-arrow-right-s-line text-[24px] text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all duration-300"></i>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Help;
