import React, { useEffect, useRef } from "react";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

function MeetupMap({ latitude, longitude, address }) {
    const mapRef = useRef(null);

    useEffect(() => {
        if (latitude == null || longitude == null) {
            return;
        }

        if (!window.naver || !window.naver.maps) {
            console.error("네이버 지도 API가 로드되지 않았습니다.");
            return;
        }

        const position = new window.naver.maps.LatLng(
            Number(latitude),
            Number(longitude),
        );

        const map = new window.naver.maps.Map(mapRef.current, {
            center: position,
            zoom: 16,
        });

        new window.naver.maps.Marker({
            position,
            map,
        });
    }, [latitude, longitude]);

    return (
        <Card className="mypage-user-info" style={{ marginTop: 20 }}>
            <Title level={4}>모임 위치</Title>

            <div
                ref={mapRef}
                style={{
                    width: "100%",
                    height: "300px",
                    borderRadius: 8,
                    overflow: "hidden",
                }}
            />

            {address && (
                <Text
                    type="secondary"
                    style={{
                        display: "block",
                        marginTop: 10,
                    }}
                >
                    {address}
                </Text>
            )}
        </Card>
    );
}

export default MeetupMap;
