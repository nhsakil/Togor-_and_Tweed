import { LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: 'indigo' | 'green' | 'blue' | 'purple' | 'yellow' | 'red'
}

const colorMap: Record<string, { bg: string; text: string }> = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
  red: { bg: 'bg-red-50', text: 'text-red-600' },
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
}: Props) {
  const colors = colorMap[color] ?? colorMap.indigo

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 ${colors.bg} rounded-full`}>
          <Icon className={`h-6 w-6 ${colors.text}`} />
        </div>
      </div>
    </div>
  )
}
