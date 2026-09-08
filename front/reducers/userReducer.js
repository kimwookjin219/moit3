import { createSlice } from "@reduxjs/toolkit";

//1. 초기화 상태(공용)
const initialState = {
    user: null,    
    isInitialized: false,
    point: 0,
    members: [],

    accessToken: null,
    refreshToken: null,
    deviceId: null,

    // =========================
    // 로그인 상태
    // =========================
    login: {
        loading: false,
        success: false,
        error: null,
    },

    // =========================
    // 회원가입 상태
    // =========================
    signup: {
        loading: false,
        success: false,
        error: null,
    },

    // =========================
    // 회원가입 행동 AI 분석
    // =========================
    signupBehaviorAnalysis: {

            loginId: {
            failCount: 0,
            requested: false,
            loading: false,
            result: null,
            error: null,
        },

        password: {
            failCount: 0,
            requested: false,
            loading: false,
            result: null,
            error: null,
        },

        email: {
            failCount: 0,
            requested: false,
            loading: false,
            result: null,
            error: null,
        },

        emailVerification: {
            failCount: 0,
            requested: false,
            loading: false,
            result: null,
            error: null,
        },

        nickname: {
            failCount: 0,
            requested: false,
            loading: false,
            result: null,
            error: null,
        },

        mobile: {
            failCount: 0,
            requested: false,
            loading: false,
            result: null,
            error: null,
        },

        mobileVerification: {
            failCount: 0,
            requested: false,
            loading: false,
            result: null,
            error: null,
        },

        birth: {
            failCount: 0,
            requested: false,
            loading: false,
            result: null,
            error: null,
        },

        interestIds: {
            failCount: 0,
            requested: false,
            loading: false,
            result: null,
            error: null,
        },

    },

    // =========================
    // 공통 사용자 조회 상태
    // =========================
    loading: false,
    error: null,

    // =========================
    // 전체 회원 조회
    // =========================
    membersLoading: false,
    membersError: null,

    // =========================
    // 중복확인
    // =========================
    duplicateCheck: {
        loginId: null,
        email: null,
        nickname: null,
    },

    // =========================
    // 이메일 인증
    // =========================
    emailVerification: {
        sending: false,
        verifying: false,
        sent: false,
        verified: false,
        error: null,
    },

    // =========================
    // 전화번호 인증
    // =========================
    mobileVerification: {
        sending: false,
        verifying: false,
        sent: false,
        verified: false,
        error: null,
    },

    // =========================
    // 비밀번호 유출 검사
    // =========================
    passwordLeak: {
        checking: false,
        checked: false,
        leaked: false,
        count: 0,
        error: null,
    },

    // =========================
    // 아이디 찾기
    // =========================
    findId: {
        loading: false,
        result: null,
        error: null,
    },

    // =========================
    // 비밀번호 찾기
    // =========================
    findPassword: {
        loading: false,
        success: false,
        error: null,
    },

    // =========================
    // 마이페이지 비밀번호 변경
    // =========================
    changePassword: {
        loading: false,
        success: false,
        error: null,
    },

    // =========================
    // 회원정보 수정
    // =========================
    updateMyInfo: {
        loading: false,
        success: false,
        error: null,
    },

    // =========================
    // 프로필 이미지 업로드
    // =========================
    profileImage: {
        loading: false,
        success: false,
        error: null,
    },

    // =========================
    // 회원 탈퇴
    // =========================
    deleteAccount: {
        loading: false,
        success: false,
        error: null,
    },

    // 로그아웃
    logout: {
        loading: false,
        success: false,
        error: null,
    },

    // 로그인 기록 조회
    loginHistory: {
        loading: false,
        data: [],
        error: null,
    },

    // =========================
    // 로그인 기기 관리
    // =========================
    loginDevices: {
        loading: false,
        data: [],
        error: null,
    },

    // 특정 기기 로그아웃
    deleteLoginDevice: {
        loading: false,
        success: false,
        error: null,
    },

    // 모든 기기 로그아웃
    deleteAllLoginDevices: {
        loading: false,
        success: false,
        error: null,
    },

    // =========================
    // 포인트
    // =========================
    pointHistory: {
        loading: false,
        data: [],
        error: null,
    },
    // =========================
    // 출석체크
    // =========================
    attendance: {
        // 출석체크
        loading: false,
        success: false,
        attendedToday: false,
        point: 0,
        currentPoint: 0,
        error: null,

        // 출석 기록 조회
        historyLoading: false,
        history: [],
        historyError: null,
    },

};

