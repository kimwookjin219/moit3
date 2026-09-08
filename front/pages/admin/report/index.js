// pages/admin/report/index.js
// 관리자 신고 목록 페이지

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { Row, Col, Button, Table, Tag, message } from 'antd';
import AdminStatCard from '../../../components/AdminStatCard';
import AdminReportSearchBox from '../../../components/AdminReportSearchBox';
import { fetchAdminReportsRequest, resetReportState } from '../../../reducers/reportReducer';

import ReportStatusTag from '../../../components/ReportStatusTag';
import ReportStatusCodeTag from '../../../components/ReportStatusCodeTag';
import api from '../../../api/axios';

// http://localhost:3000/admin/report

function AdminReportPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  // =====================================================
  // Redux 신고 상태
  // =====================================================
  const {
    reports,
    totalCount,
    adminFetch
  } = useSelector((state) => state.report);


  // 관리자 통계
  const [reportStats, setReportStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    const fetchReportStats = async () => {
      try {
        const response = await api.get(
          '/api/reports/admin/stats'
        );
        setReportStats(response.data);

      } catch (error) {
        console.error('관리자 신고 통계 조회 실패:', error);
      }
    };

    fetchReportStats();
  }, []);

  const stats = [
    {
      title: '전체 신고',
      value: reportStats.total || 0,
      suffix: '개'
    },

    {
      title: '처리 대기',
      value: reportStats.pending || 0,
      suffix: '개'
    },

    {
      title: '승인',
      value: reportStats.approved || 0,
      suffix: '개'
    },

    {
      title: '반려',
      value: reportStats.rejected || 0,
      suffix: '개'
    },
  ];


  // =====================================================
  // 현재 페이지 번호
  // Ant Design은 1부터 시작
  // Spring Pageable은 0부터 시작
  // =====================================================
  const [page, setPage] = useState(1);

  // =====================================================
  // 검색 조건
  // =====================================================
  const [searchParams, setSearchParams] = useState({
    targetType: '',
    status: '',
    reasonCode: '',
    deleteYn: 'N',
    memberNickname: '',
  });


  // =====================================================
  // 신고 목록 조회
  // =====================================================
  useEffect(() => {
    dispatch(
      fetchAdminReportsRequest({
        // memberId: 99,        // 로그인 미완성 -> 테스트 하드코딩
        page: page - 1,
        size: 10,

        // 검색
        targetType: searchParams.targetType || null,
        status: searchParams.status || null,
        reasonCode: searchParams.reasonCode || null,
        deleteYn: searchParams.deleteYn || null,
        memberNickname: searchParams.memberNickname || null,
      })
    );

    dispatch(resetReportState());

  }, [dispatch, page, searchParams]);


  // =====================================================
  // 목록 조회 오류
  // =====================================================
  useEffect(() => {
    if (adminFetch.error) {
      message.error(adminFetch.error);
    }

  }, [adminFetch.error]);

  // =====================================================
  // 상세페이지 이동
  // =====================================================
  const handleDetail = (reportId) => {

      router.push(
          `/admin/report/${reportId}`
      );
  };




  // =====================================================
  // 신고 대상 한글
  // =====================================================
  const getTargetTypeText = (targetType) => {
    if (targetType === 'MEETUP') {
      return '모임';
    }
    if (targetType === 'REVIEW') {
      return '후기';
    }
  };

  // =====================================================
  // 신고 사유 한글
  // =====================================================
  const getReasonCodeText = (reasonCode) => {
    switch (reasonCode) {
      case 'ABUSE':
        return '욕설/비방';

      case 'SPAM':
        return '도배/스팸';

      case 'FAKE_INFO':
        return '허위 정보';

      case 'AD':
        return '광고성 게시물';

      case 'NOSHOW':
        return '노쇼';

      default:
        return '기타';
    }
  };


  // =====================================================
  // 처리 상태
  // =====================================================
  const getStatusTag = (status) => {
    if (status === 'PENDING') {
      return (
        <Tag color="orange">
          처리 대기
        </Tag>
      );
    }
    if (status === 'APPROVED') {
      return (
        <Tag color="green">
          승인
        </Tag>
      );
    }
    if (status === 'REJECTED') {
      return (
        <Tag color="red">
          반려
        </Tag>
      );
    }
  }

  // =====================================================
  // 뱃지 statusCode, statusName
  // =====================================================
  const getStatusCodeTag = (statusCode) => {
    if (statusCode === 'ACTIVE') {
      return (
        <Tag color="green">
          정상
        </Tag>
      );
    }
    if (statusCode === 'WARNING') {
      return (
        <Tag color="orange">
          주의
        </Tag>
      );
    }
    if (statusCode === 'DANGER') {
      return (
        <Tag color="red">
          위험
        </Tag>
      );
    }
  };

  const adminColumns = [

    {
      title: '신고번호',
      dataIndex: 'reportId',
      key: 'reportId',
      width: 100,
      align: 'center',
    },

    {
      title: '신고자',
      dataIndex: 'memberNickname',
      key: 'memberNickname'
    },

    {
      title: '신고 대상',
      dataIndex: 'targetMemberNickname',
      key: 'targetMemberNickname'
    },

    {
      title: '매너 점수',
      dataIndex: 'targetTrustScore',
      key: 'targetTrustScore'
    },

    {
      title: '뱃지',
      dataIndex: 'targetStatusCode',
      key: 'targetStatusCode',

      render: (targetStatusCode) => (
          <ReportStatusCodeTag statusCode={targetStatusCode} />
      )
    },

    {
      title: '타입',
      dataIndex: 'targetType',
      key: 'targetType',

      render: (targetType) => (
        getTargetTypeText(targetType)
      )
    },

    {
      title: '글 번호',
      dataIndex: 'targetId',
      key: 'targetId'
    },

    {
      title: '신고 사유',
      dataIndex: 'reasonCode',
      key: 'reasonCode',

      render: (reasonCode) => (
        getReasonCodeText(reasonCode)
      )
    },

    {
      title: '처리 상태',
      dataIndex: 'status',
      key: 'status',

      render: (status) => (
        <ReportStatusTag status={status} />
      )
    },

    {
      title: '신고일',
      dataIndex: 'createdAt',
      key: 'createdAt',

      render: (createdAt) => createdAt?.slice(0, 10)
    },

    {
      title: '상세',
      dataIndex: 'detail',
      key: 'detail',
      align: 'center',
      
      render: (_, report) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button size="small" onClick={()=> handleDetail(report.reportId)}>
            상세보기
          </Button>
        </div>
      ),
    },

  ];


  // 체크박스
  // const [checkStrictly, setCheckStrictly] = useState(false);

  // const rowSelection = {
  //   checkStrictly,
  //   onChange: (selectedRowKeys, selectedRows) => {
  //     console.log('선택된 ID:', selectedRowKeys);
  //     console.log('선택된 데이터:', selectedRows);
  //   },
  // };




  const handleSearch = (values) => {
    setPage(1);
    
    setSearchParams({
      targetType:
        values.targetType === 'all' ? '' : values.targetType,

      status:
        values.status === 'all' ? '' : values.status,
    
      reasonCode:
        values.reasonCode === 'all' ? '' : values.reasonCode,

      deleteYn:
        values.deleteYn,
        // values.deleteYn === 'all' ? '' : values.deleteYn,

      memberNickname:
        values.memberNickname || '',
    });
  };

  return (
    <>
      {/* 통계 */}
      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} md={12} lg={6} key={stat.title}>
            <AdminStatCard {...stat} />
          </Col>
        ))}
      </Row> 

      {/* 검색 영역 조건*/}
      <AdminReportSearchBox
        onSearch={handleSearch}
      />

      {/* 목록 */}
      <div className="admin-table-box">
        <Table
          columns={adminColumns}
          dataSource={reports}
          pagination={
            {
              current: page,
              pageSize: 10,
              total: totalCount || 0,
              showSizeChanger: false,

              onChange: (newPage) => {
                setPage(newPage);
              }
            }
          }
          rowKey="reportId"
          scroll={{ x: 800 }}
        />
      </div>

    </>
  );
}

export default AdminReportPage;
