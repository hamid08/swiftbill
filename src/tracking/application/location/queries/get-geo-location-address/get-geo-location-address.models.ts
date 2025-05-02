export class NeshanReverseResponse {
    status: string;
    neighbourhood: string | null;
    municipality_zone: string;
    state: string;
    city: string;
    in_traffic_zone: boolean;
    in_odd_even_zone: boolean;
    route_name: string;
    route_type: string;
    place: string | null;
    district: string;
    formatted_address: string;
    village: string | null;
    county: string;
}

export class GeoLocationAddressResponse {
    address: string;
    latitude: number;
    longitude: number;
}