import React from 'react';
import { Col, Row, Typography, Tag, Card } from 'antd';
import MyPageStatCard from './MyPageStatCard';
import {
  EditOutlined,
  TeamOutlined,
  StarOutlined,
  HeartFilled,
} from '@ant-design/icons';
const { Title, Text } = Typography;

const interests = [
  { value: 1, label: '🏃 운동' },
  { value: 2, label: '✈️ 여행' },
  { value: 3, label: '🎮 게임' },
  { value: 4, label: '📚 독서' },
  { value: 5, label: '🍽️ 맛집' },
  { value: 6, label: '🎬 영화' },
  { value: 7, label: '🎵 음악' },
  { value: 8, label: '🍳 요리' },
];

function MyPageUserInfo({ user }) {

  // 마이페이지 통계
  const stats = [
    {
      title: '작성한 모집글',
      value: user?.myMeetupCount || 0,
      icon: EditOutlined,
    },
    {
      title: '신청 모임',
      value: user?.applyMeetupCount || 0,
      icon: TeamOutlined,
    },
    {
      title: '작성 후기',
      value: user?.reviewCount || 0,
      icon: StarOutlined,
    },
    {
      title: '관심 모임',
      value: user?.favoriteMeetupCount || 0,
      icon: HeartFilled,
    },
  ];

  const infoItems = [
    {
      label: '아이디',
      value: user?.loginId || '-',
    },
    {
      label: '닉네임',
      value: user?.nickname || '-',
    },
    {
      label: '이메일',
      value: user?.email || '-',
    },
    // {
    //   label: '전화번호',
    //   value: user?.mobile || '-',
    // },
    {
      label: '성별',
      value:
        user?.gender === 'M'
          ? '남성'
          : user?.gender === 'F'
          ? '여성'
          : user?.gender === 'N'
          ? '선택 안 함'
          : '-',
    },
    {
      label: '생년월일',
      value: user?.birth || '-',
    },
    {
      label: '가입일',
      value: user?.createdAt || '-',
    },
  ];

  return (
    <Card className="mypage-user-info" >

      <MyPageStatCard stats={stats} />

      <Title level={3}>사용자 정보</Title>

      <Row gutter={[16, 16]}>
        {infoItems.map((item) => (
          <Col key={item.label} xs={24} sm={12}>
            <div className="mypage-info-box">
              <Text type="secondary">
                {item.label}
              </Text>

              <div className="mypage-info-value">
                {item.value}
              </div>
            </div>
          </Col>
        ))}

        <Col xs={24}>
          <div className="mypage-info-box">
            <Text type="secondary">
              관심 카테고리
            </Text>

            <div className="mypage-interest-list">
              {user?.interests && user.interests.length > 0 ? (
              user.interests.map((interest) => {
                const interestInfo = interests.find(
                  (item) => item.value === interest.interestId
                );

                return (
                  <Tag key={interest.interestId}>
                    {interestInfo?.label || interest.interestName}
                  </Tag>
                );
              })
            ) : (
              <span>-</span>
            )}
            </div>
          </div>
        </Col>
      </Row>

    </Card>
  );
}

export default MyPageUserInfo;