import React from 'react';
import { Button, Typography, Upload } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  UploadOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

function MeetupImageUpload({
  previewImages,
  currentImage,
  fileList,
  onImageChange,
  onMoveImage,
}) {
  return (
    <div className="meetup-image-upload">
      {/* 이미지 미리보기 */}
      <div className="meetup-image-preview">
        {previewImages.length > 0 ? (
          <>
            <img
              src={previewImages[currentImage]}
              alt="모임 이미지"
            />

            {previewImages.length > 1 && (
              <>
                <Button
                  className="meetup-image-arrow left"
                  shape="circle"
                  icon={<LeftOutlined />}
                  onClick={() => onMoveImage(-1)}
                />

                <Button
                  className="meetup-image-arrow right"
                  shape="circle"
                  icon={<RightOutlined />}
                  onClick={() => onMoveImage(1)}
                />

                <div className="meetup-image-count">
                  {currentImage + 1} / {previewImages.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="meetup-image-empty">
            <UploadOutlined />

            <Text type="secondary">
              대표 이미지를 등록해주세요.
            </Text>
          </div>
        )}
      </div>

      {/* 이미지 등록 */}
      <Upload
        multiple
        listType="picture"
        fileList={fileList}
        beforeUpload={() => false}
        onChange={onImageChange}
        accept="image/*"
        maxCount={5}
      >
        <Button
          icon={<UploadOutlined />}
          style={{ marginTop: 15 }}
        >
          이미지 등록
        </Button>
      </Upload>
    </div>
  );
}

export default MeetupImageUpload;