import { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiX, FiUploadCloud, FiMic, FiSquare, FiPlay, FiTrash2 } from 'react-icons/fi';

const UploadModal = ({ onSuccess }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState('text');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const timerIntervalRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            const chunks = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast.error("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerIntervalRef.current);
        }
    };

    const discardRecording = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', category);
        formData.append('type', type);

        if (file) formData.append('file', file);

        // Append voice note if exists
        if (audioBlob) {
            const voiceFile = new File([audioBlob], "voice_note.webm", { type: "audio/webm" });
            formData.append('voice', voiceFile);
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${API_URL}/api/news`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('News uploaded successfully!');
            onSuccess();
            handleClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to upload news');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        document.getElementById('upload_modal').close();
        // Reset form
        setTitle('');
        setContent('');
        setFile(null);
        setType('text');
        setCategory('');
        discardRecording();
        if (isRecording) stopRecording();
    };

    return (
        <dialog id="upload_modal" className="modal bg-transparent">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="glass-panel w-full max-w-lg rounded-2xl p-6 relative">
                    <button
                        onClick={handleClose}
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
                                    onChange={e => {
                                        setType(e.target.value);
                                        setFile(null); // Reset file when type changes
                                    }}
                                >
                                    <option value="text" className="text-gray-800">Text Article</option>
                                    <option value="image" className="text-gray-800">Image</option>
                                    <option value="video" className="text-gray-800">Video</option>
                                    <option value="audio" className="text-gray-800">Audio Upload</option>
                                </select>
                            </div>
                        </div>

                        {/* File Upload UI */}
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

                        {/* Voice Note Attachment Section */}
                        {(isRecording || audioUrl) && (
                            <div className="border border-gray-700 rounded-lg p-3 bg-gray-800/30 flex items-center justify-between">
                                {isRecording ? (
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        </div>
                                        <span className="text-red-400 font-mono text-sm">{formatTime(recordingTime)}</span>
                                        <button
                                            type="button"
                                            onClick={stopRecording}
                                            className="ml-auto text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md transition-colors"
                                        >
                                            Stop
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400">
                                            <FiPlay size={14} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">Voice Note Attached</p>
                                            <audio controls src={audioUrl} className="w-full h-6 mt-1" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={discardRecording}
                                            className="text-gray-400 hover:text-red-400 p-2 transition-colors"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                )}
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

                        <div className="flex gap-3">
                            {/* Mic Button */}
                            {!isRecording && !audioUrl && (
                                <button
                                    type="button"
                                    onClick={startRecording}
                                    className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700 flex items-center gap-2"
                                    title="Add Voice Note"
                                >
                                    <FiMic size={20} />
                                </button>
                            )}

                            {/* Publish Button */}
                            <button
                                disabled={loading || isRecording}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 py-2.5 rounded-lg font-medium shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Uploading...' : 'Publish News'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </dialog>
    );
};

export default UploadModal;
