import React from "react";
import { Avatar, Tag } from "antd";

function MypageHeader({ user, point = 0 }) {

    const getMemberType = (memberTypeId) => {
        switch (Number(memberTypeId)) {
            case 1:
                return "일반회원";

            case 2:
                return "제휴업체";

            case 3:
                return "관리자";

            case 4:
                return "최고관리자";

            default:
                return "-";
        }
    };

    const getTrustBadge = (trustScore) => {
        const score = Number(trustScore);

        if (score >= 80) {
            return <Tag color="green">정상</Tag>;
        }

        if (score >= 40) {
            return <Tag color="orange">주의</Tag>;
        }

        return <Tag color="red">위험</Tag>;
    };

    const getProfileImageUrl = (profileUrl) => {

        if (!profileUrl) {
            return "/images/moit.png";
        }

        if (profileUrl === "/images/moit.png") {
            return "/images/moit.png";
        }

        if (profileUrl.startsWith("http")) {
            return profileUrl;
        }

        return `${process.env.NEXT_PUBLIC_API_BASE_URL}${profileUrl}`;
    };

    return (
        <div className="mypage-profile-card">

            {/* =========================
                프로필 이미지
            ========================= */}
            <div className="mypage-profile-image">
                <Avatar
                    size={72}
                    src={getProfileImageUrl(user?.profileUrl)}
                >
                    {!user?.profileUrl &&
                        user?.nickname?.charAt(0)}
                </Avatar>
            </div>


            {/* =========================
                회원 정보
            ========================= */}
            <div className="mypage-profile-info">

                {/* 닉네임 */}
                <h6>
                    {user?.nickname || "-"}
                </h6>

                {/* 이메일 */}
                <p>
                    {user?.email || "-"}
                </p>

                {/* 신뢰도 점수 */}
                <div className="mypage-trust-score">
                    <span>매너점수: </span>
                    <strong>{user?.trustScore}점</strong>

                    <span style={{ marginLeft: "8px" }}>
                        {getTrustBadge(user?.trustScore)}
                    </span>
                </div>

                {/* 회원 유형 */}
                <Tag>
                    {getMemberType(user?.memberTypeId)}
                </Tag>


            </div>
            


            {/* =========================
                포인트
            ========================= */}
            <div className="mypage-profile-point">

                <span className="mypage-point-label">
                    보유 포인트
                </span>

                <strong>
                    {Number(point || 0).toLocaleString()}
                    <span> P</span>
                </strong>

            </div>

        </div>
    );
}

export default MypageHeader;