import type { ReactNode } from 'react'

interface CardProps {
  title: string
  value: string
  subtitle: string
  icon: ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

export default function Card({ title, value, subtitle, icon, trend = 'neutral' }: CardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-green-600 bg-green-50'
      : trend === 'down'
        ? 'text-green-600 bg-green-50'
        : 'text-gray-500 bg-gray-50'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${trendColor}`}>
          {subtitle}
        </span>
      </div>
    </div>
  )
}
