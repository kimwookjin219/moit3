import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../api/axios";

import {
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

    //관리자 통계
    fetchMeetupCountRequest,
    fetchMeetupCountSuccess,
    fetchMeetupCountFailure,

    // AI 추천
    recommendMeetupRequest,
    recommendMeetupSuccess,
    recommendMeetupFailure,

    //인기모임
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
    resetBoostSuccess,

    // 오늘 등록한 모임 수
    fetchTodayMeetupCountRequest,
    fetchTodayMeetupCountSuccess,
    fetchTodayMeetupCountFailure,
} from "../reducers/meetupReducer";

const MEETUP_API_BASE = "/api/meetups";

// ==================================================
// 전체 모임 조회
// GET /api/meetups?page=0&size=10
// ==================================================

export const fetchMeetupsAPI = (params) => api.get(MEETUP_API_BASE, { params });

export function* fetchMeetups(action) {
    try {
        const result = yield call(fetchMeetupsAPI, action.payload);
        //console.log("🔥 서버 응답:", result);
        //console.log("🔥 서버 응답 data:", result.data);
        yield put(fetchMeetupsSuccess(result.data));
    } catch (err) {
        yield put(
            fetchMeetupsFailure(err.response?.data?.message || err.message),
        );
    }
}

// ==================================================
// 모임 상세 조회
// GET /api/meetups/{meetupId}
// ==================================================

export const fetchMeetupDetailAPI = (meetupId) =>
    api.get(`${MEETUP_API_BASE}/${meetupId}`);

export function* fetchMeetupDetail(action) {
    try {
        const result = yield call(fetchMeetupDetailAPI, action.payload);
        //console.log(result.data);
        yield put(fetchMeetupDetailSuccess(result.data));
    } catch (err) {
        const status = err.response?.status;

        const message =
            status === 403
                ? "비공개 처리된 모집글입니다."
                : err.response?.data?.message ||
                  err.message ||
                  "모집글 조회에 실패했습니다.";

        yield put(fetchMeetupDetailFailure(message));
    }
}

// ==================================================
// 모임 등록
// POST /api/meetups
// ==================================================

