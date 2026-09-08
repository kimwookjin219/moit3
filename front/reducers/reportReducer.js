// reducers/reportReducer.js

import { createSlice } from '@reduxjs/toolkit';
// import { resetUserState } from './authReducer';

const initialState= {
    reports: [],                // 전체신고글 목록
    currentReport: null,        // 단건 조회된 상세 신고글
    checkDoubleReport: null,    // 모임,리뷰 중복신고 더블체크

    auditLogs: [],               // 관리자 처리 로그
    aiReportDetail: null,        // AI 신고 상세 내용

    totalCount: 0,
    totalPage: 0,

    // =====================================================
    // 사용자 신고 작성
    // =====================================================
    create: {
        loading: false,
        error: null,
        success: false,
    },


    // =====================================================
    // 사용자 신고 수정
    // =====================================================
    update: {
        loading: false,
        error: null,
        success: false,
    },


    // =====================================================
    // 사용자 신고 삭제
    // =====================================================
    delete: {
        loading: false,
        error: null,
        success: false,
    },


    // =====================================================
    // 사용자 신고 목록 조회
    // =====================================================
    fetch: {
        loading: false,
        error: null,
    },


    // =====================================================
    // 사용자 신고 상세 조회
    // =====================================================
    fetchDetail: {
        loading: false,
        error: null,
    },


    // =====================================================
    // 중복 신고 확인
    // =====================================================
    doubleCheck: {
        loading: false,
        error: null,
    },


    // =====================================================
    // 관리자 신고 승인 / 반려
    // =====================================================
    adminUpdate: {
        loading: false,
        error: null,
        success: false,
    },


    // =====================================================
    // 관리자 신고 삭제
    // =====================================================
    adminDelete: {
        loading: false,
        error: null,
        success: false,
    },


    // =====================================================
    // 관리자 신고 목록 조회
    // =====================================================
    adminFetch: {
        loading: false,
        error: null,
    },


    // =====================================================
    // 관리자 신고 상세 조회
    // =====================================================
    adminFetchDetail: {
        loading: false,
        error: null,
    },


    // =====================================================
    // 관리자 감사로그 조회
    // =====================================================
    auditLogFetch: {
        loading: false,
        error: null,
    },


    // =====================================================
    // AI 신고 상세내용 생성
    // =====================================================
    aiCreate: {
        loading: false,
        error: null,
        success: false,
    },

    // 관리자 처리 보조 기능 ai 분석
    aiAnalysis: {},     // AI가 분석해서 보내준 최종 결과
    aiAnalysisLoading: false,
    aiAnalysisError: null,
};

