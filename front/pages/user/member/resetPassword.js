import React, { useEffect, useState } from "react";
import { Button,Card,Input, Typography,message, Progress} from "antd";

import {LockOutlined, CheckOutlined} from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import {
    findPasswordRequest,resetFindPassword,
    checkPasswordLeakRequest, resetPasswordLeak
} from "../../../reducers/userReducer";

const { Title, Text } = Typography;

// =========================
// 비밀번호 강도 계산
// =========================
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

    // 영문 대문자
    if (/[A-Z]/.test(password)) score++;

    // 영문 소문자
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

function ResetPassword() {

    const dispatch = useDispatch();
    const router = useRouter();

    // =========================
    // URL email
    // =========================
    const email = router.query.email;

    // =========================
    // 비밀번호 찾기 Redux 상태
    // =========================
    const findPassword = useSelector(
        (state) => state.user?.findPassword || {
                loading: false,
                success: false,
                error: null,
            }
    );

    const passwordLeak = useSelector(
        (state) => state.user?.passwordLeak || {
            checking: false,
            checked: false,
            leaked: false,
            count: 0,
            error: null,
        }
    );

    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    // =========================
    // 비밀번호 입력 변경
    // =========================
    const handlePasswordChange = (e) => {

        const value = e.target.value;

        setPassword(value);

        // 비밀번호가 변경되면 기존 검사 결과 초기화
        dispatch(resetPasswordLeak());
    };
    // =========================
    // 비밀번호 유출검사
    // =========================
    useEffect(() => {

        // 비밀번호가 없거나 8자 미만이면 검사하지 않음
        if (!password || password.length < 8) {
            return;
        }

        // 입력이 멈춘 후 700ms 뒤 검사
        const timer = setTimeout(() => {

            // console.log("===== 비밀번호 유출검사 요청 =====");

            dispatch(checkPasswordLeakRequest(password));

        }, 700);

        // 비밀번호를 다시 입력하면 기존 타이머 제거
        return () => clearTimeout(timer);

    }, [password, dispatch]);

    // =========================
    // 비밀번호 변경
    // =========================
    const handleResetPassword = () => {

        // URL에서 이메일이 아직 준비되지 않은 경우
        if (!email) {
            message.error("이메일 정보를 찾을 수 없습니다.");
            return;
        }

        // 비밀번호
        if (!password) {
            message.warning("새 비밀번호를 입력해주세요.");
            return;
        }

        if (password.length < 8) {
            message.warning("비밀번호는 8자 이상 입력해주세요.");
            return;
        }

        // 비밀번호 확인
        if (!passwordConfirm) {
            message.warning("비밀번호 확인을 입력해주세요.");
            return;
        }

        // 비밀번호 일치 여부
        if (password !== passwordConfirm) {
            message.error("비밀번호가 일치하지 않습니다.");
            return;
        }

        // 유출검사 진행 중
        if (passwordLeak.checking) {
            message.warning("비밀번호 보안 검사를 기다려주세요.");
            return;
        }

        // 유출검사 미완료
        if (!passwordLeak.checked) {
            message.error("비밀번호 보안 검사를 완료해주세요.");
            return;
        }

        // 유출된 비밀번호
        if (passwordLeak.leaked) {
            message.error("유출된 비밀번호는 사용할 수 없습니다.");
            return;
        }

        const resetData = {email: email, password: password};

        // console.log("===== 비밀번호 변경 요청 =====");

        dispatch(findPasswordRequest(resetData));
    };

    // =========================
    // 변경 성공
    // =========================
    useEffect(() => {

        if (!findPassword.success) { return;}

        message.success("비밀번호가 변경되었습니다.");

        dispatch(resetFindPassword());

        router.push("/user/member/login");

    }, [findPassword.success,dispatch,router]);

    // =========================
    // 변경 실패
    // =========================
    useEffect(() => {

        if (!findPassword.error) {return;}

        message.error(findPassword.error);
    }, [findPassword.error]);

    // =========================
    // 페이지 종료
    // =========================
    useEffect(() => {

        return () => {dispatch(resetFindPassword());};

    }, [dispatch]);

    // =========================
    // URL 로딩 전
    // =========================
    if (!router.isReady) { return null;}

    const passwordStrength = getPasswordStrength(password);

    // =========================
    // 이메일 없음
    // =========================
    if (!email) {
        return (
            <div
                style={{
                    maxWidth: "500px",
                    margin: "80px auto",
                    padding: "0 20px",
                }}
            >
                <Card>
                    <Title level={2}>
                        비밀번호 변경
                    </Title>

                    <Text type="danger">
                        이메일 정보가 없습니다.
                    </Text>

                    <Button
                        type="primary"
                        block
                        style={{marginTop: "20px",}}
                        onClick={() =>router.push("/user/member/findPassword")}
                    >
                        비밀번호 찾기로 이동
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div
            className="reset-password-page"
            style={{
                maxWidth: "500px",
                margin: "80px auto",
                padding: "0 20px",
            }}
        >
            <Card className="reset-password-card">
                <Title level={2}>
                    비밀번호 변경
                </Title>

                <Text type="secondary">
                    새로운 비밀번호를 입력해주세요.
                </Text>

                {/* 이메일 */}
                <div style={{marginTop: "20px", marginBottom: "15px",}}>
                    <Text strong>
                        인증 이메일
                    </Text>

                    <Input
                        value={email}
                        disabled
                        style={{marginTop: "8px",}}
                    />
                </div>

                {/* 비밀번호 */}
                <div className="reset-password-form">
                    <Input.Password
                        size="large"
                        prefix={<LockOutlined />}
                        placeholder="새 비밀번호"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                    {/* 비밀번호 강도 */}
                    {password && (
                        <div
                            style={{
                                marginTop: "-5px",
                                marginBottom: "15px"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "4px"
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
                                percent={passwordStrength.percent}
                                showInfo={false}
                                size="small"
                            />
                        </div>
                    )}

                    {passwordLeak.checking && (
                        <div style={{ marginBottom: "10px" }}>
                            <Text type="secondary">
                                비밀번호 유출 여부 확인 중...
                            </Text>
                        </div>
                    )}

                    {passwordLeak.checked && !passwordLeak.leaked && (
                        <div style={{ marginBottom: "10px" }}>
                            <Text type="success">
                                <CheckOutlined />
                                {" "}유출되지 않은 안전한 비밀번호입니다.
                            </Text>
                        </div>
                    )}
                    {/* 비밀번호 유출검사 */}
                    {passwordLeak.checked && passwordLeak.leaked && (
                        <div style={{ marginBottom: "10px" }}>
                            <Text type="danger">
                                ⚠ 유출된 비밀번호입니다.
                                <br />
                                <strong>
                                    총 {passwordLeak.count.toLocaleString()}회
                                </strong>
                                {" "}유출된 것으로 확인되었습니다.
                                <br />
                                다른 비밀번호를 사용해주세요.
                            </Text>
                        </div>
                    )}

                    {passwordLeak.error && (
                        <div style={{ marginBottom: "10px" }}>
                            <Text type="danger">
                                {passwordLeak.error}
                            </Text>
                        </div>
                    )}

                    {/* 비밀번호 확인 */}
                    <Input.Password
                        size="large"
                        prefix={<LockOutlined />}
                        placeholder="새 비밀번호 확인"
                        value={passwordConfirm}
                        onChange={(e) =>setPasswordConfirm(e.target.value)}
                        style={{marginTop: "12px"}}
                    />

                    {/* 변경 버튼 */}
                    <Button
                        type="primary"
                        size="large"
                        block
                        loading={findPassword.loading}
                        onClick={handleResetPassword}
                        style={{ marginTop: "20px"}}
                    >
                        비밀번호 변경
                    </Button>
                </div>
            </Card>
        </div>
    );
}

export default ResetPassword;