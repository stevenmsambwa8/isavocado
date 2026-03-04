'use client'
import { useState } from 'react'
import { Home, Search, Library, TrendingUp, Headphones, Settings, Heart, Clock, Radio, Volume2, SkipBack, SkipForward, Play, Pause, Shuffle, Repeat } from 'lucide-react'
import StatsCards from './components/StatsCards'
import ListeningChart from './components/ListeningChart'
import TopTracks from './components/TopTracks'
import RecentlyPlayed from './components/RecentlyPlayed'

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'trending', label: 'Charts', icon: TrendingUp },
]

const sidebarNav = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'radio', label: 'Radio', icon: Radio },
]

const libraryNav = [
  { id: 'liked', label: 'Liked Songs', icon: Heart },
  { id: 'recent', label: 'Recently Played', icon: Clock },
]

export default function Page() {
  const [activeTab, setActiveTab] = useState('home')
  const [isPlaying, setIsPlaying] = useState(true)
  const [liked, setLiked] = useState(false)
  const [track, setTrack] = useState({
    title: 'Midnight Bloom', artist: 'Nora James', progress: 38,
  })

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="app-shell">

      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar" style={{ display: 'none' }}>
        <div className="sidebar-logo"><Headphones size={18} strokeWidth={1.5} /><span>Wavely</span></div>
        <div>
          <p className="nav-section-label">Menu</p>
          <div className="nav-group">
            {sidebarNav.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`nav-btn ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
                <Icon size={15} strokeWidth={1.8} />{label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="nav-section-label">Library</p>
          <div className="nav-group">
            {libraryNav.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`nav-btn ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
                <Icon size={15} strokeWidth={1.8} />{label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <p className="nav-section-label">Playlists</p>
          <div className="nav-group">
            {['Late Night Drive', 'Focus Mode', 'Sunday Morning', 'Workout Mix'].map(p => (
              <button key={p} className="playlist-btn">{p}</button>
            ))}
          </div>
        </div>
        <div className="sidebar-footer">
          <button className="nav-btn"><Settings size={15} strokeWidth={1.8} />Settings</button>
        </div>
      </aside>

      {/* Desktop main wrapper */}
      <div className="desktop-main" style={{ display: 'contents' }}>

        {/* Top bar (mobile only) */}
        <div className="top-bar">
          <div className="top-bar-logo">
            <Headphones size={18} strokeWidth={1.5} />
            <span>Wavely</span>
          </div>
          <span className="top-bar-date">
            {now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Scroll content */}
        <div className="scroll-area">
          <div className="greeting-block">
            <p className="greeting-sub">{greeting}, Alex 👋</p>
            <h1 className="greeting-title">Your Dashboard</h1>
          </div>

          <StatsCards />

          <div className="desktop-grid">
            <div>
              <ListeningChart />
              <div className="card">
                <p className="section-title">Top Tracks</p>
                <TopTracks onPlay={setTrack} />
              </div>
            </div>
            <div>
              <div className="card">
                <p className="section-title">Recently Played</p>
                <RecentlyPlayed onPlay={setTrack} />
              </div>
            </div>
          </div>
        </div>

        {/* Mini Player */}
        <div className="mini-player">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div className="mini-thumb">{track.title[0]}</div>
            <div className="mini-info">
              <p className="mini-title">{track.title}</p>
              <p className="mini-artist">{track.artist}</p>
            </div>
            <button className={`mini-btn like ${liked ? 'liked' : ''}`} onClick={() => setLiked(p => !p)}>
              <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div className="mini-controls">
              <button className="mini-btn" style={{ color: 'var(--text-muted)' }}><Shuffle size={14} strokeWidth={1.8} /></button>
              <button className="mini-btn"><SkipBack size={16} fill="currentColor" strokeWidth={0} /></button>
              <button className="mini-btn play" onClick={() => setIsPlaying(p => !p)}>
                {isPlaying ? <Pause size={16} fill="currentColor" strokeWidth={0} /> : <Play size={16} fill="currentColor" strokeWidth={0} />}
              </button>
              <button className="mini-btn"><SkipForward size={16} fill="currentColor" strokeWidth={0} /></button>
              <button className="mini-btn" style={{ color: 'var(--text-muted)' }}><Repeat size={14} strokeWidth={1.8} /></button>
            </div>
            <div className="progress-row">
              <span className="progress-time">1:24</span>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${track.progress || 38}%` }} /></div>
              <span className="progress-time">3:42</span>
            </div>
          </div>
          <div className="mini-player-right">
            <Volume2 size={14} color="var(--text-muted)" />
            <div className="volume-bar"><div className="volume-fill" /></div>
          </div>
        </div>

        {/* Bottom Tab Bar (mobile only) */}
        <nav className="tab-bar">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`tab-item ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
              <Icon size={22} strokeWidth={activeTab === id ? 2.2 : 1.6} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}