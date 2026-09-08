import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  logoutRequest,
  getMyInfoRequest,
} from '../../reducers/userReducer';
import {
  BellOutlined,
  MessageOutlined,
  UserOutlined,
  MenuOutlined,
} from '@ant-design/icons';

import {
  Layout,
  Row,
  Col,
  Avatar,
  Badge,
  Button,
  Divider,
  Drawer,
  message,
  Grid,
  Dropdown,
  List,
  Empty,
} from 'antd';

import Link from 'next/link';
import { useRouter } from 'next/router';

import api from '../../api/axios';

const { Header } = Layout;
const { useBreakpoint } = Grid;

function UserHeader() {
  const screens = useBreakpoint();
  const router = useRouter();
  const dispatch = useDispatch();

  const { user, loading } = useSelector((state) => state.user);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // =========================================================
  // 로그인 사용자 조회
  // =========================================================
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const accessToken = localStorage.getItem('accessToken');    

    // 토큰이 없으면 조회하지 않음
    if (!accessToken) {
      return;
    }

    // Redux 사용자 정보 조회
    dispatch(getMyInfoRequest());

  }, [dispatch]);

  const loadNotifications = async () => {
    try {
      if (typeof window === 'undefined') return;

      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setNotificationCount(0);
        setNotifications([]);
        return;
      }

      // 읽지 않은 알림 개수
      const countResponse = await api.get('/api/notifications/count');
      setNotificationCount(countResponse.data);

      // 읽지 않은 알림 목록
      const listResponse = await api.get('/api/notifications/unread');
      setNotifications(listResponse.data || []);

    } catch (error) {
      console.error('알림 조회 실패:', error);
      setNotificationCount(0);
      setNotifications([]);
    }
  };

  const handleNotificationOpen = async () => {
    try {
      // 전체 알림 목록 조회
      const response = await api.get('/api/notifications');

      setNotifications(response.data || []);

      // 읽지 않은 알림이 있으면 전체 읽음 처리
      if (notificationCount > 0) {
        await api.patch('/api/notifications/read-all');

        // 종 옆 숫자 즉시 제거
        setNotificationCount(0);

        // 화면의 알림도 읽음 상태로 변경
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            isRead: 'Y',
          }))
        );
      }
      setNotificationOpen(true);

    } catch (error) {
      console.error('알림 처리 실패:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await api.delete(
        `/api/notifications/${notificationId}`
      );

      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            notification.notificationId !== notificationId
        )
      );

    } catch (error) {
      console.error('알림 삭제 실패:', error);
    }
  };

  // =========================================================
  // 최초 실행 + 페이지 이동할 때마다 알림 조회
  // =========================================================
  // useEffect(() => {
  //   loadNotifications();
  // }, [router.asPath]);
  useEffect(() => {
    if (!user) {
      setNotificationCount(0);
      setNotifications([]);
      return;
    }

    loadNotifications();
  }, [user]);

  // =========================================================
  // 회원 유형
  // =========================================================
  const getMemberTypeName = (memberTypeId) => {
    switch (Number(memberTypeId)) {
      case 1:
        return '일반회원';

      case 2:
        return '제휴업체';

      case 3:
        return '관리자';

      case 4:
        return '최고관리자';

      default:
        return '회원';
    }
  };

  // =========================================================
  // 로그아웃
  // =========================================================
  const handleLogout = () => {

      if (typeof window === 'undefined') {
          return;
      }

      // 모바일 Drawer 닫기
      setDrawerOpen(false);

      // 현재 로그인 사용자의 provider를 Saga로 전달
      dispatch(
          logoutRequest({
              provider: user?.provider,
          })
      );

  };

  // =========================================================
  // 프로필 이미지 URL
  // =========================================================
  const getProfileImageUrl = (profileUrl) => {

    if (!profileUrl) {
      return "/images/moit.png";
    }

    if (profileUrl === "/images/moit.png") {
      return "/images/moit.png";
    }

    if (profileUrl.startsWith("http")) {
      return profileUrl;
    }

    const imageUrl =
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${profileUrl}`;

    return imageUrl;
  };

  // =========================================================
  // 프로필 URL
  // =========================================================
  const handleProfileClick = () => {
      if (!user) {
          router.push("/user/member/login");
          return;
      }

      // 관리자
      if (user.memberTypeId === 3 ||user.memberTypeId === 4) {
          router.push("/admin/member");
          return;
      }

      // 일반 회원
      router.push("/user/mypage/member/mypage");
  };

  // =========================================================
  // 로딩 중
  // =========================================================
  if (loading) {
    return (
      <Header className="moit-header">
        <Row
          align="middle"
          justify="space-between"
          wrap={false}
          className="moit-header-row"
        >
          <Col flex="none">
            <Link href="/">
              <a className="moit-logo">
                MOIT
              </a>
            </Link>
          </Col>
        </Row>
      </Header>
    );
  }

  return (
    <>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <Header className="moit-header">

        <Row
          align="middle"
          justify="space-between"
          wrap={false}
          className="moit-header-row"
        >

          {/* =================================================
              로고 + 슬로건
          ================================================= */}
          <Col flex="none">

            <Row
              align="middle"
              gutter={32}
              wrap={false}
            >

              {/* 로고 */}
              <Col flex="none">
                <Link href="/">
                  <a className="moit-logo">
                    MOIT
                  </a>
                </Link>
              </Col>

              {/* 슬로건 */}
              {screens.md && (
                <Col flex="none">
                  <span className="moit-slogan">
                    우리들의 취향 맞춤 소모임 플랫폼
                  </span>
                </Col>
              )}

            </Row>

          </Col>


          {/* =================================================
              PC MENU
          ================================================= */}
          {screens.md && (

            <Col flex="none">

              <Row
                align="middle"
                gutter={24}
                wrap={false}
              >

                {/* 모집찾기 */}
                <Col flex="none">
                  <Link href="/user/meetup">
                    <a
                      className="moit-header-link"
                      style={{ textDecoration: 'none' }}
                    >
                      모임찾기
                    </a>
                  </Link>
                </Col>


                {/* 관리자 문의 */}
                <Col flex="none">
                  <Link href="/user/qna/questionWrite?type=ADMIN">
                    <a
                      className="moit-header-link moit-inquiry"
                      style={{ textDecoration: 'none' }}
                    >
                      <MessageOutlined />
                      &nbsp;관리자 1:1 문의
                    </a>
                  </Link>
                </Col>


                {/* 알림 */}
                <Col flex="none">
                  <Dropdown
                    open={notificationOpen}
                    onOpenChange={(open) => {
                      if (open) {
                        handleNotificationOpen();
                      } else {
                        setNotificationOpen(false);
                      }
                    }}
                    trigger={['click']}
                    dropdownRender={() => (
                      <div
                        style={{
                          width: 360,
                          maxHeight: 400,
                          overflowY: 'auto',
                          background: '#fff',
                          padding: 16,
                          borderRadius: 8,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            marginBottom: 12,
                          }}
                        >
                          알림
                        </div>

                        {notifications.length === 0 ? (
                          <Empty
                            description="새로운 알림이 없습니다."
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        ) : (
                          <List
                            dataSource={notifications}
                            renderItem={(notification) => (
                              <List.Item
                                actions={[
                                  <Button
                                    key="delete"
                                    type="text"
                                    danger
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNotification(notification.notificationId);
                                    }}
                                  >
                                    X
                                  </Button>
                                ]}
                                style={{
                                  cursor: 'pointer',
                                  padding: '12px 8px',
                                }}
                              >
                                <div>
                                  <div
                                    style={{
                                      fontSize: 14,
                                      fontWeight: 500,
                                    }}
                                  >
                                    {notification.message}
                                  </div>

                                  <div
                                    style={{
                                      fontSize: 12,
                                      color: '#999',
                                      marginTop: 6,
                                    }}
                                  >
                                    {new Date(
                                      notification.createdAt
                                    ).toLocaleString('ko-KR', {
                                      year: 'numeric',
                                      month: 'numeric',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                      hour12: false,
                                    })}
                                  </div>
                                </div>
                              </List.Item>
                            )}
                          />
                        )}
                      </div>
                    )}
                  >
                    <Badge
                      count={notificationCount}
                      size="small"
                    >
                      <BellOutlined
                        className="moit-alarm-icon"
                        style={{
                          cursor: 'pointer',
                          fontSize: 20,
                        }}
                      />
                    </Badge>
                  </Dropdown>
                </Col>


                {/* =================================================
                    로그인 상태
                ================================================= */}
                {user ? (

                  <>
                    {/* 프로필 */}
                    <Col flex="none">
                      <div
                        onClick={handleProfileClick}
                        style={{
                          cursor: 'pointer',
                        }}
                      >
                        <Row
                          align="middle"
                          gutter={8}
                          wrap={false}
                        >
                          {/* 프로필 이미지 */}
                          <Col flex="none">
                            <Avatar
                              size={38}
                              src={getProfileImageUrl(user.profileUrl)}
                              icon={
                                !user.profileUrl && (
                                  <UserOutlined />
                                )
                              }
                            />
                          </Col>

                          {/* 이름 + 회원유형 */}
                          <Col flex="none">
                            <div className="moit-profile-info">
                              <span className="moit-profile-name">
                                {user.nickname}님
                              </span>

                              <span className="moit-profile-type">
                                {getMemberTypeName(user.memberTypeId)}
                              </span>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Col>


                    {/* 로그아웃 */}
                    <Col flex="none">

                      <Button
                        type="text"
                        className="moit-logout-btn"
                        onClick={handleLogout}
                      >
                        로그아웃
                      </Button>

                    </Col>

                  </>

                ) : (

                  <>
                    {/* =================================================
                        로그인 전
                    ================================================= */}

                    {/* 로그인 */}
                    <Col flex="none">
                      <Link href="/user/member/login">
                        <a
                          className="moit-header-link"
                          style={{ textDecoration: 'none' }}
                        >
                          로그인
                        </a>
                      </Link>
                    </Col>


                    {/* 회원가입 */}
                    <Col flex="none">
                      <Link href="/user/member/signup">
                        <a
                          className="moit-header-link"
                          style={{ textDecoration: 'none' }}
                        >
                          회원가입
                        </a>
                      </Link>
                    </Col>
                  </>

                )}

              </Row>

            </Col>

          )}


          {/* =================================================
              MOBILE MENU
          ================================================= */}
          {!screens.md && (

            <Col flex="none">

              <Button
                type="text"
                className="moit-mobile-menu-btn"
                icon={<MenuOutlined />}
                onClick={() => setDrawerOpen(true)}
              />

            </Col>

          )}

        </Row>

      </Header>


      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}
      <Drawer
        title="MOIT"
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >

        <div className="moit-mobile-menu">

          {/* 모집찾기 */}
          <Link href="/user/meetup">
            <a>
              모집찾기
            </a>
          </Link>


          {/* 관리자 문의 */}
          <Link href="/user/qna/write?type=ADMIN">
            <a>
              <MessageOutlined />
              &nbsp;관리자 1:1 문의
            </a>
          </Link>


          <Divider />


          {user ? (

            <>
              {/* 관리자 / 일반회원 페이지 */}
              <a onClick={() => {
                      setDrawerOpen(false);

                      if (user.memberTypeId === 3 ||user.memberTypeId === 4) {router.push("/admin/member");} 
                      else {router.push("/user/mypage/member/mypage");}
                  }}
                  style={{ cursor: "pointer" }}
              >
                  <UserOutlined />
                  &nbsp;
                  {user.memberTypeId === 3 || user.memberTypeId === 4
                      ? "관리자 페이지"
                      : "마이페이지"}
              </a>


              {/* 알림 */}
              <Button
                type="text"
                className="moit-mobile-menu-item"
              >
                <BellOutlined />
                &nbsp;알림
              </Button>


              {/* 로그아웃 */}
              <Button
                type="text"
                danger
                className="moit-mobile-menu-item"
                onClick={handleLogout}
              >
                로그아웃
              </Button>
            </>

          ) : (

            <>
              {/* 로그인 */}
              <Link href="/user/member/login">
                <a className="moit-mobile-menu-item">
                  로그인
                </a>
              </Link>


              {/* 회원가입 */}
              <Link href="/user/member/signup">
                <a className="moit-mobile-menu-item">
                  회원가입
                </a>
              </Link>
            </>

          )}

        </div>

      </Drawer>
    </>
  );
}

export default UserHeader;