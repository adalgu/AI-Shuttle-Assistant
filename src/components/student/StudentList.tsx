import React, { useEffect, useState } from 'react';
import { useConsole } from '../../contexts/ConsoleContext';
import './StudentList.scss';

interface Student {
  name: string;
  poi_name: string;
  address: string;
  status: 'waiting' | 'boarded' | 'absent';
}

interface Academy {
  name: string;
  address: string;
  students: Student[];
}

interface StudentListProps {
  memoryKv: { [key: string]: any };
}

export function StudentList({ memoryKv }: StudentListProps) {
  const [academy, setAcademy] = useState<Academy | null>(null);
  const { client } = useConsole();

  // 학생 명단 가져오기
  useEffect(() => {
    const fetchStudents = async () => {
      if (!client) return;

      try {
        const academyName = memoryKv?.selectedAcademy || '카모아카데미';
        console.log('Fetching students for academy:', academyName);

        await client.sendUserMessageContent([
          {
            type: 'input_text',
            text: `get_students_list ${academyName}`,
          },
        ]);
        console.log('Sent request for students list');
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, [client, memoryKv?.selectedAcademy]);

  // 학생 명단 데이터 업데이트
  useEffect(() => {
    if (memoryKv?.academy) {
      console.log('Received academy data:', memoryKv.academy);
      setAcademy(memoryKv.academy);
    }
  }, [memoryKv?.academy]);

  // Watch memoryKv for student updates
  useEffect(() => {
    if (memoryKv?.studentUpdate?.updatedStudent) {
      setAcademy((prev) => {
        if (!prev) return prev;

        const updatedStudents = prev.students.map((student) =>
          student.name === memoryKv.studentUpdate.student
            ? memoryKv.studentUpdate.updatedStudent
            : student
        );

        return {
          ...prev,
          students: updatedStudents,
        };
      });
    }
  }, [memoryKv?.studentUpdate]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'boarded':
        return 'status-boarded';
      case 'absent':
        return 'status-absent';
      default:
        return 'status-waiting';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'boarded':
        return '탑승완료';
      case 'absent':
        return '결석';
      default:
        return '대기중';
    }
  };

  if (!academy) {
    return <div className="student-list">학생 명단이 표시됩니다.</div>;
  }

  return (
    <div className="student-list">
      <div className="student-list-title">{academy.name} 학생 명단</div>
      <div className="route-visualization">
        <div className="route-point start">
          <div className="point-marker">출발</div>
        </div>
        <div className="route-line"></div>
        {academy.students.map((student, index) => (
          <React.Fragment key={student.name}>
            <div className="route-point stop">
              <div className="point-marker">정류장 {index + 1}</div>
              <div className="student-info">
                <div className="student-name">{student.name}</div>
                <div className="student-location">{student.poi_name}</div>
                <div
                  className={`student-status ${getStatusClass(student.status)}`}
                >
                  {getStatusText(student.status)}
                </div>
              </div>
            </div>
            <div className="route-line"></div>
          </React.Fragment>
        ))}
        <div className="route-point end">
          <div className="point-marker">도착</div>
          <div className="academy-name">{academy.name}</div>
        </div>
      </div>
    </div>
  );
}
