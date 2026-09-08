import React, { useEffect, useState } from "react";
import { Button, Card, Input, Typography, message } from "antd";
import { MailOutlined, SafetyOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";

import {
    findIdEmailSendRequest,emailVerifyRequest,findIdRequest,
    resetEmailVerification,resetFindId,
} from "../../../reducers/userReducer";

const { Title, Text } = Typography;

function FindId() {

    const dispatch = useDispatch();
    const {emailVerification, findId} = useSelector((state) => state.user);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");

    // =========================
    // 이메일 인증번호 발송
    // =========================
    const handleSendCode = () => {
        if (!email.trim()) {
            message.warning("이메일을 입력해주세요.");
            return;
        }
        dispatch(findIdEmailSendRequest(email.trim()));
    };

    // =========================
    // 이메일 인증
    // =========================
    const handleVerifyCode = () => {
        if (!code.trim()) {
            message.warning("인증번호를 입력해주세요.");
            return;
        }
        dispatch(emailVerifyRequest({email,code}));
    };

    // =========================
    // 아이디 찾기
    // =========================
    const handleFindId = () => {
        if (!emailVerification.verified) {
            message.warning("이메일 인증을 먼저 완료해주세요.");
            return;
        }
        dispatch(findIdRequest(email));
    };

    // =========================
    // 이메일 인증 성공
    // =========================
    useEffect(() => {
        if (emailVerification.verified) {
            message.success("이메일 인증이 완료되었습니다.");
        }
    }, [emailVerification.verified]);

    // =========================
    // 이메일 인증 오류
    // =========================
    useEffect(() => {
        if (emailVerification.error) {
            message.error(emailVerification.error);
        }
    }, [emailVerification.error]);

    // =========================
    // 아이디 찾기 오류
    // =========================
    useEffect(() => {
        if (findId.error) {
            message.error(findId.error);
        }
    }, [findId.error]);

    // =========================
    // 페이지 종료 시 상태 초기화
    // =========================
    useEffect(() => {
        return () => {
            dispatch(resetEmailVerification());
            dispatch(resetFindId());
        };
    }, [dispatch]);

    return (
        <div className="find-id-page">
            <Card className="find-id-card">

                <Title level={2}>
                    아이디 찾기
                </Title>

                <Text type="secondary">
                    가입할 때 사용한 이메일을 인증해주세요.
                </Text>

                {/* 이메일 */}
                <div className="find-id-form">
                    <Input
                        size="large"
                        prefix={<MailOutlined />}
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            dispatch(resetEmailVerification());
                            dispatch(resetFindId());
                        }}
                        disabled={emailVerification.verified}
                    />

                    <Button
                        type="primary"
                        size="large"
                        block
                        loading={emailVerification.sending}
                        onClick={handleSendCode}
                        disabled={emailVerification.verified}
                    >
                        인증번호 받기
                    </Button>
                </div>

                {/* 인증번호 */}
                {emailVerification.sent && !emailVerification.verified && (
                    <div className="find-id-form">
                        <Input
                            size="large"
                            prefix={<SafetyOutlined />}
                            placeholder="인증번호 6자리"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            maxLength={6}
                        />

                        <Button
                            size="large"
                            block
                            loading={emailVerification.verifying}
                            onClick={handleVerifyCode}
                        >
                            이메일 인증
                        </Button>
                    </div>
                )}

                {/* 인증 완료 */}
                {emailVerification.verified && (
                    <div className="find-id-verified">
                        <Text type="success">
                            ✓ 이메일 인증이 완료되었습니다.
                        </Text>
                    </div>
                )}

                {/* 아이디 찾기 */}
                {emailVerification.verified && !findId.result && (
                    <Button
                        type="primary"
                        size="large"
                        block
                        loading={findId.loading}
                        onClick={handleFindId}
                    >
                        아이디 찾기
                    </Button>

                )}

                {/* 아이디 결과 */}
                {findId.result && (
                    <div className="find-id-result">

                        <Text type="secondary">
                            회원님의 아이디
                        </Text>

                        <Title level={3}>
                            {findId.result}
                        </Title>

                    </div>
                )}
            </Card>
        </div>
    );
}

export default FindId;