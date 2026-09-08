import { useState } from 'react';
import { Row, Col, Select, Input, Button } from 'antd';

function AdminReportSearchBox({ onSearch }) {

  const [values, setValues] = useState({
    targetType: 'all',
    status: 'all',
    reasonCode: 'all',
    deleteYn: 'N',
    memberNickname: '',
  });

  const handleSearch = () => {
    onSearch(values);
  };

  return (
    <div className="admin-search-box">
      <Row gutter={[16, 16]} style={{ width: '100%' }}>

        {/* 신고 대상 */}
        <Col flex="120px">
          <Select
            value={values.targetType}
            style={{ width: '100%' }}
            onChange={(value) => {
              setValues({
                ...values,
                targetType: value,
              });
            }}
            options={[
              { value: 'all', label: '전체 대상' },
              { value: 'MEETUP', label: '모임' },
              { value: 'REVIEW', label: '리뷰' },
            ]}
          />
        </Col>

        {/* 처리 상태 */}
        <Col flex="120px">
          <Select
            value={values.status}
            style={{ width: '100%' }}
            onChange={(value) => {
              setValues({
                ...values,
                status: value,
              });
            }}
            options={[
              { value: 'all', label: '전체 상태' },
              { value: 'PENDING', label: '처리 대기' },
              { value: 'APPROVED', label: '승인' },
              { value: 'REJECTED', label: '반려' },
            ]}
          />
        </Col>

        {/* 신고 사유 */}
        <Col flex="140px">
          <Select
            value={values.reasonCode}
            style={{ width: '100%' }}
            onChange={(value) => {
              setValues({
                ...values,
                reasonCode: value,
              });
            }}
            options={[
              { value: 'all', label: '전체 사유' },
              { value: 'ABUSE', label: '욕설 및 비방' },
              { value: 'SPAM', label: '도배 및 스팸' },
              { value: 'FAKE_INFO', label: '허위 정보' },
              { value: 'AD', label: '광고성 게시글' },
              { value: 'NOSHOW', label: '노쇼' },
              { value: 'ETC', label: '기타' },
            ]}
          />
        </Col>

        {/* 삭제 여부 */}
        <Col flex="120px">
          <Select
            value={values.deleteYn}
            style={{ width: '100%' }}
            onChange={(value) => {
              setValues({
                ...values,
                deleteYn: value,
              });
            }}
            options={[
              // { value: 'all', label: '삭제 상태' },
              { value: 'N', label: '정상' },
              { value: 'Y', label: '삭제' },
            ]}
          />
        </Col>

        {/* 작성자 */}
        <Col flex="auto">
          <Input
            placeholder="신고자 닉네임"
            value={values.memberNickname}
            onChange={(e) => {
              setValues({
                ...values,
                memberNickname: e.target.value,
              });
            }}
          />
        </Col>

        {/* 검색 */}
        <Col>
          <Button
            type="primary"
            onClick={handleSearch}
          >
            검색
          </Button>
        </Col>

      </Row>
    </div>
  );
}

export default AdminReportSearchBox;