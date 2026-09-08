package com.moit.qna.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.moit.qna.dao.QuestionMapper;
import com.moit.qna.dto.NotificationDto;
import com.moit.qna.enums.IsRead;
import com.moit.qna.repository.QuestionNotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final QuestionMapper questionMapper;
    private final QuestionNotificationRepository questionNotificationRepository;

    public List<NotificationDto> selectUnread(Long memberId) {
        return questionMapper.selectUnread(memberId);
    }

    public List<NotificationDto> selectAll(Long memberId) {
        return questionMapper.selectAll(memberId);
    }

    public void readNotification(Long notificationId, Long memberId) {
        questionMapper.readNotification(notificationId, memberId);
    }

    public void readAllNotifications(Long memberId) {
        questionMapper.readAllNotifications(memberId);
    }
    
    public int unreadCount(Long memberId) {
    	return (int) questionNotificationRepository.countByMember_IdAndIsRead(
                memberId,
                IsRead.N
        );
    }
    
    public void deleteNotification(Long notificationId,Long memberId) {
        questionMapper.deleteNotification(
            notificationId,
            memberId
        );
    }
    
    @Transactional
    public void delete(Long answerId, Long questionId) {
        questionMapper.deleteAnswer(answerId);
        questionMapper.updateStatusPending(questionId);
        questionMapper.deleteAnswerNotification(questionId);
    }
    
}