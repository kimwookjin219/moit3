import {all, call, put, takeLatest} from 'redux-saga/effects';
import api from '../api/axios';

import {    
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
} from '../reducers/qnaReducer';

const QNA_API_BASE = '/api/questions'

// --- QnA 등록 POST : /api/questions ---
export const qnaCreateAPI = (payload) => api.post(QNA_API_BASE, payload);
export function* qnaCreate(action){
    try {
        const result = yield call(qnaCreateAPI, action.payload);
        yield put(qnaCreateSuccess(result.data));
    }catch(err){
        yield put( qnaCreateFailure(err.response?.data?.message || err.message));
    }
}

// --- QnA 목록 조회 GET : /api/questions/myQuestion ---
export const qnaListAPI = ({page = 1, type, keyword,}) => api.get(`${QNA_API_BASE}/myQuestion`, {
        params: {page, type, keyword,}});
export function* qnaList(action){
    try {
        const result = yield call(qnaListAPI, action.payload || { page: 1 });
        yield put(qnaListSuccess(result.data));
    }catch(err){
        yield put(qnaListFailure(err.response?.data?.message || err.message));
    }
}

// 특정 모임 Q&A 목록 조회
export const qnaMeetupListAPI = (meetupId) => api.get(`${QNA_API_BASE}/meetup/${meetupId}`);
export function* qnaMeetupList(action) {
    try {
        const result = yield call(qnaMeetupListAPI, action.payload);
        yield put(qnaMeetupListSuccess(result.data));
    } catch (err) {
        yield put(qnaMeetupListFailure(err.response?.data?.message || err.message));
    }
}

// --- QnA 상세 조회 GET : /api/questions/{questionId} ---
export const qnaDetailAPI = (questionId) => api.get(`${QNA_API_BASE}/${questionId}`);
export function* qnaDetail(action){
    try {
        const result = yield call(qnaDetailAPI, action.payload);
        yield put(qnaDetailSuccess(result.data));
    }catch(err) {
        yield put(qnaDetailFailure(err.response?.data?.message || err.message));
    }
}

// --- QnA 수정 PUT : /api/questions/{questionId} ---
export const qnaUpdateAPI = ({questionId, data}) => api.put(`${QNA_API_BASE}/${questionId}`, data);
export function* qnaUpdate(action){
    try {
        yield call(qnaUpdateAPI, action.payload);
        yield put(qnaUpdateSuccess());
    }catch(err){
        if (err.response?.status === 403) {
            yield put(qnaUpdateFailure('문의 수정 권한이 없습니다.'));
        } else {
            yield put(qnaUpdateFailure(err.response?.data?.message || err.message));
        }
    }
}

// --- QnA 삭제 DELETE : /api/questions/delete/{questionId} ---
export const qnaDeleteAPI = (questionId) => api.delete(`${QNA_API_BASE}/delete/${questionId}`);
export function* qnaDelete(action){
    try {
        yield call(qnaDeleteAPI, action.payload);
        yield put(qnaDeleteSuccess());
    }catch(err){
        if (err.response?.status === 403) {
            yield put(qnaDeleteFailure('문의 삭제 권한이 없습니다.'));
        } else {
            yield put(qnaDeleteFailure(err.response?.data?.message || err.message));
        }
    }
}

// --- 관리자 QnA 조회 GET : /api/questions/admin ---
export const qnaAdminListAPI = (payload) => api.get(`${QNA_API_BASE}/admin`, {
        params: payload,});
export function* qnaAdminList(action){
    try {
        const result = yield call(qnaAdminListAPI, action.payload || { page: 1 });
        yield put(qnaAdminListSuccess(result.data));
    }catch(err){
        yield put(qnaAdminListFailure(err.response?.data?.message || err.message));
    }
}

// --- QnA 답변 등록 POST : /api/questions/answer ---
export const qnaAnswerCreateAPI = (payload) => api.post(`${QNA_API_BASE}/answer`, payload);
export function* qnaAnswerCreate(action){
    try {
        yield call(qnaAnswerCreateAPI, action.payload);
        yield put(qnaAnswerCreateSuccess());
    }catch(err){
        if (err.response?.status === 403) {
            yield put(qnaAnswerCreateFailure('답변 등록 권한이 없습니다.'));
        } else {
            yield put(qnaAnswerCreateFailure(err.response?.data?.message || err.message));
        }
    }
}

// --- QnA 답변 수정 PUT : /api/questions/answer/{answerId} ---
export const qnaAnswerUpdateAPI = ({answerId, data}) => api.put(`${QNA_API_BASE}/answer/${answerId}`, data);
export function* qnaAnswerUpdate(action){
    try {
        yield call(qnaAnswerUpdateAPI, action.payload);
        yield put(qnaAnswerUpdateSuccess());
    }catch(err){
        if (err.response?.status === 403) {
            yield put(qnaAnswerUpdateFailure('답변 수정 권한이 없습니다.'));
        } else {
            yield put(qnaAnswerUpdateFailure(err.response?.data?.message || err.message));
        }
    }
}

