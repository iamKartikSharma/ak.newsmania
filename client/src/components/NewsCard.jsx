import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FiMic, FiImage, FiType, FiVideo, FiTrash2, FiCalendar } from 'react-icons/fi';

const NewsCard = ({ news, index }) => {
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
            className="glass-card rounded-2xl overflow-hidden break-inside-avoid"
        >
            {news.mediaUrl && news.type === 'image' && (
                <div className="h-48 overflow-hidden">
                    <img src={news.mediaUrl} alt={news.title} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
                </div>
            )}
            {news.mediaUrl && news.type === 'video' && (
                <div className="h-48 bg-black">
                    <video src={news.mediaUrl} controls className="w-full h-full" />
                </div>
            )}
            {news.mediaUrl && news.type === 'audio' && (
                <div className="p-4 bg-gray-800/50">
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

                <h3 className="text-xl font-bold mb-2 leading-tight">{news.title}</h3>

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

                <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-700/30">
                    <div className="flex items-center gap-1">
                        <FiCalendar />
                        {format(new Date(news.date), 'MMM d, yyyy')}
                    </div>
                    {/* Add edit/delete actions here if needed */}
                </div>
                {news.voiceUrl && (
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
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
