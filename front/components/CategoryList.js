import React from "react";
import { Row, Col, Card, Typography } from "antd";

const { Title, Text } = Typography;

function CategoryList({ categories, onCategoryClick }) {
    const categoryIcons = {
        운동: "🏃",
        여행: "📚",
        게임: "🎮",
        독서: "🎨",
        맛집: "☕",
        영화: "✈️",
        음악: "☕",
        요리: "🎵",
    };

    return (
        <Row gutter={[12, 12]}>
            <Col span={24}>
                <Title level={3}>카테고리</Title>

                <Text type="secondary">관심 있는 모임을 찾아보세요</Text>
            </Col>

            {categories.map((category) => (
                <Col xs={12} sm={8} md={6} lg={3} key={category.id}>
                    <Card
                        hoverable
                        className="category-card"
                        onClick={() => onCategoryClick(category)}
                    >
                        <div className="category-icon">
                            {categoryIcons[category.categoryName]}
                        </div>

                        <Text strong>{category.categoryName}</Text>
                    </Card>
                </Col>
            ))}
        </Row>
    );
}

export default CategoryList;
