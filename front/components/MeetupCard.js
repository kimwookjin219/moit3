import React from "react";
import { Card, Space, Tag, Button } from "antd";

function MeetupCard({ meetup, onClick, onToggleLike }) {
    const isRecruiting = meetup.meetupStatus === "RECRUITING";
    //console.log(meetup);
    return (
        <Card
            hoverable
            className="meetup-card"
            onClick={() => onClick?.(meetup.meetupId ?? meetup.id)}
            cover={
                <div className="meetup-image">
                    <img
                        src={
                            meetup.imagePath
                                ? `http://localhost:8080/upload/meetup/${meetup.imagePath}`
                                : "http://localhost:8080/upload/no-image.png"
                        }
                        alt={meetup.title}
                    />
                </div>
            }
        >
            <div className="meetup-card-body">
                {/* 상태 */}
                {meetup.meetupStatus && (
                    <Tag color={isRecruiting ? "green" : "default"}>
                        {isRecruiting ? "모집중" : "종료"}
                    </Tag>
                )}

                {/* 제목 */}
                <div className="meetup-card-title">{meetup.title}</div>

                {/* 카테고리 */}
                {meetup.categoryName && (
                    <div className="meetup-card-info">
                        🏃 {meetup.categoryName}
                    </div>
                )}

                {/* 지역 */}
                {meetup.location || meetup.sigunguName ? (
                    <div className="meetup-card-info">
                        📍 {meetup.location ?? meetup.sigunguName}
                    </div>
                ) : null}

                {/* 인원 */}
                {meetup.totalParticipants !== undefined && (
                    <div className="meetup-card-info">
                        👥 {meetup.totalParticipants} / {meetup.maxParticipants}
                    </div>
                )}

                {/* 하단 */}
                <div className="meetup-card-footer">
                    <div className="meetup-card-dates">
                        {meetup.meetupAt && (
                            <div className="meetup-date">
                                <span className="meetup-date-label">
                                    📅 모임일
                                </span>
                                <span>
                                    {meetup.meetupAt
                                        .replace("T", " ")
                                        .slice(0, 16)}
                                </span>
                            </div>
                        )}

                        {meetup.createdAt && (
                            <div className="meetup-date">
                                <span className="meetup-date-label">
                                    📝 등록일
                                </span>
                                <span>
                                    {meetup.createdAt
                                        .replace("T", " ")
                                        .slice(0, 16)}
                                </span>
                            </div>
                        )}
                    </div>

                    {meetup.likeCount !== undefined && (
                        <Button
                            type="text"
                            className="meetup-like-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleLike?.(meetup.meetupId ?? meetup.id);
                            }}
                        >
                            {meetup.hasLike ? "❤️" : "🤍"} {meetup.likeCount}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}

export default MeetupCard;
