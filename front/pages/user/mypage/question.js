import React, { useEffect, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { qnaListRequest } from '../../../reducers/qnaReducer';
import dayjs from 'dayjs';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  LockOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

import MyPageStatCard from '../../../components/MyPageStatCard';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

function UserMyQuestionPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { qnaList, loading } = useSelector((state) => state.qna);

  // 검색창에 현재 입력 중인 값
  const [searchType, setSearchType] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [createdAtRange, setCreatedAtRange] = useState(null);

  // 실제 검색에 사용되는 값
  const [searchSearchType, setSearchSearchType] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');

  // 현재 페이지
  const [page, setPage] = useState(1);
  useEffect(() => {
    dispatch(
      qnaListRequest({
        page,
        type: searchSearchType,
        keyword: searchKeyword,
        startDate: searchStartDate,
        endDate: searchEndDate,
      })
    );
  }, [dispatch, page, searchSearchType, searchKeyword, searchStartDate, searchEndDate,]);

  const list = qnaList?.list || [];

  // 통계
  const stats = [
    {
      title: '전체 문의',
      value: qnaList?.totalCnt || 0,
      suffix: '건',
      icon: FileTextOutlined,
    },
    {
      title: '답변 대기',
      value: qnaList?.pendingCnt || 0,
      suffix: '건',
      icon: ClockCircleOutlined,
    },
    {
      title: '답변 완료',
      value: qnaList?.answeredCnt || 0,
      suffix: '건',
      icon: CheckCircleOutlined,
    },
  ];

  const columns = [
    {
      title: '번호',
      key: 'number',
      width: 80,
      align: 'center',
      render: (_, record, index) =>
        qnaList?.totalCnt - ((page - 1) * 10 + index),
    },
    {
      title: '문의구분',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      align: 'center',
      render: (category) =>
        category === 'MEETUP' ? '모임 문의' : '관리자 문의',
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      ellipsis: true,
      align: 'center',
      render: (title, record) => (
        <Text strong style={{ cursor: 'pointer', }}
          onClick={() => router.push( `/user/qna/questionDetail?questionId=${record.questionId}` ) }
        >
          {title}
        </Text>
      ),
    },
    {
      title: '공개여부',
      dataIndex: 'isPublic',
      key: 'isPublic',
      width: 100,
      align: 'center',
      render: (isPublic) =>
        isPublic === 'Y' ? (
          <Tag color="blue">🔓 공개</Tag>
        ) : (
          <Tag color="error" icon={<LockOutlined />}>
            비공개
          </Tag>
        ),
    },
    {
      title: '답변상태',
      dataIndex: 'qnaStatus',
      key: 'qnaStatus',
      width: 100,
      align: 'center',
      render: (qnaStatus) =>
        qnaStatus === 'PENDING' ? (
          <Tag color="warning">답변 대기</Tag>
        ) : (
          <Tag color="success">답변 완료</Tag>
        ),
    },
    {
      title: '등록일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      align: 'center',
      render: (date) =>
        date ? dayjs(date).format('YYYY. M. D. HH:mm:ss') : '-',
    },
    {
      title: '답변일',
      key: 'answeredAt',
      width: 100,
      align: 'center',
      render: (_, record) =>
        record.answer?.createdAt
          ? new Date(record.answer.createdAt).toLocaleString('ko-KR')
          : '-',
    },
  ];

  // 검색
  const handleSearch = () => {
    setPage(1);
    setSearchSearchType(searchType);
    setSearchKeyword(keyword);
    setSearchStartDate(
      createdAtRange?.[0]
        ? createdAtRange[0].format('YYYY-MM-DD')
        : ''
    );
    setSearchEndDate(
      createdAtRange?.[1]
        ? createdAtRange[1].format('YYYY-MM-DD')
        : ''
    );
  };

  // 검색 초기화
  const handleReset = () => {
    setKeyword('');
    setSearchKeyword('');
    setSearchType('all');
    setSearchSearchType('all');
    setCreatedAtRange(null);
    setSearchStartDate('');
    setSearchEndDate('');
    setPage(1);
  };

  return (
    <div className="mypage-qna">
      {/* 통계 */}
      <MyPageStatCard stats={stats} />

      {/* 검색 */}
      <Card className="mypage-qna-filter">
        <Row justify="space-between" align="middle" gutter={[16, 16]} >
          <Col xs={24}>
            <Space
              wrap
              style={{ width: '100%' }}
            >
              {/* 제목 / 내용 검색 */}
              <Space size={8}>
                <Select
                  value={searchType}
                  onChange={setSearchType}
                  style={{ width: 110 }}
                  options={[
                    { value: 'all', label: '전체' },
                    { value: 'title', label: '제목' },
                    { value: 'content', label: '내용' },
                  ]}
                />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="검색어를 입력하세요."
                  allowClear
                  style={{ width: 300 }}
                />
              </Space>

              {/* 등록일 검색 */}
              <RangePicker
                value={createdAtRange}
                onChange={(dates) => setCreatedAtRange(dates)}
                placeholder={['시작일', '종료일']}
                format="YYYY-MM-DD"
                style={{ width: 260 }}
              />

              {/* 검색 */}
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                검색
              </Button>

              {/* 초기화 */}
              <Button onClick={handleReset}>
                초기화
              </Button>

            </Space>
          </Col>
        </Row>
      </Card>

      {/* 문의 목록 */}
      <Card className="mypage-qna-list">
        <Title level={3}>내 문의 내역</Title>

        <Table
          rowKey="questionId"
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={{
            current: qnaList?.page || 1,
            pageSize: 10,
            total: qnaList?.totalCnt || 0,
            showSizeChanger: false,
            position: ['bottomCenter'],
            onChange: (newPage) => {
              setPage(newPage);
            },
          }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
}

export default UserMyQuestionPage;