// --- QnA 답변 삭제 DELETE : /api/questions/{questionId}/answer/{answerId} ---
export const qnaAnswerDeleteAPI = ({questionId, answerId}) => api.delete(`${QNA_API_BASE}/${questionId}/answer/${answerId}`);
export function* qnaAnswerDelete(action){
    try {
        yield call(qnaAnswerDeleteAPI, action.payload);
        yield put(qnaAnswerDeleteSuccess());
    }catch(err){
        if (err.response?.status === 403) {
            yield put(qnaAnswerDeleteFailure('답변 삭제 권한이 없습니다.'));
        } else {
            yield put(qnaAnswerDeleteFailure(err.response?.data?.message || err.message));
        }
    }
}

// --- 답변 만족도 평가 PATCH : /api/questions/answer/{answerId}/satisfaction ---
export const qnaSatisfactionAPI = ({answerId, data}) => api.patch(`${QNA_API_BASE}/answer/${answerId}/satisfaction`, data);
export function* qnaSatisfaction(action){
    try {
        yield call(qnaSatisfactionAPI, action.payload);
        yield put(qnaSatisfactionSuccess());
    }catch(err){
        yield put(qnaSatisfactionFailure(err.response?.data?.message || err.message));
    }
}

// --- 답변 만족도 평가 삭제 DELETE ---
export const qnaSatisfactionDeleteAPI = (answerId) => api.delete(`${QNA_API_BASE}/answer/${answerId}/satisfaction`);
export function* qnaSatisfactionDelete(action) {
    try {
        yield call(qnaSatisfactionDeleteAPI, action.payload);
        yield put(qnaSatisfactionDeleteSuccess());
    } catch (err) {
        yield put(
            qnaSatisfactionDeleteFailure(err.response?.data?.message || err.message));
    }
}

// --- 관리자 선택 삭제 DELETE : /api/questions/deleteSelected ---
export const qnaAdminDeleteSelectedAPI = (ids) => api.delete(`${QNA_API_BASE}/deleteSelected`, {
        data: ids,});
export function* qnaAdminDeleteSelected(action){
    try {
        yield call(qnaAdminDeleteSelectedAPI, action.payload);
        yield put(qnaAdminDeleteSelectedSuccess());
    }catch(err){
        yield put(qnaAdminDeleteSelectedFailure(err.response?.data?.message || err.message));
    }
}

// --- AI 정상 처리 PATCH : /api/questions/ai/normal ---
export const qnaAiNormalAPI = (ids) => api.patch(`${QNA_API_BASE}/ai/normal`, ids);
export function* qnaAiNormal(action){
    try {
        yield call(qnaAiNormalAPI, action.payload);
        yield put(qnaAiNormalSuccess());
    }catch(err){
        yield put(qnaAiNormalFailure(err.response?.data?.message || err.message));
    }
}

// --- QnA Saga ---
function* watchQnaCreate() {          yield takeLatest( qnaCreateRequest.type,          qnaCreate ); }
function* watchQnaList() {            yield takeLatest( qnaListRequest.type,            qnaList ); }
function* watchQnaDetail() {          yield takeLatest( qnaDetailRequest.type,          qnaDetail ); }
function* watchQnaMeetupList() {      yield takeLatest( qnaMeetupListRequest.type,      qnaMeetupList ); }
function* watchQnaUpdate() {          yield takeLatest( qnaUpdateRequest.type,          qnaUpdate ); }
function* watchQnaDelete() {          yield takeLatest( qnaDeleteRequest.type,          qnaDelete ); }
function* watchQnaAdminList() {       yield takeLatest( qnaAdminListRequest.type,       qnaAdminList ); }
function* watchQnaAnswerCreate() {    yield takeLatest( qnaAnswerCreateRequest.type,    qnaAnswerCreate ); }
function* watchQnaAnswerUpdate() {    yield takeLatest( qnaAnswerUpdateRequest.type,    qnaAnswerUpdate ); }
function* watchQnaAnswerDelete() {    yield takeLatest( qnaAnswerDeleteRequest.type,    qnaAnswerDelete ); }
function* watchQnaSatisfaction() {    yield takeLatest( qnaSatisfactionRequest.type,    qnaSatisfaction ); }
function* watchQnaSatisfactionDelete() {  yield takeLatest( qnaSatisfactionDeleteRequest.type, qnaSatisfactionDelete );}
function* watchQnaAdminDeleteSelected() { yield takeLatest( qnaAdminDeleteSelectedRequest.type, qnaAdminDeleteSelected ); }
function* watchQnaAiNormal() {        yield takeLatest( qnaAiNormalRequest.type,        qnaAiNormal ); }

export default function* qnaSaga() {
    yield all([
        call(watchQnaCreate),
        call(watchQnaList),
        call(watchQnaDetail),
        call(watchQnaMeetupList),
        call(watchQnaUpdate),
        call(watchQnaDelete),
        call(watchQnaAdminList),
        call(watchQnaAnswerCreate),
        call(watchQnaAnswerUpdate),
        call(watchQnaAnswerDelete),
        call(watchQnaSatisfaction),
        call(watchQnaSatisfactionDelete),
        call(watchQnaAdminDeleteSelected),
        call(watchQnaAiNormal),
    ]);
}