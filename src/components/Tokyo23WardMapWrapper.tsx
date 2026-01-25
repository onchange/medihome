'use client'

import dynamic from 'next/dynamic'
import type { District } from '@/types'

const Tokyo23WardMap = dynamic(() => import('./Tokyo23WardMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <span className="text-gray-500">地図を読み込み中...</span>
    </div>
  ),
})

interface Props {
  districts: District[]
  className?: string
}

export default function Tokyo23WardMapWrapper({ districts, className }: Props) {
  return <Tokyo23WardMap districts={districts} className={className} />
}
