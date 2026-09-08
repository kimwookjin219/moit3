package com.moit.qna.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.moit.meetup.dto.MeetupDto.MeetupResponseDto;
import com.moit.meetup.service.MeetupService;
import com.moit.member.dto.UserDto;
import com.moit.qna.dto.AnswerDto.AnswerRequestDto;
import com.moit.qna.dto.AnswerDto.SatisfactionRequestDto;
import com.moit.qna.dto.QuestionDto.QuestionAdminResponseDto;
import com.moit.qna.dto.QuestionDto.QuestionMyResponseDto;
import com.moit.qna.dto.QuestionDto.QuestionRequestDto;
import com.moit.qna.dto.QuestionDto.QuestionResponseDto;
import com.moit.qna.service.AnswerService;
import com.moit.qna.service.QuestionAiAnalysisService;
import com.moit.qna.service.QuestionService;
import com.moit.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
문의 화면 요청 처리 Controller
*/
@Tag(name = "Question Api", description = "문의글 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/questions")
public class QuestionController {
    private final QuestionService questionService;
    private final AnswerService answerService;
    private final QuestionAiAnalysisService questionAiAnalysisService;
    private final MeetupService meetupService;
    
    // 특정 모임의 Q&A 목록
    @Operation(summary = "특정 모임 Q&A 목록 조회", description = "특정 모임에 등록된 문의 목록을 조회합니다.")
    @GetMapping("/meetup/{meetupId}")
    public ResponseEntity<List<QuestionResponseDto>> meetupQuestions(
            @PathVariable("meetupId") Long meetupId,
            Authentication authentication) {
        Long memberId = null;
        Long memberTypeId = null;
        if(authentication != null){
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            memberId = userDetails.getUser().getMemberId();
            memberTypeId = userDetails.getUser().getMemberTypeId();
        }
        List<QuestionResponseDto> list = questionService.selectByMeetupQuestions(meetupId, memberId, memberTypeId);
        return ResponseEntity.ok(list);
    }
    
    // 답변 만족도 평가
    @Operation(summary = "답변 만족도 평가", description = "답변에 대한 만족도 점수와 의견을 등록합니다.")
    @PatchMapping("/answer/{answerId}/satisfaction")
    public ResponseEntity<Void> updateSatisfaction(
            @PathVariable("answerId") Long answerId,
            @Valid @RequestBody SatisfactionRequestDto dto,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = userDetails.getUser().getMemberId();
        dto.setAnswerId(answerId);
        answerService.updateSatisfaction(dto, memberId);
        return ResponseEntity.noContent().build();
    }
    
    // 답변 만족도 평가 삭제
    @Operation(summary = "답변 만족도 평가 삭제", description = "답변에 등록된 만족도 점수와 의견을 삭제합니다.")
    @DeleteMapping("/answer/{answerId}/satisfaction")
    public ResponseEntity<Void> deleteSatisfaction(
            @PathVariable("answerId") Long answerId,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = userDetails.getUser().getMemberId();
        answerService.deleteSatisfaction(answerId, memberId);
        return ResponseEntity.noContent().build();
    }
    
