// sagas/__test__/reportSaga.test.js

import { call, put } from 'redux-saga/effects';
import axios from 'axios';  // 외부 연동
import  {
    createReportRequest, createReportSuccess, createReportFailure,
    updateReportRequest, updateReportSuccess, updateReportFailure,
    deleteReportRequest, deleteReportSuccess, deleteReportFailure,
    fetchReportsRequest, fetchReportsSuccess, fetchReportsFailure,
    fetchReportsDetailRequest, fetchReportsDetailSuccess, fetchReportsDetailFailure,
    checkDoubleReportRequest, checkDoubleReportSuccess, checkDoubleReportFailure,
    resetReportState,
    updateAdminReportRequest, updateAdminReportSuccess, updateAdminReportFailure,
    deleteAdminReportRequest, deleteAdminReportSuccess, deleteAdminReportFailure,
    fetchAdminReportsRequest, fetchAdminReportsSuccess, fetchAdminReportsFailure,
    fetchAdminReportsDetailRequest, fetchAdminReportsDetailSuccess, fetchAdminReportsDetailFailure,
    fetchAdminReportAuditLogsRequest, fetchAdminReportAuditLogsSuccess, fetchAdminReportAuditLogsFailure,
    fetchMemberReportTrustInfoRequest, fetchMemberReportTrustInfoSuccess, fetchMemberReportTrustInfoFailure
} from '../../reducers/reportReducer';
import {
    createReportAPI, createReport,
    updateReportAPI, updateReport,
    deleteReportAPI, deleteReport,
    fetchReportsAPI, fetchReports,
    fetchReportsDetailAPI, fetchReportsDetail,
    checkDoubleReportAPI, checkDoubleReport,
    updateAdminReportAPI, updateAdminReport,
    deleteAdminReportAPI, deleteAdminReport,
    fetchAdminReportsAPI, fetchAdminReports,
    fetchAdminReportsDetailAPI, fetchAdminReportsDetail,
    fetchAdminReportAuditLogsAPI, fetchAdminReportAuditLogs,
    fetchMemberReportTrustInfoAPI, fetchMemberReportTrustInfo
} from '../reportSaga';


