import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import {
    Form,
    Input,
    Button,
    Card,
    DatePicker,
    Typography,
    message,
    Divider,
    Space,
    Progress,
    Radio,
} from "antd";

import {
    CheckOutlined,
    MailOutlined,
    LockOutlined,
    UserOutlined,
    PhoneOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import {
    signupRequest,
    emailSendRequest,
    emailVerifyRequest,
    checkLoginIdRequest,
    checkEmailRequest,
    checkNicknameRequest,
    checkMobileRequest,
    resetDuplicateCheck,
    resetEmailVerification,
    checkPasswordLeakRequest,
    resetPasswordLeak,
} from "../../../reducers/userReducer";

const { Title, Text } = Typography;


// =========================================================
// 비밀번호 강도 계산
// =========================================================
const getPasswordStrength = (password) => {
    if (!password) {
        return {
            score: 0,
            percent: 0,
            text: "",
        };
    }

    let score = 0;

    // 길이
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // 대문자
    if (/[A-Z]/.test(password)) score++;

    // 소문자
    if (/[a-z]/.test(password)) score++;

    // 숫자
    if (/[0-9]/.test(password)) score++;

    // 특수문자
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
        return {
            score,
            percent: 25,
            text: "매우 약함",
        };
    }

    if (score === 3) {
        return {
            score,
            percent: 50,
            text: "약함",
        };
    }

    if (score === 4) {
        return {
            score,
            percent: 75,
            text: "보통",
        };
    }

    if (score === 5) {
        return {
            score,
            percent: 90,
            text: "강함",
        };
    }

    return {
        score,
        percent: 100,
        text: "매우 강함",
    };
};


