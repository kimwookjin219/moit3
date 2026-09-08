import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, Progress, Typography, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';

import {
  changePasswordRequest,
  checkPasswordLeakRequest,
  resetChangePassword,
  resetPasswordLeak,
  getMyPageRequest,
} from '../../../../reducers/userReducer';

const { Title, Text } = Typography;

function UserMyMemberPasswordChangePage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [form] = Form.useForm();

  // 입력값
  const [newPassword, setNewPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');

  // Redux 상태
  const userState = useSelector((state) => state.user);


  const {
    loading,
    error,
    success,
  } = userState.changePassword || {
    loading: false,
    error: null,
    success: false,
  };
  const {
    checking,
    checked,
    leaked,
    count,
    error: passwordLeakError,
  } = useSelector((state) => state.user.passwordLeak);

  // =========================================================
  // 비밀번호 강도 계산
  // =========================================================
  const getPasswordStrength = (password) => {
    if (!password) {
      return {
        percent: 0,
        text: '입력해주세요.',
      };
    }

    let score = 0;

    // 길이
    if (password.length >= 8) score++;

    // 영문
    if (/[a-zA-Z]/.test(password)) score++;

    // 숫자
    if (/[0-9]/.test(password)) score++;

    // 특수문자
    if (/[!@#$%^&*(),.?":{}|<>_\-\\[\]\/+=~`']/g.test(password)) {
      score++;
    }

    if (score <= 1) {
      return {
        percent: 25,
        text: '약함',
      };
    }

    if (score === 2) {
      return {
        percent: 50,
        text: '보통',
      };
    }

    if (score === 3) {
      return {
        percent: 75,
        text: '강함',
      };
    }

    return {
      percent: 100,
      text: '매우 강함',
    };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // =========================================================
  // 새 비밀번호 입력
  // =========================================================
  const handleNewPasswordChange = (e) => {
    const value = e.target.value;

    setNewPassword(value);

    // 비밀번호를 다시 입력하면 기존 유출 검사 결과 초기화
    dispatch(resetPasswordLeak());
  };

  // =========================================================
  // 비밀번호 유출 검사
  // =========================================================
  const handlePasswordLeakCheck = () => {
    if (!newPassword) {return;}

    dispatch(checkPasswordLeakRequest(newPassword));
  };

  // =========================================================
  // 비밀번호 변경
  // =========================================================
  const handleSubmit = (values) => {

    if (values.newPassword !== values.passwordCheck) {
      console.log("새 비밀번호 불일치");
      return;
    }

    if (leaked) {
      console.log("유출된 비밀번호");
      return;
    }

    // console.log("===== changePasswordRequest DISPATCH =====");

    dispatch(
      changePasswordRequest({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
    );
  };

  // =========================================================
  // 비밀번호 변경 성공
  // =========================================================
  useEffect(() => {
    if (success) {
      message.success('비밀번호가 변경되었습니다.');

      dispatch(resetChangePassword());
      dispatch(resetPasswordLeak());

      router.push('/user/mypage/member/mypage');
    }
  }, [success, dispatch, router]);

  // =========================================================
  // 비밀번호 변경 실패
  // =========================================================
  const handleCancel = () => {
    dispatch(resetChangePassword());
    dispatch(resetPasswordLeak());

    router.push('/user/mypage');
  };

  // =========================================================
  // 비밀번호 일치 여부
  // =========================================================
  const isPasswordMatched = newPassword && passwordCheck && newPassword === passwordCheck;

  const isPasswordMismatch = newPassword && passwordCheck && newPassword !== passwordCheck;

  return (
    <div className="mypage-password">
      <Card className="mypage-user-info">

        <Title level={3} className="member-edit-title">
          비밀번호 변경
        </Title>

        {/* =================================================
            변경 오류
        ================================================= */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          className="password-change-form"
          onFinish={handleSubmit}
        >

          {/* =================================================
              현재 비밀번호
          ================================================= */}
          <Form.Item
            label="현재 비밀번호"
            name="currentPassword"
            rules={[
              {
                required: true,
                message: '현재 비밀번호를 입력해주세요.',
              },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="현재 비밀번호 입력"
            />
          </Form.Item>

          {/* =================================================
              새 비밀번호
          ================================================= */}
          <Form.Item
            label="새 비밀번호"
            name="newPassword"
            rules={[
              {
                required: true,
                message: '새 비밀번호를 입력해주세요.',
              },
              {
                min: 8,
                message: '비밀번호는 8자 이상 입력해주세요.',
              },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="새 비밀번호 입력"
              value={newPassword}
              onChange={handleNewPasswordChange}
              onBlur={handlePasswordLeakCheck}
            />
          </Form.Item>

          {/* =================================================
              비밀번호 강도
          ================================================= */}
          <div
            style={{
              marginTop: -12,
              marginBottom: 20,
            }}
          >
            <Progress
              percent={passwordStrength.percent}
              showInfo={false}
              size="small"
            />

            <Text type="secondary">
              비밀번호 강도: {passwordStrength.text}
            </Text>
          </div>

          {/* =================================================
              비밀번호 유출 검사
          ================================================= */}
          {checking && (
            <Alert
              message="비밀번호 유출 여부를 확인하고 있습니다."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          {!checking && checked && !leaked && (
            <Alert
              message="안전한 비밀번호입니다."
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          {!checking && checked && leaked && (
            <Alert
              message={
                `사용된 적이 있는 비밀번호입니다. ` +
                `다른 비밀번호를 사용해주세요.`
              }
              description={
                count
                  ? `해당 비밀번호는 ${count.toLocaleString()}회 이상 유출된 것으로 확인되었습니다.`
                  : undefined
              }
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          {passwordLeakError && (
            <Alert
              message={passwordLeakError}
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          {/* =================================================
              새 비밀번호 확인
          ================================================= */}
          <Form.Item
            label="새 비밀번호 확인"
            name="passwordCheck"
            rules={[
              {
                required: true,
                message: '새 비밀번호를 다시 입력해주세요.',
              },
              {
                validator: (_, value) => {
                  if (!value || value === newPassword) {return Promise.resolve();}

                  return Promise.reject(new Error('새 비밀번호가 일치하지 않습니다.'));
                },
              },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="새 비밀번호 확인"
              value={passwordCheck}
              onChange={(e) =>setPasswordCheck(e.target.value)}
            />
          </Form.Item>

          {/* =================================================
              비밀번호 일치 여부
          ================================================= */}
          {isPasswordMatched && (
            <Text type="success">
              비밀번호가 일치합니다.
            </Text>
          )}

          {isPasswordMismatch && (
            <Text type="danger">
              비밀번호가 일치하지 않습니다.
            </Text>
          )}

          {/* =================================================
              버튼
          ================================================= */}
          <div className="mypage-btn-group">

            <Button
              onClick={handleCancel}
            >
              취소
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!isPasswordMatched ||leaked ||checking}
            >
              변경하기
            </Button>

          </div>
        </Form>
      </Card>
    </div>
  );
}

export default UserMyMemberPasswordChangePage;