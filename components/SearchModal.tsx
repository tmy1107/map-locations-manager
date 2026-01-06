
import React, { useState, useEffect } from 'react';
import { searchLocations } from '../services/geminiService';
import { SearchResult } from '../types';

interface SearchModalProps {
  onClose: () => void;
  onAdd: (result: SearchResult) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ onClose, onAdd }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userLoc, setUserLoc] = useState<{ latitude: number, longitude: number } | undefined>();
  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => console.log("Location access denied", err)
    );
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSources([]);

    try {
      const { results, sources: groundingSources } = await searchLocations(query, userLoc);
      if (results && results.length > 0) {
        setResult(results[0]);
        setSources(groundingSources);
      } else {
        setError("Location not found. Try being more specific.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to search for location.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Add Location</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              autoFocus
              type="text"
              placeholder="e.g. Eiffel Tower, Paris"
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Search'}
            </button>
          </form>

          <div className="mt-6 min-h-[120px]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                <p className="animate-pulse">Finding precisely on the map...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {result && (
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-4 animate-in slide-in-from-bottom-2">
                <div>
                  <h4 className="font-bold text-slate-800">{result.name}</h4>
                  <p className="text-sm text-slate-500">{result.address}</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">
                    {result.lat.toFixed(4)}, {result.lng.toFixed(4)}
                  </p>
                </div>

                {sources.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Verification Sources</p>
                    {sources.map((s, i) => s.maps?.uri && (
                      <a 
                        key={i} 
                        href={s.maps.uri} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        {s.maps.title || 'Google Maps Link'}
                      </a>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => onAdd(result)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-[0.98]"
                >
                  Add to List
                </button>
              </div>
            )}

            {!result && !isLoading && !error && (
              <div className="text-center text-slate-400 py-4">
                <p className="text-sm">Enter a location name or landmark above</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
