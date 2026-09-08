import { useEffect } from 'react';

import {
    useDispatch,
    useSelector,
} from 'react-redux';

import {
    Row,
    Col,
    Card,
    Statistic,
    Typography,
    Spin,
    Empty,
    Button,
    message,
} from 'antd';

import {
    Line,
    Bar,
    Pie,
} from 'react-chartjs-2';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

import {
    getAdvertiseDashboardRequest,
} from '../../../reducers/advertiseDashboardReducer';

const { Title, Text } = Typography;

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
);

const renderChange = (value) => {

    const change = Number(value ?? 0);

    if (change > 0) {
        return (
            <div
                style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: '#7AA7D9',
                }}
            >
                ▲ {change.toFixed(2)}%
                <span
                    style={{
                        marginLeft: 5,
                        color: '#9AA3B2',
                    }}
                >
                    전일 대비
                </span>
            </div>
        );
    }

    if (change < 0) {
        return (
            <div
                style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: '#B58BC4',
                }}
            >
                ▼ {Math.abs(change).toFixed(2)}%
                <span
                    style={{
                        marginLeft: 5,
                        color: '#9AA3B2',
                    }}
                >
                    전일 대비
                </span>
            </div>
        );
    }

    return (
        <div
            style={{
                marginTop: 8,
                fontSize: 12,
                color: '#9AA3B2',
            }}
        >
            — 0.00%
            <span
                style={{
                    marginLeft: 5,
                }}
            >
                전일 대비
            </span>
        </div>
    );
};

// =========================================================
// 파스텔 컬러
// =========================================================

// 메인 파스텔 블루
const BLUE = '#91caff';
const BLUE_LIGHT = 'rgba(145, 202, 255, 0.18)';
const BLUE_BORDER = '#69b1ff';

// 파스텔 청보라
const LAVENDER = '#b7b5e8';
const LAVENDER_LIGHT = 'rgba(183, 181, 232, 0.18)';
const LAVENDER_BORDER = '#9895d5';

// 추가 파스텔 계열
const BLUE_2 = '#adcff2';
const BLUE_3 = '#c5dcf5';
const BLUE_4 = '#d9e8f7';

const PURPLE_2 = '#c7c5ed';
const PURPLE_3 = '#d6d5f1';
const PURPLE_4 = '#e3e2f5';

// =========================================================
// 광고 위치 고정 순서
// =========================================================

const POSITION_ORDER = [
    'MAIN',
    'MEETUP_LIST_BANNER',
    'MEETUP_LIST_SIDEBAR',
    'MEETUP_DETAIL_SIDEBAR',
];


