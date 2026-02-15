'use client'

const pillars = [
  { label: 'Environment', value: 82, color: 'bg-green-500' },
  { label: 'Social', value: 65, color: 'bg-blue-500' },
  { label: 'Governance', value: 74, color: 'bg-purple-500' },
  { label: 'Supply Chain', value: 58, color: 'bg-amber-500' },
  { label: 'Circularity', value: 47, color: 'bg-teal-500' },
]

export default function Graph() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Sustainability Pillar Breakdown</h3>
          <p className="text-sm text-gray-500 mt-0.5">Score across key ESG dimensions</p>
        </div>
        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
          Q4 2025
        </span>
      </div>

      <div className="space-y-4">
        {pillars.map((pillar) => (
          <div key={pillar.label} className="flex items-center gap-4">
            <span className="w-28 text-sm font-medium text-gray-600 shrink-0">
              {pillar.label}
            </span>
            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${pillar.color} transition-all duration-700`}
                style={{ width: `${pillar.value}%` }}
              />
            </div>
            <span className="w-10 text-sm font-semibold text-gray-700 text-right">
              {pillar.value}%
            </span>
          </div>
        ))}
      </div>

      {/* Mini legend */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-6 flex-wrap">
        {pillars.map((pillar) => (
          <div key={pillar.label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${pillar.color}`} />
            <span className="text-xs text-gray-500">{pillar.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
