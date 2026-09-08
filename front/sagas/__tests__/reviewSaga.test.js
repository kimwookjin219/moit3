import { call, put } from 'redux-saga/effects';
import {
    createReviewRequest, createReviewSuccess, createReviewFailure,
    getReviewDetailRequest, getReviewDetailSuccess, getReviewDetailFailure,
    updateReviewRequest, updateReviewSuccess, updateReviewFailure,
    deleteReviewRequest, deleteReviewSuccess, deleteReviewFailure,
    getReviewListRequest, getReviewListSuccess, getReviewListFailure,
    toggleReviewLikeRequest, toggleReviewLikeSuccess, toggleReviewLikeFailure,
    analyzeReviewsRequest, analyzeReviewsSuccess, analyzeReviewsFailure
} from '../../reducers/reviewReducer';

import {
    createReview,
    fetchReviewDetail,
    updateReview,
    deleteReview,
    fetchReviewsByMeetup,
    fetchMyReviews,
    toggleReviewLike,
    analyzeReviews,
    fetchAdminReviewList,
    adminDeleteReview,
    createReviewApi,
    fetchReviewDetailApi,
    updateReviewApi,
    deleteReviewApi,
    fetchReviewsByMeetupApi,
    fetchMyReviewsApi,
    toggleReviewLikeApi,
    analyzeReviewsApi,
    fetchAdminReviewListApi,
    adminDeleteReviewApi
} from '../reviewSaga';


describe('reviewSaga 테스트',()=>{
    afterEach(()=>{
        jest.clearAllMocks();
    });

    //리뷰 작성
    describe('createReveiw',()=>{
        it('리뷰 작성 성공',()=>{
            const payload={meetupId:1,content:'좋은 모임입니다',rating:5};
            const generator=createReview(createReviewRequest(payload));

            expect(generator.next().value).toEqual(call(createReviewApi,payload));

            expect(generator.next().value).toEqual(put(createReviewSuccess()));

            expect(generator.next().done).toBe(true);
        });
        it('작성 실패',()=>{
            const payload={meetupId:1,content:''};
            const generator=createReview(createReviewRequest(payload));

            generator.next();

            const error=new Error('작업 실패');
            expect(generator.throw(error).value).toEqual(put(createReviewFailure('작업 실패')));
            expect(generator.next().done).toBe(true);
        });
    });

    //리뷰 상세 조회
    describe('fetchReviewDetail',()=>{
        it('리뷰 상세 조회 성공',()=>{
            const reviewId=10;
            const generator=fetchReviewDetail(getReviewDetailRequest(reviewId));

            expect(generator.next().value).toEqual(call(fetchReviewDetailApi,reviewId));
            const mockData = { id: 10, content: '상세 리뷰 내용', rating: 5 };
            const putStep = generator.next({ data: mockData }).value;

            expect(putStep).toEqual(put(getReviewDetailSuccess(mockData)));
            expect(generator.next().done).toBe(true);
        });
    });

    //리뷰 수정
    describe('updateReview',()=>{
        it('리뷰 수정 성공',()=>{
            const payload={reveiwId:10,requestDto:{content:'수정된리뷰'}};
            const generator = updateReview(updateReviewRequest(payload));

            expect(generator.next().value).toEqual(call(updateReviewApi, payload));
            expect(generator.next().value).toEqual(put(updateReviewSuccess(payload)));
            expect(generator.next().done).toBe(true);
        });
    });

    //리뷰 삭제
    describe('deleteReview', () => {
        it('리뷰 삭제 성공', () => {
            const reviewId = 5;
            const generator = deleteReview(deleteReviewRequest(reviewId));

            expect(generator.next().value).toEqual(call(deleteReviewApi, reviewId));
            expect(generator.next().value).toEqual(put(deleteReviewSuccess(reviewId)));
            expect(generator.next().done).toBe(true);
        });
    });

    // --- 5. 특정 모임 리뷰 목록 조회 ---
    describe('fetchReviewsByMeetup', () => {
        it('모임 리뷰 목록 조회 성공', () => {
            const payload = { meetupId: 1, page: 0, size: 10 };
            const generator = fetchReviewsByMeetup(getReviewListRequest(payload));

            expect(generator.next().value).toEqual(call(fetchReviewsByMeetupApi, payload));

            const mockResponse = { reviews: [{ id: 1, content: '리뷰 1' }], totalCount: 1 };
            const putStep = generator.next({ data: mockResponse }).value;

            expect(putStep).toEqual(put(getReviewListSuccess(mockResponse)));
            expect(generator.next().done).toBe(true);
        });
    });

    // --- 6. 내가 작성한 리뷰 목록 조회 ---
    describe('fetchMyReviews', () => {
        it('내 리뷰 목록 조회 성공', () => {
            const payload = { page: 0, size: 10 };
            const generator = fetchMyReviews({ payload });

            expect(generator.next().value).toEqual(call(fetchMyReviewsApi, payload));

            const mockResponse = { reviews: [{ id: 2, content: '내가 쓴 리뷰' }] };
            expect(generator.next({ data: mockResponse }).value).toEqual(put(getReviewListSuccess(mockResponse)));
            expect(generator.next().done).toBe(true);
        });
    });

    // --- 7. 리뷰 좋아요 토글 ---
    describe('toggleReviewLike', () => {
        it('좋아요 토글 성공', () => {
            const reviewId = 12;
            const generator = toggleReviewLike(toggleReviewLikeRequest(reviewId));

            expect(generator.next().value).toEqual(call(toggleReviewLikeApi, reviewId));
            expect(generator.next().value).toEqual(put(toggleReviewLikeSuccess(reviewId)));
            expect(generator.next().done).toBe(true);
        });
    });

    // --- 8. AI 리뷰 분석 ---
    describe('analyzeReviews', () => {
        it('AI 분석 성공', () => {
            const meetupId = 1;
            const generator = analyzeReviews(analyzeReviewsRequest(meetupId));

            expect(generator.next().value).toEqual(call(analyzeReviewsApi, meetupId));

            const mockAnalysis = '전반적으로 매우 긍정적인 평가를 받고 있습니다.';
            expect(generator.next({ data: mockAnalysis }).value).toEqual(put(analyzeReviewsSuccess(mockAnalysis)));
            expect(generator.next().done).toBe(true);
        });
    });

    // --- 9. [관리자] 전체 리뷰 목록 조회 ---
    describe('fetchAdminReviewList', () => {
        it('관리자 리뷰 목록 조회 성공', () => {
            const payload = { keyword: '', page: 0, size: 10 };
            const generator = fetchAdminReviewList({ payload });

            expect(generator.next().value).toEqual(call(fetchAdminReviewListApi, payload));

            const mockData = { reviews: [{ id: 100, content: '신고 검토 리뷰' }] };
            expect(generator.next({ data: mockData }).value).toEqual(put(getReviewListSuccess(mockData)));
            expect(generator.next().done).toBe(true);
        });
    });

    // --- 10. [관리자] 리뷰 강제 삭제 ---
    describe('adminDeleteReview', () => {
        it('관리자 리뷰 삭제 성공', () => {
            const reviewId = 99;
            const generator = adminDeleteReview({ payload: reviewId });

            expect(generator.next().value).toEqual(call(adminDeleteReviewApi, reviewId));
            expect(generator.next().value).toEqual(put(deleteReviewSuccess(reviewId)));
            expect(generator.next().done).toBe(true);
        });
    });
});