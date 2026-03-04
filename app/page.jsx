'use client'
import { useState } from 'react'
import { Home, Search, Library, TrendingUp, Headphones, Settings, Heart, Clock, Radio, Volume2, SkipBack, SkipForward, Play, Pause, Shuffle, Repeat, ChevronLeft } from 'lucide-react'
import StatsCards from './components/StatsCards'
import ListeningChart from './components/ListeningChart'
import TopTracks from './components/TopTracks'
import RecentlyPlayed from './components/RecentlyPlayed'

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'charts', label: 'Charts', icon: TrendingUp },
]

function MiniPlayer({ track, isPlaying, onToggle, liked, onLike }) {
  return (
    <div style={{
      background: '#fff', borderTop: '1px solid #e8e4de',
      padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10, flexShrink: 0,
        background: 'hsl(300,30%,85%)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'rgba(0,0,0,0.4)'
      }}>{track.title[0]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</p>
        <p style={{ fontSize: 11.5, color: '#8c8680', marginTop: 1 }}>{track.artist}</p>
      </div>
      <button onClick={onLike} style={{ padding: 6, color: liked ? '#b5451b' : '#8c8680', background: 'none', border: 'none', cursor: 'pointer' }}>
        <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
      </button>
      <button onClick={onToggle} style={{
        width: 38, height: 38, borderRadius: '50%', background: '#1a1814',
        color: '#fff', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {isPlaying ? <Pause size={16} fill="currentColor" strokeWidth={0} /> : <Play size={16} fill="currentColor" strokeWidth={0} />}
      </button>
      <button style={{ padding: 6, color: '#1a1814', background: 'none', border: 'none', cursor: 'pointer' }}>
        <SkipForward size={18} fill="currentColor" strokeWidth={0} />
      </button>
    </div>
  )
}

function TabBar({ active, onTab }) {
  return (
    <nav style={{
      background: '#fff', borderTop: '1px solid #e8e4de',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      paddingBottom: 'env(safe-area-inset-bottom)', flexShrink: 0, height: 64
    }}>
      {tabs.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => onTab(id)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 4, padding: '8px 0', color: active === id ? '#1a1814' : '#8c8680',
          background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 500,
          fontFamily: 'DM Sans, sans-serif'
        }}>
          <Icon size={22} strokeWidth={active === id ? 2.2 : 1.6} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}

function HomeScreen({ onPlay }) {
  return (
    <div style={{ padding: '20px 16px 12px' }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: '#8c8680', marginBottom: 4 }}>
          {(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening' })()}, Alex 👋
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5 }}>Your Dashboard</h1>
      </div>
      <StatsCards />
      <ListeningChart />
      <div style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <p style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.3, marginBottom: 14 }}>Top Tracks</p>
        <TopTracks onPlay={onPlay} />
      </div>
      <div style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <p style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.3, marginBottom: 14 }}>Recently Played</p>
        <RecentlyPlayed onPlay={onPlay} />
      </div>
    </div>
  )
}

function SearchScreen() {
  const genres = ['Pop', 'Hip-Hop', 'R&B', 'Electronic', 'Jazz', 'Classical', 'Rock', 'Afrobeats']
  const colors = ['hsl(47,60%,82%)', 'hsl(188,50%,78%)', 'hsl(320,40%,82%)', 'hsl(94,45%,78%)', 'hsl(21,55%,80%)', 'hsl(265,35%,82%)', 'hsl(141,40%,78%)', 'hsl(15,60%,80%)']
  return (
    <div style={{ padding: '20px 16px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, marginBottom: 16 }}>Search</h1>
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <input placeholder="Artists, songs, podcasts..." style={{
          width: '100%', padding: '12px 16px', borderRadius: 12,
          border: '1px solid #e8e4de', background: '#f7f6f3',
          fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box'
        }} />
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#8c8680', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10.5 }}>Browse by genre</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {genres.map((g, i) => (
          <div key={g} style={{
            background: colors[i], borderRadius: 12, padding: '18px 14px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'rgba(0,0,0,0.65)'
          }}>{g}</div>
        ))}
      </div>
    </div>
  )
}

function LibraryScreen({ onPlay }) {
  return (
    <div style={{ padding: '20px 16px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, marginBottom: 20 }}>Your Library</h1>
      {[
        { name: 'Liked Songs', count: '384 songs', hue: 320 },
        { name: 'Late Night Drive', count: '24 songs', hue: 188 },
        { name: 'Focus Mode', count: '18 songs', hue: 94 },
        { name: 'Sunday Morning', count: '31 songs', hue: 47 },
        { name: 'Workout Mix', count: '42 songs', hue: 21 },
      ].map((p) => (
        <div key={p.name} onClick={() => onPlay({ title: p.name, artist: 'Playlist', progress: 0 })} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '10px 0', borderBottom: '1px solid #f0ede8', cursor: 'pointer'
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 10, flexShrink: 0,
            background: `hsl(${p.hue},35%,83%)`, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: 'rgba(0,0,0,0.4)'
          }}>{p.name[0]}</div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</p>
            <p style={{ fontSize: 12, color: '#8c8680', marginTop: 2 }}>{p.count}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ChartsScreen({ onPlay }) {
  return (
    <div style={{ padding: '20px 16px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, marginBottom: 20 }}>Charts</h1>
      <div style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>🔥 Top 7 This Week</p>
        <TopTracks onPlay={onPlay} />
      </div>
    </div>
  )
}

export default function Page() {
  const [history, setHistory] = useState(['home'])
  const activeTab = history[history.length - 1]

  const [isPlaying, setIsPlaying] = useState(true)
  const [liked, setLiked] = useState(false)
  const [track, setTrack] = useState({ title: 'Midnight Bloom', artist: 'Nora James', progress: 38 })

  const navigate = (tab) => {
    setHistory(prev => [...prev, tab])
  }

  const goBack = () => {
    if (history.length > 1) setHistory(prev => prev.slice(0, -1))
  }

  const handlePlay = (t) => setTrack(t)

  const screens = {
    home: <HomeScreen onPlay={handlePlay} />,
    search: <SearchScreen />,
    library: <LibraryScreen onPlay={handlePlay} />,
    charts: <ChartsScreen onPlay={handlePlay} />,
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', maxWidth: 430,
      margin: '0 auto', background: '#f7f6f3',
      fontFamily: 'DM Sans, sans-serif', overflow: 'hidden'
    }}>
      {/* Top bar */}
      <div style={{
        height: 56, background: '#fff', borderBottom: '1px solid #e8e4de',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {history.length > 1 && (
            <button onClick={goBack} style={{ padding: '4px 8px 4px 0', background: 'none', border: 'none', cursor: 'pointer', color: '#1a1814', display: 'flex', alignItems: 'center' }}>
              <ChevronLeft size={22} strokeWidth={2} />
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Headphones size={18} strokeWidth={1.5} />
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>Wavely</span>
          </div>
        </div>
        <span style={{ fontSize: 11, color: '#8c8680', fontFamily: 'DM Mono, monospace' }}>
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Screen content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {screens[activeTab]}
      </div>

      {/* Mini player */}
      <MiniPlayer
        track={track}
        isPlaying={isPlaying}
        onToggle={() => setIsPlaying(p => !p)}
        liked={liked}
        onLike={() => setLiked(p => !p)}
      />

      {/* Bottom tabs */}
      <TabBar active={activeTab} onTab={navigate} />
    </div>
  )
}