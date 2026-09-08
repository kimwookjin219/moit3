import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Pagination,
  Image,
  message,
  Card,
  Space,
} from 'antd';

import {
  getMyAdvertiseList,
  deleteAdvertise,
} from '../../../api/advertiseApi';

import AdvertisePayment from '../../../components/AdvertisePayment';
import AdvertiseExtensionModal from '../../../components/AdvertiseExtensionModal';
import AdvertiseExtensionPayment from '../../../components/AdvertiseExtensionPayment';
import { Modal } from 'antd';

function AdvertiseListPage() {
  const router = useRouter();

  const [advertiseList, setAdvertiseList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 입력창에 현재 입력된 검색어
  const [searchInput, setSearchInput] = useState('');

  // 실제 API 검색에 사용되는 검색어
  const [searchText, setSearchText] = useState('');

  const [sort, setSort] = useState('');

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const size = 10;

  // 결제 모달 상태 추가
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null); // 결제할 광고 정보

  // 연장 결제 모달 상태 추가
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [extensionTarget, setExtensionTarget] = useState(null);

  // 연장 결제
  const [isExtensionPaymentOpen, setIsExtensionPaymentOpen] = useState(false);
  const [extensionPaymentTarget, setExtensionPaymentTarget] = useState(null);

  // 결제 버튼 클릭 시 모달 열기
  const handlePayment = (record) => {
    setPaymentTarget(record);
    setIsPaymentModalOpen(true);
  };
  // 연장 버튼 클릭 시 모달 열기
  const handleExtension = (record) => {
    setExtensionTarget(record);
    setIsExtensionModalOpen(true);
  };

  // 광고 목록 조회
  const loadAdvertiseList = async () => {
    try {
      setLoading(true);

      const response = await getMyAdvertiseList({
        page,
        size,
        searchText,
        sort,
      });

      const data = response.data;

      setAdvertiseList(data?.list || []);
      setTotalCount(data?.totalCnt || 0);

    } catch (error) {
      console.error('내 광고 목록 조회 실패', error);

      message.error(
        error.response?.data?.message ||
        '광고 목록을 불러오지 못했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvertiseList();
  }, [page, searchText, sort]);

  // 검색
  const handleSearch = () => {
    setPage(1);
    setSearchText(searchInput);
  };

  // 정렬
  const handleSortChange = (value) => {
    setSort(value);
    setPage(1);
  };

  // 상세
  const handleDetail = (adId) => {
    router.push(
      `/user/mypage/advertiseDetail?adId=${adId}`
    );
  };

  // 광고 등록
  const handleWrite = () => {
    router.push('/user/mypage/advertiseWrite');
  };

  // 삭제
  const handleDelete = async (adId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteAdvertise(adId);

      message.success('광고가 삭제되었습니다.');

      if (advertiseList.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadAdvertiseList();
      }

    } catch (error) {
      console.error('광고 삭제 실패', error);

      message.error(
        error.response?.data?.message ||
        '광고 삭제에 실패했습니다.'
      );
    }
  };

  const columns = [
    {
      title: '번호',
      key: 'number',
      width: 70,
      align: 'center',
      render: (_, record, index) =>
        (page - 1) * size + index + 1,
    },

    {
      title: '이미지',
      key: 'image',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const image = record.imageList?.[0];

        if (!image) {
          return '-';
        }

        // 백엔드 주소 정의
        const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

        return (
          <Image
            src={`${BASE_URL}${image.imageUrl}`}
            alt={record.title}
            width={80}
            height={50}
            style={{
              objectFit: 'cover',
            }}
          />
        );
      },
    },

    {
      title: '광고명',
      dataIndex: 'title',
      key: 'title',
    },

    {
      title: '승인 상태',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      align: 'center',
      render: (value) => {
        if (value === 'APPROVED') {
          return (
            <Tag color="green">
              승인완료
            </Tag>
          );
        }

        if (value === 'REJECTED') {
          return (
            <Tag color="red">
              반려
            </Tag>
          );
        }

        return (
          <Tag color="orange">
            승인대기
          </Tag>
        );
      },
    },
    {
        title: '결제 상태',
        dataIndex: 'paymentStatus',
        key: 'paymentStatus',
        align: 'center',
        render: (value, record) => {

            // 아직 광고 승인이 안 된 경우
            if (record.approvalStatus !== 'APPROVED') {
            return (
                <Tag>
                승인전(결제x)
                </Tag>
            );
            }

            if (value === 'PAID') {
            return (
                <Tag color="green">
                결제완료
                </Tag>
            );
            }

            if (value === 'WAITING') {
            return (
                <Tag color="orange">
                결제대기
                </Tag>
            );
            }

            if (value === 'FAILED') {
            return (
                <Tag color="red">
                결제실패
                </Tag>
            );
            }

            return (
            <Tag>
                -
            </Tag>
            );
        },
    },
    {
      title: '운영 상태',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (value) => {
        if (value === 'OPEN') {
          return (
            <Tag color="blue">
              진행중
            </Tag>
          );
        }

        if (value === 'CLOSED') {
          return (
            <Tag>
              종료
            </Tag>
          );
        }

        return (
          <Tag color="orange">
            대기
          </Tag>
        );
      },
    },

    {
      title: '광고 기간',
      key: 'period',
      render: (_, record) => (
        <>
          {formatDate(record.startDatetime)}
          {' ~ '}
          {formatDate(record.endDatetime)}
        </>
      ),
    },

    {
      title: '관리',
      key: 'action',
      align: 'center',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() =>
              handleDetail(record.adId)
            }
          >
            상세
          </Button>

          {record.approvalStatus === 'APPROVED' &&
           record.paymentStatus === 'WAITING' && (
            <Button
                type="primary"
                size="small"
                onClick={() => handlePayment(record)}
            >
                결제하기
            </Button>
          )}

          {record.approvalStatus === 'APPROVED' &&
           record.paymentStatus === 'PAID' &&
           record.status === 'OPEN' &&
           (
              record.reminder30dSent === 'Y' ||
              record.reminder14dSent === 'Y'
            ) && 
            !(record.paymentType === 'EXTENSION' &&
              record.paymentStatus === 'PAID') && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleExtension(record)}
            >
              연장하기
            </Button>
          )}

          <Button
            size="small"
            danger
            onClick={() =>
              handleDelete(record.adId)
            }
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>

      {/* 제목 + 등록 */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0 }}>
          내 광고 관리
        </h2>

        <Button
          type="primary"
          onClick={handleWrite}
        >
          광고 등록
        </Button>
      </div>


      {/* 검색 */}

      <Card
        style={{
          marginBottom: 20,
        }}
      >
        <Space>
          <Input
            placeholder="광고명을 입력하세요."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value) }
            onPressEnter={handleSearch}
            style={{ width: 300 }}
          />

          <Select
            value={sort || ''}
            onChange={handleSortChange}
            style={{
              width: 160,
            }}
            options={[
              {
                value: '',
                label: '최신 등록순',
              },
              {
                value: 'start',
                label: '시작 예정순',
              },
              {
                value: 'status',
                label: '진행 중 우선',
              },
              {
                value: 'end',
                label: '종료 임박순',
              },
              {
                value: 'budget',
                label: '예산 높은순',
              },
            ]}
          />

          <Button
            type="primary"
            onClick={handleSearch}
          >
            검색
          </Button>
        </Space>
      </Card>


      {/* 목록 */}

      <Table
        rowKey="adId"
        columns={columns}
        dataSource={advertiseList}
        loading={loading}
        pagination={false}
        locale={{
          emptyText: '등록된 광고가 없습니다.',
        }}
        scroll={{
          x: 1000,
        }}
      />


      {/* 페이징 */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 20,
        }}
      >
        <Pagination
          current={page}
          pageSize={size}
          total={totalCount}
          showSizeChanger={false}
          onChange={(nextPage) =>
            setPage(nextPage)
          }
        />
      </div>

      {/* 결제 컴포넌트를 담은 모달 추가*/}
      <Modal
        open={isPaymentModalOpen}
        onCancel={() => setIsPaymentModalOpen(false)}
        footer={null} // 결제 컴포넌트 안에 버튼이 있으므로 모달 기본 버튼은 숨김
        destroyOnClose // 모달을 닫을 때마다 결제 위젯을 초기화하기 위해 꼭 필요!
        width={650}
      >
        {paymentTarget && (
          <AdvertisePayment 
            adId={paymentTarget.adId} 
            amount={paymentTarget.totalBudget} 
            adTitle={paymentTarget.title} 
          />
        )}
      </Modal>

      <AdvertiseExtensionModal
        open={isExtensionModalOpen}
        onCancel={() => {
          setIsExtensionModalOpen(false);
          setExtensionTarget(null);
        }}
        advertisement={extensionTarget}
        onPayment={(extensionData) => {

          setIsExtensionModalOpen(false);

          setExtensionPaymentTarget({
            ...extensionData,
            title: extensionTarget?.title,
          });

          setIsExtensionPaymentOpen(true);

        }}
      />

      <Modal
        open={isExtensionPaymentOpen}
        onCancel={() => {
          setIsExtensionPaymentOpen(false);
          setExtensionPaymentTarget(null);
        }}
        footer={null}
        destroyOnClose
        width={650}
      >
        {extensionPaymentTarget && (
          <AdvertiseExtensionPayment
            adId={extensionPaymentTarget.adId}
            days={extensionPaymentTarget.days}
            adTitle={extensionPaymentTarget.title}
          />
        )}
      </Modal>
    </div>
  );
}


function formatDate(value) {
  if (!value) {
    return '-';
  }

  return String(value).substring(0, 10);
}


export default AdvertiseListPage;