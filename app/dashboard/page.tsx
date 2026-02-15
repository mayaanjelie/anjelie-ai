'use client'

import {
  Gauge,
  CloudOff,
  ShieldCheck,
  Award,
} from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import Card from '@/components/dashboard/Card'
import Graph from '@/components/dashboard/Graph'
import ActionList from '@/components/dashboard/ActionList'

const kpis = [
  {
    title: 'Sustainability Score',
    value: '78 / 100',
    subtitle: '+5 this month',
    icon: <Gauge size={20} />,
    trend: 'up' as const,
  },
  {
    title: 'Carbon Emissions',
    value: '120 tCO\u2082',
    subtitle: '\u2193 8% vs last quarter',
    icon: <CloudOff size={20} />,
    trend: 'down' as const,
  },
  {
    title: 'Supplier Compliance',
    value: '64%',
    subtitle: '18 of 28 compliant',
    icon: <ShieldCheck size={20} />,
    trend: 'neutral' as const,
  },
  {
    title: 'Certification Readiness',
    value: '52%',
    subtitle: 'B Corp Target',
    icon: <Award size={20} />,
    trend: 'neutral' as const,
  },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main content area offset by sidebar width */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back — here&apos;s your sustainability overview.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {kpis.map((kpi) => (
            <Card
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              subtitle={kpi.subtitle}
              icon={kpi.icon}
              trend={kpi.trend}
            />
          ))}
        </div>

        {/* Middle: Graph */}
        <div className="mb-8">
          <Graph />
        </div>

        {/* Bottom: Action Center */}
        <ActionList />
      </main>
    </div>
  )
}
