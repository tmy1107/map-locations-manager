
export interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  mapsUrl?: string;
}

export interface LocationList {
  id: string;
  name: string;
  icon: string;
  locations: Location[];
}

export interface SearchResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
  mapsUrl?: string;
}
