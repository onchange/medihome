'use client'

import { useEffect, useState } from 'react'
import MapView from './MapView'
import type { MedicalFacility } from '@/types'

interface FacilityMapSectionProps {
  district: string
}

export default function FacilityMapSection({ district }: FacilityMapSectionProps) {
  const [facilities, setFacilities] = useState<MedicalFacility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFacilities() {
      try {
        setLoading(true)
        const response = await fetch(`/api/facilities/${encodeURIComponent(district)}`)
        if (!response.ok) {
          throw new Error('医療施設データの取得に失敗しました')
        }
        const data = await response.json()
        setFacilities(data)
      } catch (err) {
        console.error('Error fetching facilities:', err)
        setError(err instanceof Error ? err.message : '不明なエラー')
      } finally {
        setLoading(false)
      }
    }

    fetchFacilities()
  }, [district])

  if (loading) {
    return (
      <section className="bg-white rounded-lg shadow p-6" aria-labelledby="map-heading">
        <h3 id="map-heading" className="text-xl font-bold mb-4">
          周辺の医療施設マップ
        </h3>
        <div className="h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">地図を読み込み中...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="bg-white rounded-lg shadow p-6" aria-labelledby="map-heading">
        <h3 id="map-heading" className="text-xl font-bold mb-4">
          周辺の医療施設マップ
        </h3>
        <div className="h-[500px] bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white rounded-lg shadow p-6" aria-labelledby="map-heading">
      <h3 id="map-heading" className="text-xl font-bold mb-4">
        周辺の医療施設マップ
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        マーカーをクリックすると施設の詳細が表示されます（全{facilities.length}件）
      </p>
      <MapView facilities={facilities} className="h-[500px]" districtName={district} />
    </section>
  )
}