const reportReducer = createSlice({
    name: "report",
    initialState,
    reducers: {

        // 초기화 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        resetReportState: (state) => {
            state.create.success = false;
            state.create.error = null;

            state.update.success = false;
            state.update.error = null;

            state.delete.success = false;
            state.delete.error = null;

            state.adminUpdate.success = false;
            state.adminUpdate.error = null;

            state.adminDelete.success = false;
            state.adminDelete.error = null;

            state.aiCreate.success = false;
            state.aiCreate.error = null;

            // 이전 AI 작성 내용 삭제
            state.aiReportDetail = null;
        },

        // 관리자 처리 이력 AI 분석결과만 초기화 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        resetAiAnalysisState: (state) => {
            state.aiAnalysis = null;
            state.aiAnalysisLoading = false;
            state.aiAnalysisError = null;
        },

        // --- 신고글 작성 ---
        createReportRequest: (state) => {
            state.create.loading = true;
            state.create.error = null;
            state.create.success = false;
        },
        createReportSuccess: (state, action) => {
            state.create.loading = false;
            state.create.success = true;
            state.reports.unshift(action.payload);  // 작성된 신고 목록 맨 앞에 추가
        },
        createReportFailure: (state, action) => {
            state.create.loading = false;
            state.create.success = false;
            state.create.error = action.payload;
        },
        
        // --- 신고글 수정 ---
        updateReportRequest: (state) => {
            state.update.loading = true;
            state.update.error = null;
            state.update.success = false;
        },
        updateReportSuccess: (state, action) => {
            state.update.loading = false;
            state.update.success = true;
            // 상세 조회 중인 신고글을 수정된 데이터로 변경
            state.currentReport = action.payload;
            // 신고 목록에서도 해당 신고글을 수정된 데이터로 변경
            state.reports = state.reports.map((report) =>
                report.reportId === action.payload.reportId
                    ? action.payload
                    : report
            );
        },
        updateReportFailure: (state, action) => {
            state.update.loading = false;
            state.update.success = false;
            state.update.error = action.payload;
        },
        
        // --- 신고글 삭제 ---
        deleteReportRequest: (state) => {
            state.delete.loading = true;
            state.delete.error = null;
            state.delete.success = false;
        },
        deleteReportSuccess: (state, action) => {
            state.delete.loading = false;
            state.delete.success = true;
            // 삭제 신고글의 reportId 받아서 목록에서 제거
            state.reports = state.reports.filter(
                (report) => report.reportId !== action.payload
            );
        },
        deleteReportFailure: (state, action) => {
            state.delete.loading = false;
            state.delete.success = false;
            state.delete.error = action.payload;
        },

        // --- 내 신고내역 조회 (사용자 신고 목록 조회 + 페이징) ---
        fetchReportsRequest: (state) => {
            state.fetch.loading = true;
            state.fetch.error = null;
        },
        fetchReportsSuccess: (state, action) => {
            state.fetch.loading = false;
            state.reports = action.payload.reports;
            state.totalCount = action.payload.totalCount;
            state.totalPage = action.payload.totalPage;
        },
        fetchReportsFailure: (state, action) => {
            state.fetch.loading = false;
            state.fetch.error = action.payload;
        },
        
        // --- 사용자 신고 상세 조회 ---
        fetchReportsDetailRequest: (state) => {
            state.fetchDetail.loading = true;
            state.fetchDetail.error = null;
        },
        fetchReportsDetailSuccess: (state, action) => {
            state.fetchDetail.loading = false;
            state.currentReport = action.payload;
        },
        fetchReportsDetailFailure: (state, action) => {
            state.fetchDetail.loading = false;
            state.fetchDetail.error = action.payload;
        },
        
        // --- 모임, 리뷰 신고 더블 체크 (화면용 중복 체크) ---
        checkDoubleReportRequest: (state) => {
            state.doubleCheck.loading = true;
            state.doubleCheck.error = null;
            // 이전 중복체크 결과 초기화
            state.checkDoubleReport = null;
        },
        checkDoubleReportSuccess: (state, action) => {
            state.doubleCheck.loading = false;
            state.checkDoubleReport = action.payload;
        },
        checkDoubleReportFailure: (state, action) => {
            state.doubleCheck.loading = false;
            state.doubleCheck.error = action.payload;
        },
        
        ///////////////////////////////////////////////////////////////////
        // --- 관리자 처리 상태 (승인/반려/신뢰도점수/감사로그) 변경 ---
        updateAdminReportRequest: (state) => {
            state.adminUpdate.loading = true;
            state.adminUpdate.success = false;
            state.adminUpdate.error = null;
        },
        updateAdminReportSuccess: (state, action) => {
            state.adminUpdate.loading = false;
            state.adminUpdate.success = true;
            state.currentReport = action.payload;

            state.reports = state.reports.map((report) =>
                report.reportId === action.payload.reportId
                    ? { ...report, ...action.payload, }
                    : report
            );
        },
        updateAdminReportFailure: (state, action) => {
            state.adminUpdate.loading = false;
            state.adminUpdate.success = false;
            state.adminUpdate.error = action.payload;
        },
        
        // --- 관리자 신고 삭제 (물리삭제 -> 논리삭제 변경 + 감사 로그 processReason 포함) ---
        deleteAdminReportRequest: (state) => {
            state.adminDelete.loading = true;
            state.adminDelete.error = null;
            state.adminDelete.success = false;
        },
        deleteAdminReportSuccess: (state, action) => {
            state.adminDelete.loading = false;
            state.adminDelete.success = true;
            state.reports = state.reports.filter(
                (report) => report.reportId !== action.payload
            );
        },
        deleteAdminReportFailure: (state, action) => {
            state.adminDelete.loading = false;
            state.adminDelete.success = false;
            state.adminDelete.error = action.payload;
        },

        // --- 관리자 신고 목록 조회 + 검색 + 페이징 ---
        fetchAdminReportsRequest: (state) => {
            state.adminFetch.loading = true;
            state.adminFetch.error = null;
        },
        fetchAdminReportsSuccess: (state, action) => {
            state.adminFetch.loading = false;
            state.reports = action.payload.reports;
            state.totalCount = action.payload.totalCount;
            state.totalPage = action.payload.totalPage;
        },
        fetchAdminReportsFailure: (state, action) => {
            state.adminFetch.loading = false;
            state.adminFetch.error = action.payload;
        },
        
        // --- 관리자 신고 상세 조회 ---
        fetchAdminReportsDetailRequest: (state) => {
            state.adminFetchDetail.loading = true;
            state.adminFetchDetail.error = null;
        },
        fetchAdminReportsDetailSuccess: (state, action) => {
            state.adminFetchDetail.loading = false;
            state.currentReport = action.payload;
        },
        fetchAdminReportsDetailFailure: (state, action) => {
            state.adminFetchDetail.loading = false;
            state.adminFetchDetail.error = action.payload;
        },
        
        ///////////////////////////////////////////////////////
        // --- 관리자 처리 감사로그 조회 ---
        fetchAdminReportAuditLogsRequest: (state) => {
            state.auditLogFetch.loading = true;
            state.auditLogFetch.error = null;
        },
        fetchAdminReportAuditLogsSuccess: (state, action) => {
            state.auditLogFetch.loading = false;
            state.auditLogs = action.payload;
        },
        fetchAdminReportAuditLogsFailure: (state, action) => {
            state.auditLogFetch.loading = false;
            state.auditLogFetch.error = action.payload;
        },

        // openAi 기능
        createAIReportDetailRequest: (state) => {
            state.aiCreate.loading = true;
            state.aiCreate.error = null;
            state.aiCreate.success = false;
        },
        createAIReportDetailSuccess: (state, action) => {
            state.aiCreate.loading = false;
            state.aiCreate.success = true;
            state.aiReportDetail = action.payload;
        },
        createAIReportDetailFailure: (state, action) => {
            state.aiCreate.loading = false;
            state.aiCreate.success = false;
            state.aiCreate.error = action.payload;
        },

        // 관리자 처리 보조 기능 openAi 분석
        aiReportAnalysisRequest: (state) => {
            state.aiAnalysisLoading = true;
            state.aiAnalysisError = null;
        },
        aiReportAnalysisSuccess: (state, action) => {
            const { reportId, result } = action.payload;

            state.aiAnalysisLoading = false;
            state.aiAnalysis[reportId] = result;
            state.aiAnalysisError = null;
        },
        aiReportAnalysisFailure: (state, action) => {
            state.aiAnalysisLoading = false;
            state.aiAnalysisError = action.payload;
        },
    }

});

