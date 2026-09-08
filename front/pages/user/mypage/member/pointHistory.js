import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Card,
  Typography,
  Tag,
  Empty,
  Spin,
  message,
  Row,
  Col,
  Statistic,
} from 'antd';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import {
  getPointHistoryRequest,
  resetPointHistory,
  getAttendanceHistoryRequest,
} from '../../../../reducers/userReducer';

const { Title, Text } = Typography;

function pointHistory() {
  const dispatch = useDispatch();

  const { point, pointHistory } = useSelector(
    (state) => state.user
  );

  // =========================
  // 포인트 내역 조회
  // =========================
  useEffect(() => {
      dispatch(getPointHistoryRequest());

      return () => {
          dispatch(resetPointHistory());
      };
  }, [dispatch]);

  // =========================
  // Redux 상태 확인
  // =========================
  // console.log('===== POINT HISTORY REDUX =====');
  // console.log('point:', point);
  // console.log('pointHistory:', pointHistory);

  const history = Array.isArray(pointHistory?.data)
    ? pointHistory.data
    : [];

  // =========================
  // 날짜 형식
  // =========================
  const formatDate = (value) => {
    if (!value) {
      return '-';
    }

    return value.replace('T', ' ').split('.')[0];
  };

  // =========================
  // 포인트 유형
  // =========================
  const getPointType = (value) => {
    if (!value) {
      return '-';
    }

    switch (value) {
      case 'PLUS':
      case 'EARN':
      case '적립':
        return (
          <Tag color="green">
            적립
          </Tag>
        );

      case 'MINUS':
      case 'USE':
      case '사용':
        return (
          <Tag color="red">
            사용
          </Tag>
        );

      default:
        return <Tag>{value}</Tag>;
    }
  };

  // =========================
  // 포인트 통계 계산
  // =========================
  const pointStats = useMemo(() => {
    let totalEarn = 0;
    let totalUse = 0;

    history.forEach((item) => {
      const value = Number(item.pointPm) || 0;

      const type = item.pointType;

      // 적립
      if (
        type === 'PLUS' ||
        type === 'EARN' ||
        type === '적립'
      ) {
        totalEarn += Math.abs(value);
      }

      // 사용
      else if (
        type === 'MINUS' ||
        type === 'USE' ||
        type === '사용'
      ) {
        totalUse += Math.abs(value);
      }

      // pointType이 명확하지 않은 경우
      else {
        if (value >= 0) {
          totalEarn += value;
        } else {
          totalUse += Math.abs(value);
        }
      }
    });

    return {
      totalEarn,
      totalUse,
      currentPoint: Number(point || 0),
    };
  }, [history, point]);

  // =========================
  // 월별 그래프 데이터
  // =========================
  const chartData = useMemo(() => {
    const monthlyData = {};

    history.forEach((item) => {
      if (!item.createdAt) {
        return;
      }

      const date = new Date(item.createdAt);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const key = `${year}-${String(month).padStart(2, '0')}`;

      if (!monthlyData[key]) {
        monthlyData[key] = {
          month: `${year}년 ${month}월`,
          earn: 0,
          use: 0,
        };
      }

      const value = Math.abs(
        Number(item.pointPm) || 0
      );

      const type = item.pointType;

      // 적립
      if (
        type === 'PLUS' ||
        type === 'EARN' ||
        type === '적립'
      ) {
        monthlyData[key].earn += value;
      }

      // 사용
      else if (
        type === 'MINUS' ||
        type === 'USE' ||
        type === '사용'
      ) {
        monthlyData[key].use += value;
      }

      // 유형이 없는 경우
      else {
        const originalValue =
          Number(item.pointPm) || 0;

        if (originalValue >= 0) {
          monthlyData[key].earn += value;
        } else {
          monthlyData[key].use += value;
        }
      }
    });

    return Object.keys(monthlyData)
      .sort()
      .map((key) => monthlyData[key]);
  }, [history]);

  // =========================
  // 에러
  // =========================
  useEffect(() => {
      if (pointHistory?.error) {
          message.error(pointHistory.error);
      }
  }, [pointHistory?.error]);

  // =========================
  // 로딩
  // =========================
  if (pointHistory?.loading) {
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

  

  // =========================
  // 테이블 컬럼
  // =========================
  const columns = [
    {
      title: '구분',
      dataIndex: 'pointType',
      key: 'pointType',
      width: 120,
      align: 'center',
      render: (value) => {
        return getPointType(value);
      },
    },

    {
      title: '포인트',
      dataIndex: 'pointPm',
      key: 'pointPm',
      width: 150,
      align: 'right',
      render: (value) => {
        const pointValue = Number(value) || 0;

        return (
          <Text
            strong
            type={
              pointValue >= 0
                ? 'success'
                : 'danger'
            }
          >
            {pointValue >= 0 ? '+' : ''}
            {pointValue.toLocaleString()} P
          </Text>
        );
      },
    },

    {
      title: '사유',
      dataIndex: 'pointReason',
      key: 'pointReason',
      render: (value) => {
        return value || '-';
      },
    },

    {
      title: '일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (value) => {
        return formatDate(value);
      },
    },
  ];

  return (
    <div className="mypage-main-content">
      <Card className="mypage-user-info">

        {/* =========================
            제목
        ========================= */}
        <div style={{ marginBottom: '30px' }}>
          <Title
            level={3}
            style={{ marginBottom: '8px' }}
          >
            포인트 내역
          </Title>

          <Text type="secondary">
            포인트 적립 및 사용 내역을 확인할 수 있습니다.
          </Text>
        </div>

        {/* =========================
            현재 보유 포인트
        ========================= */}
        <Card
          size="small"
          style={{
            marginBottom: '30px',
            background: '#fafafa',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text strong>
              현재 보유 포인트
            </Text>

            <Text
              strong
              style={{
                fontSize: '24px',
              }}
            >
              {Number(point || 0).toLocaleString()} P
            </Text>
          </div>
        </Card>

        {/* =========================
            포인트 통계
        ========================= */}
        {history.length > 0 && (
          <>
            <Row
              gutter={[16, 16]}
              style={{
                marginBottom: '30px',
              }}
            >

              {/* 총 적립 */}
              <Col
                xs={24}
                sm={8}
              >
                <Card
                  size="small"
                  style={{
                    height: '100%',
                    background: '#fafafa',
                  }}
                >
                  <Statistic
                    title="총 적립 포인트"
                    value={pointStats.totalEarn}
                    suffix="P"
                    valueStyle={{
                      color: '#52c41a',
                    }}
                  />
                </Card>
              </Col>

              {/* 총 사용 */}
              <Col
                xs={24}
                sm={8}
              >
                <Card
                  size="small"
                  style={{
                    height: '100%',
                    background: '#fafafa',
                  }}
                >
                  <Statistic
                    title="총 사용 포인트"
                    value={pointStats.totalUse}
                    suffix="P"
                    valueStyle={{
                      color: '#ff4d4f',
                    }}
                  />
                </Card>
              </Col>

              {/* 현재 포인트 */}
              <Col
                xs={24}
                sm={8}
              >
                <Card
                  size="small"
                  style={{
                    height: '100%',
                    background: '#fafafa',
                  }}
                >
                  <Statistic
                    title="현재 보유 포인트"
                    value={pointStats.currentPoint}
                    suffix="P"
                  />
                </Card>
              </Col>

            </Row>

            {/* =========================
                포인트 그래프
            ========================= */}
            <Card
              size="small"
              title="월별 포인트 적립 및 사용"
              style={{
                marginBottom: '30px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '350px',
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 0,
                      bottom: 5,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="month"
                    />

                    <YAxis />

                    <Tooltip
                      formatter={(value) =>
                        `${Number(value).toLocaleString()} P`
                      }
                    />

                    <Legend />

                    <Bar
                      dataKey="earn"
                      name="적립"
                      fill="#52c41a"
                    />

                    <Bar
                      dataKey="use"
                      name="사용"
                      fill="#ff4d4f"
                    />

                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </>
        )}

        {/* =========================
            포인트 내역
        ========================= */}
        {history.length === 0 ? (
          <Empty
            description="포인트 내역이 없습니다."
          />
        ) : (
          <Table
            rowKey="historyId"
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

export default pointHistory;