import React , { useEffect }from 'react';
import { Layout, Spin } from 'antd';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useSelector,useDispatch } from 'react-redux';

import UserHeader from './UserHeader';
import UserFooter from './UserFooter';
import MypageHeader from './MypageHeader';
import MyPageSidebar from './MyPageSidebar';

import {
  getMyPageRequest,
  getPointHistoryRequest,
} from '../../reducers/userReducer';

const { Content } = Layout;

function UserLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const isMypage = router.pathname.includes('/mypage');
  // 로그인 없이 접근 가능한 경로
  const publicPaths = ['/', '/user/meetup', '/user/member/login', '/user/member/signup','/user/member/findId',
  '/user/member/findPassword','/user/member/resetPassword'];
  const isPublicPage = publicPaths.includes(router.pathname);

  //user 정보 없으면 loginPage 이동
  const { isInitialized } = useSelector((state) => state.user ?? {});

  // Redux 회원정보
  const user = useSelector((state) => state.user?.user);

  // Redux 보유 포인트
  const point = useSelector((state) => state.user?.point ?? 0);

  useEffect(() => {

    if (isPublicPage) return; // 로그인 필요없는 페이지는 체크 skip

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      router.replace("/user/member/login");
    }

    if (!isInitialized) return;

    if (!user) {
      router.replace("/user/member/login");
    }
  }, [user, isInitialized, isPublicPage, router]);
  
  useEffect(() => {
    if (isMypage) {
      dispatch(getMyPageRequest());
      dispatch(getPointHistoryRequest());
    }
  }, [isMypage, dispatch]);

  return (
    <Layout className="moit-layout">

      <UserHeader />

      {isMypage ? (
        <>
          {/* 마이페이지 프로필 */}
          <MypageHeader user={user} point={point}/>

          <Layout className="mypage-body">

            {/* 마이페이지 사이드바 */}
            <MyPageSidebar />

            <Content className="moit-content">
              {children}
            </Content>

          </Layout>
        </>
      ) : (
        <Content className="moit-content">
          {children}
        </Content>
      )}

      <UserFooter />

    </Layout>
  );
}

UserLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserLayout;