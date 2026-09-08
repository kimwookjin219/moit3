import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Form, Input,Button,Select,DatePicker,message,
  Card,Typography,Checkbox,
} from "antd";

import api from "../../../api/axios";

const { Title, Text } = Typography;

const INTEREST_LIST = [
  { id: 1, name: "운동" },
  { id: 2, name: "여행" },
  { id: 3, name: "게임" },
  { id: 4, name: "독서" },
  { id: 5, name: "맛집" },
  { id: 6, name: "영화" },
  { id: 7, name: "음악" },
  { id: 8, name: "요리" },
];

export default function SocialInfo() {
  const router = useRouter();

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [socialUser, setSocialUser] = useState(null);

  useEffect(() => {loadSocialUser();}, []);

  const loadSocialUser = async () => {
    try {
      const response = await api.get("/api/members/social-info");

      setSocialUser(response.data);

      form.setFieldsValue({
        email: response.data.email,
        nickname: response.data.nickname,
      });
    } catch (error) {
      console.error("소셜 회원정보 조회 실패:", error);

      message.error("소셜 로그인 정보를 불러오지 못했습니다.");

      router.replace("/user/member/login");
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const deviceId = localStorage.getItem("deviceId");

      if (!deviceId) {
        message.error("기기 정보를 확인할 수 없습니다.");
        return;
      }

      const requestData = {
        nickname: values.nickname,
        mobile: values.mobile,
        gender: values.gender,
        birth: values.birth
          ? values.birth.format("YYYY-MM-DD")
          : null,
        interestIds: values.interestIds || [],
        deviceId: deviceId,
      };

      const response = await api.post("/api/members/social-info",requestData);

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken",response.data.refreshToken);

      message.success("회원가입이 완료되었습니다.");
      router.push("/");
    } catch (error) {
      console.error("소셜 회원가입 실패:", error);

      const errorMessage =
        error.response?.data?.message ||
        "소셜 회원가입에 실패했습니다.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!socialUser) {return null;}

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <Title level={2}>추가 회원정보 입력</Title>

        <Text type="secondary">
          소셜 로그인 회원가입을 완료하기 위해
          추가 정보를 입력해주세요.
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 30 }}
        >
          <Form.Item label="이메일" name="email">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="닉네임"
            name="nickname"
            rules={[
              {
                required: true,
                message: "닉네임을 입력해주세요.",
              },
            ]}
          >
            <Input placeholder="닉네임을 입력해주세요." />
          </Form.Item>

          <Form.Item
            label="전화번호"
            name="mobile"
            rules={[
              {
                required: true,
                message: "전화번호를 입력해주세요.",
              },
            ]}
          >
            <Input placeholder="01012345678" />
          </Form.Item>

          <Form.Item
            label="성별"
            name="gender"
            rules={[
              {
                required: true,
                message: "성별을 선택해주세요.",
              },
            ]}
          >
            <Select placeholder="성별을 선택해주세요.">
              <Select.Option value="M">
                남성
              </Select.Option>

              <Select.Option value="F">
                여성
              </Select.Option>

              <Select.Option value="N">
                선택 안 함
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="생년월일"
            name="birth"
            rules={[
              {
                required: true,
                message: "생년월일을 선택해주세요.",
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              placeholder="생년월일"
            />
          </Form.Item>

          <Form.Item
            label="관심사"
            name="interestIds"
            rules={[
              {
                required: true,
                message: "관심사를 하나 이상 선택해주세요.",
              },
            ]}
          >
            <Checkbox.Group
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {INTEREST_LIST.map((interest) => (
                <Checkbox
                  key={interest.id}
                  value={interest.id}
                >
                  {interest.name}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              회원가입 완료
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}