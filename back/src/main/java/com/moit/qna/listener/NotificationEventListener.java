package com.moit.qna.listener;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.moit.qna.dao.QuestionMapper;
import com.moit.qna.dto.NotificationDto;
import com.moit.qna.dto.QuestionDto.QuestionResponseDto;
import com.moit.qna.event.AnswerCreatedEvent;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final QuestionMapper questionMapper;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(AnswerCreatedEvent event) {
    	QuestionResponseDto question = questionMapper.findById(event.getQuestionId());
        NotificationDto dto = new NotificationDto();

        dto.setQuestionId(question.getQuestionId());
        dto.setMemberId(question.getMemberId());

        dto.setType("ANSWER_CREATED");
        dto.setMessage("'" + question.getTitle() + "' 문의에 답변이 등록되었습니다.");
        // 알림 생성
        questionMapper.insertNotification(dto);
        // 알림이 10개를 초과하면 가장 오래된 알림 삭제
        int notificationCount = questionMapper.countNotifications(dto.getMemberId());
        if (notificationCount > 10) {
            questionMapper.deleteOldestNotification(dto.getMemberId());
        }
    }
}