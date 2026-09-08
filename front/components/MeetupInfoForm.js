import React from "react";
import { Card, Form, Input, Select, Typography } from "antd";

const { Title } = Typography;
const { TextArea } = Input;

function MeetupInfoForm({ categoriesOptions, showAiGuide }) {
    return (
        <Card className="mypage-user-info">
            <Title level={4}>모임 정보</Title>

            <Form.Item
                label="모임 제목"
                name="title"
                rules={[
                    {
                        required: true,
                        message: "모임 제목을 입력해주세요.",
                    },
                ]}
            >
                <Input
                    placeholder={
                        showAiGuide
                            ? "고민이신가요? 키워드만 입력하면 내용을 추천해드려요!"
                            : "모임 제목을 입력해주세요."
                    }
                />
            </Form.Item>

            <Form.Item
                label="카테고리"
                name="categoryId"
                rules={[
                    {
                        required: true,
                        message: "카테고리를 선택해주세요.",
                    },
                ]}
            >
                <Select
                    size="large"
                    placeholder="카테고리를 선택해주세요."
                    options={categoriesOptions}
                />
            </Form.Item>

            <Form.Item
                label="모임 소개"
                name="content"
                rules={[
                    {
                        required: true,
                        message: "모임 소개를 입력해주세요.",
                    },
                ]}
            >
                <TextArea
                    rows={8}
                    placeholder="모임에 대한 설명을 작성해주세요."
                    showCount
                    maxLength={2000}
                />
            </Form.Item>
        </Card>
    );
}

export default MeetupInfoForm;
