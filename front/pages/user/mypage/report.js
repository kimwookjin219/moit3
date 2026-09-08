// pages/user/mypage/report.js

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';

import {
    fetchReportsRequest
} from '../../../reducers/reportReducer';

import {
    Card, Table, Button, Typography, Spin, message
} from 'antd';

import ReportStatusTag from '../../../components/ReportStatusTag';
import ReportStatusCodeTag from '../../../components/ReportStatusCodeTag';

const { Title } = Typography;



function UserMyReportPage() {

    const dispatch = useDispatch();
    const router = useRouter();


    // =====================================================
    // Redux 신고 상태
    // =====================================================
    const {
        reports,
        totalCount,
        fetch
    } = useSelector((state) => state.report);


    // =====================================================
    // 현재 페이지
    // Ant Design = 1부터 시작
    // Spring Pageable = 0부터 시작
    // =====================================================
    const [page, setPage] = useState(1);


    // =====================================================
    // 신고 목록 조회
    // =====================================================
    useEffect(() => {

        dispatch(
            fetchReportsRequest({
                page: page - 1,
                size: 10
            })
        );

    }, [dispatch, page]);


    // =====================================================
    // 조회 오류
    // =====================================================
    useEffect(() => {

        if (fetch.error) {
            message.error(fetch.error);
        }

    }, [fetch.error]);


    // =====================================================
    // 신고 대상 한글 변환
    // =====================================================
    const getTargetTypeText = (targetType) => {

        if (targetType === 'MEETUP') {
            return '모임';
        }

        if (targetType === 'REVIEW') {
            return '후기';
        }

        return targetType;
    };


    // =====================================================
    // 신고 사유 한글 변환
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
    // 상세 페이지 이동
    // =====================================================
    const handleDetail = (reportId) => {

        router.push(
            `/user/meetup/report/${reportId}`
        );
    };


    // =====================================================
    // 테이블 컬럼
    // =====================================================
    const columns = [
        {
            title: '신고번호',
            dataIndex: 'reportId',
            key: 'reportId',
            align: 'center'
        },

        {
            title: '신고 대상',
            dataIndex: 'targetMemberNickname',
            key: 'targetMemberNickname',
            align: 'center'
        },

        {
            title: '매너 점수',
            dataIndex: 'targetTrustScore',
            key: 'targetTrustScore',
            align: 'center'
        },

        {
            title: '뱃지',
            dataIndex: 'targetStatusCode',
            key: 'targetStatusCode',
            align: 'center',

            render: (targetStatusCode) => (
                <ReportStatusCodeTag
                    statusCode={targetStatusCode}
                />
            )
        },

        {
            title: '신고 대상 유형',
            dataIndex: 'targetType',
            key: 'targetType',
            align: 'center',

            render: (targetType) =>
                getTargetTypeText(targetType)
        },

        {
            title: '글 번호',
            dataIndex: 'targetId',
            key: 'targetId',
            align: 'center'
        },

        {
            title: '신고 사유',
            dataIndex: 'reasonCode',
            key: 'reasonCode',
            align: 'center',

            render: (reasonCode) =>
                getReasonCodeText(reasonCode)
        },

        {
            title: '처리 상태',
            dataIndex: 'status',
            key: 'status',
            align: 'center',

            render: (status) => (
                <ReportStatusTag status={status} />
            )
        },

        {
            title: '신고일',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',

            render: (createdAt) =>
                createdAt?.slice(0, 10)
        },

        {
            title: '관리',
            key: 'detail',
            align: 'center',

            render: (_, report) => (
                <Button
                    onClick={() =>
                        handleDetail(report.reportId)
                    }
                >
                    상세보기
                </Button>
            )
        }
    ];


    // =====================================================
    // 로딩
    // =====================================================
    if (fetch.loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: 50
                }}
            >
                <Spin size="large" />
            </div>
        );
    }


    // =====================================================
    // 화면
    // =====================================================
    return (
        <div className="report-list-page">
            <Card>
                <Title level={3}>
                    내 신고 내역
                </Title>

                <Table
                    columns={columns}
                    dataSource={reports || []}
                    rowKey="reportId"
                    pagination={{
                        current: page,
                        pageSize: 10,
                        total: totalCount,
                        showSizeChanger: false,

                        onChange: (newPage) => {
                            setPage(newPage);
                        }
                    }}
                />
            </Card>
        </div>
    );
}

export default UserMyReportPage;