describe('report saga', ()=> {
    afterEach(()=> {
        jest.clearAllMocks()
    });
    
    // --- 내 신고 목록 조회 ---
    it('fetchReports success', ()=> {
        // 1. 화면요청
        const payload = { memberId: 2, page: 0, size: 10 };
        const generator = fetchReports(fetchReportsRequest(payload));
        expect(generator.next().value.type).toBe('CALL');

        // 2. 결과물받기
        const mockData = {
            reports: [{ reportId: 1, reasonCode: 'SPAM', status: 'PENDING' }],
            totalCount: 1,
            totalPage: 1
        };
        const putStep = generator.next({ data: mockData }).value;

        // 3. 결과물확인
        expect(putStep).toEqual( put(fetchReportsSuccess(mockData)) );
    });

    // --- 사용자 신고 상세 조회 ---
    it('fetchReportsDetail success', ()=> {
        // 1. 화면요청
        const payload = { reportId: 1 };
        const generator = fetchReportsDetail( fetchReportsDetailRequest(payload) );
        expect(generator.next().value.type).toBe('CALL');

        // 2. 결과물받기
        const mockData = {
            reportId: 1,
            targetType: 'MEETUP',
            targetId: 10,
            reasonCode: 'SPAM',
            reasonDetail: '광고성 모임입니다.',
            status: 'PENDING'
        };
        const putStep = generator.next({ data: mockData }).value;

        // 3. 결과물확인
        expect(putStep).toEqual( put(fetchReportsDetailSuccess(mockData)) );
    });

    // --- 신고 작성 ---
    it('createReport success', ()=> {
        // 1. 화면요청
        const payload = {
            memberId: 2,
            dto: {
                targetType: 'MEETUP',
                targetId: 10,
                reasonCode: 'SPAM',
                reasonDetail: '광고성 모임입니다.'
            }
        };
        const generator = createReport( createReportRequest(payload) );
        expect(generator.next().value.type).toBe('CALL');

        // 2. 결과물받기
        const mockData = {
            reportId: 10,
            targetType: 'MEETUP',
            targetId: 10,
            reasonCode: 'SPAM',
            reasonDetail: '광고성 모임입니다.',
            status: 'PENDING'
        };
        const putStep =  generator.next({ data: mockData }).value;

        // 3. 결과물확인
        expect(putStep).toEqual( put(createReportSuccess(mockData)) );
    });

    // --- 신고 수정 ---
    it('updateReport success', ()=> {
        // 1. 화면요청
        const payload = {
            reportId: 10,
            dto: {
                reasonCode: 'ABUSE',
                reasonDetail: '신고 사유 수정'
            }
        };
        const generator = updateReport( updateReportRequest(payload) );
        expect(generator.next().value.type).toBe('CALL');

        // 2. 결과물받기
        const mockData = {
            reportId: 10,
            targetType: 'MEETUP',
            targetId: 10,
            reasonCode: 'ABUSE',
            reasonDetail: '신고 사유 수정',
            status: 'PENDING'
        };
        const putStep = generator.next({ data: mockData }).value;

        // 3. 결과물확인
        expect(putStep).toEqual( put(updateReportSuccess(mockData)) );
    });

    // --- 신고 삭제 ---
    it('deleteReport success', ()=> {
        // 1. 화면요청
        const payload = { reportId: 10 };
        const generator = deleteReport( deleteReportRequest(payload) );
        expect(generator.next().value.type).toBe('CALL');

        // 2. 결과물받기 ( Controller가 삭제된 reportId를 반환 )
        const putStep = generator.next({ data: 10 }).value;

        // 3. 결과물확인
        expect(putStep).toEqual( put(deleteReportSuccess(10)) );
    });

    // --- 중복 신고 확인 ---
    it('checkDoubleReport success', ()=> {
        // 1. 화면요청
        const payload = { memberId: 2, targetType: 'MEETUP', targetId: 10 };
        const generator = checkDoubleReport( checkDoubleReportRequest(payload) );
        expect(generator.next().value.type).toBe('CALL');

        // 2. 결과물받기 ( true = 이미 신고, false = 신고 가능 )
        const mockData = true;
        const putStep = generator.next({ data: mockData }).value;

        // 3. 결과물확인
        expect(putStep).toEqual( put(checkDoubleReportSuccess(mockData)) );
    });




    // --- 관리자 신고 처리 ---
    it('updateAdminReport success', ()=> {
        // 1. 화면요청
        const payload = {
            reportId: 10,
            processDto: {
                status: 'APPROVED',
                processReason: '신고 내용 확인'
            }
        };
        const generator = updateAdminReport( updateAdminReportRequest(payload) );
        expect(generator.next().value.type).toBe('CALL');

        // 2. 결과물받기
        const mockData = {
            reportId: 10,
            targetType: 'MEETUP',
            targetId: 10,
            status: 'APPROVED'
        };
        const putStep = generator.next({ data: mockData }).value;

        // 3. 결과물확인
        expect(putStep).toEqual( put(updateAdminReportSuccess(mockData)) );
    });

    // --- 관리자 신고 삭제 ---
    it('deleteAdminReport success', ()=> {
        // 1. 화면요청
        const payload = { reportId: 10, processReason: '관리자 삭제 처리' };
        const generator = deleteAdminReport( deleteAdminReportRequest(payload) );
        expect(generator.next().value.type).toBe('CALL');

        // 2. 결과물받기
        const putStep = generator.next({ data: 10 }).value;

        // 3. 결과물확인
        expect(putStep).toEqual(put(deleteAdminReportSuccess(10)) );
    });

    // --- 관리자 신고 목록 조회 ---
    it('fetchAdminReports success', ()=> {
        // 1. 화면요청
        const payload = {
            filter: 'PENDING',
            search: 'MEMBER_NICKNAME',
            keyword: 'test',
            page: 0,
            size: 10
        };
        const generator = fetchAdminReports( fetchAdminReportsRequest(payload) );
        expect(generator.next().value.type).toBe('CALL');

        // 2. 결과물받기
        const mockData = {
            reports: [{ reportId: 10, targetType: 'MEETUP', status: 'PENDING'}],
            totalCount: 1,
            totalPage: 1
        };
        const putStep = generator.next({ data: mockData }).value;

        // 3. 결과물확인
        expect(putStep).toEqual( put(fetchAdminReportsSuccess(mockData)) );
    });

    // --- 관리자 신고 상세 조회 ---
    it('fetchAdminReportsDetail success', ()=> {
        // 1. 화면요청
        const payload = { reportId: 10 };
        const generator = fetchAdminReportsDetail( fetchAdminReportsDetailRequest(payload) );
        expect(generator.next().value.type).toBe('CALL');

        // 2. 결과물받기
        const mockData = {
            reportId: 10,
            targetType: 'MEETUP',
            targetId: 10,
            reasonCode: 'SPAM',
            status: 'PENDING'
        };
        const putStep = generator.next({ data: mockData }).value;

        // 3. 결과물확인
        expect(putStep).toEqual( put(fetchAdminReportsDetailSuccess(mockData)) );
    });

    // --- 관리자 신고 처리 로그 조회 ---
    it('fetchAdminReportAuditLogs success', ()=> {
        // 1. 화면요청
        const payload = { reportId: 10 };
        const generator = fetchAdminReportAuditLogs( fetchAdminReportAuditLogsRequest(payload) );
        expect(generator.next().value.type).toBe('CALL');

        // 2. 결과물받기
        const mockData = [{
                auditLogId: 1,
                reportId: 10,
                previousStatus: 'PENDING',
                changedStatus: 'APPROVED',
                processReason: '신고 승인',
                trustScoreChange: -5
        }];
        const putStep = generator.next({ data: mockData }).value;

        // 3. 결과물확인
        expect(putStep).toEqual( put(fetchAdminReportAuditLogsSuccess(mockData)) );
    });

    // --- 신고당한 회원 신뢰도 점수 + 뱃지 조회 ---
    it('fetchMemberReportTrustInfo success', ()=> {
        // 1. 화면요청
        const payload = { targetMemberId: 31 };
        const generator = fetchMemberReportTrustInfo( fetchMemberReportTrustInfoRequest(payload) );
        expect(generator.next().value.type).toBe('CALL');

        // 2. 결과물받기
        const mockData = {
            targetMemberId: 31,
            targetNickname: 'test',
            trustScore: 95,
            reportStatusId: 1,
            statusCode: 'ACTIVE',
            statusName: '정상'
        };
        const putStep = generator.next({ data: mockData }).value;

        // 3. 결과물확인
        expect(putStep).toEqual( put(fetchMemberReportTrustInfoSuccess(mockData)) );
    });
});

// npm test report.test.js