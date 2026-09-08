import axios from './axios';

// 광고 API 기본 주소
const API_URL = '/api/advertisement';


// 내 광고 목록 조회
export const getMyAdvertiseList = (params) => {
    return axios.get(API_URL, {
        params,
    });
};


// 광고 상세 조회
export const getAdvertiseDetail = (adId) => {
    return axios.get(`${API_URL}/${adId}`);
};


// 광고 등록
export const createAdvertise = (formData) => {
    return axios.post(API_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};


// 광고 수정
export const updateAdvertise = (adId, formData) => {
    return axios.put(`${API_URL}/${adId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};


// 광고 삭제
export const deleteAdvertise = (adId) => {
    return axios.delete(`${API_URL}/${adId}`);
};

// 결제 요청(결제 정보 생성)
export const createInitialPayment = (adId) => {
  return axios.post(
    `${API_URL}/payment/initial/${adId}`
  );
};

// 연장 가격 조회
export const getExtensionPrices = (adId) => {
  return axios.get(
    `${API_URL}/${adId}/extension-prices`
  );
};

// 연장 결제 정보 생성
export const createExtensionPayment = (adId, days) => {
  return axios.post(
    `${API_URL}/payment/extension/${adId}`,
    null,
    {
      params: {
        days,
      },
    }
  );
};

// 메인/위치별 광고 조회
export const getTopAdvertisement = (position) => {
    return axios.get(`${API_URL}/top`, {
        params: {
            position,
        },
    });
};


// 광고 노출수 증가
export const increaseAdvertisementImpression = (adId, position) => {
    return axios.post(`${API_URL}/impression`, null, {
        params: {
            adId,
            position,
        },
    });
};


// 광고 클릭수 증가
export const increaseAdvertisementClick = (adId, position) => {
    return axios.post(`${API_URL}/click`, null, {
        params: {
            adId,
            position,
        },
    });
};