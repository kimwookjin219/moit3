import {all, call, put, takeLatest} from 'redux-saga/effects';
import api from '../api/axios';
import {
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
} from '../reducers/userReducer';


// =========================
// 로그인 API
// =========================
function loginApi(loginData){
    return api.post("/api/members/login",loginData);
}

// =========================
// Device ID 조회/생성
// =========================
function getDeviceId() {
    if (typeof window === "undefined") {return null;}

    let deviceId = localStorage.getItem("deviceId");

    if (!deviceId) {
        if (
            window.crypto &&
            typeof window.crypto.randomUUID === "function"
        ) {
            deviceId = window.crypto.randomUUID();
        } else {
            deviceId =
            "device-" +
            Date.now() +
            "-" +
            Math.random().toString(36).substring(2, 11);
        }

        localStorage.setItem("deviceId", deviceId);
    }

    return deviceId;
}

// =========================
// 내 정보 조회 API
// =========================
function getMyInfoApi() {
    return api.get("/api/members/me");
}

// =========================
// 마이페이지 조회 API
// =========================
function getMyPageApi() {
    return api.get("/api/members/mypage");
}

// =========================
// 회원가입 API
// =========================
function signupApi(signupData){
    return api.post("/api/members/signup",signupData);
}

// =========================
// 이메일 인증번호 발송 API
// =========================
function emailSendApi(email){
    return api.post("/api/members/email/send",{email: email});
}

// =========================
// 이메일 인증번호 확인 API
// =========================
function emailverifyApi(email,code){
    return api.post("/api/members/email/verify",{email: email, code: code});
}

// =========================
// 아이디 중복검사 API
// =========================
function checkLoginIdApi(loginId){
    return api.get("/api/members/check-loginId",{params:{loginId: loginId}});
}

// =========================
// 이메일 중복검사 API
// =========================
function checkEmailApi(email){
    return api.get("/api/members/check-email",{params: {email: email}});
}

// =========================
// 닉네임 중복검사 API
// =========================
function checkNicknameApi(nickname){
    return api.get("/api/members/check-nickname",{params: {nickname: nickname}});
}

// =========================
// 휴대폰 인증번호 발송 API
// =========================
function mobileSendApi(mobile) {
    return api.post("/api/members/phone/send", {
        mobile: mobile
    });
}

// =========================
// 휴대폰 인증번호 확인 API
// =========================
function mobileVerifyApi(mobile, code) {
    return api.post("/api/members/phone/verify", {
        mobile: mobile,
        code: code
    });
}

// =========================
// 비밀번호 유출 검사 API
// =========================
function checkPasswordLeakApi(password){
    return api.post("/api/members/check-password", {password: password});
}

// =========================
// 회원 전체 조회 API
// =========================
function findMembersApi() {
    return api.get("/api/members");
}

// =========================
// 로그아웃 API
// =========================
function logoutApi() {

    const deviceId =
        typeof window !== "undefined"
            ? localStorage.getItem("deviceId")
            : null;

    // Refresh Token은 HttpOnly Cookie로
    // 브라우저가 자동 전송한다.
    //
    // 따라서 JavaScript에서 refreshToken을
    // 읽어서 보내지 않는다.

    return api.post(
        "/api/members/logout",
        {
            deviceId,
        }
    );
}

// =========================
// 아이디 찾기 API
// =========================
function findIdApi(email) {
    return api.post("/api/members/find-id", {email: email,});
}
// =========================
// 아이디 찾기용 이메일 가입 여부 확인 API
// =========================
function findIdEmailCheckApi(email) {
    return api.get("/api/members/check-email", {params: {email: email }});
}

// =========================
// 비밀번호 변경 API
// =========================
function resetPasswordApi(data) {
    return api.post("/api/members/reset-password", data);
}

// =========================
// 로그인 회원 비밀번호 변경 API
// =========================
function changePasswordApi(data) {
    return api.put("/api/members/me/password", data);
}