export const {
    createReportRequest, createReportSuccess, createReportFailure,
    updateReportRequest, updateReportSuccess, updateReportFailure,
    deleteReportRequest, deleteReportSuccess, deleteReportFailure,
    fetchReportsRequest, fetchReportsSuccess, fetchReportsFailure,
    fetchReportsDetailRequest, fetchReportsDetailSuccess, fetchReportsDetailFailure,
    checkDoubleReportRequest, checkDoubleReportSuccess, checkDoubleReportFailure,
    resetReportState,
    updateAdminReportRequest, updateAdminReportSuccess, updateAdminReportFailure,
    deleteAdminReportRequest, deleteAdminReportSuccess, deleteAdminReportFailure,
    fetchAdminReportsRequest, fetchAdminReportsSuccess, fetchAdminReportsFailure,
    fetchAdminReportsDetailRequest, fetchAdminReportsDetailSuccess, fetchAdminReportsDetailFailure,
    
    fetchAdminReportAuditLogsRequest, fetchAdminReportAuditLogsSuccess, fetchAdminReportAuditLogsFailure,
    
    createAIReportDetailRequest, createAIReportDetailSuccess, createAIReportDetailFailure,
    aiReportAnalysisRequest, aiReportAnalysisSuccess, aiReportAnalysisFailure,
    resetAiAnalysisState
} = reportReducer.actions;

export default reportReducer.reducer;
