import React from "react";
import { Layout, Menu } from "antd";
import {
    UserOutlined,
    TeamOutlined,
    MessageOutlined,
    StarOutlined,
    WarningOutlined,
    NotificationOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/router";

const { Sider } = Layout;

function AdminSidebar() {
    const router = useRouter();

    const menuItems = [
        {
            key: "/admin/member",
            icon: <UserOutlined />,
            label: (
                <Link href="/admin/member">
                    <a style={{ textDecoration: "none" }}>회원관리</a>
                </Link>
            ),
        },
        {
            key: "/admin/meetup",
            icon: <TeamOutlined />,
            label: (
                <Link href="/admin/meetup">
                    <a style={{ textDecoration: "none" }}>모임관리</a>
                </Link>
            ),
        },
        {
            key: "/admin/question",
            icon: <MessageOutlined />,
            label: (
                <Link href="/admin/question">
                    <a style={{ textDecoration: "none" }}>문의관리</a>
                </Link>
            ),
        },
        {
            key: "/admin/review",
            icon: <StarOutlined />,
            label: (
                <Link href="/admin/review">
                    <a style={{ textDecoration: "none" }}>후기관리</a>
                </Link>
            ),
        },
        {
            key: "/admin/report",
            icon: <WarningOutlined />,
            label: (
                <Link href="/admin/report">
                    <a style={{ textDecoration: "none" }}>신고관리</a>
                </Link>
            ),
        },
        {
            key: "/admin/advertise",
            icon: <NotificationOutlined />,
            label: (
                <Link href="/admin/advertise">
                    <a style={{ textDecoration: "none" }}>광고관리</a>
                </Link>
            ),
        },
    ];

    // 현재 URL에 해당하는 메뉴 활성화
    const selectedKey =
        menuItems.find((item) => router.pathname.startsWith(item.key))?.key ||
        "";

    return (
        <Sider width={240} className="admin-sidebar" theme="light">
            {/* LOGO */}
            <div className="admin-logo">MOIT</div>

            {/* MENU */}
            <Menu
                mode="inline"
                theme="light"
                selectedKeys={[selectedKey]}
                items={menuItems}
                className="admin-menu"
            />
        </Sider>
    );
}

export default AdminSidebar;