//2. 상태변화
const userReducer = createSlice({
    name: "user",
    initialState,
    reducers: {

        // =================================================
        // 로그인
        // =================================================
        loginRequest: (state) => {
            state.login.loading = true;
            state.login.success = false;
            state.login.error = null;
        },

        loginSuccess: (state, action) => {
            state.login.loading = false;
            state.login.success = true;
            state.login.error = null;

            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.deviceId = action.payload.deviceId || null;
            
            state.user = {
                memberId: action.payload.memberId,
                loginId: action.payload.loginId,
                memberTypeId: action.payload.memberTypeId,
            };
        },

        loginFailure: (state, action) => {
            state.login.loading = false;
            state.login.success = false;
            state.login.error = action.payload;
           
        },

        // =========================
        // 내 정보 조회
        // =========================
        getMyInfoRequest: (state)=>{
            state.loading = true;
            state.error = null;
        },
        getMyInfoSuccess: (state,action)=>{
            state.loading = false;
            state.error = null;
            state.user = action.payload;
            
            state.isInitialized = true;

            state.point = Number(action.payload.point) || 0;
        },
        getMyInfoFailure: (state,action)=>{
            state.loading = false;
            state.error = action.payload;
        },

        // =========================
        // 마이페이지 조회
        // =========================
        getMyPageRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        getMyPageSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.user = action.payload;
        },

        getMyPageFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // =================================================
        // 회원가입
        // =================================================
        signupRequest: (state) => {
            state.signup.loading = true;
            state.signup.success = false;
            state.signup.error = null;
        },

        signupSuccess: (state) => {
            state.signup.loading = false;
            state.signup.success = true;
            state.signup.error = null;
        },

        signupFailure: (state, action) => {
            state.signup.loading = false;
            state.signup.success = false;
            state.signup.error = action.payload;
        },
        resetSignup: (state) => {
            state.signup = {
                loading: false,
                success: false,
                error: null,
            };
        },

        // =========================
        // 회원가입 행동 AI 분석
        // =========================

        // 실패 횟수 증가
        recordSignupBehaviorFailure: (state, action) => {

            const { field } = action.payload;

            if (!state.signupBehaviorAnalysis[field]) {
                return;
            }
            console.log(
                "===== recordSignupBehaviorFailure 호출 =====",
                field,
                "현재:",
                state.signupBehaviorAnalysis[field].failCount
            );

            state.signupBehaviorAnalysis[field].failCount += 1;

            console.log(
                "증가 후:",
                state.signupBehaviorAnalysis[field].failCount
            );
        },

        // AI 분석 요청
        analyzeSignupBehaviorRequest: (state, action) => {

            const { field } = action.payload;

            if (!state.signupBehaviorAnalysis[field]) {
                return;
            }

            state.signupBehaviorAnalysis[field].loading = true;
            state.signupBehaviorAnalysis[field].error = null;
            state.signupBehaviorAnalysis[field].requested = true;
        },

        // AI 분석 성공
        analyzeSignupBehaviorSuccess: (state, action) => {

            const { field, result } = action.payload;

            if (!state.signupBehaviorAnalysis[field]) {
                return;
            }

            state.signupBehaviorAnalysis[field].loading = false;
            state.signupBehaviorAnalysis[field].result = result;
            state.signupBehaviorAnalysis[field].error = null;
        },

        // AI 분석 실패
        analyzeSignupBehaviorFailure: (state, action) => {

            const { field, error } = action.payload;

            if (!state.signupBehaviorAnalysis[field]) {
                return;
            }

            state.signupBehaviorAnalysis[field].loading = false;
            state.signupBehaviorAnalysis[field].error =
                error || "AI 분석에 실패했습니다.";
        },

        // AI 분석 상태 전체 초기화
        resetSignupBehaviorAnalysis: (state) => {

            state.signupBehaviorAnalysis = {

                loginId: {
                    failCount: 0,
                    requested: false,
                    loading: false,
                    result: null,
                    error: null,
                },

                password: {
                    failCount: 0,
                    requested: false,
                    loading: false,
                    result: null,
                    error: null,
                },

                email: {
                    failCount: 0,
                    requested: false,
                    loading: false,
                    result: null,
                    error: null,
                },

                emailVerification: {
                    failCount: 0,
                    requested: false,
                    loading: false,
                    result: null,
                    error: null,
                },

                nickname: {
                    failCount: 0,
                    requested: false,
                    loading: false,
                    result: null,
                    error: null,
                },

                mobile: {
                    failCount: 0,
                    requested: false,
                    loading: false,
                    result: null,
                    error: null,
                },

                mobileVerification: {
                    failCount: 0,
                    requested: false,
                    loading: false,
                    result: null,
                    error: null,
                },

                birth: {
                    failCount: 0,
                    requested: false,
                    loading: false,
                    result: null,
                    error: null,
                },

                interestIds: {
                    failCount: 0,
                    requested: false,
                    loading: false,
                    result: null,
                    error: null,
                },

            };
        },

        // =========================
        // 비밀번호 유출 검사
        // =========================

        checkPasswordLeakRequest: (state) => {
            state.passwordLeak.checking = true;
            state.passwordLeak.checked = false;
            state.passwordLeak.leaked = false;
            state.passwordLeak.count = 0;
            state.passwordLeak.error = null;
        },
        checkPasswordLeakSuccess: (state, action) => {
            state.passwordLeak.checking = false;
            state.passwordLeak.checked = true;
            state.passwordLeak.leaked = action.payload.leaked;
            state.passwordLeak.count = action.payload.count;
            state.passwordLeak.error = null;
        },
        checkPasswordLeakFailure: (state, action) => {
            state.passwordLeak.checking = false;
            state.passwordLeak.checked = false;
            state.passwordLeak.error = action.payload;
        },

        // =========================
        // 이메일 인증번호 발송
        // =========================
        emailSendRequest: (state)=>{
            state.emailVerification.sending = true;
            state.emailVerification.sent = false;
            state.emailVerification.verified = false;
            state.emailVerification.error = null;
        },
        emailSendSuccess: (state)=>{
            state.emailVerification.sending = false;
            state.emailVerification.sent = true;
            state.emailVerification.verified = false;
            state.emailVerification.error = null;
        },
        emailSendFailure: (state,action)=>{
            state.emailVerification.sending = false;
            state.emailVerification.sent = false;
            state.emailVerification.verified = false;
            state.emailVerification.error = action.payload;
        },

        // =========================
        // 이메일 인증번호 확인
        // =========================
        emailVerifyRequest: (state)=>{
            state.emailVerification.verifying = true;
            state.emailVerification.verified = false;
            state.emailVerification.error = null;
        },
        emailVerifySuccess: (state)=>{
            state.emailVerification.verifying = false;
            state.emailVerification.verified = true;
            state.emailVerification.error = null;
        },
        emailVerifyFailure: (state,action)=>{
            state.emailVerification.verifying = false;
            state.emailVerification.verified = false;
            state.emailVerification.error = action.payload;
        },

        // =========================
        // 아이디 중복검사
        // =========================
        checkLoginIdRequest: (state)=>{
            state.loading = true;
            state.error = null;
            state.duplicateCheck.loginId = null;
        },
        checkLoginIdSuccess: (state,action)=>{
            state.loading = false;
            state.error = null;
            state.duplicateCheck.loginId = action.payload;
        },
        checkLoginIdFailure: (state,action)=>{
            state.loading = false;
            state.error = action.payload;
            state.duplicateCheck.loginId = null;
        },

        // =========================
        // 이메일 중복검사
        // =========================
        checkEmailRequest: (state)=>{
            state.loading = true;
            state.error = null;
            state.duplicateCheck.email = null;
        },
        checkEmailSuccess: (state,action)=>{
            state.loading = false;
            state.error = null;
            state.duplicateCheck.email = action.payload;
        },
        checkEmailFailure: (state,action)=>{
            state.loading = false;
            state.error = action.payload;
            state.duplicateCheck.email = null;
        },

        // =========================
        // 닉네임 중복검사
        // =========================
        checkNicknameRequest: (state)=>{
            state.loading = true;
            state.error = null;
            state.duplicateCheck.nickname = null;
        },
        checkNicknameSuccess: (state,action)=>{
            state.loading = false;
            state.error = null;
            state.duplicateCheck.nickname = action.payload;
        },
        checkNicknameFailure: (state,action)=>{
            state.loading = false;
            state.error = action.payload;
            state.duplicateCheck.nickname = null;
        },

        // =========================
        // 전화번호 인증번호 발송
        // =========================
        mobileSendRequest: (state) => {
            state.mobileVerification.sending = true;
            state.mobileVerification.sent = false;
            state.mobileVerification.verified = false;
            state.mobileVerification.error = null;
        },

        mobileSendSuccess: (state) => {
            state.mobileVerification.sending = false;
            state.mobileVerification.sent = true;
            state.mobileVerification.verified = false;
            state.mobileVerification.error = null;
        },

        mobileSendFailure: (state, action) => {
            state.mobileVerification.sending = false;
            state.mobileVerification.sent = false;
            state.mobileVerification.verified = false;
            state.mobileVerification.error = action.payload;
        },

        // =========================
        // 전화번호 인증번호 확인
        // =========================
        mobileVerifyRequest: (state) => {
            state.mobileVerification.verifying = true;
            state.mobileVerification.verified = false;
            state.mobileVerification.error = null;
        },

        mobileVerifySuccess: (state) => {
            state.mobileVerification.verifying = false;
            state.mobileVerification.verified = true;
            state.mobileVerification.error = null;
        },

        mobileVerifyFailure: (state, action) => {
            state.mobileVerification.verifying = false;
            state.mobileVerification.verified = false;
            state.mobileVerification.error = action.payload;
        },

        // =========================
        // 전화번호 인증 상태 초기화
        // =========================
        resetMobileVerification: (state) => {
            state.mobileVerification = {
                sending: false,
                verifying: false,
                sent: false,
                verified: false,
                error: null,
            };
        },

        // =========================
        // 전체 회원 조회
        // =========================
        findMembersRequest: (state) => {
            state.membersLoading = true;
            state.membersError = null;
        },
        findMembersSuccess: (state, action) => {
            state.membersLoading = false;
            state.members = action.payload;
            state.membersError = null;
        },
        findMembersFailure: (state, action) => {
            state.membersLoading = false;
            state.membersError = action.payload;
        },

        // =========================
        // 로그인 기록 조회
        // =========================
        getLoginHistoryRequest: (state) => {
            state.loginHistory.loading = true;
            state.loginHistory.error = null;
        },
        getLoginHistorySuccess: (state, action) => {
            state.loginHistory.loading = false;
            state.loginHistory.data = action.payload;
            state.loginHistory.error = null;
        },
        getLoginHistoryFailure: (state, action) => {
            state.loginHistory.loading = false;
            state.loginHistory.error = action.payload;
        },
        // =========================
        // 로그인 기록 조회 상태 초기화
        // =========================
        resetLoginHistory: (state) => {
            state.loginHistory = {
                loading: false,
                data: [],
                error: null,
            };
        },

        // =========================
        // 로그인 기기 조회
        // =========================
        getLoginDevicesRequest: (state) => {
            state.loginDevices.loading = true;
            state.loginDevices.error = null;
        },

        getLoginDevicesSuccess: (state, action) => {
            state.loginDevices.loading = false;
            state.loginDevices.data = action.payload;
            state.loginDevices.error = null;
        },

        getLoginDevicesFailure: (state, action) => {
            state.loginDevices.loading = false;
            state.loginDevices.error = action.payload;
        },

        // =========================
        // 특정 기기 로그아웃
        // =========================
        deleteLoginDeviceRequest: (state) => {
            state.deleteLoginDevice.loading = true;
            state.deleteLoginDevice.success = false;
            state.deleteLoginDevice.error = null;
        },

        deleteLoginDeviceSuccess: (state) => {
            state.deleteLoginDevice.loading = false;
            state.deleteLoginDevice.success = true;
            state.deleteLoginDevice.error = null;
        },

        deleteLoginDeviceFailure: (state, action) => {
            state.deleteLoginDevice.loading = false;
            state.deleteLoginDevice.success = false;
            state.deleteLoginDevice.error = action.payload;
        },

        resetDeleteLoginDevice: (state) => {
            state.deleteLoginDevice = {
                loading: false,
                success: false,
                error: null,
            };
        },

        // =========================
        // 모든 기기 로그아웃
        // =========================
        deleteAllLoginDevicesRequest: (state) => {
            state.deleteAllLoginDevices.loading = true;
            state.deleteAllLoginDevices.success = false;
            state.deleteAllLoginDevices.error = null;
        },

        deleteAllLoginDevicesSuccess: (state) => {
            state.deleteAllLoginDevices.loading = false;
            state.deleteAllLoginDevices.success = true;
            state.deleteAllLoginDevices.error = null;
        },

        deleteAllLoginDevicesFailure: (state, action) => {
            state.deleteAllLoginDevices.loading = false;
            state.deleteAllLoginDevices.success = false;
            state.deleteAllLoginDevices.error = action.payload;
        },

        resetDeleteAllLoginDevices: (state) => {
            state.deleteAllLoginDevices = {
                loading: false,
                success: false,
                error: null,
            };
        },

        // =========================
        // 로그인 기기 조회 상태 초기화
        // =========================
        resetLoginDevices: (state) => {
            state.loginDevices = {
                loading: false,
                data: [],
                error: null,
            };
        },

        // =========================
        // 아이디 찾기
        // =========================
        findIdRequest: (state) => {
            state.findId.loading = true;
            state.findId.result = null;
            state.findId.error = null;
        },
        findIdSuccess: (state, action) => {
            state.findId.loading = false;
            state.findId.result = action.payload;
            state.findId.error = null;
        },
        findIdFailure: (state, action) => {
            state.findId.loading = false;
            state.findId.result = null;
            state.findId.error = action.payload;
        },
        resetFindId: (state) => {
            state.findId = {
                loading: false,
                result: null,
                error: null,
            };
        },
        findIdEmailSendRequest: (state) => {
            state.emailVerification.sending = true;
            state.emailVerification.sent = false;
            state.emailVerification.verified = false;
            state.emailVerification.error = null;
        },
        // =========================
        // 비밀번호 찾기
        // =========================
        findPasswordRequest: (state) => {
            state.findPassword.loading = true;
            state.findPassword.success = false;
            state.findPassword.error = null;
        },
        findPasswordSuccess: (state) => {
            state.findPassword.loading = false;
            state.findPassword.success = true;
            state.findPassword.error = null;
        },
        findPasswordFailure: (state, action) => {
            state.findPassword.loading = false;
            state.findPassword.success = false;
            state.findPassword.error = action.payload;
        },
        resetFindPassword: (state) => {
            state.findPassword = {
                loading: false,
                success: false,
                error: null,
            };
        },
        findPasswordEmailSendRequest: (state) => {
            state.emailVerification.sending = true;
            state.emailVerification.sent = false;
            state.emailVerification.verified = false;
            state.emailVerification.error = null;
        },
        // =========================
        // 마이페이지 비밀번호 변경
        // =========================
        changePasswordRequest: (state) => {
            state.changePassword.loading = true;
            state.changePassword.success = false;
            state.changePassword.error = null;
        },
        changePasswordSuccess: (state) => {
            state.changePassword.loading = false;
            state.changePassword.success = true;
            state.changePassword.error = null;
        },
        changePasswordFailure: (state, action) => {
            state.changePassword.loading = false;
            state.changePassword.success = false;
            state.changePassword.error = action.payload;
        },
        resetChangePassword: (state) => {
            state.changePassword = {
                loading: false,
                success: false,
                error: null,
            };
        },
        // =========================
        // 회원정보 수정
        // =========================
        updateMyInfoRequest: (state) => {
            state.updateMyInfo.loading = true;
            state.updateMyInfo.success = false;
            state.updateMyInfo.error = null;
        },
        updateMyInfoSuccess: (state, action) => {
            state.updateMyInfo.loading = false;
            state.updateMyInfo.success = true;
            state.updateMyInfo.error = null;

            // 수정된 회원정보로 Redux user 갱신
            state.user = action.payload;
        },
        updateMyInfoFailure: (state, action) => {
            state.updateMyInfo.loading = false;
            state.updateMyInfo.success = false;
            state.updateMyInfo.error = action.payload;
        },
        resetUpdateMyInfo: (state) => {
            state.updateMyInfo = {
                loading: false,
                success: false,
                error: null,
            };
        },
        // =========================
        // 회원 탈퇴
        // =========================
        deleteAccountRequest: (state) => {
            state.deleteAccount.loading = true;
            state.deleteAccount.success = false;
            state.deleteAccount.error = null;
        },
        deleteAccountSuccess: (state) => {
            state.deleteAccount.loading = false;
            state.deleteAccount.success = true;
            state.deleteAccount.error = null;

            // 회원 정보 초기화
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;

            // 로그인 상태도 초기화
            state.login = {
                loading: false,
                success: false,
                error: null,
            };
        },
        deleteAccountFailure: (state, action) => {
            state.deleteAccount.loading = false;
            state.deleteAccount.success = false;
            state.deleteAccount.error = action.payload;
        },
        resetDeleteAccount: (state) => {
            state.deleteAccount = {
                loading: false,
                success: false,
                error: null,
            };
        },

        // =========================
        // 프로필 이미지 업로드
        // =========================
        uploadProfileImageRequest: (state) => {
            state.profileImage.loading = true;
            state.profileImage.success = false;
            state.profileImage.error = null;
        },
        uploadProfileImageSuccess: (state, action) => {
            state.profileImage.loading = false;
            state.profileImage.success = true;
            state.profileImage.error = null;
            // 백엔드에서 수정된 회원정보 전체를 반환하는 경우
            if (action.payload?.profileUrl && state.user) {
                state.user.profileUrl = action.payload.profileUrl;
            }
        },
        uploadProfileImageFailure: (state, action) => {
            state.profileImage.loading = false;
            state.profileImage.success = false;
            state.profileImage.error = action.payload;
        },
        resetProfileImage: (state) => {
            state.profileImage = {
                loading: false,
                success: false,
                error: null,
            };
        },

        // =========================
        // 포인트 내역 조회
        // =========================
        getPointHistoryRequest: (state) => {
            state.pointHistory.loading = true;
            state.pointHistory.error = null;
        },
        getPointHistorySuccess: (state, action) => {
            state.pointHistory.loading = false;
            state.pointHistory.data = action.payload;
            state.pointHistory.error = null;

        },
        getPointHistoryFailure: (state, action) => {
            state.pointHistory.loading = false;
            state.pointHistory.error = action.payload;
        },
        resetPointHistory: (state) => {
            state.pointHistory = {
                loading: false,
                data: [],
                error: null,
            };
        },

        // =========================
        // 출석체크
        // =========================
        checkAttendanceRequest: (state) => {
            state.attendance.loading = true;
            state.attendance.success = false;
            state.attendance.error = null;
        },

        checkAttendanceSuccess: (state, action) => {
            state.attendance.loading = false;
            state.attendance.success = true;

            state.attendance.attendedToday = true;

            state.attendance.point = action.payload.point;
            state.attendance.currentPoint = action.payload.currentPoint;
            state.attendance.error = null;

            // 현재 보유 포인트도 바로 갱신
            state.point = action.payload.currentPoint;
        },

        checkAttendanceFailure: (state, action) => {
            state.attendance.loading = false;
            state.attendance.success = false;
            state.attendance.error = action.payload;

            // 이미 출석한 경우
            if (action.payload === "오늘은 이미 출석체크를 완료했습니다.") {
                state.attendance.attendedToday = true;
            }
        },

        resetAttendance: (state) => {
            state.attendance.loading = false;
            state.attendance.success = false;
            state.attendance.error = null;
        },

        // =========================
        // 월별 출석 기록 조회
        // =========================
        getAttendanceHistoryRequest: (state) => {
            state.attendance.historyLoading = true;
            state.attendance.historyError = null;
        },

        getAttendanceHistorySuccess: (state, action) => {
            state.attendance.historyLoading = false;
            state.attendance.historyError = null;

            // 월별 출석 기록
            state.attendance.history = action.payload;

            // 오늘 날짜
            const today = new Date();

            const todayKey =
                `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

            // 오늘 출석 여부
            state.attendance.attendedToday = action.payload.some(
                (item) =>
                    item.createdAt?.slice(0, 10) === todayKey
            );
        },

        getAttendanceHistoryFailure: (state, action) => {
            state.attendance.historyLoading = false;
            state.attendance.historyError = action.payload;
        },


        // =================================================
        // 중복확인 상태 초기화
        // =================================================
        resetDuplicateCheck: (state, action) => {
            const field = action.payload;

            if (field in state.duplicateCheck) { state.duplicateCheck[field] = null;}
        },

        // =================================================
        // 이메일 인증 상태 초기화
        // =================================================
        resetEmailVerification: (state) => {
            state.emailVerification = {
                sending: false,
                verifying: false,
                sent: false,
                verified: false,
                error: null,
            };
        },

        // =================================================
        // 비밀번호 유출검사 상태 초기화
        // =================================================
        resetPasswordLeak: (state) => {
            state.passwordLeak = {
                checking: false,
                checked: false,
                leaked: false,
                count: 0,
                error: null,
            };
        },

        // =========================
        // 로그아웃
        // =========================
        logoutRequest: (state) => {
            // 로그아웃 자체의 loading
            state.logout.loading = true;
            state.logout.success = false;
            state.logout.error = null;

            // 기존 전역 loading은 사용하지 않음
            state.loading = false;

            // 로그인 상태 초기화
            state.login = {
                loading: false,
                success: false,
                error: null,
            };

            // 사용자 정보 초기화
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
        },

        logoutSuccess: (state) => {
            state.logout.loading = false;
            state.logout.success = true;
            state.logout.error = null;

            // 전역 loading도 반드시 해제
            state.loading = false;

            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;

            state.login = {
                loading: false,
                success: false,
                error: null,
            };
        },

        logoutFailure: (state, action) => {
            state.logout.loading = false;
            state.logout.success = false;
            state.logout.error = action.payload;

            state.loading = false;

            // 로그아웃 실패하더라도
            // 프론트 로그인 상태는 초기화
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;

            state.login = {
                loading: false,
                success: false,
                error: null,
            };
        },
    }
});

//3. action
export const {
    loginRequest,loginSuccess,loginFailure,
    signupRequest,signupSuccess,signupFailure,
    emailSendRequest,emailSendSuccess,emailSendFailure,
    emailVerifyRequest,emailVerifySuccess,emailVerifyFailure,
    checkLoginIdRequest,checkLoginIdSuccess,checkLoginIdFailure,
    checkEmailRequest,checkEmailSuccess,checkEmailFailure,
    checkNicknameRequest,checkNicknameSuccess,checkNicknameFailure,
    logoutRequest,logoutSuccess,logoutFailure, resetDuplicateCheck,resetEmailVerification,
    checkPasswordLeakRequest,checkPasswordLeakSuccess,checkPasswordLeakFailure,
    resetPasswordLeak,findMembersRequest,findMembersSuccess,findMembersFailure,
    getMyInfoRequest, getMyInfoSuccess, getMyInfoFailure,
    getMyPageRequest,getMyPageSuccess,getMyPageFailure,
    findIdRequest,findIdSuccess,findIdFailure,resetFindId,findIdEmailSendRequest,
    findPasswordRequest,findPasswordSuccess,findPasswordFailure,resetFindPassword,
    findPasswordEmailSendRequest, changePasswordRequest,changePasswordSuccess,
    changePasswordFailure,resetChangePassword, updateMyInfoRequest,
    updateMyInfoSuccess,updateMyInfoFailure, resetUpdateMyInfo,
    uploadProfileImageRequest,uploadProfileImageSuccess,uploadProfileImageFailure,
    resetProfileImage, deleteAccountRequest,deleteAccountSuccess,deleteAccountFailure,resetDeleteAccount,
    getLoginHistoryRequest,getLoginHistorySuccess,getLoginHistoryFailure,resetLoginHistory,resetSignup,
    getLoginDevicesRequest,getLoginDevicesSuccess,getLoginDevicesFailure,resetLoginDevices,
    deleteLoginDeviceRequest,deleteLoginDeviceSuccess,deleteLoginDeviceFailure,resetDeleteLoginDevice,
    deleteAllLoginDevicesRequest,deleteAllLoginDevicesSuccess,deleteAllLoginDevicesFailure,resetDeleteAllLoginDevices,  
    mobileSendRequest,mobileSendSuccess, mobileSendFailure,mobileVerifyRequest,
    mobileVerifySuccess,mobileVerifyFailure,resetMobileVerification,
    getPointHistoryRequest,getPointHistorySuccess,getPointHistoryFailure,resetPointHistory,
    checkAttendanceRequest,checkAttendanceSuccess,checkAttendanceFailure,resetAttendance,
    analyzeSignupBehaviorRequest,analyzeSignupBehaviorSuccess,analyzeSignupBehaviorFailure,
    resetSignupBehaviorAnalysis,recordSignupBehaviorFailure,
    getAttendanceHistoryRequest,getAttendanceHistorySuccess,getAttendanceHistoryFailure,
} = userReducer.actions;

//4. export
export default userReducer.reducer;

