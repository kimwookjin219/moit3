import React from "react";
import { Row, Col, Card, Button, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";

const { Title, Text } = Typography;

function Hero() {
    const router = useRouter();
    return (
        <Row>
            <Col span={24}>
                <Card className="main-hero-card">
                    <Row align="middle" justify="space-between">
                        <Col>
                            <Title level={1}>
                                당신의 관심사가
                                <br />
                                새로운 모임이 되는 곳
                            </Title>

                            <Text type="secondary">
                                대학생 · 일반인을 위한 모임 플랫폼
                            </Text>

                            <div className="main-hero-buttons">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<SearchOutlined />}
                                    onClick={() => router.push("/user/meetup")}
                                >
                                    모임 찾기
                                </Button>
                            </div>
                        </Col>

                        <Col>
                            <div className="main-hero-icon">👥</div>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    );
}

export default Hero;
