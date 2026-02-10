import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiX, FiUploadCloud } from 'react-icons/fi';

const UploadModal = ({ onSuccess }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState('text');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', category);
        formData.append('type', type);
        if (file) formData.append('file', file);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${API_URL}/api/news`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('News uploaded successfully!');
            onSuccess();
            document.getElementById('upload_modal').close();
            // Reset form
            setTitle('');
            setContent('');
            setFile(null);
        } catch (err) {
            console.error(err);
            toast.error('Failed to upload news');
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog id="upload_modal" className="modal bg-transparent">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="glass-panel w-full max-w-lg rounded-2xl p-6 relative">
                    <button
                        onClick={() => document.getElementById('upload_modal').close()}
                        className="absolute right-4 top-4 text-gray-400 hover:text-white"
                    >
                        <FiX size={24} />
                    </button>

                    <h2 className="text-2xl font-bold mb-6">Create News Entry</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Title</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 rounded-lg p-2 focus:border-blue-500 outline-none transition-colors"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Category</label>
                                <select
                                    required
                                    className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg p-2 outline-none"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                >
                                    <option value="" className="text-gray-800">Select...</option>
                                    <option value="Sports" className="text-gray-800">Sports</option>
                                    <option value="Banking" className="text-gray-800">Banking</option>
                                    <option value="Politics" className="text-gray-800">Politics</option>
                                    <option value="Technology" className="text-gray-800">Technology</option>
                                    <option value="World Affairs" className="text-gray-800">World Affairs</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Type</label>
                                <select
                                    className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg p-2 outline-none"
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                >
                                    <option value="text" className="text-gray-800">Text Article</option>
                                    <option value="image" className="text-gray-800">Image</option>
                                    <option value="video" className="text-gray-800">Video</option>
                                    <option value="audio" className="text-gray-800">Audio</option>
                                </select>
                            </div>
                        </div>

                        {type !== 'text' && (
                            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={e => setFile(e.target.files[0])}
                                    accept={type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*'}
                                />
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                    <FiUploadCloud size={24} />
                                    <span className="text-sm">{file ? file.name : `Upload ${type}`}</span>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Content / Notes</label>
                            <textarea
                                className="w-full bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 rounded-lg p-2 outline-none min-h-[100px]"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            ></textarea>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-2.5 rounded-lg font-medium shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Uploading...' : 'Publish News'}
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
    );
};

export default UploadModal;
