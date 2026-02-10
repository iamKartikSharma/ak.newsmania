import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiGrid, FiTrendingUp } from 'react-icons/fi';

const Navbar = () => {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-4 z-50 mx-4"
        >
            <div className="glass-panel rounded-2xl px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
                    <span className="text-3xl">📰</span> NewsMania
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                        <FiGrid /> Feed
                    </Link>
                    <Link to="/events" className="flex items-center gap-2 hover:text-purple-400 transition-colors">
                        <FiTrendingUp /> Events
                    </Link>
                    <button
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-5 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-95"
                        onClick={() => document.getElementById('upload_modal').showModal()}
                    >
                        <FiPlus /> Upload
                    </button>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
