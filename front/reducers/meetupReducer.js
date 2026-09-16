import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    meetups: [], // 전체 모임
    meetup: null, // 단건 모임

    myApplications: [], // 내 신청 목록
    myMeetups: [], // 내 모임글 목록
    meetupApplicants: [], // 내 모임글 신청자 목록
    categories: [], // 카테고리 목록
    sigungus: [], // 시군구 목록
    popularMeetups: [], //인기모임
    recommendedMeetups: [], // 추천모임

    // 내 신청 목록 페이징
    myApplicationTotalCount: 0,
    myApplicationTotalPage: 0,

    // 마이페이지 통계
    myMeetupCount: {
        myMeetupCount: 0,
        applicationCount: 0,
        reviewCount: 0,
        favoriteCount: 0,
    },

    //관리자 통계
    meetupCount: {
        totalMeetupCount: 0,
        recruitingCount: 0,
        closedCount: 0,
        weatherCanceledCount: 0,
    },

    aiRecommendation: null, // ai 모임글 추천

    loading: false,
    error: null,

    totalCount: 0,
    totalPage: 0,

    todayMeetupCount: 0, // 하루 등록한 모임 수
    meetupDetailError: null, // 상세 조회 에러
    applyError: null, // 모임 신청 에러

    createSuccess: false,
    updateSuccess: false,
    deleteSuccess: false,

    applySuccess: false, // 모임신청 성공 여부
    likeSuccess: false, // 좋아요 성공 여부
    visibilitySuccess: false, // 공개/비공개 성공 여부
    statusSuccess: false, // 신청자 신청 상태 변경 성공 여부
    boostSuccess: false, // 모임 끌어올리기 성공 여부
};

