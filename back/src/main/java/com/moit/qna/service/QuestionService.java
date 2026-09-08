package com.moit.qna.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.moit.qna.dao.QuestionMapper;
import com.moit.qna.dto.AnswerDto.AnswerResponseDto;
import com.moit.qna.dto.QuestionDto.QuestionRequestDto;
import com.moit.qna.dto.QuestionDto.QuestionResponseDto;
import com.moit.qna.dto.QuestionImageDto;
import com.moit.qna.enums.QnaStatus;
import com.moit.qna.repository.QuestionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuestionService {
    private final QuestionMapper questionMapper;
    private final QuestionAiAnalysisService questionAiAnalysisService;
    private final QuestionRepository questionRepository;

    // 관리자 전체 문의 목록 조회 (페이징)
    public List<QuestionResponseDto> getList(
            int start,
            int end,
            String type,
            String keyword,
            String status,
            String aiCategory,
            String startDate,
            String endDate) {

        Map<String, Object> map = new HashMap<>();

        map.put("start", start);
        map.put("end", end);

        map.put("type", type);
        map.put("keyword", keyword);
        map.put("status", status);
        map.put("aiCategory", aiCategory);
        map.put("startDate", startDate);
        map.put("endDate", endDate);

        List<QuestionResponseDto> list = questionMapper.findAll(map);

        // 답변 정보 추가
        for (QuestionResponseDto q : list) {
        	AnswerResponseDto answer = questionMapper.findByQuestionId(q.getQuestionId());
            q.setAnswer(answer);
        }
        return list;
    }

    // 문의 상세 조회 + 답변 + 이미지 정보 조회
    public QuestionResponseDto getDetail(Long id) {
        // 문의 정보 조회
        QuestionResponseDto question = questionMapper.findById(id);
        
        if (question == null) {throw new IllegalArgumentException("존재하지 않는 문의입니다.");}

        // 해당 문의의 답변 조회
        AnswerResponseDto answer = questionMapper.findByQuestionId(id);
        question.setAnswer(answer);
        
        // 해당 문의의 이미지 조회
        question.setImages(questionMapper.findQuestionImages(id));
        
        return question;
    }

    // 문의 등록
    @Transactional
    public QuestionResponseDto register(QuestionRequestDto dto) {
        // 동일 사용자 + 동일 제목 + 동일 내용의 문의가 있는지 확인
        int duplicateCount = questionMapper.countDuplicateQuestion(
                dto.getMemberId(),
                dto.getTitle(),
                dto.getContent()
        );
        if (duplicateCount > 0) {
            throw new IllegalStateException("이미 등록한 동일한 문의가 있습니다.");
        }
        // questions 테이블 저장
        questionMapper.insertQuestion(dto);
        // 문의 이미지 저장
        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            Path uploadPath = Paths.get("C:/upload/qna");
            try {
            	Files.createDirectories(uploadPath);
                for (MultipartFile file : dto.getImages()) {
                    if (file == null || file.isEmpty()) continue;

                    String originalName = file.getOriginalFilename();
                    String extension = "";

                    if (originalName != null && originalName.contains(".")) {
                        extension = originalName.substring(originalName.lastIndexOf("."));
                    }

                    String storedName = UUID.randomUUID() + extension;
                    Path filePath = uploadPath.resolve(storedName);

                    file.transferTo(filePath.toFile());

                    QuestionImageDto image = new QuestionImageDto();
                    image.setQuestionId(dto.getQuestionId());
                    image.setOriginalName(originalName);
                    image.setStoredName(storedName);
                    image.setImagePath("/images/qna/" + storedName);
                    image.setImageSize(file.getSize());
                    image.setContentType(file.getContentType());

                    questionMapper.insertQuestionImage(image);
                }
            } catch (IOException e) {
                throw new IllegalStateException("문의 이미지 저장에 실패했습니다.", e);
            }
        }

        // AI 분석 + QUESTION_AI_ANALYSIS 저장
        String text = dto.getTitle() + "\n" + dto.getContent();
        questionAiAnalysisService.analyzeAndSave(dto.getQuestionId(), text);

        // 등록된 문의 정보 반환
        return questionMapper.findById(dto.getQuestionId());
    }

    // 문의 수정
    @Transactional
    public void updateQuestion(QuestionRequestDto dto) {
        String status = questionMapper.findStatusByQuestionId(dto.getQuestionId());
        if ("ANSWERED".equals(status)) {
            throw new IllegalStateException("답변이 등록된 문의는 수정할 수 없습니다.");
        }

        // 문의 내용 수정
        questionMapper.updateQuestion(dto);
        // 기존 이미지 삭제
        if(dto.getDeleteImageIds()!=null&&!dto.getDeleteImageIds().isEmpty()){
            List<QuestionImageDto> deleteImages=questionMapper.findQuestionImagesByIds(dto.getDeleteImageIds());
            Path uploadPath=Paths.get("C:/upload/qna");
            for(QuestionImageDto image:deleteImages){
                if(image.getStoredName()==null)continue;
                try{Files.deleteIfExists(uploadPath.resolve(image.getStoredName()));}
                catch(IOException e){throw new IllegalStateException("문의 첨부파일 삭제에 실패했습니다.",e);}
            }
            questionMapper.deleteQuestionImagesByIds(dto.getDeleteImageIds());
        }
        // 새 이미지 저장
        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            Path uploadPath = Paths.get("C:/upload/qna");
            try {
                Files.createDirectories(uploadPath);
                for (MultipartFile file : dto.getImages()) {
                    if (file == null || file.isEmpty()) continue;

                    String originalName = file.getOriginalFilename();
                    String extension = "";

                    if (originalName != null && originalName.contains(".")) {
                        extension = originalName.substring(originalName.lastIndexOf("."));
                    }

                    String storedName = UUID.randomUUID() + extension;
                    Path filePath = uploadPath.resolve(storedName);

                    file.transferTo(filePath.toFile());

                    QuestionImageDto image = new QuestionImageDto();
                    image.setQuestionId(dto.getQuestionId());
                    image.setOriginalName(originalName);
                    image.setStoredName(storedName);
                    image.setImagePath("/images/qna/" + storedName);
                    image.setImageSize(file.getSize());
                    image.setContentType(file.getContentType());

                    questionMapper.insertQuestionImage(image);
                }
            } catch (IOException e) {
                throw new IllegalStateException("문의 이미지 저장에 실패했습니다.", e);
            }
        }
    }

    // 문의 삭제
    @Transactional
    public void deleteQuestion(Long questionId) {
        // 1. 해당 문의의 첨부파일 조회
        List<QuestionImageDto> images = questionMapper.findQuestionImages(questionId);
        // 2. 실제 파일 삭제
        if (images != null) {
            Path uploadPath = Paths.get("C:/upload/qna");
            for (QuestionImageDto image : images) {
                if (image.getStoredName() == null) {continue;}
                Path filePath = uploadPath.resolve(image.getStoredName());
                try {
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    throw new IllegalStateException(
                            "문의 첨부파일 삭제에 실패했습니다.", e
                    );
                }
            }
        }
        // 3. 첨부파일 DB 삭제
        questionMapper.deleteQuestionImages(questionId);
        // 4. 문의 삭제
        questionMapper.deleteQuestion(questionId);
        // 5. 알림 삭제
        questionMapper.deleteNotificationsByQuestionId(questionId);
    }

    // 전체 문의 수 조회
    public int getAllCnt() {
        return questionMapper.findAllCnt();
    }

    // 검색 문의 수 조회
    public int getSearchCnt(
            String type,
            String keyword,
            String status,
            String aiCategory,
            String startDate,
            String endDate) {

        Map<String,Object> map=new HashMap<>();

        map.put("type", type);
        map.put("keyword", keyword);
        map.put("status", status);
        map.put("aiCategory", aiCategory);
        map.put("startDate", startDate);
        map.put("endDate", endDate);

        return questionMapper.findSearchCnt(map);
    }

    // 답변 대기 문의 수 조회
    public int getPendingCnt() {
    	return (int) questionRepository.countByStatusAndDeleteYn(QnaStatus.PENDING, 'N');
    }

    // 답변 완료 문의 수 조회
    public int getAnsweredCnt() {
        return questionMapper.findAnsweredCnt();
    }

    // 오늘 등록된 문의 수 조회
    public int getTodayCnt() {
        return questionMapper.findTodayCnt();
    }

    // 사용자 문의 목록 페이징 조회
    public List<QuestionResponseDto> getMyQuestions(
            Long memberId,
            int start,
            int end,
            String type,
            String keyword) {

        Map<String, Object> map = new HashMap<>();

        map.put("memberId", memberId);
        map.put("start", start);
        map.put("end", end);
        map.put("type", type);
        map.put("keyword", keyword);

        List<QuestionResponseDto> list = questionMapper.findMyQuestions(map);

        // 답변 정보 추가
        for (QuestionResponseDto q : list) {
        	AnswerResponseDto answer = questionMapper.findByQuestionId(q.getQuestionId());
            q.setAnswer(answer);
        }

        return list;
    }

    // 내 문의 총 개수 조회
    public int getMyQuestionCnt(Long memberId, String type, String keyword) {
        Map<String, Object> map = new HashMap<>();

        map.put("memberId", memberId);
        map.put("type", type);
        map.put("keyword", keyword);

        return questionMapper.findMyQuestionCnt(map);
    }
    
    // 내 문의 전체 답변 대기 건수
    public int getMyPendingCnt(Long memberId) {
        return questionMapper.findMyPendingCnt(memberId);
    }

    // 내 문의 전체 답변 완료 건수
    public int getMyAnsweredCnt(Long memberId) {
        return questionMapper.findMyAnsweredCnt(memberId);
    }

    //관리자용 선택 삭제
    public void deleteSelected(List<Long> ids){
        questionMapper.deleteSelected(ids);
    }

    //해당 모임의 문의 목록
    public List<QuestionResponseDto> selectByMeetupQuestions(
            Long meetupId,
            Long memberId,
            Long memberTypeId) {
        Map<String, Object> map = new HashMap<>();
        map.put("meetupId", meetupId);
        map.put("memberId", memberId);
        map.put("memberTypeId", memberTypeId);
        return questionMapper.selectByMeetupQuestions(map);
    }
}