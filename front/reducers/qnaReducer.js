import { createSlice } from "@reduxjs/toolkit";

//1. 초기화 상태 (공용)
const initialState = { 
    qnaList: [],             // QnA 목록 
    qna: null,               // QnA 상세 
    meetupQnaList: [],       // 특정 모임 QnA 목록 
 
    adminQnaList: [],        // 관리자 QnA 목록 
    adminQnaTotal: 0,        // 관리자 QnA 전체 개수 
    adminQnaPage: 1,         // 관리자 QnA 현재 페이지 
    adminQnaSize: 10,        // 관리자 QnA 페이지 크기 
    adminQnaTotalPage: 0,    // 관리자 QnA 전체 페이지 수
    adminQnaStartPage: 1,    // 관리자 QnA 페이지 시작
    adminQnaEndPage: 1,      // 관리자 QnA 페이지 끝

    adminQnaAllCnt: 0,       // 전체 문의 수
    adminQnaPendingCnt: 0,   // 답변 대기 문의 수
    adminQnaAnsweredCnt: 0,  // 답변 완료 문의 수
    adminQnaTodayCnt: 0,     // 오늘 등록된 문의 수
 
    loading: false,          // 로딩상태 
    error: null,             // 에러메시지 
    success: false,          // 성공여부 

    deleteSuccess: false,        // 삭제성공여부
    answerDeleteSuccess: false,  // 답변 삭제 성공

    satisfactionSuccess: false,         // 만족도 등록 성공
    satisfactionDeleteSuccess: false,   // 만족도 삭제 성공

    adminDeleteSuccess: false,   // 관리자 선택 삭제 성공
    aiNormalSuccess: false,      // AI 정상 처리 성공
};

//2. 상태변화
const qnaReducer = createSlice({
    name: "qna",
    initialState,
    reducers: {
        // --- QnA 등록 ---
        qnaCreateRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        qnaCreateSuccess: (state, action) => {
            state.loading = false;
            state.success = true;
            state.qna = action.payload;
        },
        qnaCreateFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        },

        // --- QnA 목록 조회 ---
        qnaListRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        qnaListSuccess: (state, action) => {
            state.loading = false;
            state.qnaList = action.payload;
        },
        qnaListFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- QnA 특정 모임 조회 ---
        qnaMeetupListRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        qnaMeetupListSuccess: (state, action) => {
            state.loading = false;
            state.meetupQnaList = action.payload;
        },
        qnaMeetupListFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- QnA 상세 조회 ---
        qnaDetailRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        qnaDetailSuccess: (state, action) => {
            state.loading = false;
            state.qna = action.payload;
        },
        qnaDetailFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- QnA 수정 ---
        qnaUpdateRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        qnaUpdateSuccess: (state) => {
            state.loading = false;
            state.success = true;
        },
        qnaUpdateFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        },

        // --- QnA 삭제 ---
        qnaDeleteRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
            state.deleteSuccess = false;
        },
        qnaDeleteSuccess: (state) => {
            state.loading = false;
            state.success = true;
            state.deleteSuccess = true;
            state.qna = null;
        },
        qnaDeleteFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
            state.deleteSuccess = false;
        },

        // --- 관리자 QnA 조회 ---
        qnaAdminListRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        qnaAdminListSuccess: (state, action) => {
            state.loading = false; 
            state.adminQnaList = action.payload.list; 
            state.adminQnaTotal = action.payload.totalCnt; 
            state.adminQnaPage = action.payload.page; 
            state.adminQnaSize = action.payload.pageSize; 
            state.adminQnaTotalPage = action.payload.totalPage;
            state.adminQnaStartPage = action.payload.startPage;
            state.adminQnaEndPage = action.payload.endPage;
            state.adminQnaAllCnt = action.payload.allCnt;
            state.adminQnaPendingCnt = action.payload.pendingCnt;
            state.adminQnaAnsweredCnt = action.payload.answeredCnt;
            state.adminQnaTodayCnt = action.payload.todayCnt;
        },
        qnaAdminListFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- QnA 답변 등록 ---
        qnaAnswerCreateRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        qnaAnswerCreateSuccess: (state) => {
            state.loading = false;
            state.success = true;
            state.answerDeleteSuccess = false;
        },
        qnaAnswerCreateFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        },

        // --- QnA 답변 수정 ---
        qnaAnswerUpdateRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        qnaAnswerUpdateSuccess: (state) => {
            state.loading = false;
            state.success = true;
            state.answerDeleteSuccess = false;
        },
        qnaAnswerUpdateFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        },

        // --- QnA 답변 삭제 ---
        qnaAnswerDeleteRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
            state.answerDeleteSuccess = false;
        },
        qnaAnswerDeleteSuccess: (state) => {
            state.loading = false;
            state.success = true;
            state.answerDeleteSuccess = true;
        },
        qnaAnswerDeleteFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
            state.answerDeleteSuccess = false;
        },

        // --- 답변 만족도 평가 ---
        qnaSatisfactionRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
            state.satisfactionSuccess = false;
            state.satisfactionDeleteSuccess = false;
        },
        qnaSatisfactionSuccess: (state) => {
            state.loading = false;
            state.success = true;
            state.satisfactionSuccess = true;
        },
        qnaSatisfactionFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
            state.satisfactionSuccess = false;
        },

        // --- 답변 만족도 평가 삭제 ---
        qnaSatisfactionDeleteRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
            state.satisfactionDeleteSuccess = false;
        },
        qnaSatisfactionDeleteSuccess: (state) => {
            state.loading = false;
            state.success = true;
            state.satisfactionDeleteSuccess = true;
        },
        qnaSatisfactionDeleteFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
            state.satisfactionDeleteSuccess = false;
        },

        // --- 관리자 선택 삭제 ---
        qnaAdminDeleteSelectedRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
            state.adminDeleteSuccess = false;
        },
        qnaAdminDeleteSelectedSuccess: (state) => {
            state.loading = false;
            state.success = true;
            state.adminDeleteSuccess = true;
        },
        qnaAdminDeleteSelectedFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
            state.adminDeleteSuccess = false;
        },

        // --- AI 정상 처리 ---
        qnaAiNormalRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
            state.aiNormalSuccess = false;
        },
        qnaAiNormalSuccess: (state) => {
            state.loading = false;
            state.success = true;
            state.aiNormalSuccess = true;
        },
        qnaAiNormalFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
            state.aiNormalSuccess = false;
        },

        // --- 관리자 선택 삭제 성공 상태 초기화 ---
        qnaAdminDeleteSelectedReset: (state) => {
            state.adminDeleteSuccess = false;
        },

        // --- AI 정상 처리 성공 상태 초기화 ---
        qnaAiNormalReset: (state) => {
            state.aiNormalSuccess = false;
        },

        // --- 만족도 등록 성공 상태 초기화 ---
        qnaSatisfactionReset: (state) => {
            state.satisfactionSuccess = false;
        },

        // --- 만족도 삭제 성공 상태 초기화 ---
        qnaSatisfactionDeleteReset: (state) => {
            state.satisfactionDeleteSuccess = false;
        },

        // --- 상태 초기화 ---
        qnaReset: (state) => {
            state.qna = null;
            state.meetupQnaList = [];
            state.adminQnaList = [];
            state.error = null;
            state.success = false;
            state.deleteSuccess = false;
            state.answerDeleteSuccess = false;
            state.adminDeleteSuccess = false;
            state.aiNormalSuccess = false;
            state.satisfactionSuccess = false;
            state.satisfactionDeleteSuccess = false;
        },
    },
});

