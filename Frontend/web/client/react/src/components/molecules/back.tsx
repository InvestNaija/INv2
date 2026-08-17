import { useNavigate } from "react-router-dom";


interface BackProps {
    name?: string;
}

const Back = (props?: BackProps) => {

    const navigate = useNavigate();
    return (
        <>
             <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-full shadow-sm hover:shadow transition-all duration-300 text-gray-700 hover:text-gray-900 font-medium text-sm group cursor-pointer"
            >
              <i className="ri-arrow-left-line text-lg group-hover:-translate-x-1 transition-transform duration-300"></i>
              {props?.name || "Back"}
            </button>
        </>
    )
}

export default Back;