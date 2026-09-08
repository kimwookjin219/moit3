import React from "react";
import { Layout, Row, Col, Divider } from "antd";
import Link from "next/link";
const { Footer } = Layout;

function ColItem({ title, href, bold }) {
    return (
        <Col>
            <Link href={href}>
                <a
                    className={bold ? "moit-policy" : ""}
                    style={{ textDecoration: "none" }}
                >
                    {title}
                </a>
            </Link>
        </Col>
    );
}

function UserFooter() {
    const colItems = [
        { title: "회사소개", href: "#" },
        { title: "인재채용", href: "#" },
        { title: "제휴제안", href: "#" },
        { title: "이용약관", href: "#" },
        { title: "개인정보처리방침", href: "#", bold: true },
        { title: "청소년보호정책", href: "#" },
        { title: "모잇 정책", href: "#" },
        { title: "고객센터", href: "#" },
    ];

    return (
        <Footer className="moit-footer">
            <div className="moit-footer-inner">
                <Divider className="moit-footer-divider" />

                <Row align="center" gutter={[24, 12]}>
                    {/* {colItems.map((item) => (
            <ColItem title={item.title} href={item.href} bold={item?.bold} />
          ))} */}
                    {colItems.map((item) => (
                        <ColItem key={item.title} {...item} />
                    ))}
                </Row>

                <Row align="center" className="moit-footer-copyright">
                    <span>© MOIT Corp.</span>
                </Row>
            </div>
        </Footer>
    );
}

export default UserFooter;
