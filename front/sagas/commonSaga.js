import { call, put, takeLatest } from "redux-saga/effects";
import api from "../api/axios";

import {
    fetchWeatherRequest,
    fetchWeatherSuccess,
    fetchWeatherFailure,
    searchAddressRequest,
    searchAddressSuccess,
    searchAddressFailure,
} from "../reducers/commonReducer";

const COMMON_API_BASE = "http://localhost:8080/api/common";

// =========================
// 날씨 API
// =========================
function fetchWeatherAPI(params) {
    return api.get(`${COMMON_API_BASE}/weather`, {
        params,
    });
}

function* fetchWeather(action) {
    try {
        const response = yield call(fetchWeatherAPI, action.payload);

        yield put(fetchWeatherSuccess(response.data));
    } catch (error) {
        //console.error("날씨 조회 실패:", error);

        yield put(
            fetchWeatherFailure(
                error.response?.data?.message || "날씨 조회에 실패했습니다.",
            ),
        );
    }
}

// =========================
// 주소 검색 API
// =========================
function searchAddressAPI(params) {
    return api.get(`${COMMON_API_BASE}/address-search`, {
        params,
    });
}

function* searchAddress(action) {
    try {
        const response = yield call(searchAddressAPI, action.payload);
        //console.log("주소 API response:", response);
        //console.log("주소 API data:", response.data);
        yield put(searchAddressSuccess(response.data));
    } catch (error) {
        //console.error("주소 검색 실패:", error);

        yield put(
            searchAddressFailure(
                error.response?.data?.message || "주소 검색에 실패했습니다.",
            ),
        );
    }
}

// =========================
// Root Saga
// =========================
export default function* commonSaga() {
    yield takeLatest(fetchWeatherRequest.type, fetchWeather);

    yield takeLatest(searchAddressRequest.type, searchAddress);
}
