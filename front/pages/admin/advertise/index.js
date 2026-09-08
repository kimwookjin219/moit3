import { useEffect, useState } from 'react';
import { Row, Col, Button, Pagination, message } from 'antd';

import AdminStatCard from '../../../components/AdminStatCard';
import AdminAdvertiseSearchBox from '../../../components/AdminAdvertiseSearchBox';
import AdminListTabs from '../../../components/AdminListTabs';

import AdvertiseApprovalTable from '../../../components/AdvertiseApprovalTable';
import AdvertisePaymentTable from '../../../components/AdvertisePaymentTable';
import AdvertiseStatusTable from '../../../components/AdvertiseStatusTable';
import AdvertisePriceModal from '../../../components/AdvertisePriceModal';

import {
  // 탭별 목록 API
  getAdvertiseApprovalTabList,
  getAdvertisePaymentTabList,
  getAdvertiseStatusTabList,
  
  // 탭별 페이징 개수 API (검색용)
  getAdvertiseApprovalTabCount,
  getAdvertisePaymentTabCount,
  getAdvertiseStatusTabCount,
  
  // 새로 만든 통계 카드 API (DB 전체 통계)
  getAdvertiseApprovalStats,
  getAdvertisePaymentStats,
  getAdvertiseStatusStats,

  approveAdvertise,
  rejectAdvertise,
  updateAdvertiseStatus,
} from '../../../api/advertiseAdminApi';

