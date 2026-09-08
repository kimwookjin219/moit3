import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import {
  qnaDetailRequest,
  qnaUpdateRequest,
} from '../../../reducers/qnaReducer';

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

function questionEdit() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { questionId } = router.query;

  const { qna, loading, success, error } = useSelector(
    (state) => state.qna
  );

  const [form] = Form.useForm();
  const [submitted, setSubmitted] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [deleteImageIds, setDeleteImageIds] = useState([]);

  useEffect(() => {
    if (!router.isReady || !questionId) return;

    dispatch(
      qnaDetailRequest(Number(questionId))
    );
  }, [router.isReady, questionId, dispatch]);

  useEffect(() => {
    if (!qna) return;

    form.setFieldsValue({
      title: qna.title || '',
      content: qna.content || '',
      isPublic: qna.isPublic === 'N',
    });
  }, [qna, form]);

  useEffect(() => {
    if (!submitted || !success) return;

    alert('문의가 수정되었습니다.');

    router.push(
      `/user/qna/questionDetail?questionId=${questionId}`
    );
  }, [submitted, success, router, questionId,]);

  useEffect(() => {
    if (error) {
      setSubmitted(false);
      alert(error);
    }
  }, [error]);

  const isMeetup = qna?.category === 'MEETUP';

  const title = isMeetup
    ? '모임 1:1 문의 수정'
    : '관리자 1:1 문의 수정';

  const handleDeleteImage = (imageId) => {
    setDeleteImageIds((prev) => {
      if (prev.includes(imageId)) {
        return prev.filter((id) => id !== imageId);
      }

      return [...prev, imageId];
    });
  };

  const handleSubmit = (values) => {
    if (!questionId) return;
    if (loading) return;

    if (!window.confirm('문의 내용을 수정하시겠습니까?')) {
      return;
    }

    setSubmitted(true);

    const formData = new FormData();

    formData.append('title', values.title);
    formData.append('content', values.content);
    formData.append(
      'isPublic',
      values.isPublic ? 'N' : 'Y'
    );

    deleteImageIds.forEach((imageId) => {
      formData.append('deleteImageIds', imageId);
    });

    fileList.forEach((file) => {
      formData.append('images', file.originFileObj);
    });

    dispatch(
      qnaUpdateRequest({
        questionId: Number(questionId),
        data: formData,
      })
    );
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="qna-write-page">
      <div className="qna-write-header">

        <Title
          level={2}
          className="qna-write-title"
        >
          {title}
        </Title>

        <Text type="secondary">
          문의 내용을 수정할 수 있습니다.
        </Text>

      </div>

      <Card className="qna-write-card">

        <Title level={4}>
          문의 정보 수정
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
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
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="isPublic"
            valuePropName="checked"
          >
            <Checkbox>
              비공개 문의
            </Checkbox>
          </Form.Item>

          {/* =================================================
              기존 첨부파일
          ================================================= */}
          {qna?.images && qna.images.length > 0 && (

            <Form.Item label="기존 문의 이미지">
              <Space
                direction="vertical"
                style={{ width: '100%' }}
              >

                {qna.images
                  .filter(
                    (image) => !deleteImageIds.includes(image.imageId)
                  )
                  .map((image) => (
                    <div
                      key={image.imageId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #eee',
                        borderRadius: 6,
                        boxSizing: 'border-box',
                      }}
                    >

                      <a
                        href={`http://localhost:8080${image.imagePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        📎 {image.originalName}
                      </a>

                      <Button
                        danger
                        size="small"
                        onClick={() =>
                          handleDeleteImage(image.imageId)
                        }
                      >
                        삭제
                      </Button>
                    </div>
                  ))}
              </Space>
            </Form.Item>
          )}

          {/* =================================================
              새 이미지 첨부
          ================================================= */}
          <Form.Item label="문의 이미지 추가">

            <Space>
              <Upload
                multiple
                beforeUpload={() => false}
                accept="image/*"
                fileList={fileList}
                onChange={({ fileList: newFileList }) => {
                  const remainingExistingCount =
                    (qna?.images || []).filter(
                      (image) => !deleteImageIds.includes(image.imageId)
                    ).length;
                  const maxNewCount = 3 - remainingExistingCount;

                  setFileList(newFileList.slice(0, maxNewCount));
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
              <Button
                type="primary"
                htmlType="submit"
                loading={loading && submitted}
                disabled={loading}
              >
                수정하기
              </Button>

              <Button
                onClick={handleCancel}
              >
                취소
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default questionEdit;