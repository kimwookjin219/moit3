import React, { useState, useEffect } from 'react';
import {Card, Typography, Space, Avatar, Pagination, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

function QnaSection({ qnaLists = [], meetupId }) {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const pageSize = 5;
    const total = qnaLists.length;
    const startIndex = (page - 1) * pageSize;
    const currentQnaLists = qnaLists.slice(
        startIndex,
        startIndex + pageSize
    );

    useEffect(() => {
        setPage(1);
    }, [qnaLists]);

    return (
        <div>
            <Title level={4}>Q&A</Title>

            <Space
                direction="vertical"
                style={{ width: '100%' }}
            >
                {qnaLists.length === 0 ? (
                    <Card>
                        <Text type="secondary">
                            아직 등록된 Q&A가 없습니다.
                        </Text>
                    </Card>
                ) : (
                    currentQnaLists.map((qna) => (
                        <Card
                            key={qna.questionId}
                            hoverable
                            className="qna-card"
                            onClick={() =>
                                router.push(
                                    `/user/qna/questionDetail?questionId=${qna.questionId}&from=meetup`
                                )
                            }
                        >
                            {/* 작성자 + 상태 */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Space>
                                    <Avatar icon={<UserOutlined />} />

                                    <Text strong>
                                        {qna.nickname || '익명'}
                                    </Text>
                                </Space>

                                {qna.qnaStatus === 'PENDING' ? (
                                    <Tag color="orange">
                                        답변 대기
                                    </Tag>
                                ) : (
                                    <Tag color="green">
                                        답변 완료
                                    </Tag>
                                )}
                            </div>

                            {/* 제목 */}
                            <div style={{ marginTop: 16 }}>
                                <Text strong style={{ fontSize: 16 }}>
                                    {qna.title}
                                </Text>
                            </div>

                            {/* 내용 */}
                            <Paragraph style={{ marginTop: 8 }}>
                                {qna.content}
                            </Paragraph>

                            {/* 날짜 */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginTop: 12,
                                }}
                            >
                                <Text type="secondary">
                                    등록일 :{' '}
                                    {qna.createdAt
                                        ? dayjs(qna.createdAt).format('YYYY.MM.DD HH:mm:ss')
                                        : '-'}
                                </Text>
                            </div>
                        </Card>
                    ))
                )}
            </Space>

            {/* 페이지네이션 */}
            {total > pageSize && (
                <div
                    style={{
                        marginTop: 24,
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Pagination
                        current={page}
                        pageSize={pageSize}
                        total={total}
                        showSizeChanger={false}
                        onChange={(newPage) => {
                            setPage(newPage);
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default QnaSection;