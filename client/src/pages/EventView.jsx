import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import NewsCard from '../components/NewsCard';

const EventView = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/events/${id}`);
                setEvent(res.data.event);
                setNews(res.data.news);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchEventDetails();
    }, [id]);

    if (loading) return <div className="text-center py-20">Loading Timeline...</div>;
    if (!event) return <div className="text-center py-20">Event not found</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{event.title}</h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">{event.description}</p>
                <div className="mt-4 text-sm text-gray-500 uppercase tracking-widest">
                    Timeline View
                </div>
            </motion.div>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-1 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/0 via-blue-500/50 to-purple-500/0"></div>

                <div className="space-y-12">
                    {news.map((item, index) => {
                        const isLeft = index % 2 === 0;
                        return (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                className={`flex flex-col md:flex-row gap-8 items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                            >
                                {/* Date Bubble - Mobile: Left aligned, Desktop: Center */}
                                <div className="hidden md:flex flex-col items-center justify-center w-12 h-12 rounded-full bg-gray-900 border border-blue-500/50 z-10 shrink-0 absolute left-1/2 -translate-x-1/2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                </div>

                                {/* Content Card */}
                                <div className={`w-full md:w-1/2 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'} pl-8 md:pl-0`}>
                                    <div className="relative">
                                        {/* Mobile Dot */}
                                        <div className="md:hidden absolute -left-[35px] top-6 w-4 h-4 rounded-full bg-blue-600 border-4 border-gray-900"></div>

                                        <div className="mb-2 text-blue-400 font-mono text-sm">
                                            {format(new Date(item.date), 'MMMM d, yyyy')}
                                        </div>

                                        <NewsCard news={item} index={index} />
                                    </div>
                                </div>

                                {/* Empty space for the other side */}
                                <div className="hidden md:block w-1/2"></div>
                            </motion.div>
                        );
                    })}

                    {news.length === 0 && (
                        <div className="text-center text-gray-500 py-10 glass-panel rounded-xl">
                            <p>No news updates added to this event yet.</p>
                            <p className="text-sm mt-2">Upload news and selecting "{event.title}" to populate this timeline.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventView;
