import { ToolDefinition } from '../types/tools';
import axios from 'axios';
import academyStudents from '../data/academy_students.json';
import academyStudentCoordinates from '../data/academy_students_coordinates.json';
import { config } from '../config/env';

// Use environment variable instead of hardcoded API key

interface Coordinate {
  x: string;
  y: string;
}

interface Waypoint {
  name: string;
  x: string;
  y: string;
}

interface AcademyData {
  name: string;
  address: string;
  x: string;
  y: string;
  students: Array<{
    name: string;
    poi_name: string;
    address: string;
    status: string;
  }>;
}

interface KakaoMobilityRouteResponse {
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
      }>;
    }>;
  }>;
}

interface RouteData {
  academy_name: string;
  origin: Coordinate;
  destination: Coordinate;
  waypoints: Waypoint[];
  route_data: KakaoMobilityRouteResponse;
  timestamp: string;
}

// JSON 파일로 다운로드하는 함수
function downloadRouteAsJson(routeData: RouteData) {
  const jsonString = JSON.stringify(routeData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const fileName = `route_${routeData.academy_name}_${new Date().toISOString().replace(/:/g, '-')}.json`;
  
  // 다운로드 링크 생성
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const getMultiStopRouteTool = (
  setMemoryKv: (fn: (kv: { [key: string]: any }) => { [key: string]: any }) => void
): ToolDefinition => {
  return {
    name: 'get_multi_stop_route',
    description: '학생들의 픽업 경로를 계산합니다. 출발지, 목적지, 경유지를 입력받아 최적 경로를 찾습니다.',
    parameters: {
      type: 'object',
      properties: {
        academy_name: {
          type: 'string',
          description: '학원 이름 (예: 카모아카데미, 판교영재학원)',
        },
        origin: {
          type: 'object',
          properties: {
            x: { 
              type: 'string', 
              description: '출발지 경도' 
            },
            y: { 
              type: 'string', 
              description: '출발지 위도' 
            }
          },
          required: ['x', 'y']
        }
      },
      required: ['academy_name', 'origin']
    } as any,
    handler: async (params: { [key: string]: any }) => {
      const { academy_name, origin } = params;
      const academyData: AcademyData | undefined = (academyStudents.academies as any)[academy_name];
      const academyCoordinatesData = (academyStudentCoordinates.academies as any)[academy_name];

      if (!academyData) {
        return {
          success: false,
          error: `${academy_name} 학원을 찾을 수 없습니다.`,
        };
      }

      // 학원 좌표 (목적지)
      const destination: Coordinate = { x: academyData.x, y: academyData.y };

      // 학생들의 경유지 좌표 계산
      const waypoints: Waypoint[] = [];
      for (const student of academyData.students) {
        // 좌표 JSON에서 좌표 찾기
        const studentCoords = academyCoordinatesData?.students.find(
          (s: any) => s.name === student.name
        );

        if (studentCoords) {
          waypoints.push({
            name: student.name,
            x: studentCoords.x,
            y: studentCoords.y,
          });
        } else {
          // 좌표 없으면 주소로 좌표 조회
          const newCoords = await getCoordinatesForAddress(student.address);
          if (newCoords) {
            waypoints.push({
              name: student.name,
              x: newCoords.x,
              y: newCoords.y,
            });

            // 새 좌표를 메모리에 저장
            setMemoryKv((prev) => {
              const updatedCoordinates = {
                ...prev.studentCoordinates,
                [academy_name]: {
                  ...(prev.studentCoordinates?.[academy_name] || {}),
                  [student.name]: newCoords
                }
              };
              return {
                ...prev,
                studentCoordinates: updatedCoordinates
              };
            });
          } else {
            console.error(`Failed to get coordinates for student: ${student.name}`);
          }
        }
      }

      if (waypoints.length === 0) {
        return {
          success: false,
          error: '학생들의 좌표를 찾을 수 없습니다.',
        };
      }

      try {
        const response = await axios.post<KakaoMobilityRouteResponse>(
          'https://apis-navi.kakaomobility.com/v1/waypoints/directions',
          {
            origin,
            destination,
            waypoints,
            priority: 'RECOMMEND',
            car_fuel: 'GASOLINE',
            car_hipass: false,
            alternatives: false,
            road_details: false,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `KakaoAK ${config.KAKAO_MOBILITY_API_KEY}`,
            },
          }
        );

        // 성공적인 경로 결과를 메모리에 저장
        const routeData: RouteData = {
          academy_name,
          origin,
          destination,
          waypoints,
          route_data: response.data,
          timestamp: new Date().toISOString()
        };

        setMemoryKv((prev) => ({
          ...prev,
          route: response.data,
          lastSuccessfulRoute: routeData
        }));

        // JSON 파일로 다운로드
        downloadRouteAsJson(routeData);

        return {
          success: true,
          route: response.data,
        };
      } catch (error) {
        console.error('Route calculation error:', error);
        return {
          success: false,
          error: '경로 계산 중 오류가 발생했습니다.',
        };
      }
    },
  };
};

// 주소를 좌표로 변환하는 헬퍼 함수
async function getCoordinatesForAddress(address: string): Promise<Coordinate | null> {
  try {
    const response = await axios.get<{
      documents: Array<{
        x: string;
        y: string;
      }>;
    }>(
      'https://dapi.kakao.com/v2/local/search/address.json',
      {
        headers: {
          Authorization: `KakaoAK ${config.KAKAO_MOBILITY_API_KEY}`,
        },
        params: {
          query: address,
        },
      }
    );

    if (response.status === 200 && response.data.documents.length > 0) {
      const { x: longitude, y: latitude } = response.data.documents[0];
      return { x: longitude, y: latitude };
    }
    
    return null;
  } catch (error) {
    console.error('좌표 변환 중 오류:', error);
    return null;
  }
};
