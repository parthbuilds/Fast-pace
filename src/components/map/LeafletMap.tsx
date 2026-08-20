'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ExternalLink, Phone, Globe, Sparkles, Navigation } from 'lucide-react';

interface MapMarkerBusiness {
  id?: string;
  osmId?: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  distanceKm?: number | null;
  phone?: string | null;
  website?: string | null;
  leadScore?: number;
  opportunityScore?: number;
  leadId?: string;
}

interface Props {
  centerLat: number;
  centerLon: number;
  radiusKm: number;
  businesses: MapMarkerBusiness[];
  height?: string;
}

export default function LeafletMap({
  centerLat,
  centerLon,
  radiusKm,
  businesses,
  height = '500px',
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      // Fix default Leaflet icon paths in Next.js bundle
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLon],
        zoom: radiusKm <= 2 ? 15 : radiusKm <= 5 ? 14 : 13,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Dark theme OpenStreetMap CartoDB tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Center Search Marker (Glowing Blue)
      const centerIcon = L.divIcon({
        className: 'custom-center-marker',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: #3b82f6;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 6px; height: 6px; background: #ffffff; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([centerLat, centerLon], { icon: centerIcon })
        .addTo(map)
        .bindPopup('<b style="color:#0f172a">Search Center Location</b>');

      // Search Radius Circle
      L.circle([centerLat, centerLon], {
        radius: radiusKm * 1000,
        color: '#3b82f6',
        weight: 1.5,
        opacity: 0.8,
        fillColor: '#3b82f6',
        fillOpacity: 0.08,
      }).addTo(map);

      // Business Markers
      businesses.forEach((biz) => {
        const isHighOpportunity = (biz.opportunityScore || 50) >= 80;
        const markerColor = isHighOpportunity ? '#f43f5e' : '#3b82f6';

        const bizIcon = L.divIcon({
          className: 'custom-biz-marker',
          html: `
            <div style="
              width: 18px;
              height: 18px;
              background: ${markerColor};
              border: 2px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.5);
            "></div>
          `,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const leadLink = biz.leadId
          ? `<a href="/leads/${biz.leadId}" style="display:inline-block; margin-top:8px; padding:4px 10px; background:#2563eb; color:#ffffff !important; border-radius:6px; font-size:11px; font-weight:600; text-decoration:none;">View Lead 360 &rarr;</a>`
          : '';

        const popupHtml = `
          <div style="font-family: system-ui; min-width: 190px; color: #f8fafc;">
            <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 2px;">
              ${biz.name}
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
              ${biz.category} ${biz.distanceKm !== undefined && biz.distanceKm !== null ? `• ${biz.distanceKm} km` : ''}
            </div>

            <div style="display:flex; gap:6px; margin-bottom:6px;">
              <span style="font-size:10px; padding:2px 6px; background:rgba(59,130,246,0.2); color:#60a5fa; border-radius:4px; border:1px solid rgba(59,130,246,0.4);">
                Lead ${biz.leadScore || 50}
              </span>
              <span style="font-size:10px; padding:2px 6px; background:rgba(244,63,94,0.2); color:#fb7185; border-radius:4px; border:1px solid rgba(244,63,94,0.4);">
                Opp ${biz.opportunityScore || 50}
              </span>
            </div>

            ${
              biz.phone
                ? `<div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">📞 ${biz.phone}</div>`
                : `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">No phone listed</div>`
            }

            ${
              biz.website
                ? `<div style="font-size: 11px; color: #38bdf8; margin-top: 2px;"><a href="${biz.website}" target="_blank" rel="noreferrer" style="color:#38bdf8 !important;">🌐 Visit Website</a></div>`
                : `<div style="font-size: 11px; color: #fb7185; margin-top: 2px;">⚠️ No Website</div>`
            }

            ${leadLink}
          </div>
        `;

        L.marker([biz.latitude, biz.longitude], { icon: bizIcon })
          .addTo(map)
          .bindPopup(popupHtml);
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerLat, centerLon, radiusKm, businesses]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className="rounded-xl overflow-hidden border border-slate-800 shadow-xl"
    />
  );
}