function AdvertiseDashboardPage() {

    const dispatch = useDispatch();

    // =========================================================
    // Redux 상태
    // =========================================================
    const {
        summary,
        dailyData,
        ctrData,
        gradeData,
        positionData,
        positionCtrData,
        extensionRate,
        aiSummary,
        loading,
        error,
    } = useSelector(
        state => state.advertiseDashboard
    );


    // =========================================================
    // 대시보드 조회
    // =========================================================
    useEffect(() => {

        dispatch(
            getAdvertiseDashboardRequest()
        );

    }, [dispatch]);


    // =========================================================
    // 에러 처리
    // =========================================================
    useEffect(() => {

        if (error) {

            console.error(
                '광고 대시보드 조회 실패',
                error
            );

            message.error(
                '광고 대시보드 데이터를 불러오지 못했습니다.'
            );
        }

    }, [error]);


    // =========================================================
    // 최근 7일
    // =========================================================
    const dailyChartData = {

        labels: dailyData.map(
            item => item.statDate
        ),

        datasets: [

            {
                label: '노출수',

                data: dailyData.map(
                    item => item.impressions ?? 0
                ),

                borderColor: BLUE_BORDER,

                backgroundColor: BLUE_LIGHT,

                borderWidth: 2.5,

                tension: 0.35,

                pointRadius: 4,

                pointHoverRadius: 6,

                pointBackgroundColor: BLUE,

                pointBorderColor: '#ffffff',

                pointBorderWidth: 2,

                fill: true,
            },

            {
                label: '클릭수',

                data: dailyData.map(
                    item => item.clicks ?? 0
                ),

                borderColor: LAVENDER_BORDER,

                backgroundColor: LAVENDER_LIGHT,

                borderWidth: 2.5,

                tension: 0.35,

                pointRadius: 4,

                pointHoverRadius: 6,

                pointBackgroundColor: LAVENDER,

                pointBorderColor: '#ffffff',

                pointBorderWidth: 2,

                fill: true,
            },
        ],
    };


    const dailyChartOptions = {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {
            mode: 'index',
            intersect: false,
        },

        plugins: {

            legend: {
                position: 'top',
            },
        },

        scales: {

            y: {
                beginAtZero: true,

                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },

            x: {
                grid: {
                    display: false,
                },
            },
        },
    };


    // =========================================================
    // CTR TOP 5
    // =========================================================
    const ctrChartData = {

        labels: ctrData.map(
            item => item.title
        ),

        datasets: [

            {
                label: 'CTR (%)',

                data: ctrData.map(
                    item => item.ctr ?? 0
                ),

                backgroundColor: [
                    BLUE,
                    BLUE_2,
                    '#a9c7e5',
                    LAVENDER,
                    PURPLE_2,
                ],

                borderColor: [
                    BLUE_BORDER,
                    '#8dbbe2',
                    '#91b6d8',
                    LAVENDER_BORDER,
                    '#aaa8d9',
                ],

                borderWidth: 1,

                borderRadius: 7,

                barPercentage: 0.65,
            },
        ],
    };


    const ctrChartOptions = {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {
                display: false,
            },
        },

        scales: {

            y: {
                beginAtZero: true,

                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },

            x: {
                grid: {
                    display: false,
                },
            },
        },
    };


    // =========================================================
    // 광고 등급
    // =========================================================
    const gradeChartData = {

        labels: gradeData.map(
            item => item.adGrade
        ),

        datasets: [

            {
                data: gradeData.map(
                    item => item.count ?? 0
                ),

                backgroundColor: [
                    BLUE,
                    LAVENDER,
                    BLUE_2,
                    PURPLE_2,
                ],

                borderColor: '#ffffff',

                borderWidth: 3,
            },
        ],
    };


    // =========================================================
    // 위치별 노출
    // =========================================================

    const sortedPositionData = POSITION_ORDER.map(
        position => {

            const found =
                positionData.find(
                    item => item.position === position
                );

            return {
                position,

                impressions:
                    found?.impressions ?? 0,
            };
        }
    );


    const positionChartData = {

        labels: sortedPositionData.map(
            item => item.position
        ),

        datasets: [

            {
                label: '노출수',

                data: sortedPositionData.map(
                    item => item.impressions
                ),

                backgroundColor: [
                    BLUE,
                    BLUE_2,
                    BLUE_3,
                    BLUE_4,
                ],

                borderColor: [
                    BLUE_BORDER,
                    '#8dbbe2',
                    '#a8c9e5',
                    '#bcd3ea',
                ],

                borderWidth: 1,

                borderRadius: 7,

                barPercentage: 0.6,
            },
        ],
    };


    const positionChartOptions = {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {
                display: false,
            },
        },

        scales: {

            y: {
                beginAtZero: true,

                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },

            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    // =========================================================
    // 위치별 CTR
    // =========================================================

    const sortedPositionCtrData = POSITION_ORDER.map(
        position => {

            const found =
                positionCtrData.find(
                    item => item.position === position
                );

            return {
                position,

                ctr:
                    found?.ctr ?? 0,
            };
        }
    );


    const positionCtrChartData = {

        labels: sortedPositionCtrData.map(
            item => item.position
        ),

        datasets: [

            {
                label: 'CTR (%)',

                data: sortedPositionCtrData.map(
                    item => item.ctr
                ),

                backgroundColor: [
                    LAVENDER,
                    PURPLE_2,
                    PURPLE_3,
                    PURPLE_4,
                ],

                borderColor: [
                    LAVENDER_BORDER,
                    '#aaa8d9',
                    '#bab9df',
                    '#cac9e7',
                ],

                borderWidth: 1,

                borderRadius: 7,

                barPercentage: 0.6,
            },
        ],
    };


    const positionCtrChartOptions = {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {
                display: false,
            },
        },

        scales: {

            y: {
                beginAtZero: true,

                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },

            x: {
                grid: {
                    display: false,
                },
            },
        },
    };


    // =========================================================
    // 공통 카드 스타일
    // =========================================================
    const cardStyle = {

        borderRadius: 12,

        border: '1px solid #edf1f7',

        boxShadow: '0 2px 8px rgba(80, 110, 150, 0.06)',
    };


    // =========================================================
    // 로딩
    // =========================================================
    if (loading) {

        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 500,
                }}
            >
                <Spin size="large" />
            </div>
        );
    }


    // =========================================================
    // 화면
    // =========================================================
    return (

        <div>

            {/* =================================================
                헤더
            ================================================= */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                }}
            >

                <div>

                    <Title
                        level={2}
                        style={{
                            margin: 0,
                            fontWeight: 700,
                        }}
                    >
                        📊 광고 대시보드
                    </Title>

                    <Text type="secondary">
                        광고 운영 현황 및 성과 분석
                    </Text>

                </div>


                <Button
                    style={{
                        borderColor: '#b7d5f3',
                        color: '#5b8fc5',
                        borderRadius: 7,
                    }}
                    onClick={() => {

                        window.location.href =
                            '/admin/advertise';

                    }}
                >
                    광고 관리
                </Button>

            </div>


            {/* =================================================
                상단 요약
            ================================================= */}
            <Row
                gutter={[16, 16]}
                style={{ marginBottom: 24 }}
            >

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="총 광고"
                            value={summary?.totalAd ?? 0}
                            suffix="개"
                        />
                    </Card>
                </Col>


                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="총 노출"
                            value={summary?.totalImp ?? 0}
                        />

                        {renderChange(summary?.impChange)}
                    </Card>
                </Col>


                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="총 클릭"
                            value={summary?.totalClick ?? 0}
                        />

                        {renderChange(summary?.clickChange)}
                    </Card>
                </Col>


                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="평균 CTR"
                            value={summary?.avgCtr ?? 0}
                            precision={2}
                            suffix="%"
                        />

                        {renderChange(summary?.ctrChange)}
                    </Card>
                </Col>

            </Row>


            {/* =================================================
                AI 운영 분석
            ================================================= */}
            <Card
                title="🤖 AI 운영 분석"
                style={{
                    ...cardStyle,
                    marginBottom: 24,
                    background:
                        'linear-gradient(135deg, #f8fbff 0%, #faf9ff 100%)',
                }}
            >

                {aiSummary?.summary ? (
                    <>
                        <div
                            style={{
                                whiteSpace: 'pre-line',
                                lineHeight: 1.9,
                                color: '#4f5968',
                            }}
                        >
                            {aiSummary.summary}
                        </div>

                        <div
                            style={{
                                marginTop: 16,
                                textAlign: 'right',
                            }}
                        >
                            <Text type="secondary">

                                생성 시각 : {
                                    aiSummary.createdAt || '-'
                                }
                            </Text>
                        </div>
                    </>
                ) : (
                    <Empty
                        description="아직 생성된 AI 분석이 없습니다."
                    />
                )}
            </Card>

            {/* =================================================
                최근 7일
            ================================================= */}
            <Card
                title="최근 7일 광고 통계"
                style={{
                    ...cardStyle,
                    marginBottom: 24,
                }}
            >

                <div
                    style={{
                        height: 400,
                    }}
                >

                    <Line
                        data={dailyChartData}
                        options={dailyChartOptions}
                    />

                </div>

            </Card>


            {/* =================================================
                CTR TOP5 + 등급 + 연장률
            ================================================= */}
            <Row
                gutter={[16, 16]}
                style={{
                    marginBottom: 24,
                }}
            >

                <Col xs={24} lg={12}>

                    <Card
                        title="CTR TOP 5"
                        style={cardStyle}
                    >

                        <div
                            style={{
                                height: 350,
                            }}
                        >

                            <Bar
                                data={ctrChartData}
                                options={ctrChartOptions}
                            />

                        </div>

                    </Card>

                </Col>


                <Col xs={24} md={12} lg={6}>

                    <Card
                        title="광고 등급 비율"
                        style={cardStyle}
                    >

                        <div
                            style={{
                                height: 300,
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >

                            <Pie
                                data={gradeChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                }}
                            />

                        </div>

                    </Card>

                </Col>


                <Col xs={24} md={12} lg={6}>

                    <Card
                        title="광고 연장률"
                        style={cardStyle}
                    >

                        <div
                            style={{
                                height: 300,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >

                            <div
                                style={{
                                    fontSize: 48,
                                    fontWeight: 700,
                                    color: '#8f8dcc',
                                }}
                            >
                                {Number(
                                    extensionRate
                                ).toFixed(2)}%
                            </div>


                            <Text type="secondary">
                                전체 광고 대비
                            </Text>

                            <Text type="secondary">
                                연장 결제 비율
                            </Text>

                        </div>

                    </Card>

                </Col>

            </Row>


            {/* =================================================
                위치별 통계
            ================================================= */}
            <Row
                gutter={[16, 16]}
            >

                <Col xs={24} lg={12}>

                    <Card
                        title="위치별 노출"
                        style={cardStyle}
                    >

                        <div
                            style={{
                                height: 350,
                            }}
                        >

                            <Bar
                                data={positionChartData}
                                options={positionChartOptions}
                            />

                        </div>

                    </Card>

                </Col>


                <Col xs={24} lg={12}>

                    <Card
                        title="광고 위치별 CTR"
                        style={cardStyle}
                    >

                        <div
                            style={{
                                height: 350,
                            }}
                        >

                            <Bar
                                data={positionCtrChartData}
                                options={positionCtrChartOptions}
                            />

                        </div>

                    </Card>

                </Col>

            </Row>

        </div>
    );
}


export default AdvertiseDashboardPage;