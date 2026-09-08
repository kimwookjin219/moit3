// pages/user/meetup/report/index.js
// 사용자 신고 목록 페이지
// 내가 작성한 신고 내역 목록 + 페이징

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { fetchReportsRequest } from '../../../../reducers/reportReducer';
import { Card, Table, Button, Typography, Spin, message } from 'antd';

import ReportStatusTag from '../../../../components/ReportStatusTag';
import ReportStatusCodeTag from '../../../../components/ReportStatusCodeTag';


const { Title } = Typography;

function ReportListPage() {

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
    // 현재 페이지 번호
    // Ant Design은 1부터 시작
    // Spring Pageable은 0부터 시작
    // =====================================================
    const [page, setPage] = useState(1);


    console.log('reports: ', reports);

    // =====================================================
    // 신고 목록 조회
    // =====================================================
    useEffect(() => {

        dispatch(
            fetchReportsRequest({
                page: page - 1,     // Spring Pageable은 0부터
                size: 10
            })
        );

    }, [dispatch, page]);


    // =====================================================
    // 목록 조회 오류
    // =====================================================
    useEffect(() => {

        if (fetch.error) {
            message.error(fetch.error);
        }

    }, [fetch.error]);


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

        return targetType;
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
    

    // const ReportStatusCodeTag = ({ statusCode }) => {
    //     if (statusCode === 'ACTIVE') {
    //         return <Tag color="green">정상</Tag>;
    //     }

    //     if (statusCode === 'WARNING') {
    //         return <Tag color="orange">주의</Tag>;
    //     }

    //     if (statusCode === 'DANGER') {
    //         return <Tag color="red">위험</Tag>;
    //     }

    //     return null;
    // };


    // =====================================================
    // 상세페이지 이동
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
            key: 'reportId'
        },

        {
            title: '신고자 (test 나중에 빼야함!~!!~~!!~!!!)',
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
            title: '신고 대상',
            dataIndex: 'targetType',    // 각 객체에서 어떤 필드를 가져올 것인가
            key: 'targetType',          // 컬럼 자체의 식별자

            render: (targetType) => (   // 가져온 값을 어떻게 가공해서 보여줄 것인가
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
            key: 'detail',

            render: (_, report) => (
                <Button onClick={()=> handleDetail(report.reportId)}>
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
            <Spin size="large" />
        );
    }


    return (
        <div className="report-list-page">
            <Card>
                <Title level={2}>
                    나의 신고 내역
                </Title>

                <Table
                    columns={columns}
                    dataSource={ reports || [] }
                    rowKey="reportId"
                    pagination={{
                        current: page,
                        pageSize: 10,
                        total: totalCount,

                        onChange: (newPage) => {
                            setPage(newPage);
                        }
                    }}
                />
            </Card>
        </div>
    );
}


export default ReportListPage;