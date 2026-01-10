'use client'

import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { MedicalFacility } from '@/types'

interface MapViewProps {
  facilities: MedicalFacility[]
  center?: [number, number]
  zoom?: number
  className?: string
}

const FACILITY_TYPE_COLORS: Record<string, string> = {
  '病院': '#EF4444',
  '診療所': '#3B82F6',
  '歯科診療所': '#10B981',
  '助産所': '#F59E0B',
  '薬局': '#8B5CF6',
}

const FACILITY_TYPE_LABELS: Record<string, string> = {
  '病院': '病院',
  '診療所': '診療所',
  '歯科診療所': '歯科',
  '助産所': '助産所',
  '薬局': '薬局',
}

function createCustomIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6],
  })
}

function FitBounds({ facilities }: { facilities: MedicalFacility[] }) {
  const map = useMap()

  useEffect(() => {
    if (facilities.length > 0) {
      const bounds = L.latLngBounds(
        facilities.map((f) => [f.latitude, f.longitude] as [number, number])
      )
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 14,
      })
    }
  }, [facilities, map])

  return null
}

export default function MapView({ facilities, center, zoom = 13, className = '' }: MapViewProps) {
  const defaultCenter: [number, number] = center || [35.6544, 139.9007]

  const markers = useMemo(
    () =>
      facilities.map((facility) => {
        const color = FACILITY_TYPE_COLORS[facility.facilityType] || '#6B7280'
        const icon = createCustomIcon(color)

        return (
          <Marker
            key={facility.id}
            position={[facility.latitude, facility.longitude]}
            icon={icon}
          >
            <Popup maxWidth={300}>
              <div className="p-2 min-w-[200px]">
                <div className="font-bold text-sm mb-1">{facility.name}</div>
                <div className="text-xs text-gray-600 mb-2">
                  <span
                    className="inline-block px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${color}20`, color: color }}
                  >
                    {FACILITY_TYPE_LABELS[facility.facilityType] || facility.facilityType}
                  </span>
                </div>
                {facility.address && (
                  <div className="text-xs text-gray-700 mb-1">📍 {facility.address}</div>
                )}
                {facility.phone && (
                  <div className="text-xs text-gray-700 mb-1">📞 {facility.phone}</div>
                )}
                {facility.departments && facility.departments.length > 0 && (
                  <div className="text-xs text-gray-700 mb-1">
                    🏥 {facility.departments.slice(0, 3).join('、')}
                    {facility.departments.length > 3 ? ' ほか' : ''}
                  </div>
                )}
                {facility.website && (
                  <a
                    href={facility.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 block"
                  >
                    🔗 公式サイト
                  </a>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    facility.name + ' ' + (facility.address || facility.districtName)
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 block"
                >
                  🗺️ Google Mapsで開く
                </a>
              </div>
            </Popup>
          </Marker>
        )
      }),
    [facilities]
  )

  return (
    <div className="relative">
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        className={`rounded-lg z-0 ${className}`}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers}
        {!center && <FitBounds facilities={facilities} />}
      </MapContainer>

      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg text-xs z-[1000]">
        <div className="font-bold mb-2">施設タイプ</div>
        {Object.entries(FACILITY_TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full border-2 border-white"
              style={{ backgroundColor: color, boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
            />
            <span>{FACILITY_TYPE_LABELS[type]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
