import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { qnaCreateRequest, qnaReset } from '../../../reducers/qnaReducer';
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Space,
  Typography,
  Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

function questionWrite() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [fileList, setFileList] = useState([]);

  const { qna, success, error, loading } = useSelector((state) => state.qna);
  const { type, meetupId } = router.query;

  const isMeetup = type === 'MEETUP';

  const title = isMeetup ? '모임 1:1 문의 등록' : '관리자 1:1 문의 등록';
  
  useEffect(() => {
    if (success && qna?.questionId) {
      const questionId = qna.questionId;

      alert('문의가 등록되었습니다.');

      dispatch(qnaReset());

      router.push(`/user/qna/questionDetail?questionId=${questionId}`);
    }
  }, [success, qna, router, dispatch]);

  useEffect(() => {
    if (error) { 
      alert(error); 
    }
  }, [error]);

  return (
    <div className="qna-write-page">
      <div className="qna-write-header">

        <Title level={2} className="qna-write-title">
          {title}
        </Title>

        <Text type="secondary">문의 내용을 작성해주세요.</Text>
      </div>

      <Card className="qna-write-card">
        <Title level={4}>문의 정보 입력</Title>

        <Form
          layout="vertical"
          onFinish={(values) => {
            if (loading) return;
            if (!window.confirm('문의를 등록하시겠습니까?')) {return;}

            const formData = new FormData();

            formData.append('title', values.title);
            formData.append('content', values.content);
            formData.append('parentId', isMeetup ? Number(meetupId) : 0);
            formData.append('category', isMeetup ? 'MEETUP' : 'ADMIN');
            formData.append('isPublic', values.isPublic ? 'N' : 'Y');

            fileList.forEach((file) => {
              formData.append('images', file.originFileObj);
            });

            dispatch(qnaCreateRequest(formData));
          }}
        >
          <Form.Item
            label="제목"
            name="title"
            rules={[
              {
                required: true,
                message: '제목을 입력해주세요.',
              },
            ]}
          >
            <Input
              size="large"
              placeholder="제목을 입력하세요."
            />
          </Form.Item>

          <Form.Item
            label="문의 내용"
            name="content"
            rules={[
              {
                required: true,
                message: '문의 내용을 입력해주세요.',
              },
            ]}
          >
            <TextArea
              rows={10}
              placeholder="문의 내용을 입력하세요."
            />
          </Form.Item>

          <Form.Item name="isPublic" valuePropName="checked">
            <Checkbox>비공개 문의</Checkbox>
          </Form.Item>

          <Form.Item label="문의 이미지">
            <Space>
              <Upload
                multiple
                beforeUpload={() => false}
                accept="image/*"
                maxCount={3}
                fileList={fileList}
                onChange={({ fileList: newFileList }) => {
                  setFileList(newFileList);
                }}
              >
                <Button icon={<UploadOutlined />}>
                  이미지 선택 (최대 3장)
                </Button>
              </Upload>

            </Space>
          </Form.Item>

          <div className="qna-write-actions">
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>등록하기</Button>
              <Button onClick={() => router.back()}>취소</Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default questionWrite;