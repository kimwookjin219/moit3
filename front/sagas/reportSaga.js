// sagas/reportSaga.js

import { all, call, put, takeLatest } from 'redux-saga/effects';
import  {
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
} from '../reducers/reportReducer';
import api from '../api/axios';




// POST_API_BASE = http://localhost:8080/api/reports
const POST_API_BASE = '/api/reports';


// watchCreateReport          - POST      /api/reports        신고 작성
export const createReportAPI = (dto)=> {

    // @RequestBody ReportRequestDto requestDto     신고 내용을 요청 body에 넣어서 보내기
    // POST_API_BASE = http://localhost:8080/api/reports
    return api.post(POST_API_BASE, dto);
}
export function* createReport(action) {
    try {
        const result = yield call(createReportAPI, action.payload);   // action.payload 사용자가 넘겨준 값
        yield put(createReportSuccess(result.data));
        
    } catch(err) {
        console.log("신고 등록 오류 전체:", err);
        console.log("응답 데이터:", err.response?.data);
        console.log("응답 상태:", err.response?.status);

        yield put(createReportFailure(err.response?.data?.message || err.message));
    }
}

// watchUpdateReport          - PATCH      /api/reports/{reportId}      신고 수정
export const updateReportAPI = (payload)=> {
    const { reportId, dto } = payload;

    // @PathVariable("reportId") Long reportId       URL 경로에 신고 번호 보내기
    // @RequestBody ReportRequestDto requestDto      수정할 신고 내용을 body에 넣어서 보내기
    // POST_API_BASE = http://localhost:8080/api/reports/1
    return api.patch(`${POST_API_BASE}/${reportId}`, dto);
}
export function* updateReport(action) {
    try {
        const result = yield call(updateReportAPI, action.payload);
        yield put(updateReportSuccess(result.data));
        
    } catch(err) {
        yield put(updateReportFailure(err.response?.data?.message || err.message));
    }
}

// watchDeleteReport          - DELETE    /api/reports/{reportId}       신고 삭제
export const deleteReportAPI = (payload)=> {
    const { reportId } = payload;

    // @PathVariable("reportId") Long reportId
    // POST_API_BASE = http://localhost:8080/api/reports/1
    return api.delete(`${POST_API_BASE}/${reportId}`);
}
export function* deleteReport(action) {
    try {
        const result = yield call(deleteReportAPI, action.payload);
        yield put(deleteReportSuccess(result.data));
        
    } catch(err) {
        yield put(deleteReportFailure(err.response?.data?.message || err.message));
    }
}

// watchFetchReports          - GET       /api/reports        내 신고 목록 조회 + 페이징
export const fetchReportsAPI = (payload)=> {
    const { memberId, page=0, size=10 } = payload;

    // @RequestParam("memberId") Long memberId
    // Pageable pageable
    // POST_API_BASE = http://localhost:8080/api/reports?memberId=2&page=0&size=10
    return api.get(
        `${POST_API_BASE}?memberId=${memberId}&page=${page}&size=${size}`
    );
}
export function* fetchReports(action) {
    try {
        const result = yield call(fetchReportsAPI, action.payload);
        yield put(fetchReportsSuccess(result.data));
        
    } catch(err) {
        yield put(fetchReportsFailure(err.response?.data?.message || err.message));
    }
}

// watchFetchReportsDetail    - GET       /api/reports/{reportId}       사용자 신고 상세 조회
export const fetchReportsDetailAPI = (payload)=> {
    const { reportId } = payload;

    // @PathVariable("reportId") Long reportId
    // POST_API_BASE = http://localhost:8080/api/reports/1
    return api.get(`${POST_API_BASE}/${reportId}`);
}
export function* fetchReportsDetail(action) {
    try {
        const result = yield call(fetchReportsDetailAPI, action.payload);
        yield put(fetchReportsDetailSuccess(result.data));

    } catch(err) {
        yield put(fetchReportsDetailFailure(err.response?.data?.message || err.message));
    }
}