// =========================
// 회원정보 수정 API
// =========================
function updateMyInfoApi(formData) {
    return api.put("/api/members/me",formData);
}

// =========================
// 프로필 이미지 업로드 API
// =========================
function uploadProfileImageApi(formData) {
    return api.post("/api/members/me/profile-image", formData);
}

// =========================
// 회원 탈퇴 API
// =========================
function deleteAccountApi(data) {
    return api.delete("/api/members/me", {data: data,});
}

// =========================
// 로그인 기록 조회 API
// =========================
function getLoginHistoryApi() {
  return api.get("/api/members/login-history");
}

// =========================
// 로그인 기기 조회 API
// =========================
function getLoginDevicesApi() {
    return api.get("/api/members/login-devices");
}

// =========================
// 특정 기기 로그아웃 API
// =========================
function deleteLoginDeviceApi(deviceId) {
    return api.delete(
        `/api/members/login-devices/${deviceId}`
    );
}

// =========================
// 모든 기기 로그아웃 API
// =========================
function deleteAllLoginDevicesApi() {
    return api.delete(
        "/api/members/login-devices/all"
    );
}

// =========================
// 포인트 내역 조회 API
// =========================
function getPointHistoryApi() {
    return api.get("/api/members/me/point/history");
}

// =========================
// 출석체크 API
// =========================
function checkAttendanceApi() {
    return api.post("/api/members/me/point/attendance");
}

// =========================
// 월별 출석 기록 조회 API
// =========================
function getAttendanceHistoryApi(year, month) {
    return api.get("/api/members/me/point/attendance", {
        params: {
            year,
            month,
        },
    });
}

// =========================
// 회원가입 행동 AI 분석 API
// =========================
function analyzeSignupBehaviorApi(data) {
    return api.post("/api/members/signup/behavior/analyze", data);
}


////////////////////////////////////////////////////

// =========================
// 로그인
// =========================
function* login(action){ 
    try{ 
        // =========================
        // Device ID 생성/조회
        // =========================
        const deviceId = getDeviceId();
        const loginData = {...action.payload,deviceId,};



        const response = yield call(loginApi, loginData);


        // Access Token 저장
        if (typeof window !== "undefined") {

            localStorage.setItem("accessToken",response.data.accessToken);
            //localStorage.setItem("refreshToken",response.data.refreshToken);
            localStorage.setItem("socialProvider", "NORMAL");

            // 백엔드 응답에 deviceId가 있으면 저장
            if (response.data?.deviceId) {localStorage.setItem("deviceId",response.data.deviceId); }
        }

        yield put(loginSuccess(response.data));

        yield put(getMyInfoRequest());
        
    } catch(err){ 
        console.error("로그인 실패:",err); 

        let message = "로그인에 실패했습니다."; 

        if(err.response?.status == 401){ message = err.response?.data?.message || "아이디 또는 비밀번호가 올바르지 않습니다."; } 

        if(err.response?.status === 403){ message =  err.response?.data?.message || "회원유형이 맞지 않습니다."; } 
        
        yield put(loginFailure(message)); 
    } 
}

// =========================
// 내 정보 조회
// =========================
function* getMyInfo() {

    // console.log("===== GET MY INFO SAGA START =====");

    try {

        // console.log("===== GET MY INFO API CALL =====");

        const response = yield call(getMyInfoApi);



        yield put(getMyInfoSuccess(response.data));

        // console.log("===== GET MY INFO SUCCESS DISPATCH =====");

    } catch(err) {

        console.error("===== GET MY INFO SAGA ERROR =====");
        console.error(err);

        const message =
            err.response?.data?.message ||
            "회원정보를 불러오지 못했습니다.";

        yield put(getMyInfoFailure(message));
    }
}

// =========================
// 마이페이지
// =========================
function* getMyPageSaga() {
    try {
        const response = yield call(getMyPageApi);

        yield put(getMyPageSuccess(response.data));
    } catch (error) {
        yield put( getMyPageFailure( error.response?.data?.message || "마이페이지 정보를 불러오지 못했습니다."));
    }
}

