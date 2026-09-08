import { Button, Table } from 'antd';

function AdvertiseApprovalTable({
  dataSource,
  page,
  size,
  onDetail,
  onApprove,
  onReject,
}) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

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
      width: 100,
      align: 'center',
      render: (_, record) => {
        if (!record.imageList?.length) {
          return '-';
        }

        return (
          <img
            src={`${BASE_URL}${record.imageList[0].imageUrl}`}
            alt={record.title}
            style={{
              width: 70,
              height: 45,
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
      title: '광고주',
      dataIndex: 'advertiserNickname',
      key: 'advertiserNickname',
      width: 120,
    },
    {
      title: '상태',
      key: 'approvalStatus',
      align: 'center',
      render: (_, record) => {
        // 승인 대기 / 결제 대기 / 반려 등을 명확히 표시
        const isPaymentWaiting = 
          record.approvalStatus === 'APPROVED' && 
          record.paymentStatus === 'WAITING';

        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {record.approvalStatus === 'WAITING' && '승인 대기'}
              {record.approvalStatus === 'REJECTED' && '반려'}
              {record.approvalStatus === 'APPROVED' && '승인 완료'}
            </div>
            {isPaymentWaiting && (
              <span style={{ color: '#faad14', fontSize: '11px' }}>
                💳 결제 대기중
              </span>
            )}
          </div>
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
      width: 200,
      align: 'center',
      render: (_, record) => (
        <div
          style={{
            display: 'flex',
            gap: 6,
            justifyContent: 'center',
          }}
        >
          <Button
            size="small"
            onClick={() => onDetail(record.adId)}
          >
            상세
          </Button>

          {record.approvalStatus === 'WAITING' && (
            <>
              <Button
                size="small"
                type="primary"
                onClick={() => onApprove(record.adId)}
              >
                승인
              </Button>

              <Button
                size="small"
                danger
                onClick={() => onReject(record.adId)}
              >
                반려
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="admin-table-box">
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="adId"
        pagination={false}
        scroll={{ x: 1000 }}
      />
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return value.substring(0, 10);
}

export default AdvertiseApprovalTable;