function AdminAdvertisePage() {
  // 현재 탭
  const [tab, setTab] = useState('approval');

  // 광고 목록
  const [advertiseList, setAdvertiseList] = useState([]);

//// 검색 조건
  // 검색창에 입력 중인 값
  const [searchText, setSearchText] = useState('');

  // 실제 API에 적용된 검색어
  const [appliedSearchText, setAppliedSearchText] = useState('');

  // 필터 / 정렬
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('');

  // 페이징용 전체 개수 (검색 결과에 따라 달라짐)
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // 💡 상단 통계 카드 데이터 (전체 DB 기준)
  const [approvalStatsData, setApprovalStatsData] = useState({});
  const [paymentStatsData, setPaymentStatsData] = useState({});
  const [statusStatsData, setStatusStatsData] = useState({});

  // 가격표 모달
  const [priceModalOpen, setPriceModalOpen] = useState(false);

  const size = 10;
// 1. 광고 목록 조회 (검색, 정렬, 탭별 상태값 명확히 주입)
  const loadAdvertiseList = async (customSearchText = appliedSearchText, customStatus = status, customSort = sort, customPage = page) => {
    try {
      const params = { 
        searchText: customSearchText, 
        status: customStatus === 'all' ? '' : customStatus, 
        sort: customSort === 'all' ? '' : customSort, 
        page: customPage, 
        size 
      };

      let response;
      if (tab === 'approval') {
        response = await getAdvertiseApprovalTabList(params);
      } else if (tab === 'payment') {
        response = await getAdvertisePaymentTabList(params);
      } else if (tab === 'status') {
        response = await getAdvertiseStatusTabList(params);
      }
      setAdvertiseList(response?.data?.list || []);
    } catch (error) {
      message.error('광고 목록을 불러오지 못했습니다.');
    }
  };

  // 2. 검색 결과 페이징용 개수 조회 (검색어 조건 반영)
  const loadCount = async (customSearchText = appliedSearchText, customStatus = status) => {
    try {
      const params = { 
        searchText: customSearchText, 
        status: customStatus === 'all' ? '' : customStatus 
      };
      let response;
      if (tab === 'approval') {
        response = await getAdvertiseApprovalTabCount(params);
      } else if (tab === 'payment') {
        response = await getAdvertisePaymentTabCount(params);
      } else if (tab === 'status') {
        response = await getAdvertiseStatusTabCount(params);
      }
      setTotalCount(response?.data || 0);
    } catch (error) {
      console.error('광고 개수 조회 실패');
    }
  };

  // 3. 통계 카드 조회
  const loadStats = async () => {
    try {
      if (tab === 'approval') {
        const res = await getAdvertiseApprovalStats();
        setApprovalStatsData(res.data || {});
      } else if (tab === 'payment') {
        const res = await getAdvertisePaymentStats();
        setPaymentStatsData(res.data || {});
      } else if (tab === 'status') {
        const res = await getAdvertiseStatusStats();
        setStatusStatsData(res.data || {});
      }
    } catch (error) {
      console.error('통계 조회 실패');
    }
  };

  useEffect(() => {
    loadAdvertiseList(searchText, status, sort, page);
    loadCount(appliedSearchText, status);
    loadStats();
  }, [tab, page, appliedSearchText, status, sort]);

  const handleSearch = () => {
    setPage(1);
    setAppliedSearchText(searchText);
  };

  // 탭 변경
  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    setPage(1);

    setSearchText('');
    setAppliedSearchText('');

    setStatus('');
    setSort('');
  };

  // 승인, 반려, 상태 변경 핸들러
  const handleApprove = async (adId) => {
    if (!window.confirm('이 광고를 승인하시겠습니까?')) return;
    try {
      await approveAdvertise(adId);
      message.success('광고가 승인되었습니다.');
      loadAdvertiseList();
      loadCount();
      loadStats();
    } catch (error) {
      message.error(error.response?.data?.message || '광고 승인에 실패했습니다.');
    }
  };

  const handleReject = async (adId) => {
    const rejectReason = window.prompt('반려 사유를 입력해주세요.');
    if (!rejectReason?.trim()) return;
    try {
      await rejectAdvertise(adId, rejectReason.trim());
      message.success('광고가 반려되었습니다.');
      loadAdvertiseList();
      loadCount();
      loadStats();
    } catch (error) {
      message.error(error.response?.data?.message || '광고 반려에 실패했습니다.');
    }
  };

  const handleStatusChange = async (adId, nextStatus) => {
    try {
      await updateAdvertiseStatus(adId, nextStatus);
      message.success('광고 상태가 변경되었습니다.');
      loadAdvertiseList();
      loadStats();
    } catch (error) {
      message.error(error.response?.data?.message || '광고 상태 변경에 실패했습니다.');
    }
  };

  // 광고 상세
  const handleDetail = (adId) => {
    window.location.href = `/admin/advertise/advertiseDetail?adId=${adId}&tab=${tab}`;
  };

  const listTabs = [
    { key: 'approval', label: '승인 관리' },
    { key: 'payment', label: '결제 확인' },
    { key: 'status', label: '운영 관리' },
  ];

  /*
   * =========================
   * 검색 조건 
   * =========================
   */
  const approvalStatusOptions = [
    { value: '', label: '전체 상태' },
    { value: 'WAITING', label: '승인 대기' },
    { value: 'PAYMENT_WAITING', label: '결제 대기' },
    { value: 'REJECTED', label: '반려' },
  ];

  const approvalSortOptions = [
    { value: '', label: '최신 등록순' },
    { value: 'start', label: '시작 예정순' },
    { value: 'end', label: '종료 임박순' },
    { value: 'budget', label: '예산 높은순' },
    { value: 'grade', label: '등급순' },
  ];

  const paymentStatusOptions = [
    { value: '', label: '전체 유형' },
    { value: 'NEW', label: '신규 결제' },
    { value: 'EXTENSION', label: '연장 결제' },
    { value: 'WAITING', label: '결제 대기' },
  ];

  const paymentSortOptions = [
    { value: '', label: '최신 결제순' },
    { value: 'amount', label: '결제 금액순' },
    { value: 'date', label: '결제 예정순' },
  ];

  const statusStatusOptions = [
    { value: '', label: '전체 상태' },
    { value: 'BEFORE_OPEN', label: '게시 전' },
    { value: 'OPEN', label: '게시 중' },
    { value: 'CLOSED', label: '종료' },
  ];

  const statusSortOptions = [
    { value: '', label: '최신 등록순' },
    { value: 'start', label: '게시 시작순' },
    { value: 'end', label: '종료 임박순' },
    { value: 'impressions', label: '노출수순' },
    { value: 'clicks', label: '클릭수순' },
  ];

  const currentStatusOptions =
  tab === 'approval'
    ? approvalStatusOptions : tab === 'payment'
      ? paymentStatusOptions : statusStatusOptions;

