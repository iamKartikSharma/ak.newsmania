import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrendingUp, FiExternalLink } from 'react-icons/fi';

const TrendingNews = () => {
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${API_URL}/api/news/trending`);
                if (Array.isArray(res.data)) {
                    setTrending(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch trending news", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []);

    if (loading || trending.length === 0) return null;

    return (
        <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                    <FiTrendingUp size={24} />
                </div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
                    Latest Banking & Finance News
                </h2>
            </div>

            <div className="relative">
                {/* Horizontal Scroll Container */}
                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
                    {trending.map((item, index) => (
                        <a
                            key={index}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-[300px] max-w-[300px] snap-center bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-red-500/30 rounded-xl overflow-hidden group transition-all hover:shadow-lg hover:shadow-red-900/10"
                        >
                            <div className="h-40 overflow-hidden relative">
                                {item.urlToImage ? (
                                    <img
                                        src={item.urlToImage}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600">
                                        <FiTrendingUp size={32} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FiExternalLink className="text-white" />
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-medium text-red-400">
                                        {item.source.name}
                                    </span>
                                    <span className="text-gray-600 text-xs">•</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <h3 className="text-white font-medium leading-snug line-clamp-2 group-hover:text-red-400 transition-colors">
                                    {item.title}
                                </h3>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Gradient Fade for Scroll Hint */}
                <div className="absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-l from-black to-transparent pointer-events-none" />
            </div>
        </div>
    );
};

export default TrendingNews;
