import React, { useEffect, useState } from "react";
import { Button, Card, Input, Typography, message } from "antd";
import {MailOutlined,SafetyOutlined,} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import {
    findPasswordEmailSendRequest,emailVerifyRequest,resetEmailVerification,
} from "../../../reducers/userReducer";

const { Title, Text } = Typography;

function FindPassword() {

    const dispatch = useDispatch();
    const router = useRouter();

    const { emailVerification } = useSelector((state) => state.user);

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");

    // =========================
    // 인증번호 발송
    // =========================
    const handleSendCode = () => {

        if (!email.trim()) {
            message.warning("이메일을 입력해주세요.");
            return;
        }
        dispatch(findPasswordEmailSendRequest(email.trim()));
    };

    // =========================
    // 이메일 인증
    // =========================
    const handleVerifyCode = () => {

        if (!code.trim()) {
            message.warning("인증번호를 입력해주세요.");
            return;
        }
        dispatch( emailVerifyRequest({ email: email.trim(),code: code.trim(),}));
    };

    // =========================
    // 인증 성공
    // =========================
    useEffect(() => {
        if (emailVerification.verified) {

            message.success("이메일 인증이 완료되었습니다.");

            // 비밀번호 변경 페이지 이동
            router.push(`/user/member/resetPassword?email=${encodeURIComponent(email)}`);
        }
    }, [emailVerification.verified,email,router,]);

    // =========================
    // 인증 오류
    // =========================
    useEffect(() => {
        
        if (emailVerification.error) {message.error(emailVerification.error);}

    }, [emailVerification.error]);

    // =========================
    // 페이지 종료
    // =========================
    useEffect(() => {
        return () => {
            dispatch(resetEmailVerification());};
    }, [dispatch]);

    return (
        <div className="find-password-page">
            <Card className="find-password-card">
                <Title level={2}>
                    비밀번호 찾기
                </Title>

                <Text type="secondary">
                    가입할 때 사용한 이메일을 인증해주세요.
                </Text>

                {/* 이메일 */}
                <div className="find-password-form">
                    <Input
                        size="large"
                        prefix={<MailOutlined />}
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);

                            dispatch(
                                resetEmailVerification()
                            );
                        }}
                        disabled={
                            emailVerification.verified
                        }
                    />

                    <Button
                        type="primary"
                        size="large"
                        block
                        loading={
                            emailVerification.sending
                        }
                        onClick={handleSendCode}
                        disabled={
                            emailVerification.verified
                        }
                    >
                        인증번호 받기
                    </Button>
                </div>

                {/* 인증번호 */}
                {emailVerification.sent && !emailVerification.verified && (
                    <div className="find-password-form">
                        <Input
                            size="large"
                            prefix={
                                <SafetyOutlined />
                            }
                            placeholder="인증번호 6자리"
                            value={code}
                            onChange={(e) =>
                                setCode(
                                    e.target.value
                                )
                            }
                            maxLength={6}
                        />

                        <Button
                            size="large"
                            block
                            loading={
                                emailVerification.verifying
                            }
                            onClick={
                                handleVerifyCode
                            }
                        >
                            이메일 인증
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}

export default FindPassword;