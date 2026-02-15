'use client'

import Link from 'next/link'
import { Leaf, ArrowRight, BarChart3, ShieldCheck, Recycle } from 'lucide-react'

const features = [
  {
    icon: <BarChart3 size={24} />,
    title: 'ESG Analytics',
    description: 'Track carbon emissions, water usage, and social impact metrics in real time.',
  },
  {
    icon: <ShieldCheck size={24} />,
    title: 'Supplier Compliance',
    description: 'Monitor supplier adherence to labor, environmental, and governance standards.',
  },
  {
    icon: <Recycle size={24} />,
    title: 'Circularity Tracking',
    description: 'Measure recycled material usage and progress toward zero-waste goals.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">SustainOS</span>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            Go to Dashboard &rarr;
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 bg-brand-50 px-4 py-1.5 rounded-full mb-6">
          <Leaf size={14} />
          Sustainability management for modern businesses
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight max-w-3xl mx-auto">
          The operating system for{' '}
          <span className="text-brand-600">sustainable business</span>
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Track ESG performance, manage supplier compliance, and hit certification targets —
          all from a single dashboard built for sustainability teams.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition-colors"
          >
            View Demo Dashboard
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-xs text-gray-400">
          &copy; 2026 SustainOS. Built with Next.js, Tailwind CSS &amp; TypeScript.
        </div>
      </footer>
    </div>
  )
}
