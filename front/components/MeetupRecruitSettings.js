import React from "react";
import {
    Button,
    Card,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Select,
    Typography,
} from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";

const { Title } = Typography;

function MeetupRecruitSettings({ isEdit, onAddressClick, sigungus = [] }) {
    return (
        <Card className="mypage-user-info">
            <Title level={4}>모집 정보</Title>

            <Form.Item
                label="최소 인원"
                name="minParticipants"
                rules={[
                    {
                        required: true,
                        message: "최소 인원을 입력해주세요.",
                    },
                ]}
            >
                <InputNumber
                    min={1}
                    max={100}
                    style={{ width: "100%" }}
                    size="large"
                    addonAfter="명"
                />
            </Form.Item>

            <Form.Item
                label="최대 인원"
                name="maxParticipants"
                rules={[
                    {
                        required: true,
                        message: "최대 인원을 입력해주세요.",
                    },
                ]}
            >
                <InputNumber
                    min={1}
                    max={100}
                    style={{ width: "100%" }}
                    size="large"
                    addonAfter="명"
                />
            </Form.Item>

            <Form.Item
                label="주소"
                name="address"
                rules={[
                    {
                        required: true,
                        message: "모임 장소를 선택해주세요.",
                    },
                ]}
            >
                <Input
                    size="large"
                    readOnly
                    placeholder="주소 검색"
                    prefix={<EnvironmentOutlined />}
                    onClick={onAddressClick}
                />
            </Form.Item>

            <Form.Item name="addressDetail">
                <Input size="large" placeholder="상세주소를 입력하세요." />
            </Form.Item>

            {/* 시군구 */}
            <Form.Item
                label="시군구"
                name="sigunguId"
                rules={[
                    {
                        required: true,
                        message: "시군구를 선택해주세요.",
                    },
                ]}
            >
                <Select
                    size="large"
                    placeholder="시군구를 선택하세요."
                    options={(sigungus || []).map((sigungu) => ({
                        value: sigungu.sigunguId,
                        label: `${sigungu.name}`,
                    }))}
                />
            </Form.Item>

            <Form.Item name="nx" hidden>
                <Input />
            </Form.Item>

            <Form.Item name="ny" hidden>
                <Input />
            </Form.Item>

            <Form.Item name="longitude" hidden>
                <Input />
            </Form.Item>

            <Form.Item name="latitude" hidden>
                <Input />
            </Form.Item>

            <Form.Item
                label="모임 일시"
                name="meetupAt"
                rules={[
                    {
                        required: true,
                        message: "모임 날짜와 시간을 선택해주세요.",
                    },
                ]}
            >
                <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    style={{ width: "100%" }}
                    size="large"
                    placeholder="모임 날짜와 시간을 선택하세요."
                />
            </Form.Item>

            <Form.Item label="상태" name="meetupStatus">
                <Select
                    size="large"
                    options={[
                        {
                            value: "RECRUITING",
                            label: "모집중",
                        },
                        {
                            value: "COMPLETED",
                            label: "모임완료",
                        },

                        {
                            value: "CANCELED",
                            label: "모임취소",
                        },
                        {
                            value: "WEATHER_CANCELED",
                            label: "기상 악화로 인한 취소",
                        },
                    ]}
                />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block>
                {isEdit ? "모임 수정하기" : "모임 등록하기"}
            </Button>
        </Card>
    );
}

export default MeetupRecruitSettings;
