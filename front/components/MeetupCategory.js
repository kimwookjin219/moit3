import React from "react";
import { Card, Menu } from "antd";

function MeetupCategory({ categories = [], selectedCategoryId, onChange }) {
    const items = [
        {
            key: "0",
            label: "전체",
        },
        ...categories.map((item) => ({
            key: String(item.id),
            label: item.categoryName,
        })),
    ];

    return (
        <Card title="카테고리" className="meetup-category">
            <Menu
                mode="vertical"
                selectedKeys={[String(selectedCategoryId ?? 0)]}
                items={items}
                onClick={({ key }) => onChange(Number(key))}
            />
        </Card>
    );
}

export default MeetupCategory;
