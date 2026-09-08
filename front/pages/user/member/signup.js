import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useRouter} from "next/router";
import {Form,Input, Button, Card, Row, Col, Radio, 
        DatePicker, Checkbox, Typography, message, Divider, Space, Progress } from "antd";
import { CheckOutlined, MailOutlined, LockOutlined, 
         UserOutlined, PhoneOutlined, } from "@ant-design/icons";   
import dayjs from "dayjs";

import {
    signupRequest,
    emailSendRequest,
    emailVerifyRequest,
    checkLoginIdRequest,
    checkEmailRequest,
    checkNicknameRequest,
    resetDuplicateCheck,
    resetEmailVerification,
    checkPasswordLeakRequest,
    resetPasswordLeak,resetSignup,
    mobileSendRequest,
    mobileVerifyRequest,
    resetMobileVerification,
    analyzeSignupBehaviorRequest,
    resetSignupBehaviorAnalysis,
    recordSignupBehaviorFailure
} from "../../../reducers/userReducer";

const {Title,Text} = Typography;      

// 관심사
const interests=[
    {id: 1, name: "운동"},
    {id: 2, name: "여행"},
    {id: 3, name: "게임"},
    {id: 4, name: "독서"},
    {id: 5, name: "맛집"},
    {id: 6, name: "영화"},
    {id: 7, name: "음악"},
    {id: 8, name: "요리"},
];

// 비밀번호 강도 계산
const getPasswordStrength = (password) => {
    if (!password) {
        return {
            score: 0,
            percent: 0,
            text: "",
        };
    }

    let score = 0;

    // 길이
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // 영문 대문자
    if (/[A-Z]/.test(password)) score++;

    // 영문 소문자
    if (/[a-z]/.test(password)) score++;

    // 숫자
    if (/[0-9]/.test(password)) score++;

    // 특수문자
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
        return {
            score,
            percent: 25,
            text: "매우 약함",
        };
    }

    if (score === 3) {
        return {
            score,
            percent: 50,
            text: "약함",
        };
    }

    if (score === 4) {
        return {
            score,
            percent: 75,
            text: "보통",
        };
    }

    if (score === 5) {
        return {
            score,
            percent: 90,
            text: "강함",
        };
    }

    return {
        score,
        percent: 100,
        text: "매우 강함",
    };
};

