import React from 'react';
import { Card, Row, Col, Space, Typography } from 'antd';

const { Text } = Typography;

function MeetupWeather({ temperature = 24, precipitation = 10, sky = '맑음' }) {
  return (
    <Card className="meetup-weather-card">
      <Space direction="vertical" size={8}>
        <Text strong>🌤️ 모임 날씨</Text>

        <Row gutter={40}>
          <Col>
            <Text type="secondary">기온</Text>
            <div>
              <Text strong>{temperature}℃</Text>
            </div>
          </Col>

          <Col>
            <Text type="secondary">강수확률</Text>
            <div>
              <Text strong>{precipitation}%</Text>
            </div>
          </Col>

          <Col>
            <Text type="secondary">하늘</Text>
            <div>
              <Text strong>{sky}</Text>
            </div>
          </Col>
        </Row>
      </Space>
    </Card>
  );
}

export default MeetupWeather;
