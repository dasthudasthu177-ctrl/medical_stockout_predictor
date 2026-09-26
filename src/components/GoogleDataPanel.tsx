import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  ExternalLink,
  RefreshCw,
  Sparkles,
  CloudRain,
  ShieldCheck,
  Building,
  Navigation,
  Globe,
  Radio,
} from 'lucide-react';
import { GroundingSource, MapPlace } from '../types';

export const GoogleDataPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'maps'>('search');

  // Search Grounding State
  const [searchQuery, setSearchQuery] = useState(
    'Tamil Nadu Chennai dengue fever monsoon outbreak medicine supply health advisory latest news'
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchReport, setSearchReport] = useState<string>('');
  const [searchSources, setSearchSources] = useState<GroundingSource[]>([]);

  // Maps Grounding State
  const [mapsQuery, setMapsQuery] = useState(
    'Government primary health centres, drug warehouses, and hospitals in Chennai'
  );
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsReport, setMapsReport] = useState<string>('');
  const [mapPlaces, setMapPlaces] = useState<MapPlace[]>([]);

  // Fetch Search Grounding
  const fetchSearchGrounding = async (queryText?: string) => {
    setSearchLoading(true);
    try {
      const res = await fetch('/api/gemini/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText || searchQuery }),
      });
      const data = await res.json();
      setSearchReport(data.text || '');
      setSearchSources(data.sources || []);
    } catch (err) {
      console.error('Failed to fetch search grounding:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Fetch Maps Grounding
  const fetchMapsGrounding = async (queryText?: string) => {
    setMapsLoading(true);
    try {
      const res = await fetch('/api/gemini/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText || mapsQuery,
          latitude: 13.0827,
          longitude: 80.2707,
        }),
      });
      const data = await res.json();
      setMapsReport(data.text || '');
      setMapPlaces(data.places || []);
    } catch (err) {
      console.error('Failed to fetch maps grounding:', err);
    } finally {
      setMapsLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchGrounding();
    fetchMapsGrounding();
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Real-World Data from Google
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              Live Google Search & Maps Grounding
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Grounded in real-time web intelligence and Google Maps geospatial verified sources.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'search'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Google Search Outbreak Data</span>
          </button>
          <button
            onClick={() => setActiveTab('maps')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'maps'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Google Maps Facilities</span>
          </button>
        </div>
      </div>

      {/* TAB 1: GOOGLE SEARCH GROUNDING */}
      {activeTab === 'search' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Search Input Bar */}
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
            <Search className="w-4 h-4 text-cyan-400 ml-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchSearchGrounding(searchQuery)}
              placeholder="Search real-time disease outbreaks, rainfall alerts, medicine supply news..."
              className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none px-2"
            />
            <button
              onClick={() => fetchSearchGrounding(searchQuery)}
              disabled={searchLoading}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${searchLoading ? 'animate-spin' : ''}`} />
              <span>{searchLoading ? 'Querying...' : 'Fetch Live Data'}</span>
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 text-[11px]">Recommended Topics:</span>
            {[
              'Chennai monsoon rain dengue spike',
              'Tamil Nadu primary health centre medicine availability',
              'Viral fever outpatient footfall Chennai hospitals',
              'TNMSC drug warehouse supply updates',
            ].map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setSearchQuery(topic);
                  fetchSearchGrounding(topic);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors cursor-pointer"
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Search Result Canvas */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
            {searchLoading ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-slate-400">
                  Retrieving live web articles & public health reports via Google Search Grounding...
                </p>
              </div>
            ) : (
              <>
                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {searchReport}
                </div>

                {/* Grounding Source Web Links */}
                {searchSources.length > 0 && (
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Verified Google Search Grounding Sources ({searchSources.length})</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {searchSources.map((source, i) => (
                        <a
                          key={i}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all flex items-center justify-between text-xs group"
                        >
                          <span className="truncate pr-2 text-[11px] font-medium">
                            {source.title || source.uri}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE MAPS GROUNDING */}
      {activeTab === 'maps' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Maps Input Bar */}
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
            <MapPin className="w-4 h-4 text-emerald-400 ml-2 shrink-0" />
            <input
              type="text"
              value={mapsQuery}
              onChange={(e) => setMapsQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchMapsGrounding(mapsQuery)}
              placeholder="Find real healthcare facilities, primary health centres, drug depots..."
              className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none px-2"
            />
            <button
              onClick={() => fetchMapsGrounding(mapsQuery)}
              disabled={mapsLoading}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${mapsLoading ? 'animate-spin' : ''}`} />
              <span>{mapsLoading ? 'Searching...' : 'Search Google Maps'}</span>
            </button>
          </div>

          {/* Maps Result Canvas */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
            {mapsLoading ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-slate-400">
                  Grounding geospatial places & facilities via Google Maps Grounding...
                </p>
              </div>
            ) : (
              <>
                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {mapsReport}
                </div>

                {/* Verified Google Maps Places */}
                {mapPlaces.length > 0 && (
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Verified Google Maps Place Links ({mapPlaces.length})</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mapPlaces.map((place, i) => (
                        <a
                          key={i}
                          href={place.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-all flex items-start justify-between text-xs group"
                        >
                          <div className="space-y-0.5 pr-2">
                            <div className="font-semibold text-white">{place.title}</div>
                            <div className="text-[11px] text-slate-400">{place.address}</div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
