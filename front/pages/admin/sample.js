import { Row, Col, Button, Input, Select, Table } from 'antd';
import AdminStatCard from '../../components/AdminStatCard';
import AdminSearchBox from '../../components/AdminSearchBox';
import AdminListTabs from '../../components/AdminListTabs';
import { useState } from 'react';
// http://localhost:3000/admin/sample

//필독!!!!
/*
1. 필요한 UI는 Ant Design으로 구현
2. 샘플페이지의 전체 폭을 그대로 맞출 것
3. 디자인이 필요한 부분은 요청하면 만들어줄 수 있음
*/
// https://ant.design/components/overview/

function AdminSamplePage() {
  //테스트용 테이터
  const serverData = { allcnt: 1200, running: 1000, close: 1200 };
  const stats = [
    { title: '전체 모임', value: serverData.allcnt, suffix: '개' },
    { title: '모집 중', value: serverData.running, suffix: '개' },
    { title: '모집 마감', value: serverData.close, suffix: '개' },
    { title: '모집 마감', value: 100, suffix: '개' },
  ];
  const adminColumns = [
    {
      title: '번호',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '아이디',
      dataIndex: 'loginId',
      key: 'loginId',
    },
    {
      title: '닉네임',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '가입일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button size="small">수정</Button>

          <Button size="small" danger>
            삭제
          </Button>
        </div>
      ),
    },
  ];
  const adminData = [
    {
      key: 1,
      id: 1,
      loginId: 'admin01',
      nickname: '관리자1',
      name: '김관리',
      email: 'admin01@moit.com',
      createdAt: '2026-08-01',
      status: '정상',
    },
    {
      key: 2,
      id: 2,
      loginId: 'admin02',
      nickname: '관리자2',
      name: '이관리',
      email: 'admin02@moit.com',
      createdAt: '2026-08-03',
      status: '정상',
    },
  ];
  const userColumns = [
    {
      title: '번호',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '아이디',
      dataIndex: 'loginId',
      key: 'loginId',
    },
    {
      title: '닉네임',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '가입일',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
  ];
  const userData = [
    {
      key: 1,
      id: 1,
      loginId: 'user01',
      nickname: '보라',
      name: '김보라',
      email: 'bora@moit.com',
      createdAt: '2026-08-01',
    },
    {
      key: 2,
      id: 2,
      loginId: 'user02',
      nickname: '철수',
      name: '김철수',
      email: 'chulsoo@moit.com',
      createdAt: '2026-08-03',
    },
  ];
  // 체크박스
  const [checkStrictly, setCheckStrictly] = useState(false);

  const rowSelection = {
    checkStrictly,
    onChange: (selectedRowKeys, selectedRows) => {
      console.log('선택된 ID:', selectedRowKeys);
      console.log('선택된 데이터:', selectedRows);
    },
  };

  const [listType, setListType] = useState('admin');

  // 목록 전환
  const listTabs = [
    {
      key: 'admin',
      label: '관리자목록',
    },
    {
      key: 'user',
      label: '사용자목록',
    },
  ];
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

      {/* 목록 탭 */}
      {/* 목록 탭 */}
      <AdminListTabs
        tabs={listTabs}
        activeTab={listType}
        onChange={setListType}
      />

      {/* 검색 영역 조건1개*/}
      {/* <AdminSearchBox
        conditions={[
          {
            key: 'searchType',
            defaultValue: 'title',
            options: [
              { value: 'title', label: '제목' },
              { value: 'content', label: '내용' },
            ],
          },
        ]}
      /> */}

      {/* 검색 영역 조건2개*/}
      <AdminSearchBox
        conditions={[
          {
            key: 'category',
            defaultValue: 'all',
            options: [
              { value: 'all', label: '전체' },
              { value: 'exercise', label: '운동' },
              { value: 'study', label: '스터디' },
            ],
          },
          {
            key: 'status',
            defaultValue: 'all',
            options: [
              { value: 'all', label: '전체 상태' },
              { value: 'recruiting', label: '모집중' },
              { value: 'closed', label: '마감' },
            ],
          },
        ]}
      />

      {/* 모임 목록 */}
      <div className="admin-table-box">
        <Table
          rowSelection={rowSelection}
          columns={listType === 'admin' ? adminColumns : userColumns}
          dataSource={listType === 'admin' ? adminData : userData}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          rowKey="id"
          scroll={{ x: 800 }}
        />
      </div>
    </>
  );
}
export default AdminSamplePage;
