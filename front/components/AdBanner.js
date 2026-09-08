import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Card, Typography } from "antd";

import {
    getTopAdvertisement,
    increaseAdvertisementImpression,
    increaseAdvertisementClick,
} from "../api/advertiseApi";

const { Text } = Typography;

function AdBanner({ position }) {

    const [ad, setAd] = useState(null);

    const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

    // 한 번의 화면 렌더링에서 노출 API 중복 호출 방지
    const impressionSent = useRef(false);


    // =========================================================
    // 광고 조회
    // =========================================================

    useEffect(() => {

        // position이 없으면 조회하지 않음
        if (!position) {
            return;
        }

        // 위치가 변경되면 이전 노출 처리 상태 초기화
        impressionSent.current = false;

        const fetchAdvertisement = async () => {

            try {

                const response =
                    await getTopAdvertisement(position);

                if (!response?.data) {
                    setAd(null);
                    return;
                }

                setAd(response.data);

            } catch (error) {

                console.error(
                    `${position} 광고 조회 실패:`,
                    error
                );

                setAd(null);
            }

        };

        fetchAdvertisement();

    }, [position]);


    // =========================================================
    // 광고 노출
    // =========================================================

    useEffect(() => {

        if (!ad?.adId) {
            return;
        }

        if (impressionSent.current) {
            return;
        }

        const sendImpression = async () => {

            try {

                await increaseAdvertisementImpression(
                    ad.adId,
                    position
                );

                impressionSent.current = true;

            } catch (error) {

                console.error(
                    "광고 노출 처리 실패:",
                    error
                );

            }

        };

        sendImpression();

    }, [ad, position]);


    // =========================================================
    // 광고 클릭
    // =========================================================

    const handleClick = async () => {

        if (!ad?.adId) {
            return;
        }

        try {

            await increaseAdvertisementClick(
                ad.adId,
                position
            );

        } catch (error) {

            console.error( "광고 클릭 처리 실패:" );

        } finally {

            if (ad.landingUrl) {
                window.location.href = ad.landingUrl;
            }

        }

    };


    // =========================================================
    // 현재 위치에 맞는 이미지
    // =========================================================

    const adImage =
        ad?.imageList?.find(
            (image) =>
                image.imageType === position
        );


    // 광고가 없는 경우
    if (!ad) {
        return null;
    }


    return (
        <Row>
            <Col span={24}>

                <Card
                    hoverable
                    className={`main-ad-card ad-${position}`}
                    onClick={handleClick}
                    styles={{
                        body: {
                            padding: 0
                        }
                    }}
                >

                    {/* 광고 이미지 */}

                    {adImage?.imageUrl ? (

                        <img
                            src={`${API_BASE_URL}${adImage.imageUrl}`}
                            alt={ad.title || "광고"}
                            className={`ad-image ad-${position}`}
                        />

                    ) : (

                        <div className="ad-placeholder">

                            <Text type="secondary">
                                현재 진행 중인 광고가 없습니다.
                            </Text>

                        </div>

                    )}


                    {/* PREMIUM 광고 */}

                    {ad.adGrade === "PREMIUM" && (

                        <div
                            className="premium-ad-overlay"
                            onClick={handleClick}
                        >

                            <div className="premium-ad-title">
                                {ad.title}
                            </div>

                            <div className="premium-ad-content">
                                {ad.content}
                            </div>

                        </div>

                    )}

                </Card>

            </Col>
        </Row>
    );
}

export default AdBanner;