// =========================
// 로그인 기록 조회 
// =========================
function* getLoginHistorySaga() {
    try {
        // console.log("===== 로그인 기록 조회 START =====");

        const response = yield call(getLoginHistoryApi);



        yield put(getLoginHistorySuccess(response.data));
    } catch (error) {

        yield put(getLoginHistoryFailure(error.response?.data?.message || "로그인 기록을 불러오지 못했습니다."));
    }
}

// =========================
// 특정 기기 로그아웃
// =========================
function* deleteLoginDeviceSaga(action) {

    try {

        const deviceId = action.payload;

        // console.log("===== 특정 기기 로그아웃 START =====");
        // console.log("deviceId:", deviceId);

        const response = yield call(
            deleteLoginDeviceApi,
            deviceId
        );

        // console.log("===== 특정 기기 로그아웃 SUCCESS =====");
        // console.log("response:", response.data);

        yield put(
            deleteLoginDeviceSuccess()
        );

        // 삭제 후 기기 목록 다시 조회
        yield put(
            getLoginDevicesRequest()
        );

    } catch (error) {

        console.error("===== 특정 기기 로그아웃 FAILURE =====");
        console.error(error);

        yield put(
            deleteLoginDeviceFailure(
                error.response?.data?.message ||
                "기기 로그아웃에 실패했습니다."
            )
        );
    }
}

// =========================
// 모든 기기 로그아웃
// =========================
function* deleteAllLoginDevicesSaga() {

    try {

        // console.log("===== 모든 기기 로그아웃 START =====");

        const response = yield call(
            deleteAllLoginDevicesApi
        );

        // console.log("===== 모든 기기 로그아웃 SUCCESS =====");
        // console.log("response:", response.data);

        yield put(
            deleteAllLoginDevicesSuccess()
        );

        // 삭제 후 기기 목록 다시 조회
        yield put(
            getLoginDevicesRequest()
        );

    } catch (error) {

        console.error("===== 모든 기기 로그아웃 FAILURE =====");
        console.error(error);

        yield put(
            deleteAllLoginDevicesFailure(
                error.response?.data?.message ||
                "모든 기기 로그아웃에 실패했습니다."
            )
        );
    }
}

// =========================
// 로그인 기기 조회
// =========================
function* getLoginDevicesSaga() {

    try {

        // console.log("===== 로그인 기기 조회 START =====");

        const response = yield call(getLoginDevicesApi);

        // console.log("===== 로그인 기기 조회 SUCCESS =====");
        // console.log("status:", response.status);
        // console.log("data:", response.data);

        yield put(
            getLoginDevicesSuccess(response.data)
        );

    } catch (error) {

        console.error("===== 로그인 기기 조회 FAILURE =====");
        console.error(error);

        yield put(
            getLoginDevicesFailure(
                error.response?.data?.message ||
                "로그인 기기를 불러오지 못했습니다."
            )
        );
    }
}

// =========================
// 회원가입
// =========================
function* signup(action){
    try{
        const response = yield call(signupApi,action.payload);

        // console.log("회원가입 성공:", response.data);

        yield put(signupSuccess(response.data));
    }catch(err){
        console.error("회원가입 실패:",err);
        console.error("에러 객체:", err);
        console.error("HTTP 상태:", err.response?.status);
        console.error("서버 응답:", err.response?.data);
        console.error("서버 메시지:", err.response?.data?.message);
        yield put(signupFailure(err.response?.data?.message || err.message));
    }
}

