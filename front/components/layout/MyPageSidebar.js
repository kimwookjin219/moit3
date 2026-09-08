import React from 'react';
import { Layout, Menu } from 'antd';
import { useRouter } from 'next/router';
import { useSelector } from "react-redux";

const { Sider } = Layout;

function MyPageSidebar() {
  const router = useRouter();
  const { user } = useSelector((state) => state.user);

  const menuItems = [
    {
      key: '/user/mypage/member/mypage',
      label: '내 정보',
    },
    {
      key: '/user/mypage/member/attendance',
      label: '출석체크',
    },
    {
      key: '/user/mypage/member/pointHistory',
      label: '포인트 내역',
    },
    {
      key: '/user/mypage/meetup',
      label: '내 모임',
    },
    {
      key: '/user/mypage/meetup-apply',
      label: '내 신청모임',
    },
    {
      key: '/user/mypage/review',
      label: '내 작성후기',
    },
    {
      key: '/user/mypage/question',
      label: '내 문의내역',
    },
    {
      key: '/user/mypage/report',
      label: '내 신고내역',
    },
    {
      key: '/user/mypage/member/edit',
      label: '회원정보 수정',
    },

    // =========================
    // 계정 보안센터
    // =========================
    {
      key: 'security',
      label: '계정 보안센터',
      children: [
        {
          key: '/user/mypage/member/security',
          label: '로그인 기기 관리',
        },
        {
          key: '/user/mypage/member/loginHistory',
          label: '로그인 기록',
        },
        {
          key: '/user/mypage/member/password-change',
          label: '비밀번호 변경',
        },
        {
          key: '/user/mypage/member/delete',
          label: '회원 탈퇴',
        },
      ],
    },
  ];

  // =========================
  // 제휴업체인 경우 광고 메뉴 추가
  // =========================
  if (user?.memberTypeId === 2) {
    menuItems.splice(6, 0, {
      key: "/user/mypage/advertiseList",
      label: "광고 관리",
    });
  }

  // =========================
  // 현재 선택된 메뉴
  // =========================
  let selectedKey = null;

  const normalMenu = menuItems.find(
    (item) =>
      !item.children &&
      (
        router.pathname === item.key ||
        router.pathname.startsWith(`${item.key}/`)
      )
  );

  if (normalMenu) {
    selectedKey = normalMenu.key;
  }

  // =========================
  // 보안센터 하위 메뉴 확인
  // =========================
  const securityMenu = menuItems.find(
    (item) => item.key === 'security'
  );

  const securityChild = securityMenu?.children?.find(
    (child) =>
      router.pathname === child.key ||
      router.pathname.startsWith(`${child.key}/`)
  );

  if (securityChild) {
    selectedKey = securityChild.key;
  }

  return (
    <Sider
      width={220}
      theme="light"
      className="mypage-sidebar"
    >
      <Menu
        mode="inline"

        triggerSubMenuAction="click"

        selectedKeys={
          selectedKey ? [selectedKey] : []
        }

        // 비밀번호 변경 / 회원탈퇴 페이지에서는
        // 보안센터가 기본적으로 펼쳐짐
        defaultOpenKeys={
          securityChild ? ['security'] : []
        }

        items={menuItems}

        onClick={({ key }) => {
          // 실제 페이지가 있는 메뉴만 이동
          if (key !== 'security') {
            router.push(key);
          }
        }}
      />
    </Sider>
  );
}

export default MyPageSidebar;