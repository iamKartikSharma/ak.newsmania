import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { FiArrowLeft, FiCalendar, FiMic, FiLink, FiShare2, FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2 } from 'react-icons/fi';
import UploadModal from '../components/UploadModal';
import { toast } from 'react-hot-toast';

const NewsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = current.clientWidth;
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const fetchNews = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${API_URL}/api/news`);
            const foundNews = data.find(n => n._id === id);

            if (foundNews) {
                setNews(foundNews);
            } else {
                setError('News item not found');
            }
        } catch (err) {
            console.error("Error fetching news:", err);
            setError('Failed to load news details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [id]);

    const handleEditSuccess = () => {
        setShowEditModal(false);
        fetchNews(); // Reload data to show updates
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this news item? This action cannot be undone.')) {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                await axios.delete(`${API_URL}/api/news/${id}`);
                toast.success('News deleted successfully');
                navigate('/');
            } catch (err) {
                console.error("Error deleting news:", err);
                toast.error('Failed to delete news');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !news) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-xl text-gray-400">{error || 'News not found'}</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 pt-4 px-4 md:px-0">
            {/* Header Navigation and Actions */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700 hover:border-gray-500"
                    >
                        <FiEdit2 size={16} />
                        <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20 hover:border-red-500/40"
                    >
                        <FiTrash2 size={16} />
                        <span className="hidden sm:inline">Delete</span>
                    </button>
                </div>
            </div>

            <article className="glass-panel rounded-2xl overflow-hidden p-6 md:p-8">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {news.category}
                        </span>
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <FiCalendar />
                            {format(new Date(news.date), 'MMMM d, yyyy')}
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
                        {news.title}
                    </h1>
                </header>

                {/* Media Section */}
                {news.type !== 'text' && (
                    <div className="mb-8 rounded-xl overflow-hidden bg-black/50 border border-gray-700/50">
                        {news.type === 'video' ? (
                            <video src={news.mediaUrl} controls className="w-full aspect-video" />
                        ) : news.type === 'audio' ? (
                            <div className="p-8 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 text-blue-400">
                                    <FiMic size={32} />
                                </div>
                                <audio src={news.mediaUrl} controls className="w-full max-w-md" />
                            </div>
                        ) : (
                            // Images - Full Width Layout
                            <div className="relative group bg-black/20 backdrop-blur-sm">
                                {news.images && news.images.length > 1 ? (
                                    <>
                                        <div
                                            ref={scrollRef}
                                            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
                                        >
                                            {news.images.map((img, i) => (
                                                <div key={i} className="min-w-full snap-center">
                                                    <img
                                                        src={img.url}
                                                        alt={`Slide ${i + 1}`}
                                                        className="w-full h-auto max-h-[80vh] object-contain mx-auto"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        {/* Navigation Buttons */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); scroll('left'); }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                                        >
                                            <FiChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); scroll('right'); }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                                        >
                                            <FiChevronRight size={24} />
                                        </button>
                                        {/* Counter Badge */}
                                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-lg border border-white/10">
                                            {news.images.length} Photos
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full">
                                        <img
                                            src={news.mediaUrl}
                                            alt={news.title}
                                            className="w-full h-auto max-h-[80vh] object-contain mx-auto"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Main Content */}
                <div className="prose prose-invert prose-lg max-w-none mb-8">
                    <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                        {news.content}
                    </p>
                </div>

                {/* Attachments & Links */}
                <div className="grid gap-4 md:grid-cols-2">
                    {news.voiceUrl && (
                        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                                <FiMic /> Voice Note
                            </h3>
                            <audio src={news.voiceUrl} controls className="w-full h-10" />
                        </div>
                    )}

                    {news.link && (
                        <a
                            href={news.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 bg-blue-600/10 hover:bg-blue-600/20 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                    <FiLink size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-200">External Resource</p>
                                    <p className="text-xs text-blue-400 truncate max-w-[200px]">
                                        {news.link}
                                    </p>
                                </div>
                            </div>
                            <FiShare2 className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    )}
                </div>
            </article>

            {/* Edit Modal */}
            {showEditModal && (
                <UploadModal
                    initialData={news}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleEditSuccess}
                    modalId="edit_news_modal"
                />
            )}
        </div>
    );
};

export default NewsDetail;