// =========================
// 회원가입 행동 AI 분석
// =========================
function* analyzeSignupBehaviorSaga(action) {

    const { field, data } = action.payload;

    try {

        console.log("===== 회원가입 행동 AI 분석 START =====");
        console.log("field:", field);
        console.log("행동 데이터:", data);

        const response = yield call(
            analyzeSignupBehaviorApi,
            data
        );

        console.log("===== 회원가입 행동 AI 분석 SUCCESS =====");
        console.log("status:", response.status);
        console.log("AI 가이드:", response.data);

        yield put(
            analyzeSignupBehaviorSuccess({
                field,
                result: response.data,
            })
        );

    } catch (error) {

        console.error(
            "===== 회원가입 행동 AI 분석 ERROR ====="
        );
        console.error(error);

        yield put(
            analyzeSignupBehaviorFailure({
                field,
                error:
                    error.response?.data?.message ||
                    "AI 분석에 실패했습니다.",
            })
        );
    }
}


// =========================
// 이메일 인증번호 발송
// =========================
function* emailSend(action){
    try{
        const response = yield call(emailSendApi, action.payload);

        console.log("이메일 인증번호 발송성공:",response.data);

        yield put(emailSendSuccess());
    }catch(err){
        yield put(emailSendFailure(err.response?.data?.message || err.message));
    }
}

// =========================
// 이메일 인증번호 확인
// =========================
function* emailVerify(action){
    try{
        const {email,code} = action.payload;

        const response = yield call(emailverifyApi,
                                    email,
                                    code);

        console.log("이메일 인증 성공:",response.data);

        yield put(emailVerifySuccess());
    }catch(err){       
        const errorMessage =
            err.response?.data ||
            "인증번호가 일치하지 않거나 만료되었습니다.";

        console.log("이메일 인증 실패:", errorMessage);

        yield put(emailVerifyFailure(errorMessage));
    }
}

// =========================
// 아이디 중복검사
// =========================
function* checkLoginId(action) { 

    try { 

        const response = yield call(
            checkLoginIdApi,
            action.payload
        ); 

        console.log("아이디 존재 여부:", response.data);

        // 백엔드
        // true  = 이미 존재
        // false = 존재하지 않음
        //
        // 프론트
        // true  = 사용 가능
        // false = 사용 불가

        const available = !response.data;

        console.log("아이디 사용 가능 여부:", available);

        // =========================
        // 아이디 사용 가능
        // =========================
        if (available) {
            yield put(checkLoginIdSuccess(true));
            return;
        }

        // =========================
        // 아이디 중복 = 중복검사 실패
        // =========================
        console.log("===== 아이디 중복검사 실패 =====");
        console.log("중복검사 실패 횟수 +1");

        console.log(
            "===== checkLoginId → recordSignupBehaviorFailure 호출 ====="
        );

        // Redux의 loginId.failCount 증가
        yield put(recordSignupBehaviorFailure({field: "loginId"}));

        // 기존 중복검사 결과도 false로 저장
        yield put( checkLoginIdSuccess(false));

    } catch (err) { 

        console.error("아이디 중복검사 실패:", err); 
 
        yield put(
            checkLoginIdFailure(
                err.response?.data?.message || err.message
            )
        ); 
    } 
}

// =========================
// 비밀번호 유출 검사
// =========================
function* checkPasswordLeak(action){
    try{
        const response = yield call(checkPasswordLeakApi,action.payload);

        console.log("비밀번호 유출 검사:", response.data);

        yield put( checkPasswordLeakSuccess(response.data));
    }catch(err){
        console.error("비밀번호 유출 검사 실패:", err);
        yield put(checkPasswordLeakFailure(err.response?.data?.message || err.message));
    }
}

// =========================
// 이메일 중복검사 
// =========================
function* checkEmail(action) {
    try {
        const response = yield call(checkEmailApi, action.payload);

        console.log("===== 이메일 중복검사 =====");
        console.log("입력 이메일:", action.payload);
        console.log("response:", response);
        console.log("response.data:", response.data);
        console.log("response.data 타입:", typeof response.data);

        const available = !response.data;

        console.log("이메일 사용 가능 여부:", available);

        yield put(checkEmailSuccess(available));

    } catch (err) {
        console.error("이메일 중복검사 실패:", err);

        yield put(
            checkEmailFailure(
                err.response?.data?.message || err.message
            )
        );
    }
}

