'use client'
import { useState } from 'react'
import { Play, Heart } from 'lucide-react'

const tracks = [
  { id: 1, title: 'Midnight Bloom', artist: 'Nora James', duration: '3:42', liked: true },
  { id: 2, title: 'Golden Hour', artist: 'The Wavs', duration: '4:01', liked: false },
  { id: 3, title: 'Drift Away', artist: 'Elara Moon', duration: '3:18', liked: true },
  { id: 4, title: 'City Lights', artist: 'Marco V', duration: '5:14', liked: false },
  { id: 5, title: 'Slow Burn', artist: 'Chloe Park', duration: '3:56', liked: false },
  { id: 6, title: 'Echo Valley', artist: 'The Wavs', duration: '4:22', liked: true },
  { id: 7, title: 'Paper Planes', artist: 'Leon Dusk', duration: '3:08', liked: false },
]

export default function TopTracks({ onPlay }) {
  const [liked, setLiked] = useState(tracks.map(t => t.liked))
  const toggle = (i) => setLiked(prev => prev.map((v, idx) => idx === i ? !v : v))

  return (
    <div className="track-list">
      {tracks.map((track, i) => (
        <div key={track.id} className="track-row" onClick={() => onPlay({ title: track.title, artist: track.artist, progress: 20 })}>
          <span className="track-num">{i + 1}</span>
          <div className="track-thumb" style={{ background: `hsl(${track.id * 47}, 30%, 85%)` }}>{track.title[0]}</div>
          <div className="track-info">
            <p className="track-name">{track.title}</p>
            <p className="track-artist">{track.artist}</p>
          </div>
          <span className="track-duration">{track.duration}</span>
          <button className={`track-like ${liked[i] ? 'liked' : ''}`} onClick={e => { e.stopPropagation(); toggle(i) }}>
            <Heart size={14} fill={liked[i] ? 'currentColor' : 'none'} />
          </button>
        </div>
      ))}
    </div>
  )
}