import { Headphones, Music2, Heart, TrendingUp } from 'lucide-react'

const stats = [
  { label: 'Hours Listened', value: '142h', sub: '+12h this week', icon: Headphones, color: 'green' },
  { label: 'Tracks Played', value: '2,841', sub: '38 today', icon: Music2, color: 'blue' },
  { label: 'Liked Songs', value: '384', sub: '+7 this week', icon: Heart, color: 'amber' },
  { label: 'Top Streak', value: '24d', sub: 'Personal best 🎉', icon: TrendingUp, color: 'neutral' },
]

export default function StatsCards() {
  return (
    <div className="stats-grid">
      {stats.map(({ label, value, sub, icon: Icon, color }) => (
        <div key={label} className={`stat-card stat-card--${color}`}>
          <div className="stat-icon-wrap"><Icon size={14} strokeWidth={2} /></div>
          <div>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
            <p className="stat-sub">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}