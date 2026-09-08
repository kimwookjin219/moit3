import axios from 'axios';

import {
    getAdvertiseList,
    getAdvertiseDetail,
    createAdvertise,
    updateAdvertise,
    deleteAdvertise,
} from '../advertiseApi';


// axios 요청을 실제 서버로 보내지 않도록 mock
jest.mock('axios');


describe('advertiseApi', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    test('내 광고 목록을 조회한다.', async () => {

        const response = {
            data: {
                content: [],
                totalCnt: 0,
                page: 1,
                size: 10,
            },
        };

        axios.get.mockResolvedValue(response);

        const result = await getAdvertiseList({
            page: 1,
            size: 10,
        });

        expect(axios.get).toHaveBeenCalledWith(
            'http://localhost:8080/api/advertisement',
            {
                params: {
                    page: 1,
                    size: 10,
                },
            }
        );

        expect(result).toEqual(response);
    });


    test('광고 상세 정보를 조회한다.', async () => {

        const response = {
            data: {
                adId: 1,
                title: '테스트 광고',
            },
        };

        axios.get.mockResolvedValue(response);

        const result = await getAdvertiseDetail(1);

        expect(axios.get).toHaveBeenCalledWith(
            'http://localhost:8080/api/advertisement/1'
        );

        expect(result).toEqual(response);
    });


    test('광고를 등록한다.', async () => {

        const formData = new FormData();

        axios.post.mockResolvedValue({
            data: {
                adId: 1,
            },
        });

        await createAdvertise(formData);

        expect(axios.post).toHaveBeenCalledWith(
            'http://localhost:8080/api/advertisement',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    });


    test('광고를 수정한다.', async () => {

        const formData = new FormData();

        axios.put.mockResolvedValue({
            data: {
                adId: 1,
            },
        });

        await updateAdvertise(1, formData);

        expect(axios.put).toHaveBeenCalledWith(
            'http://localhost:8080/api/advertisement/1',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    });


    test('광고를 삭제한다.', async () => {

        axios.delete.mockResolvedValue({
            status: 204,
        });

        await deleteAdvertise(1);

        expect(axios.delete).toHaveBeenCalledWith(
            'http://localhost:8080/api/advertisement/1'
        );
    });

});