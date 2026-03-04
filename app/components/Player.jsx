'use client'
import { useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat } from 'lucide-react'

export default function Player({ track, isPlaying, onToggle }) {
  const [volume] = useState(72)
  const [liked, setLiked] = useState(false)

  return (
    <footer className="player">
      <div className="player-track">
        <div className="player-thumb" style={{ background: 'hsl(300, 30%, 85%)' }}>{track.title[0]}</div>
        <div className="player-meta">
          <p className="player-title">{track.title}</p>
          <p className="player-artist">{track.artist}</p>
        </div>
        <button className={`player-like ${liked ? 'liked' : ''}`} onClick={() => setLiked(p => !p)}>
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="player-center">
        <div className="player-controls">
          <button className="ctrl-btn secondary"><Shuffle size={14} strokeWidth={1.8} /></button>
          <button className="ctrl-btn"><SkipBack size={16} fill="currentColor" strokeWidth={0} /></button>
          <button className="ctrl-btn play-pause" onClick={onToggle}>
            {isPlaying ? <Pause size={16} fill="currentColor" strokeWidth={0} /> : <Play size={16} fill="currentColor" strokeWidth={0} />}
          </button>
          <button className="ctrl-btn"><SkipForward size={16} fill="currentColor" strokeWidth={0} /></button>
          <button className="ctrl-btn secondary"><Repeat size={14} strokeWidth={1.8} /></button>
        </div>
        <div className="player-progress">
          <span className="progress-time">1:24</span>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${track.progress}%` }} /></div>
          <span className="progress-time">{track.duration}</span>
        </div>
      </div>
      <div className="player-right">
        <Volume2 size={14} strokeWidth={1.8} color="var(--text-muted)" />
        <div className="volume-bar"><div className="volume-fill" style={{ width: `${volume}%` }} /></div>
      </div>
    </footer>
  )
}