// =========================
// 닉네임 중복검사 
// =========================
function* checkNickname(action) {

    try {

        const response = yield call(
            checkNicknameApi,
            action.payload
        );

        console.log("닉네임 존재 여부:", response.data);

        // 백엔드
        // true  = 이미 존재
        // false = 존재하지 않음
        //
        // 프론트
        // true  = 사용 가능
        // false = 사용 불가

        const available = !response.data;

        console.log("닉네임 사용 가능 여부:", available);

        // 사용 가능
        if (available) {

            yield put(checkNicknameSuccess(true));

            return;
        }

        // =========================
        // 닉네임 중복검사 실패
        // =========================

        console.log("===== 닉네임 중복검사 실패 =====");
        console.log("중복검사 실패 횟수 +1");

        yield put(
            recordSignupBehaviorFailure({
                field: "nickname"
            })
        );

        yield put(checkNicknameSuccess(false));

    } catch (err) {

        yield put(
            checkNicknameFailure(
                err.response?.data?.message ||
                err.message
            )
        );
    }
}

// =========================
// 휴대폰 인증번호 발송
// =========================
function* mobileSend(action) {

    try {

        const mobile = action.payload;

        console.log("===== 휴대폰 인증번호 발송 START =====");
        console.log("mobile:", mobile);

        const response = yield call(
            mobileSendApi,
            mobile
        );

        console.log("===== 휴대폰 인증번호 발송 SUCCESS =====");
        console.log("status:", response.status);
        console.log("response.data:", response.data);

        yield put(
            mobileSendSuccess()
        );

    } catch (err) {

        console.error("===== 휴대폰 인증번호 발송 FAILURE =====");
        console.error("status:", err.response?.status);
        console.error("data:", err.response?.data);
        console.error("message:", err.response?.data?.message);
        console.error("error:", err);

        yield put(
            mobileSendFailure(
                err.response?.data?.message ||
                err.response?.data ||
                "휴대폰 인증번호 발송에 실패했습니다."
            )
        );
    }
}


// =========================
// 휴대폰 인증번호 확인
// =========================
function* mobileVerify(action) {

    try {

        const { mobile, code } = action.payload;

        // console.log("===== 휴대폰 인증번호 확인 START =====");
        // console.log("mobile:", mobile);
        // console.log("code:", code);

        const response = yield call(
            mobileVerifyApi,
            mobile,
            code
        );

        // console.log("===== 휴대폰 인증번호 확인 SUCCESS =====");
        // console.log("status:", response.status);
        // console.log("response.data:", response.data);

        yield put(
            mobileVerifySuccess()
        );

    } catch (err) {

        console.error("===== 휴대폰 인증번호 확인 FAILURE =====");
        console.error("status:", err.response?.status);
        console.error("data:", err.response?.data);
        console.error("message:", err.response?.data?.message);
        console.error("error:", err);

        yield put(
            mobileVerifyFailure(
                err.response?.data?.message ||
                err.response?.data ||
                "휴대폰 인증에 실패했습니다."
            )
        );
    }
}

// =========================
// 회원 전체 조회
// =========================
function* findMembers() {
    try {
        const response = yield call(findMembersApi);

        // console.log("전체 회원 조회:", response.data);

        yield put(findMembersSuccess(response.data));
    } catch (err) {
        // console.error("전체 회원 조회 실패:", err);
        yield put(findMembersFailure(err.response?.data?.message || err.message));
    }
}

