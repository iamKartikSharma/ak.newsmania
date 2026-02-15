import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiGrid, FiTrendingUp, FiMenu, FiX, FiClock } from 'react-icons/fi';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-4 z-50 mx-4"
        >
            <div className="glass-panel rounded-2xl px-6 py-4 flex justify-between items-center max-w-7xl mx-auto relative">
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
                    <span className="text-3xl">📰</span> <span className="hidden sm:inline">NewsMania</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                        <FiGrid /> Feed
                    </Link>
                    <Link to="/events" className="flex items-center gap-2 hover:text-purple-400 transition-colors">
                        <FiTrendingUp /> Events
                    </Link>
                    <Link to="/sebi-timeline" className="flex items-center gap-2 hover:text-pink-400 transition-colors">
                        <FiClock /> SEBI Timeline
                    </Link>
                    <button
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-5 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-95"
                        onClick={() => document.getElementById('upload_modal').showModal()}
                    >
                        <FiPlus /> Upload
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>

                {/* Mobile Dropdown */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-xl p-4 flex flex-col gap-4 md:hidden"
                        >
                            <Link
                                to="/"
                                className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <FiGrid /> Feed
                            </Link>
                            <Link
                                to="/events"
                                className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <FiTrendingUp /> Events
                            </Link>
                            <Link
                                to="/sebi-timeline"
                                className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <FiClock /> SEBI Timeline
                            </Link>
                            <button
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg w-full"
                                onClick={() => {
                                    setIsOpen(false);
                                    document.getElementById('upload_modal').showModal();
                                }}
                            >
                                <FiPlus /> Upload News
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    );
};

export default Navbar;