function AdminSignup() {

    const dispatch = useDispatch();
    const router = useRouter();

    const [form] = Form.useForm();


    // =========================================================
    // Redux 상태
    // =========================================================
    const {
        signup,
        emailVerification,
        duplicateCheck,
        passwordLeak,
    } = useSelector((state) => state.user);

    const {
        loading: signupLoading,
        success: signupSuccess,
        error: signupError,
    } = signup;


    // =========================================================
    // 입력값
    // =========================================================
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");

    const [loginId, setLoginId] = useState("");
    const [nickname, setNickname] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");


    // =========================================================
    // 관리자 회원가입 성공
    // =========================================================
    useEffect(() => {

        if (signupSuccess) {

            message.success("관리자 회원가입이 완료되었습니다.");

            router.push("/user/member/login");
        }

    }, [signupSuccess, router]);


    // =========================================================
    // 아이디 입력
    // =========================================================
    const handleLoginIdChange = (e) => {

        const value = e.target.value;

        setLoginId(value);

        dispatch(resetDuplicateCheck("loginId"));
    };


    // =========================================================
    // 이메일 입력
    // =========================================================
    const handleEmailChange = (e) => {

        const value = e.target.value;

        setEmail(value);
        setVerificationCode("");

        dispatch(resetDuplicateCheck("email"));
        dispatch(resetEmailVerification());
    };


    // =========================================================
    // 닉네임 입력
    // =========================================================
    const handleNicknameChange = (e) => {

        const value = e.target.value;

        setNickname(value);

        dispatch(resetDuplicateCheck("nickname"));
    };


    // =========================================================
    // 전화번호 입력
    // =========================================================
    const handleMobileChange = (e) => {

        const value = e.target.value;

        setMobile(value);

        dispatch(resetDuplicateCheck("mobile"));
    };


    // =========================================================
    // 비밀번호 입력
    // =========================================================
    const handlePasswordChange = (e) => {

        const value = e.target.value;

        setPassword(value);

        dispatch(resetPasswordLeak());
    };


    // =========================================================
    // 비밀번호 유출검사
    // =========================================================
    useEffect(() => {

        if (!password || password.length < 8) {
            return;
        }

        const timer = setTimeout(() => {

            dispatch(checkPasswordLeakRequest(password));

        }, 700);

        return () => clearTimeout(timer);

    }, [password, dispatch]);


    // =========================================================
    // 아이디 중복확인
    // =========================================================
    const handleCheckLoginId = () => {

        if (!loginId.trim()) {

            message.warning("아이디를 입력해주세요.");

            return;
        }

        dispatch(
            checkLoginIdRequest(
                loginId.trim()
            )
        );
    };


    // =========================================================
    // 이메일 중복확인
    // =========================================================
    const handleCheckEmail = () => {

        if (!email.trim()) {

            message.warning("이메일을 입력해주세요.");

            return;
        }

        dispatch(
            checkEmailRequest(
                email.trim()
            )
        );
    };


    // =========================================================
    // 닉네임 중복확인
    // =========================================================
    const handleCheckNickname = () => {

        if (!nickname.trim()) {

            message.warning("닉네임을 입력해주세요.");

            return;
        }

        dispatch(
            checkNicknameRequest(
                nickname.trim()
            )
        );
    };


    // =========================================================
    // 전화번호 중복확인
    // =========================================================
    const handleCheckMobile = () => {

        if (!mobile.trim()) {

            message.warning("전화번호를 입력해주세요.");

            return;
        }

        dispatch(
            checkMobileRequest(
                mobile.trim()
            )
        );
    };


    // =========================================================
    // 이메일 인증번호 발송
    // =========================================================
    const handleSendEmailCode = () => {

        if (!email.trim()) {

            message.warning("이메일을 입력해주세요.");

            return;
        }

        if (!duplicateCheck.email) {

            message.warning(
                "이메일 중복확인을 먼저 진행해주세요."
            );

            return;
        }

        dispatch(
            emailSendRequest(
                email.trim()
            )
        );
    };


    // =========================================================
    // 이메일 인증번호 확인
    // =========================================================
    const handleVerifyEmail = () => {

        const code =
            form.getFieldValue("verificationCode");

        if (!email.trim()) {

            message.warning("이메일을 입력해주세요.");

            return;
        }

        if (!emailVerification.sent) {

            message.warning(
                "먼저 인증번호를 발송해주세요."
            );

            return;
        }

        if (!verificationCode.trim()) {

            message.warning(
                "인증번호를 입력해주세요."
            );

            return;
        }

        dispatch(
            emailVerifyRequest({
                email: email.trim(),
                code: code.trim(),
            })
        );
    };


    // =========================================================
    // 관리자 회원가입
    // =========================================================
    const handleSignup = (values) => {

        // 아이디 중복확인
        if (!duplicateCheck.loginId) {

            message.error(
                "아이디 중복확인을 완료해주세요."
            );

            return;
        }


        // 이메일 중복확인
        if (!duplicateCheck.email) {

            message.error(
                "이메일 중복확인을 완료해주세요."
            );

            return;
        }


        // 이메일 인증
        if (!emailVerification.verified) {

            message.error(
                "이메일 인증을 완료해주세요."
            );

            return;
        }


        // 닉네임 중복확인
        if (!duplicateCheck.nickname) {

            message.error(
                "닉네임 중복확인을 완료해주세요."
            );

            return;
        }


        // 전화번호 중복확인
        if (!duplicateCheck.mobile) {

            message.error(
                "전화번호 중복확인을 완료해주세요."
            );

            return;
        }


        // 비밀번호 유출검사
        if (!passwordLeak.checked) {

            message.error(
                "비밀번호 보안 검증을 완료해주세요."
            );

            return;
        }


        // 유출된 비밀번호
        if (passwordLeak.leaked) {

            message.error(
                "유출된 비밀번호는 사용할 수 없습니다."
            );

            return;
        }


        // 생년월일
        let birth = null;

        if (values.birth) {

            birth =
                values.birth.format("YYYY-MM-DD");
        }


        // =====================================================
        // 관리자 회원가입 데이터
        // =====================================================
        const signupData = {

            loginId: values.loginId,

            password: values.password,

            nickname: values.nickname,

            email: values.email,

            mobile: values.mobile,

            // 관리자
            memberTypeId: 3,

            gender: values.gender,

            birth: birth,

            profileUrl: "",

        };


        dispatch(
            signupRequest(signupData)
        );
    };


    // =========================================================
    // 비밀번호 강도
    // =========================================================
    const passwordStrength =
        getPasswordStrength(password);


    // =========================================================
    // 화면
    // =========================================================
    return (

        <div
            style={{
                maxWidth: "900px",
                margin: "50px auto",
                padding: "0 20px",
            }}
        >

            <Card>


                {/* =================================================
                    제목
                ================================================= */}
                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "40px",
                    }}
                >

                    <Title level={2}>
                        MOIT 관리자 회원가입
                    </Title>

                    <Text type="secondary">
                        MOIT 관리자 계정을 생성합니다.
                    </Text>

                </div>


                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSignup}
                >


                    {/* =================================================
                        관리자 계정
                    ================================================= */}
                    <Divider orientation="left">
                        관리자 계정
                    </Divider>


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

                        <Space.Compact
                            style={{
                                width: "100%",
                            }}
                        >

                            <Input
                                prefix={
                                    <UserOutlined />
                                }
                                placeholder="아이디를 입력해주세요."
                                value={loginId}
                                onChange={
                                    handleLoginIdChange
                                }
                            />

                            <Button
                                type="primary"
                                onClick={
                                    handleCheckLoginId
                                }
                            >
                                중복확인
                            </Button>

                        </Space.Compact>

                    </Form.Item>


                    {duplicateCheck.loginId === true && (

                        <Text type="success">

                            <CheckOutlined />

                            {" "}
                            사용 가능한 아이디입니다.

                        </Text>

                    )}


                    {duplicateCheck.loginId === false && (

                        <Text type="danger">
                            이미 사용 중인 아이디입니다.
                        </Text>

                    )}


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
                            {
                                min: 8,
                                message:
                                    "비밀번호는 8자 이상 입력해주세요.",
                            },
                        ]}
                        hasFeedback
                    >

                        <Input.Password
                            prefix={
                                <LockOutlined />
                            }
                            placeholder="비밀번호를 입력해주세요."
                            onChange={
                                handlePasswordChange
                            }
                        />

                    </Form.Item>


                    {/* 비밀번호 강도 */}
                    {password && (

                        <div
                            style={{
                                marginTop: "-10px",
                                marginBottom: "15px",
                            }}
                        >

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    marginBottom: "4px",
                                }}
                            >

                                <Text type="secondary">
                                    비밀번호 강도
                                </Text>

                                <Text strong>
                                    {passwordStrength.text}
                                </Text>

                            </div>

                            <Progress
                                percent={
                                    passwordStrength.percent
                                }
                                showInfo={false}
                                size="small"
                            />

                        </div>

                    )}


                    {/* 비밀번호 유출검사 */}
                    {passwordLeak.checking && (

                        <div
                            style={{
                                marginBottom: "10px",
                            }}
                        >

                            <Text type="secondary">
                                비밀번호 유출 여부 확인 중...
                            </Text>

                        </div>

                    )}


                    {passwordLeak.checked &&
                        !passwordLeak.leaked && (

                        <div
                            style={{
                                marginBottom: "10px",
                            }}
                        >

                            <Text type="success">

                                <CheckOutlined />

                                {" "}
                                유출되지 않은
                                안전한 비밀번호입니다.

                            </Text>

                        </div>

                    )}


                    {passwordLeak.checked &&
                        passwordLeak.leaked && (

                        <div
                            style={{
                                marginBottom: "10px",
                            }}
                        >

                            <Text type="danger">

                                ⚠ 유출된 비밀번호입니다.

                                <br />

                                <strong>
                                    총{" "}
                                    {passwordLeak.count.toLocaleString()}
                                    회
                                </strong>

                                {" "}
                                유출된 것으로 확인되었습니다.

                                <br />

                                다른 비밀번호를 사용해주세요.

                            </Text>

                        </div>

                    )}


                    {passwordLeak.error && (

                        <div
                            style={{
                                marginBottom: "10px",
                            }}
                        >

                            <Text type="danger">
                                {passwordLeak.error}
                            </Text>

                        </div>

                    )}


                    {/* 비밀번호 확인 */}
                    <Form.Item
                        label="비밀번호 확인"
                        name="passwordConfirm"
                        dependencies={[
                            "password",
                        ]}
                        hasFeedback
                        rules={[
                            {
                                required: true,
                                message:
                                    "비밀번호를 다시 입력해주세요.",
                            },
                            ({ getFieldValue }) => ({

                                validator(_, value) {

                                    if (
                                        !value ||
                                        getFieldValue(
                                            "password"
                                        ) === value
                                    ) {

                                        return Promise.resolve();

                                    }

                                    return Promise.reject(
                                        new Error(
                                            "비밀번호가 일치하지 않습니다."
                                        )
                                    );

                                },

                            }),
                        ]}
                    >

                        <Input.Password
                            prefix={
                                <LockOutlined />
                            }
                            placeholder="비밀번호를 다시 입력해주세요."
                        />

                    </Form.Item>


                    {/* =================================================
                        개인정보
                    ================================================= */}
                    <Divider orientation="left">
                        관리자 정보
                    </Divider>


                    {/* 닉네임 */}
                    <Form.Item
                        label="닉네임"
                        name="nickname"
                        rules={[
                            {
                                required: true,
                                message:
                                    "닉네임을 입력해주세요.",
                            },
                        ]}
                    >

                        <Space.Compact
                            style={{
                                width: "100%",
                            }}
                        >

                            <Input
                                prefix={
                                    <UserOutlined />
                                }
                                placeholder="닉네임을 입력해주세요."
                                value={nickname}
                                onChange={
                                    handleNicknameChange
                                }
                            />

                            <Button
                                type="primary"
                                onClick={
                                    handleCheckNickname
                                }
                            >
                                중복확인
                            </Button>

                        </Space.Compact>

                    </Form.Item>


                    {duplicateCheck.nickname === true && (

                        <Text type="success">

                            <CheckOutlined />

                            {" "}
                            사용 가능한 닉네임입니다.

                        </Text>

                    )}


                    {duplicateCheck.nickname === false && (

                        <Text type="danger">
                            이미 사용 중인 닉네임입니다.
                        </Text>

                    )}


                    {/* =================================================
                        이메일
                    ================================================= */}
                    <Divider orientation="left">
                        이메일 인증
                    </Divider>


                    <Form.Item
                        label="이메일"
                        name="email"
                        rules={[
                            {
                                required: true,
                                message:
                                    "이메일을 입력해주세요.",
                            },
                            {
                                type: "email",
                                message:
                                    "올바른 이메일 형식을 입력해주세요.",
                            },
                        ]}
                    >

                        <Space.Compact
                            style={{
                                width: "100%",
                            }}
                        >

                            <Input
                                prefix={
                                    <MailOutlined />
                                }
                                placeholder="이메일을 입력해주세요."
                                value={email}
                                onChange={
                                    handleEmailChange
                                }
                            />

                            <Button
                                onClick={
                                    handleCheckEmail
                                }
                            >
                                중복확인
                            </Button>

                        </Space.Compact>

                    </Form.Item>

                    {duplicateCheck.email === true && (

                        <Text type="success">

                            <CheckOutlined />

                            {" "}
                            사용 가능한 이메일입니다.

                        </Text>

                    )}


                    {duplicateCheck.email === false && (

                        <Text type="danger">
                            이미 사용 중인 이메일입니다.
                        </Text>

                    )}


                    {/* 인증번호 */}
                    <Form.Item
                        label="이메일 인증번호"
                        name="verificationCode"
                    >

                        <Space.Compact
                            style={{
                                width: "100%",
                            }}
                        >

                            <Input
                                placeholder="인증번호 6자리를 입력해주세요."
                                maxLength={6}
                                value={verificationCode}
                                onChange={(e) =>
                                    setVerificationCode(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    !emailVerification.sent
                                }
                            />

                            <Button
                                type="primary"
                                loading={
                                    emailVerification.sending
                                }
                                onClick={
                                    handleSendEmailCode
                                }
                                disabled={
                                    !duplicateCheck.email
                                }
                            >
                                인증번호 발송
                            </Button>

                            <Button
                                type="primary"
                                loading={
                                    emailVerification.verifying
                                }
                                onClick={
                                    handleVerifyEmail
                                }
                                disabled={
                                    !emailVerification.sent
                                }
                            >
                                인증확인
                            </Button>

                        </Space.Compact>

                    </Form.Item>


                    {emailVerification.verified && (

                        <Text type="success">

                            <CheckOutlined />

                            {" "}
                            이메일 인증이 완료되었습니다.

                        </Text>

                    )}


                    {emailVerification.error && (

                        <div
                            style={{
                                color: "#ff4d4f",
                                marginTop: "8px",
                            }}
                        >
                            {emailVerification.error}
                        </div>

                    )}


                    {/* =================================================
                        전화번호
                    ================================================= */}
                    <Form.Item
                        label="전화번호"
                        name="mobile"
                        rules={[
                            {
                                required: true,
                                message:
                                    "전화번호를 입력해주세요.",
                            },
                        ]}
                    >

                        <Space.Compact
                            style={{
                                width: "100%",
                            }}
                        >

                            <Input
                                prefix={
                                    <PhoneOutlined />
                                }
                                placeholder="전화번호를 입력해주세요."
                                value={mobile}
                                onChange={
                                    handleMobileChange
                                }
                            />

                            <Button
                                type="primary"
                                onClick={
                                    handleCheckMobile
                                }
                            >
                                중복확인
                            </Button>

                        </Space.Compact>

                    </Form.Item>


                    {duplicateCheck.mobile === true && (

                        <Text type="success">

                            <CheckOutlined />

                            {" "}
                            사용 가능한 전화번호입니다.

                        </Text>

                    )}


                    {duplicateCheck.mobile === false && (

                        <Text type="danger">
                            이미 사용 중인 전화번호입니다.
                        </Text>

                    )}


                    {/* =================================================
                        생년월일
                    ================================================= */}
                    <Form.Item
                        label="생년월일"
                        name="birth"
                        rules={[
                            {
                                required: true,
                                message:
                                    "생년월일을 입력해주세요.",
                            },
                        ]}
                    >

                        <DatePicker
                            style={{
                                width: "100%",
                            }}
                            format="YYYY-MM-DD"
                            placeholder="생년월일을 입력해주세요."
                            disabledDate={(current) =>
                                current &&
                                current >
                                    dayjs().endOf("day")
                            }
                        />

                    </Form.Item>

                    {/* 성별 */}
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
                        <Radio.Group>
                            <Radio value="M">
                                남성
                            </Radio>

                            <Radio value="F">
                                여성
                            </Radio>
                        </Radio.Group>
                    </Form.Item>


                    {/* =================================================
                        회원가입
                    ================================================= */}
                    <Form.Item
                        style={{
                            marginTop: "40px",
                        }}
                    >

                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={signupLoading}
                        >
                            관리자 회원가입
                        </Button>

                    </Form.Item>


                    {/* 로그인 */}
                    <div
                        style={{
                            textAlign: "center",
                        }}
                    >

                        <Text type="secondary">
                            이미 관리자 계정이 있으신가요?
                        </Text>

                        <Button
                            type="link"
                            onClick={() =>
                                router.push(
                                    "/user/member/login"
                                )
                            }
                        >
                            관리자 로그인
                        </Button>

                    </div>


                    {/* 회원가입 에러 */}
                    {signupError && (

                        <div
                            style={{
                                marginTop: "20px",
                                textAlign: "center",
                                color: "#ff4d4f",
                            }}
                        >
                            {signupError}
                        </div>

                    )}

                </Form>

            </Card>

        </div>
    );
}

export default AdminSignup;