import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { FiClock, FiExternalLink, FiCpu, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SebiTimeline = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [explainingId, setExplainingId] = useState(null);
    const [explanations, setExplanations] = useState({});

    const fetchNews = async () => {
        setLoading(true);
        try {
            // "Automatic Update" mechanism: Fetching fresh data from our API
            const { data } = await axios.get('http://localhost:5000/api/sebi/news');
            setNews(data);
        } catch (error) {
            console.error('Error fetching SEBI news:', error);
            toast.error('Failed to load SEBI timeline');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
        // Optional: Auto-refresh every 5 minutes if kept open
        const interval = setInterval(fetchNews, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleExplain = async (articleId, text) => {
        if (explanations[articleId]) return; // Already explained

        setExplainingId(articleId);
        try {
            const { data } = await axios.post('http://localhost:5000/api/sebi/explain', { text });
            setExplanations(prev => ({ ...prev, [articleId]: data.explanation }));
        } catch (error) {
            console.error('Error explaining news:', error);
            toast.error('Failed to generate explanation');
        } finally {
            setExplainingId(null);
        }
    };

    return (
        <div className="min-h-screen py-10 px-4 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                    SEBI Reform Timeline
                </h1>
                <p className="text-gray-400 text-lg flex items-center justify-center gap-2">
                    Tracking Indian Market Regulations & Updates
                    <button
                        onClick={fetchNews}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        title="Check for updates"
                    >
                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    </button>
                </p>
            </motion.div>

            {loading && news.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="relative border-l-2 border-blue-500/30 ml-4 md:ml-10 space-y-12">
                    {news.map((item, index) => {
                        // Use URL as unique key if no ID
                        const uniqueId = item.url;
                        const date = new Date(item.publishedAt);

                        return (
                            <motion.div
                                key={uniqueId}
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="relative pl-8 md:pl-12"
                            >
                                {/* Timeline Dot */}
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>

                                {/* Date Badge */}
                                <div className="mb-2 flex items-center gap-2 text-sm text-blue-400 font-mono">
                                    <FiClock />
                                    <span>{format(date, 'MMM dd, yyyy')}</span>
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-gray-300">
                                        {format(date, 'HH:mm')}
                                    </span>
                                </div>

                                {/* Content Card */}
                                <div className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-colors border border-white/10">
                                    <h3 className="text-xl font-bold mb-2 text-white">
                                        {item.title}
                                    </h3>

                                    <p className="text-gray-400 mb-4 line-clamp-3">
                                        {item.description || item.content}
                                    </p>

                                    {/* AI Explanation Section */}
                                    <AnimatePresence>
                                        {explanations[uniqueId] && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <FiCpu className="mt-1 text-blue-400 shrink-0" />
                                                    <div>
                                                        <h4 className="text-sm font-bold text-blue-300 mb-1">AI Simplified Summary:</h4>
                                                        <p className="text-gray-300 text-sm leading-relaxed">
                                                            {explanations[uniqueId]}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="flex flex-wrap items-center gap-4 mt-4">
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            Read Source <FiExternalLink />
                                        </a>

                                        {!explanations[uniqueId] && (
                                            <button
                                                onClick={() => handleExplain(uniqueId, item.title + " " + (item.description || ""))}
                                                disabled={explainingId === uniqueId}
                                                className="flex items-center gap-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-4 py-1.5 rounded-full transition-all disabled:opacity-50"
                                            >
                                                {explainingId === uniqueId ? (
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                ) : (
                                                    <FiCpu />
                                                )}
                                                Explain in simple language
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SebiTimeline;
