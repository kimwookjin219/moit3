import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Card,
  Typography,
  Tag,
  Empty,
  Spin,
  message,
} from 'antd';

import {
  getLoginHistoryRequest,
  resetLoginHistory,
} from '../../../../reducers/userReducer';

const { Title, Text } = Typography;

function LoginHistory() {
  const dispatch = useDispatch();

  const { loginHistory } = useSelector(
    (state) => state.user
  );

  // 로그인 기록 조회
  useEffect(() => {
    // console.log('===== 로그인 기록 페이지 START =====');

    dispatch(getLoginHistoryRequest());

    return () => {
      dispatch(resetLoginHistory());
    };
  }, [dispatch]);


  /*
   * 백엔드 response.data가 배열이므로
   * Redux에 배열로 저장되어 있다면 그대로 사용
   *
   * 혹시 loginHistory.data 또는 loginHistory.history
   * 형태라면 각각 대응
   */
  const history = Array.isArray(loginHistory)
    ? loginHistory
    : loginHistory?.data ||
      loginHistory?.history ||
      [];

  // 브라우저 이름 추출
  const getBrowserName = (userAgent) => {
    if (!userAgent) return '-';

    if (userAgent.includes('Edg/')) {
      return 'Edge';
    }

    if (userAgent.includes('Chrome/')) {
      return 'Chrome';
    }

    if (userAgent.includes('Firefox/')) {
      return 'Firefox';
    }

    if (
      userAgent.includes('Safari/') &&
      !userAgent.includes('Chrome/')
    ) {
      return 'Safari';
    }

    if (userAgent.includes('OPR/') || userAgent.includes('Opera/')) {
      return 'Opera';
    }

    return '기타';
  };


  // 기기 종류 추출
  const getDeviceType = (userAgent) => {
    if (!userAgent) return '-';

    // iPhone
    if (userAgent.includes('iPhone')) {
      return 'iPhone';
    }

    // iPad
    if (userAgent.includes('iPad')) {
      return 'iPad';
    }

    // Android
    if (userAgent.includes('Android')) {
      return 'Android';
    }

    // Windows / Mac / Linux
    if (
      userAgent.includes('Windows') ||
      userAgent.includes('Macintosh') ||
      userAgent.includes('Linux')
    ) {
      return 'PC';
    }

    return '기타';
  };    

  // 로딩
  if (loginHistory?.loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // 에러
  if (loginHistory?.error) {
    message.error(loginHistory.error);
  }

  const columns = [
    {
      title: '로그인 일시',
      dataIndex: 'loginAt',
      key: 'loginAt',
      width: 220,
      render: (value) => {
        if (!value) {
          return '-';
        }

        return value.replace('T', ' ').split('.')[0];
      },
    },

    {
      title: 'IP 주소',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 180,
      render: (value) => {
        if (!value) {
          return '-';
        }

        if (value === '0:0:0:0:0:0:0:1' || value === '::1') {
          return '127.0.0.1';
        }

        return value;
      },
    },

    {
      title: '로그인 방식',
      dataIndex: 'loginType',
      key: 'loginType',
      width: 150,
      render: (value) => {
        if (!value) {
          return '-';
        }

        switch (value) {
          case 'NORMAL':
            return (
              <Tag color="blue">
                일반 로그인
              </Tag>
            );

          case 'GOOGLE':
            return (
              <Tag color="red">
                Google
              </Tag>
            );

          case 'KAKAO':
            return (
              <Tag color="gold">
                Kakao
              </Tag>
            );

          case 'NAVER':
            return (
              <Tag color="green">
                Naver
              </Tag>
            );

          default:
            return <Tag>{value}</Tag>;
        }
      },
    },

    {
      title: '브라우저',
      dataIndex: 'userAgent',
      key: 'browser',
      width: 120,
      render: (value) => {
        return getBrowserName(value);
      },
    },

    {
      title: '기기',
      dataIndex: 'userAgent',
      key: 'device',
      width: 120,
      render: (value) => {
        return getDeviceType(value);
      },
    },
  ];

  return (
    <div className="mypage-main-content">
      <Card className="mypage-user-info">

        {/* 제목 */}
        <div style={{ marginBottom: '30px' }}>
          <Title
            level={3}
            style={{ marginBottom: '8px' }}
          >
            로그인 기록
          </Title>

          <Text type="secondary">
            최근 로그인 기록을 확인할 수 있습니다.
          </Text>
        </div>

        {/* 로그인 기록 */}
        {history.length === 0 ? (
          <Empty
            description="로그인 기록이 없습니다."
          />
        ) : (
          <Table
            rowKey="loginHistoryId"
            columns={columns}
            dataSource={history}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
            }}
            bordered
          />
        )}
      </Card>
    </div>
  );
}

export default LoginHistory;