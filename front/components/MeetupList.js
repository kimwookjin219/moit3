import React from "react";
import { Row, Col } from "antd";
import MeetupCard from "./MeetupCard";

function MeetupList({ meetups = [], onClick, onToggleLike }) {
    return (
        <div className="meetup-list">
            <Row gutter={[20, 20]}>
                {meetups.map((meetup) => (
                    <Col xs={24} sm={12} lg={8} key={meetup.id}>
                        <MeetupCard
                            meetup={meetup}
                            onClick={onClick}
                            onToggleLike={onToggleLike}
                        />
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default MeetupList;
