import { Button, Table, Tag } from 'antd';

function AdvertisePaymentTable({
  dataSource,
  page,
  size,
  onDetail,
}) {
  const columns = [
    {
      title: '번호',
      key: 'number',
      width: 60,
      align: 'center',
      render: (_, record, index) => (page - 1) * size + index + 1,
    },
    {
      title: '광고명',
      dataIndex: 'adTitle', // 백엔드 DTO에 있는 필드명
      key: 'adTitle',
    },
    {
      title: '광고주',
      dataIndex: 'advertiserNickname',
      key: 'advertiserNickname',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '광고 등급',
      dataIndex: 'adGrade',
      key: 'adGrade',
      align: 'center',
      width: 100,
      render: (value) => {
        if (value === 'PREMIUM') return <Tag color="gold" style={{ margin: 0 }}>PREMIUM</Tag>;
        if (value === 'GENERAL') return <Tag style={{ margin: 0 }}>GENERAL</Tag>;
        return <Tag style={{ margin: 0 }}>{value || '-'}</Tag>;
      },
    },
    {
      title: '결제 유형',
      dataIndex: 'paymentType',
      key: 'paymentType',
      align: 'center',
      width: 100,
      render: (value) => {
        if (value === 'INITIAL' || value === 'NEW') return <Tag color="blue" style={{ margin: 0 }}>신규 결제</Tag>;
        if (value === 'EXTENSION') return <Tag color="purple" style={{ margin: 0 }}>기간 연장</Tag>;
        return value || '-';
      },
    },
    {
      title: '결제 금액',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 120,
      render: (value) => (value ? `${Number(value).toLocaleString()}원` : '-'),
    },
    {
      title: '결제 상태',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      align: 'center',
      width: 110,
      render: (value) => {
        if (value === 'PAID') return <Tag color="green" style={{ margin: 0 }}>결제 완료</Tag>;
        if (value === 'FAILED') return <Tag color="red" style={{ margin: 0 }}>결제 실패</Tag>;
        if (value === 'CANCELLED') return <Tag color="red" style={{ margin: 0 }}>결제 취소</Tag>;
        return <Tag color="orange" style={{ margin: 0 }}>결제 대기</Tag>;
      },
    },
    {
      title: '결제 일시',
      dataIndex: 'paidAt',
      key: 'paidAt',
      align: 'center',
      width: 150,
      render: (value) => (value ? value.replace('T', ' ').substring(0, 16) : '-'),
    },
    {
      title: '관리',
      key: 'action',
      align: 'center',
      width: 80,
      render: (_, record) => (
        <Button size="small" onClick={() => onDetail(record.adId)}>
          상세
        </Button>
      ),
    },
  ];

  return (
    <div className="admin-table-box">
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="paymentId"
        pagination={false}
        scroll={{ x: 1100 }}
      />
    </div>
  );
}

export default AdvertisePaymentTable;