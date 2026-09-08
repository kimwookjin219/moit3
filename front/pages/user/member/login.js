import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import {
    Form,Input,Button,
    Card,Radio,Checkbox,
    Typography,message,Divider,
    Space
} from "antd";

import {LockOutlined,UserOutlined} from "@ant-design/icons";

import {loginRequest} from "../../../reducers/userReducer";

const { Title, Text } = Typography;


function Login(){

    const dispatch = useDispatch();
    const router = useRouter();

    const [form] = Form.useForm();

    const getDeviceId = () => {
        let deviceId = localStorage.getItem("deviceId");

        if (!deviceId) {
            deviceId = crypto.randomUUID();
            localStorage.setItem("deviceId", deviceId);
        }

        return deviceId;
    };

    //user 정보 있으면 main page 이동
    const { user, isInitialized}  = useSelector((state) => state.user);

    useEffect(() => {

      if(!isInitialized) return;

      if (user) {
        router.replace("/");
        return;
      }

    }, [user, isInitialized, router]);

    // =========================
    // Redux 상태
    // =========================
    const {
        loading,
        error,
        success,
    } = useSelector((state) => state.user.login);


    // =========================
    // 로그인 탭
    // member = 일반회원
    // admin = 관리자
    // =========================
    const [loginTab, setLoginTab] = useState("member");

    // =========================
    // 아이디 저장
    // =========================
    const [rememberId, setRememberId] = useState(false);

    // =========================
    // 로그인 성공
    // =========================
    useEffect(() => {
        if (!success) return;

        message.success("로그인되었습니다.");
        router.push("/");
    }, [success, router]);

    // =========================
    // 로그인 실패
    // =========================

    useEffect(() => {
        if(error){ message.error(error);}
    }, [error]);


    // =========================
    // 페이지 진입 시
    // 저장된 아이디 불러오기
    // =========================

    useEffect(() => {

        if(typeof window === "undefined"){ return;}

        const savedLoginId =localStorage.getItem("savedLoginId");

        if(savedLoginId){ form.setFieldsValue({loginId: savedLoginId});
            setRememberId(true);
        }
    }, [form]);


    // =========================
    // 로그인 탭 변경
    // =========================
    const handleTabChange = (type) => {setLoginTab(type);};


    // =========================
    // 로그인
    // =========================
    const handleLogin = (values) => {

        const loginId = values.loginId.trim();
        const password = values.password;

        // =========================
        // 회원 유형
        // =========================
        let memberTypeId;

        if(loginTab === "admin"){
            // 관리자
            memberTypeId = null;
        }else{
            // 일반회원 / 제휴업체
            memberTypeId = Number(values.memberTypeId);
        }

        // =========================
        // 아이디 저장
        // =========================
        if(typeof window !== "undefined"){
            if(rememberId){
                localStorage.setItem(
                    "savedLoginId",
                    loginId
                );
            }else{localStorage.removeItem("savedLoginId");}
        }

        // =========================
        // 로그인 요청 데이터
        // =========================
        const loginData = {
            loginId: loginId,
            password: password,
            memberTypeId: memberTypeId,
        };

        // =========================
        // Redux Saga 로그인 요청
        // =========================
        dispatch(loginRequest(loginData));
    };


    // =========================
    // 아이디 찾기
    // =========================
    const handleFindId = () => {
        router.push("/user/member/findId");
    };

    // =========================
    // 비밀번호 찾기
    // =========================
    const handleFindPassword = () => {
        router.push("/user/member/findPassword");
    };

    // =========================
    // 카카오 로그인
    // =========================
    const handleKakaoLogin = () => {
        const deviceId = getDeviceId();

        localStorage.setItem("socialProvider", "KAKAO");

        window.location.href =
            `http://localhost:8080/oauth2/authorization/kakao?deviceId=${encodeURIComponent(deviceId)}`;
    };


    // =========================
    // 네이버 로그인
    // =========================
    const handleNaverLogin = () => {
        const deviceId = getDeviceId();

        localStorage.setItem("socialProvider", "NAVER");

        window.location.href =
            `http://localhost:8080/oauth2/authorization/naver?deviceId=${encodeURIComponent(deviceId)}`;
    };


    // =========================
    // 구글 로그인
    // =========================
    const handleGoogleLogin = () => {
        const deviceId = getDeviceId();

        localStorage.setItem("socialProvider", "GOOGLE");

        window.location.href =
            `http://localhost:8080/oauth2/authorization/google?deviceId=${encodeURIComponent(deviceId)}`;
    }; 

    ///////////////////////////////
    return (
        <div
            style={{
                maxWidth: "500px",
                margin: "80px auto",
                padding: "0 20px",
            }}
        >
            <Card
                style={{
                    borderRadius: "12px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                }}
            >

                {/* 제목 */}
                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "30px",
                    }}
                >

                    <Title level={2}>
                        MOIT 로그인
                    </Title>

                    <Text type="secondary">
                        새로운 모임을 시작해보세요.
                    </Text>

                </div>


                {/* 로그인 유형 */}
                <div
                    style={{
                        display: "flex",
                        borderBottom: "1px solid #f0f0f0",
                        marginBottom: "20px",
                    }}
                >
                    <Button
                        type="text"
                        onClick={() =>
                            handleTabChange("member")
                        }
                        style={{
                            flex: 1,
                            height: "45px",
                            borderRadius: 0,
                            color:
                                loginTab === "member"
                                    ? "#6678f5"
                                    : "#999",
                            fontWeight:
                                loginTab === "member"
                                    ? 600
                                    : 400,
                            borderBottom:
                                loginTab === "member"
                                    ? "2px solid #6678f5"
                                    : "2px solid transparent",
                        }}
                    >
                        일반회원 로그인
                    </Button>

                    <Button
                        type="text"
                        onClick={() =>
                            handleTabChange("admin")
                        }
                        style={{
                            flex: 1,
                            height: "45px",
                            borderRadius: 0,
                            color:
                                loginTab === "admin"
                                    ? "#6678f5"
                                    : "#999",
                            fontWeight:
                                loginTab === "admin"
                                    ? 600
                                    : 400,
                            borderBottom:
                                loginTab === "admin"
                                    ? "2px solid #6678f5"
                                    : "2px solid transparent",
                        }}
                    >
                        관리자 로그인
                    </Button>

                </div>

                {/* 로그인 Form */}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleLogin}
                    initialValues={{
                        memberTypeId: 1,
                    }}
                >

                    {/* 일반회원 / 제휴업체*/}
                    {loginTab === "member" && (
                        <Form.Item
                            name="memberTypeId"
                            style={{
                                marginBottom: "20px",
                            }}
                        >
                            <Radio.Group>
                                <Radio value={1}>
                                    일반회원
                                </Radio>

                                <Radio value={2}>
                                    제휴업체
                                </Radio>
                            </Radio.Group>
                        </Form.Item>
                    )}

                    {/* 관리자 안내 */}
                    {loginTab === "admin" && (
                        <div
                            style={{
                                marginBottom: "20px",
                                padding: "10px 0",
                            }}
                        >
                            <Text type="secondary">
                                관리자 계정으로 로그인합니다.
                            </Text>
                        </div>
                    )}

                    {/* 아이디 */}
                    <Form.Item
                        label="아이디"
                        name="loginId"
                        rules={[
                            {
                                required: true,
                                message:
                                    "아이디를 입력해주세요.",
                            },
                        ]}
                    >
                        <Input
                            prefix={
                                <UserOutlined />
                            }
                            placeholder="아이디"
                            size="large"
                        />
                    </Form.Item>

                    {/* 비밀번호 */}
                    <Form.Item
                        label="비밀번호"
                        name="password"
                        rules={[
                            {
                                required: true,
                                message:
                                    "비밀번호를 입력해주세요.",
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={
                                <LockOutlined />
                            }
                            placeholder="비밀번호"
                            size="large"
                        />
                    </Form.Item>

                    {/* 아이디 저장 */}
                    <div
                        style={{
                            marginTop: "-10px",
                            marginBottom: "20px",
                        }}
                    >
                        <Checkbox
                            checked={rememberId}
                            onChange={(e) =>
                                setRememberId(
                                    e.target.checked
                                )
                            }
                        >
                            아이디 저장
                        </Checkbox>
                    </div>

                    {/* 로그인 버튼 */}
                    <Form.Item
                        style={{
                            marginBottom: "15px",
                        }}
                    >
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={loading}
                            style={{
                                height: "44px",
                                borderRadius: "22px",
                                background: "#6678f5",
                                borderColor: "#6678f5",
                            }}
                        >
                            로그인
                        </Button>
                    </Form.Item>

                    {/* 간편 로그인 */}
                    <Divider
                        style={{
                            margin: "20px 0",
                            fontSize: "11px",
                            color: "#aaa",
                        }}
                    >
                        또는 간편 로그인
                    </Divider>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "10px",
                            width: "100%",
                        }}
                    >
                        {/* 카카오 로그인 */}
                        <img
                            src="/images/kakao.png"
                            alt="Kakao Login"
                            onClick={handleKakaoLogin}
                            style={{
                                width: "32%",
                                maxWidth: "150px",
                                cursor: "pointer",
                            }}
                        />

                        {/* 네이버 로그인 */}
                        <img
                            src="/images/naver.png"
                            alt="Naver Login"
                            onClick={handleNaverLogin}
                            style={{
                                width: "32%",
                                maxWidth: "150px",
                                cursor: "pointer",
                            }}
                        />

                        {/* 구글 로그인 */}
                        <img
                            src="/images/google.png"
                            alt="Google Login"
                            onClick={handleGoogleLogin}
                            style={{
                                width: "32%",
                                maxWidth: "150px",
                                cursor: "pointer",
                            }}
                        />
                    </div>

                    {/* 아이디 / 비밀번호 찾기 */}
                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "20px",
                        }}
                    >
                        <Button
                            type="link"
                            size="small"
                            onClick={handleFindId}
                        >
                            아이디 찾기
                        </Button>

                        <Text type="secondary">
                            |
                        </Text>

                        <Button
                            type="link"
                            size="small"
                            onClick={handleFindPassword}
                        >
                            비밀번호 찾기
                        </Button>
                    </div>

                    {/* 회원가입 */}
                    <div 
                        style={{ 
                            textAlign: "center", 
                            marginTop: "10px", 
                            paddingTop: "15px", 
                            borderTop: "1px solid #f0f0f0", 
                        }} 
                    >
                        <Text type="secondary">
                            {loginTab === "admin"
                                ? "관리자 계정이 없으신가요?"
                                : "계정이 없으신가요?"}
                        </Text>

                        <Button 
                            type="link" 
                            onClick={() => {
                                if (loginTab === "admin") {
                                    router.push("/user/member/admin-signup");
                                } else {
                                    router.push("/user/member/signup");
                                }
                            }}
                        >
                            {loginTab === "admin"
                                ? "관리자 회원가입"
                                : "회원가입"}
                        </Button>
                    </div>

                    {/* 로그인 에러 */}
                    {error && (

                        <div
                            style={{
                                marginTop: "15px",
                                textAlign: "center",
                                color: "#ff4d4f",
                                fontSize: "13px",
                            }}
                        >
                            {error}
                        </div>
                    )}
                </Form>
            </Card>
        </div>
    );
}

export default Login;