'use client'

import { Upload, Recycle, Target, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

interface ActionItem {
  icon: ReactNode
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

const actions: ActionItem[] = [
  {
    icon: <Upload size={18} />,
    title: 'Upload supplier labor documentation',
    description: 'Required for B Corp certification — 3 suppliers pending',
    priority: 'high',
  },
  {
    icon: <Recycle size={18} />,
    title: 'Increase recycled material sourcing to 70%',
    description: 'Currently at 52% — target deadline: Q2 2026',
    priority: 'medium',
  },
  {
    icon: <Target size={18} />,
    title: 'Set carbon reduction target',
    description: 'Define SBTi-aligned reduction pathway for Scope 1 & 2',
    priority: 'high',
  },
]

const priorityStyles: Record<string, string> = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-green-50 text-green-700 border-green-200',
}

export default function ActionList() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Action Center</h3>
          <p className="text-sm text-gray-500 mt-0.5">Priority tasks to improve your score</p>
        </div>
        <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
          {actions.length} pending
        </span>
      </div>

      <div className="space-y-3">
        {actions.map((action, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-brand-200 hover:bg-brand-50/30 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{action.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
            </div>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${priorityStyles[action.priority]}`}
            >
              {action.priority}
            </span>
            <ChevronRight
              size={16}
              className="text-gray-300 group-hover:text-brand-500 transition-colors shrink-0"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
