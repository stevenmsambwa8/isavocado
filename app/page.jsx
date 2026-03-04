'use client'
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import StatsCards from './components/StatsCards'
import ListeningChart from './components/ListeningChart'
import TopTracks from './components/TopTracks'
import RecentlyPlayed from './components/RecentlyPlayed'
import Player from './components/Player'

export default function Page() {
  const [activeNav, setActiveNav] = useState('home')
  const [currentTrack, setCurrentTrack] = useState({
    title: 'Midnight Bloom', artist: 'Nora James',
    album: 'After Hours', duration: '3:42', progress: 38,
  })
  const [isPlaying, setIsPlaying] = useState(true)

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="app-shell">
      <Sidebar active={activeNav} onNav={setActiveNav} />
      <main className="main-content">
        <div className="dashboard">
          <header className="dash-header">
            <div>
              <p className="dash-greeting">{greeting}, Alex 👋</p>
              <h1 className="dash-title">Your Music Dashboard</h1>
            </div>
            <div className="dash-date">
              {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </header>
          <StatsCards />
          <div className="dash-grid">
            <div className="dash-col-wide">
              <ListeningChart />
              <TopTracks onPlay={setCurrentTrack} />
            </div>
            <div className="dash-col-narrow">
              <RecentlyPlayed onPlay={setCurrentTrack} />
            </div>
          </div>
        </div>
      </main>
      <Player track={currentTrack} isPlaying={isPlaying} onToggle={() => setIsPlaying(p => !p)} />
    </div>
  )
}