import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import NewsCard from '../components/NewsCard';
import UploadModal from '../components/UploadModal';
import TrendingNews from '../components/TrendingNews';
import IndianNews from '../components/IndianNews';
import KeyFiguresWidget from '../components/KeyFiguresWidget';
import { FiSearch, FiTrendingUp } from 'react-icons/fi';

const Home = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');

    const fetchNews = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/news?search=${searchTerm}&category=${category}`);
            setNews(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [searchTerm, category]);

    const categories = ['All', 'Sports', 'Banking', 'World Affairs', 'Politics', 'Technology'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16 space-y-6"
            >
                <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                        NewsMania
                    </span>
                    <span className="block text-2xl md:text-4xl text-gray-300 mt-4 font-normal">
                        Curate. Track. Analyze.
                    </span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Your intelligent platform for organizing world events and tracking their timeline.
                </p>

                {/* Search Bar - Hero Style */}
                <div className="max-w-2xl mx-auto relative group">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-full p-2 shadow-2xl ring-1 ring-white/10 group-focus-within:ring-blue-500/50 transition-all">
                        <FiSearch className="text-gray-400 ml-4 text-xl" />
                        <input
                            type="text"
                            placeholder="Search topics, events, or keywords..."
                            className="bg-transparent border-none w-full px-4 py-3 text-lg text-white placeholder-gray-500 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Trending News Section */}
            <TrendingNews />

            {/* Indian News Section */}
            <div className="mb-16">
                <IndianNews />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3 text-start">
                    {/* Category Filter */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap justify-start gap-2 mb-8"
                    >
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat === 'All' ? '' : cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${(category === cat || (cat === 'All' && !category))
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700 hover:border-gray-600'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </motion.div>

                    {/* News Grid - Modern Masonry */}
                    {loading ? (
                        <div className="flex justify-center py-32">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FiTrendingUp className="text-blue-500 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="columns-1 md:columns-2 gap-6 space-y-6">
                            {news.map((item, index) => (
                                <div key={item._id} className="break-inside-avoid">
                                    <NewsCard news={item} index={index} />
                                </div>
                            ))}
                        </div>
                    )}

                    {news.length === 0 && !loading && (
                        <div className="text-center py-20 opacity-50">
                            <p className="text-2xl text-gray-500">No news found.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    <KeyFiguresWidget />
                </div>
            </div>

            {news.length === 0 && !loading && (
                <div className="text-center py-20 opacity-50">
                    <p className="text-2xl text-gray-500">No news found.</p>
                </div>
            )}

            <UploadModal onSuccess={fetchNews} />
        </div>
    );
};

export default Home;
