import React, { useEffect } from "react";
import Head from "next/head";
import { getMyInfoRequest } from "../reducers/userReducer";

import { wrapper } from "../store/configureStore";
import UserLayout from "../components/layout/UserLayout";
import AdminLayout from "../components/layout/AdminLayout";

import "antd/dist/antd.css";
import "../styles/global.css";
import "../styles/AdBanner.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { useDispatch } from "react-redux";


function MyApp({ Component, pageProps, router }) {
    const dispatch = useDispatch();

    const isAdminPage = router.pathname.startsWith("/admin");

    // OAuth2 callback 페이지
    const isOAuthCallbackPage = router.pathname === "/oauth2/callback";

    // =====================================================
    // 새로고침 시 Redux user 복구
    // =====================================================
    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {
            dispatch(getMyInfoRequest());
        }
    }, [dispatch]);

    return (
        <>
            <Head>
                <script
                    type="text/javascript"
                    src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
                />
            </Head>

            {/* OAuth callback은 레이아웃 없이 처리 */}
            {isOAuthCallbackPage ? (
                <Component {...pageProps} />
            ) : isAdminPage ? (
                <AdminLayout>
                    <Component {...pageProps} />
                </AdminLayout>
            ) : (
                <UserLayout>
                    <Component {...pageProps} />
                </UserLayout>
            )}
        </>
    );
}

export default wrapper.withRedux(MyApp);