import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Card,
    Row,
    Col,
    Button,
    Typography,
    Tag,
    Space,
    Divider,
    Spin,
    Empty,
    message,
    Modal,
} from "antd";
import {
    DesktopOutlined,
    MobileOutlined,
    LogoutOutlined,
    SafetyOutlined,
} from "@ant-design/icons";

import {
    getLoginDevicesRequest,
    deleteLoginDeviceRequest,
    deleteAllLoginDevicesRequest,
    resetDeleteLoginDevice,
    resetDeleteAllLoginDevices,
} from "../../../../reducers/userReducer";

const { Title, Text } = Typography;

function SecurityCenter() {

    const dispatch = useDispatch();

    const {
        data: devices,
        loading,
        error,
    } = useSelector(
        (state) => state.user.loginDevices
    );

    const {
        loading: deleteLoading,
        success: deleteSuccess,
        error: deleteError,
    } = useSelector(
        (state) => state.user.deleteLoginDevice
    );

    const {
        loading: deleteAllLoading,
        success: deleteAllSuccess,
        error: deleteAllError,
    } = useSelector(
        (state) => state.user.deleteAllLoginDevices
    );


    // =====================================================
    // 로그인 기기 조회
    // =====================================================

    useEffect(() => {

        dispatch(getLoginDevicesRequest());

    }, [dispatch]);


    // =====================================================
    // 특정 기기 로그아웃 성공
    // =====================================================

    useEffect(() => {

        if (deleteSuccess) {

            message.success("해당 기기에서 로그아웃되었습니다.");

            dispatch(resetDeleteLoginDevice());

        }

    }, [deleteSuccess, dispatch]);


    // =====================================================
    // 특정 기기 로그아웃 실패
    // =====================================================

    useEffect(() => {

        if (deleteError) {

            message.error(deleteError);

            dispatch(resetDeleteLoginDevice());

        }

    }, [deleteError, dispatch]);


    // =====================================================
    // 모든 기기 로그아웃 성공
    // =====================================================

    useEffect(() => {

        if (deleteAllSuccess) {

            message.success(
                "모든 기기에서 로그아웃되었습니다."
            );

            dispatch(resetDeleteAllLoginDevices());

        }

    }, [deleteAllSuccess, dispatch]);


    // =====================================================
    // 모든 기기 로그아웃 실패
    // =====================================================

    useEffect(() => {

        if (deleteAllError) {

            message.error(deleteAllError);

            dispatch(resetDeleteAllLoginDevices());

        }

    }, [deleteAllError, dispatch]);


    // =====================================================
    // 특정 기기 로그아웃
    // =====================================================

    const handleDeleteDevice = (deviceId) => {

        Modal.confirm({

            title: "기기 로그아웃",

            content:
                "이 기기에서 로그아웃하시겠습니까?",

            okText: "로그아웃",

            cancelText: "취소",

            onOk: () => {

                dispatch(
                    deleteLoginDeviceRequest(deviceId)
                );

            },

        });

    };


    // =====================================================
    // 모든 기기 로그아웃
    // =====================================================

    const handleDeleteAllDevices = () => {

        Modal.confirm({

            title: "모든 기기 로그아웃",

            content:
                "현재 로그인된 모든 기기에서 로그아웃하시겠습니까?",

            okText: "모두 로그아웃",

            cancelText: "취소",

            onOk: () => {

                dispatch(
                    deleteAllLoginDevicesRequest()
                );

            },

        });

    };


    // =====================================================
    // 기기 아이콘
    // =====================================================

    const getDeviceIcon = (userAgent) => {

        if (!userAgent) {
            return <DesktopOutlined />;
        }

        const ua = userAgent.toLowerCase();

        if (
            ua.includes("android") ||
            ua.includes("iphone") ||
            ua.includes("ipad")
        ) {
            return <MobileOutlined />;
        }

        return <DesktopOutlined />;
    };


    // =====================================================
    // 날짜 포맷
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString(
            "ko-KR",
            {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };


    // =====================================================
    // 화면
    // =====================================================

    return (

        <div
            style={{
                maxWidth: "1000px",
                margin: "0 auto",
                padding: "40px 20px",
            }}
        >

            {/* ============================================
                제목
            ============================================ */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "30px",
                }}
            >

                <div>

                    <Title
                        level={2}
                        style={{ marginBottom: 8 }}
                    >
                        <SafetyOutlined /> 로그인 기기 관리
                    </Title>

                    <Text type="secondary">
                        현재 로그인된 기기를 확인하고
                        관리할 수 있습니다.
                    </Text>

                </div>


                <Button
                    danger
                    icon={<LogoutOutlined />}
                    loading={deleteAllLoading}
                    onClick={handleDeleteAllDevices}
                >
                    모든 기기 로그아웃
                </Button>

            </div>


            {/* ============================================
                로딩
            ============================================ */}

            {loading && (

                <div
                    style={{
                        textAlign: "center",
                        padding: "80px 0",
                    }}
                >

                    <Spin size="large" />

                </div>

            )}


            {/* ============================================
                오류
            ============================================ */}

            {!loading && error && (

                <Card>

                    <Text type="danger">
                        {error}
                    </Text>

                </Card>

            )}


            {/* ============================================
                로그인 기기 없음
            ============================================ */}

            {!loading &&
                !error &&
                devices.length === 0 && (

                    <Card>

                        <Empty
                            description="로그인된 기기가 없습니다."
                        />

                    </Card>

                )
            }


            {/* ============================================
                로그인 기기 목록
            ============================================ */}

            {!loading &&
                !error &&
                devices.length > 0 && (

                    <Row gutter={[20, 20]}>

                        {devices.map((device) => (

                            <Col
                                xs={24}
                                md={12}
                                key={device.deviceId}
                            >

                                <Card>

                                    {/* 기기 정보 */}

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent:
                                                "space-between",
                                            alignItems: "flex-start",
                                        }}
                                    >

                                        <Space
                                            align="start"
                                            size={15}
                                        >

                                            <div
                                                style={{
                                                    fontSize: 32,
                                                }}
                                            >
                                                {
                                                    getDeviceIcon(
                                                        device.userAgent
                                                    )
                                                }
                                            </div>


                                            <div>

                                                <div
                                                    style={{
                                                        fontSize: 17,
                                                        fontWeight: 600,
                                                        marginBottom: 8,
                                                    }}
                                                >

                                                    {device.deviceName ||
                                                        "로그인 기기"}

                                                    {device.current && (

                                                        <Tag
                                                            color="blue"
                                                            style={{
                                                                marginLeft: 8,
                                                            }}
                                                        >
                                                            현재 기기
                                                        </Tag>

                                                    )}

                                                </div>


                                                <Text type="secondary">
                                                    IP 주소 :{" "}
                                                    {device.ipAddress ||
                                                        "-"}
                                                </Text>

                                                <br />

                                                <Text type="secondary">
                                                    로그인 방식 :{" "}
                                                    {device.loginType ||
                                                        "-"}
                                                </Text>

                                                <br />

                                                <Text type="secondary">
                                                    최근 로그인 :{" "}
                                                    {formatDate(
                                                        device.lastLoginAt
                                                    )}
                                                </Text>

                                            </div>

                                        </Space>


                                        {/* 현재 기기가 아니면 로그아웃 */}

                                        {!device.current && (

                                            <Button
                                                danger
                                                size="small"
                                                icon={
                                                    <LogoutOutlined />
                                                }
                                                loading={
                                                    deleteLoading
                                                }
                                                onClick={() =>
                                                    handleDeleteDevice(
                                                        device.deviceId
                                                    )
                                                }
                                            >
                                                로그아웃
                                            </Button>

                                        )}

                                    </div>


                                    <Divider
                                        style={{
                                            margin:
                                                "20px 0 15px",
                                        }}
                                    />


                                    {/* User-Agent */}

                                    <Text
                                        type="secondary"
                                        style={{
                                            fontSize: 12,
                                            wordBreak:
                                                "break-all",
                                        }}
                                    >
                                        {device.userAgent ||
                                            "브라우저 정보 없음"}
                                    </Text>

                                </Card>

                            </Col>

                        ))}

                    </Row>

                )
            }

        </div>

    );
}

export default SecurityCenter;