// =========================
// 로그아웃
// =========================
function* logoutSaga(action) {
    try {

        // Header에서 전달받은 로그인 provider
        const loginProvider =
            action.payload?.provider || null;

        // console.log("===== LOGOUT SAGA =====");
        // console.log("loginProvider:", loginProvider);

        // 1. 백엔드 로그아웃
        yield call(logoutApi);

        // 2. 프론트 토큰 삭제
        if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("deviceId");
        }

        // 3. Redux 로그아웃 상태 변경
        yield put(logoutSuccess());

        // 4. 카카오 로그인 사용자
        if (
            typeof window !== "undefined" &&
            loginProvider === "kakao"
        ) {

            // console.log("===== KAKAO LOGOUT =====");

            const kakaoLogoutUrl =
                "https://kauth.kakao.com/oauth/logout" +
                "?client_id=d1065db6fa6b99aa2d26a3d28c80143a" +
                "&logout_redirect_uri=" +
                encodeURIComponent(
                    "/user/member/kakaologout"
                );

            window.location.href = kakaoLogoutUrl;

            return;
        }

        // 5. 일반 / 네이버 / 구글
        if (typeof window !== "undefined") {
            window.location.href =
                "/user/member/login";
        }

    } catch (err) {

        if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            //localStorage.removeItem("refreshToken");
            localStorage.removeItem("deviceId");
        }

        yield put(
            logoutFailure(
                err.response?.data?.message ||
                "로그아웃 처리 중 문제가 발생했습니다."
            )
        );
    }
}

// =========================
// 아이디 찾기
// =========================
function* findId(action) {
    try {
        const response = yield call(findIdApi,action.payload);

        // console.log("===== 아이디 찾기 성공 =====");
        // console.log("response:", response.data);

        yield put(findIdSuccess(response.data.loginId));

    } catch (err) {
        // console.error("===== 아이디 찾기 실패 =====");
        // console.error(err);

        yield put(findIdFailure(err.response?.data?.message ||"아이디를 찾을 수 없습니다."));
    }
}
// =========================
// 아이디 찾기용 이메일 가입 여부 확인
// =========================
function* findIdEmailSend(action) {
    try {
        const email = action.payload;

        // 가입 이메일 확인
        const checkResponse = yield call(checkEmailApi,email);

        // console.log("===== 아이디 찾기 이메일 확인 =====");
        // console.log("email:",email);
        // console.log("가입 여부:",checkResponse.data);

        // 가입된 이메일이 아니면 종료
        if (!checkResponse.data) {
            yield put( emailSendFailure("해당 이메일로 가입된 회원이 없습니다."));
            return;
        }

        // 가입된 이메일이면 인증번호 발송
        yield call(emailSendApi,email);

        yield put( emailSendSuccess());
    } catch (err) {
        console.error("아이디 찾기 이메일 발송 실패:", err);

        yield put(
            emailSendFailure(err.response?.data?.message ||"인증번호 발송에 실패했습니다."));
    }
}

// =========================
// 비밀번호 변경
// =========================
function* resetPassword(action) {
    try {
        const response = yield call(resetPasswordApi, action.payload);

        // console.log("===== 비밀번호 변경 성공 =====");
        // console.log("response:", response.data);

        yield put(findPasswordSuccess());

    } catch (err) {
        console.error("===== 비밀번호 변경 실패 =====");
        console.error(err);

        yield put( findPasswordFailure(err.response?.data?.message ||"비밀번호 변경에 실패했습니다."));
    }
}
// =========================
// 비밀번호 찾기용 이메일 발송
// =========================
function* findPasswordEmailSend(action) {

    try {

        const email = action.payload;

        // =========================
        // 가입 이메일 확인
        // =========================
        const checkResponse = yield call(checkEmailApi,email);

        // console.log("===== 비밀번호 찾기 이메일 확인 =====");
        // console.log("email:", email);
        // console.log("가입 여부:", checkResponse.data);

        // =========================
        // 가입되지 않은 이메일
        // =========================
        if (!checkResponse.data) {

            yield put(emailSendFailure("해당 이메일로 가입된 회원이 없습니다."));
            return;
        }

        // =========================
        // 가입된 이메일이면 인증번호 발송
        // =========================
        yield call(emailSendApi, email);

        // console.log("비밀번호 찾기 인증번호 발송 성공");

        yield put(emailSendSuccess());

    } catch (err) {

        console.error("비밀번호 찾기 이메일 발송 실패:",err);

        yield put( emailSendFailure(err.response?.data?.message ||"인증번호 발송에 실패했습니다."));
    }
}

