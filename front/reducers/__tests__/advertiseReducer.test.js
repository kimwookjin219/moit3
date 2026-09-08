import reducer, {
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
} from '../advertiseReducer';


describe('advertiseReducer', () => {

    // 초기 상태
    test('초기 상태를 확인한다.', () => {

        const state = reducer(undefined, {});

        expect(state).toEqual({
            advertisements: [],
            totalCnt: 0,
            page: 1,
            size: 10,
            advertisement: null,
            loading: false,
            error: null,
        });
    });


    // 광고 목록 조회
    test('광고 목록 조회 요청 시 loading이 true가 된다.', () => {

        const state = reducer(
            undefined,
            getAdvertiseListRequest()
        );

        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
    });


    test('광고 목록 조회 성공 시 광고 목록이 저장된다.', () => {

        const payload = {
            list: [
                {
                    adId: 1,
                    title: '첫 번째 광고',
                },
                {
                    adId: 2,
                    title: '두 번째 광고',
                },
            ],
            totalCnt: 2,
            page: 1,
            size: 10,
        };

        const state = reducer(
            undefined,
            getAdvertiseListSuccess(payload)
        );

        expect(state.loading).toBe(false);
        expect(state.advertisements).toEqual(payload.list);
        expect(state.totalCnt).toBe(2);
        expect(state.page).toBe(1);
        expect(state.size).toBe(10);
    });


    test('광고 목록 조회 실패 시 error가 저장된다.', () => {

        const error = '광고 목록 조회 실패';

        const state = reducer(
            undefined,
            getAdvertiseListFailure(error)
        );

        expect(state.loading).toBe(false);
        expect(state.error).toBe(error);
    });


    // 광고 상세 조회
    test('광고 상세 조회 요청 시 loading이 true가 된다.', () => {

        const state = reducer(
            undefined,
            getAdvertiseDetailRequest()
        );

        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
    });


    test('광고 상세 조회 성공 시 광고 정보가 저장된다.', () => {

        const advertisement = {
            adId: 1,
            title: '테스트 광고',
            advertiserId: 1,
        };

        const state = reducer(
            undefined,
            getAdvertiseDetailSuccess(advertisement)
        );

        expect(state.loading).toBe(false);
        expect(state.advertisement).toEqual(advertisement);
    });


    test('광고 상세 조회 실패 시 error가 저장된다.', () => {

        const error = '광고 상세 조회 실패';

        const state = reducer(
            undefined,
            getAdvertiseDetailFailure(error)
        );

        expect(state.loading).toBe(false);
        expect(state.error).toBe(error);
    });


    // 광고 등록
    test('광고 등록 요청 시 loading이 true가 된다.', () => {

        const state = reducer(
            undefined,
            createAdvertiseRequest()
        );

        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
    });


    test('광고 등록 성공 시 등록된 광고가 저장된다.', () => {

        const advertisement = {
            adId: 1,
            title: '새 광고',
        };

        const state = reducer(
            undefined,
            createAdvertiseSuccess(advertisement)
        );

        expect(state.loading).toBe(false);
        expect(state.advertisement).toEqual(advertisement);
    });


    test('광고 등록 실패 시 error가 저장된다.', () => {

        const error = '광고 등록 실패';

        const state = reducer(
            undefined,
            createAdvertiseFailure(error)
        );

        expect(state.loading).toBe(false);
        expect(state.error).toBe(error);
    });


    // 광고 수정
    test('광고 수정 요청 시 loading이 true가 된다.', () => {

        const state = reducer(
            undefined,
            updateAdvertiseRequest()
        );

        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
    });


    test('광고 수정 성공 시 수정된 광고가 저장된다.', () => {

        const advertisement = {
            adId: 1,
            title: '수정된 광고',
        };

        const state = reducer(
            undefined,
            updateAdvertiseSuccess(advertisement)
        );

        expect(state.loading).toBe(false);
        expect(state.advertisement).toEqual(advertisement);
    });


    test('광고 수정 실패 시 error가 저장된다.', () => {

        const error = '광고 수정 실패';

        const state = reducer(
            undefined,
            updateAdvertiseFailure(error)
        );

        expect(state.loading).toBe(false);
        expect(state.error).toBe(error);
    });


    // 광고 삭제
    test('광고 삭제 요청 시 loading이 true가 된다.', () => {

        const state = reducer(
            undefined,
            deleteAdvertiseRequest()
        );

        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
    });


    test('광고 삭제 성공 시 상세 광고가 초기화된다.', () => {

        const initialState = {
            advertisements: [],
            totalCnt: 0,
            page: 1,
            size: 10,
            advertisement: {
                adId: 1,
                title: '삭제할 광고',
            },
            loading: true,
            error: null,
        };

        const state = reducer(
            initialState,
            deleteAdvertiseSuccess()
        );

        expect(state.loading).toBe(false);
        expect(state.advertisement).toBe(null);
    });


    test('광고 삭제 실패 시 error가 저장된다.', () => {

        const error = '광고 삭제 실패';

        const state = reducer(
            undefined,
            deleteAdvertiseFailure(error)
        );

        expect(state.loading).toBe(false);
        expect(state.error).toBe(error);
    });

});