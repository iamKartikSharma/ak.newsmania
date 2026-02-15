import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import NewsDetail from './pages/NewsDetail';
import Events from './pages/Events';
import SebiTimeline from './pages/SebiTimeline';
import EventView from './pages/EventView';
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <Router>
            <div className="min-h-screen text-white relative">
                <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-10 -z-10"></div>
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/news/:id" element={<NewsDetail />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/sebi-timeline" element={<SebiTimeline />} />
                        <Route path="/event/:id" element={<EventView />} />
                    </Routes>
                </main>
                <Toaster position="bottom-right" toastOptions={{
                    style: {
                        background: '#333',
                        color: '#fff',
                    },
                }} />
            </div>
        </Router>
    );
}

export default App;
