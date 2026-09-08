import { createSlice } from "@reduxjs/toolkit";

// 초기화 상태
const initialState = {
    // 백엔드 응답 데이터
    reviews: [],
    reviewDetail: null,
    totalCount: 0,
    totalPage: 0,
    analysisResult: "",
    // --댓글 관련 상태--
    commentLoading: false, 
    comments: [],      // 댓글 목록
    commentsMap:{},
    commentLoadingMap: {},
    commentError: null,

    loading: false,
    error: null,
    success: false,
};

// 상태변화
const reviewReducer = createSlice({
    name: "review",
    initialState,
    reducers: {
        // --상태 초기화--
        resetReviewState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
        },

        // --리뷰 작성--
        createReviewRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        createReviewSuccess: (state) => {
            state.loading = false;
            state.success = true;
        },
        createReviewFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        },

        // --리뷰 상세 조회--
        getReviewDetailRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.reviewDetail = null;
        },
        getReviewDetailSuccess: (state, action) => {
            state.loading = false;
            state.reviewDetail = action.payload;
        },
        getReviewDetailFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --리뷰 수정--
        updateReviewRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        updateReviewSuccess: (state) => {
            state.loading = false;
            state.success = true;
        },
        updateReviewFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        },

        // 리뷰 삭제(사용자, 관리자)
        deleteReviewRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        deleteReviewSuccess: (state, action) => {
            state.loading = false;
            state.success = true;
            const deletedId = action.payload;

            // 서버 재요청 없이 현재 목록에서 바로 제거하여 화면 갱신
            state.reviews = state.reviews.filter(review => review.id !== deletedId);
            state.totalCount = Math.max(0, state.totalCount - 1);
        },

        deleteReviewFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        },

        // --리뷰 목록 조회 (방어 코드 강화)--
        getReviewListRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        // 🌟 [추가] 관리자 전용 리뷰 목록 조회 요청 액션
        getAdminReviewListRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        getReviewListSuccess: (state, action) => {
            state.loading = false;
            const payload = action.payload || {};

            // 1) 안전하게 reviews 배열 추출
            const rawReviews = payload.reviews || payload.content || (Array.isArray(payload) ? payload : []);

            // 2) ★ [핵심] 각 리뷰 객체에 isPublic 값이 없거나 누락되었다면 기본값("Y")을 주거나 데이터 유실 방어
            state.reviews = rawReviews.map(review => ({
                ...review,
                isPublic: review.isPublic !== undefined && review.isPublic !== null ? review.isPublic : "Y"
            }));

            state.totalCount = payload.totalCount !== undefined ? payload.totalCount : (payload.totalElements || 0);
            state.totalPage = payload.totalPage !== undefined ? payload.totalPage : (payload.totalPages || 0);
        },
        getReviewListFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

       // --리뷰 좋아요 토글--
      toggleReviewLikeRequest: (state) => {
            state.error = null;
        },
        toggleReviewLikeSuccess: (state, action) => {
            // 서버에서 보낸 최신 ReviewResponseDto 데이터
            const updatedReview = action.payload || {}; 
            const targetId = updatedReview.id || updatedReview.reviewId;

            if (!targetId) return;

            // 서버에서 넘어온 liked 또는 isLiked 값을 정확하게 판별 (undefined 방어)
            const newLikedState = 
                updatedReview.liked !== undefined ? updatedReview.liked : 
                (updatedReview.isLiked !== undefined ? updatedReview.isLiked : false);

            const newLikesCount = 
                updatedReview.likesCount !== undefined ? updatedReview.likesCount : 
                (updatedReview.likes !== undefined ? updatedReview.likes : 0);

            // 1) 목록(reviews) 데이터 업데이트
            const review = state.reviews.find(r => r.id === targetId || r.reviewId === targetId);
            if (review) {
                review.likesCount = newLikesCount;
                review.liked = newLikedState;
                review.isLiked = newLikedState;
            }

            // 2) 상세화면(reviewDetail) 데이터 업데이트
            if (state.reviewDetail && (state.reviewDetail.id === targetId || state.reviewDetail.reviewId === targetId)) {
                state.reviewDetail.likesCount = newLikesCount;
                state.reviewDetail.liked = newLikedState;
                state.reviewDetail.isLiked = newLikedState;
            }
        },
        toggleReviewLikeFailure: (state, action) => {
            state.error = action.payload;
        },

        // --AI 리뷰 분석--
        analyzeReviewsRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.analysisResult = "";
        },
        analyzeReviewsSuccess: (state, action) => {
            state.loading = false;
            state.analysisResult = action.payload;
        },
        analyzeReviewsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --관리자 리뷰 공개 여부 변경--
        changeVisibilitySuccess: (state, action) => {
            const targetId = action.payload;

            const review = state.reviews.find(r => r.id === targetId || r.reviewId === targetId);
            if (review) {
                review.isPublic = review.isPublic === "Y" ? "N" : "Y";
            }

            if (state.reviewDetail && (state.reviewDetail.id === targetId || state.reviewDetail.reviewId === targetId)) {
                state.reviewDetail.isPublic = state.reviewDetail.isPublic === "Y" ? "N" : "Y";
            }
        },

        // 댓글 목록 조회 요청
        getCommentsRequest: (state, action) => {
            const reviewId = action.payload?.reviewId || action.payload; // 객체든 숫자/문자든 방어
            if (!state.commentLoadingMap) state.commentLoadingMap = {};
            if (reviewId !== undefined && reviewId !== null) {
                state.commentLoadingMap[reviewId] = true;
            }
            state.commentLoading = true;
            state.commentError = null;
        },
        getCommentsSuccess: (state, action) => {          
            const payload = action.payload || {};
            const reviewId = payload.reviewId;
            const comments = payload.comments;

            if (!state.commentsMap) state.commentsMap = {};
            if (!state.commentLoadingMap) state.commentLoadingMap = {};

            if (reviewId !== undefined && reviewId !== null) {
                state.commentLoadingMap[reviewId] = false; // 해당 리뷰 로딩 종료
                state.commentsMap[reviewId] = comments || [];
            }
            state.commentLoading = false;
        },
        getCommentsFailure: (state, action) => {          
            state.commentLoading = false;
            state.commentError = action.payload;
            
            if (state.commentLoadingMap) {
                Object.keys(state.commentLoadingMap).forEach((key) => {
                    state.commentLoadingMap[key] = false;
                });
            }
        },

        // 댓글 작성
        createCommentRequest: (state) => {
            state.commentLoading = true;
            state.commentError = null;
        },
        createCommentSuccess: (state) => {
            state.commentLoading = false;
        },
        createCommentFailure: (state, action) => {
            state.commentLoading = false;
            state.commentError = action.payload;
        },

        // 댓글 수정
        updateCommentRequest: (state) => {
            state.commentLoading = true;
            state.commentError = null;
        },
        updateCommentSuccess: (state) => {
            state.commentLoading = false;
        },
        updateCommentFailure: (state, action) => {
            state.commentLoading = false;
            state.commentError = action.payload;
        },

        // --댓글 삭제--
        deleteCommentRequest: (state) => {
            state.commentLoading = true;
            state.commentError = null;
        },
        deleteCommentSuccess: (state) => {
            state.commentLoading = false;
        },
        deleteCommentFailure: (state, action) => {
            state.commentLoading = false;
            state.commentError = action.payload;
        },
    },
});

// Action 내보내기
export const {
    resetReviewState,
    createReviewRequest,
    createReviewSuccess,
    createReviewFailure,
    getReviewDetailRequest,
    getReviewDetailSuccess,
    getReviewDetailFailure,
    updateReviewRequest,
    updateReviewSuccess,
    updateReviewFailure,
    deleteReviewRequest,
    deleteReviewSuccess,
    deleteReviewFailure,
    getReviewListRequest,
    getAdminReviewListRequest, 
    getReviewListSuccess,
    getReviewListFailure,
    toggleReviewLikeRequest,
    toggleReviewLikeSuccess,
    toggleReviewLikeFailure,
    analyzeReviewsRequest,
    analyzeReviewsSuccess,
    analyzeReviewsFailure,
    changeVisibilitySuccess,
    getCommentsRequest,
    getCommentsSuccess,
    getCommentsFailure,
    createCommentRequest,
    createCommentSuccess,
    createCommentFailure,
    updateCommentRequest,
    updateCommentSuccess,
    updateCommentFailure,
    deleteCommentRequest,
    deleteCommentSuccess,
    deleteCommentFailure,
} = reviewReducer.actions;

// Export Default
export default reviewReducer.reducer;