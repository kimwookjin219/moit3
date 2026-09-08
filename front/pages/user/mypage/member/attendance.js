import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
  Card,
  Button,
  Calendar,
  Typography,
  message,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import {
  checkAttendanceRequest,
  resetAttendance,
  getAttendanceHistoryRequest,
} from '../../../../reducers/userReducer';

const { Title, Text } = Typography;

function Attendance() {

  const dispatch = useDispatch();

  // =========================
  // 오늘 날짜
  // =========================
  const todayKey = moment().format('YYYY-MM-DD');

  const [currentDate, setCurrentDate] = useState(moment());

  // =========================
  // 오늘 출석 여부
  // =========================
  const [attended, setAttended] = useState(false);

  // =========================
  // 출석한 날짜
  // =========================
  const [attendanceDates, setAttendanceDates] = useState([]);

  // =========================
  // Redux
  // =========================
  const {
    attendance: {
        loading: attendanceLoading,
        success: attendanceSuccess,
        attendedToday,

        history: attendanceHistory,
        historyLoading: attendanceHistoryLoading,
        historyError: attendanceHistoryError,

        error: attendanceError,
    },
  } = useSelector((state) => state.user);

  // =========================
  // Redux 출석 상태 반영
  // =========================
  useEffect(() => {

    setAttended(attendedToday);

  }, [attendedToday]);

  // =========================
  // 출석 기록 조회
  // =========================
  useEffect(() => {

    const today = moment();

    dispatch(
      getAttendanceHistoryRequest({
        year: today.year(),
        month: today.month() + 1,
      })
    );

  }, [dispatch]);


  // =========================
  // 서버에서 받은 출석 기록 → 달력 반영
  // =========================
  useEffect(() => {

    if (!attendanceHistory || !Array.isArray(attendanceHistory)) {
      return;
    }

    const dates = attendanceHistory
      .map((item) => {
        if (!item.createdAt) {
          return null;
        }

        return moment(item.createdAt).format('YYYY-MM-DD');
      })
      .filter(Boolean);

    setAttendanceDates(dates);

  }, [attendanceHistory]);

  // =========================
  // 출석체크
  // =========================
  const handleAttendance = () => {

    // 이미 출석했으면 API 요청하지 않음
    if (attendedToday) {
      message.info('오늘은 이미 출석체크를 완료했습니다.');
      return;
    }

    dispatch(checkAttendanceRequest());
  };

  // =========================
  // 출석체크 성공
  // =========================
  useEffect(() => {

    if (!attendanceSuccess) {
      return;
    }

    // console.log('===== 오늘 출석 완료 =====');
    // console.log('todayKey:', todayKey);

    // 오늘 출석 완료
    setAttended(true);

    // 오늘 날짜를 출석 날짜에 추가
    setAttendanceDates((prev) => {

      if (prev.includes(todayKey)) {
        return prev;
      }

      return [...prev, todayKey];
    });

    message.success('오늘 출석체크가 완료되었습니다.');

    // 성공 상태만 초기화
    dispatch(resetAttendance());

  }, [attendanceSuccess, dispatch, todayKey]);

  // =========================
  // 출석체크 실패
  // =========================
  useEffect(() => {

    if (!attendanceError) {
        return;
    }

    // console.log('===== 출석체크 실패 =====');
    // console.log('attendanceError:', attendanceError);

    // 이미 오늘 출석한 경우
    if (attendanceError === '오늘은 이미 출석체크를 완료했습니다.') {

        // 프론트 화면도 출석 완료 상태로 변경
        setAttended(true);

        // 달력에 오늘 날짜 추가
        setAttendanceDates((prev) => {

        if (prev.includes(todayKey)) {
            return prev;
        }

        return [...prev, todayKey];
        });

        message.info('오늘은 이미 출석체크를 완료했습니다.');

    } else {

        // 실제 오류인 경우만 에러 메시지
        message.error(attendanceError);
    }

    // 메시지 처리가 끝난 뒤 Redux 에러 상태 초기화
    dispatch(resetAttendance());

    }, [attendanceError, dispatch, todayKey]);

  // =========================
  // 날짜 포맷
  // =========================
  const formatDateKey = (date) => {

    return date.format('YYYY-MM-DD');

  };

    // =========================
    // 달력 날짜 렌더링
    // =========================  
    const dateCellRender = (date) => {

    const dateKey = formatDateKey(date);

    if (attendanceDates.includes(dateKey)) {

        return (
        <div
            style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',

            color: '#52c41a',
            fontWeight: 'bold',
            fontSize: '16px',

            pointerEvents: 'none',
            zIndex: 2,
            }}
        >
            ✓
        </div>
        );
    }

    return null;
    };
  return (
    <div className="attendance-page">

      <Title level={2}>
        출석체크
      </Title>

      {/* =========================
          출석체크 카드
      ========================= */}
      <Card
        title="오늘의 출석체크"
        bordered={false}
        style={{ marginBottom: 24 }}
      >

        <div style={{ marginBottom: 20 }}>
          <Text>
            매일 출석체크하고 포인트를 받아보세요.
          </Text>
        </div>

        <Button
          type="primary"
          size="large"
          loading={attendanceLoading}
          disabled={attendedToday}
          onClick={handleAttendance}
        >
          {attended
            ? '오늘 출석체크 완료'
            : '출석체크'
          }
        </Button>

      </Card>

      {/* =========================
          출석 기록
      ========================= */}
      <Card
        title="출석 기록"
        bordered={false}
      >

        <Calendar
          fullscreen={false}
          value={currentDate}
          onSelect={(date) => {
            setCurrentDate(date);
          }}
          dateCellRender={dateCellRender}
        />

      </Card>

    </div>
  );
}

export default Attendance;