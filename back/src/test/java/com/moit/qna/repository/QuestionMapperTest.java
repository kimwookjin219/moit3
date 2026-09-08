package com.moit.qna.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashMap;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.moit.qna.dao.QuestionMapper;
import com.moit.qna.dto.QuestionDto.QuestionResponseDto;

@SpringBootTest
public class QuestionMapperTest {

    @Autowired private QuestionMapper questionMapper;

    @Test
    @DisplayName("QNA Mapper 전체 Bean 생성 테스트")
    void mapperBeanTest() {
        assertThat(questionMapper).isNotNull();
    }

    @Test
    @DisplayName("Question Mapper 조회 테스트")
    void questionMapperTest() {
        List<QuestionResponseDto> list = questionMapper.findAll(new HashMap<>());
        assertThat(list).isNotNull();
    }

}