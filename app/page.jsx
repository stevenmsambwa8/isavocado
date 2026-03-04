'use client'
import { useState, useEffect } from 'react'
import {
  Home, Search, Library, TrendingUp, Headphones, Heart,
  SkipForward, SkipBack, Play, Pause, ChevronLeft, ChevronDown,
  ChevronRight, Bell, Moon, Sun, Download, Mic2,
  BarChart2, Volume2, Check, WifiOff, Shuffle, Repeat
} from 'lucide-react'
import StatsCards from './components/StatsCards'
import ListeningChart from './components/ListeningChart'
import TopTracks from './components/TopTracks'
import RecentlyPlayed from './components/RecentlyPlayed'

// ── Data ──────────────────────────────────────────────
const TABS = [
  { id: 'home',    label: 'Home',   icon: Home },
  { id: 'search',  label: 'Search', icon: Search },
  { id: 'library', label: 'Library',icon: Library },
  { id: 'charts',  label: 'Charts', icon: TrendingUp },
]

const ARTISTS = [
  { id: 1, name: 'Nora James',  genre: 'Indie Soul',  hue: 320, followers: '2.4M', tracks: 48, bio: 'London-based indie soul artist known for her ethereal voice and midnight soundscapes. Her debut album "After Hours" went platinum in 2024.' },
  { id: 2, name: 'The Wavs',    genre: 'Electronic',  hue: 188, followers: '1.8M', tracks: 63, bio: 'The Wavs blend electronic production with organic instrumentation, creating immersive sonic landscapes. Based in Berlin.' },
  { id: 3, name: 'Elara Moon',  genre: 'Dream Pop',   hue: 141, followers: '980K', tracks: 32, bio: 'Elara Moon crafts dreamy atmospheric pop that feels like floating through clouds, heavily influenced by 80s shoegaze.' },
  { id: 4, name: 'Marco V',     genre: 'Neo-Soul',    hue: 47,  followers: '3.1M', tracks: 71, bio: 'Neo-soul powerhouse from Lagos whose music blends afrobeats rhythms with classic soul arrangements.' },
]

const LYRICS = {
  'Midnight Bloom': [
    { time: 0,  line: '🎵 Instrumental intro...' },
    { time: 8,  line: 'In the quiet of the night' },
    { time: 12, line: 'Stars are bleeding into light' },
    { time: 16, line: 'And I find myself again' },
    { time: 20, line: 'Losing all my careful pretend' },
    { time: 26, line: '— Chorus —' },
    { time: 28, line: 'Midnight bloom, midnight bloom' },
    { time: 32, line: 'Flowers growing in my room' },
    { time: 36, line: 'Tell me that you feel it too' },
    { time: 40, line: 'This midnight bloom inside of you' },
    { time: 48, line: 'Walking through the silver haze' },
    { time: 52, line: 'Lost inside your golden gaze' },
    { time: 56, line: 'Nothing here makes sense to me' },
    { time: 60, line: 'Except the way you set me free' },
  ],
}

const NOTIFICATIONS = [
  { id: 1, icon: '🎵', title: 'New release',   msg: 'Nora James dropped "Velvet Sky"',        time: '2m ago',  read: false },
  { id: 2, icon: '❤️', title: 'Milestone',     msg: "You've listened for 100+ hours!",         time: '1h ago',  read: false },
  { id: 3, icon: '🎧', title: 'Weekly recap',  msg: 'Your top track was Midnight Bloom',       time: '2h ago',  read: true  },
  { id: 4, icon: '🔥', title: 'Trending',      msg: 'Golden Hour is #1 in your area',          time: '5h ago',  read: true  },
  { id: 5, icon: '👤', title: 'Artist update', msg: 'Marco V is going on tour',                time: '1d ago',  read: true  },
]

const DOWNLOADS = [
  { title: 'Midnight Bloom', artist: 'Nora James',  size: '8.2 MB',  downloaded: true  },
  { title: 'Golden Hour',    artist: 'The Wavs',    size: '9.1 MB',  downloaded: true  },
  { title: 'Drift Away',     artist: 'Elara Moon',  size: '7.8 MB',  downloaded: false },
  { title: 'City Lights',    artist: 'Marco V',     size: '11.3 MB', downloaded: true  },
  { title: 'Slow Burn',      artist: 'Chloe Park',  size: '8.9 MB',  downloaded: false },
]

