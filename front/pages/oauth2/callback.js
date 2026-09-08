import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import { loginSuccess } from "../../reducers/userReducer";

function OAuth2Callback() {
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        const { accessToken, refreshToken } = router.query;

        if (!accessToken || !refreshToken) {
            return;
        }

        const accessTokenString = Array.isArray(accessToken)
            ? accessToken[0]
            : accessToken;

        const refreshTokenString = Array.isArray(refreshToken)
            ? refreshToken[0]
            : refreshToken;

        // JWT 저장
        localStorage.setItem(
            "accessToken",
            accessTokenString
        );

        localStorage.setItem(
            "refreshToken",
            refreshTokenString
        );

        // Redux 로그인 상태
        dispatch(
            loginSuccess({
                accessToken: accessTokenString,
                refreshToken: refreshTokenString,
            })
        );

        // 메인 페이지로 이동
        router.replace("/");
    }, [
        router.isReady,
        router.query.accessToken,
        router.query.refreshToken,
        dispatch,
    ]);

    return (
        <div
            style={{
                textAlign: "center",
                marginTop: "100px",
            }}
        >
            소셜 로그인 처리 중입니다...
        </div>
    );
}

export default OAuth2Callback;