// =========================
// 로그인 회원 비밀번호 변경
// =========================
function* changePassword(action) {

    try {

        // console.log("===== 회원 비밀번호 변경 START =====");
        // console.log("request:", action.payload);

        const response = yield call(changePasswordApi,action.payload);

        // console.log("===== 회원 비밀번호 변경 SUCCESS =====");
        // console.log("response:", response.data);

        yield put(changePasswordSuccess());

    } catch (err) {

        console.error("===== 회원 비밀번호 변경 FAILURE =====");
        console.error(err);

        yield put(changePasswordFailure(err.response?.data?.message ||"비밀번호 변경에 실패했습니다."));
    }
}
// =========================
// 회원정보 수정
// =========================
function* updateMyInfo(action) {

    try {

        // console.log("===== 회원정보 수정 START =====");
        // console.log("request:", action.payload);

        const response = yield call(updateMyInfoApi,action.payload);

        // console.log("===== 회원정보 수정 SUCCESS =====");
        // console.log("response:", response.data);

        yield put(updateMyInfoSuccess(response.data));

    } catch (err) {

        console.error("===== 회원정보 수정 FAILURE =====");
        console.error("status:", err.response?.status);
        console.error("data:", err.response?.data);
        console.error("message:", err.response?.data?.message);
        console.error("error:", err);

        yield put(updateMyInfoFailure(err.response?.data?.message ||"회원정보 수정에 실패했습니다."));
    }
}

// =========================
// 프로필 이미지 업로드
// =========================
function* uploadProfileImage(action) {

    try {
        // console.log("===== 프로필 이미지 업로드 START =====");
        // console.log("file:", action.payload);

        const formData = new FormData();

        formData.append("file", action.payload);

        const response = yield call(uploadProfileImageApi,formData);

        // console.log("===== 프로필 이미지 업로드 SUCCESS =====");
        // console.log("response:", response.data);

        yield put(uploadProfileImageSuccess(response.data) );

    } catch (err) {
        console.error("===== 프로필 이미지 업로드 FAILURE =====");
        console.error(err);

        yield put(uploadProfileImageFailure(err.response?.data?.message ||"프로필 이미지 업로드에 실패했습니다."));
    }
}

// =========================
// 회원 탈퇴
// =========================
function* deleteAccount(action) {

    try {

        // console.log("===== 회원 탈퇴 START =====");
        // console.log("request:", action.payload);

        const response = yield call(
            deleteAccountApi,
            action.payload
        );

        // console.log("===== 회원 탈퇴 SUCCESS =====");
        // console.log("response:", response.data);

        // localStorage 토큰 삭제
        if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            //localStorage.removeItem("refreshToken");
        }

        // Redux 상태 초기화
        yield put(deleteAccountSuccess());

    } catch (err) {

        console.error("===== 회원 탈퇴 FAILURE =====");
        console.error("status:", err.response?.status);
        console.error("data:", err.response?.data);
        console.error("message:", err.response?.data?.message);

        yield put(deleteAccountFailure(err.response?.data?.message || "회원 탈퇴에 실패했습니다."));
    }
}

// =========================
// 포인트 내역 조회
// =========================
function* getPointHistorySaga() {

    try {
        // console.log("===== 포인트 내역 조회 START =====");

        const response = yield call(getPointHistoryApi);

        // console.log("===== 포인트 내역 조회 SUCCESS =====");
        // console.log("status:", response.status);
        // console.log("data:", response.data);

        yield put(getPointHistorySuccess(response.data) );

    } catch (error) {

        console.error("===== 포인트 내역 조회 FAILURE =====");
        console.error(error);

        yield put(getPointHistoryFailure(error.response?.data?.message || "포인트 내역을 불러오지 못했습니다."));
    }
}

