import React, { useState, useEffect } from "react";
import { Row, Col, message } from "antd";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import {
    fetchMeetupsRequest,
    fetchCategoriesRequest,
    fetchSigungusRequest,
    meetupLikeRequest,
    fetchTodayMeetupCountRequest,
} from "../../../reducers/meetupReducer";

import MeetupSearchFilter from "../../../components/MeetupSearchFilter";
import MeetupCategory from "../../../components/MeetupCategory";
import MeetupList from "../../../components/MeetupList";
import CommonPagination from "../../../components/CommonPagination";
import AdBanner from "../../../components/AdBanner";

function MeetupListPage() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [searchText, setSearchText] = useState("");

    const [sidoId, setSidoId] = useState(0);

    const [orderType, setOrderType] = useState("createAt");

    const [categoryId, setCategoryId] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 9;

    // 실제 조회에 사용하는 조건
    const [searchParams, setSearchParams] = useState({
        searchText: "",
        sidoId: 0,
        categoryId: 0,
        orderType: "createAt",
    });

    const {
        meetups,
        categories,
        sigungus,
        totalCount,
        todayMeetupCount,
        error,
    } = useSelector((state) => state.meetup);

    const { user } = useSelector((state) => state.user);

    // 최초 한 번만
    useEffect(() => {
        dispatch(fetchCategoriesRequest());
        dispatch(fetchSigungusRequest());
    }, [dispatch]);

    // 페이지가 바뀔 때마다
    // 모임 조회
    useEffect(() => {
        dispatch(
            fetchMeetupsRequest({
                page: currentPage - 1,
                size: pageSize,
                searchType: searchParams.searchText ? "title" : null,
                searchText: searchParams.searchText || null,
                sidoId: searchParams.sidoId || null,
                categoryId: searchParams.categoryId || null,
                orderType: searchParams.orderType,
            }),
        );
    }, [currentPage, searchParams, dispatch]);

    useEffect(() => {
        if (!router.isReady) return;

        const queryCategoryId = router.query.categoryId;

        if (queryCategoryId) {
            const id = Number(queryCategoryId);

            setCategoryId(id);

            setSearchParams((prev) => ({
                ...prev,
                categoryId: id,
            }));
        }
    }, [router.isReady, router.query.categoryId]);

    const sidoList = [
        ...new Map(
            sigungus.map((sigungu) => [sigungu.sido.sidoId, sigungu.sido]),
        ).values(),
    ];

    // 하루 모임 수 조회
    useEffect(() => {
        dispatch(fetchTodayMeetupCountRequest());
    }, [dispatch]);

    // 검색
    const handleSearch = () => {
        // console.log({
        //     searchText,
        //     sidoId,
        //     orderType,
        //     categoryId,
        // });

        setCurrentPage(1);

        setSearchParams({
            searchText,
            sidoId,
            categoryId,
            orderType,
        });
    };

    // 카테고리
    const handleCategoryChange = (id) => {
        setCategoryId(id);
        setCurrentPage(1);

        setSearchParams((prev) => ({
            ...prev,
            categoryId: id,
        }));
    };

    // 상세
    const handleMeetupClick = (meetupId) => {
        if (!user) {
            message.warning("로그인이 필요한 서비스입니다.");
            router.push("/user/member/login");
            return;
        }
        router.push(`/user/meetup/detail?meetupId=${meetupId}`);
    };

    // 좋아요
    const handleToggleLike = (meetupId) => {
        //console.log(meetupId);
        dispatch(meetupLikeRequest(meetupId));
    };

    // 모임등록
    const handleCreateMeetup = () => {
        if (!user) {
            message.warning("로그인이 필요한 서비스입니다.");
            router.push("/user/member/login");
            return;
        }

        //오늘 등록한 모임 수
        if (todayMeetupCount >= 3) {
            message.error("하루 최대 3개의 모임만 등록할 수 있습니다.");
            return;
        }

        router.push("/user/meetup/write");
    };

    // 페이지
    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
    };

    return (
        <div className="meetup-list-page">
            <Row gutter={[24, 24]}>
                {/* =====================
            메인
        ====================== */}
                <Col xs={24} lg={18}>
                    {/* 광고 */}
                    <AdBanner position="MEETUP_LIST_BANNER" />

                    {/* 검색 */}
                    <MeetupSearchFilter
                        searchText={searchText}
                        setSearchText={setSearchText}
                        sidoId={sidoId}
                        setSidoId={setSidoId}
                        orderType={orderType}
                        setOrderType={setOrderType}
                        sidoList={sidoList}
                        onSearch={handleSearch}
                        onCreate={handleCreateMeetup}
                    />

                    {/* 모임 목록 */}
                    <MeetupList
                        meetups={meetups}
                        onClick={handleMeetupClick}
                        onToggleLike={handleToggleLike}
                    />

                    {/* 페이지 */}
                    <CommonPagination
                        current={currentPage}
                        total={totalCount}
                        pageSize={pageSize}
                        onChange={handlePageChange}
                    />
                </Col>

                {/* =====================
            사이드바
        ====================== */}
                <Col xs={24} lg={6}>
                    <div className="meetup-category-sticky">
                        <MeetupCategory
                            categories={categories.filter(
                                (cate) => cate.parentId === null,
                            )}
                            selectedCategoryId={categoryId}
                            onChange={handleCategoryChange}
                        />

                        <AdBanner position="MEETUP_LIST_SIDEBAR" />
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default MeetupListPage;
