import React, { useState, useEffect } from "react";
import { message } from "antd";
import CategoryList from "../components/CategoryList";
import AdBanner from "../components/AdBanner";
import PopularMeetupList from "../components/PopularMeetupList";
import Hero from "../components/Hero";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import {
    fetchCategoriesRequest,
    fetchPopularMeetupsRequest,
    meetupLikeRequest,
} from "../reducers/meetupReducer";

export default function Home() {
    const dispatch = useDispatch();
    const { categories, popularMeetups } = useSelector((state) => state.meetup);
    const { user } = useSelector((state) => state.user);
    const router = useRouter();

    useEffect(() => {
        dispatch(fetchCategoriesRequest());
        dispatch(fetchPopularMeetupsRequest());
    }, [dispatch]);

    // 카테고리 클릭
    const handleCategoryClick = (category) => {
        router.push(`/user/meetup?categoryId=${category.id}`);
    };

    // 인기모임 클릭
    const handlePopularMeetupClick = (meetupId) => {
        if (!user) {
            message.warning("로그인이 필요한 서비스입니다.");
            router.push("/user/member/login");
            return;
        }
        router.push(`/user/meetup/detail?meetupId=${meetupId}`);
    };

    // 인기모임 좋아요
    const handlePopularMeetupLike = (meetupId) => {
        if (!user) {
            message.warning("로그인이 필요한 서비스입니다.");
            router.push("/user/member/login");
            return;
        }
        dispatch(meetupLikeRequest(meetupId));
    };

    return (
        <div className="main-page">
            {/* Hero */}
            <Hero />

            {/* Category */}
            <CategoryList
                categories={categories.filter((cate) => cate.parentId === null)}
                onCategoryClick={handleCategoryClick}
            />

            {/* 광고 */}
            <AdBanner position="MAIN" />

            {/* 인기 모임 */}
            <PopularMeetupList
                popularMeetups={popularMeetups}
                onMeetupClick={handlePopularMeetupClick}
                onToggleLike={handlePopularMeetupLike}
            />
        </div>
    );
}
