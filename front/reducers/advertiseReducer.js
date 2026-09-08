import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    advertisements: [],   // 광고 목록
    totalCnt: 0,          // 전체 광고 수
    page: 1,              // 현재 페이지
    size: 10,             // 페이지당 개수
    advertisement: null,  // 광고 상세
    loading: false,       // 로딩 상태
    error: null,          // 에러
};

const advertiseSlice = createSlice({
    name: 'advertise',
    initialState,

    reducers: {

        // 광고 목록
        getAdvertiseListRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        getAdvertiseListSuccess: (state, action) => {
            state.loading = false;
            state.advertisements = action.payload.list;
            state.totalCnt = action.payload.totalCnt;
            state.page = action.payload.page;
            state.size = action.payload.size;
        },

        getAdvertiseListFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },


        // 광고 상세
        getAdvertiseDetailRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        getAdvertiseDetailSuccess: (state, action) => {
            state.loading = false;
            state.advertisement = action.payload;
        },

        getAdvertiseDetailFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },


        // 광고 등록
        createAdvertiseRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        createAdvertiseSuccess: (state, action) => {
            state.loading = false;
            state.advertisement = action.payload;
        },

        createAdvertiseFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },


        // 광고 수정
        updateAdvertiseRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        updateAdvertiseSuccess: (state, action) => {
            state.loading = false;
            state.advertisement = action.payload;
        },

        updateAdvertiseFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },


        // 광고 삭제
        deleteAdvertiseRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        deleteAdvertiseSuccess: (state) => {
            state.loading = false;
            state.advertisement = null;
        },

        deleteAdvertiseFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
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
    deleteAdvertiseFailure,
} = advertiseSlice.actions;

export default advertiseSlice.reducer;