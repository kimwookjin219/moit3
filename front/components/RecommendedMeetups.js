import React from "react";
import { Card, Space, Row, Col, Typography } from "antd";

const { Text } = Typography;

function RecommendedMeetups({ recommendedMeetups = [], onMeetupClick }) {
    return (
        <Card title="추천 모임" className="meetup-side-card">
            <Space direction="vertical" style={{ width: "100%" }} size={12}>
                {recommendedMeetups.map((item) => (
                    <Card
                        key={item.id}
                        size="small"
                        hoverable
                        className="recommended-meetup-card"
                        onClick={() => onMeetupClick?.(item.id)}
                    >
                        <Row gutter={12}>
                            {/* 이미지 */}
                            <Col span={8}>
                                <div className="recommended-image">
                                    <img
                                        src={
                                            item.imagePath
                                                ? `http://localhost:8080/upload/meetup/${item.imagePath}`
                                                : "http://localhost:8080/upload/no-image.png"
                                        }
                                        alt={item.title}
                                    />
                                </div>
                            </Col>

                            {/* 정보 */}
                            <Col span={16}>
                                {/* 제목 */}
                                <Text
                                    strong
                                    ellipsis
                                    style={{
                                        display: "block",
                                        marginBottom: 4,
                                    }}
                                >
                                    {item.title}
                                </Text>

                                {/* 카테고리 */}
                                <div>
                                    <Text type="secondary">
                                        🏃 {item.categoryName}
                                    </Text>
                                </div>

                                {/* 지역 */}
                                <div>
                                    <Text type="secondary">
                                        📍 {item.sidoName} {item.sigunguName}
                                    </Text>
                                </div>

                                {/* 날짜 */}
                                <div>
                                    <Text type="secondary">
                                        📅{" "}
                                        {item.meetupAt
                                            ?.replace("T", " ")
                                            .slice(5, 16)}
                                    </Text>
                                </div>

                                {/* 인원 + 좋아요 */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginTop: 4,
                                    }}
                                >
                                    <Text type="secondary">
                                        👥 {item.totalParticipants ?? 0} /{" "}
                                        {item.maxParticipants}
                                    </Text>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                ))}
            </Space>
        </Card>
    );
}

export default RecommendedMeetups;
