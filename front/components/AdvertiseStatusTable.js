import { Button, Table, Dropdown, Tag } from 'antd';

function AdvertiseStatusTable({
  dataSource,
  page,
  size,
  onDetail,
  onStatusChange,
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
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (value, record) => {
        // 1. 상태별 색상과 텍스트 설정
        let color = 'orange';
        let label = '대기';

        if (value === 'OPEN') {
          color = 'green';
          label = '게시 중';
        } else if (value === 'CLOSED') {
          color = 'red';
          label = '종료';
        }

        // 2. 드롭다운에 보여줄 메뉴 항목들
        const items = [
          { key: 'PENDING', label: '대기' },
          { key: 'OPEN', label: '게시 중' },
          { key: 'CLOSED', label: '종료' },
        ];

        return (
          <Dropdown
            menu={{
              items,
              onClick: (e) => onStatusChange(record.adId, e.key),
            }}
            trigger={['click']}
          >
            {/* 하얀 테두리 박스 없이, 색칠된 네모 상자 자체를 버튼처럼 사용 */}
            <Tag
              color={color}
              style={{
                cursor: 'pointer',
                padding: '4px 12px', // 크기를 좀 더 키움
                fontSize: '13px',
                margin: 0,
              }}
            >
              {label} ▼
            </Tag>
          </Dropdown>
        );
      },
    },
    {
      title: '광고 등급',
      dataIndex: 'adGrade',
      key: 'adGrade',
      align: 'center',
      width: 100,
      render: (value) => {
        if (value === 'PREMIUM') {
          return (
            <Tag color="gold">
              PREMIUM
            </Tag>
          );
        }

        return (
          <Tag>
            GENERAL
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
      title: '노출수',
      dataIndex: 'impressions',
      key: 'impressions',
      align: 'center',
      render: (value) => value ?? 0,
    },
    {
      title: '클릭수',
      dataIndex: 'clicks',
      key: 'clicks',
      align: 'center',
      render: (value) => value ?? 0,
    },
    {
      title: '우선도',
      dataIndex: 'priorityScore',
      key: 'priorityScore',
      width: 100,
      align: 'center',

      render: (value) => {
        if (value == null) {
          return '-';
        }

        const score = Number(value);

        return (
          <Tag
            color={score >= 8 ? 'blue' : score >= 5 ? 'geekblue' : 'default'}
            style={{
              fontWeight: 600,
              minWidth: 45,
              textAlign: 'center',
            }}
          >
            {score}
          </Tag>
        );
      },
    },
    {
      title: '관리',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          size="small"
          onClick={() => onDetail(record.adId)}
        >
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
        rowKey="adId"
        pagination={false}
        scroll={{ x: 1100 }}
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

export default AdvertiseStatusTable;