import axios from './axios';

const API_URL = '/api/admin/advertisement/dashboard';

// =========================================================
// 광고 대시보드
// =========================================================

// 상단 요약
export const getAdvertiseDashboardSummary = () => {
    return axios.get(`${API_URL}/summary`);
};

// 최근 일일 통계
export const getAdvertiseDashboardDaily = () => {
    return axios.get(`${API_URL}/daily`);
};

// 광고별 CTR TOP 5
export const getAdvertiseDashboardCtr = () => {
    return axios.get(`${API_URL}/ctr`);
};

// 광고 등급별 통계
export const getAdvertiseDashboardGrade = () => {
    return axios.get(`${API_URL}/grade`);
};

// 광고 위치별 노출
export const getAdvertiseDashboardPosition = () => {
    return axios.get(`${API_URL}/position`);
};

// 광고 연장률
export const getAdvertiseDashboardExtensionRate = () => {
    return axios.get(`${API_URL}/extension-rate`);
};

// 광고 위치별 CTR
export const getAdvertiseDashboardPositionCtr = () => {
    return axios.get(`${API_URL}/position-ctr`);
};

// AI 운영 분석
export const getAdvertiseDashboardAiSummary = () => {
    return axios.get(`${API_URL}/ai-summary`);
};