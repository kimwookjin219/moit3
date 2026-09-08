package com.moit.qna.service;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import com.moit.qna.dao.QuestionMapper;
import com.moit.qna.dto.AnswerDto.AnswerRequestDto;
import com.moit.qna.dto.AnswerDto.AnswerResponseDto;
import com.moit.qna.dto.AnswerDto.SatisfactionRequestDto;
import com.moit.qna.event.AnswerCreatedEvent;
import com.moit.qna.repository.QuestionAnswerRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnswerService {
    private final QuestionMapper questionMapper;
    private final ApplicationEventPublisher publisher;
    private final QuestionAnswerRepository questionAnswerRepository;

    // 답변 등록 + 문의 상태 업데이트
    @Transactional
    public void register(AnswerRequestDto dto, Long memberId) {
    	dto.setMemberId(memberId);
        AnswerResponseDto oldAnswer = questionMapper.findByQuestionIdAll(dto.getQuestionId());
        if (oldAnswer == null) {
            questionMapper.insertAnswer(dto);
        } else {
            dto.setAnswerId(oldAnswer.getAnswerId());
            questionMapper.restoreAnswer(dto);
        }
        questionMapper.updateStatusAnswered(dto.getQuestionId());
        publisher.publishEvent(new AnswerCreatedEvent(dto.getQuestionId()));
    }

    // 답변 수정
    public void update(AnswerRequestDto dto) {
        questionMapper.updateAnswer(dto);
    }

    // 답변 삭제
    @Transactional
    public void delete(Long answerId, Long questionId) {
        questionMapper.deleteAnswer(answerId);
        questionMapper.updateStatusPending(questionId);
        questionMapper.deleteAnswerNotification(questionId);
    }

    // 답변 조회
    public AnswerResponseDto getAnswer(Long questionId) {
        return questionMapper.findByQuestionId(questionId);
    }
    
    // 답변 만족도 평가
    @Transactional
    public void updateSatisfaction(SatisfactionRequestDto dto, Long memberId) {
        Long questionWriterId = questionAnswerRepository.findQuestionWriterIdByAnswerId(dto.getAnswerId());
        if (questionWriterId == null || !questionWriterId.equals(memberId)) {
            throw new IllegalStateException("질문 작성자만 만족도 평가를 할 수 있습니다.");
        }
        questionAnswerRepository.updateSatisfaction(
                dto.getAnswerId(),
                dto.getRating(),
                dto.getFeedback()
        );
    }
    
    // 답변 만족도 삭제
    @Transactional
    public void deleteSatisfaction(Long answerId, Long memberId) {
        // 질문 작성자 확인
        Long questionWriterId = questionAnswerRepository.findQuestionWriterIdByAnswerId(answerId);
        if (questionWriterId == null || !questionWriterId.equals(memberId)) {
            throw new IllegalStateException("질문 작성자만 만족도 평가를 삭제할 수 있습니다.");
        }
        questionAnswerRepository.deleteSatisfaction(answerId);
    }
    
}