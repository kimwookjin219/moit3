package com.moit.qna.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.moit.qna.entity.Question;
import com.moit.qna.entity.QuestionAiAnalysis;
import com.moit.qna.entity.QuestionAnswer;
import com.moit.qna.entity.QuestionNotification;

@DataJpaTest
@AutoConfigureTestDatabase( replace = AutoConfigureTestDatabase.Replace.NONE)
public class QuestionRepositoryTest {

    @Autowired private QuestionRepository questionRepository;
    @Autowired private QuestionAnswerRepository questionAnswerRepository;
    @Autowired private QuestionNotificationRepository questionNotificationRepository;
    @Autowired private QuestionAiAnalysisRepository questionAiAnalysisRepository;

    @Test
    @DisplayName("QNA Repository 전체 Bean 생성 테스트")
    void repositoryBeanTest() {

        assertThat(questionRepository).isNotNull();
        assertThat(questionAnswerRepository).isNotNull();
        assertThat(questionNotificationRepository).isNotNull();
        assertThat(questionAiAnalysisRepository).isNotNull();
    }
    
    @Test
    @DisplayName("Question Repository 조회 테스트")
    void QuestionTest(){
        List<Question> list = questionRepository.findAll();
        assertThat(list).isNotNull();
    }
    
    @Test
    @DisplayName("QuestionAnswer Repository 조회 테스트")
    void questionAnswerTest() {
        List<QuestionAnswer> list = questionAnswerRepository.findAll();
        assertThat(list).isNotNull();
    }
    
    @Test
    @DisplayName("QuestionNotification Repository 조회 테스트")
    void questionNotificationTest() {
        List<QuestionNotification> list = questionNotificationRepository.findAll();
        assertThat(list).isNotNull();
    }
    
    @Test
    @DisplayName("QuestionAiAnalysis Repository 조회 테스트")
    void questionAiAnalysisTest() {
        List<QuestionAiAnalysis> list = questionAiAnalysisRepository.findAll();
        assertThat(list).isNotNull();
    }
    
    
}