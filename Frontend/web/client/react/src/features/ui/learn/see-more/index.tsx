import Back from "../../../../components/molecules/back";
import type { LearnListCardProps } from "../dashboard/interface";
import learntwoLogo from "../../../../assets/imgs/learn-2.svg";
import LearnList from "../../../../components/molecules/learn-list";

const SeeMore = () => {
  const NewTrendingData: LearnListCardProps[] = [
    {
      name: "For Your Information - Fireside chat with Bolaji Balogun",
      image: learntwoLogo,
      description:
        "One of the ideas of investments to have enough passive income to help with your daily expenses, sometimes this can be a hassle as most people find it difficult...",
      learnType: "Podcast",
      dateCreated: "Nov 28 2025",
      time: "8 mins",
    },
    {
      name: " Building on your existing experience as an entrepreneur",
      image:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
      description:
        "One of the ideas of investments to have enough passive income to help with your daily expenses, sometimes this can be a hassle as most people find it difficult...",
      learnType: "Article",
      dateCreated: "Dec 02 2025",
      time: "6 mins",
    },

      {
      name: "For Your Information - Fireside chat with Bolaji Balogun",
      image: learntwoLogo,
      description:
        "One of the ideas of investments to have enough passive income to help with your daily expenses, sometimes this can be a hassle as most people find it difficult...",
      learnType: "Podcast",
      dateCreated: "Nov 28 2025",
      time: "8 mins",
    },
    {
      name: " Building on your existing experience as an entrepreneur",
      image:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
      description:
        "One of the ideas of investments to have enough passive income to help with your daily expenses, sometimes this can be a hassle as most people find it difficult...",
      learnType: "Article",
      dateCreated: "Dec 02 2025",
      time: "6 mins",
    },
  ];

  return (
    <>
      <main className="container mx-auto max-w-4xl px-4">
        <div className="flex flex-start py-[16px]">
          <Back name="Back" />
        </div>

        <nav className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1 mt-[40px]">
          <button className="px-5 py-2.5 bg-black text-white rounded-full text-xs font-medium whitespace-nowrap tracking-wide">
            All
          </button>
          <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 rounded-full text-xs font-medium whitespace-nowrap tracking-wide transition">
            Articles
          </button>
          <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 rounded-full text-xs font-medium whitespace-nowrap tracking-wide transition">
            Courses
          </button>
          <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 rounded-full text-xs font-medium whitespace-nowrap tracking-wide transition">
            Podcasts
          </button>
          <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 rounded-full text-xs font-medium whitespace-nowrap tracking-wide transition">
            Videos
          </button>
        </nav>

        <div className="space-y-8 md:space-y-10">
          {NewTrendingData.map((learnData, index) => (
            <LearnList key={index} {...learnData} />
          ))}
        </div>
      </main>
    </>
  );
};

export default SeeMore;