const meetupReducer = createSlice({
    name: "meetup",
    initialState,
    reducers: {
        // --- 전체 모임 조회 ---
        fetchMeetupsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        fetchMeetupsSuccess: (state, action) => {
            state.loading = false;
            state.meetups = action.payload.meetups;
            state.totalCount = action.payload.totalCount;
            state.totalPage = action.payload.totalPage;
        },

        fetchMeetupsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 단건 모임 상세 조회 ---
        fetchMeetupDetailRequest: (state) => {
            state.loading = true;
            state.meetupDetailError = null;
        },

        fetchMeetupDetailSuccess: (state, action) => {
            state.loading = false;
            state.meetup = action.payload;
        },

        fetchMeetupDetailFailure: (state, action) => {
            state.loading = false;
            state.meetupDetailError = action.payload;
        },

        // --- 모임 등록 ---
        createMeetupRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.createSuccess = false;
        },

        createMeetupSuccess: (state) => {
            state.loading = false;
            //state.meetups.unshift(action.payload);
            state.createSuccess = true;
        },

        createMeetupFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.createSuccess = false;
        },

        // --- 모임 수정 ---
        updateMeetupRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.updateSuccess = false;
        },

        updateMeetupSuccess: (state, action) => {
            state.loading = false;
            // state.meetups = state.meetups.map((meetup) =>
            //     meetup.id === action.payload.id ? action.payload : meetup,
            // );
            // state.meetup = action.payload;
            state.updateSuccess = true;
        },
        updateMeetupFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.updateSuccess = false;
        },

        // --- 모임 삭제 ---
        deleteMeetupRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.deleteSuccess = false;
        },

        deleteMeetupSuccess: (state, action) => {
            state.loading = false;
            state.meetups = state.meetups.filter(
                (meetup) => meetup.id !== action.payload,
            );
            state.deleteSuccess = true;
        },

        deleteMeetupFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.deleteSuccess = false;
        },

        // --- 모임신청 ---
        applyMeetupRequest: (state) => {
            state.loading = true;
            state.applyError = null;
            state.applySuccess = false;
        },

        applyMeetupSuccess: (state, action) => {
            state.loading = false;
            state.applySuccess = true;

            const meetupId = action.payload.meetupId;

            // 상세 페이지
            if (state.meetup && state.meetup.id === meetupId) {
                state.meetup = {
                    ...state.meetup,
                    applyStatus:
                        state.meetup.applyStatus === "PENDING"
                            ? "CANCELED"
                            : "PENDING",
                };
            }

            // 목록에서도 상태를 사용한다면
            state.meetups = state.meetups.map((meetup) => {
                if (meetup.id === meetupId) {
                    return {
                        ...meetup,
                        applyStatus:
                            meetup.applyStatus === "PENDING"
                                ? "CANCELED"
                                : "PENDING",
                    };
                }

                return meetup;
            });
        },

        applyMeetupFailure: (state, action) => {
            state.loading = false;
            state.applyError = action.payload;
            state.applySuccess = false;
        },

        // --- 좋아요 ---
        meetupLikeRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.likeSuccess = false;
        },

        meetupLikeSuccess: (state, action) => {
            state.loading = false;
            state.likeSuccess = true;

            const meetupId = action.payload.meetupId;
            state.meetups = state.meetups.map((meetup) => {
                if (meetup.id === meetupId) {
                    const hasLike = !meetup.hasLike;
                    return {
                        ...meetup,
                        hasLike,
                        likeCount: hasLike
                            ? meetup.likeCount + 1
                            : meetup.likeCount - 1,
                    };
                }
                return meetup;
            });

            // 인기 모임
            state.popularMeetups = state.popularMeetups.map((meetup) => {
                if (meetup.id === meetupId) {
                    const hasLike = !meetup.hasLike;

                    return {
                        ...meetup,
                        hasLike,
                        likeCount: hasLike
                            ? meetup.likeCount + 1
                            : meetup.likeCount - 1,
                    };
                }

                return meetup;
            });
        },

        meetupLikeFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.likeSuccess = false;
        },

        // --- 모임 공개/비공개 전환 ---
        changeMeetupVisibilityRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.visibilitySuccess = false;
        },

        changeMeetupVisibilitySuccess: (state, action) => {
            state.loading = false;
            state.visibilitySuccess = true;

            const meetupId = action.payload;

            const meetup = state.meetups.find(
                (meetup) => meetup.id === meetupId,
            );

            // console.log("Reducer meetupId:", meetupId);
            // console.log("Reducer meetup:", meetup);

            if (meetup) {
                meetup.hidden = !meetup.hidden;
            }
        },

        changeMeetupVisibilityFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.visibilitySuccess = false;
        },

        // --- 마이페이지 내 신청 목록 조회 ---
        fetchMyApplicationsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        fetchMyApplicationsSuccess: (state, action) => {
            state.loading = false;
            state.myApplications = action.payload.applications;

            // 페이징 정보
            state.myApplicationTotalCount = action.payload.totalCount;
            state.myApplicationTotalPage = action.payload.totalPage;
        },

        fetchMyApplicationsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 마이페이지 모임글 신청자 목록 조회 ---
        fetchMeetupApplicantsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        fetchMeetupApplicantsSuccess: (state, action) => {
            state.loading = false;
            state.meetupApplicants = action.payload;
        },

        fetchMeetupApplicantsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 내 모임글 조회 ---
        fetchMyMeetupsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        fetchMyMeetupsSuccess: (state, action) => {
            state.loading = false;
            state.myMeetups = action.payload.meetups;
            state.totalCount = action.payload.totalCount;
            state.totalPage = action.payload.totalPage;
        },

        fetchMyMeetupsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 신청 상태 변경 ---
        updateApplicationStatusRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.statusSuccess = false;
        },

        updateApplicationStatusSuccess: (state) => {
            state.loading = false;
            state.statusSuccess = true;
        },

        updateApplicationStatusFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.statusSuccess = false;
        },

        // --- 카테고리 조회 ---
        fetchCategoriesRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        fetchCategoriesSuccess: (state, action) => {
            state.loading = false;
            state.categories = action.payload;
        },

        fetchCategoriesFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 시군구 조회 ---
        fetchSigungusRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        fetchSigungusSuccess: (state, action) => {
            state.loading = false;
            state.sigungus = action.payload;
        },

        fetchSigungusFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 마이페이지 통계 조회 ---
        fetchMyMeetupCountRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        fetchMyMeetupCountSuccess: (state, action) => {
            state.loading = false;
            state.myMeetupCount = action.payload;
        },

        fetchMyMeetupCountFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 관리자 통계 ---
        fetchMeetupCountRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        fetchMeetupCountSuccess: (state, action) => {
            state.loading = false;
            state.meetupCount = action.payload;
        },

        fetchMeetupCountFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- AI 모임 추천 ---
        recommendMeetupRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        recommendMeetupSuccess: (state, action) => {
            state.loading = false;
            state.aiRecommendation = action.payload;
        },

        recommendMeetupFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // 인기모임
        fetchPopularMeetupsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        fetchPopularMeetupsSuccess: (state, action) => {
            state.loading = false;
            state.popularMeetups = action.payload;
            state.error = null;
        },

        fetchPopularMeetupsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // 추천모임 조회
        fetchRecommendedMeetupsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        fetchRecommendedMeetupsSuccess: (state, action) => {
            state.loading = false;
            state.recommendedMeetups = action.payload;
        },

        fetchRecommendedMeetupsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 모임 끌어올리기 ---
        boostMeetupRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.boostSuccess = false;
        },

        boostMeetupSuccess: (state) => {
            state.loading = false;
            state.boostSuccess = true;
        },

        boostMeetupFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.boostSuccess = false;
        },

        fetchTodayMeetupCountRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        fetchTodayMeetupCountSuccess: (state, action) => {
            state.loading = false;
            state.todayMeetupCount = action.payload;
        },

        fetchTodayMeetupCountFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 상태조기화 ---
        resetMeetupState: (state) => {
            state.loading = false;
            state.error = null;

            state.meetup = null; // 이전 상세 모임 데이터 초기화
            state.meetupDetailError = null;

            state.createSuccess = null;
            state.updateSuccess = null;
            state.deleteSuccess = null;
            state.applySuccess = false;
            state.likeSuccess = false;
            state.visibilitySuccess = false;
            state.statusSuccess = false;
        },

        resetDeleteSuccess: (state) => {
            state.deleteSuccess = false;
        },

        resetBoostSuccess: (state) => {
            state.boostSuccess = false;
        },

        resetApplyState: (state) => {
            state.applySuccess = false;
            state.applyError = null;
        },
    },
});

