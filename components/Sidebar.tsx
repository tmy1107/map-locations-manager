
import React, { useState } from 'react';
import { LocationList, Location } from '../types';

interface SidebarProps {
  lists: LocationList[];
  activeListId: string | null;
  onSelectList: (id: string) => void;
  onAddList: (name: string, icon: string) => void;
  onEditList: (id: string, name: string, icon: string) => void;
  onRemoveList: (id: string) => void;
  onAddLocation: (listId: string) => void;
  onRemoveLocation: (listId: string, locationId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  lists,
  activeListId,
  onSelectList,
  onAddList,
  onEditList,
  onRemoveList,
  onAddLocation,
  onRemoveLocation
}) => {
  const [newListName, setNewListName] = useState('');
  const [newListIcon, setNewListIcon] = useState('📍');
  const [isAdding, setIsAdding] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      onAddList(newListName.trim(), newListIcon);
      setNewListName('');
      setIsAdding(false);
    }
  };

  const startEditing = (list: LocationList) => {
    setEditingListId(list.id);
    setEditName(list.name);
    setEditIcon(list.icon);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingListId && editName.trim()) {
      onEditList(editingListId, editName.trim(), editIcon);
      setEditingListId(null);
    }
  };

  const icons = ['📍', '⭐', '🏠', '✈️', '🍔', '🌳', '🏢', '🏛️', '⛰️', '🏖️', '🍿', '🚲'];

  return (
    <div className="w-full md:w-80 h-full bg-white border-r border-slate-200 flex flex-col shadow-lg z-20 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="text-blue-600">🗺️</span> Global Explorer
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage your custom places</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">My Lists</h2>
          <button 
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingListId(null);
            }}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded transition-colors"
          >
            {isAdding ? 'Cancel' : '+ New List'}
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddSubmit} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2">
            <input
              autoFocus
              type="text"
              placeholder="List name..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {icons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setNewListIcon(icon)}
                  className={`p-1.5 rounded transition-all ${newListIcon === icon ? 'bg-blue-600 scale-110' : 'hover:bg-slate-200 bg-white border border-slate-100'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Create List
            </button>
          </form>
        )}

        <div className="space-y-1">
          {lists.map(list => (
            <div key={list.id} className="group">
              {editingListId === list.id ? (
                <form onSubmit={handleEditSubmit} className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-3 mb-2 animate-in fade-in zoom-in-95">
                  <input
                    autoFocus
                    type="text"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    {icons.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setEditIcon(icon)}
                        className={`p-1.5 rounded transition-all ${editIcon === icon ? 'bg-blue-600 scale-110' : 'hover:bg-slate-200 bg-white border border-slate-100'}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingListId(null)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-md text-xs font-medium hover:bg-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onSelectList(list.id);
                      setEditingListId(null);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                      activeListId === list.id 
                        ? 'bg-blue-50 text-blue-700 shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{list.icon}</span>
                    <span className="flex-1 font-medium truncate">{list.name}</span>
                    <span className="text-xs text-slate-400 bg-slate-100 group-hover:bg-white px-1.5 py-0.5 rounded-full">
                      {list.locations.length}
                    </span>
                  </button>
                  {activeListId === list.id && (
                    <div className="mt-2 ml-4 pl-4 border-l-2 border-blue-100 space-y-1 animate-in fade-in">
                      {list.locations.length === 0 ? (
                        <p className="text-xs text-slate-400 py-2 italic">No locations added yet.</p>
                      ) : (
                        list.locations.map(loc => (
                          <div key={loc.id} className="group/loc flex items-center justify-between py-1.5 text-sm">
                            <span className="text-slate-700 truncate mr-2" title={loc.address}>{loc.name}</span>
                            <button 
                              onClick={() => onRemoveLocation(list.id, loc.id)}
                              className="opacity-0 group-hover/loc:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))
                      )}
                      <button 
                        onClick={() => onAddLocation(list.id)}
                        className="flex items-center gap-2 w-full text-xs text-blue-600 hover:text-blue-700 font-semibold py-2"
                      >
                        <span>+ Add Location</span>
                      </button>
                      <div className="flex gap-3 pt-1 border-t border-slate-50 mt-1">
                        <button 
                          onClick={() => startEditing(list)}
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-600 uppercase tracking-wider font-semibold"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit Info
                        </button>
                        <button 
                          onClick={() => onRemoveList(list.id)}
                          className="flex items-center gap-1 text-[10px] text-red-300 hover:text-red-600 uppercase tracking-wider font-semibold"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-slate-50 text-[10px] text-slate-400 text-center uppercase tracking-widest border-t border-slate-100">
        Powered by Gemini & Google Maps
      </div>
    </div>
  );
};

export default Sidebar;
