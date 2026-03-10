import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Shield, Calendar, BarChart3, Settings, Menu, X } from 'lucide-react';
import { cn } from '../types';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: Trophy },
    { name: 'Standings', path: '/standings', icon: BarChart3 },
    { name: 'Fixtures', path: '/fixtures', icon: Calendar },
    { name: 'Players', path: '/players', icon: Users },
    { name: 'Admin', path: '/admin', icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b-0 rounded-none px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Trophy className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tighter leading-none">KOFA</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">Kingdom of Football</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-white/70 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full glass border-t border-white/10 p-4 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 rounded-xl text-base font-medium text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-3"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
