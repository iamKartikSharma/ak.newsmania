import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUser, FiBriefcase, FiTrendingUp, FiPlus, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const KeyFiguresWidget = () => {
    const [figures, setFigures] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLeaderId, setCurrentLeaderId] = useState(null); // ID of leader being edited
    const [leaderForm, setLeaderForm] = useState({ name: '', role: '', org: '', image: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLeaders();
    }, []);

    const fetchLeaders = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/leaders`);
            if (res.data) {
                setFigures(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch leaders", err);
        }
    };

    const handleSaveLeader = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            if (currentLeaderId) {
                // Update existing
                const res = await axios.put(`${API_URL}/api/leaders/${currentLeaderId}`, leaderForm);
                setFigures(prev => prev.map(f => f._id === currentLeaderId ? res.data : f));
                toast.success('Leader updated!');
            } else {
                // Create new
                const res = await axios.post(`${API_URL}/api/leaders`, leaderForm);
                setFigures(prev => [res.data, ...prev]);
                toast.success('Leader added!');
            }

            closeModal();
        } catch (err) {
            console.error(err);
            toast.error('Failed to save leader');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLeader = async (id) => {
        if (!window.confirm("Are you sure you want to delete this leader?")) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.delete(`${API_URL}/api/leaders/${id}`);
            setFigures(prev => prev.filter(f => f._id !== id));
            toast.success('Leader deleted');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete leader');
        }
    };

    const openAddModal = () => {
        setLeaderForm({ name: '', role: '', org: '', image: '' });
        setCurrentLeaderId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (leader) => {
        setLeaderForm({ name: leader.name, role: leader.role, org: leader.org, image: leader.image || '' });
        setCurrentLeaderId(leader._id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setLeaderForm({ name: '', role: '', org: '', image: '' });
        setCurrentLeaderId(null);
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-800 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <FiBriefcase size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Key Leadership</h3>
                </div>
                <button
                    onClick={openAddModal}
                    className="p-2 hover:bg-gray-800 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                >
                    <FiPlus size={20} />
                </button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {figures.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No leaders added yet. Click + to add.
                    </div>
                )}

                {figures.map((fig) => (
                    <div key={fig._id} className="flex items-start gap-3 group bg-gray-800/30 p-3 rounded-xl hover:bg-gray-800/60 transition-colors border border-transparent hover:border-gray-700 relative">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 shrink-0 overflow-hidden">
                            {fig.image ? (
                                <img src={fig.image} alt={fig.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-400 font-bold text-xs">{fig.org ? fig.org.substring(0, 2) : 'NA'}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">
                                {fig.name}
                            </h4>
                            <p className="text-xs text-gray-400 truncate">{fig.role}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5 truncate">{fig.org}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => openEditModal(fig)}
                                className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                            >
                                <FiEdit2 size={14} />
                            </button>
                            <button
                                onClick={() => handleDeleteLeader(fig._id)}
                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                            >
                                <FiTrash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-green-500/10 rounded-lg text-green-400">
                        <FiTrendingUp size={16} />
                    </div>
                    <h4 className="text-sm font-bold text-gray-300">Market Watch</h4>
                </div>
                <div className="space-y-3">
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Tracking major deals, M&A, and policy shifts.
                    </p>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-fadeIn">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                        >
                            <FiX size={24} />
                        </button>

                        <h3 className="text-xl font-bold text-white mb-6">
                            {currentLeaderId ? 'Edit Leader' : 'Add New Leader'}
                        </h3>

                        <form onSubmit={handleSaveLeader} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    value={leaderForm.name}
                                    onChange={(e) => setLeaderForm({ ...leaderForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Role</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    value={leaderForm.role}
                                    onChange={(e) => setLeaderForm({ ...leaderForm, role: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Organization</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    value={leaderForm.org}
                                    onChange={(e) => setLeaderForm({ ...leaderForm, org: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Image URL (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    value={leaderForm.image}
                                    onChange={(e) => setLeaderForm({ ...leaderForm, image: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors mt-4 shadow-lg shadow-blue-900/20"
                            >
                                {loading ? 'Saving...' : (currentLeaderId ? 'Update Leader' : 'Add Leader')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KeyFiguresWidget;