    // 관리자용 선택 삭제
    @Operation(summary = "관리자용 선택 삭제", description = "관리자가 글을 삭제합니다.")
    @DeleteMapping("/deleteSelected")
    public ResponseEntity<Void> deleteSelected(@RequestBody List<Long> ids, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long memberTypeId = userDetails.getUser().getMemberTypeId();
        if(memberTypeId != 3 && memberTypeId != 4){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        questionService.deleteSelected(ids);
        return ResponseEntity.noContent().build();
    }
    
    // AI 필터 정상 처리
    @Operation(summary = "AI 필터 정상 처리", description = "AI 필터 검토 -> 정상 처리")
    @PatchMapping("/ai/normal")
    public ResponseEntity<Void> changeToNormal(@RequestBody List<Long> ids, Authentication authentication){
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long memberTypeId = userDetails.getUser().getMemberTypeId();
        if(memberTypeId != 3 && memberTypeId != 4){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        questionAiAnalysisService.changeToNormal(ids);
        return ResponseEntity.noContent().build();
    }
    
    // 내 문의 목록
    @Operation(summary = "내 문의 목록 조회", description = "로그인한 사용자의 문의 목록을 조회합니다.")
    @GetMapping("/myQuestion")
    public ResponseEntity<QuestionMyResponseDto> myQuestion(
            @RequestParam(value = "page",    defaultValue = "1") int page,
            @RequestParam(value = "type",    required = false) String type,
            @RequestParam(value = "keyword", required = false) String keyword,
            Authentication authentication) {
        CustomUserDetails users = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = users.getUser().getMemberId();

        int pageSize = 10;
        int start = (page - 1) * pageSize;
        List<QuestionResponseDto> list =
                questionService.getMyQuestions(
                        memberId,
                        start,
                        pageSize,
                        type,
                        keyword
                );
        int totalCnt = questionService.getMyQuestionCnt( memberId, type, keyword );
        int totalPage = (int) Math.ceil((double) totalCnt / pageSize);
        int pageBlock = 10;
        int startPage = ((page - 1) / pageBlock) * pageBlock + 1;
        int endPage = startPage + pageBlock - 1;
        if (endPage > totalPage) { endPage = totalPage; }
        int pendingCnt = questionService.getMyPendingCnt(memberId);
        int answeredCnt = questionService.getMyAnsweredCnt(memberId);
        
        QuestionMyResponseDto response = new QuestionMyResponseDto();

        response.setList(list);
        response.setPage(page);
        response.setTotalPage(totalPage);
        response.setTotalCnt(totalCnt);
        response.setStartPage(startPage);
        response.setEndPage(endPage);
        response.setType(type);
        response.setKeyword(keyword);
        response.setPendingCnt(pendingCnt);
        response.setAnsweredCnt(answeredCnt);
        return ResponseEntity.ok(response);
    }
    
    // 관리자가 보는 전체 문의 목록
    @Operation(summary = "관리자 문의 목록 조회", description = "관리자가 전체 문의 목록을 조회합니다.")
    @GetMapping("/admin")
    public ResponseEntity<QuestionAdminResponseDto> admin(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "aiCategory", required = false) String aiCategory,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long memberTypeId = userDetails.getUser().getMemberTypeId();
        if(memberTypeId != 3 && memberTypeId != 4){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        int pageSize = 10;
        int start = (page - 1) * pageSize;

        List<QuestionResponseDto> list = questionService.getList( start, pageSize, type, keyword, status, aiCategory, startDate, endDate );
        int totalCnt = questionService.getSearchCnt( type, keyword, status, aiCategory, startDate, endDate );
        int totalPage = (int) Math.ceil((double) totalCnt / pageSize);
        int pageBlock = 10;
        int startPage = ((page - 1) / pageBlock) * pageBlock + 1;
        int endPage = startPage + pageBlock - 1;
        if (endPage > totalPage) { endPage = totalPage; }
        int allCnt = questionService.getAllCnt();
        int pendingCnt = questionService.getPendingCnt();
        int answeredCnt = questionService.getAnsweredCnt();
        int todayCnt = questionService.getTodayCnt();

        QuestionAdminResponseDto response = new QuestionAdminResponseDto();

        response.setList(list);
        response.setPage(page);
        response.setPageSize(pageSize);
        response.setTotalCnt(totalCnt);
        response.setTotalPage(totalPage);
        response.setStartPage(startPage);
        response.setEndPage(endPage);

        response.setType(type);
        response.setKeyword(keyword);
        response.setStatus(status);
        response.setStartDate(startDate);
        response.setEndDate(endDate);

        response.setAllCnt(allCnt);
        response.setPendingCnt(pendingCnt);
        response.setAnsweredCnt(answeredCnt);
        response.setTodayCnt(todayCnt);

        return ResponseEntity.ok(response);
    }
    
    // 모임글 문의 등록
    @Operation(summary = "문의 등록", description = "문의를 등록합니다.")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(@ModelAttribute QuestionRequestDto dto, Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Long memberId = userDetails.getUser().getMemberId();
            dto.setMemberId(memberId);
            // 관리자 문의일 경우 parentId = 0
            if (dto.getParentId() == null) { dto.setParentId(0L); }
            QuestionResponseDto result = questionService.register(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
    
    // 문의 상세 화면 + 답변 조회 + 버튼 권한
    @Operation(summary = "문의 상세 조회", description = "문의 상세 정보를 조회합니다.")
    @GetMapping("/{questionId}")
    public ResponseEntity<QuestionResponseDto> detail(@PathVariable("questionId") Long questionId, Authentication authentication) {
        QuestionResponseDto question = questionService.getDetail(questionId);
        if(question.getParentId().equals(0L)){
            if(authentication == null){
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            UserDto user = userDetails.getUser();
            if(user.getMemberTypeId() != 3 && user.getMemberTypeId() != 4 && !question.getMemberId().equals(user.getMemberId())){
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.ok(question);
        }
        if("Y".equals(question.getIsPublic())){
            return ResponseEntity.ok(question);
        }
        if(authentication == null){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserDto user = userDetails.getUser();
        Long memberId = user.getMemberId();
        if(user.getMemberTypeId() == 3 || user.getMemberTypeId() == 4 || question.getMemberId().equals(memberId)){
            return ResponseEntity.ok(question);
        }
        MeetupResponseDto meetup = meetupService.detail(question.getParentId(), memberId);
        if(meetup != null && meetup.getMemberId() != null && meetup.getMemberId().equals(memberId)){
            return ResponseEntity.ok(question);
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    // 문의 수정 화면 이동
    @Operation(summary = "문의 수정", description = "문의를 수정합니다.")
    @PutMapping(value = "/{questionId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> edit(@PathVariable("questionId") Long questionId, @ModelAttribute QuestionRequestDto dto, Authentication authentication) {
        QuestionResponseDto question = questionService.getDetail(questionId);
        // 작성자 또는 관리자 권한 확인
        if (!canEdit(question, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        dto.setQuestionId(questionId);
        questionService.updateQuestion(dto);
        return ResponseEntity.noContent().build(); // 성공 응답 204
    }

    // 문의 삭제 처리
	@Operation(summary = "문의 삭제", description = "문의를 삭제합니다.")
    @DeleteMapping("/delete/{questionId}")
    public ResponseEntity<Void> delete(@PathVariable("questionId") Long questionId, Authentication authentication) {
		QuestionResponseDto question = questionService.getDetail(questionId);
		// 작성자 또는 관리자 권한 확인
		if (!canEdit(question, authentication)) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
	    }
		questionService.deleteQuestion(questionId);
	    return ResponseEntity.noContent().build(); // 성공 응답 204 
	}

    // 답변 등록 + 문의 상태 변경
	@Operation(summary = "답변 등록", description = "답변을 등록합니다.")
    @PostMapping("/answer")
    public ResponseEntity<Void> answerWrite(@RequestBody AnswerRequestDto dto,  Authentication authentication) {
        QuestionResponseDto question = questionService.getDetail(dto.getQuestionId());
        // 답변 작성 권한 확인
        if(!canAnswer(question, authentication)){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        // 로그인한 사용자 ID
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = userDetails.getUser().getMemberId();
        // 답변 등록 및 문의 상태 ANSWERED 변경
        answerService.register(dto, memberId);
        return ResponseEntity.status(HttpStatus.CREATED).build(); // 성공 응답 201
    }

    // 답변 수정 처리
	@Operation(summary = "답변 수정", description = "답변을 수정합니다.")
	@PutMapping("/answer/{answerId}")
	public ResponseEntity<Void> answerEdit(@PathVariable("answerId") Long answerId, @RequestBody AnswerRequestDto dto, Authentication authentication) {
	    System.out.println("🔥 answerId = " + answerId);
	    System.out.println("🔥 questionId = " + dto.getQuestionId());
	    System.out.println("🔥 content = " + dto.getContent());

	    if (dto.getQuestionId() == null) {
	        return ResponseEntity.badRequest().build();
	    }
	    
		QuestionResponseDto question = questionService.getDetail(dto.getQuestionId());
	    // 답변 수정 권한 확인
	    if (!canAnswer(question, authentication)) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
	    }
	    dto.setAnswerId(answerId);
	    answerService.update(dto);
	    return ResponseEntity.noContent().build(); // 성공 응답 204
	}

    // 답변 삭제
	@Operation(summary = "답변 삭제", description = "답변을 삭제합니다.")
	@DeleteMapping("/{questionId}/answer/{answerId}")
	public ResponseEntity<Void> answerDelete(
	        @PathVariable("answerId") Long answerId,
	        @PathVariable("questionId") Long questionId,
	        Authentication authentication) {
	    QuestionResponseDto question = questionService.getDetail(questionId);
	    // 답변 삭제 권한 확인
	    if (!canAnswer(question, authentication)) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
	    }
	    // 답변 삭제 및 문의 상태 PENDING 변경
	    answerService.delete(answerId, questionId);
	    
	    return ResponseEntity.noContent().build(); // 성공 응답 204
	}

    // 답변 권한 확인 메서드
    private boolean canAnswer(QuestionResponseDto question, Authentication authentication){
		UserDto user=null;
		Object principal = authentication.getPrincipal();
		Long memberId = null;
		// 로그인 사용자 확인
		if(   principal   instanceof CustomUserDetails ) {
			CustomUserDetails  users = (CustomUserDetails)principal;
			user=users.getUser();
			memberId = users.getUser().getMemberId();
		} 
		if(user == null){
		    return false;
		}
		// 관리자 / 슈퍼관리자는 모든 문의에 답변 가능
	    if(user.getMemberTypeId() == 3 ||
	       user.getMemberTypeId() == 4){
	        return true;
	    }
	    // 관리자 문의는 관리자만 답변 가능
	    if(question.getParentId().equals(0L)){
	        return false;
	    }
		// 일반 회원인 경우 해당 모임의 모임장인지 확인
	    if(user.getMemberTypeId() == 1){
	        MeetupResponseDto meetup =meetupService.detail(question.getParentId(), memberId);
	        return meetup != null && meetup.getMemberId() != null &&
	               meetup.getMemberId().equals(memberId);
	    }
	    // 제휴업체 등 그 외 권한은 답변 불가
	    return false;
    }
    
    // 문의 수정/삭제 권한 확인
    private boolean canEdit(QuestionResponseDto question, Authentication authentication){
		UserDto user=null;
		Object principal = authentication.getPrincipal();
		Long memberId = null;
		//1. local
		if(   principal   instanceof CustomUserDetails ) {
			CustomUserDetails  users = (CustomUserDetails)principal;
			user=users.getUser();
			memberId = users.getUser().getMemberId();
		} 
		if(user == null){
		    return false;
		}
		if(question.getMemberId().equals(memberId)){
		    return true;
		}
		if(user.getMemberTypeId() == 3 || user.getMemberTypeId() == 4){
		    return true;
		}
		return false;
    }
}

//성공 응답
//조회(GET)	200 OK
//생성(POST)	201 Created
//수정(PUT/PATCH)	200 OK 또는 204 No Content(응답데이터없을때)
//삭제(DELETE)	204 No Content