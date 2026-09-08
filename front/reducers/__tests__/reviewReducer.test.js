import reviewReducer, {
    resetReviewState,
    getReviewListSuccess,
    getReviewDetailSuccess,
    deleteReviewSuccess,
    toggleReviewLikeSuccess,
    changeVisibilitySuccess,
    analyzeReviewsSuccess,
    createReviewRequest,   
    createReviewFailure,  
} from '../reviewReducer';

describe('reviewReducer slice', () => {
    const initialState = {
        reviews: [],
        reviewDetail: null,
        totalCount: 0,
        totalPage: 0,
        analysisResult: "",
        loading: false,
        error: null,
        success: false
    };

    // 상태 초기화 테스트
    it('resetReviewState 실행 시 로딩,성공 상태가 초기화', () => {
        const prevState = { ...initialState, loading: true, error: '에러발생', success: true };
        const state = reviewReducer(prevState, resetReviewState());

        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);
    });

    it('getReveiwListSuccess 실행 시 리뷰 목록과 페이지 정보가 업데이트', () => {
        const mockPayload = {
            reviews: [{ id: 1, title: '리뷰 1' }, { id: 2, title: '리뷰 2' }],
            totalCount: 2,
            totalPage: 1,
        };

        const state = reviewReducer(initialState, getReviewListSuccess(mockPayload));

        expect(state.loading).toBe(false);
        expect(state.reviews).toHaveLength(2);
        expect(state.reviews).toEqual(mockPayload.reviews);
        expect(state.totalCount).toBe(2);
        expect(state.totalPage).toBe(1);
    });

    // 리뷰 삭제
    it('deleteReviewSuccess 실행 시 목록에서 해당 리뷰가 삭제되고 totalCount가 1 감소', () => {
        const prevState = {
            ...initialState,
            reviews: [
                { id: 1, title: '삭제할 리뷰' },
                { id: 2, title: '남아있는 리뷰' },
            ],
            totalCount: 2,
        };
        const state = reviewReducer(prevState, deleteReviewSuccess(1));

        expect(state.success).toBe(true);
        expect(state.reviews).toHaveLength(1);
        expect(state.reviews.find(r => r.id === 1)).toBeUndefined();
        expect(state.totalCount).toBe(1);
    });

    // 리뷰 상세 조회
    it('getReviewDetailSuccess 실행 시 상세 데이터가 업데이트되고 로딩이 완료됨', () => {
        const mockDetail = { id: 1, title: '상세 리뷰', content: '내용' };
        const state = reviewReducer(initialState, getReviewDetailSuccess(mockDetail));

        expect(state.loading).toBe(false);
        expect(state.reviewDetail).toEqual(mockDetail);
    });

    // 리뷰 좋아요 토글
    it('리뷰 좋아요 토글', () => {
        const prevState = {
            ...initialState,
            reviews: [{ id: 1, likesCount: 5, isLiked: false }], // likeCount -> likesCount 수정 완료
            reviewDetail: { id: 1, likesCount: 5, isLiked: false }
        };

        // 좋아요 추가
        const state1 = reviewReducer(prevState, toggleReviewLikeSuccess(1));
        expect(state1.reviews[0].isLiked).toBe(true);
        expect(state1.reviews[0].likesCount).toBe(6);
        expect(state1.reviewDetail.isLiked).toBe(true);
        expect(state1.reviewDetail.likesCount).toBe(6);

        // 좋아요 취소
        const state2 = reviewReducer(state1, toggleReviewLikeSuccess(1));
        expect(state2.reviews[0].isLiked).toBe(false);
        expect(state2.reviews[0].likesCount).toBe(5);
        expect(state2.reviewDetail.isLiked).toBe(false);
        expect(state2.reviewDetail.likesCount).toBe(5);
    });

    // 관리자 공개 여부 변경
    it('관리자 공개 여부 변경', () => {
        const prevState = {
            ...initialState,
            reviews: [{ id: 1, isPublic: 'Y' }],
            reviewDetail: { id: 1, isPublic: 'Y' }
        };

        // Y -> N
        const state1 = reviewReducer(prevState, changeVisibilitySuccess(1));
        expect(state1.reviews[0].isPublic).toBe('N');
        expect(state1.reviewDetail.isPublic).toBe('N');

        // N -> Y 변경
        const state2 = reviewReducer(state1, changeVisibilitySuccess(1));
        expect(state2.reviews[0].isPublic).toBe('Y');
        expect(state2.reviewDetail.isPublic).toBe('Y');
    });

    // AI 리뷰 분석
    it('실행 시 분석 결과가 저장되고 로딩 종료', () => {
        const mockResult = "긍정적인 리뷰가 80%입니다";
        const state = reviewReducer(initialState, analyzeReviewsSuccess(mockResult));

        expect(state.loading).toBe(false);
        expect(state.analysisResult).toBe(mockResult);
    });

    // 공통 Request / Failure 처리
    it('Request 액션 실행 시 loading은 true, error는 null로 초기화됨', () => {
        const prevState = { ...initialState, error: '이전 에러' };
        const state = reviewReducer(prevState, createReviewRequest());

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
    });

    it('Failure 액션 실행 시 loading은 false가 되고 error에 페이로드가 저장됨', () => {
        const errorMessage = '서버 에러가 발생했습니다.';
        const state = reviewReducer(initialState, createReviewFailure(errorMessage));

        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
    });
});