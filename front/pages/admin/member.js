import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Button,
  Input,
  Table,
  message,
  Select,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import AdminStatCard from '../../components/AdminStatCard';
import AdminListTabs from '../../components/AdminListTabs';
import api from '../../api/axios';
import { useRouter } from 'next/router';

// http://localhost:3000/admin/member

function AdminMemberPage() {
  const router = useRouter();

  // =========================================================
  // 관리자 인증 상태
  // =========================================================
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // =========================================================
  // 회원 목록
  // =========================================================
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState({});

  // =========================================================
  // 페이지네이션
  // =========================================================

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);


  // =========================================================
  // 검색
  // =========================================================
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');


  // =========================================================
  // 목록 타입
  // =========================================================
  const [listType, setListType] = useState('admin');

  // =========================================================
  // 체크박스
  // =========================================================
  const [checkStrictly, setCheckStrictly] = useState(false);

  // =========================================================
  // 관리자 / 사용자 목록 구분
  // =========================================================
  const memberTypeId =
    listType === 'admin'
      ? 3
      : listType === 'member'
        ? 1
        : listType === 'partner'
          ? 2
          : null;

  // =========================================================
  // 삭제 여부
  // =========================================================
  const deleteYn =
    listType === 'withdrawn'
      ? 'Y'
      : 'N'        

  // =========================================================
  // 관리자 권한 확인
  // =========================================================
  useEffect(() => {
    const checkAdminAuth = async () => {

      try {
        // -----------------------------------------------------
        // SSR 방지
        // -----------------------------------------------------
        if (typeof window === 'undefined') {return;}

        // -----------------------------------------------------
        // Access Token 확인
        // -----------------------------------------------------
        const accessToken =localStorage.getItem('accessToken');

        // -----------------------------------------------------
        // 로그인하지 않은 경우
        // -----------------------------------------------------
        if (!accessToken) {
          // console.log('관리자 페이지 접근 실패 - 로그인 필요');
          router.replace('/user/member/login');

          return;
        }


        // -----------------------------------------------------
        // 현재 로그인 사용자 조회
        // -----------------------------------------------------
        const response = await api.get('/api/members/me' );
        const currentUser = response.data;       

        // -----------------------------------------------------
        // 사용자 정보 저장
        // -----------------------------------------------------
        setUser(currentUser);

        // -----------------------------------------------------
        // 관리자 / 최고관리자
        // -----------------------------------------------------
        if (currentUser.memberTypeId === 3 ||currentUser.memberTypeId === 4) {
          // console.log('관리자 접근 허용');
          setCheckingAuth(false);

          return;
        }

        // -----------------------------------------------------
        // 일반회원 / 제휴업체
        // -----------------------------------------------------
        // console.log('관리자 접근 차단');

        router.replace('/');
      } catch (error) {
        console.error('관리자 권한 확인 실패:',error );

        // -----------------------------------------------------
        // 인증 실패
        // -----------------------------------------------------
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          router.replace('/user/member/login');
          return;
        }

        // -----------------------------------------------------
        // 그 외 오류
        // -----------------------------------------------------
        router.replace('/');
      }
    };

    checkAdminAuth();
  }, [router]);

  // =========================================================
  // 관리자 회원 목록 조회
  // =========================================================
  const loadMembers = async () => {
    try {
      setLoading(true);

      // -----------------------------------------------------
      // API 호출
      // -----------------------------------------------------
      const response = await api.get('/api/admin/members',
          {
            params: {
              memberTypeId: memberTypeId,
              deleteYn: deleteYn,
              keyword: keyword || undefined,

              // Spring Data는 0부터 시작
              page: page - 1,
              size: pageSize,
            },
          }
        );

      // -----------------------------------------------------
      // 회원 목록
      // -----------------------------------------------------
      setMembers(response.data.content || []);

      // -----------------------------------------------------
      // 전체 데이터 개수
      // -----------------------------------------------------
      setTotal(response.data.totalElements || 0);
    } catch (error) {
      console.error('관리자 회원 목록 조회 실패:',error);

      // -----------------------------------------------------
      // 인증 실패
      // -----------------------------------------------------

      if (error.response?.status === 401 || error.response?.status === 403) {
        message.error('관리자 권한이 없습니다.');

        router.replace('/');
        return;
      }

      message.error('회원 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // 관리자 회원 통계 조회
  // =========================================================
  const loadStats = async () => {
    try {
      const response = await api.get('/api/admin/members/stats');

      const data = response.data;
      setStats([
        {
          title: '전체 회원',
          value: data.allCount,
          suffix: '명',
        },
        {
          title: '관리자',
          value: data.adminCount,
          suffix: '명',
        },
        {
          title: '일반회원',
          value: data.memberCount,
          suffix: '명',
        },
        {
          title: '정지 회원',
          value: data.suspendedCount,
          suffix: '명',
        },
        {
          title: '오늘 가입자',
          value: data.todayCount,
          suffix: '명',
        },
      ]);
    } catch (error) {
      console.error('회원 통계 조회 실패:',error);
      message.error('회원 통계를 불러오지 못했습니다.');
    }
  };

  // =========================================================
  // 관리자 인증 완료 후 회원 목록 조회
  // =========================================================
  useEffect(() => {
    if (checkingAuth) {return;}
    if (!user) {return;}
    if (user.memberTypeId !== 3 && user.memberTypeId !== 4) {return;}

    loadMembers();
  }, [checkingAuth,user,listType,page,keyword,]);

  // =========================================================
  // 관리자 인증 완료 후 통계 조회
  // =========================================================
  useEffect(() => {
    if (checkingAuth) {return;}
    if (!user) {return;}
    if (user.memberTypeId !== 3 && user.memberTypeId !== 4) {return;}

    loadStats();
  }, [checkingAuth, user]);

  // =========================================================
  // 탭 변경
  // =========================================================
  const handleListTypeChange = (type) => {
    setListType(type);

    // 탭 변경하면 1페이지로
    setPage(1);

    // 검색어도 초기화
    setKeyword('');
    setSearchKeyword('');
  };

  // =========================================================
  // 검색
  // =========================================================
  const handleSearch = () => {
    setPage(1);
    setKeyword(searchKeyword.trim());
  };


  // =========================================================
  // 검색 초기화
  // =========================================================
  const handleSearchReset = () => {
    setSearchKeyword('');
    setKeyword('');
    setPage(1);
  };

  // =========================================================
  // 회원 상태 이름
  // =========================================================
  const getStatusName = (statusId) => {
    switch (Number(statusId)) {
      case 1: return '정상';
      case 2: return '대기';
      case 3: return '정지';
      case 4: return '탈퇴';
      //case 5: return '소셜';
      default: return '-';
    }
  };

  // =========================================================
  // 회원 상태 변경
  // =========================================================
  const handleStatusSelect = (memberId, statusId) => {
    setSelectedStatus((prev) => ({
      ...prev,
      [memberId]: statusId,
    }));
  };

  const handleStatusUpdate = async (record) => {

    const memberId = record.memberId;
    const currentStatusId = Number(record.statusId);
    const newStatusId = Number(selectedStatus[memberId]);

    // 아무것도 선택하지 않은 경우
    if (!newStatusId) {
      message.warning('변경할 상태를 선택해주세요.');
      return;
    }

    // 기존 상태와 같은 경우
    if (currentStatusId === newStatusId) {
      message.info('현재 상태와 동일합니다.');
      return;
    }

    try {
      await api.put(
        `/api/admin/members/${memberId}/status`,
        null,
        {
          params: {statusId: newStatusId},
        }
      );

      message.success('회원 상태가 수정되었습니다.');

      // 선택값 제거
      setSelectedStatus((prev) => {
        const next = { ...prev };
        delete next[memberId];
        return next;
      });

      // 목록 다시 조회
      loadMembers();

    } catch (error) {
      console.error('회원 상태 수정 실패:',error);
      message.error('회원 상태 수정에 실패했습니다.');
    }
  };

  // =========================================================
  // 탈퇴회원 복구
  // =========================================================
  const handleRestoreMember = async (record) => {
    const memberId = record.memberId;

    try {
      await api.put(`/api/admin/members/${memberId}/restore`);

      message.success('회원이 복구되었습니다.');

      // 목록 다시 조회
      loadMembers();
    } catch (error) {

      console.error('회원 복구 실패:', error);
      message.error('회원 복구에 실패했습니다.');
    }
  };

  // =========================================================
  // 회원 유형 이름
  // =========================================================
  const getMemberTypeName = (memberTypeId) => {
    switch (Number(memberTypeId)) {

      case 1: return '일반회원';
      case 2: return '제휴업체';
      case 3: return '관리자';
      case 4: return '최고관리자';
      default: return '-';
    }
  };


  // =========================================================
  // 날짜 포맷
  // =========================================================
  const formatDate = (value) => {
    if (!value) {return '-';}

    return String(value).substring(0, 10);
  };

  // =========================================================
  // 목록 Column
  // =========================================================
  const memberColumns = [
    {
      title: '번호',
      dataIndex: 'memberId',
      key: 'memberId',
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
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '회원유형',
      dataIndex: 'memberTypeId',
      key: 'memberTypeId',
      align: 'center',
      render: (memberTypeId) =>
        getMemberTypeName(memberTypeId),
    },
    {
      title: '가입일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (value) =>
        formatDate(value),
    },
    {
      title: '상태',
      dataIndex: 'statusId',
      key: 'statusId',
      align: 'center',
      render: (statusId, record) => {

        const selectedValue =
          selectedStatus[record.memberId] ?? Number(statusId);

        // 상태 변경 권한
        // 최고관리자 → 모든 회원 상태 변경 가능
        // 일반관리자 → 관리자 회원만 변경 불가
        const canChangeStatus =
          user?.memberTypeId === 4 ||
          (
            user?.memberTypeId === 3 &&
            Number(record.memberTypeId) !== 3
          );

        // 상태 변경 권한이 없으면 상태만 표시
        if (!canChangeStatus) {
          return (
            <span>
              {getStatusName(statusId)}
            </span>
          );
        }

        return (
          <Select
            value={selectedValue}
            style={{ width: 110 }}
            onChange={(value) =>
              handleStatusSelect(
                record.memberId,
                value
              )
            }
          >
            {/* 탈퇴회원 목록 */}
            {listType === 'withdrawn' ? (
              <>
                <Select.Option value={1}>
                  정상
                </Select.Option>

                <Select.Option value={4}>
                  탈퇴
                </Select.Option>
              </>
            ) : (
              <>
                <Select.Option value={1}>
                  정상
                </Select.Option>

                <Select.Option value={2}>
                  대기
                </Select.Option>

                <Select.Option value={3}>
                  정지
                </Select.Option>

                <Select.Option value={4}>
                  탈퇴
                </Select.Option>
              </>
            )}
          </Select>
        );
      },
    },
    {
      title: '관리',
      key: 'action',
      align: 'center',
      render: (_, record) => {

        // 탈퇴회원
        if (listType === 'withdrawn') {
          return (
            <Button
              size="small"
              type="primary"
              onClick={() => handleRestoreMember(record)}
            >
              복구
            </Button>
          );
        }

        // 최고관리자 → 모든 회원 수정 가능
        if (user?.memberTypeId === 4) {
          return (
            <Button
              size="small"
              type="primary"
              onClick={() => handleStatusUpdate(record)}
            >
              수정
            </Button>
          );
        }

        // 일반관리자 → 관리자만 수정 불가
        if (
          user?.memberTypeId === 3 &&
          Number(record.memberTypeId) !== 3
        ) {
          return (
            <Button
              size="small"
              type="primary"
              onClick={() => handleStatusUpdate(record)}
            >
              수정
            </Button>
          );
        }

        // 일반관리자가 관리자 회원을 보는 경우
        return '-';
      },
    },
  ];

  // =========================================================
  // 체크박스
  // =========================================================
  const rowSelection = {
    checkStrictly,
    onChange: (selectedRowKeys,selectedRows) => {
      // console.log('선택된 ID:',selectedRowKeys);
      // console.log('선택된 데이터:',selectedRows);
    },
  };

  // =========================================================
  // 목록 탭
  // =========================================================
  const listTabs = [
    {
      key: 'admin',
      label: '관리자목록',
    },
    {
      key: 'member',
      label: '일반회원 목록',
    },
    {
      key: 'partner',
      label: '제휴업체 목록',
    },
    {
      key: 'withdrawn',
      label: '탈퇴회원 목록',
    },
  ];

  // =========================================================
  // 통계
  // =========================================================
  const [stats, setStats] = useState([
    {
      title: '전체 회원',
      value: 0,
      suffix: '명',
    },
    {
      title: '관리자',
      value: 0,
      suffix: '명',
    },
    {
      title: '일반회원',
      value: 0,
      suffix: '명',
    },
    {
      title: '정지 회원',
      value: 0,
      suffix: '명',
    },
  ]);

  // =========================================================
  // 인증 확인 중
  // =========================================================
  if (checkingAuth) {return null;}

  // =========================================================
  // 관리자 페이지
  // =========================================================
  return (
    <>
      {/* 통계 */}
      <Row gutter={[16, 16]}>
        {stats.map(
          (stat) => (
            <Col
              xs={24}
              sm={12}
              md={12}
              lg={6}
              key={stat.title}
            >

              <AdminStatCard
                {...stat}
              />
            </Col>
          )
        )}
      </Row>

      {/* 목록 탭 */}
      <AdminListTabs
        tabs={listTabs}
        activeTab={listType}
        onChange={handleListTypeChange}
      />

      {/* 검색 영역 */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          justifyContent: 'flex-end',
        }}
      >

        <Input
          placeholder="아이디 / 닉네임 / 이메일 검색"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onPressEnter={handleSearch}
          style={{width: 300,}}
        />

        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleSearch}
        >
          검색
        </Button>

        <Button
          onClick={handleSearchReset}
        >
          초기화
        </Button>
      </div>


      {/* 회원 목록 */}
      <div className="admin-table-box">
        <Table
          rowSelection={rowSelection}
          columns={memberColumns}
          dataSource={members}
          loading={loading}
          rowKey="memberId"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: false,
            showTotal: (total) =>
              `총 ${total}명`,
            onChange: (newPage) => {
              setPage(newPage);
            },
          }}
          scroll={{ x: 900 }}
        />
      </div>
    </>
  );
}

export default AdminMemberPage;