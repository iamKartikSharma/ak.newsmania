import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IndianNews = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');

    // Sources mapping for filter
    const sources = ['All', 'Times of India', 'Dainik Jagran', 'Amar Ujala', 'The Indian Express', 'Hindustan Times'];

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            console.log(`[IndianNews] Fetching from: ${API_URL}/api/news/indian`);
            const response = await axios.get(`${API_URL}/api/news/indian`);
            setNews(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching Indian news:', err);
            setError(`Failed to load news: ${err.message}. Check console for details.`);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (isoDate) => {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(isoDate).toLocaleDateString(undefined, options);
    };

    const filteredNews = filter === 'All'
        ? news
        : news.filter(item => item.source === filter);

    return (
        <div className="w-full bg-slate-50 dark:bg-slate-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-extrabold text-blue-900 dark:text-blue-100 font-serif">
                            Indian Newsstand
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Daily updates from top Indian newspapers
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mt-4 md:mt-0 justify-center">
                        {sources.map(source => (
                            <button
                                key={source}
                                onClick={() => setFilter(source)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border ${filter === source
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                    }`}
                            >
                                {source}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse h-64">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                        <button
                            onClick={fetchNews}
                            className="mt-4 px-6 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredNews.slice(0, 12).map((item, index) => (
                            <a
                                key={index}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-full overflow-hidden"
                            >
                                {/* Decorative Gradient Line */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                                <div>
                                    {/* Header: Source and Date */}
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${getItemColor(item.source)
                                            }`}>
                                            {item.source}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            {formatDate(item.isoDate)}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 line-clamp-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {item.title}
                                    </h3>

                                    {/* Snippet */}
                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                                        {item.content}
                                    </p>
                                </div>

                                {/* Footer link style */}
                                <div className="flex items-center text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mt-auto group-hover:underline decoration-2 underline-offset-4">
                                    Read Full Story
                                    <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                </div>
                            </a>
                        ))}
                    </div>
                )}

                {(!loading && !error && filteredNews.length === 0) && (
                    <div className="text-center py-20 text-slate-500">
                        No news found for this category today.
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper for source colors
const getItemColor = (source) => {
    switch (source) {
        case 'Times of India': return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
        case 'Dainik Jagran': return 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
        case 'Amar Ujala': return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
        case 'The Indian Express': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
        case 'Hindustan Times': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
        default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
};

export default IndianNews;
