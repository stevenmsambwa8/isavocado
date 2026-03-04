'use client'
import { Home, Search, Library, TrendingUp, Heart, Clock, Radio, Settings, Headphones } from 'lucide-react'

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'radio', label: 'Radio', icon: Radio },
]
const libraryItems = [
  { id: 'liked', label: 'Liked Songs', icon: Heart },
  { id: 'recent', label: 'Recently Played', icon: Clock },
]

export default function Sidebar({ active, onNav }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo"><Headphones size={20} strokeWidth={1.5} /><span>Wavely</span></div>
      <nav className="sidebar-nav">
        <p className="nav-label">Menu</p>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`nav-item ${active === id ? 'active' : ''}`} onClick={() => onNav(id)}>
            <Icon size={16} strokeWidth={1.8} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <nav className="sidebar-nav">
        <p className="nav-label">Library</p>
        {libraryItems.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`nav-item ${active === id ? 'active' : ''}`} onClick={() => onNav(id)}>
            <Icon size={16} strokeWidth={1.8} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-playlists">
        <p className="nav-label">Playlists</p>
        {['Late Night Drive', 'Focus Mode', 'Sunday Morning', 'Workout Mix'].map(p => (
          <button key={p} className="playlist-item">{p}</button>
        ))}
      </div>
      <div className="sidebar-footer">
        <button className="nav-item"><Settings size={16} strokeWidth={1.8} /><span>Settings</span></button>
      </div>
    </aside>
  )
}