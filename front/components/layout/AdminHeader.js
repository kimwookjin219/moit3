import React, { useEffect } from 'react';
import { Card, Row, Col, Typography, Button, } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getMyInfoRequest,logoutRequest } from '../../reducers/userReducer';

const { Title, Text } = Typography;

function AdminHeader() {
  const dispatch = useDispatch();

  const user = useSelector(
    (state) => state.user.user
  );

  useEffect(() => {
    if (!user?.nickname || !user?.memberTypeId) {
      dispatch(getMyInfoRequest());
    }
  }, [dispatch, user?.nickname, user?.memberTypeId]);

  const memberTypeName =
    Number(user?.memberTypeId) === 4
      ? '최고관리자'
      : '관리자';
  
  
  const handleLogout = () => {
    // console.log('===== 관리자 로그아웃 =====');
    dispatch(logoutRequest({provider: user?.provider || null,}));
  };    

  return (
    <Card
      className="admin-header"
      bordered={false}
    >
      <Row
        align="middle"
        justify="space-between"
      >

        <Col>
          <Title
            level={3}
            className="admin-header-title"
          >
            관리자관리
          </Title>
        </Col>

        <Col>
          <Row
            align="middle"
            gutter={16}
          >
            <Col>
              <Text className="admin-header-user">
                {user?.nickname || '관리자'}님 ({memberTypeName})
              </Text>
            </Col>

            <Col>
              <Button
                onClick={handleLogout}
              >
                로그아웃
              </Button>
            </Col>
          </Row>
        </Col>

      </Row>
    </Card>
  );
}

export default AdminHeader;