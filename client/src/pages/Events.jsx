import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create Event Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchEvents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/events');
            setEvents(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/events', {
                title, description, startDate, endDate
            });
            toast.success('Event started!');
            setShowCreateModal(false);
            fetchEvents();
            // Reset
            setTitle(''); setDescription(''); setStartDate(''); setEndDate('');
        } catch (err) {
            toast.error('Failed to create event');
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex justify-between items-center"
            >
                <div>
                    <h1 className="text-4xl font-bold mb-2">Tracked Events</h1>
                    <p className="text-gray-400">Follow the timeline of major happenings.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-all"
                >
                    <FiPlus /> New Event
                </button>
            </motion.div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event, index) => (
                        <motion.div
                            key={event._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card rounded-2xl p-6 relative group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FiCalendar size={80} />
                            </div>

                            <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>

                            <div className="flex items-center gap-2 text-sm text-blue-300 mb-6 bg-blue-500/10 w-fit px-3 py-1 rounded-lg">
                                <span>{event.startDate && format(new Date(event.startDate), 'MMM d, yyyy')}</span>
                                {event.endDate && <span> - {format(new Date(event.endDate), 'MMM d, yyyy')}</span>}
                            </div>

                            <Link
                                to={`/event/${event._id}`}
                                className="inline-flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                            >
                                View Timeline <FiArrowRight />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Simple Modal for Create Event */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-panel w-full max-w-md p-6 rounded-2xl"
                    >
                        <h2 className="text-2xl font-bold mb-4">Start New Event</h2>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <input
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 outline-none"
                                placeholder="Event Title (e.g. Budget 2026)"
                                value={title} onChange={e => setTitle(e.target.value)} required
                            />
                            <textarea
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 outline-none"
                                placeholder="Description"
                                value={description} onChange={e => setDescription(e.target.value)}
                            ></textarea>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 ml-1">Start Date</label>
                                    <input type="date" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 outline-none"
                                        value={startDate} onChange={e => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 ml-1">End Date</label>
                                    <input type="date" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 outline-none"
                                        value={endDate} onChange={e => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2 rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg transition-colors">Create</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Events;
