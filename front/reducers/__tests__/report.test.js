//__test__/reportReducer.test.js

import reportReducer, {
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
} from '../reportReducer';

describe('reportReducer', ()=> {
    const initialState= {
        reports: [],                // 전체신고글 목록
        currentReport: null,        // 단건 조회된 상세 신고글
        checkDoubleReport: null,    // 모임,리뷰 중복신고 더블체크
        loading: false,
        error: null,
        success: false,

        auditLogs: [],
        trustInfo: null,

        totalCount: 0,
        totalPage: 0,
    };

    // =====================================================
    // 사용자 신고 목록 조회
    // =====================================================
    it('fetchReportsRequest & fetchReportsSuccess', () => {

        let state = reportReducer(
            initialState,
            fetchReportsRequest()
        );

        expect(state.loading).toBe(true);
        expect(state.success).toBe(false);
        expect(state.error).toBeNull();

        const response = {
            reports: [
                {
                    reportId: 1,
                    reasonDetail: '첫 번째 신고글'
                },
                {
                    reportId: 2,
                    reasonDetail: '두 번째 신고글'
                }
            ],
            totalCount: 2,
            totalPage: 1
        };

        state = reportReducer(
            initialState,
            fetchReportsSuccess(response)
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(true);

        expect(state.reports).toEqual(response.reports);
        expect(state.totalCount).toBe(2);
        expect(state.totalPage).toBe(1);
    });


    it('fetchReportsFailure', () => {

        const state = reportReducer(
            initialState,
            fetchReportsFailure('신고 목록 조회 실패')
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(false);
        expect(state.error).toBe('신고 목록 조회 실패');
    });


    // =====================================================
    // 사용자 신고 상세 조회
    // =====================================================
    it('fetchReportsDetailRequest & fetchReportsDetailSuccess', () => {

        let state = reportReducer(
            initialState,
            fetchReportsDetailRequest()
        );

        expect(state.loading).toBe(true);


        const report = {
            reportId: 1,
            targetType: 'MEETUP',
            targetId: 10,
            reasonCode: 'SPAM',
            reasonDetail: '광고성 게시글입니다.',
            status: 'PENDING'
        };

        state = reportReducer(
            initialState,
            fetchReportsDetailSuccess(report)
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(true);
        expect(state.currentReport).toEqual(report);
    });


    it('fetchReportsDetailFailure', () => {
        const state = reportReducer(
            initialState,
            fetchReportsDetailFailure('신고 상세 조회 실패')
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(false);
        expect(state.error).toBe('신고 상세 조회 실패');
    });



    // =====================================================
    // 사용자 신고 작성
    // =====================================================
    it('createReportRequest & createReportSuccess', () => {

        let state = reportReducer(
            initialState,
            createReportRequest()
        );

        expect(state.loading).toBe(true);
        expect(state.success).toBe(false);
        expect(state.error).toBeNull();


        const newReport = {
            reportId: 1,
            targetType: 'MEETUP',
            targetId: 10,
            reasonCode: 'SPAM',
            reasonDetail: '광고성 게시글',
            status: 'PENDING'
        };

        state = reportReducer(
            initialState,
            createReportSuccess(newReport)
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(true);

        // unshift로 목록 맨 앞에 들어가는지 확인
        expect(state.reports[0]).toEqual(newReport);
        expect(state.reports).toHaveLength(1);
    });


    it('createReportFailure', () => {
        const state = reportReducer(
            initialState,
            createReportFailure('신고글 작성 실패')
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(false);
        expect(state.error).toBe('신고글 작성 실패');
    });



    // =====================================================
    // 사용자 신고 수정
    // =====================================================
    it('updateReportRequest & updateReportSuccess', () => {
        let state = reportReducer(
            initialState,
            updateReportRequest()
        );

        expect(state.loading).toBe(true);


        const prev = {
            ...initialState,

            reports: [
                {
                    reportId: 3,
                    reasonCode: 'SPAM',
                    reasonDetail: '신고글 수정 전'
                }
            ]
        };


        const updated = {
            reportId: 3,
            reasonCode: 'ABUSE',
            reasonDetail: '신고글 수정 후'
        };


        state = reportReducer(
            prev,
            updateReportSuccess(updated)
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(true);

        expect(state.currentReport).toEqual(updated);

        expect(state.reports[0]).toEqual(updated);
        expect(state.reports[0].reasonDetail)
            .toBe('신고글 수정 후');
    });


    it('updateReportFailure', () => {
        const state = reportReducer(
            initialState,
            updateReportFailure('신고글 수정 실패')
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(false);
        expect(state.error).toBe('신고글 수정 실패');
    });



    // =====================================================
    // 사용자 신고 삭제
    // =====================================================
    it('deleteReportRequest & deleteReportSuccess', () => {

        let state = reportReducer(
            initialState,
            deleteReportRequest()
        );

        expect(state.loading).toBe(true);


        const prev = {
            ...initialState,

            reports: [
                {
                    reportId: 1,
                    reasonDetail: '삭제할 신고'
                },
                {
                    reportId: 2,
                    reasonDetail: '남아 있을 신고'
                }
            ]
        };


        state = reportReducer(
            prev,
            deleteReportSuccess(1)
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(true);

        expect(state.reports).toHaveLength(1);
        expect(state.reports[0].reportId).toBe(2);
    });


    it('deleteReportFailure', () => {
        const state = reportReducer(
            initialState,
            deleteReportFailure('신고글 삭제 실패')
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(false);
        expect(state.error).toBe('신고글 삭제 실패');
    });



    // =====================================================
    // 중복 신고 확인
    // =====================================================
    it('checkDoubleReportRequest & checkDoubleReportSuccess', () => {

        let state = reportReducer(
            initialState,
            checkDoubleReportRequest()
        );

        expect(state.loading).toBe(true);


        // true = 이미 신고한 대상
        state = reportReducer(
            initialState,
            checkDoubleReportSuccess(true)
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(true);
        expect(state.checkDoubleReport).toBe(true);
    });


    it('checkDoubleReportFailure', () => {
        const state = reportReducer(
            initialState,
            checkDoubleReportFailure('중복 신고 확인 실패')
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(false);
        expect(state.error).toBe('중복 신고 확인 실패');
    });



    // =====================================================
    // 관리자 신고 상태 변경
    // =====================================================
    it('updateAdminReportRequest & updateAdminReportSuccess', () => {

        let state = reportReducer(
            initialState,
            updateAdminReportRequest()
        );

        expect(state.loading).toBe(true);


        const prev = {
            ...initialState,

            reports: [
                {
                    reportId: 1,
                    status: 'PENDING'
                }
            ]
        };


        const updatedReport = {
            reportId: 1,
            status: 'APPROVED'
        };


        state = reportReducer(
            prev,
            updateAdminReportSuccess(updatedReport)
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(true);

        expect(state.currentReport)
            .toEqual(updatedReport);

        expect(state.reports[0].status)
            .toBe('APPROVED');
    });


    it('updateAdminReportFailure', () => {
        const state = reportReducer(
            initialState,
            updateAdminReportFailure('관리자 신고 처리 실패')
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(false);
        expect(state.error).toBe('관리자 신고 처리 실패');
    });



    // =====================================================
    // 관리자 신고 삭제
    // =====================================================
    it('deleteAdminReportRequest & deleteAdminReportSuccess', () => {

        let state = reportReducer(
            initialState,
            deleteAdminReportRequest()
        );

        expect(state.loading).toBe(true);


        const prev = {
            ...initialState,

            reports: [
                { reportId: 1 },
                { reportId: 2 }
            ]
        };


        state = reportReducer(
            prev,
            deleteAdminReportSuccess(1)
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(true);

        expect(state.reports).toHaveLength(1);
        expect(state.reports[0].reportId).toBe(2);
    });


    it('deleteAdminReportFailure', () => {

        const state = reportReducer(
            initialState,
            deleteAdminReportFailure('관리자 신고 삭제 실패')
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(false);
        expect(state.error).toBe('관리자 신고 삭제 실패');
    });



    // =====================================================
    // 관리자 신고 목록 조회
    // =====================================================
    it('fetchAdminReportsRequest & fetchAdminReportsSuccess', () => {

        let state = reportReducer(
            initialState,
            fetchAdminReportsRequest()
        );

        expect(state.loading).toBe(true);


        const response = {
            reports: [
                { reportId: 10, status: 'PENDING' },
                { reportId: 9, status: 'APPROVED' }
            ],

            totalCount: 20,
            totalPage: 2
        };


        state = reportReducer(
            initialState,
            fetchAdminReportsSuccess(response)
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(true);

        expect(state.reports).toEqual(response.reports);
        expect(state.totalCount).toBe(20);
        expect(state.totalPage).toBe(2);
    });


    it('fetchAdminReportsFailure', () => {
        const state = reportReducer(
            initialState,
            fetchAdminReportsFailure('관리자 신고 목록 조회 실패')
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(false);
        expect(state.error).toBe('관리자 신고 목록 조회 실패');
    });



    // =====================================================
    // 관리자 신고 상세 조회
    // =====================================================
    it('fetchAdminReportsDetailRequest & fetchAdminReportsDetailSuccess', () => {

        let state = reportReducer(
            initialState,
            fetchAdminReportsDetailRequest()
        );

        expect(state.loading).toBe(true);


        const report = {
            reportId: 1,
            status: 'PENDING',
            reasonCode: 'SPAM'
        };


        state = reportReducer(
            initialState,
            fetchAdminReportsDetailSuccess(report)
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(true);

        expect(state.currentReport).toEqual(report);
    });


    it('fetchAdminReportsDetailFailure', () => {
        const state = reportReducer(
            initialState,
            fetchAdminReportsDetailFailure(
                '관리자 신고 상세 조회 실패'
            )
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(false);
        expect(state.error)
            .toBe('관리자 신고 상세 조회 실패');
    });



    // =====================================================
    // 관리자 감사 로그 조회
    // =====================================================
    it('fetchAdminReportAuditLogsRequest & fetchAdminReportAuditLogsSuccess', () => {

        let state = reportReducer(
            initialState,
            fetchAdminReportAuditLogsRequest()
        );

        expect(state.loading).toBe(true);


        const logs = [
            {
                auditLogId: 1,
                previousStatus: 'PENDING',
                changedStatus: 'APPROVED',
                processReason: '신고 승인 처리'
            }
        ];


        state = reportReducer(
            initialState,
            fetchAdminReportAuditLogsSuccess(logs)
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(true);

        expect(state.auditLogs).toEqual(logs);
        expect(state.auditLogs).toHaveLength(1);
    });


    it('fetchAdminReportAuditLogsFailure', () => {
        const state = reportReducer(
            initialState,
            fetchAdminReportAuditLogsFailure(
                '감사 로그 조회 실패'
            )
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(false);
        expect(state.error).toBe('감사 로그 조회 실패');
    });



    // =====================================================
    // 신고 대상 회원 신뢰도 조회
    // =====================================================
    it('fetchMemberReportTrustInfoRequest & fetchMemberReportTrustInfoSuccess', () => {

        let state = reportReducer(
            initialState,
            fetchMemberReportTrustInfoRequest()
        );

        expect(state.loading).toBe(true);


        const trustInfo = {
            targetMemberId: 30,
            targetNickname: 'testUser',
            trustScore: 95,
            reportStatusId: 1,
            statusCode: 'ACTIVE',
            statusName: '정상'
        };


        state = reportReducer(
            initialState,
            fetchMemberReportTrustInfoSuccess(trustInfo)
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(true);

        expect(state.trustInfo).toEqual(trustInfo);
        expect(state.trustInfo.trustScore).toBe(95);
    });


    it('fetchMemberReportTrustInfoFailure', () => {
        const state = reportReducer(
            initialState,
            fetchMemberReportTrustInfoFailure(
                '신뢰도 점수 조회 실패'
            )
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(false);
        expect(state.error)
            .toBe('신뢰도 점수 조회 실패');
    });

    // =====================================================
    // 상태 초기화
    // =====================================================
    it('resetReportState', () => {
        const prev = {
            ...initialState,
            loading: true,
            success: true,
            error: 'error'
        };
        const state = reportReducer(
            prev,
            resetReportState()
        );

        expect(state.loading).toBe(false);
        expect(state.success).toBe(false);
        expect(state.error).toBeNull();
    });
});

// npx jest reducers/__tests__/report.test.js