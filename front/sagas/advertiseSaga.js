import {
    all,
    call,
    put,
    takeLatest
} from 'redux-saga/effects';

import {
    getAdvertiseList,
    getAdvertiseDetail,
    createAdvertise,
    updateAdvertise,
    deleteAdvertise
} from '../api/advertiseApi';

import {
    getAdvertiseListRequest,
    getAdvertiseListSuccess,
    getAdvertiseListFailure,

    getAdvertiseDetailRequest,
    getAdvertiseDetailSuccess,
    getAdvertiseDetailFailure,

    createAdvertiseRequest,
    createAdvertiseSuccess,
    createAdvertiseFailure,

    updateAdvertiseRequest,
    updateAdvertiseSuccess,
    updateAdvertiseFailure,

    deleteAdvertiseRequest,
    deleteAdvertiseSuccess,
    deleteAdvertiseFailure
} from '../reducers/advertiseReducer';


// 광고 목록 조회
export function* getAdvertiseListSaga(action) {
    try {
        const response = yield call(
            getAdvertiseList,
            action.payload
        );

        yield put(
            getAdvertiseListSuccess(response.data)
        );

    } catch (error) {
        yield put(
            getAdvertiseListFailure(
                error.response?.data || '광고 목록 조회 실패'
            )
        );
    }
}


// 광고 상세 조회
export function* getAdvertiseDetailSaga(action) {
    try {
        const response = yield call(
            getAdvertiseDetail,
            action.payload
        );

        yield put(
            getAdvertiseDetailSuccess(response.data)
        );

    } catch (error) {
        yield put(
            getAdvertiseDetailFailure(
                error.response?.data || '광고 상세 조회 실패'
            )
        );
    }
}


// 광고 등록
export function* createAdvertiseSaga(action) {
    try {
        const response = yield call(
            createAdvertise,
            action.payload
        );

        yield put(
            createAdvertiseSuccess(response.data)
        );

    } catch (error) {
        yield put(
            createAdvertiseFailure(
                error.response?.data || '광고 등록 실패'
            )
        );
    }
}


// 광고 수정
export function* updateAdvertiseSaga(action) {
    try {
        const { adId, formData } = action.payload;

        const response = yield call(
            updateAdvertise,
            adId,
            formData
        );

        yield put(
            updateAdvertiseSuccess(response.data)
        );

    } catch (error) {
        yield put(
            updateAdvertiseFailure(
                error.response?.data || '광고 수정 실패'
            )
        );
    }
}


// 광고 삭제
export function* deleteAdvertiseSaga(action) {
    try {
        yield call(
            deleteAdvertise,
            action.payload
        );

        yield put(
            deleteAdvertiseSuccess()
        );

    } catch (error) {
        yield put(
            deleteAdvertiseFailure(
                error.response?.data || '광고 삭제 실패'
            )
        );
    }
}


// 광고 Saga 실행
export function* watchAdvertise() {

    yield takeLatest(
        getAdvertiseListRequest.type,
        getAdvertiseListSaga
    );

    yield takeLatest(
        getAdvertiseDetailRequest.type,
        getAdvertiseDetailSaga
    );

    yield takeLatest(
        createAdvertiseRequest.type,
        createAdvertiseSaga
    );

    yield takeLatest(
        updateAdvertiseRequest.type,
        updateAdvertiseSaga
    );

    yield takeLatest(
        deleteAdvertiseRequest.type,
        deleteAdvertiseSaga
    );
}


export default function* advertiseSaga() {
    yield all([
        watchAdvertise()
    ]);
}