const currentSortOptions =
  tab === 'approval'
    ? approvalSortOptions : tab === 'payment'
      ? paymentSortOptions : statusSortOptions;

  /*
   * =========================
   * 💡 상단 통계 카드용 배열 세팅 (filter 지우고 백엔드 데이터 직결!)
   * =========================
   */
  const approvalStats = [
    { title: '전체 광고', value: approvalStatsData?.totalCount || 0, suffix: '개' },
    { title: '승인 대기', value: approvalStatsData?.waitingCount || 0, suffix: '개' },
    { title: '결제 대기', value: approvalStatsData?.paymentWaitingCount || 0, suffix: '개' },
    { title: '반려', value: approvalStatsData?.rejectedCount || 0, suffix: '개' },
  ];

  const paymentStats = [
    { title: '전체 결제', value: paymentStatsData?.totalCount || 0, suffix: '건' },
    { title: '신규 결제', value: paymentStatsData?.newPaymentCount || 0, suffix: '건' },
    { title: '연장 결제', value: paymentStatsData?.extensionPaymentCount || 0, suffix: '건' },
    { title: '결제 대기', value: paymentStatsData?.waitingCount || 0, suffix: '건' },
  ];

  const statusStats = [
    { title: '전체 광고', value: statusStatsData?.totalCount || 0, suffix: '개' },
    { title: '게시 전', value: statusStatsData?.beforeOpenCount || 0, suffix: '개' },
    { title: '게시 중', value: statusStatsData?.openCount || 0, suffix: '개' },
    { title: '종료', value: statusStatsData?.closedCount || 0, suffix: '개' },
  ];

  const stats =
    tab === 'approval' ? approvalStats
      : tab === 'payment' ? paymentStats : statusStats;

  /*
   * =========================
   * 화면
   * =========================
   */
  return (
    <>
      {/* 통계 카드 */}
      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} md={12} lg={6} key={stat.title}>
            <AdminStatCard {...stat} />
          </Col>
        ))}
      </Row>

      {/* 탭 + 가격표 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 16px' }}>
        <AdminListTabs tabs={listTabs} activeTab={tab} onChange={handleTabChange} />

        <div style={{ display: 'flex', gap: 8 }}> 
          <Button onClick={() => {
           window.location.href = '/admin/advertise/AdvertiseDashboardPage'; 
          }} > 📊 광고 대시보드 </Button>

          <Button type="primary" onClick={() => setPriceModalOpen(true)}>광고 가격표</Button>
        </div>
      </div>

      {/* 검색 상자 */}
      <AdminAdvertiseSearchBox 
        searchText={searchText}
        setSearchText={setSearchText}

        status={status}
        setStatus={setStatus}

        sort={sort}
        setSort={setSort}

        statusOptions={currentStatusOptions}
        sortOptions={currentSortOptions}

        onSearch={handleSearch}
      />

      {/* 목록 테이블 */}
      {tab === 'approval' && <AdvertiseApprovalTable dataSource={advertiseList} page={page} size={size} onDetail={handleDetail} onApprove={handleApprove} onReject={handleReject} />}
      {tab === 'payment' && <AdvertisePaymentTable dataSource={advertiseList} page={page} size={size} onDetail={handleDetail} />}
      {tab === 'status' && <AdvertiseStatusTable dataSource={advertiseList} page={page} size={size} onDetail={handleDetail} onStatusChange={handleStatusChange} />}

      {/* 페이징 (검색 결과에 맞는 totalCount를 사용합니다!) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <Pagination current={page} pageSize={size} total={totalCount} showSizeChanger={false} onChange={(nextPage) => setPage(nextPage)} />
      </div>

      {/* 가격표 */}
      <AdvertisePriceModal open={priceModalOpen} onClose={() => setPriceModalOpen(false)} />
    </>
  );
}

export default AdminAdvertisePage;