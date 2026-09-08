import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

import {
  qnaAdminListRequest,
  qnaAdminDeleteSelectedRequest,
  qnaAiNormalRequest,
  qnaAdminDeleteSelectedReset,
  qnaAiNormalReset,
} from '../../reducers/qnaReducer';

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
  message,
  Modal,
} from 'antd';

import {
  SearchOutlined,
  ReloadOutlined,
  CheckOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  LoginOutlined,
  CreditCardOutlined,
  UserOutlined,
  WarningOutlined,
  BugOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

function AdminQuestionPage() {

  const dispatch = useDispatch();
  const router = useRouter();

  const {
    adminQnaList,
    adminQnaTotal,
    adminQnaPage,
    adminQnaSize,
    adminQnaAllCnt,
    adminQnaPendingCnt,
    adminQnaAnsweredCnt,
    adminQnaTodayCnt,
    loading,
    adminDeleteSuccess,
    aiNormalSuccess,
  } = useSelector((state) => state.qna);

  // 검색창에 현재 입력 중인 값
  const [searchType, setSearchType] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [aiCategory, setAiCategory] = useState('all');
  const [createdAtRange, setCreatedAtRange] = useState(null);

  // 실제 검색에 사용되는 값
  const [searchSearchType, setSearchSearchType] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchStatus, setSearchStatus] = useState('all');
  const [searchAiCategory, setSearchAiCategory] = useState('all');
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  

  // 현재 페이지
  const [page, setPage] = useState(1);

  // 선택된 문의
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 정상 처리 모달
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // 선택 삭제 모달
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // 관리자 문의 목록 조회
  useEffect(() => {

    dispatch(
      qnaAdminListRequest({
        page,
        pageSize: 10,
        type: searchSearchType,
        keyword: searchKeyword,
        status: searchStatus,
        aiCategory: searchAiCategory,
        startDate: searchStartDate,
        endDate: searchEndDate,
      })
    );

  }, [
    dispatch,
    page,
    searchSearchType,
    searchKeyword,
    searchStatus,
    searchAiCategory,
    searchStartDate,
    searchEndDate,
  ]);

  // 선택 삭제 성공 후 목록 새로 조회
  useEffect(() => {
    if (!adminDeleteSuccess) return;

    message.success('삭제가 완료되었습니다.');

    dispatch(
      qnaAdminListRequest({
        page,
        pageSize: 10,
        type: searchSearchType,
        keyword: searchKeyword,
        status: searchStatus,
        aiCategory: searchAiCategory,
        startDate: searchStartDate,
        endDate: searchEndDate,
      })
    );

    dispatch(qnaAdminDeleteSelectedReset());

  }, [
    adminDeleteSuccess,
    dispatch,
    page,
    searchSearchType,
    searchKeyword,
    searchStatus,
    searchAiCategory,
    searchStartDate,
    searchEndDate,
  ]);

  // AI 정상 처리 성공 후 목록 새로 조회
  useEffect(() => {

    if (!aiNormalSuccess) return;

    message.success('정상 처리가 완료되었습니다.');

    dispatch(
      qnaAdminListRequest({
        page,
        pageSize: 10,
        type: searchSearchType,
        keyword: searchKeyword,
        status: searchStatus,
        aiCategory: searchAiCategory,
        startDate: searchStartDate,
        endDate: searchEndDate,
      })
    );

    dispatch(qnaAiNormalReset());

  }, [
    aiNormalSuccess,
    dispatch,
    page,
    searchSearchType,
    searchKeyword,
    searchStatus,
    searchAiCategory,
    searchStartDate,
    searchEndDate,
  ]);

  const stats = [
    {
      title: '전체 문의',
      value: adminQnaAllCnt,
      suffix: '건',
      icon: MessageOutlined,
    },
    {
      title: '답변 대기',
      value: adminQnaPendingCnt,
      suffix: '건',
      icon: ClockCircleOutlined,
    },
    {
      title: '답변 완료',
      value: adminQnaAnsweredCnt,
      suffix: '건',
      icon: CheckCircleOutlined,
    },
    {
      title: '오늘 등록',
      value: adminQnaTodayCnt,
      suffix: '건',
      icon: CalendarOutlined,
    },
  ];

  const list = Array.isArray(adminQnaList)
    ? adminQnaList
    : [];

  const columns = [
    {
      title: '번호',
      key: 'number',
      width: 80,
      align: 'center',
      render: (_, record, index) =>
        adminQnaTotal - ((page - 1) * 10 + index),
    },
    {
      title: '문의구분',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      align: 'center',
      render: (category) =>
        category === 'MEETUP'
          ? '모임 문의'
          : '관리자 문의',
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      ellipsis: true,
      align: 'center',
      render: (title, record) => (
        <Text
          strong
          style={{ cursor: 'pointer' }}
          onClick={() =>
            router.push(
              `/user/qna/questionDetail?questionId=${record.questionId}`
            )
          }
        >
          {title}
        </Text>
      ),
    },
    {
      title: '작성자',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 120,
      align: 'center',
      render: (nickname, record) =>
        nickname ||
        record.memberNickname ||
        record.memberId ||
        '-',
    },
    {
      title: 'AI 필터',
      dataIndex: 'analysisStatus',
      key: 'analysisStatus',
      width: 110,
      align: 'center',
      render: (status) =>
        !status ? (
          '-'
        ) : status === 'NORMAL' ? (
          <Tag color="green">
            정상
          </Tag>
        ) : (
          <Tag color="orange">
            주의
          </Tag>
        ),
    },
    {
      title: 'AI 분류',
      dataIndex: 'aiCategory',
      key: 'aiCategory',
      width: 130,
      align: 'center',
      render: (aiCategory) => {

        if (!aiCategory) {
          return '-';
        }

        const categoryMap = {
          LOGIN: {
            label: '로그인',
            color: 'blue',
            icon: <LoginOutlined />,
          },

          PAYMENT: {
            label: '결제',
            color: 'green',
            icon: <CreditCardOutlined />,
          },

          ACCOUNT: {
            label: '계정',
            color: 'purple',
            icon: <UserOutlined />,
          },

          REPORT: {
            label: '신고',
            color: 'red',
            icon: <WarningOutlined />,
          },

          BUG: {
            label: '버그',
            color: 'orange',
            icon: <BugOutlined />,
          },

          OTHER: {
            label: '기타',
            color: 'default',
            icon: <AppstoreOutlined />,
          },
        };

        const category = categoryMap[aiCategory];

        if (!category) {
          return (
            <Tag>
              {aiCategory}
            </Tag>
          );
        }

        return (
          <Tag
            color={category.color}
            icon={category.icon}
          >
            {category.label}
          </Tag>
        );
      },
    },
    {
      title: '공개여부',
      dataIndex: 'isPublic',
      key: 'isPublic',
      width: 100,
      align: 'center',
      render: (isPublic) =>
        isPublic === 'Y' ? (
          <Tag color="blue" icon={<UnlockOutlined />}>
            공개
          </Tag>
        ) : (
          <Tag icon={<LockOutlined />}>
            비공개
          </Tag>
        ),
    },
    {
      title: '답변상태',
      dataIndex: 'qnaStatus',
      key: 'qnaStatus',
      width: 110,
      align: 'center',
      render: (qnaStatus) =>
        qnaStatus === 'ANSWERED' ? (
          <Tag color="success">
            답변 완료
          </Tag>
        ) : (
          <Tag color="warning">
            답변 대기
          </Tag>
        ),
    },
    {
      title: '등록일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      align: 'center',
      render: (date) =>
        date
          ? dayjs(date).format('YYYY. M. D. HH:mm:ss')
          : '-',
    },
    {
      title: '답변일',
      key: 'answeredAt',
      width: 170,
      align: 'center',
      render: (_, record) =>
        record.answeredAt
          ? dayjs(record.answeredAt).format('YYYY. M. D. HH:mm:ss')
          : record.answer?.createdAt
            ? dayjs(record.answer.createdAt).format('YYYY. M. D. HH:mm:ss')
            : '-',
    },
  ];

  const handleSearch = () => {

    setPage(1);

    setSearchSearchType(searchType);
    setSearchKeyword(keyword);
    setSearchStatus(status);
    setSearchAiCategory(aiCategory);

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

  const handleReset = () => {

    setSearchType('all');
    setKeyword('');
    setStatus('all');
    setAiCategory('all');
    setCreatedAtRange(null);

    setSearchSearchType('all');
    setSearchKeyword('');
    setSearchStatus('all');
    setSearchAiCategory('all');
    setSearchStartDate('');
    setSearchEndDate('');

    setPage(1);
  };

  const handleAiNormal = () => {

    if (selectedRowKeys.length === 0) {
      message.warning('정상 처리할 문의를 선택해주세요.');
      return;
    }

    setAiModalOpen(true);
  };

  const handleDeleteSelected = () => {

    if (selectedRowKeys.length === 0) {
      message.warning('삭제할 문의를 선택해주세요.');
      return;
    }

    setDeleteModalOpen(true);
  };

  const handleAiNormalConfirm = () => {

    dispatch(qnaAiNormalRequest(selectedRowKeys));

    setSelectedRowKeys([]);
    setAiModalOpen(false);
  };

  const handleDeleteConfirm = () => {

    dispatch(
      qnaAdminDeleteSelectedRequest(selectedRowKeys)
    );

    setSelectedRowKeys([]);
    setDeleteModalOpen(false);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys);
    },
  };

  return (
    <div className="admin-question-page">

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat) => {

          const Icon = stat.icon;

          return (
            <Col
              xs={24}
              sm={12}
              md={12}
              lg={6}
              key={stat.title}
            >
              <Card>
                <Row justify="space-between" align="middle">

                  <Col>
                    <Text type="secondary">
                      {stat.title}
                    </Text>

                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 24,
                        fontWeight: 700,
                        color: '#2f65b9',
                      }}
                    >
                      {stat.value || 0}
                      {stat.suffix}
                    </div>
                  </Col>

                  <Col>
                    <Icon
                      style={{
                        fontSize: 34,
                        color: '#8c98a4',
                      }}
                    />
                  </Col>

                </Row>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Card className="admin-question-filter">

        <Row
          justify="space-between"
          align="middle"
          gutter={[16, 16]}
        >
          <Col xs={24}>

            <Space wrap style={{ width: '100%' }}>

              <Space size={8}>

                <Select
                  value={searchType}
                  onChange={setSearchType}
                  style={{ width: 110 }}
                  options={[
                    {
                      value: 'all',
                      label: '전체',
                    },
                    {
                      value: 'title',
                      label: '제목',
                    },
                    {
                      value: 'content',
                      label: '내용',
                    },
                  ]}
                />

                <Input
                  value={keyword}
                  onChange={(e) =>
                    setKeyword(e.target.value)
                  }
                  placeholder="검색어를 입력하세요."
                  allowClear
                  style={{ width: 300 }}
                  onPressEnter={handleSearch}
                />

              </Space>

              <Select
                value={status}
                onChange={setStatus}
                style={{ width: 120 }}
                options={[
                  {
                    value: 'all',
                    label: '전체 문의',
                  },
                  {
                    value: 'PENDING',
                    label: '답변 대기',
                  },
                  {
                    value: 'ANSWERED',
                    label: '답변 완료',
                  },
                ]}
              />

              <Select
                value={aiCategory}
                onChange={setAiCategory}
                style={{ width: 140 }}
                options={[
                  {
                    value: 'all',
                    label: 'AI 분류 전체',
                  },
                  {
                    value: 'LOGIN',
                    label: '로그인',
                  },
                  {
                    value: 'PAYMENT',
                    label: '결제',
                  },
                  {
                    value: 'ACCOUNT',
                    label: '계정',
                  },
                  {
                    value: 'REPORT',
                    label: '신고',
                  },
                  {
                    value: 'BUG',
                    label: '버그',
                  },
                  {
                    value: 'OTHER',
                    label: '기타',
                  },
                ]}
              />

              <RangePicker
                value={createdAtRange}
                onChange={(dates) =>
                  setCreatedAtRange(dates)
                }
                placeholder={['시작일', '종료일']}
                format="YYYY-MM-DD"
                style={{ width: 260 }}
              />

              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                검색
              </Button>

              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                초기화
              </Button>

            </Space>

          </Col>
        </Row>

      </Card>

      <Card className="admin-question-list">

        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              문의 목록
            </Title>
          </Col>

          <Col>
            <Space>

              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleAiNormal}
                style={{
                  background: '#27ae60',
                  borderColor: '#27ae60',
                }}
              >
                정상 처리
              </Button>

              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteSelected}
              >
                선택 삭제
              </Button>

            </Space>
          </Col>
        </Row>

        <Table
          rowKey="questionId"
          rowSelection={rowSelection}
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={{
            current: adminQnaPage || page,
            pageSize: adminQnaSize || 10,
            total: adminQnaTotal || 0,
            showSizeChanger: false,
            position: ['bottomCenter'],
            onChange: (newPage) => {
              setPage(newPage);
            },
          }}
          scroll={{ x: 1300 }}
        />

      </Card>

      {/* 정상 처리 확인 모달 */}
      <Modal
        title="정상 처리하시겠습니까?"
        open={aiModalOpen}
        onCancel={() => {
          setAiModalOpen(false);
        }}
        footer={[
          <Button
            key="confirm"
            type="primary"
            onClick={handleAiNormalConfirm}
          >
            확인
          </Button>,

          <Button
            key="cancel"
            onClick={() => {
              setAiModalOpen(false);
            }}
          >
            취소
          </Button>,
        ]}
      >
        <p>
          선택한 문의를 정상으로 처리합니다.
        </p>
      </Modal>

      {/* 선택 삭제 확인 모달 */}
      <Modal
        title="정말 삭제하시겠습니까?"
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
        }}
        footer={[
          <Button
            key="delete"
            type="primary"
            danger
            onClick={handleDeleteConfirm}
          >
            삭제
          </Button>,

          <Button
            key="cancel"
            onClick={() => {
              setDeleteModalOpen(false);
            }}
          >
            취소
          </Button>,
        ]}
      >
        <p>
          삭제된 문의는 복구할 수 없습니다.
        </p>
      </Modal>

    </div>
  );
}

export default AdminQuestionPage;