// ── Style helpers ─────────────────────────────────────
const c = {
  bg:      d => d ? '#121212' : '#f7f6f3',
  surface: d => d ? '#1e1e1e' : '#ffffff',
  surface2:d => d ? '#2a2a2a' : '#f0ede8',
  border:  d => d ? '#2a2a2a' : '#e8e4de',
  text:    d => d ? '#f0ede8' : '#1a1814',
  muted:   d => d ? '#888888' : '#8c8680',
  accent:  d => d ? '#f0ede8' : '#1a1814',
}

const card = d => ({
  background: c.surface(d), border: `1px solid ${c.border(d)}`,
  borderRadius: 14, padding: 16, marginBottom: 16,
})

// ── Tiny reusable components ──────────────────────────
function Chip({ label, dark }) {
  return <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: c.muted(dark), background: c.surface2(dark), padding: '3px 9px', borderRadius: 20, border: `1px solid ${c.border(dark)}` }}>{label}</span>
}

function Avatar({ size = 40, hue = 200, letter = 'A', radius, style = {} }) {
  return (
    <div style={{ width: size, height: size, borderRadius: radius ?? size * 0.25, background: `hsl(${hue},35%,83%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: 'rgba(0,0,0,0.4)', flexShrink: 0, ...style }}>{letter}</div>
  )
}

function IconBtn({ onClick, children, style = {} }) {
  return <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, ...style }}>{children}</button>
}

function Toggle({ on, onChange, dark }) {
  return (
    <div onClick={onChange} style={{ width: 48, height: 28, borderRadius: 14, background: on ? c.accent(dark) : c.surface2(dark), position: 'relative', cursor: 'pointer', transition: 'background 0.25s', border: `1px solid ${c.border(dark)}` }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: on ? 24 : 3, transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
    </div>
  )
}

// ── Now Playing fullscreen ────────────────────────────
function NowPlaying({ track, isPlaying, onToggle, liked, onLike, onClose, dark }) {
  const [progress, setProgress] = useState(track.progress ?? 38)
  const [view, setView] = useState('art') // 'art' | 'lyrics' | 'eq'
  const lyrics = LYRICS[track.title] ?? [{ time: 0, line: 'No lyrics available.' }]
  const activeLyric = lyrics.reduce((a, l) => l.time <= (progress / 100) * 222 ? l : a, lyrics[0])
  const eqBars = [65, 80, 45, 90, 55, 75, 40, 85, 60, 70]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column', fontFamily: 'DM Sans, sans-serif', background: dark ? `linear-gradient(160deg,hsl(300,20%,10%),#080808)` : `linear-gradient(160deg,hsl(300,40%,90%),hsl(188,35%,93%))` }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 24px 0' }}>
        <IconBtn onClick={onClose}><ChevronDown size={28} color={c.text(dark)} /></IconBtn>
        <p style={{ fontSize: 13, fontWeight: 500, color: c.text(dark) }}>Now Playing</p>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconBtn onClick={() => setView(v => v === 'lyrics' ? 'art' : 'lyrics')}><Mic2 size={20} color={view === 'lyrics' ? '#b5451b' : c.muted(dark)} /></IconBtn>
          <IconBtn onClick={() => setView(v => v === 'eq' ? 'art' : 'eq')}><BarChart2 size={20} color={view === 'eq' ? '#b5451b' : c.muted(dark)} /></IconBtn>
        </div>
      </div>

      {/* Main visual area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', overflow: 'hidden' }}>
        {view === 'art' && (
          <div style={{ width: 220, height: 220, borderRadius: 24, background: `hsl(300,30%,${dark ? 20 : 82}%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 90, fontWeight: 800, color: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)', boxShadow: '0 28px 64px rgba(0,0,0,0.22)' }}>{track.title[0]}</div>
        )}
        {view === 'lyrics' && (
          <div style={{ width: '100%', textAlign: 'center', overflowY: 'auto', maxHeight: '60vh' }}>
            <Chip label="Lyrics" dark={dark} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 28 }}>
              {lyrics.map((l, i) => (
                <p key={i} style={{ fontSize: l.line === activeLyric.line ? 20 : 15, fontWeight: l.line === activeLyric.line ? 700 : 400, color: l.line === activeLyric.line ? c.text(dark) : (dark ? '#444' : '#bbb'), transition: 'all 0.3s', letterSpacing: -0.3 }}>{l.line}</p>
              ))}
            </div>
          </div>
        )}
        {view === 'eq' && (
          <div style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}><Chip label="Visualizer" dark={dark} /></div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 7, height: 130 }}>
              {eqBars.map((h, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 18, borderRadius: 4, background: isPlaying ? `hsl(${300 + i * 18},55%,${dark ? 60 : 48}%)` : c.surface2(dark), height: isPlaying ? h : 16, transition: `height ${0.3 + i * 0.05}s ease`, animation: isPlaying ? `none` : 'none' }} />
                  <span style={{ fontSize: 7, color: c.muted(dark) }}>{['60','170','310','600','1k','3k','6k','12k','14k','16k'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ padding: '0 28px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 21, fontWeight: 700, letterSpacing: -0.5, color: c.text(dark), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</p>
            <p style={{ fontSize: 14, color: c.muted(dark), marginTop: 3 }}>{track.artist}</p>
          </div>
          <IconBtn onClick={onLike} style={{ padding: 8 }}>
            <Heart size={22} fill={liked ? '#b5451b' : 'none'} color={liked ? '#b5451b' : c.muted(dark)} />
          </IconBtn>
        </div>

        {/* Seekbar */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ height: 4, background: dark ? '#333' : '#ddd', borderRadius: 2, marginBottom: 8, cursor: 'pointer', position: 'relative' }}
            onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setProgress(Math.round(((e.clientX - r.left) / r.width) * 100)) }}>
            <div style={{ height: '100%', width: `${progress}%`, background: c.accent(dark), borderRadius: 2 }} />
            <div style={{ position: 'absolute', top: '50%', left: `${progress}%`, transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: '50%', background: c.accent(dark), boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontFamily: 'DM Mono,monospace', color: c.muted(dark) }}>1:24</span>
            <span style={{ fontSize: 11, fontFamily: 'DM Mono,monospace', color: c.muted(dark) }}>3:42</span>
          </div>
        </div>

        {/* Play controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <IconBtn style={{ color: c.muted(dark) }}><Shuffle size={20} /></IconBtn>
          <IconBtn><SkipBack size={30} fill={c.text(dark)} strokeWidth={0} /></IconBtn>
          <button onClick={onToggle} style={{ width: 68, height: 68, borderRadius: '50%', background: c.accent(dark), border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            {isPlaying ? <Pause size={28} fill={dark ? '#121212' : '#fff'} strokeWidth={0} /> : <Play size={28} fill={dark ? '#121212' : '#fff'} strokeWidth={0} />}
          </button>
          <IconBtn><SkipForward size={30} fill={c.text(dark)} strokeWidth={0} /></IconBtn>
          <IconBtn style={{ color: c.muted(dark) }}><Repeat size={20} /></IconBtn>
        </div>
      </div>
    </div>
  )
}

// ── Mini Player ───────────────────────────────────────
function MiniPlayer({ track, isPlaying, onToggle, liked, onLike, onOpen, dark }) {
  return (
    <div onClick={onOpen} style={{ background: c.surface(dark), borderTop: `1px solid ${c.border(dark)}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, cursor: 'pointer', transition: 'background 0.3s' }}>
      <Avatar size={44} hue={300} letter={track.title[0]} style={{ borderRadius: 10 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: c.text(dark), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</p>
        <p style={{ fontSize: 11.5, color: c.muted(dark), marginTop: 1 }}>{track.artist}</p>
      </div>
      <IconBtn onClick={e => { e.stopPropagation(); onLike() }} style={{ color: liked ? '#b5451b' : c.muted(dark) }}>
        <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
      </IconBtn>
      <button onClick={e => { e.stopPropagation(); onToggle() }} style={{ width: 38, height: 38, borderRadius: '50%', background: c.accent(dark), border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isPlaying ? <Pause size={14} fill={dark ? '#121212' : '#fff'} strokeWidth={0} /> : <Play size={14} fill={dark ? '#121212' : '#fff'} strokeWidth={0} />}
      </button>
      <IconBtn style={{ color: c.muted(dark) }}>
        <SkipForward size={18} fill="currentColor" strokeWidth={0} />
      </IconBtn>
    </div>
  )
}

// ── Tab Bar ───────────────────────────────────────────
function TabBar({ active, onTab, dark, unread }) {
  return (
    <nav style={{ background: c.surface(dark), borderTop: `1px solid ${c.border(dark)}`, display: 'flex', alignItems: 'center', paddingBottom: 'env(safe-area-inset-bottom)', flexShrink: 0, height: 64, transition: 'background 0.3s' }}>
      {TABS.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => onTab(id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 0', color: active === id ? c.text(dark) : c.muted(dark), background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: active === id ? 600 : 400, fontFamily: 'DM Sans,sans-serif', position: 'relative' }}>
          <Icon size={22} strokeWidth={active === id ? 2.2 : 1.6} />
          <span>{label}</span>
          {id === 'home' && unread > 0 && <div style={{ position: 'absolute', top: 6, right: '28%', width: 7, height: 7, borderRadius: '50%', background: '#b5451b' }} />}
        </button>
      ))}
    </nav>
  )
}

// ── Screen: Home ──────────────────────────────────────
function HomeScreen({ onPlay, onNavigate, dark }) {
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  return (
    <div style={{ padding: '20px 16px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <p style={{ fontSize: 13, color: c.muted(dark), marginBottom: 4 }}>{greeting}, Alex 👋</p>
          <h1 style={{ fontSize: 23, fontWeight: 700, letterSpacing: -0.6, color: c.text(dark) }}>Your Dashboard</h1>
        </div>
        <IconBtn onClick={() => onNavigate('profile')} style={{ marginTop: 2 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'hsl(188,40%,78%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'rgba(0,0,0,0.4)' }}>A</div>
        </IconBtn>
      </div>
      <StatsCards />
      <ListeningChart />
      <div style={card(dark)}>
        <p style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.3, marginBottom: 14, color: c.text(dark) }}>Top Tracks</p>
        <TopTracks onPlay={onPlay} />
      </div>
      <div style={card(dark)}>
        <p style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.3, marginBottom: 14, color: c.text(dark) }}>Recently Played</p>
        <RecentlyPlayed onPlay={onPlay} />
      </div>
      <div style={card(dark)}>
        <p style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.3, marginBottom: 14, color: c.text(dark) }}>Artists You Love</p>
        {ARTISTS.map(a => (
          <div key={a.id} onClick={() => onNavigate('artist', a)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 8px', borderRadius: 10, cursor: 'pointer' }}>
            <Avatar size={46} hue={a.hue} letter={a.name[0]} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: c.text(dark) }}>{a.name}</p>
              <p style={{ fontSize: 12, color: c.muted(dark), marginTop: 1 }}>{a.genre} · {a.followers} followers</p>
            </div>
            <ChevronRight size={15} color={c.muted(dark)} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Screen: Search ────────────────────────────────────
function SearchScreen({ dark }) {
  const genres = ['Pop','Hip-Hop','R&B','Electronic','Jazz','Classical','Rock','Afrobeats']
  const hues   = [47, 188, 320, 94, 21, 265, 141, 15]
  return (
    <div style={{ padding: '20px 16px' }}>
      <h1 style={{ fontSize: 23, fontWeight: 700, letterSpacing: -0.6, color: c.text(dark), marginBottom: 18 }}>Search</h1>
      <input placeholder="Artists, songs, podcasts…" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${c.border(dark)}`, background: c.surface2(dark), fontSize: 14, fontFamily: 'DM Sans,sans-serif', outline: 'none', boxSizing: 'border-box', color: c.text(dark), marginBottom: 24 }} />
      <p style={{ fontSize: 10.5, fontWeight: 600, color: c.muted(dark), marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Browse by genre</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {genres.map((g, i) => (
          <div key={g} style={{ background: `hsl(${hues[i]},45%,82%)`, borderRadius: 12, padding: '20px 14px', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'rgba(0,0,0,0.65)' }}>{g}</div>
        ))}
      </div>
    </div>
  )
}

// ── Screen: Library ───────────────────────────────────
function LibraryScreen({ onPlay, dark }) {
  const playlists = [
    { name: 'Liked Songs',      count: '384 songs', hue: 320 },
    { name: 'Late Night Drive', count: '24 songs',  hue: 188 },
    { name: 'Focus Mode',       count: '18 songs',  hue: 94  },
    { name: 'Sunday Morning',   count: '31 songs',  hue: 47  },
    { name: 'Workout Mix',      count: '42 songs',  hue: 21  },
  ]
  return (
    <div style={{ padding: '20px 16px' }}>
      <h1 style={{ fontSize: 23, fontWeight: 700, letterSpacing: -0.6, color: c.text(dark), marginBottom: 20 }}>Your Library</h1>
      {playlists.map(p => (
        <div key={p.name} onClick={() => onPlay({ title: p.name, artist: 'Playlist', progress: 0 })} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: `1px solid ${c.border(dark)}`, cursor: 'pointer' }}>
          <Avatar size={52} hue={p.hue} letter={p.name[0]} style={{ borderRadius: 10 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: c.text(dark) }}>{p.name}</p>
            <p style={{ fontSize: 12, color: c.muted(dark), marginTop: 2 }}>{p.count}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Screen: Charts ────────────────────────────────────
function ChartsScreen({ onPlay, dark }) {
  return (
    <div style={{ padding: '20px 16px' }}>
      <h1 style={{ fontSize: 23, fontWeight: 700, letterSpacing: -0.6, color: c.text(dark), marginBottom: 20 }}>Charts</h1>
      <div style={card(dark)}>
        <p style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.3, marginBottom: 14, color: c.text(dark) }}>🔥 Top 7 This Week</p>
        <TopTracks onPlay={onPlay} />
      </div>
    </div>
  )
}

// ── Screen: Artist ────────────────────────────────────
function ArtistScreen({ artist, onPlay, dark }) {
  const tracks = [
    { id: 1, title: 'Midnight Bloom', duration: '3:42' },
    { id: 2, title: 'Velvet Sky',     duration: '4:12' },
    { id: 3, title: 'After Hours',    duration: '5:01' },
    { id: 4, title: 'Pale Blue',      duration: '3:28' },
  ]
  return (
    <div>
      <div style={{ height: 200, background: `linear-gradient(160deg,hsl(${artist.hue},40%,75%),hsl(${artist.hue+40},30%,88%))`, display: 'flex', alignItems: 'flex-end', padding: '0 20px 20px' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.45)', marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Artist</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, color: 'rgba(0,0,0,0.7)' }}>{artist.name}</h1>
          <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)', marginTop: 4 }}>{artist.followers} followers · {artist.tracks} tracks</p>
        </div>
      </div>
      <div style={{ padding: '20px 16px' }}>
        <div style={card(dark)}>
          <p style={{ fontSize: 14, fontWeight: 600, color: c.text(dark), marginBottom: 10 }}>About</p>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: c.muted(dark) }}>{artist.bio}</p>
        </div>
        <div style={card(dark)}>
          <p style={{ fontSize: 14, fontWeight: 600, color: c.text(dark), marginBottom: 12 }}>Popular Tracks</p>
          {tracks.map((t, i) => (
            <div key={t.id} onClick={() => onPlay({ title: t.title, artist: artist.name, progress: 0 })} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < tracks.length - 1 ? `1px solid ${c.border(dark)}` : 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: 12, fontFamily: 'DM Mono,monospace', color: c.muted(dark), width: 18, textAlign: 'center' }}>{i + 1}</span>
              <Avatar size={38} hue={artist.hue + i * 22} letter={t.title[0]} style={{ borderRadius: 8 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, fontWeight: 500, color: c.text(dark) }}>{t.title}</p>
                <p style={{ fontSize: 12, color: c.muted(dark), marginTop: 1 }}>{artist.genre}</p>
              </div>
              <span style={{ fontSize: 11.5, fontFamily: 'DM Mono,monospace', color: c.muted(dark) }}>{t.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Screen: Notifications ─────────────────────────────
function NotificationsScreen({ dark }) {
  const [notifs, setNotifs] = useState(NOTIFICATIONS)
  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 23, fontWeight: 700, letterSpacing: -0.6, color: c.text(dark) }}>Notifications</h1>
        <button onClick={() => setNotifs(n => n.map(x => ({ ...x, read: true })))} style={{ fontSize: 12, color: c.muted(dark), background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Mark all read</button>
      </div>
      {notifs.map(n => (
        <div key={n.id} onClick={() => setNotifs(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '13px 10px', borderRadius: 12, cursor: 'pointer', background: n.read ? 'transparent' : (dark ? 'rgba(255,255,255,0.04)' : 'rgba(26,24,20,0.04)'), marginBottom: 2 }}>
          <div style={{ fontSize: 20, width: 42, height: 42, borderRadius: 10, background: c.surface2(dark), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n.icon}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: c.text(dark) }}>{n.title}</p>
            <p style={{ fontSize: 12.5, color: c.muted(dark), marginTop: 2, lineHeight: 1.4 }}>{n.msg}</p>
            <p style={{ fontSize: 11, color: c.muted(dark), marginTop: 4, fontFamily: 'DM Mono,monospace' }}>{n.time}</p>
          </div>
          {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#b5451b', marginTop: 5, flexShrink: 0 }} />}
        </div>
      ))}
    </div>
  )
}

// ── Screen: Profile ───────────────────────────────────
function ProfileScreen({ dark, onToggleDark }) {
  const stats = [{ label: 'Following', val: '142' }, { label: 'Followers', val: '38' }, { label: 'Playlists', val: '12' }]
  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ height: 170, background: 'linear-gradient(160deg,hsl(188,45%,78%),hsl(320,35%,82%))', display: 'flex', alignItems: 'flex-end', padding: '0 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: 'rgba(0,0,0,0.35)', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>A</div>
          <div style={{ paddingBottom: 4 }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'rgba(0,0,0,0.72)', letterSpacing: -0.3 }}>Alex Johnson</p>
            <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>@alexj · Premium</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Stats row */}
        <div style={{ display: 'flex', ...card(dark), padding: 0, overflow: 'hidden', marginTop: 20 }}>
          {stats.map((st, i) => (
            <div key={st.label} style={{ flex: 1, textAlign: 'center', padding: '16px 8px', borderRight: i < 2 ? `1px solid ${c.border(dark)}` : 'none' }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: c.text(dark) }}>{st.val}</p>
              <p style={{ fontSize: 11, color: c.muted(dark), marginTop: 3 }}>{st.label}</p>
            </div>
          ))}
        </div>

        {/* Dark mode */}
        <div style={{ ...card(dark), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {dark ? <Moon size={17} color={c.muted(dark)} /> : <Sun size={17} color={c.muted(dark)} />}
            <p style={{ fontSize: 14, color: c.text(dark) }}>Dark Mode</p>
          </div>
          <Toggle on={dark} onChange={onToggleDark} dark={dark} />
        </div>

        {/* Downloads */}
        <div style={card(dark)}>
          <p style={{ fontSize: 15, fontWeight: 600, color: c.text(dark), marginBottom: 14 }}>Downloads</p>
          {DOWNLOADS.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < DOWNLOADS.length - 1 ? `1px solid ${c.border(dark)}` : 'none' }}>
              <Avatar size={38} hue={47 + i * 44} letter={d.title[0]} style={{ borderRadius: 8 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: c.text(dark) }}>{d.title}</p>
                <p style={{ fontSize: 11.5, color: c.muted(dark), marginTop: 1 }}>{d.artist} · {d.size}</p>
              </div>
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: d.downloaded ? (dark ? '#1e3a2e' : '#e8f5ee') : c.surface2(dark) }}>
                {d.downloaded ? <Check size={14} color="#2d6a4f" /> : <Download size={14} color={c.muted(dark)} />}
              </div>
            </div>
          ))}
        </div>

        {/* Settings rows */}
        {[{ icon: Bell, label: 'Notifications' }, { icon: Volume2, label: 'Audio Quality' }, { icon: WifiOff, label: 'Offline Mode' }].map(({ icon: Icon, label }) => (
          <div key={label} style={{ ...card(dark), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon size={17} color={c.muted(dark)} />
              <p style={{ fontSize: 14, color: c.text(dark) }}>{label}</p>
            </div>
            <ChevronRight size={15} color={c.muted(dark)} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Root App ──────────────────────────────────────────
export default function Page() {
  const [history, setHistory]         = useState([{ screen: 'home' }])
  const [dark, setDark]               = useState(false)
  const [isPlaying, setIsPlaying]     = useState(true)
  const [liked, setLiked]             = useState(false)
  const [nowOpen, setNowOpen]         = useState(false)
  const [track, setTrack]             = useState({ title: 'Midnight Bloom', artist: 'Nora James', progress: 38 })

  const current    = history[history.length - 1]
  const canGoBack  = history.length > 1
  const mainTabs   = ['home', 'search', 'library', 'charts']
  const activeTab  = mainTabs.includes(current.screen) ? current.screen : null
  const unread     = NOTIFICATIONS.filter(n => !n.read).length

  // Push a new screen onto the stack
  const navigate = (screen, data = null) => {
    window.history.pushState({ idx: history.length }, '')
    setHistory(prev => [...prev, { screen, data }])
  }

  // Switch root tab (resets stack)
  const setTab = (tab) => {
    window.history.pushState({ idx: 0 }, '')
    setHistory([{ screen: tab }])
  }

  const goBack = () => {
    setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev)
  }

  // Hook physical back button (Android) + browser back
  useEffect(() => {
    const onPop = () => {
      if (nowOpen) { setNowOpen(false); return }
      goBack()
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [history, nowOpen])

  const handlePlay = (t) => { setTrack(t); setNowOpen(true) }

  const SCREENS = {
    home:          <HomeScreen          onPlay={handlePlay} onNavigate={navigate} dark={dark} />,
    search:        <SearchScreen        dark={dark} />,
    library:       <LibraryScreen       onPlay={handlePlay} dark={dark} />,
    charts:        <ChartsScreen        onPlay={handlePlay} dark={dark} />,
    artist:        <ArtistScreen        artist={current.data} onPlay={handlePlay} dark={dark} />,
    notifications: <NotificationsScreen dark={dark} />,
    profile:       <ProfileScreen       dark={dark} onToggleDark={() => setDark(p => !p)} />,
  }

  return (
    <>
      {/* Inject font + global resets once */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        * { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #e8e4de; border-radius: 2px; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 430, margin: '0 auto', background: c.bg(dark), fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', transition: 'background 0.3s' }}>

        {/* Now Playing overlay */}
        {nowOpen && (
          <NowPlaying
            track={track} isPlaying={isPlaying}
            onToggle={() => setIsPlaying(p => !p)}
            liked={liked} onLike={() => setLiked(p => !p)}
            onClose={() => setNowOpen(false)}
            dark={dark}
          />
        )}

        {/* Top bar */}
        <div style={{ height: 56, background: c.surface(dark), borderBottom: `1px solid ${c.border(dark)}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0, transition: 'background 0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {canGoBack && (
              <IconBtn onClick={goBack} style={{ marginRight: 4 }}>
                <ChevronLeft size={24} strokeWidth={2.2} color={c.text(dark)} />
              </IconBtn>
            )}
            <Headphones size={18} strokeWidth={1.5} color={c.text(dark)} />
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.4, color: c.text(dark), marginLeft: 6 }}>Wavely</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconBtn onClick={() => navigate('notifications')} style={{ position: 'relative' }}>
              <Bell size={20} color={c.muted(dark)} />
              {unread > 0 && <div style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: '#b5451b' }} />}
            </IconBtn>
            <IconBtn onClick={() => navigate('profile')}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'hsl(188,40%,78%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'rgba(0,0,0,0.4)' }}>A</div>
            </IconBtn>
          </div>
        </div>

        {/* Screen content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {SCREENS[current.screen] ?? SCREENS.home}
        </div>

        {/* Mini player */}
        <MiniPlayer
          track={track} isPlaying={isPlaying}
          onToggle={() => setIsPlaying(p => !p)}
          liked={liked} onLike={() => setLiked(p => !p)}
          onOpen={() => setNowOpen(true)}
          dark={dark}
        />

        {/* Bottom tab bar */}
        <TabBar active={activeTab} onTab={setTab} dark={dark} unread={unread} />
      </div>
    </>
  )
}
