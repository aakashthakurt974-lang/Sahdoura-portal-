import React, { useState, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  MapCameraChangedEvent
} from '@vis.gl/react-google-maps';
import { DevelopmentWork } from '../types/index.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  MapPin,
  Layers,
  CheckCircle2,
  Clock,
  Building2,
  Lightbulb,
  Droplets,
  AlertCircle,
  Maximize2,
  Navigation
} from 'lucide-react';

interface PanchayatMapSectionProps {
  works: DevelopmentWork[];
  onReportLocation?: (locationName: string, latLng: { lat: number; lng: number }) => void;
}

// Saidoura Gram Panchayat default center coordinates
const SAIDOURA_CENTER = { lat: 30.3785, lng: 77.2285 };

interface MapMarkerItem {
  id: string;
  title: string;
  category: 'roads' | 'water' | 'lighting' | 'building' | 'office';
  status: string;
  cost: string;
  agency: string;
  description: string;
  position: { lat: number; lng: number };
}

export const PanchayatMapSection: React.FC<PanchayatMapSectionProps> = ({
  works,
  onReportLocation
}) => {
  const { t, language } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<MapMarkerItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDvUZXZw0hue4qvojuqp24vFRjxSoCgzPg';

  // Generate geographic points for development works & civic locations in Saidoura
  const markerItems = useMemo<MapMarkerItem[]>(() => {
    // 1. Panchayat Bhawan Anchor
    const items: MapMarkerItem[] = [
      {
        id: 'office_1',
        title: 'ग्राम पंचायत सचिवालय एवं भवन (Panchayat Bhawan)',
        category: 'office',
        status: 'सक्रिय',
        cost: '—',
        agency: 'ग्राम पंचायत सदौरा',
        description: 'मुख्य प्रशासनिक कार्यालय, सीएससी केंद्र व नागरिक सेवा काउंटर',
        position: { lat: 30.3785, lng: 77.2285 }
      },
      {
        id: 'csc_center',
        title: 'डिजिटल ग्राम सेवा केंद्र (CSC Saidoura)',
        category: 'office',
        status: 'सक्रिय',
        cost: '—',
        agency: 'डिजिटल इंडिया',
        description: 'ऑनलाइन प्रमाणपत्र, पेंशन व शिकायत पंजीकरण केंद्र',
        position: { lat: 30.3802, lng: 77.2298 }
      }
    ];

    // 2. Offsets for development works across village wards
    const offsets = [
      { lat: 0.0025, lng: -0.0035 },
      { lat: -0.0018, lng: 0.0042 },
      { lat: 0.0045, lng: 0.0015 },
      { lat: -0.0032, lng: -0.0022 },
      { lat: 0.0012, lng: 0.0055 },
      { lat: -0.004, lng: 0.003 },
      { lat: 0.0038, lng: -0.0048 }
    ];

    works.forEach((w, idx) => {
      const offset = offsets[idx % offsets.length];
      let cat: MapMarkerItem['category'] = 'roads';
      const name = (w.work_name || '').toLowerCase();
      if (name.includes('सोलर') || name.includes('लाइट') || name.includes('solar')) {
        cat = 'lighting';
      } else if (name.includes('जल') || name.includes('पानी') || name.includes('पंप') || name.includes('water')) {
        cat = 'water';
      } else if (name.includes('भवन') || name.includes('शाला') || name.includes('केंद्र') || name.includes('building')) {
        cat = 'building';
      }

      items.push({
        id: w.id || `work_${idx}`,
        title: w.work_name,
        category: cat,
        status: w.current_status || 'प्रगतिरत',
        cost: w.estimated_cost ? `₹${w.estimated_cost}` : '₹3.5 लाख',
        agency: w.executing_agency || 'ग्राम पंचायत कार्य समिति',
        description: w.description || w.location || 'ग्राम सदौरा अंतर्गत विकास कार्य',
        position: {
          lat: SAIDOURA_CENTER.lat + offset.lat,
          lng: SAIDOURA_CENTER.lng + offset.lng
        }
      });
    });

    return items;
  }, [works]);

  const filteredMarkers = useMemo(() => {
    if (categoryFilter === 'all') return markerItems;
    return markerItems.filter((item) => item.category === categoryFilter);
  }, [markerItems, categoryFilter]);

  const getPinColors = (category: string) => {
    switch (category) {
      case 'office':
        return { background: '#1e3a8a', glyphColor: '#ffffff', borderColor: '#172554' };
      case 'lighting':
        return { background: '#f59e0b', glyphColor: '#ffffff', borderColor: '#b45309' };
      case 'water':
        return { background: '#0284c7', glyphColor: '#ffffff', borderColor: '#0369a1' };
      case 'building':
        return { background: '#10b981', glyphColor: '#ffffff', borderColor: '#047857' };
      case 'roads':
      default:
        return { background: '#dc2626', glyphColor: '#ffffff', borderColor: '#991b1b' };
    }
  };

  return (
    <section id="panchayat-map" className="py-12 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'भू-स्थानिक मानचित्र' : 'Geographic Map'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {language === 'hi'
                ? 'सदौरा पंचायत विकास एवं बुनियादी ढांचा मानचित्र'
                : 'Saidoura Panchayat Infrastructure & Works Map'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {language === 'hi'
                ? 'Google Maps पर ग्राम पंचायत के सभी स्वीकृत, प्रगतिरत विकास कार्य, पंचायत भवन एवं जन-सुविधाएं लाइव देखें।'
                : 'Interactive Google Maps displaying ongoing development works, Panchayat Bhawan, and civic infrastructure in Saidoura.'}
            </p>
          </div>

          {/* Map Controls & Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-xs flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'hi' ? 'सभी स्थल' : 'All'}
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('office')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  categoryFilter === 'office'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'hi' ? 'पंचायत भवन' : 'Offices'}
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('roads')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  categoryFilter === 'roads'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'hi' ? 'सड़क व नाली' : 'Roads'}
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('water')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  categoryFilter === 'water'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'hi' ? 'पेयजल' : 'Water'}
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('lighting')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  categoryFilter === 'lighting'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'hi' ? 'सोलर लाइट' : 'Lighting'}
              </button>
            </div>

            {/* Map Mode Toggle */}
            <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-xs flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMapType('roadmap')}
                className={`px-2 py-1 text-xs rounded transition-all cursor-pointer ${
                  mapType === 'roadmap' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'hi' ? 'नक्शा' : 'Map'}
              </button>
              <button
                type="button"
                onClick={() => setMapType('hybrid')}
                className={`px-2 py-1 text-xs rounded transition-all cursor-pointer ${
                  mapType === 'hybrid' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'hi' ? 'सैटेलाइट' : 'Satellite'}
              </button>
            </div>
          </div>
        </div>

        {/* Map Container - Strict explicit CSS height to prevent CF2 */}
        <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-300 shadow-md bg-slate-100">
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={SAIDOURA_CENTER}
              defaultZoom={15}
              mapId="DEMO_MAP_ID"
              mapTypeId={mapType}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              gestureHandling="cooperative"
              className="w-full h-full"
              onClick={(e) => {
                if (e.detail?.latLng) {
                  setClickedLocation(e.detail.latLng);
                }
              }}
            >
              {/* Markers for development works and civic offices */}
              {filteredMarkers.map((marker) => {
                const colors = getPinColors(marker.category);
                return (
                  <AdvancedMarker
                    key={marker.id}
                    position={marker.position}
                    title={marker.title}
                    onClick={() => setSelectedItem(marker)}
                  >
                    <Pin
                      background={colors.background}
                      glyphColor={colors.glyphColor}
                      borderColor={colors.borderColor}
                      scale={1.1}
                    />
                  </AdvancedMarker>
                );
              })}

              {/* Clicked location marker for civic reporting */}
              {clickedLocation && (
                <AdvancedMarker position={clickedLocation} title="चयनित स्थल">
                  <Pin background="#8b5cf6" glyphColor="#ffffff" borderColor="#6d28d9" scale={1.2} />
                </AdvancedMarker>
              )}

              {/* Active Marker InfoWindow */}
              {selectedItem && (
                <InfoWindow
                  position={selectedItem.position}
                  onCloseClick={() => setSelectedItem(null)}
                >
                  <div className="p-2 max-w-xs text-slate-900">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800">
                        {selectedItem.category.toUpperCase()}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          selectedItem.status === 'पूर्ण'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {selectedItem.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {selectedItem.title}
                    </h4>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {selectedItem.description}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">लागत / बजट</span>
                        <span className="font-semibold text-slate-800">{selectedItem.cost}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">कार्य एजेंसी</span>
                        <span className="font-semibold text-slate-800 truncate block">
                          {selectedItem.agency}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedItem.position.lat},${selectedItem.position.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:text-blue-900 underline"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>दिशा-निर्देश (Directions)</span>
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>

          {/* Interactive Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md text-xs flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-700 text-[11px]">संकेतक (Legend):</span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-900 inline-block"></span> पंचायत सचिवालय
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> सड़क व नाली
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> सोलर लाइट
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span> पेयजल
            </span>
          </div>

          {/* Location Click Action Toast */}
          {clickedLocation && (
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-purple-200 shadow-lg text-xs max-w-xs animate-fade-in">
              <div className="font-semibold text-purple-900 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span>मानचित्र पर स्थान चुना गया</span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2">
                अक्षांश: {clickedLocation.lat.toFixed(4)}, देशांतर: {clickedLocation.lng.toFixed(4)}
              </p>
              {onReportLocation && (
                <button
                  type="button"
                  onClick={() => {
                    onReportLocation(
                      `मानचित्र स्थान (${clickedLocation.lat.toFixed(4)}, ${clickedLocation.lng.toFixed(4)})`,
                      clickedLocation
                    );
                    setClickedLocation(null);
                  }}
                  className="w-full py-1.5 px-2 bg-purple-700 text-white rounded-lg font-medium text-xs hover:bg-purple-800 transition-colors cursor-pointer"
                >
                  इस स्थान की शिकायत दर्ज करें
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
