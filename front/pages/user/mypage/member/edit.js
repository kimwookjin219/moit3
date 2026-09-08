import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import {
  updateMyInfoRequest,
  resetUpdateMyInfo,
  getMyInfoRequest,
  // uploadProfileImageRequest,
  // uploadProfileImageSuccess,
  // resetProfileImage
} from '../../../../reducers/userReducer';

import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Typography,
  Upload,
  message,
} from 'antd';

import {
  CameraOutlined,
  UserOutlined,
} from '@ant-design/icons';

import moment from 'moment';

const { Title, Text } = Typography;

function UserMyMemberEditPage() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const router = useRouter();

  // Redux user
  const {user,updateMyInfo} = useSelector((state) => state.user);

  const loading = updateMyInfo.loading;
  const updateSuccess = updateMyInfo.success;
  const updateError = updateMyInfo.error;
  // const profileImageLoading = profileImage.loading;
  // const profileImageSuccess = profileImage.success;
  // const profileImageError = profileImage.error;

  const [profilePreview, setProfilePreview] = useState(null);
  //const [pendingUpdateData, setPendingUpdateData] = useState(null);

  // 관심사
  const interests = [
    { value: 1, label: '🏃 운동' },
    { value: 2, label: '✈️ 여행' },
    { value: 3, label: '🎮 게임' },
    { value: 4, label: '📚 독서' },
    { value: 5, label: '🍽️ 맛집' },
    { value: 6, label: '🎬 영화' },
    { value: 7, label: '🎵 음악' },
    { value: 8, label: '🍳 요리' },
  ];

  // 회원정보 조회
  useEffect(() => {
      dispatch(getMyInfoRequest());
    
  }, [dispatch]);

  // 회원정보 Redux -> Form
  useEffect(() => {
    if (!user) return;

    const interestIds = (user.interestIds || []).map(Number);

    form.setFieldsValue({
      loginId: user.loginId,
      nickname: user.nickname,
      email: user.email,
      mobile: user.mobile,
      gender: user.gender,

      birth: user.birth
        ? moment(user.birth, 'YYYY-MM-DD')
        : null,

      interests: interestIds,
    });

    const profileUrl = user.profileUrl;

    if (profileUrl) {
      if (profileUrl.startsWith('/images/profile/')) {
        setProfilePreview(
          `http://localhost:8080${profileUrl}`
        );
      } else {
        setProfilePreview(profileUrl);
      }
    } else {
      setProfilePreview(null);
    }
  }, [user, form]);

  // 수정 성공
  useEffect(() => {
    if (!updateSuccess) return;

    message.success('회원정보가 수정되었습니다.');

    dispatch(resetUpdateMyInfo());

    router.push('/user/mypage/member/mypage');
  }, [updateSuccess, dispatch, router]);

  // 수정 실패
  useEffect(() => {
    if (updateError) {
      message.error(updateError);

      dispatch(resetUpdateMyInfo());
    }
  }, [updateError, dispatch]);

  // 프로필 이미지 미리보기
  const [profileFile, setProfileFile] = useState(null);

  const handleProfileChange = (file) => {
    if (!file) return false;

    if (!file.type.startsWith('image/')) {
      message.error('이미지 파일만 선택해주세요.');
      return false;
    }

    // 기존 blob URL 정리
    if (profilePreview && profilePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profilePreview);
    }

    // 미리보기 URL 생성
    const previewUrl = URL.createObjectURL(file);

    // 화면 미리보기 변경
    setProfilePreview(previewUrl);

    // 실제 업로드할 파일 저장
    setProfileFile(file);

    return false;
  };

  // 회원정보 수정
  const handleSubmit = (values) => {

    const formData = new FormData();

    // =========================
    // 기본 회원정보
    // =========================
    formData.append("nickname", values.nickname);
    formData.append("mobile", values.mobile);
    formData.append("gender", values.gender || "");

    // =========================
    // 생년월일
    // =========================
    if (values.birth) {
      formData.append(
        "birth",
        values.birth.format("YYYY-MM-DD")
      );
    }

    // =========================
    // 관심사
    // =========================
    if (values.interests && values.interests.length > 0) {

      values.interests.forEach((id) => {
        formData.append(
          "interestIds",
          String(id)
        );
      });

    }

    // =========================
    // 프로필 이미지
    // =========================
    if (profileFile) {
      formData.append(
        "profileImage",
        profileFile
      );
    }

    // =========================
    // 확인
    // =========================
    // console.log("===== 회원정보 수정 =====");

    for (const [key, value] of formData.entries()) {
      // console.log(key, value);
    }

    // =========================
    // Redux Saga
    // =========================
    dispatch(
      updateMyInfoRequest(formData)
    );
  };
  // // 이미지 업로드
  // useEffect(() => {
  //   if (!profileImageSuccess) return;

  //   console.log('===== 프로필 이미지 업로드 성공 =====');

  //   if (pendingUpdateData) {
  //     console.log('===== 이미지 업로드 후 회원정보 수정 =====');

  //     dispatch(updateMyInfoRequest(pendingUpdateData));
  //   }

  //   setProfileFile(null);
  //   setPendingUpdateData(null);

  //   dispatch(resetProfileImage());

  // }, [profileImageSuccess, pendingUpdateData, dispatch]);

  if (!user) {return null;}

  return (
    <div className="mypage-main-content">
      <Card className="mypage-user-info">

        {/* 제목 */}
        <Title level={3} className="member-edit-title">
          회원정보 수정
        </Title>

        {/* 프로필 / 회원등급 */}
        <div className="mypage-edit-profile">

          {/* 프로필 */}
          <div className="mypage-profile-upload">
            <Avatar
              size={110}
              src={profilePreview}
              icon={!profilePreview && <UserOutlined />}
            />

            <Upload
              showUploadList={false}
              beforeUpload={handleProfileChange}
              accept="image/*"
            >
              <Button
                icon={<CameraOutlined />}
                style={{ marginTop: 14 }}
              >
                프로필 변경
              </Button>
            </Upload>
          </div>

          {/* 회원등급 */}
          <div className="mypage-grade-box">
            <Text type="secondary">
              회원등급
            </Text>

            <div className="mypage-grade">
              {user.memberTypeId === 1
                ? '일반회원'
                : user.memberTypeId === 2
                ? '제휴업체'
                : user.memberTypeId === 3
                ? '관리자'
                : '회원'}
            </div>
          </div>
        </div>

        {/* 회원정보 */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >

          <Row gutter={[20, 0]}>

            {/* 아이디 */}
            <Col xs={24} md={12}>
              <Form.Item
                label="아이디"
                name="loginId"
              >
                <Input disabled />
              </Form.Item>
            </Col>

            {/* 닉네임 */}
            <Col xs={24} md={12}>
              <Form.Item
                label="닉네임"
                name="nickname"
                rules={[
                  {
                    required: true,
                    message: '닉네임을 입력해주세요.',
                  },
                ]}
              >
                <Input placeholder="닉네임을 입력하세요." />
              </Form.Item>
            </Col>

            {/* 이메일 */}
            <Col xs={24} md={12}>
              <Form.Item
                label="이메일"
                name="email"
              >
                <Input
                  type="email"
                  disabled
                />
              </Form.Item>
            </Col>

            {/* 전화번호 */}
            <Col xs={24} md={12}>
              <Form.Item
                label="전화번호"
                name="mobile"
                rules={[
                  {
                    required: true,
                    message: '전화번호를 입력해주세요.',
                  },
                  {
                    pattern: /^010\d{8}$/,
                    message:
                      '010으로 시작하는 11자리 전화번호를 입력해주세요.',
                  },
                ]}
              >
                <Input
                  maxLength={11}
                  placeholder="전화번호를 입력하세요."
                />
              </Form.Item>
            </Col>

            {/* 성별 */}
            <Col xs={24} md={12}>
              <Form.Item
                label="성별"
                name="gender"
              >
                <Radio.Group>
                  <Radio value="M">
                    남성
                  </Radio>

                  <Radio value="F">
                    여성
                  </Radio>

                  <Radio value="N">
                    비공개
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>

            {/* 생년월일 */}
            <Col xs={24} md={12}>
              <Form.Item
                label="생년월일"
                name="birth"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  placeholder="생년월일을 선택하세요"
                />
              </Form.Item>
            </Col>

            {/* 관심사 */}
            <Col span={24}>
              <Form.Item
                label="관심사"
                name="interests"
              >
                <Select
                  mode="multiple"
                  placeholder="관심사를 선택해주세요."
                >
                  {interests.map((interest) => (
                    <Select.Option
                      key={interest.value}
                      value={interest.value}
                    >
                      {interest.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* 버튼 */}
          <div className="mypage-btn-group">
            <Button
              onClick={() => window.history.back()}
              disabled={loading}
            >
              취소
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              저장하기
            </Button>

          </div>
        </Form>
      </Card>
    </div>
  );
}

export default UserMyMemberEditPage;