// =========================
// 출석체크
// =========================
function* checkAttendanceSaga() {

    try {
        // console.log("===== 출석체크 START =====");

        const response = yield call(checkAttendanceApi);

        // console.log("===== 출석체크 SUCCESS =====");
        // console.log("status:", response.status);
        // console.log("data:", response.data);

        yield put(checkAttendanceSuccess(response.data));

        yield put(getMyInfoRequest());

    } catch (error) {

        console.error("===== 출석체크 FAILURE =====");
        console.error(error);
        console.error("status:", error.response?.status);
        console.error("data:", error.response?.data);
        console.error("message:", error.response?.data?.message);

        yield put(checkAttendanceFailure(error.response?.data?.message || "출석체크에 실패했습니다.") );
    }
}

// =========================
// 월별 출석 기록 조회
// =========================
function* getAttendanceHistorySaga(action) {
    try {

        const { year, month } = action.payload;

        // console.log('===== 출석 기록 조회 START =====');
        // console.log('year:', year);
        // console.log('month:', month);

        const response = yield call(
            getAttendanceHistoryApi,
            year,
            month
        );

        // console.log('===== 출석 기록 조회 SUCCESS =====');
        // console.log('status:', response.status);
        // console.log('data:', response.data);

        yield put(
            getAttendanceHistorySuccess(response.data)
        );

    } catch (error) {

        console.error('===== 출석 기록 조회 FAILURE =====');
        console.error(error);
        console.error('status:', error.response?.status);
        console.error('data:', error.response?.data);
        console.error('message:', error.response?.data?.message);

        yield put(
            getAttendanceHistoryFailure(
                error.response?.data?.message ||
                '출석 기록을 불러오지 못했습니다.'
            )
        );
    }
}


export default function* userSaga(){

    // console.log("===== USER SAGA STARTED =====");

    yield all([
        takeLatest(loginRequest.type, login),
        takeLatest(signupRequest.type, signup),
        takeLatest(emailSendRequest.type, emailSend),
        takeLatest(emailVerifyRequest.type, emailVerify),
        takeLatest(checkLoginIdRequest.type, checkLoginId),
        takeLatest(checkEmailRequest.type, checkEmail),
        takeLatest(checkNicknameRequest.type, checkNickname),
        takeLatest(checkPasswordLeakRequest.type, checkPasswordLeak),
        takeLatest(findMembersRequest.type, findMembers),
        takeLatest(logoutRequest.type, logoutSaga),
        takeLatest(getMyInfoRequest.type, getMyInfo),
        takeLatest(getMyPageRequest.type,getMyPageSaga),
        takeLatest(findIdRequest.type, findId),
        takeLatest(findIdEmailSendRequest.type,findIdEmailSend),
        takeLatest(findPasswordRequest.type,resetPassword),
        takeLatest(findPasswordEmailSendRequest.type,findPasswordEmailSend),
        takeLatest(changePasswordRequest.type, changePassword),
        takeLatest(updateMyInfoRequest.type,updateMyInfo),
        takeLatest(uploadProfileImageRequest.type,uploadProfileImage),
        takeLatest(deleteAccountRequest.type, deleteAccount),
        takeLatest(getLoginHistoryRequest.type, getLoginHistorySaga),
        takeLatest(getLoginDevicesRequest.type,getLoginDevicesSaga),
        takeLatest(deleteLoginDeviceRequest.type,deleteLoginDeviceSaga),
        takeLatest(deleteAllLoginDevicesRequest.type,deleteAllLoginDevicesSaga),
        takeLatest(mobileSendRequest.type, mobileSend),
        takeLatest(mobileVerifyRequest.type, mobileVerify),
        takeLatest(getPointHistoryRequest.type,getPointHistorySaga),
        takeLatest(checkAttendanceRequest.type, checkAttendanceSaga),
        takeLatest(analyzeSignupBehaviorRequest.type,analyzeSignupBehaviorSaga),
        takeLatest(getAttendanceHistoryRequest.type,getAttendanceHistorySaga),
    ]);
}