import React, { useEffect } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Typography,
  Modal,
  message,
} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';

import {
  deleteAccountRequest,
  resetDeleteAccount,
} from '../../../../reducers/userReducer';

const { Title } = Typography;

function UserMyMemberDeletePage() {

  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const router = useRouter();

  const deleteAccount = useSelector(
    (state) => state.user?.deleteAccount
  );

  const loading = deleteAccount?.loading ?? false;
  const success = deleteAccount?.success ?? false;
  const error = deleteAccount?.error ?? null;


  // =========================
  // 회원 탈퇴 성공
  // =========================
  useEffect(() => {

    if (!success) {
      return;
    }

    message.success('회원탈퇴가 완료되었습니다.');

    dispatch(resetDeleteAccount());

    router.push('/user/member/login');

  }, [success, dispatch, router]);


  // =========================
  // 회원 탈퇴 실패
  // =========================
  useEffect(() => {

    if (!error) {
      return;
    }

    message.error(error);

  }, [error]);


  // =========================
  // 회원 탈퇴
  // =========================
  const handleSubmit = (values) => {

    Modal.confirm({
      title: '회원 탈퇴',
      icon: <ExclamationCircleOutlined />,

      content: (
        <div>
          <p>정말 탈퇴하시겠습니까?</p>
          <p style={{ color: '#ff4d4f' }}>
            탈퇴 후에는 계정을 복구하기 어렵습니다.
          </p>
        </div>
      ),

      okText: '확인',
      cancelText: '취소',

      okButtonProps: {
        danger: true,
      },

      onOk: () => {

        return new Promise((resolve) => {

          dispatch(
            deleteAccountRequest({
              password: values.password,
            })
          );

          resolve();

        });
      },
    });
  };


  // =========================
  // 취소
  // =========================
  const handleCancel = () => {

    if (loading) {
      return;
    }

    router.back();
  };


  return (
    <div className="mypage-main-content">

      <Card className="mypage-user-info">

        <Title level={3} className="member-edit-title">
          회원 탈퇴
        </Title>


        {/* 탈퇴 안내 */}
        <Alert
          className="withdraw-notice"
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message="회원 탈퇴 안내"
          description={
            <ul>
              <li>탈퇴 후에는 로그인이 불가능합니다.</li>
              <li>작성한 게시글과 댓글은 삭제되지 않습니다.</li>
              <li>회원 정보는 탈퇴 회원으로 처리됩니다.</li>
              <li>탈퇴 후에는 복구가 어렵습니다.</li>
            </ul>
          }
        />


        {/* 탈퇴 폼 */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >

          <Row gutter={[20, 0]}>

            <Col xs={24} md={12}>

              <Form.Item
                label="비밀번호 확인"
                name="password"
                rules={[
                  {
                    required: true,
                    message: '현재 비밀번호를 입력해주세요.',
                  },
                ]}
              >

                <Input.Password
                  placeholder="현재 비밀번호를 입력하세요."
                  disabled={loading}
                />

              </Form.Item>

            </Col>

          </Row>


          {/* 버튼 */}
          <div className="mypage-btn-group">

            <Button
              onClick={handleCancel}
              disabled={loading}
            >
              취소
            </Button>

            <Button
              danger
              htmlType="submit"
              loading={loading}
            >
              회원 탈퇴
            </Button>

          </div>

        </Form>

      </Card>

    </div>
  );
}

export default UserMyMemberDeletePage;