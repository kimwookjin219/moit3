import React,{ useEffect, useState } from 'react';
import { Layout, Spin } from 'antd';
import PropTypes from 'prop-types';

import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from 'next/router';

const { Content } = Layout;

function AdminLayout({ children }) {
  const router = useRouter();
  const { user, isInitialized}  = useSelector((state) => state.user);
  const [checked, setChecked] = useState(false);



  //관리자만 관리자페이지 접근 가능하도록 수정
  useEffect(() => {
    //console.log(isInitialized)
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      router.replace("/user/member/login");
      return;
      }
    if(!isInitialized) return;

    if (!user) {
      router.replace("/user/member/login");
      return;
    }
    const memberTypeId = Number(user.memberTypeId);

    if (memberTypeId !== 3 && memberTypeId !== 4) {
      router.replace("/");
    }

    setChecked(true);

  }, [user, isInitialized, router]);

   if (!checked) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className="admin-layout">
      <AdminSidebar />

      <Layout className="admin-main">
        <Content className="admin-content">
          <AdminHeader />

          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminLayout;