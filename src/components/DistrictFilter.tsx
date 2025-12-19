'use client'

import { useState } from 'react'
import Link from 'next/link'
import { District } from '@/types'

type FilterType = 'overall' | 'childcare' | 'elderly' | 'general'

interface FilterOption {
  key: FilterType
  label: string
  description: string
  color: string
}

const filterOptions: FilterOption[] = [
  { key: 'overall', label: '総合', description: 'バランス重視', color: 'blue' },
  { key: 'childcare', label: '子育て', description: '小児科・産婦人科', color: 'pink' },
  { key: 'elderly', label: '高齢者', description: '循環器・整形外科', color: 'purple' },
  { key: 'general', label: '一般医療', description: '内科・歯科', color: 'teal' },
]

function getScoreByFilter(district: District, filter: FilterType): number {
  switch (filter) {
    case 'childcare':
      return district.childcareScore
    case 'elderly':
      return district.elderlyScore
    case 'general':
      return district.generalScore
    default:
      return district.overallScore
  }
}

function getColorClass(filter: FilterType): string {
  switch (filter) {
    case 'childcare':
      return 'text-pink-600'
    case 'elderly':
      return 'text-purple-600'
    case 'general':
      return 'text-teal-600'
    default:
      return 'text-blue-600'
  }
}

function getBorderClass(filter: FilterType): string {
  switch (filter) {
    case 'childcare':
      return 'hover:border-pink-500'
    case 'elderly':
      return 'hover:border-purple-500'
    case 'general':
      return 'hover:border-teal-500'
    default:
      return 'hover:border-blue-500'
  }
}

export default function DistrictFilter({ districts }: { districts: District[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('overall')

  const sortedDistricts = [...districts].sort(
    (a, b) => getScoreByFilter(b, activeFilter) - getScoreByFilter(a, activeFilter)
  )

  const maxScore = Math.max(...districts.map((d) => getScoreByFilter(d, activeFilter)))
  const minScore = Math.min(...districts.map((d) => getScoreByFilter(d, activeFilter)))

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">地区を選択</h2>

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3">重視するポイントで並び替え：</p>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setActiveFilter(option.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === option.key
                  ? option.key === 'childcare'
                    ? 'bg-pink-600 text-white'
                    : option.key === 'elderly'
                      ? 'bg-purple-600 text-white'
                      : option.key === 'general'
                        ? 'bg-teal-600 text-white'
                        : 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={activeFilter === option.key}
            >
              {option.label}
              <span className="hidden sm:inline text-xs ml-1 opacity-80">({option.description})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
        <p className="text-gray-600">
          <span className="font-medium">スコア基準：</span>
          {activeFilter === 'overall' && '子育て・高齢者・一般の3カテゴリの平均値'}
          {activeFilter === 'childcare' && '小児科の数、夜間対応、産婦人科・助産所の有無など'}
          {activeFilter === 'elderly' && '循環器内科、整形外科、リハビリ科、訪問診療の有無など'}
          {activeFilter === 'general' && '内科の数、診療科の多様性、歯科・薬局の充実度など'}
        </p>
        <p className="text-gray-500 mt-1">
          浦安市内での相対評価：最高 {maxScore}点 / 最低 {minScore}点
        </p>
      </div>

      {districts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>地区データを読み込めませんでした</p>
          <p className="text-sm mt-2">しばらくしてから再度お試しください</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedDistricts.map((district, index) => {
            const score = getScoreByFilter(district, activeFilter)
            const isTop3 = index < 3

            return (
              <Link
                key={district.id}
                href={`/search?district=${encodeURIComponent(district.districtName)}`}
                className={`block p-4 border rounded transition-colors ${getBorderClass(activeFilter)} ${
                  isTop3 ? 'ring-2 ring-offset-1 ' + (activeFilter === 'childcare' ? 'ring-pink-200' : activeFilter === 'elderly' ? 'ring-purple-200' : activeFilter === 'general' ? 'ring-teal-200' : 'ring-blue-200') : ''
                }`}
                aria-label={`${district.districtName}エリアを見る。${activeFilter === 'overall' ? '総合' : activeFilter === 'childcare' ? '子育て' : activeFilter === 'elderly' ? '高齢者' : '一般医療'}スコア${score}点`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">{district.districtName}</span>
                  {isTop3 && (
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                      TOP {index + 1}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {activeFilter === 'overall' ? '総合' : activeFilter === 'childcare' ? '子育て' : activeFilter === 'elderly' ? '高齢者' : '一般医療'}スコア:{' '}
                  <span className={`font-bold ${getColorClass(activeFilter)}`}>{score}点</span>
                </div>
                {activeFilter !== 'overall' && (
                  <div className="text-xs text-gray-400 mt-1">総合: {district.overallScore}点</div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