// watchCheckDoubleReport     - GET       /api/reports/checkDoubleReport      중복 신고 확인
export const checkDoubleReportAPI = (payload)=> {
    const { memberId, targetType, targetId } = payload;

    // @RequestParam("memberId") Long memberId
    // @RequestParam("targetType") TargetType targetType
    // @RequestParam("targetId") Long targetId
    // true  = 이미 신고 / false = 신고 가능
    // POST_API_BASE = http://localhost:8080/api/reports/checkDoubleReport?memberId=2&targetType=MEETUP&targetId=10
    return api.get(
        `${POST_API_BASE}/checkDoubleReport?memberId=${memberId}&targetType=${targetType}&targetId=${targetId}`
    );
}
export function* checkDoubleReport(action) {
    try {
        const result = yield call(checkDoubleReportAPI, action.payload);
        yield put(checkDoubleReportSuccess(result.data));

    } catch(err) {
        yield put(checkDoubleReportFailure(err.response?.data?.message || err.message));
    }
}

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// watchUpdateAdminReport     - PATCH     /api/reports/admin/{reportId}     관리자 승인/반려
export const updateAdminReportAPI = (payload)=> {
    const { reportId, processDto } = payload;

    console.log('관리자 처리 reportId:', reportId);
    console.log('관리자 처리 processDto:', processDto);

    console.log('관리자 처리 reportId:', reportId);
    console.log('관리자 처리 processDto:', JSON.stringify(processDto));

    // @PathVariable("reportId") Long reportId
    // @RequestBody ReportProcessDto processDto
    //
    // processDto 예:
    // {
    //     status: "APPROVED",
    //     processReason: "신고 내용 확인"
    // }
    //
    // POST_API_BASE = http://localhost:8080/api/reports/admin/1
    return api.patch(`${POST_API_BASE}/admin/${reportId}`, processDto);
}
export function* updateAdminReport(action) {
    try {
        const result = yield call(updateAdminReportAPI, action.payload);
        yield put(updateAdminReportSuccess(result.data));
        
    } catch(err) {
        yield put(updateAdminReportFailure(err.response?.data?.message || err.message));
    }
}

// watchDeleteAdminReport     - DELETE    /api/reports/admin/{reportId}      관리자 신고 삭제
export const deleteAdminReportAPI = (payload)=> {
    const { reportId, processReason } = payload;

    // @PathVariable("reportId") Long reportId
    // @RequestParam("processReason") String processReason
    // POST_API_BASE = http://localhost:8080/api/reports/admin/1?processReason=관리자삭제사유
    return api.delete(
        `${POST_API_BASE}/admin/${reportId}?processReason=${encodeURIComponent(processReason)}`
    );
}
export function* deleteAdminReport(action) {
    try {
        const result = yield call(deleteAdminReportAPI, action.payload);
        yield put(deleteAdminReportSuccess(result.data));
        
    } catch(err) {
        yield put(deleteAdminReportFailure(err.response?.data?.message || err.message));
    }
}

// watchFetchAdminReports     - GET       /api/reports/admin/adminReportsList
// 관리자 신고 목록 조회 + 검색 + 페이징
export const fetchAdminReportsAPI = (payload)=> {
    const {
        targetType,
        status,
        reasonCode,
        deleteYn,
        memberNickname,
        page = 0,
        size = 10
    } = payload;

    const params = {
        page,
        size
    };

    // 값이 있을 때만 요청 파라미터에 추가
    if (targetType) {
        params.targetType = targetType;
    }

    if (status) {
        params.status = status;
    }

    if (reasonCode) {
        params.reasonCode = reasonCode;
    }

    if (deleteYn) {
        params.deleteYn = deleteYn;
    }
    
    if (memberNickname) {
        params.memberNickname = memberNickname;
    }

    // @ModelAttribute ReportSearchDto searchDto
    // targetType  : MEETUP / REVIEW
    // status : PENDING / APPROVED / REJECTED
    // reasonCode : 
    // deleteYn : N / Y
    // memberNickname : 검색어 (닉네임)
    // Pageable pageable
    //
    // POST_API_BASE = http://localhost:8080/api/reports/admin/adminReportsList
    //                 ?filter=ALL&search=MEMBER_NICKNAME&keyword=test&page=0&size=10
    return api.get(
        `${POST_API_BASE}/admin/adminReportsList`,
        {
            params
        }
    );
}
export function* fetchAdminReports(action) {
    try {
        const result = yield call(fetchAdminReportsAPI, action.payload);
        yield put(fetchAdminReportsSuccess(result.data));
        
    } catch(err) {
        yield put(fetchAdminReportsFailure(err.response?.data?.message || err.message));
    }
}

// watchFetchAdminReportsDetail     - GET      /api/reports/admin/{reportId}
// 관리자 신고 상세 조회
export const fetchAdminReportsDetailAPI = (payload)=> {
    const { reportId } = payload;

    // @PathVariable("reportId") Long reportId
    // POST_API_BASE = http://localhost:8080/api/reports/admin/1
    return api.get(`${POST_API_BASE}/admin/${reportId}`);
}
export function* fetchAdminReportsDetail(action) {
    try {
        const result = yield call(fetchAdminReportsDetailAPI, action.payload);
        yield put(fetchAdminReportsDetailSuccess(result.data));

    } catch(err) {
        yield put(fetchAdminReportsDetailFailure(err.response?.data?.message || err.message));
    }
}

