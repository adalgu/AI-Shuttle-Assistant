import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from 'react-leaflet';
import { LatLngTuple, Icon, DivIcon } from 'leaflet';
import { Coordinates } from '../types/console';
import './Map.scss';

function ChangeView({ center, zoom }: { center: LatLngTuple; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

interface RouteData {
  academy_name: string;
  origin: {
    x: string;
    y: string;
  };
  destination: {
    x: string;
    y: string;
  };
  waypoints: Array<{
    name: string;
    x: string;
    y: string;
  }>;
  route_data: {
    routes: Array<{
      summary: {
        distance: number;
        duration: number;
        fare?: {
          taxi: number;
          toll: number;
        };
      };
      sections: Array<{
        distance: number;
        duration: number;
        roads: Array<{
          name: string;
          distance: number;
          vertexes?: number[];
        }>;
      }>;
    }>;
  };
  timestamp: string;
}

interface MapProps {
  center: LatLngTuple;
  location?: string;
  coordinates?: Coordinates[];
  routeData?: RouteData;
}

export function Map({
  center,
  location = 'Current Location',
  coordinates = [],
  routeData,
}: MapProps) {
  // Convert Coordinates to LatLngTuple array for the polyline
  const positions: LatLngTuple[] = coordinates.map((coord) => [
    coord.lat,
    coord.lng,
  ]);

  // 경로 데이터가 있는 경우 처리
  const renderRouteData = () => {
    if (!routeData) return null;

    const { origin, destination, waypoints, route_data } = routeData;

    // 출발지와 도착지 마커
    const originPosition: LatLngTuple = [
      parseFloat(origin.y),
      parseFloat(origin.x),
    ];
    const destinationPosition: LatLngTuple = [
      parseFloat(destination.y),
      parseFloat(destination.x),
    ];

    // 마커 아이콘 생성
    const createNumberedIcon = (number: number) => {
      return new DivIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background-color: white;
            border: 2px solid #3388ff;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #3388ff;
          ">
            ${number}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
    };

    const blueIcon = new Icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    const greenIcon = new Icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    // 경유지 마커들
    const waypointMarkers = waypoints.map((point, idx) => (
      <Marker
        key={`waypoint-${idx}`}
        position={[parseFloat(point.y), parseFloat(point.x)]}
        icon={createNumberedIcon(idx + 1)}
      >
        <Popup>{`${idx + 1}. ${point.name}`}</Popup>
      </Marker>
    ));

    // 경로 데이터로부터 polyline 좌표 추출
    const polylinePoints: LatLngTuple[] = route_data.routes[0].sections.flatMap(
      (section) =>
        section.roads.flatMap((road) => {
          if (!road.vertexes) return [];
          return road.vertexes.reduce<LatLngTuple[]>(
            (coords, val, idx, arr) => {
              if (idx % 2 === 0) {
                coords.push([arr[idx + 1], val]); // [y, x] 형식으로 변환
              }
              return coords;
            },
            []
          );
        })
    );

    return (
      <>
        {/* 출발지 마커 */}
        <Marker position={originPosition} icon={blueIcon}>
          <Popup>출발지</Popup>
        </Marker>

        {/* 도착지 마커 */}
        <Marker position={destinationPosition} icon={greenIcon}>
          <Popup>도착지</Popup>
        </Marker>

        {/* 경유지 마커들 */}
        {waypointMarkers}

        {/* 경로 라인 */}
        {polylinePoints.length > 0 && (
          <Polyline
            positions={polylinePoints}
            color="red"
            weight={4}
            opacity={0.7}
          />
        )}
      </>
    );
  };

  return (
    <div data-component="Map">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={false}
      >
        <ChangeView center={center} zoom={15} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 기존 현재 위치 마커 */}
        <Marker position={center}>
          <Popup>
            {location}
            {coordinates[coordinates.length - 1]?.temperature && (
              <div>
                Temperature:{' '}
                {coordinates[coordinates.length - 1].temperature?.value}
                {coordinates[coordinates.length - 1].temperature?.units}
              </div>
            )}
            {coordinates[coordinates.length - 1]?.wind_speed && (
              <div>
                Wind Speed:{' '}
                {coordinates[coordinates.length - 1].wind_speed?.value}
                {coordinates[coordinates.length - 1].wind_speed?.units}
              </div>
            )}
          </Popup>
        </Marker>

        {/* 기존 이동 경로 */}
        {positions.length > 1 && (
          <Polyline
            positions={positions}
            color="blue"
            weight={3}
            opacity={0.7}
          />
        )}

        {/* 새로운 경로 데이터 렌더링 */}
        {renderRouteData()}
      </MapContainer>
    </div>
  );
}
