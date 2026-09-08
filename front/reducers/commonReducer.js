import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    weather: null,
    weatherLoading: false,
    weatherError: null,

    addressList: [],
    addressLoading: false,
    addressError: null,
    addressTotal: 0,
};

const commonSlice = createSlice({
    name: "common",
    initialState,
    reducers: {
        // =========================
        // 날씨
        // =========================
        fetchWeatherRequest: (state) => {
            state.weatherLoading = true;
            state.weatherError = null;
        },

        fetchWeatherSuccess: (state, action) => {
            state.weatherLoading = false;
            state.weather = action.payload;
        },

        fetchWeatherFailure: (state, action) => {
            state.weatherLoading = false;
            state.weatherError = action.payload;
        },

        // =========================
        // 주소 검색
        // =========================
        searchAddressRequest: (state) => {
            state.addressLoading = true;
            state.addressError = null;
        },

        searchAddressSuccess: (state, action) => {
            state.addressLoading = false;
            state.addressList = action.payload.list;
            state.addressTotal = action.payload.totalCount;
        },

        searchAddressFailure: (state, action) => {
            state.addressLoading = false;
            state.addressError = action.payload;
        },
    },
});

export const {
    fetchWeatherRequest,
    fetchWeatherSuccess,
    fetchWeatherFailure,

    searchAddressRequest,
    searchAddressSuccess,
    searchAddressFailure,
} = commonSlice.actions;

export default commonSlice.reducer;
