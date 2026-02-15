'use client'

import Link from 'next/link'
import {
  LayoutDashboard,
  Cloud,
  Users,
  Award,
  FileBarChart,
  Settings,
  Leaf,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Carbon', href: '/dashboard', icon: Cloud },
  { label: 'Suppliers', href: '/dashboard', icon: Users },
  { label: 'Certifications', href: '/dashboard', icon: Award },
  { label: 'Reports', href: '/dashboard', icon: FileBarChart },
  { label: 'Settings', href: '/dashboard', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-800">
        <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
          <Leaf size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">SustainOS</h1>
          <p className="text-[11px] text-gray-400 -mt-0.5">Sustainability Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.label === 'Dashboard'
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-semibold">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-gray-200">Admin User</p>
            <p className="text-xs text-gray-500">admin@sustainos.io</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
