import { call, put } from 'redux-saga/effects';

import {
    getAdvertiseList,
    getAdvertiseDetail,
    createAdvertise,
    updateAdvertise,
    deleteAdvertise
} from '../../api/advertiseApi';

import {
    getAdvertiseListSuccess,
    getAdvertiseListFailure,

    getAdvertiseDetailSuccess,
    getAdvertiseDetailFailure,

    createAdvertiseSuccess,
    createAdvertiseFailure,

    updateAdvertiseSuccess,
    updateAdvertiseFailure,

    deleteAdvertiseSuccess,
    deleteAdvertiseFailure
} from '../../reducers/advertiseReducer';

import {
    getAdvertiseListSaga,
    getAdvertiseDetailSaga,
    createAdvertiseSaga,
    updateAdvertiseSaga,
    deleteAdvertiseSaga
} from '../advertiseSaga';


// API 함수 mock
jest.mock('../../api/advertiseApi');


describe('advertiseSaga', () => {

    // 광고 목록 조회 성공
    test('광고 목록 조회 성공 시 success action을 실행한다.', () => {

        const action = {
            payload: {
                page: 1,
                size: 10
            }
        };

        const response = {
            data: {
                list: [],
                totalCnt: 0,
                page: 1,
                size: 10
            }
        };

        const saga = getAdvertiseListSaga(action);

        expect(saga.next().value).toEqual(
            call(getAdvertiseList, action.payload)
        );

        expect(saga.next(response).value).toEqual(
            put(getAdvertiseListSuccess(response.data))
        );

        expect(saga.next().done).toBe(true);
    });


    // 광고 목록 조회 실패
    test('광고 목록 조회 실패 시 failure action을 실행한다.', () => {

        const action = {
            payload: {
                page: 1,
                size: 10
            }
        };

        const error = {
            response: {
                data: '광고 목록 조회 실패'
            }
        };

        const saga = getAdvertiseListSaga(action);

        saga.next();

        expect(
            saga.throw(error).value
        ).toEqual(
            put(getAdvertiseListFailure('광고 목록 조회 실패'))
        );

        expect(saga.next().done).toBe(true);
    });


    // 광고 상세 조회
    test('광고 상세 조회 성공 시 success action을 실행한다.', () => {

        const action = {
            payload: 1
        };

        const response = {
            data: {
                adId: 1,
                title: '테스트 광고'
            }
        };

        const saga = getAdvertiseDetailSaga(action);

        expect(saga.next().value).toEqual(
            call(getAdvertiseDetail, 1)
        );

        expect(saga.next(response).value).toEqual(
            put(getAdvertiseDetailSuccess(response.data))
        );

        expect(saga.next().done).toBe(true);
    });


    // 광고 등록
    test('광고 등록 성공 시 success action을 실행한다.', () => {

        const formData = new FormData();

        const action = {
            payload: formData
        };

        const response = {
            data: {
                adId: 1,
                title: '새 광고'
            }
        };

        const saga = createAdvertiseSaga(action);

        expect(saga.next().value).toEqual(
            call(createAdvertise, formData)
        );

        expect(saga.next(response).value).toEqual(
            put(createAdvertiseSuccess(response.data))
        );

        expect(saga.next().done).toBe(true);
    });


    // 광고 수정
    test('광고 수정 성공 시 success action을 실행한다.', () => {

        const formData = new FormData();

        const action = {
            payload: {
                adId: 1,
                formData
            }
        };

        const response = {
            data: {
                adId: 1,
                title: '수정된 광고'
            }
        };

        const saga = updateAdvertiseSaga(action);

        expect(saga.next().value).toEqual(
            call(updateAdvertise, 1, formData)
        );

        expect(saga.next(response).value).toEqual(
            put(updateAdvertiseSuccess(response.data))
        );

        expect(saga.next().done).toBe(true);
    });


    // 광고 삭제
    test('광고 삭제 성공 시 success action을 실행한다.', () => {

        const action = {
            payload: 1
        };

        const saga = deleteAdvertiseSaga(action);

        expect(saga.next().value).toEqual(
            call(deleteAdvertise, 1)
        );

        expect(saga.next().value).toEqual(
            put(deleteAdvertiseSuccess())
        );

        expect(saga.next().done).toBe(true);
    });

});