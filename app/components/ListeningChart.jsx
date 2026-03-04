'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { day: 'Mon', minutes: 42 }, { day: 'Tue', minutes: 78 }, { day: 'Wed', minutes: 55 },
  { day: 'Thu', minutes: 110 }, { day: 'Fri', minutes: 95 }, { day: 'Sat', minutes: 132 }, { day: 'Sun', minutes: 88 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      <p className="tooltip-value">{payload[0].value} min</p>
    </div>
  )
  return null
}

export default function ListeningChart() {
  return (
    <div className="card">
      <div className="chart-header">
        <p className="section-title">Listening Activity</p>
        <span className="chart-badge">This week</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1a1814" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#1a1814" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e4de" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#8c8680' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#8c8680' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1a1814', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area type="monotone" dataKey="minutes" stroke="#1a1814" strokeWidth={2} fill="url(#grad)" dot={false} activeDot={{ r: 4, fill: '#1a1814', strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}