//3. action
export const {
    qnaCreateRequest, qnaCreateSuccess, qnaCreateFailure,
    qnaListRequest, qnaListSuccess, qnaListFailure,
    qnaMeetupListRequest, qnaMeetupListSuccess, qnaMeetupListFailure,
    qnaDetailRequest, qnaDetailSuccess, qnaDetailFailure,

    qnaUpdateRequest, qnaUpdateSuccess, qnaUpdateFailure,
    qnaDeleteRequest, qnaDeleteSuccess, qnaDeleteFailure,

    qnaAdminListRequest, qnaAdminListSuccess, qnaAdminListFailure,

    qnaAnswerCreateRequest, qnaAnswerCreateSuccess, qnaAnswerCreateFailure,
    qnaAnswerUpdateRequest, qnaAnswerUpdateSuccess, qnaAnswerUpdateFailure,
    qnaAnswerDeleteRequest, qnaAnswerDeleteSuccess, qnaAnswerDeleteFailure,

    qnaSatisfactionRequest, qnaSatisfactionSuccess, qnaSatisfactionFailure,
    qnaSatisfactionDeleteRequest, qnaSatisfactionDeleteSuccess, qnaSatisfactionDeleteFailure,

    qnaAdminDeleteSelectedRequest, qnaAdminDeleteSelectedSuccess, qnaAdminDeleteSelectedFailure,
    qnaAiNormalRequest, qnaAiNormalSuccess, qnaAiNormalFailure,

    qnaAdminDeleteSelectedReset,
    qnaAiNormalReset,
    qnaSatisfactionReset, qnaSatisfactionDeleteReset,

    qnaReset,
} = qnaReducer.actions;

//4. export
export default qnaReducer.reducer;