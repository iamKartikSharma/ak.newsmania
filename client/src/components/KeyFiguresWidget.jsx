import { FiUser, FiBriefcase, FiTrendingUp } from 'react-icons/fi';

const KeyFiguresWidget = () => {
    const figures = [
        {
            org: "Reserve Bank of India (RBI)",
            name: "Sanjay Malhotra",
            role: "Governor",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/The_Union_Minister_for_Finance_and_Corporate_Affairs%2C_Smt._Nirmala_Sitharaman_chairing_the_50th_GST_Council_meeting%2C_in_New_Delhi_on_July_11%2C_2023_%28cropped%29.jpg/220px-The_Union_Minister_for_Finance_and_Corporate_Affairs%2C_Smt._Nirmala_Sitharaman_chairing_the_50th_GST_Council_meeting%2C_in_New_Delhi_on_July_11%2C_2023_%28cropped%29.jpg" // Placeholder or generic icon if real image fails/is hotlinked. Better to use icons or local assets if possible, but I'll use a generic avatar fallback.
        },
        {
            org: "State Bank of India (SBI)",
            name: "Challa Sreenivasulu Setty",
            role: "Chairman",
            image: null
        },
        {
            org: "HDFC Bank",
            name: "Sashidhar Jagdishan",
            role: "MD & CEO",
            image: null
        },
        {
            org: "ICICI Bank",
            name: "Sandeep Bakhshi",
            role: "MD & CEO",
            image: null
        },
        {
            org: "Axis Bank",
            name: "Amitabh Chaudhry",
            role: "MD & CEO",
            image: null
        },
        {
            org: "Punjab National Bank",
            name: "Ashok Chandra",
            role: "MD & CEO",
            image: null
        }
    ];

    return (
        <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-800 p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <FiBriefcase size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">Key Leadership</h3>
            </div>

            <div className="space-y-6">
                {figures.map((fig, idx) => (
                    <div key={idx} className="flex items-start gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 shrink-0 group-hover:border-blue-500 transition-colors">
                            <span className="text-gray-400 font-bold text-xs">{fig.org.substring(0, 2)}</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                                {fig.name}
                            </h4>
                            <p className="text-xs text-gray-400">{fig.role}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{fig.org}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-green-500/10 rounded-lg text-green-400">
                        <FiTrendingUp size={16} />
                    </div>
                    <h4 className="text-sm font-bold text-gray-300">Market Watch</h4>
                </div>
                <div className="space-y-3">
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Tracking major deals, M&A, and policy shifts in the Indian banking sector. Check the "Latest News" feed for real-time updates on active deals.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default KeyFiguresWidget;
