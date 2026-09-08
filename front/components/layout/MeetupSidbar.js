import React from 'react';
import { Layout, Menu, Card } from 'antd';
import Link from 'next/link';

const { Sider } = Layout;

function MeetupSidebar() {
  const categoryItems = [
    { key: 'all', label: '전체' },
    { key: 'exercise', label: '운동' },
    { key: 'study', label: '스터디' },
    { key: 'hobby', label: '취미' },
    { key: 'culture', label: '문화' },
    { key: 'food', label: '맛집' },
  ];

  return (
    <Sider width={220} theme="light" className="meetup-sidebar">
      <div className="meetup-sidebar-title">카테고리</div>

      <Menu mode="vertical" items={categoryItems} />

      {/* 광고 */}
      <Card
        className="meetup-sidebar-ad"
        bordered={false}
        bodyStyle={{ padding: 0 }}
      >
        <Link href="#">
          <img
            src="/upload/ad/ad-promo.png"
            alt="광고 신청하기"
            style={{
              width: '100%',
              display: 'block',
            }}
          />
        </Link>
      </Card>
    </Sider>
  );
}

export default MeetupSidebar;
