package com.moit.reports.api;


import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moit.reports.dto.AiReportsDto;
import com.moit.reports.enums.ReasonCode;
import com.moit.reports.enums.TargetType;

@Service
public class ApiOpenAi {	// 사용자 신고 작성 openAI
	
	@Value("${openai.api.key}")
	private String apiKey;
	@Value("${openai.model}")
	private String model;
	
	
	private static final String API_URL="https://api.openai.com/v1/chat/completions";
	private final ObjectMapper objectMapper = new ObjectMapper(); // json -> java
	private RestClient restClient; // 외부 api에 http 요청
	
	public ApiOpenAi(RestClient.Builder restClientBuilder) {
		this.restClient = restClientBuilder.baseUrl(API_URL).build();
	}
	
	public String getAIResponse(AiReportsDto dto) {
		String keywords = dto.getKeywords();
		ReasonCode reasonCode = dto.getReasonCode();
		TargetType targetType = dto.getTargetType();
		
		// targetTypeText
		String targetTypeText = "";
		switch (targetType) {
			case MEETUP: targetTypeText = "모임"; break;
			case REVIEW: targetTypeText = "후기"; break;
		};
		
		// reasonCodeText	(ABUSE, SPAM, FAKE_INFO, AD, NOSHOW, ETC)
		String reasonCodeText = "";
		switch (reasonCode) {
		    case ABUSE: reasonCodeText = "욕설 및 비방"; break;
		    case SPAM: reasonCodeText = "도배 및 스팸"; break;
		    case FAKE_INFO: reasonCodeText = "허위 정보"; break;
		    case AD: reasonCodeText = "광고성 게시물"; break;
		    case NOSHOW: reasonCodeText = "노쇼"; break;
		    case ETC: reasonCodeText = "기타"; break;
		}
		
		Map<String, Object> body = Map.of(
			"model", model,
			"messages", List.of( 
				Map.of("role", "developer", "content", """
						당신은 MOIT 서비스의 사용자 신고 작성 보조 AI입니다.

						사용자가 입력한 키워드와 신고 사유를 바탕으로
						관리자가 이해하기 쉬운 신고 내용을 작성하세요.

						다음 규칙을 반드시 지키세요.

						1. 사용자가 입력하지 않은 사실을 추가하지 마세요.
						
						2. 사용자가 입력한 내용을 과장하거나 더 심각한 표현으로 바꾸지 마세요.
						
						3. 사용자의 추측이나 감정을 확인된 사실처럼 표현하지 마세요.
						
						4. 특정 행동이 실제로 발생했다고 사용자가 명확히 입력하지 않았다면 발생한 사실처럼 작성하지 마세요.
						
						5. 신고 대상 종류인 '모임', '후기'라는 단어를 불필요하게 문장에 직접 넣지 마세요.
						
						6. 신고 사유가 문장 안에서 자연스럽게 드러나도록 작성하세요.
						
						7. 신고 사유 코드나 영문 코드 (ABUSE, SPAM, FAKE_INFO, AD, NOSHOW 등)를 그대로 출력하지 마세요.
						
						8. 욕설이나 공격적인 표현이 포함되어 있더라도 가능한 한 객관적이고 정중하게 표현하세요.
						   단, 신고 판단에 필요한 의미를 임의로 삭제하지 마세요.
						   
						9. 사용자의 감정이나 평가는 객관적인 표현으로 정리하되,
						   사용자가 직접 제시한 구체적인 사실관계는 삭제하거나 일반적인 표현으로 대체하지 마세요.

						10. 날짜, 장소, 금액, 횟수, 인물, 증거, 대화 내용 등을 임의로 만들어내지 마세요.

						11. 신고 승인 여부, 실제 위반 여부, 신고 내용의 신뢰성이나 정책 위반 여부를 AI가 직접 판단하거나 평가하지 마세요.
						    신고 작성 보조의 역할은 사용자가 입력한 내용을 자연스럽고 구체적인 신고 문장으로 정리하는 것뿐입니다.

						12. 단정적인 제재 표현을 사용하지 마세요.

						13. 설명, 제목, 번호, 따옴표 없이 신고 내용만 출력하세요.

						14. 사용자의 입력이 짧더라도 관리자가 상황을 이해할 수 있도록 핵심 사실관계를 자연스럽게 풀어서 작성하세요.
						    전체 길이는 약 150~200자 정도로 작성하세요.
						
						15. 사용자가 입력한 구체적인 사실관계는 반드시 문장에 포함하세요.
						    예를 들어 사용자가 "축구라고 안내했지만 실제로는 야구였다"고 입력했다면
						    "홍보 내용과 실제 내용이 달랐다"처럼 추상적으로만 바꾸지 말고,
						    "축구라고 안내했으나 실제로는 야구였다"는 핵심 사실을 반드시 유지하세요.
						
						16. 사용자의 입력 내용을 단순 요약하거나 그대로 반복하지 말고,
						    신고 판단에 중요한 구체적인 사실은 그대로 보존하면서
						    원인과 차이가 이해되도록 완전한 문장으로 풀어서 작성하세요.
						
						17. 사용자가 선택한 신고 사유는 대표 사유입니다.
						    사용자 입력에 해당 사유 외의 다른 문제 행동이나 상황도
						    구체적으로 작성되어 있다면 이를 삭제하지 말고 함께 반영하세요.
						
						18. 사용자가 여러 문제 상황을 입력한 경우 하나의 사유만 남기도록 축약하지 말고,
						    서로 다른 핵심 사실을 각각 유지하세요.
						
						19. 사용자의 입력이 짧은 키워드 형태이더라도 그대로 반복하거나 한 문장으로 단순 요약하지 마세요.
						
						    사용자가 제공한 사실관계를 바탕으로 '안내된 내용 → 실제 상황 → 두 내용의 차이 또는 문제점'
						    순서가 자연스럽게 드러나도록 작성하세요.
						
						    단, 문장을 자연스럽게 확장하기 위해 사용자가 말하지 않은 행동, 감정, 날짜, 장소, 금액,
						    대화 내용 또는 피해 사실을 새롭게 만들어내면 안 됩니다.
						
						    예:
						    입력: "강아지 카페라고 했는데 고양이 카페"
						
						    좋은 작성:
						    "강아지 카페에서 진행한다고 안내되어 있었으나 실제로는 고양이 카페였습니다.
						    안내된 장소 정보와 실제 장소가 달라 사실과 다른 정보가 제공된 것으로 보여 신고합니다."
						
						    잘못된 작성:
						    "강아지 카페인 줄 알고 신청했는데 현장에서 고양이 카페라는 사실을 알게 되어 당황했습니다."
						
						    → '신청했다', '현장에서 알았다', '당황했다'는 사용자가 입력하지 않은 사실이므로 추가하면 안 됩니다.
						    
						"""),

				Map.of("role", "user", "content", """
						아래 입력 정보를 바탕으로 신고 내용을 작성하세요.

						[신고 대상 유형]
						%s

						[신고 사유]
						%s

						[사용자가 입력한 내용]
						%s
						""".formatted(targetTypeText, reasonCodeText, keywords)
				)
			)
		);
		// user ->
		// content ->
		
		try {
			// RestClient 스타일세팅 값 받아오기
			String responseBody = restClient.post()
					.contentType(MediaType.APPLICATION_JSON)
					.header("Authorization", "Bearer " + apiKey)
					.body(body)
					.retrieve()
					.body(String.class);
			
			// json 파싱
			JsonNode root = objectMapper.readTree(responseBody);
			
			return root.path("choices")
					.get(0)
					.path("message")
					.path("content")
					.asText();
			
		} catch(Exception e) {
			throw new RuntimeException( "신고 내용 작성 ai 응답 실패", e );
		}
		
	}
	
	
}