// watchFetchAdminReportAuditLogs   - GET       /api/reports/admin/{reportId}/auditLogs
// 관리자 신고 처리 로그 조회
export const fetchAdminReportAuditLogsAPI = (payload)=> {
    const { reportId } = payload;

    // @PathVariable("reportId") Long reportId
    // POST_API_BASE = http://localhost:8080/api/reports/admin/1/auditLogs
    return api.get(`${POST_API_BASE}/admin/${reportId}/auditLogs`);
}
export function* fetchAdminReportAuditLogs(action) {
    try {
        const result = yield call(fetchAdminReportAuditLogsAPI, action.payload);
        yield put(fetchAdminReportAuditLogsSuccess(result.data));

    } catch(err) {
        yield put(fetchAdminReportAuditLogsFailure(err.response?.data?.message || err.message));
    }
}

// openAi 신고 내용 작성
export const createAIReportDetailAPI = (dto) => {
    // @RequestBody AiReportsDto { keywords, reasonCode, targetType }
    return api.post(
        `${POST_API_BASE}/openai`, dto
    );
};
export function* createAIReportDetail(action) {
    try {
        const result = yield call(createAIReportDetailAPI, action.payload);
        yield put( createAIReportDetailSuccess(result.data));

    } catch (err) {
        yield put(createAIReportDetailFailure( err.response?.data?.message || err.message ));
    }
}

// 관리자 처리 보조 기능 openAi 분석
export const aiReportAnalysisAPI = (payload) => {
    const { reportId } = payload;
    
    // @PathVariable("reportId") Long reportId
    return api.post( `${POST_API_BASE}/admin/${reportId}/ai-analysis` );
};
export function* aiReportAnalysis(action) {
    try {
        const result = yield call(aiReportAnalysisAPI, action.payload);
        yield put(
            aiReportAnalysisSuccess({
                reportId: action.payload.reportId,  // 1. 몇 번 신고인지 → reportId
                result: result.data                 // 2. AI 결과가 뭔지 → result
            })
        );

    } catch (err) {
        yield put(aiReportAnalysisFailure( err.response?.data?.message || err.message ));
    }
}






// --- watch saga들 ---     ■ takeLatest : 여러 번 요청와도 1번만
function* watchCreateReport() { yield takeLatest( createReportRequest.type, createReport ); }
function* watchUpdateReport() { yield takeLatest( updateReportRequest.type, updateReport ); }
function* watchDeleteReport() { yield takeLatest( deleteReportRequest.type, deleteReport ); }
function* watchFetchReports() { yield takeLatest( fetchReportsRequest.type, fetchReports ); }
function* watchFetchReportsDetail() { yield takeLatest( fetchReportsDetailRequest.type, fetchReportsDetail ); }
function* watchCheckDoubleReport() { yield takeLatest( checkDoubleReportRequest.type, checkDoubleReport ); }

function* watchUpdateAdminReport() { yield takeLatest( updateAdminReportRequest.type, updateAdminReport ); }
function* watchdDeleteAdminReport() { yield takeLatest( deleteAdminReportRequest.type, deleteAdminReport ); }
function* watchFetchAdminReports() { yield takeLatest( fetchAdminReportsRequest.type, fetchAdminReports ); }
function* watchFetchAdminReportsDetail() { yield takeLatest( fetchAdminReportsDetailRequest.type, fetchAdminReportsDetail ); }

function* watchFetchAdminReportAuditLogs() { yield takeLatest( fetchAdminReportAuditLogsRequest.type, fetchAdminReportAuditLogs ); }

function* watchCreateAIReportDetail() { yield takeLatest( createAIReportDetailRequest.type, createAIReportDetail ); }
function* watchAiReportAnalysis() { yield takeLatest( aiReportAnalysisRequest.type, aiReportAnalysis ); }


export default function* reportSaga() {
    yield all([
        call(watchCreateReport),
        call(watchUpdateReport),
        call(watchDeleteReport),
        call(watchFetchReports),
        call(watchFetchReportsDetail),
        call(watchCheckDoubleReport),

        call(watchUpdateAdminReport),
        call(watchdDeleteAdminReport),
        call(watchFetchAdminReports),           // --- 관리자 신고 목록 조회 + 검색 + 페이징 ---
        call(watchFetchAdminReportsDetail),     // --- 관리자 신고 상세 조회 ---
        
        call(watchFetchAdminReportAuditLogs),
        
        call(watchCreateAIReportDetail),
        call(watchAiReportAnalysis),
    ]);
}