
import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import SearchModal from './components/SearchModal';
import { LocationList, Location, SearchResult } from './types';

const STORAGE_KEY = 'global_explorer_data';

const App: React.FC = () => {
  const [lists, setLists] = useState<LocationList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLists(parsed);
        if (parsed.length > 0) setActiveListId(parsed[0].id);
      } catch (e) {
        console.error("Failed to load saved data");
      }
    } else {
      // Default demo list
      const demoList: LocationList = {
        id: 'default-1',
        name: 'Wonders of the World',
        icon: '🏛️',
        locations: [
          { id: 'loc-1', name: 'Great Wall of China', address: 'China', lat: 40.4319, lng: 116.5704 },
          { id: 'loc-2', name: 'Petra', address: 'Jordan', lat: 30.3285, lng: 35.4444 },
          { id: 'loc-3', name: 'Colosseum', address: 'Rome, Italy', lat: 41.8902, lng: 12.4922 },
          { id: 'loc-4', name: 'Machu Picchu', address: 'Peru', lat: -13.1631, lng: -72.5450 },
          { id: 'loc-5', name: 'Taj Mahal', address: 'Agra, India', lat: 27.1751, lng: 78.0421 },
        ]
      };
      setLists([demoList]);
      setActiveListId(demoList.id);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    }
  }, [lists, isInitialized]);

  const handleAddList = (name: string, icon: string) => {
    const newList: LocationList = {
      id: crypto.randomUUID(),
      name,
      icon,
      locations: []
    };
    setLists(prev => [...prev, newList]);
    setActiveListId(newList.id);
  };

  const handleEditList = (id: string, name: string, icon: string) => {
    setLists(prev => prev.map(list => 
      list.id === id ? { ...list, name, icon } : list
    ));
  };

  const handleRemoveList = (id: string) => {
    setLists(prev => prev.filter(l => l.id !== id));
    if (activeListId === id) setActiveListId(null);
  };

  const handleAddLocation = (listId: string) => {
    setActiveListId(listId);
    setIsSearchOpen(true);
  };

  const handleConfirmLocation = (result: SearchResult) => {
    if (!activeListId) return;

    const newLocation: Location = {
      id: crypto.randomUUID(),
      ...result
    };

    setLists(prev => prev.map(list => {
      if (list.id === activeListId) {
        return {
          ...list,
          locations: [...list.locations, newLocation]
        };
      }
      return list;
    }));
    
    setIsSearchOpen(false);
  };

  const handleRemoveLocation = (listId: string, locationId: string) => {
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          locations: list.locations.filter(loc => loc.id !== locationId)
        };
      }
      return list;
    }));
  };

  const activeList = lists.find(l => l.id === activeListId);
  const activeLocations = activeList ? activeList.locations : [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      <Sidebar
        lists={lists}
        activeListId={activeListId}
        onSelectList={setActiveListId}
        onAddList={handleAddList}
        onEditList={handleEditList}
        onRemoveList={handleRemoveList}
        onAddLocation={handleAddLocation}
        onRemoveLocation={handleRemoveLocation}
      />
      
      <main className="flex-1 relative">
        <Map locations={activeLocations} />
        
        {/* Floating Add Button for Mobile/Convenience */}
        <button
          onClick={() => activeListId && setIsSearchOpen(true)}
          disabled={!activeListId}
          className="absolute bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-blue-700 hover:scale-105 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed z-30"
          title="Add location to active list"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {!activeListId && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 pointer-events-none">
            <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow-xl border border-white/50 text-center max-w-xs animate-in zoom-in-90">
              <span className="text-4xl block mb-2">👋</span>
              <h3 className="text-lg font-bold text-slate-800">Welcome!</h3>
              <p className="text-slate-600 text-sm mt-1">Select or create a list in the sidebar to start mapping your favorite places.</p>
            </div>
          </div>
        )}
      </main>

      {isSearchOpen && (
        <SearchModal 
          onClose={() => setIsSearchOpen(false)} 
          onAdd={handleConfirmLocation}
        />
      )}
    </div>
  );
};

export default App;
