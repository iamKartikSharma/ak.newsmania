import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FiMic, FiImage, FiType, FiVideo, FiTrash2, FiCalendar, FiLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const NewsCard = ({ news, index }) => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const scrollRef = useRef(null);

    const handleScroll = () => {
        if (scrollRef.current) {
            const scrollLeft = scrollRef.current.scrollLeft;
            const width = scrollRef.current.clientWidth;
            const newSlide = Math.round(scrollLeft / width);
            setCurrentSlide(newSlide);
        }
    };

    const getIcon = () => {
        switch (news.type) {
            case 'video': return <FiVideo />;
            case 'audio': return <FiMic />;
            case 'image': return <FiImage />;
            default: return <FiType />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card rounded-2xl overflow-hidden break-inside-avoid cursor-pointer group/card hover:bg-gray-800/90 transition-colors"
            onClick={() => navigate(`/news/${news._id}`)}
        >
            {/* Image Carousel / Single Image */}
            {news.type === 'image' && (
                <div className="h-40 md:h-48 overflow-hidden relative group">
                    {news.images && news.images.length > 1 ? (
                        <>
                            <div
                                ref={scrollRef}
                                onScroll={(e) => {
                                    e.stopPropagation();
                                    handleScroll();
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="flex overflow-x-auto snap-x snap-mandatory h-full scrollbar-hide"
                            >
                                {news.images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img.url}
                                        alt={`${news.title} ${i + 1}`}
                                        className="w-full h-full object-cover flex-shrink-0 snap-center"
                                    />
                                ))}
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-white shadow-sm border border-white/10">
                                {currentSlide + 1} / {news.images.length}
                            </div>
                        </>
                    ) : (
                        <img
                            src={news.mediaUrl}
                            alt={news.title}
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                        />
                    )}
                </div>
            )}
            {news.mediaUrl && news.type === 'video' && (
                <div className="h-40 md:h-48 bg-black" onClick={(e) => e.stopPropagation()}>
                    <video src={news.mediaUrl} controls className="w-full h-full" />
                </div>
            )}
            {news.mediaUrl && news.type === 'audio' && (
                <div className="p-4 bg-gray-800/50" onClick={(e) => e.stopPropagation()}>
                    <audio src={news.mediaUrl} controls className="w-full" />
                </div>
            )}

            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-md bg-white/5 text-blue-300 border border-white/5">
                        {news.category}
                    </span>
                    <span className="text-gray-500 text-lg">{getIcon()}</span>
                </div>

                <h3 className="text-xl font-bold mb-2 leading-tight group-hover/card:text-blue-400 transition-colors">{news.title}</h3>

                {news.type === 'text' && (
                    <p className="text-gray-400 text-sm line-clamp-4 mb-4">
                        {news.content}
                    </p>
                )}

                {news.content && news.type !== 'text' && (
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                        {news.content}
                    </p>
                )}

                {news.link && (
                    <a
                        href={news.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-4 group"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FiLink className="group-hover:rotate-45 transition-transform" />
                        <span className="text-sm font-medium truncate max-w-[200px] underline decoration-blue-400/30 hover:decoration-blue-400">
                            {news.link.replace(/^https?:\/\/(www\.)?/, '')}
                        </span>
                    </a>
                )}

                <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-700/30">
                    <div className="flex items-center gap-1">
                        <FiCalendar />
                        {format(new Date(news.date), 'MMM d, yyyy')}
                    </div>
                    {/* Add edit/delete actions here if needed */}
                </div>
                {news.voiceUrl && (
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 mb-2 text-blue-400">
                            <FiMic className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Voice Note</span>
                        </div>
                        <audio src={news.voiceUrl} controls className="w-full h-8" />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default NewsCard;
