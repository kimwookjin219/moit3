import React from 'react';
import {
  Card,
  Col,
  Row,
  Statistic,
  Typography,
  Table,
  Tag,
  Button,
} from 'antd';
import {
  FileTextOutlined,
  TeamOutlined,
  StarOutlined,
  HeartOutlined,
} from '@ant-design/icons';

import MyPageUserInfo from '../../../components/MyPageUserInfo';
import MyPageStatCard from '../../../components/MyPageStatCard';

// http://localhost:3000/user/mypage

const { Title, Text } = Typography;

function MyPage() {
  //나중에 Redux 연결예시
  //const user = useSelector((state) => state.user.user);
  const user = {
    nickname: '홍길동',
    email: 'hong@example.com',
    createdAt: '2026-01-10',
    categories: '러닝, 독서, 개발',
  };

  const stats = [
    {
      title: '내 모집글',
      value: 12,
      suffix: '개',
      icon: FileTextOutlined,
    },
    {
      title: '신청 모임',
      value: 8,
      suffix: '개',
      icon: TeamOutlined,
    },
    {
      title: '작성 후기',
      value: 16,
      suffix: '개',
      icon: StarOutlined,
    },
    {
      title: '관심 모임',
      value: 6,
      suffix: '개',
      icon: HeartOutlined,
    },
  ];
  return (
    <div className="mypage-container">
      {/* 사용자 정보 */}
      <MyPageUserInfo user={user} />
    </div>
  );
}

export default MyPage;
