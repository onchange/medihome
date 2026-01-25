'use client'

import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { District } from '@/types'
import { getScoreHexColor } from '@/lib/score-utils'

interface Tokyo23WardMapProps {
  districts: District[]
  className?: string
}

interface TokyoGeoJSON {
  type: 'FeatureCollection'
  features: {
    type: 'Feature'
    properties: {
      N03_001: string
      N03_004: string
      N03_007: string
    }
    geometry: {
      type: 'Polygon' | 'MultiPolygon'
      coordinates: number[][][]
    }
  }[]
}

const TOKYO_23_WARD_CODES = [
  '13101', '13102', '13103', '13104', '13105', '13106', '13107', '13108',
  '13109', '13110', '13111', '13112', '13113', '13114', '13115', '13116',
  '13117', '13118', '13119', '13120', '13121', '13122', '13123'
]

const GEOJSON_URL = 'https://raw.githubusercontent.com/smartnews-smri/japan-topography/main/data/municipality/geojson/s0010/N03-21_13_210101.json'

function FitBoundsToTokyo() {
  const map = useMap()

  useEffect(() => {
    const bounds = L.latLngBounds(
      [35.53, 139.55],
      [35.82, 139.92]
    )
    map.fitBounds(bounds, { padding: [10, 10] })
  }, [map])

  return null
}

export default function Tokyo23WardMap({ districts, className = '' }: Tokyo23WardMapProps) {
  const [geoData, setGeoData] = useState<TokyoGeoJSON | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch GeoJSON')
        return res.json()
      })
      .then((data: TokyoGeoJSON) => {
        const tokyo23 = {
          ...data,
          features: data.features.filter(f =>
            TOKYO_23_WARD_CODES.includes(f.properties.N03_007)
          )
        }
        setGeoData(tokyo23)
        setLoading(false)
      })
      .catch(err => {
        console.error('GeoJSON fetch error:', err)
        setError('地図データの読み込みに失敗しました')
        setLoading(false)
      })
  }, [])

  const getDistrictScore = useCallback((wardName: string): number => {
    const district = districts.find(d => d.districtName === wardName)
    return district?.overallScore || 0
  }, [districts])

  const styleFeature = useCallback((feature: GeoJSON.Feature | undefined) => {
    if (!feature?.properties) {
      return { fillColor: '#9ca3af', weight: 1, opacity: 1, color: '#6b7280', fillOpacity: 0.5 }
    }
    const wardName = (feature.properties as { N03_004?: string }).N03_004
    const score = wardName ? getDistrictScore(wardName) : 0
    return {
      fillColor: getScoreHexColor(score),
      weight: 2,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: 0.7,
    }
  }, [getDistrictScore])

  const onEachFeature = useCallback((feature: GeoJSON.Feature, layer: L.Layer) => {
    const wardName = (feature.properties as { N03_004?: string })?.N03_004
    if (!wardName) return

    const district = districts.find(d => d.districtName === wardName)
    const score = district?.overallScore || 0

    layer.bindPopup(`
      <div style="min-width: 150px; padding: 4px;">
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${wardName}</div>
        <div style="font-size: 12px; color: #666;">
          総合スコア: <strong style="color: ${getScoreHexColor(score)};">${score}点</strong>
        </div>
        ${district ? `
          <div style="font-size: 11px; color: #888; margin-top: 4px;">
            病院: ${district.hospitalCount} / 診療所: ${district.clinicCount}
          </div>
        ` : ''}
        <a href="/search?district=${encodeURIComponent(wardName)}"
           style="display: block; margin-top: 8px; font-size: 12px; color: #2563eb;">
          詳細を見る →
        </a>
      </div>
    `)

    layer.on({
      mouseover: (e) => {
        const target = e.target as L.Path
        target.setStyle({
          weight: 3,
          color: '#1e40af',
          fillOpacity: 0.85,
        })
        target.bringToFront()
      },
      mouseout: (e) => {
        const target = e.target as L.Path
        target.setStyle(styleFeature(feature))
      },
    })
  }, [districts, styleFeature])

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ minHeight: '400px' }}>
        <div className="text-gray-500">地図を読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ minHeight: '400px' }}>
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="relative">
      <MapContainer
        center={[35.68, 139.76]}
        zoom={11}
        className={`rounded-lg z-0 ${className}`}
        scrollWheelZoom={true}
        style={{ minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoData && (
          <GeoJSON
            key={JSON.stringify(districts.map(d => d.overallScore))}
            data={geoData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
        <FitBoundsToTokyo />
      </MapContainer>

      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg text-xs z-[1000]">
        <div className="font-bold mb-2">医療アクセススコア</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded" style={{ backgroundColor: '#22c55e' }}></div>
            <span>80点以上</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded" style={{ backgroundColor: '#84cc16' }}></div>
            <span>60-79点</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded" style={{ backgroundColor: '#eab308' }}></div>
            <span>40-59点</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded" style={{ backgroundColor: '#f97316' }}></div>
            <span>20-39点</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <span>20点未満</span>
          </div>
        </div>
      </div>
    </div>
  )
}
