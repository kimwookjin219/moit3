import React from "react";
import { Card, Tabs, Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import ReviewSection from "./ReviewSection";
import QnaSection from "./QnaSection";

const { Title, Text, Paragraph } = Typography;

function MeetupTabs({ activeTab, setActiveTab, meetup, reviews, qnaLists, meetupId,onWriteReview,onLikeReview,onSortChange,onSearch,isHost, onReport }) {
    const items = [
        {
            key: "detail",
            label: "상세정보",
            children: (
                <div>
                    <Title level={4}>모임 안내</Title>
                    <Paragraph>{meetup.content}</Paragraph>
                </div>
            ),
        },

        // {
        //   key: 'applicant',
        //   label: '신청자',
        //   children: (
        //     <div>
        //       <Title level={4}>참여자</Title>

        //       <Text>
        //         {meetup.author} 외 {meetup.participants - 1}명
        //       </Text>

        //       <div style={{ marginTop: 20 }}>
        //         <Avatar.Group>
        //           <Avatar icon={<UserOutlined />} />
        //           <Avatar icon={<UserOutlined />} />
        //           <Avatar icon={<UserOutlined />} />
        //           <Avatar>+5</Avatar>
        //         </Avatar.Group>
        //       </div>
        //     </div>
        //   ),
        // },

    {
      key: 'review',
      label: '후기',
      children: (
        <ReviewSection 
          reviews={reviews} 
          meetupId={meetupId || meetup?.meetupId} 
          onWriteReview={onWriteReview}
          onLikeReview={onLikeReview}
          onSortChange={onSortChange}   
          onSearch={onSearch}
          isHost={isHost}
          onReport={onReport}
          meetupStatus={meetup?.meetupStatus}//추가
        />
      ),
    },

    {
      key: 'qna',
      label: 'Q&A',
      children: <QnaSection qnaLists={qnaLists} meetupId={meetup.meetupId} />,
    },
  ];

    return (
        <Card className="meetup-tabs-card">
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
        </Card>
    );
}

export default MeetupTabs;
