import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';

function MyPageStatCard({ stats }) {
  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Col key={stat.title} xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                prefix={<Icon />}
              />
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}

export default MyPageStatCard;
