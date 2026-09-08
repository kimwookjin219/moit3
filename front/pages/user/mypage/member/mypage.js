import React, { useEffect } from "react";
import { Layout, Spin, message } from "antd";
import { useDispatch, useSelector } from "react-redux";

import MyPageUserInfo from "../../../../components/MyPageUserInfo";

import { getMyPageRequest } from "../../../../reducers/userReducer";

const { Content } = Layout;

function MyPage() {
    const dispatch = useDispatch();

    // Redux 회원정보
    const userState = useSelector((state) => state.user);

    const user = userState?.user;
    const loading = userState?.loading;
    const error = userState?.error;


    // 마이페이지 진입 시 내 정보 조회
    useEffect(() => {
        // console.log("===== GET MY INFO REQUEST =====");

        dispatch(getMyPageRequest());
    }, [dispatch]);

    // 회원정보 조회 실패
    useEffect(() => {
        if (error) {
            message.error(error);
        }
    }, [error]);

    return (
        <Layout className="mypage-layout">

            <Content className="mypage-content">

                {loading ? (

                    <div className="mypage-loading">
                        <Spin size="large" />
                    </div>

                ) : user ? (

                    <MyPageUserInfo user={user} />

                ) : (

                    <div className="mypage-empty">
                        회원정보를 불러오지 못했습니다.
                    </div>

                )}

            </Content>

        </Layout>
    );
}

export default MyPage;