export function createMeetupAPI(payload) {
    const { dto, files } = payload;

    const formData = new FormData();

    Object.entries(dto || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value);
        }
    });

    if (files && files.length > 0) {
        files.forEach((file) => {
            formData.append("files", file);
        });
    }

    //console.log("🔥 dto:", dto);
    //console.log("🔥 files:", files);

    // for (const [key, value] of formData.entries()) {
    //     console.log(
    //         "🔥 FormData:",
    //         key,
    //         value instanceof File ? value.name : value,
    //     );
    // }

    return api.post(MEETUP_API_BASE, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export function* createMeetup(action) {
    try {
        //console.log("🔥 createMeetup payload:", action.payload);

        yield call(createMeetupAPI, action.payload);

        //console.log("🔥 모임 등록 실패:", err);
        //console.log("🔥 status:", err.response?.status);
        //.log("🔥 data:", err.response?.data);

        yield put(createMeetupSuccess());
    } catch (err) {
        //console.log(err);
        yield put(
            createMeetupFailure(
                err.response?.data?.message ||
                    err.response?.data?.error ||
                    err.message,
            ),
        );
    }
}

// ==================================================
// 모임 수정
// PUT /api/meetups/{meetupId}
// ==================================================
export function updateMeetupAPI({ meetupId, data, files, existingImagePaths }) {
    const formData = new FormData();

    // 모임 정보
    Object.entries(data || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value);
        }
    });

    // 기존에 유지할 이미지
    existingImagePaths?.forEach((imagePath) => {
        formData.append("existingImagePaths", imagePath);
    });

    // 새로 추가한 이미지
    files?.forEach((file) => {
        formData.append("files", file);
    });

    // 확인용
    for (const [key, value] of formData.entries()) {
        console.log(
            "🔥 Update FormData:",
            key,
            value instanceof File ? value.name : value,
        );
    }

    return api.put(`${MEETUP_API_BASE}/${meetupId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export function* updateMeetup(action) {
    try {
        const { meetupId, data, files, existingImagePaths } = action.payload;

        yield call(updateMeetupAPI, {
            meetupId,
            data,
            files,
            existingImagePaths,
        });

        yield put(updateMeetupSuccess());

        // 상세 페이지를 보고 있었다면 상세도 다시 조회
        yield put(fetchMeetupDetailRequest(meetupId));
    } catch (err) {
        yield put(
            updateMeetupFailure(err.response?.data?.message || err.message),
        );
    }
}

// ==================================================
// 모임 삭제
// DELETE /api/meetups/{meetupId}
// ==================================================

export const deleteMeetupAPI = (meetupId) =>
    api.delete(`${MEETUP_API_BASE}/${meetupId}`);

export function* deleteMeetup(action) {
    try {
        const { meetupId, page = 0, size = 10 } = action.payload;

        yield call(deleteMeetupAPI, meetupId);

        // 삭제 성공
        yield put(deleteMeetupSuccess());

        // 목록 다시 조회
        yield put(
            fetchMyMeetupsRequest({
                page,
                size,
            }),
        );

        // 통계 다시 조회
        yield put(fetchMyMeetupCountRequest());
    } catch (err) {
        yield put(
            deleteMeetupFailure(err.response?.data?.message || err.message),
        );
    }
}

// ==================================================
// 모임 신청
// POST /api/meetups/{meetupId}/apply
// ==================================================

export const applyMeetupAPI = (meetupId) =>
    api.post(`${MEETUP_API_BASE}/${meetupId}/apply`);

export function* applyMeetup(action) {
    try {
        const result = yield call(applyMeetupAPI, action.payload);

        if (result.status === 200) {
            yield put(
                applyMeetupSuccess({
                    meetupId: action.payload,
                }),
            );
        }
    } catch (err) {
        yield put(
            applyMeetupFailure(err.response?.data?.message || err.message),
        );
    }
}

// ==================================================
// 좋아요
// PATCH /api/meetups/{meetupId}/like
// ==================================================

export const meetupLikeAPI = (meetupId) =>
    api.patch(`${MEETUP_API_BASE}/${meetupId}/like`);

export function* meetupLike(action) {
    try {
        const result = yield call(meetupLikeAPI, action.payload);
        if (result.status === 200) {
            yield put(meetupLikeSuccess({ meetupId: action.payload }));
        }
    } catch (err) {
        console.log(err);
        yield put(
            meetupLikeFailure(err.response?.data?.message || err.message),
        );
    }
}

// ==================================================
// 공개 / 비공개 전환
// PATCH /api/meetups/{meetupId}/visibility
// ==================================================

export const changeMeetupVisibilityAPI = (meetupId) =>
    api.patch(`${MEETUP_API_BASE}/${meetupId}/visibility`);

export function* changeMeetupVisibility(action) {
    try {
        yield call(changeMeetupVisibilityAPI, action.payload);

        yield put(changeMeetupVisibilitySuccess(action.payload));
    } catch (err) {
        yield put(
            changeMeetupVisibilityFailure(
                err.response?.data?.message || err.message,
            ),
        );
    }
}

// ==================================================
// 마이페이지 내 신청 목록
// GET /api/meetups/applications
// ==================================================

export const fetchMyApplicationsAPI = (params) =>
    api.get(`${MEETUP_API_BASE}/applications`, { params });

export function* fetchMyApplications(action) {
    try {
        const result = yield call(fetchMyApplicationsAPI, action.payload);
        //console.log("내 신청목록!!!!!", result);
        yield put(fetchMyApplicationsSuccess(result.data));
    } catch (err) {
        yield put(
            fetchMyApplicationsFailure(
                err.response?.data?.message || err.message,
            ),
        );
    }
}

// ==================================================
// 모임 신청자 목록
// GET /api/meetups/{meetupId}/applicants
// ==================================================

export const fetchMeetupApplicantsAPI = (meetupId, params) =>
    api.get(`${MEETUP_API_BASE}/${meetupId}/applicants`, { params });

export function* fetchMeetupApplicants(action) {
    try {
        const { meetupId, page, size } = action.payload;
        //console.log("Saga payload:", action.payload);
        const result = yield call(fetchMeetupApplicantsAPI, meetupId, {
            page,
            size,
        });

        yield put(fetchMeetupApplicantsSuccess(result.data));
    } catch (err) {
        yield put(
            fetchMeetupApplicantsFailure(
                err.response?.data?.message || err.message,
            ),
        );
    }
}

// ==================================================
// 내 모집글
// GET /api/meetups/my
// ==================================================

export const fetchMyMeetupsAPI = (params) =>
    api.get(`${MEETUP_API_BASE}/my`, { params });

export function* fetchMyMeetups(action) {
    try {
        const result = yield call(fetchMyMeetupsAPI, action.payload);
        //console.log("🔥 내 모집글 API 응답:", result.data);
        yield put(fetchMyMeetupsSuccess(result.data));
    } catch (err) {
        yield put(
            fetchMyMeetupsFailure(err.response?.data?.message || err.message),
        );
    }
}

// ==================================================
// 신청 상태 변경
// PATCH /api/meetups/applications/status
// ==================================================

export const updateApplicationStatusAPI = (data) =>
    api.patch(`${MEETUP_API_BASE}/applications/status`, data);

export function* updateApplicationStatus(action) {
    try {
        //console.log("🔥 승인 요청 data:", action.payload);
        yield call(updateApplicationStatusAPI, action.payload);

        yield put(updateApplicationStatusSuccess());
        // 💡 승인/거절 성공 후, 신청자 목록 조회 Saga를 다시 실행 (meetupId 필요)
        //console.log("@@@@@@@meetupID" + action.payload.meetupId);
        yield put(
            fetchMeetupApplicantsRequest({
                meetupId: action.payload.meetupId,
                page: 0,
                size: 10,
            }),
        );
    } catch (err) {
        yield put(
            updateApplicationStatusFailure(
                err.response?.data?.message || err.message,
            ),
        );
    }
}

// ==================================================
// 카테고리 조회
// GET /api/meetups/category
// ==================================================

export const fetchCategoriesAPI = () => api.get(`${MEETUP_API_BASE}/category`);

export function* fetchCategories() {
    try {
        const result = yield call(fetchCategoriesAPI);

        yield put(fetchCategoriesSuccess(result.data));
    } catch (err) {
        yield put(
            fetchCategoriesFailure(err.response?.data?.message || err.message),
        );
    }
}

// ==================================================
// 시군구 조회
// GET /api/meetups/sigungu
// ==================================================

export const fetchSigungusAPI = () => api.get(`${MEETUP_API_BASE}/sigungu`);

export function* fetchSigungus() {
    try {
        const result = yield call(fetchSigungusAPI);

        yield put(fetchSigungusSuccess(result.data));
    } catch (err) {
        yield put(
            fetchSigungusFailure(err.response?.data?.message || err.message),
        );
    }
}

// ==================================================
// 마이페이지 통계 조회
// GET /api/meetups/my-count
// ==================================================

export const fetchMyMeetupCountAPI = () =>
    api.get(`${MEETUP_API_BASE}/my-count`);

export function* fetchMyMeetupCount() {
    try {
        //console.log("🔥 마이페이지 통계 조회 dispatch");

        const result = yield call(fetchMyMeetupCountAPI);

        //console.log("🔥 마이페이지 통계!!!!!", result.data);

        yield put(fetchMyMeetupCountSuccess(result.data));
    } catch (err) {
        //console.error("마이페이지 통계 조회 실패:", err);

        yield put(
            fetchMyMeetupCountFailure(
                err.response?.data?.message || err.message,
            ),
        );
    }
}

// ==================================================
// 마이페이지 통계 조회
// GET /api/meetups/count
// ==================================================

export const fetchMeetupCountSagaAPI = () =>
    api.get(`${MEETUP_API_BASE}/count`);

function* fetchMeetupCount() {
    try {
        const response = yield call(fetchMeetupCountSagaAPI);

        yield put(fetchMeetupCountSuccess(response.data));
    } catch (error) {
        yield put(
            fetchMeetupCountFailure(
                error.response?.data?.message || error.message,
            ),
        );
    }
}

// ==================================================
// AI 모임 추천
// POST /api/meetups/write/ai/recommended
// ==================================================

export const recommendMeetupAPI = (data) =>
    api.post(`${MEETUP_API_BASE}/write/ai/recommended`, data);

export function* recommendMeetup(action) {
    try {
        const result = yield call(recommendMeetupAPI, action.payload);

        yield put(recommendMeetupSuccess(result.data));
    } catch (err) {
        yield put(
            recommendMeetupFailure(err.response?.data?.message || err.message),
        );
    }
}

// ==================================================
// 인기모임
// POST /api/meetups/{meetupId}/recommended
// ==================================================

const fetchPopularMeetupsAPI = () => api.get(`${MEETUP_API_BASE}/popular`);

export function* fetchPopularMeetups() {
    try {
        const result = yield call(fetchPopularMeetupsAPI);
        console.log("인기모임조회성공", result.data);

        yield put(fetchPopularMeetupsSuccess(result.data));
    } catch (err) {
        yield put(
            fetchPopularMeetupsFailure(
                err.response?.data?.message || err.message,
            ),
        );
    }
}

// ==================================================
// 추천모임
// POST /api/meetups/popular
// ==================================================
const fetchRecommendedMeetupsAPI = (meetupId) =>
    api.get(`${MEETUP_API_BASE}/${meetupId}/recommended`);

export function* fetchRecommendedMeetups(action) {
    try {
        // console.log("추천모임 요청 meetupId:", action.payload);

        const response = yield call(fetchRecommendedMeetupsAPI, action.payload);

        // console.log("추천모임 API 응답:", response.data);

        yield put(fetchRecommendedMeetupsSuccess(response.data));
    } catch (error) {
        // console.error("추천모임 조회 실패");
        // console.error("status:", error.response?.status);
        // console.error("data:", error.response?.data);
        // console.error("message:", error.message);
        // console.error("전체 error:", error);

        yield put(
            fetchRecommendedMeetupsFailure(
                error.response?.data?.message ||
                    "추천모임을 불러오지 못했습니다.",
            ),
        );
    }
}

// ==================================================
// 모임 끌어올리기
// POST /api/meetups/{meetupId}/boost
// ==================================================
const boostMeetupAPI = (meetupId) => {
    return api.post(`${MEETUP_API_BASE}/${meetupId}/boost`);
};

export function* boostMeetup(action) {
    try {
        yield call(boostMeetupAPI, action.payload);
        yield put(boostMeetupSuccess());
    } catch (err) {
        yield put(
            boostMeetupFailure(
                err.response?.data?.error || "모임 끌어올리기에 실패했습니다.",
            ),
        );
    }
}

// ==================================================
// 오늘 등록한 모임 수
// GET /api/meetups/todayMeetupCount
// ==================================================
const fetchTodayMeetupCountAPI = () => {
    return api.get(`${MEETUP_API_BASE}/todayMeetupCount`);
};

export function* fetchTodayMeetupCount(action) {
    try {
        const retult = yield call(fetchTodayMeetupCountAPI);
        yield put(fetchTodayMeetupCountSuccess(retult.data));
    } catch (err) {
        fetchTodayMeetupCountFailure(
            err.response?.data?.error ||
                "하루 최대 3개의 모임만 등록할 수 있습니다.",
        );
    }
}

// ==================================================
// Watcher
// ==================================================

export function* watchMeetupSaga() {
    yield takeLatest(fetchMeetupsRequest.type, fetchMeetups);

    yield takeLatest(fetchMeetupDetailRequest.type, fetchMeetupDetail);

    yield takeLatest(createMeetupRequest.type, createMeetup);

    yield takeLatest(updateMeetupRequest.type, updateMeetup);

    yield takeLatest(deleteMeetupRequest.type, deleteMeetup);

    yield takeLatest(applyMeetupRequest.type, applyMeetup);

    yield takeLatest(meetupLikeRequest.type, meetupLike);

    yield takeLatest(
        changeMeetupVisibilityRequest.type,
        changeMeetupVisibility,
    );

    yield takeLatest(fetchMyApplicationsRequest.type, fetchMyApplications);

    yield takeLatest(fetchMeetupApplicantsRequest.type, fetchMeetupApplicants);

    yield takeLatest(fetchMyMeetupsRequest.type, fetchMyMeetups);

    yield takeLatest(
        updateApplicationStatusRequest.type,
        updateApplicationStatus,
    );

    yield takeLatest(fetchCategoriesRequest.type, fetchCategories);

    yield takeLatest(fetchSigungusRequest.type, fetchSigungus);

    yield takeLatest(recommendMeetupRequest.type, recommendMeetup);

    yield takeLatest(fetchMyMeetupCountRequest.type, fetchMyMeetupCount);

    yield takeLatest(fetchMeetupCountRequest.type, fetchMeetupCount);

    yield takeLatest(fetchPopularMeetupsRequest.type, fetchPopularMeetups);

    yield takeLatest(
        fetchRecommendedMeetupsRequest.type,
        fetchRecommendedMeetups,
    );

    yield takeLatest(boostMeetupRequest.type, boostMeetup);

    yield takeLatest(fetchTodayMeetupCountRequest.type, fetchTodayMeetupCount);
}

// ==================================================
// Root Saga
// ==================================================

export default function* meetupSaga() {
    yield all([call(watchMeetupSaga)]);
}
