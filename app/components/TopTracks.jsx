'use client'
import { useState } from 'react'
import { Play, Heart } from 'lucide-react'

const tracks = [
  { id: 1, rank: 1, title: 'Midnight Bloom', artist: 'Nora James', album: 'After Hours', duration: '3:42', plays: '1.2k', liked: true },
  { id: 2, rank: 2, title: 'Golden Hour', artist: 'The Wavs', album: 'Solstice', duration: '4:01', plays: '987', liked: false },
  { id: 3, rank: 3, title: 'Drift Away', artist: 'Elara Moon', album: 'Celestial', duration: '3:18', plays: '854', liked: true },
  { id: 4, rank: 4, title: 'City Lights', artist: 'Marco V', album: 'Neon District', duration: '5:14', plays: '741', liked: false },
  { id: 5, rank: 5, title: 'Slow Burn', artist: 'Chloe Park', album: 'Embers', duration: '3:56', plays: '698', liked: false },
  { id: 6, rank: 6, title: 'Echo Valley', artist: 'The Wavs', album: 'Solstice', duration: '4:22', plays: '612', liked: true },
  { id: 7, rank: 7, title: 'Paper Planes', artist: 'Leon Dusk', album: 'Takeoff', duration: '3:08', plays: '589', liked: false },
]

export default function TopTracks({ onPlay }) {
  const [liked, setLiked] = useState(tracks.map(t => t.liked))
  const [hoveredRow, setHoveredRow] = useState(null)
  const toggle = (i) => setLiked(prev => prev.map((v, idx) => idx === i ? !v : v))
  const handlePlay = (t) => onPlay({ title: t.title, artist: t.artist, album: t.album, duration: t.duration, progress: 20 })

  return (
    <div className="card">
      <p className="card-title">Top Tracks</p>
      <table className="tracks-table">
        <thead><tr><th>#</th><th>Title</th><th>Album</th><th>Plays</th><th>Time</th><th></th></tr></thead>
        <tbody>
          {tracks.map((track, i) => (
            <tr key={track.id} className="track-row" onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)}>
              <td className="track-rank">
                {hoveredRow === i
                  ? <button className="play-btn" onClick={() => handlePlay(track)}><Play size={12} fill="currentColor" /></button>
                  : <span>{track.rank}</span>}
              </td>
              <td>
                <div className="track-info">
                  <div className="track-thumb" style={{ background: `hsl(${track.id * 47}, 30%, 85%)` }}>{track.title[0]}</div>
                  <div><p className="track-name">{track.title}</p><p className="track-artist">{track.artist}</p></div>
                </div>
              </td>
              <td className="track-album">{track.album}</td>
              <td className="track-plays">{track.plays}</td>
              <td className="track-duration">{track.duration}</td>
              <td>
                <button className={`like-btn ${liked[i] ? 'liked' : ''}`} onClick={() => toggle(i)}>
                  <Heart size={13} fill={liked[i] ? 'currentColor' : 'none'} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}