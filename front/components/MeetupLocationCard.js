import React, { useEffect, useRef } from "react";
import { Card, Typography } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function MeetupLocationCard({ selectedAddress }) {
    const mapRef = useRef(null);

    useEffect(() => {
        if (
            !selectedAddress ||
            !selectedAddress.latitude ||
            !selectedAddress.longitude
        ) {
            return;
        }

        if (!window.naver || !window.naver.maps) {
            console.log("네이버 지도 API가 로드되지 않았습니다.");
            return;
        }
        const latitude = Number(selectedAddress.latitude);
        const longitude = Number(selectedAddress.longitude);

        const position = new window.naver.maps.LatLng(latitude, longitude);

        const map = new window.naver.maps.Map(mapRef.current, {
            center: position,
            zoom: 16,
        });

        new window.naver.maps.Marker({
            position,
            map,
        });
    }, [selectedAddress]);

    return (
        <Card className="mypage-user-info" style={{ marginTop: 20 }}>
            <Title level={4}>모임 위치</Title>

            <div
                ref={mapRef}
                className="meetup-map"
                style={{
                    width: "100%",
                    height: "300px",
                }}
            />

            <Text
                type="secondary"
                style={{
                    display: "block",
                    marginTop: 10,
                }}
            >
                {selectedAddress
                    ? selectedAddress.address
                    : "주소를 선택하면 지도가 표시됩니다."}
            </Text>
        </Card>
    );
}

export default MeetupLocationCard;
