import axios from "./axios";

// 광고
const API_URL = "/api/admin/advertisement";
// 가격
const PRICE_API_URL = `${API_URL}/price`;

// =========================================================
// 파라미터 정제 함수 (400 에러 방지용)
// 빈 문자열은 제거하고, 백엔드 Enum 매핑을 위해 대문자로 변환합니다.
// =========================================================
const sanitizeParams = (params) => {
    if (!params) return params;
    
    const requestParams = { ...params };

    // 1. 값이 비어있으면 아예 파라미터에서 삭제
    if (!requestParams.status) delete requestParams.status;
    if (!requestParams.searchText) delete requestParams.searchText;
    if (!requestParams.sort) delete requestParams.sort;

    // 2. Enum 타입 값들은 무조건 대문자로 변환
    if (requestParams.sort) {
        requestParams.sort = requestParams.sort.toUpperCase(); 
    }
    if (requestParams.status) {
        requestParams.status = requestParams.status.toUpperCase();
    }

    return requestParams;
};


// 관리자 광고 가격 목록
export const getAdvertiseAdminPriceList = () => {
    return axios.get(`${PRICE_API_URL}`);
};

// 관리자 광고 가격 상세
export const getAdvertiseAdminPrice = (priceId) => {
    return axios.get(`${PRICE_API_URL}/${priceId}`);
};

// 관리자 광고 가격 등록
export const createAdvertiseAdminPrice = (data) => {
    return axios.post(`${PRICE_API_URL}`, data);
};

// 관리자 광고 가격 수정
export const updateAdvertiseAdminPrice = (priceId, data) => {
    return axios.put(`${PRICE_API_URL}/${priceId}`, data);
};

// 관리자 광고 가격 삭제
export const deleteAdvertiseAdminPrice = (priceId) => {
    return axios.delete(`${PRICE_API_URL}/${priceId}`);
};

////////////////////////////////////////////

// 광고 목록
export const getAdvertiseAdminList = (params) => {
    return axios.get(API_URL, {
        params: sanitizeParams(params) 
    });
};

// 광고 목록 개수
export const getAdvertiseAdminCount = (params) => {
    return axios.get(`${API_URL}/count`, {
        params: sanitizeParams(params) 
    });
};

// =========================================================
// 관리자 광고 탭별 목록
// =========================================================

// 승인 관리
export const getAdvertiseApprovalTabList = (params) => {
    return axios.get(`${API_URL}/approval-tab`, {
        params: sanitizeParams(params), 
    });
};

// 결제 확인
export const getAdvertisePaymentTabList = (params) => {
    return axios.get(`${API_URL}/payment-tab`, {
        params: sanitizeParams(params), 
    });
};

// 운영 관리
export const getAdvertiseStatusTabList = (params) => {
    return axios.get(`${API_URL}/status-tab`, {
        params: sanitizeParams(params), 
    });
};

// =========================================================
// 관리자 광고 탭별 개수
// =========================================================

// 승인 관리 개수
export const getAdvertiseApprovalTabCount = (params) => {
    return axios.get(`${API_URL}/approval-tab/count`, {
        params: sanitizeParams(params), 
    });
};

// 결제 확인 개수
export const getAdvertisePaymentTabCount = (params) => {
    return axios.get(`${API_URL}/payment-tab/count`, {
        params: sanitizeParams(params), 
    });
};

// 운영 관리 개수
export const getAdvertiseStatusTabCount = (params) => {
    return axios.get(`${API_URL}/status-tab/count`, {
        params: sanitizeParams(params), 
    });
};

export const getAdvertiseApprovalStats = () => {
  return axios.get(`${API_URL}/stats/approval`);
};

export const getAdvertisePaymentStats = () => {
  return axios.get(`${API_URL}/stats/payment`);
};

export const getAdvertiseStatusStats = () => {
  return axios.get(`${API_URL}/stats/status`);
};

// 광고 상세
export const getAdvertiseAdminDetail = (adId) => {
    return axios.get(`${API_URL}/${adId}`);
};

// 광고 승인
export const approveAdvertise = (adId) => {
    return axios.patch(
        `${API_URL}/${adId}/approve`
    );
};

// 광고 반려
export const rejectAdvertise = (
    adId,
    rejectReason
) => {
    return axios.patch(
        `${API_URL}/${adId}/reject`,
        null,
        {
            params: {
                rejectReason
            }
        }
    );
};

// 광고 상태 변경
export const updateAdvertiseStatus = (
    adId,
    status
) => {
    return axios.patch(
        `${API_URL}/${adId}/status`,
        null,
        {
            params: {
                status: status.toUpperCase()
            }
        }
    );
};