function Signup(){
    const dispatch = useDispatch();
    const router = useRouter();

    const [form] = Form.useForm();


// rudux 상태
const {
    signup,
    emailVerification,
    mobileVerification,
    duplicateCheck,
    passwordLeak,
    signupBehaviorAnalysis
} = useSelector((state) => state.user);

const {
    loading: signupLoading,
    success: signupSuccess,
    error: signupError
} = signup;

useEffect(() => {
    dispatch(resetSignup());
}, [dispatch]);

// 입력된 이메일 
const [email, setEmail] = useState(""); 

const [verificationCode, setVerificationCode] = useState("");
// 입력된 아이디 
const [loginId, setLoginId] = useState(""); 
// 입력된 닉네임 
const [nickname, setNickname] = useState(""); 
// 입력된 전화번호 
const [mobile, setMobile] = useState("");

const [mobileVerificationCode, setMobileVerificationCode] = useState("");
const [mobileTimer, setMobileTimer] = useState(0);
// 입력된 비밀번호
const [password, setPassword] = useState("");

// 회원가입 행동 데이터
const [signupBehavior, setSignupBehavior] = useState({
    
    // 전체 오류 횟수
    errorCount: 0,

    // 필드별 오류 횟수
    fieldErrorCount: {
        loginId: 0,
        password: 0,
        nickname: 0,
        email: 0,
        mobile: 0,
        birth: 0,
        interestIds: 0,
    },
    emailVerificationFailCount: 0,
    mobileVerificationFailCount: 0,
    passwordErrorCount: 0,

    currentField: null,
    fieldStartTime: null,

    fieldStayTime: {
        loginId: 0,
        password: 0,
        nickname: 0,
        email: 0,
        mobile: 0,
        birth: 0,
        interestIds: 0,
    },

    // ★ 마지막으로 AI 분석을 요청한 오류 횟수
    lastAiAnalysisErrorCount: 0,

    // ★ AI 도움말을 표시할 필드
    aiHelpField: null,
});

// =========================
// 이메일 인증 실패 횟수 기록
// =========================
useEffect(() => {

    if (!emailVerification.error) {
        return;
    }

    setSignupBehavior((prev) => {

        const newCount = prev.emailVerificationFailCount + 1;

        console.log("===== 이메일 인증 실패 =====");
        console.log("실패 사유:", emailVerification.error);
        console.log("이메일 인증 실패 횟수:", newCount);

        return {
            ...prev,
            emailVerificationFailCount: newCount,
        };
    });

}, [emailVerification.error]);

useEffect(() => {

    const analysis =
        signupBehaviorAnalysis?.emailVerification;

    if (!analysis) {
        return;
    }

    const failCount =
        signupBehavior.emailVerificationFailCount;

    console.log("===== 이메일 인증 실패 횟수 확인 =====");
    console.log("failCount:", failCount);

    if (failCount < 3) {
        return;
    }

    if (analysis.result) {
        return;
    }

    if (analysis.loading) {
        return;
    }

    console.log("===== 이메일 인증 3회 이상 실패 =====");
    console.log("===== AI 회원가입 도움말 요청 =====");

    setSignupBehavior((prev) => ({
        ...prev,
        aiHelpField: "emailVerification",
    }));

    dispatch(
        analyzeSignupBehaviorRequest({
            field: "emailVerification",
            data: {
                ...signupBehavior,
                field: "emailVerification",
                failCount: failCount,
                emailVerificationFailCount: failCount,
                email: email,
            },
        })
    );

}, [
    signupBehavior.emailVerificationFailCount,
    signupBehaviorAnalysis?.emailVerification?.result,
    signupBehaviorAnalysis?.emailVerification?.loading,
    //email,
    dispatch,
]);


// =========================
// 전화번호 인증 실패 횟수 기록
// =========================
useEffect(() => {

    if (!mobileVerification.error) {
        return;
    }

    setSignupBehavior((prev) => {

        const newCount =
            prev.mobileVerificationFailCount + 1;

        console.log("===== 전화번호 인증 실패 =====");
        console.log("실패 사유:", mobileVerification.error);
        console.log("전화번호 인증 실패 횟수:", newCount);

        return {
            ...prev,
            mobileVerificationFailCount: newCount,
        };
    });

}, [mobileVerification.error]);

useEffect(() => {

    const analysis =
        signupBehaviorAnalysis?.mobileVerification;

    if (!analysis) {
        return;
    }

    const failCount =
        signupBehavior.mobileVerificationFailCount;

    console.log("===== 전화번호 인증 실패 횟수 확인 =====");
    console.log("failCount:", failCount);

    if (failCount < 3) {
        return;
    }

    if (analysis.result) {
        return;
    }

    if (analysis.loading) {
        return;
    }

    console.log("===== 전화번호 인증 3회 이상 실패 =====");
    console.log("===== AI 회원가입 도움말 요청 =====");

    setSignupBehavior((prev) => ({
        ...prev,
        aiHelpField: "mobileVerification",
    }));

    dispatch(
        analyzeSignupBehaviorRequest({
            field: "mobileVerification",
            data: {
                ...signupBehavior,
                field: "mobileVerification",
                failCount: failCount,
                mobileVerificationFailCount: failCount,
                mobile: mobile,
            },
        })
    );

}, [
    signupBehavior.mobileVerificationFailCount,
    signupBehaviorAnalysis?.mobileVerification?.result,
    signupBehaviorAnalysis?.mobileVerification?.loading,
    //mobile,
    dispatch,
]);

// 회원가입 성공처리
useEffect(()=>{
    if(signupSuccess){
        message.success("회원가입이 완료되었습니다.");

        // 회원가입 성공 상태 초기화
        dispatch(resetSignup());

        router.push("/user/member/login");
    }
},[signupSuccess,router,dispatch]);

// 전화번호 인증 타이머
useEffect(() => {

    // 타이머가 0이면 실행하지 않음
    if (mobileTimer <= 0) {
        return;
    }


    const timer = setInterval(() => {

        setMobileTimer((prev) => {

            if (prev <= 1) {
                clearInterval(timer);

                return 0;
            }

            return prev - 1;
        });

    }, 1000);


    // 컴포넌트 종료 또는 타이머 변경 시 정리
    return () => clearInterval(timer);

}, [mobileTimer]);


// =========================================================
// 전화번호 타이머 표시
// =========================================================

const formatTimer = (seconds) => {

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
};

// 필드 체류시간 기록
const moveToField = (fieldName) => {

    setSignupBehavior((prev) => {

        const now = Date.now();

        // 같은 필드에 계속 있는 경우
        // 체류시간을 다시 계산하지 않음
        if (prev.currentField === fieldName) {
            return prev;
        }

        // 처음 필드에 진입
        if (!prev.currentField || !prev.fieldStartTime) {
            return {
                ...prev,
                currentField: fieldName,
                fieldStartTime: now,
            };
        }

        // 다른 필드로 이동
        const stayTime = now - prev.fieldStartTime;

        console.log(
            "이전 필드:",
            prev.currentField,
            "체류시간:",
            stayTime,
            "ms"
        );

        return {
            ...prev,
            currentField: fieldName,
            fieldStartTime: now,

            fieldStayTime: {
                ...prev.fieldStayTime,
                [prev.currentField]:
                    prev.fieldStayTime[prev.currentField] + stayTime,
            },
        };
    });
};


// 아이디 입력변경 시
const handleLoginIdChange = (e)=>{
    const value = e.target.value;

    setLoginId(value);

    //아이디가 변경되면 기존 중복확인 무효처리
    dispatch(resetDuplicateCheck("loginId"));

    moveToField("loginId");
};

// 이메일 입력변경 시
const handleEmailChange = (e)=>{
    const value = e.target.value;

    setEmail(value);
    setVerificationCode("");

    dispatch(resetDuplicateCheck("email"));
    dispatch(resetEmailVerification());
};

// 닉네임 입력변경 시
const handleNicknameChange = (e)=>{
    const value = e.target.value;

    setNickname(value);

    dispatch(resetDuplicateCheck("nickname"));
};

// 전화번호 입력변경 시
const handleMobileChange = (e)=>{
    const value = e.target.value;

    setMobile(value);
    setMobileVerificationCode("");

    dispatch(resetMobileVerification());

    // 타이머도 초기화
    setMobileTimer(0);
};

// 아이디 중복확인
const handleCheckLoginId = ()=>{
    if(!loginId.trim()){
        message.warning("아이디를 입력해주세요.");
        return;
    }

    dispatch(checkLoginIdRequest(loginId.trim()));
};

// 비밀번호 유출검사
const handlePasswordChange = (e) => {
    const value = e.target.value;

    setPassword(value);

    // 비밀번호가 변경되면 기존 유출검사 결과 초기화
    dispatch(resetPasswordLeak());
};

useEffect(() => {

    // 8자 미만이면 검사하지 않음
    if (!password || password.length < 8) {
        return;
    }

    // 사용자가 입력을 멈춘 후 700ms 뒤 검사
    const timer = setTimeout(() => {
        dispatch(checkPasswordLeakRequest(password));
    }, 700);

    // 다음 입력이 발생하면 기존 타이머 제거
    return () => clearTimeout(timer);

}, [password, dispatch]);

// 이메일 중복확인
const handleCheckEmail = ()=>{
    if(!email.trim()){
        message.warning("이메일을 입력해주세요.");
        return;
    }

    dispatch(checkEmailRequest(email.trim()));
};

// 닉네임 중복확인
const handleCheckNickname = ()=>{
    if(!nickname.trim()){
        message.warning("닉네임을 입력해주세요.");
        return;
    }

    dispatch(checkNicknameRequest(nickname.trim()));
};

// 이메일 인증번호 발송
const handleSendEmailCode = ()=>{
    if(!email.trim()){
        message.warning("이메일을 입력해주세요.");
        return;
    }
    if(!duplicateCheck.email){
        message.warning("이메일 중복확인을 먼저 진행해주세요.");
        return;
    }

    dispatch(emailSendRequest(email.trim()));
};

// 이메일 인증번호 확인
const handleVerifyEmail = ()=>{
    const code = form.getFieldValue("verificationCode");

    if(!email.trim()){
        message.warning("이메일을 입력해주세요.");
        return;
    }
    if (!emailVerification.sent) {
        message.warning("먼저 인증번호를 발송해주세요.");
        return;
    }
    if(!verificationCode.trim()){
        message.warning("인증번호를 입력해주세요.");
        return;
    }

    dispatch(emailVerifyRequest({
        email: email.trim(),
        code: code.trim()
    }));
};

// 전화번호 인증번호 발송
const handleSendMobileCode = () => {
    if (!mobile.trim()) {
        message.warning("전화번호를 입력해주세요.");
        return;
    }

    // 기존 인증 결과 초기화
    dispatch(resetMobileVerification());

    // 인증번호 입력값 초기화
    setMobileVerificationCode("");


    // ★ 2분 = 120초
    setMobileTimer(120);



    dispatch(mobileSendRequest(mobile.trim()));
};



// 전화번호 인증번호 확인
const handleVerifyMobile = () => {
    if (!mobile.trim()) {
        message.warning("전화번호를 입력해주세요.");
        return;
    }

    if (!mobileVerification.sent) {
        message.warning("먼저 인증번호를 발송해주세요.");
        return;
    }

    // 타이머가 종료되었으면 인증 불가
    if (mobileTimer <= 0) {
        message.warning("인증번호 유효시간이 만료되었습니다. 인증번호를 다시 발송해주세요.");
        return;
    }

    if (!mobileVerificationCode.trim()) {
        message.warning("인증번호를 입력해주세요.");
        return;
    }

    dispatch(mobileVerifyRequest({
        mobile: mobile.trim(),
        code: mobileVerificationCode.trim()
    }));
};

// 회원가입
const handleSignup = (values) => {

    // =========================
    // 현재 필드 체류시간 마감
    // =========================
    const now = Date.now();

    let finalSignupBehavior = signupBehavior;

    if (
        signupBehavior.currentField &&
        signupBehavior.fieldStartTime
    ) {
        const stayTime = now - signupBehavior.fieldStartTime;

        finalSignupBehavior = {
            ...signupBehavior,
            fieldStayTime: {
                ...signupBehavior.fieldStayTime,
                [signupBehavior.currentField]:
                    signupBehavior.fieldStayTime[signupBehavior.currentField] + stayTime,
            },
        };
    }

    console.log("===== 최종 회원가입 행동 데이터 =====");
    console.log(finalSignupBehavior);

    // 중복확인 여부
    if (!duplicateCheck.loginId) {
        message.error("아이디 중복확인을 완료해주세요.");
        return;
    }

    if (!duplicateCheck.email) {
        message.error("이메일 중복확인을 완료해주세요.");
        return;
    }

    // 이메일 인증 여부
    if (!emailVerification.verified) {
        message.error("이메일 인증을 완료해주세요.");
        return;
    }

    // 닉네임 중복확인
    if (!duplicateCheck.nickname) {
        message.error("닉네임 중복확인을 완료해주세요.");
        return;
    }

    // 전화번호 인증
    if (!mobileVerification.verified) {
        message.error("전화번호 인증을 완료해주세요.");
        return;
    }

    // 비밀번호 유출 여부
    if (!passwordLeak.checked) {
        message.error("비밀번호 보안 검증을 완료해주세요.");
        return;
    }

    if (passwordLeak.leaked) {
        message.error("유출된 비밀번호는 사용할 수 없습니다.");
        return;
    }

    // 생년월일
    let birth = null;

    if (values.birth) {
        birth = values.birth.format("YYYY-MM-DD");
    }

    // 회원가입 데이터
    const signupData = {
        loginId: values.loginId,
        password: values.password,
        nickname: values.nickname,
        email: values.email,
        mobile: values.mobile,
        memberTypeId: Number(values.memberTypeId),
        gender: values.gender,
        birth: birth,
        profileUrl: "",
        interestIds: values.interestIds || [],

        // 최종 행동 데이터
        signupBehavior: finalSignupBehavior,
    };

    console.log("===== 회원가입 최종 요청 데이터 =====");
    console.log(signupData);

    dispatch(signupRequest(signupData));
};


// =========================
// 회원가입 입력 오류 발생
// =========================
const handleFinishFailed = (errorInfo) => {

    setSignupBehavior((prev) => {

        const newFieldErrorCount = {
            ...prev.fieldErrorCount,
        };

        let passwordError = false;
        let errorField = null;

        errorInfo.errorFields.forEach((field) => {

            const fieldName = field.name[0];

            if (!errorField) {
                errorField = fieldName;
            }

            // 필드별 오류 횟수 증가
            if (newFieldErrorCount[fieldName] !== undefined) {
                newFieldErrorCount[fieldName]++;
            }

            if (
                fieldName === "password" ||
                fieldName === "passwordConfirm"
            ) {
                passwordError = true;
            }
        });

        const newErrorCount = prev.errorCount + 1;

        const newPasswordErrorCount =
            passwordError
                ? prev.passwordErrorCount + 1
                : prev.passwordErrorCount;

        const newBehavior = {
            ...prev,

            errorCount: newErrorCount,

            fieldErrorCount: newFieldErrorCount,

            passwordErrorCount: newPasswordErrorCount,

            aiHelpField: errorField,
        };

        console.log("===== 회원가입 오류 발생 =====");
        console.log("오류 필드:", errorField);
        console.log("전체 오류 횟수:", newErrorCount);
        console.log("필드별 오류 횟수:", newFieldErrorCount);
        console.log("비밀번호 오류 횟수:", newPasswordErrorCount);

        return newBehavior;
    });

};

useEffect(() => {

    const passwordAnalysis =
        signupBehaviorAnalysis?.password;

    if (!passwordAnalysis) {
        return;
    }

    const failCount =
        signupBehavior.passwordErrorCount;

    console.log("===== 비밀번호 실패 횟수 확인 =====");
    console.log("failCount:", failCount);

    if (failCount < 3) {
        return;
    }

    if (passwordAnalysis.result) {
        return;
    }

    if (passwordAnalysis.loading) {
        return;
    }

    console.log("===== 비밀번호 3회 이상 실패 =====");
    console.log("===== AI 회원가입 도움말 요청 =====");

    setSignupBehavior((prev) => ({
        ...prev,
        aiHelpField: "password",
    }));

    dispatch(
        analyzeSignupBehaviorRequest({
            field: "password",
            data: {
                ...signupBehavior,
                passwordErrorCount: failCount,
                field: "password",
                failCount: failCount,
            },
        })
    );

}, [
    signupBehavior.passwordErrorCount,
    signupBehaviorAnalysis?.password?.result,
    signupBehaviorAnalysis?.password?.loading,
    dispatch,
]);

// 비밀번호 강도
const passwordStrength = getPasswordStrength(password);

// =========================
// AI 회원가입 도움말 표시
// =========================
const renderAiHelp = (fieldName) => {

    // 필드별 AI 분석 결과
    const fieldAnalysis =
        signupBehaviorAnalysis?.[fieldName];

    // AI 결과가 없으면 표시하지 않음
    if (!fieldAnalysis?.result) {
        return null;
    }

    // 현재 AI 도움말 대상 필드가 아니면 표시하지 않음
    if (signupBehavior.aiHelpField !== fieldName) {
        return null;
    }

    return (
        <div
            style={{
                marginTop: "10px",
                marginBottom: "10px",
                padding: "12px 16px",
                background: "#f0f7ff",
                border: "1px solid #91caff",
                borderRadius: "8px",
            }}
        >
            <Text strong>
                🤖 회원가입 도우미
            </Text>

            <div style={{ marginTop: "6px" }}>
                <Text>
                    {fieldAnalysis.result}
                </Text>
            </div>
        </div>
    );
};

// =========================
// 아이디 중복검사 실패 3회 이상
// AI 도움말 요청
// =========================
useEffect(() => {

    const loginIdAnalysis =
        signupBehaviorAnalysis?.loginId;

    if (!loginIdAnalysis) {
        return;
    }

    const failCount = loginIdAnalysis.failCount;

    console.log(
        "===== 아이디 중복검사 실패 횟수 확인 ====="
    );
    console.log("failCount:", failCount);

    console.log(
        "===== 아이디 실패 카운트 =====",
        "failCount:",
        failCount,
        "Redux:",
        signupBehaviorAnalysis?.loginId?.failCount,
        "requested:",
        loginIdAnalysis.requested,
        "loading:",
        loginIdAnalysis.loading,
        "result:",
        loginIdAnalysis.result
    );

    // 3회 미만이면 아무것도 하지 않음
    if (failCount < 3) {
        return;
    }

    // 이미 AI 결과가 있으면 다시 요청하지 않음
    if (loginIdAnalysis.result) {
        return;
    }

    // AI 요청 중이면 다시 요청하지 않음
    if (loginIdAnalysis.loading) {
        return;
    }

    // 이미 같은 실패 횟수로 AI 분석을 요청했다면 다시 요청하지 않음
    if (
        signupBehavior.lastAiAnalysisErrorCount >= failCount
    ) {
        return;
    }

    console.log(
        "===== 아이디 중복검사 3회 이상 ====="
    );
    console.log(
        "===== AI 회원가입 도움말 요청 ====="
    );

    // 현재 도움말 필드
    setSignupBehavior((prev) => ({
        ...prev,
        aiHelpField: "loginId",
        lastAiAnalysisErrorCount: failCount,
    }));

    // AI 분석 요청
    dispatch(
        analyzeSignupBehaviorRequest({
            field: "loginId",
            data: {
                field: "loginId",
                failCount: failCount,
                loginId: loginId,
            },
        })
    );

}, [
    signupBehaviorAnalysis?.loginId?.failCount,
    signupBehaviorAnalysis?.loginId?.result,
    signupBehaviorAnalysis?.loginId?.loading,
    signupBehavior.lastAiAnalysisErrorCount,
    //loginId,
    dispatch,
]);

// =========================
// 닉네임 중복검사 AI 분석
// 중복검사 실패 3회 이상 시 요청
// =========================
useEffect(() => {
    const failCount = signupBehaviorAnalysis?.nickname?.failCount || 0;
    const analysis = signupBehaviorAnalysis?.nickname;

    console.log("===== 닉네임 AI 분석 확인 =====");
    console.log("닉네임 중복검사 실패 횟수:", failCount);
    console.log("닉네임 AI 분석 상태:", analysis);

    // 3회 미만이면 실행하지 않음
    if (failCount < 3) { return; }

    // 이미 AI 결과가 있으면 다시 요청하지 않음
    if (analysis?.result) { return; }

    // AI 분석 중이면 다시 요청하지 않음
    if (analysis?.loading) { return; }

    console.log("===== 닉네임 중복검사 3회 이상 ====="); 
    console.log("===== AI 회원가입 도움말 요청 =====");

    // 현재 AI 도움말 필드
    setSignupBehavior((prev) => ({ ...prev, aiHelpField: "nickname", }));

    // AI 분석 요청
    dispatch( analyzeSignupBehaviorRequest({ 
        field: "nickname", 
        data: { ...signupBehavior, field: "nickname", 
        failCount: failCount, nickname: nickname, }, 
    }) );
}, [ 
    signupBehaviorAnalysis?.nickname?.failCount, 
    signupBehaviorAnalysis?.nickname?.result, 
    signupBehaviorAnalysis?.nickname?.loading, 
    dispatch, 
]);    

// =========================
// 일반 입력 필드 AI 분석
// 3회 이상 오류 발생 시 요청
// =========================
useEffect(() => {

    const targetFields = [
        "password",
        "birth",
        "interestIds",
    ];

    targetFields.forEach((fieldName) => {

        const failCount =
            signupBehavior.fieldErrorCount[fieldName];

        const analysis =
            signupBehaviorAnalysis?.[fieldName];

        console.log(
            `===== ${fieldName} AI 분석 확인 =====`
        );
        console.log("failCount:", failCount);
        console.log("analysis:", analysis);

        // 3회 미만
        if (failCount < 3) {
            return;
        }

        // 이미 결과가 있으면 다시 요청하지 않음
        if (analysis?.result) {
            return;
        }

        // AI 분석 중이면 다시 요청하지 않음
        if (analysis?.loading) {
            return;
        }

        console.log(
            `===== ${fieldName} 3회 이상 오류 =====`
        );
        console.log(
            "===== AI 회원가입 도움말 요청 ====="
        );

        // 현재 AI 도움말 필드
        setSignupBehavior((prev) => ({
            ...prev,
            aiHelpField: fieldName,
        }));

        // AI 분석 요청
        dispatch(
            analyzeSignupBehaviorRequest({
                field: fieldName,

                data: {
                    ...signupBehavior,

                    field: fieldName,

                    failCount: failCount,

                    fieldErrorCount: {
                        ...signupBehavior.fieldErrorCount,
                        [fieldName]: failCount,
                    },

                    loginId: loginId,
                    password: password,
                    nickname: nickname,
                    email: email,
                    mobile: mobile,
                },
            })
        );

    });

}, [
    signupBehavior.fieldErrorCount.password,
    signupBehavior.fieldErrorCount.nickname,
    signupBehavior.fieldErrorCount.email,
    signupBehavior.fieldErrorCount.mobile,
    signupBehavior.fieldErrorCount.birth,
    signupBehavior.fieldErrorCount.interestIds,

    signupBehaviorAnalysis?.password?.result,
    signupBehaviorAnalysis?.password?.loading,

    signupBehaviorAnalysis?.nickname?.result,
    signupBehaviorAnalysis?.nickname?.loading,

    signupBehaviorAnalysis?.email?.result,
    signupBehaviorAnalysis?.email?.loading,

    signupBehaviorAnalysis?.mobile?.result,
    signupBehaviorAnalysis?.mobile?.loading,

    signupBehaviorAnalysis?.birth?.result,
    signupBehaviorAnalysis?.birth?.loading,

    signupBehaviorAnalysis?.interestIds?.result,
    signupBehaviorAnalysis?.interestIds?.loading,

    dispatch,
]);

///////////////////////////////
return (
    <div style={{maxWidth:"900px", margin:"50px auto", padding:"0 20px"}}>
        <Card>
            {/* 제목 */}
            <div style={{textAlign:"center",marginBottom:"40px"}}>
                <Title level={2}>
                    MOIT 회원가입
                </Title>
                <Text type="secondary">
                    MOIT에서 새로운 모임을 시작해보세요.
                </Text>
            </div>
            <Form form={form} 
                  layout="vertical" 
                  onFinish={handleSignup}
                  onFinishFailed={handleFinishFailed}
                  initialValues={{
                    memberTypeId: 1,
                    gender: "N",
                    interestIds: []
                  }}
            >
                {/* 회원유형 */}
                <Divider orientation="left">
                    회원유형
                </Divider>

                <Form.Item label="회원유형"
                           name="memberTypeId"
                           rules={[
                            {
                                required: true,
                                message: "회원유형을 선택해주세요."
                            }
                           ]}
                >
                    <Radio.Group>
                        <Radio value={1}>
                           일반회원
                        </Radio>
                        <Radio value={2}>
                            제휴회원
                        </Radio>
                    </Radio.Group>
                </Form.Item>

                {/* 아이디 */}
                <Divider orientation="left">
                    계정정보
                </Divider>

                <Form.Item label="아이디"
                           name="loginId"
                           rules={[
                            {
                                required: true,
                                message: "아이디를 입력해주세요."
                            }
                           ]}
                >
                    <Space.Compact style={{width:"100%"}}>
                        <Input prefix={<UserOutlined />}
                               placeholder="아이디를 입력해주세요."
                               value={loginId}
                               onChange={handleLoginIdChange}
                               onFocus={() => moveToField("loginId")}
                        />
                        <Button type="primary"
                                onClick={handleCheckLoginId}
                        >
                            중복확인
                        </Button>
                    </Space.Compact>
                </Form.Item>
                {duplicateCheck.loginId === true && (
                    <Text type="success">
                        <CheckOutlined />
                        {" "}사용 가능한 아이디입니다.
                    </Text>
                )}

                {duplicateCheck.loginId === false && (
                    <Text type="danger">
                        이미 사용 중인 아이디입니다.
                    </Text>
                )}

                {renderAiHelp("loginId")}

                {/* 비밀번호 */}
                <Form.Item label="비밀번호"
                           name="password"
                           rules={[
                            {
                                required: true,
                                message: "비밀번호를 입력해주세요."
                            },
                            {
                                min: 8,
                                message: "비밀번호는 8자 이상 입력해주세요."
                            }
                           ]}
                           hasFeedback
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="비밀번호를 입력해주세요."
                        onChange={handlePasswordChange}
                        onFocus={() => moveToField("password")}
                    />
                </Form.Item>
                {/* 비밀번호 강도 */}
                {password && (
                    <div style={{ marginTop: "-10px", marginBottom: "15px" }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px"
                        }}>
                            <Text type="secondary">
                                비밀번호 강도
                            </Text>

                            <Text strong>
                                {passwordStrength.text}
                            </Text>
                        </div>

                        <Progress
                            percent={passwordStrength.percent}
                            showInfo={false}
                            size="small"
                        />
                    </div>
                )}
                {renderAiHelp("password")}

                {/* 비밀번호 유출 검사 */}
                {passwordLeak.checking && (
                    <div style={{ marginBottom: "10px" }}>
                        <Text type="secondary">
                            비밀번호 유출 여부 확인 중...
                        </Text>
                    </div>
                )}

                {passwordLeak.checked && !passwordLeak.leaked && (
                    <div style={{ marginBottom: "10px" }}>
                        <Text type="success">
                            <CheckOutlined />
                            {" "}유출되지 않은 안전한 비밀번호입니다.
                        </Text>
                    </div>
                )}

                {passwordLeak.checked && passwordLeak.leaked && (
                    <div style={{ marginBottom: "10px" }}>
                        <Text type="danger">
                            ⚠ 유출된 비밀번호입니다.
                            <br />
                            <strong>
                                총 {passwordLeak.count.toLocaleString()}회
                            </strong>
                            {" "}유출된 것으로 확인되었습니다.
                            <br />
                            다른 비밀번호를 사용해주세요.
                        </Text>
                    </div>
                )}

                {passwordLeak.error && (
                    <div style={{ marginBottom: "10px" }}>
                        <Text type="danger">
                            {passwordLeak.error}
                        </Text>
                    </div>
                )}

                {/* 비밀번호 확인*/}
                <Form.Item label="비밀번호 확인"
                           name="passwordConfirm"
                           dependencies={["password"]}
                           hasFeedback
                           rules={[
                            {
                                required: true,
                                message: "비밀번호를 다시 입력해주세요."
                            },                            
                            ({getFieldValue }) => ({
                                validator(_, value){
                                    if(!value || getFieldValue("password") === value){
                                        return Promise.resolve();
                                    }

                                    return Promise.reject(new Error("비밀번호가 일치하지 않습니다."));
                                }
                            })                            
                           ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="비밀번호를 다시 입력해주세요."
                    />
                </Form.Item>

                {/* 닉네임 */}
                <Form.Item label="닉네임"
                           name="nickname"
                           rules={[
                            {
                                required: true,
                                message: "닉네임을 입력해주세요."
                            }
                           ]}
                >
                    <Space.Compact style={{width:"100%"}}>
                           <Input
                                prefix={<UserOutlined />}
                                placeholder="닉네임을 입력해주세요."
                                value={nickname}
                                onChange={handleNicknameChange}
                                onFocus={() => moveToField("nickname")}
                           />
                           <Button type="primary"
                                   onClick={handleCheckNickname}
                           >
                            중복확인
                           </Button>
                    </Space.Compact>
                </Form.Item>
                {duplicateCheck.nickname === true && (
                    <Text type="success">
                        <CheckOutlined />
                        {" "}사용 가능한 닉네임입니다.
                    </Text>
                )}

                {duplicateCheck.nickname === false && (
                    <Text type="danger">
                        이미 사용 중인 닉네임입니다.
                    </Text>
                )}
                {renderAiHelp("nickname")}

                {/* 이메일 */}
                <Divider orientation="left">
                    이메일 인증
                </Divider>

                <Form.Item label="이메일"
                           name="email"
                           rules={[
                            {
                                required: true,
                                message: "이메일을 입력해주세요."
                            },
                            {
                                type: "email",
                                message: "올바른 이메일 형식을 입력해주세요."
                            }
                           ]}
                >
                    <Space.Compact style={{width:"100%"}}>
                           <Input
                                prefix={<MailOutlined />}
                                placeholder="이메일을 입력해주세요."
                                value={email}
                                onChange={handleEmailChange}
                                onFocus={() => moveToField("email")}
                           />
                           <Button onClick={handleCheckEmail}>
                            중복확인 
                           </Button>
                    </Space.Compact>
                </Form.Item>
                {duplicateCheck.email === true && (
                    <Text type="success">
                        <CheckOutlined />
                        {" "}사용 가능한 이메일입니다.
                    </Text>
                )}

                {duplicateCheck.email === false && (
                    <Text type="danger">
                        이미 사용 중인 이메일입니다.
                    </Text>
                )}
                {renderAiHelp("email")}

                <Form.Item label="이메일 인증번호" name="verificationCode">
                    <Space.Compact style={{ width: "100%" }}>

                        <Input
                            placeholder="인증번호 6자리를 입력해주세요."
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => {setVerificationCode(e.target.value);}}
                            disabled={!emailVerification.sent}
                        />

                        <Button
                            type="primary"
                            loading={emailVerification.sending}
                            onClick={handleSendEmailCode}
                            disabled={!duplicateCheck.email}
                        >
                            인증번호 발송
                        </Button>

                        <Button
                            type="primary"
                            loading={emailVerification.verifying}
                            onClick={handleVerifyEmail}
                            disabled={!emailVerification.sent}
                        >
                            인증확인
                        </Button>

                    </Space.Compact>
                </Form.Item>
                {emailVerification.verified && (
                    <Text type="success">
                        <CheckOutlined />
                        {""}이메일 인증이 완료되었습니다.
                    </Text>
                )}
                {emailVerification.error && (
                    <div style={{color:"#ff4d4f", marginTop:"8px"}}>
                        {emailVerification.error}
                    </div>
                )} 
                {renderAiHelp("emailVerification")}

                {/* 전화번호 */}  
                <Divider orientation="left">
                    개인정보
                </Divider>  

                <Form.Item
                    label="전화번호"
                    name="mobile"
                    rules={[
                        {
                            required: true,
                            message: "전화번호를 입력해주세요."
                        }
                    ]}
                >
                    <Space.Compact style={{ width: "100%" }}>
                        <Input
                            prefix={<PhoneOutlined />}
                            placeholder="전화번호를 입력해주세요."
                            value={mobile}
                            onChange={handleMobileChange}
                            onFocus={() => moveToField("mobile")}
                        />

                        <Button
                            type="primary"
                            loading={mobileVerification.sending}
                            onClick={handleSendMobileCode}
                            disabled={
                                mobileVerification.sending ||
                                mobileTimer > 0
                            }
                        >
                            {mobileTimer > 0
                                ? `재발송 ${formatTimer(mobileTimer)}`
                                : "인증번호 발송"
                            }
                        </Button>
                    </Space.Compact>
                </Form.Item>
                
                <Form.Item label="전화번호 인증번호">
                    <Space.Compact style={{ width: "100%" }}>
                        <Input
                            placeholder="인증번호를 입력해주세요."
                            maxLength={6}
                            value={mobileVerificationCode}
                            onChange={(e) => {
                                setMobileVerificationCode(e.target.value);
                            }}
                            disabled={!mobileVerification.sent ||
                                    mobileTimer <= 0 ||
                                    mobileVerification.verified}
                        />

                        <Button
                            type="primary"
                            loading={mobileVerification.verifying}
                            onClick={handleVerifyMobile}
                            disabled={!mobileVerification.sent ||
                                    mobileTimer <= 0 ||
                                    mobileVerification.verified}
                        >
                            인증확인
                        </Button>
                    </Space.Compact>
                </Form.Item> 
                {/* 전화번호 타이머 */}
                {mobileTimer > 0 && !mobileVerification.verified && (
                        <div style={{marginTop: "-15px",marginBottom: "10px" }}>
                            <Text type="secondary">
                                인증번호 유효시간{" "}
                                <Text
                                    strong
                                    type={
                                        mobileTimer <= 30
                                            ? "danger"
                                            : undefined
                                    }
                                >
                                    {formatTimer(mobileTimer)}
                                </Text>
                            </Text>
                        </div>
                    )}


                {/* 인증시간 만료 */}
                {mobileTimer === 0 &&
                    mobileVerification.sent &&
                    !mobileVerification.verified && (
                        <div style={{marginTop: "-15px", marginBottom: "10px"}}>
                            <Text type="danger">
                                인증번호 유효시간이 만료되었습니다.
                                <br />
                                인증번호를 다시 발송해주세요.
                            </Text>
                        </div>
                    )}
                {mobileVerification.verified && (
                    <Text type="success">
                        <CheckOutlined />
                        {" "}전화번호 인증이 완료되었습니다.
                    </Text>
                )}

                {mobileVerification.error && (
                    <div style={{ color: "#ff4d4f", marginTop: "8px" }}>
                        {mobileVerification.error}
                    </div>
                )}
                {renderAiHelp("mobile")}
                {renderAiHelp("mobileVerification")}

                {/* 성별 */}
                <Form.Item label="성별"
                           name="gender"
                           rules={[
                            {
                                required: true,
                                message: "성별을 선택해주세요."
                            }
                           ]}
                >
                    <Radio.Group>
                        <Radio value="M">
                            남성
                        </Radio>

                        <Radio value="F">
                            여성
                        </Radio>

                        <Radio value="N">
                            비공개
                        </Radio>
                    </Radio.Group>
                </Form.Item> 

                {/* 생년월일 */}      
                <Form.Item label="생년월일"
                           name="birth"
                           rules={[
                            {
                                required: true,
                                message: "생년월일을 입력해주세요."
                            }
                           ]}
                >
                    <DatePicker
                        style={{width:"100%"}}
                        format="YYYY-MM-DD"
                        placeholder="생년월일을 입력해주세요."
                        onFocus={() => moveToField("birth")}
                        disabledDate={(current)=> current && current > dayjs().endOf("day")}
                    />
                </Form.Item>
                {renderAiHelp("birth")}

                {/* 관심사 */}
                <Form.Item label="관심사"
                           name="interestIds"
                           rules={[
                            {
                                required: true,
                                message: "관심사를 하나 이상 선택해주세요."
                            }
                           ]}
                >
                    <Checkbox.Group style={{width:"100%"}} onFocus={() => moveToField("interestIds")}>
                        <Row gutter={[16,16]}>
                           {interests.map((interest)=>(
                            <Col xs={12} sm={8} md={6} key={interest.id}>
                                <Checkbox value={interest.id}>
                                    {interest.name}
                                </Checkbox>
                            </Col>
                           ))}
                        </Row>
                    </Checkbox.Group>
                </Form.Item>
                {renderAiHelp("interestIds")}

                {/* AI 회원가입 도움말 */}
                {signupBehaviorAnalysis.loading && (
                    <div
                        style={{
                            marginBottom: "20px",
                            padding: "15px 20px",
                            background: "#f5f5f5",
                            borderRadius: "10px",
                            textAlign: "center",
                        }}
                    >
                        <Text type="secondary">
                            회원가입을 도와드리기 위해 확인하고 있습니다...
                        </Text>
                    </div>
                )}           

                {/* 회원가입 버튼 */}
                <Form.Item style={{marginTop:"40px"}}>
                    <Button type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={signupLoading}
                    >
                    회원가입
                    </Button>
                </Form.Item>

                {/* 로그인 페이지로 이동 */}
                <div style={{textAlign:"center"}}>
                    <Text type="secondary">
                        이미 회원이신가요?
                    </Text>
                    <Button type="link"
                            onClick={()=>router.push("/user/member/login")}
                    >
                        로그인
                    </Button>
                </div> 

                {signupError && (
                    <div style={{marginTop:"20px", textAlign:"center", color:"#ff4d4f"}}>
                        {signupError}
                    </div>
                )}    

            </Form>
        </Card>
    </div>
);
}
export default Signup;