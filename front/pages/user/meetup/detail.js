import React, { useState, useEffect } from "react";

import MeetupImageCarousel from "../../../components/MeetupImageCarousel";
import MeetupWeather from "../../../components/MeetupWeather";
import MeetupTabs from "../../../components/MeetupTabs";
import MeetupRecruitInfo from "../../../components/MeetupRecruitInfo";
import MeetupAuthor from "../../../components/MeetupAuthor";
import RecommendedMeetups from "../../../components/RecommendedMeetups";
import MeetupMap from "../../../components/MeetupMap";
import AdBanner from "../../../components/AdBanner";
import { useRouter } from "next/router";
import {
    getReviewListRequest,
    toggleReviewLikeRequest,
} from "../../../reducers/reviewReducer";
import { qnaMeetupListRequest } from "../../../reducers/qnaReducer";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchMeetupDetailRequest,
    resetMeetupState,
    fetchRecommendedMeetupsRequest,
} from "../../../reducers/meetupReducer";
import { fetchWeatherRequest } from "../../../reducers/commonReducer";

import { Row, Col, Card, Button, Typography, Tag, Spin, message } from "antd";
import {
    ArrowLeftOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import api from "../../../api/axios";

const { Title } = Typography;

function MeetupDetailPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState("detail");

    const [currentSort, setCurrentSort] = useState("id,desc");
    const [currentKeyword, setCurrentKeyword] = useState("");

    useEffect(() => {
        if (!router.isReady) return;

        if (router.query.tab) {
            setActiveTab(router.query.tab);
        }

        if (router.asPath.includes("tab=review")) {
            const timer = setTimeout(() => {
                const reviewElement = document.getElementById("review-section");
                if (reviewElement) {
                    reviewElement.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [router.isReady, router.asPath, router.query.tab]);

    // meetup
    const { meetup, recommendedMeetups, meetupDetailError } = useSelector(
        (state) => state.meetup,
    );
    const { weather } = useSelector((state) => state.common);
    const { user } = useSelector((state) => state.user);
    const { meetupId } = router.query;
    const isOwner = user?.memberId === meetup?.memberId; //user?.id === meetup?.memberId;

    // 1. 현재 모임 ID 추출
    const currentMeetupId = router.query.meetupId
        ? Number(router.query.meetupId)
        : 1;

    // qna
    const { meetupQnaList, loading: qnaLoading } = useSelector(
        (state) => state.qna,
    );

    useEffect(() => {
        if (!router.isReady || !currentMeetupId) return;

        //console.log("===== 모임 Q&A 조회 =====");
        //console.log("currentMeetupId =", currentMeetupId);

        dispatch(qnaMeetupListRequest(currentMeetupId));
    }, [router.isReady, currentMeetupId, dispatch]);
    //console.log(isOwner);
    //console.log(user);

    // Redux Store에서 reviews 가져오기
    const { reviews: reduxReviews } = useSelector((state) => {
        if (!state) return {};
        return state.review || state.reviewReducer || {};
    });

    // URL tab 쿼리 파라미터 처리 (탭 변경)
    useEffect(() => {
        if (!router.isReady) return;

        if (router.query.tab) {
            setActiveTab(router.query.tab);
        }
    }, [router.isReady, router.query.tab]);

    // 2. 리뷰 목록 조회 (의존성 배열 수정: router.query 제거 및 currentMeetupId 사용)
    useEffect(() => {
        if (!router.isReady || !currentMeetupId) return;

        // 최초 로딩 시에도 기본 페이징과 정렬 값을 함께 전달
        dispatch(
            getReviewListRequest({
                meetupId: currentMeetupId,
                page: 0,
                size: 10,
                sort: "id,desc",
            }),
        );
    }, [dispatch, router.isReady, currentMeetupId]);

    // 3. 좋아요 핸들러
    const handleLikeReview = (reviewId) => {
        if (!reviewId) return;

        //console.log("좋아요 요청 실행! 리뷰 ID:", reviewId);
        dispatch(toggleReviewLikeRequest(reviewId));
    };

    // 정렬 핸들러 추가
    const handleSortChange = (sortParam) => {
        setCurrentSort(sortParam);
        //console.log("정렬 요청 실행:", sortParam);
        dispatch(
            getReviewListRequest({
                meetupId: currentMeetupId,
                sort: sortParam,
                keyword: currentKeyword,
            }),
        );
    };

    // 리뷰 검색 핸들러 추가
    const handleSearch = (keyword) => {
        setCurrentKeyword(keyword);
        console.log(
            "2. MeetupDetailPage에서 handleSearch 실행됨! 검색어:",
            keyword,
        );
        //console.log("현재 모임 ID:", currentMeetupId);

        dispatch(
            getReviewListRequest({
                meetupId: currentMeetupId,
                keyword: keyword,
                sort: currentSort,
            }),
        );
    };

    // 신고 핸들러
    const handleReport = async (targetType, targetId, targetMemberId) => {
        try {
            // 본인이 만든 모임
            if (user?.memberId === targetMemberId) {
                alert(
                    targetType === "MEETUP"
                        ? "본인이 만든 모임은 신고할 수 없습니다."
                        : "본인이 작성한 후기는 신고할 수 없습니다.",
                );
                return;
            }

            const response = await api.get("/api/reports/checkDoubleReport", {
                params: {
                    targetType: targetType,
                    targetId: targetId,
                },
            });

            if (response.data === true) {
                alert("이미 신고한 글입니다.");
                return;
            }

            router.push(
                `/user/meetup/report/write?targetType=${targetType}&targetId=${targetId}`,
            );
        } catch (error) {
            // console.error("중복 신고 확인 실패:", error);
            // console.error("에러 이름:", error?.name);
            // console.error("에러 메시지:", error?.message);
            // console.error("응답 상태:", error?.response?.status);
            // console.error("응답 데이터:", error?.response?.data);
            // console.error("요청 주소:", error?.config?.url);

            alert("신고 여부 확인 중 오류가 발생했습니다.");
        }
    };

    // 모임 데이터
    useEffect(() => {
        if (!router.isReady || !meetupId) {
            return;
        }

        // 이전 상세 데이터 초기화
        dispatch(resetMeetupState());

        // 새로운 모임 조회
        dispatch(fetchMeetupDetailRequest(meetupId));
    }, [router.isReady, meetupId, dispatch]);

    // 비공개 모임 접근 차단
    useEffect(() => {
        if (!meetup || !meetupId) return;

        if (Number(meetup.id) !== Number(meetupId)) return;

        if (meetup.hidden) {
            alert("모임이 관리자에 의해 비공개 처리되었습니다.");
            router.back();
        }
    }, [meetup, meetupId, router]);

    // 상세조회 에러 처리
    useEffect(() => {
        if (!meetupDetailError) return;

        alert(meetupDetailError);
        router.back();
    }, [meetupDetailError, router]);

    // 이미지
    const images =
        meetup?.imagePaths?.length > 0
            ? meetup.imagePaths.map(
                  (imagePath) =>
                      `http://localhost:8080/upload/meetup/${imagePath}`,
              )
            : ["http://localhost:8080/upload/no-image.png"];

    const rawReviews =
        reduxReviews?.map((review) => ({
            ...review, // 👈 기존 서버 데이터(id, memberId, memberNickname, liked, isLiked 등)를 전부 유지!
            id: review.id,
            memberId: review.memberId, // 신고 추가 ...
            nickname: review.memberNickname || review.nickname || "익명",
            date: review.createdAt
                ? String(review.createdAt).substring(0, 10)
                : "",
            likesCount: review.likesCount ?? review.likes ?? 0,
            liked: Boolean(review.liked || review.isLiked), //
            isLiked: Boolean(review.liked || review.isLiked), //
            isPublic: review.isPublic ?? "Y",
        })) || [];

    // 비공개 후기 필터링
    const reviews = rawReviews.filter((review) => review.isPublic === "Y");

    // Q&A
    const qnaLists = Array.isArray(meetupQnaList) ? meetupQnaList : [];

    // 날씨
    useEffect(() => {
        if (!meetup || !meetup.meetupAt) {
            return;
        }
        const meetupDate = meetup.meetupAt.substring(0, 10).replaceAll("-", "");

        const meetupTime = Number(meetup.meetupAt.substring(11, 13));
        dispatch(
            fetchWeatherRequest({
                meetupDate: meetupDate,
                meetupTime: meetupTime,
                nx: meetup.nx,
                ny: meetup.ny,
            }),
        );
    }, [meetup, dispatch]);

    // console.log("추천모임:", recommendedMeetups);
    // console.log("현재 meetupId:", meetupId);

    //인기모임
    useEffect(() => {
        if (!router.isReady || !meetupId) return;

        dispatch(fetchRecommendedMeetupsRequest(Number(meetupId)));
    }, [router.isReady, meetupId, dispatch]);

    //로딩처리
    if (!meetup) {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "300px",
                    gap: "16px",
                }}
            >
                <Spin size="large" />
                <span>모임 정보를 불러오는 중입니다...</span>
            </div>
        );
    }

    // 광고
    const ad = {
        title: "Moit 특별 이벤트",
        image: "/images/ad-banner.png",
    };

    return (
        <div className="meetup-detail-page">
            {/* 목록으로 */}
            <Row style={{ marginBottom: 16 }}>
                <Col span={24}>
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        className="meetup-back-button"
                        onClick={() => router.back()}
                    >
                        목록으로
                    </Button>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {/* LEFT */}
                <Col xs={24} lg={16}>
                    {/* 날씨 */}
                    <MeetupWeather
                        temperature={weather?.tmp}
                        precipitation={weather?.pop}
                        sky={weather?.sky}
                    />

                    {/* 이미지 */}
                    <MeetupImageCarousel images={images} />

                    {/* 제목 */}
                    <Card className="meetup-title-card">
                        <Row justify="space-between" align="middle">
                            <Col>
                                {meetup?.meetupStatus === "RECRUITING" ? (
                                    <Tag color="green">모집중</Tag>
                                ) : meetup?.meetupStatus ===
                                  "WEATHER_CANCELED" ? (
                                    <Tag color="red">기상학화로인한취소</Tag>
                                ) : (
                                    <Tag color="red">종료</Tag>
                                )}
                            </Col>

                            <Col>
                                <Button
                                    danger
                                    onClick={() =>
                                        handleReport(
                                            "MEETUP",
                                            meetup.id,
                                            meetup.memberId,
                                        )
                                    }
                                >
                                    신고
                                </Button>
                            </Col>
                        </Row>

                        <Title level={2} style={{ marginTop: 16 }}>
                            {meetup.title}
                        </Title>
                    </Card>

                    {/* 탭 */}
                    <MeetupTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        meetup={meetup}
                        reviews={reviews}
                        qnaLists={qnaLists}
                        meetupId={currentMeetupId}
                        isHost={isOwner}
                        onLikeReview={handleLikeReview}
                        onSortChange={handleSortChange}
                        onSearch={handleSearch}
                        onReport={handleReport}
                        meetupStatus={meetup?.meetupStatus} //추가
                    />
                </Col>

                {/* RIGHT SIDEBAR */}
                <Col xs={24} lg={8}>
                    {/* 모집 정보 */}
                    <MeetupRecruitInfo meetup={meetup} isOwner={isOwner} />
                    {/* 작성자 */}
                    <MeetupAuthor meetup={meetup} meetupId={currentMeetupId} />
                    {/* 추천 모임 */}
                    <RecommendedMeetups
                        recommendedMeetups={recommendedMeetups}
                        onMeetupClick={(meetupId) => {
                            router.push({
                                pathname: "/user/meetup/detail",
                                query: { meetupId },
                            });
                        }}
                    />
                    {/* 지도 */}
                    <MeetupMap
                        latitude={meetup.latitude}
                        longitude={meetup.longitude}
                        address={meetup.address}
                    />
                    {/* 광고 */}
                    <AdBanner position="MEETUP_DETAIL_SIDEBAR" />
                </Col>
            </Row>
        </div>
    );
}

export default MeetupDetailPage;