export const {
    // 전체 모임
    fetchMeetupsRequest,
    fetchMeetupsSuccess,
    fetchMeetupsFailure,

    // 모임 상세
    fetchMeetupDetailRequest,
    fetchMeetupDetailSuccess,
    fetchMeetupDetailFailure,

    // 모임 등록
    createMeetupRequest,
    createMeetupSuccess,
    createMeetupFailure,

    // 모임 수정
    updateMeetupRequest,
    updateMeetupSuccess,
    updateMeetupFailure,

    // 모임 삭제
    deleteMeetupRequest,
    deleteMeetupSuccess,
    deleteMeetupFailure,

    // 모임 신청
    applyMeetupRequest,
    applyMeetupSuccess,
    applyMeetupFailure,

    // 좋아요
    meetupLikeRequest,
    meetupLikeSuccess,
    meetupLikeFailure,

    // 공개/비공개
    changeMeetupVisibilityRequest,
    changeMeetupVisibilitySuccess,
    changeMeetupVisibilityFailure,

    // 내 신청 목록
    fetchMyApplicationsRequest,
    fetchMyApplicationsSuccess,
    fetchMyApplicationsFailure,

    // 신청자 목록
    fetchMeetupApplicantsRequest,
    fetchMeetupApplicantsSuccess,
    fetchMeetupApplicantsFailure,

    // 내 모집글
    fetchMyMeetupsRequest,
    fetchMyMeetupsSuccess,
    fetchMyMeetupsFailure,

    // 신청 상태 변경
    updateApplicationStatusRequest,
    updateApplicationStatusSuccess,
    updateApplicationStatusFailure,

    // 카테고리
    fetchCategoriesRequest,
    fetchCategoriesSuccess,
    fetchCategoriesFailure,

    // 시군구
    fetchSigungusRequest,
    fetchSigungusSuccess,
    fetchSigungusFailure,

    // 마이페이지 통계 조회
    fetchMyMeetupCountRequest,
    fetchMyMeetupCountSuccess,
    fetchMyMeetupCountFailure,

    // 관리자 통계
    fetchMeetupCountRequest,
    fetchMeetupCountSuccess,
    fetchMeetupCountFailure,

    // AI 추천
    recommendMeetupRequest,
    recommendMeetupSuccess,
    recommendMeetupFailure,

    // 인기모임
    fetchPopularMeetupsRequest,
    fetchPopularMeetupsSuccess,
    fetchPopularMeetupsFailure,

    //추천모임
    fetchRecommendedMeetupsRequest,
    fetchRecommendedMeetupsSuccess,
    fetchRecommendedMeetupsFailure,

    // 모임 끌어올리기
    boostMeetupRequest,
    boostMeetupSuccess,
    boostMeetupFailure,

    // 오늘 등록한 모임 수
    fetchTodayMeetupCountRequest,
    fetchTodayMeetupCountSuccess,
    fetchTodayMeetupCountFailure,

    // 상태 초기화
    resetMeetupState,
    resetDeleteSuccess,
    resetBoostSuccess,
    resetApplyState,
} = meetupReducer.actions;

export default meetupReducer.reducer;
