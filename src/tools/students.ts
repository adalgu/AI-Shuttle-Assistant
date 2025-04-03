import { ToolDefinition } from '../types/tools';
import axios from 'axios';
import academyStudents from '../data/academy_students.json';
import { config } from '../config/env';

// Use environment variable instead of hardcoded API key

interface Coordinate {
  x: string;
  y: string;
}

interface Student {
  name: string;
  poi_name: string;
  address: string;
  status: 'waiting' | 'boarded' | 'absent';
  x?: string;
  y?: string;
}

interface Academy {
  name: string;
  address: string;
  x: string;
  y: string;
  students: Student[];
}

interface Academies {
  [key: string]: Academy;
}

interface StudentUpdateParams {
  academy_name: string;
  student_name: string;
  address?: string;
  status?: 'waiting' | 'boarded' | 'absent';
}

// 학생 명단 조회 도구
export const getStudentsListTool = (): ToolDefinition => {
  return {
    name: 'get_students_list',
    description:
      '지정된 학원의 학생 명단과 각 학생의 상태를 조회합니다. 도구는 직접 학생 명단 데이터를 반환하며, 이 데이터는 UI에 즉시 표시됩니다.',
    parameters: {
      type: 'object',
      properties: {
        academy_name: {
          type: 'string',
          description: '학원 이름 (예: 카모아카데미, 판교영재학원)',
        },
      },
      required: ['academy_name'],
    } as any,
    handler: async (params: { [key: string]: any }) => {
      try {
        const { academy_name } = params;
        const academiesData = academyStudents.academies as Academies;

        const academy = academiesData[academy_name];
        if (!academy) {
          return {
            success: false,
            error: `${academy_name} 학원을 찾을 수 없습니다.`,
          };
        }

        // 학생 명단 텍스트 생성
        const studentList = academy.students
          .map(
            (student) =>
              `- ${student.name}: ${student.poi_name} (${
                student.status === 'boarded'
                  ? '탑승완료'
                  : student.status === 'absent'
                  ? '결석'
                  : '대기중'
              })`
          )
          .join('\n');

        const message = `${academy.name} 학생 명단:\n${studentList}`;
        console.log('Generated student list:', message);

        return {
          success: true,
          message,
        };
      } catch (error) {
        console.error('학생 정보 조회 중 오류:', error);
        return {
          success: false,
          error: '학생 정보 조회 중 오류가 발생했습니다.',
        };
      }
    },
  };
};

// UI에 학생 명단을 표시하는 도구
export const displayStudentsListTool = (
  setMemoryKv: (
    fn: (kv: { [key: string]: any }) => { [key: string]: any }
  ) => void
): ToolDefinition => {
  return {
    name: 'display_students_list',
    description: '학생 명단을 UI에 표시합니다.',
    parameters: {
      type: 'object',
      properties: {
        academy_name: {
          type: 'string',
          description: '학원 이름 (예: 카모아카데미, 판교영재학원)',
        },
      },
      required: ['academy_name'],
    } as any,
    handler: async (params: { [key: string]: any }) => {
      try {
        const { academy_name } = params;
        const academiesData = academyStudents.academies as Academies;

        const academy = academiesData[academy_name];
        if (!academy) {
          return {
            success: false,
            error: `${academy_name} 학원을 찾을 수 없습니다.`,
          };
        }

        // UI에 표시할 데이터 구성
        const academyData = {
          name: academy.name,
          address: academy.address,
          students: academy.students.map((student) => ({
            name: student.name,
            poi_name: student.poi_name,
            address: student.address,
            status: student.status,
          })),
        };

        // memoryKv를 통해 UI 업데이트
        setMemoryKv((prev) => ({
          ...prev,
          academy: academyData,
        }));

        return {
          success: true,
          message: '학생 명단이 UI에 표시되었습니다.',
        };
      } catch (error) {
        console.error('학생 명단 표시 중 오류:', error);
        return {
          success: false,
          error: '학생 명단 표시 중 오류가 발생했습니다.',
        };
      }
    },
  };
};

// 학생 정보 업데이트 도구
export const updateStudentListTool = (
  setMemoryKv: (
    fn: (kv: { [key: string]: any }) => { [key: string]: any }
  ) => void
): ToolDefinition => {
  return {
    name: 'update_student_list',
    description:
      '학생 정보를 업데이트합니다. 주소, 상태 등을 변경할 수 있습니다.',
    parameters: {
      type: 'object',
      properties: {
        academy_name: {
          type: 'string',
          description: '학원 이름 (예: 카모아카데미, 판교영재학원)',
        },
        student_name: {
          type: 'string',
          description: '학생 이름',
        },
        address: {
          type: 'string',
          description: '(선택) 새로운 주소',
        },
        status: {
          type: 'string',
          description: '(선택) 학생 상태',
          enum: ['waiting', 'boarded', 'absent'],
        },
      },
      required: ['academy_name', 'student_name'],
    } as any,
    handler: async (params: { [key: string]: any }) => {
      try {
        const { academy_name, student_name, address, status } = params;

        // 학원 및 학생 존재 확인
        const academiesData = academyStudents.academies as Academies;
        if (!academiesData[academy_name]) {
          return {
            success: false,
            error: `${academy_name} 학원을 찾을 수 없습니다.`,
          };
        }

        const studentIndex = academiesData[academy_name].students.findIndex(
          (student) => student.name === student_name
        );

        if (studentIndex === -1) {
          return {
            success: false,
            error: `${student_name} 학생을 찾을 수 없습니다.`,
          };
        }

        let updatedStudent = {
          ...academiesData[academy_name].students[studentIndex],
        };

        // 주소 업데이트 및 좌표 변환
        if (address) {
          try {
            const coordinates = await getCoordinatesForAddress(address);
            if (coordinates) {
              updatedStudent.address = address;
              updatedStudent.x = coordinates.x;
              updatedStudent.y = coordinates.y;
            }
          } catch (coordError) {
            console.error('좌표 변환 중 오류:', coordError);
          }
        }

        // 상태 업데이트
        if (status) {
          updatedStudent.status = status;
        }

        // memoryKv 업데이트
        setMemoryKv((prev) => ({
          ...prev,
          studentUpdate: {
            academy: academy_name,
            student: student_name,
            updatedFields: { address, status },
            updatedStudent,
          },
        }));

        return {
          success: true,
          message: '학생 정보가 성공적으로 업데이트되었습니다.',
          updatedStudent,
        };
      } catch (error) {
        console.error('학생 정보 업데이트 중 오류:', error);
        return {
          success: false,
          error: '학생 정보 업데이트 중 오류가 발생했습니다.',
        };
      }
    },
  };
};

// 주소를 좌표로 변환하는 헬퍼 함수
async function getCoordinatesForAddress(
  address: string
): Promise<Coordinate | null> {
  try {
    const response = await axios.get<{
      documents: Array<{
        x: string;
        y: string;
      }>;
    }>('https://dapi.kakao.com/v2/local/search/address.json', {
      headers: {
        Authorization: `KakaoAK ${config.KAKAO_MOBILITY_API_KEY}`,
      },
      params: {
        query: address,
      },
    });

    if (response.status === 200 && response.data.documents.length > 0) {
      const { x: longitude, y: latitude } = response.data.documents[0];
      return { x: longitude, y: latitude };
    }

    return null;
  } catch (error) {
    console.error('좌표 변환 중 오류:', error);
    return null;
  }
}
