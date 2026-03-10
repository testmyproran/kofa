import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Standings } from './pages/Standings';
import { Fixtures } from './pages/Fixtures';
import { Results } from './pages/Results';
import { Players } from './pages/Players';
import { PlayerProfile } from './pages/PlayerProfile';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/fixtures" element={<Fixtures />} />
            <Route path="/results" element={<Results />} />
            <Route path="/players" element={<Players />} />
            <Route path="/players/:id" element={<PlayerProfile />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        
        <footer className="glass border-t-0 rounded-none py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
                <span className="font-black text-black text-xs">KOFA</span>
              </div>
              <span className="font-bold tracking-tighter">Kingdom of Football Association</span>
            </div>
            <p className="text-white/30 text-xs uppercase tracking-[0.3em]">Official eFootball Tournament Management</p>
            <p className="mt-8 text-white/10 text-[10px]">© 2026 KOFA. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
