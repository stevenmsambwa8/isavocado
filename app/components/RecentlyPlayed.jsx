'use client'

const recent = [
  { title: 'Golden Hour', artist: 'The Wavs', time: '2 min ago', hue: 47 },
  { title: 'City Lights', artist: 'Marco V', time: '18 min ago', hue: 188 },
  { title: 'Paper Planes', artist: 'Leon Dusk', time: '34 min ago', hue: 94 },
  { title: 'Echo Valley', artist: 'The Wavs', time: '1 hr ago', hue: 21 },
  { title: 'Slow Burn', artist: 'Chloe Park', time: '2 hr ago', hue: 265 },
  { title: 'Drift Away', artist: 'Elara Moon', time: '3 hr ago', hue: 141 },
]

export default function RecentlyPlayed({ onPlay }) {
  return (
    <div className="recent-list">
      {recent.map((track, i) => (
        <div key={i} className="recent-item" onClick={() => onPlay({ title: track.title, artist: track.artist, progress: 0 })}>
          <div className="recent-thumb" style={{ background: `hsl(${track.hue}, 35%, 83%)` }}>{track.title[0]}</div>
          <div className="recent-info">
            <p className="recent-name">{track.title}</p>
            <p className="recent-artist">{track.artist}</p>
          </div>
          <span className="recent-time">{track.time}</span>
        </div>
      ))}
    </div>
  )
}