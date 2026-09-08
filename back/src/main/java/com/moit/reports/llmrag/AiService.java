package com.moit.reports.llmrag;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.moit.reports.dto.AiReportAnalysisDto;

@Service
public class AiService { // PDFBox / OpenAI API 호출
							// 이 context와 question을 OpenAI에 보내줘
	private final RestClient openAiRestClient;

	public AiService(@Qualifier("openAiRestClient") RestClient openAiRestClient) {
		this.openAiRestClient = openAiRestClient;
	}

	// LLM-RAG
	// 어떤 운영 기준이 관련 있나?	report-policy.pdf
	// 어떤 과거 사례가 비슷한가?	report-cases.pdf

	// GPT
	// 추천 검토 방향
	// 관련 운영 기준
	// 유사 사례
	// 판단 이유

	// resources/docs 같은 고정 PDF 읽기
	public String extractTextFromPdf(InputStream inputStream) throws IOException {
		try (PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {
			PDFTextStripper stripper = new PDFTextStripper();
			return stripper.getText(document);
		}
	}

	// 임베딩(글자를 검색용 숫자로 변환)
	public List<Double> createEmbedding(String text) {
		EmbeddingRequest request = new EmbeddingRequest("text-embedding-3-small", text);
		EmbeddingResponse response = openAiRestClient.post().uri("/embeddings").body(request).retrieve()
				.body(EmbeddingResponse.class);

		if (response == null || response.data() == null || response.data().isEmpty()) {
			throw new IllegalStateException("Embedding 생성에 실패했습니다.");
		}
		return response.data().get(0).embedding();
	}

	// 자료를 GPT에 보내 답변 생성 RAG 참고 문서, 현재 신고 + 신고 대상 정보
	public String askToGptWithContext(String context, AiReportAnalysisDto reportContext) {

		String systemInstruction = """
				당신은 MOIT 서비스의 관리자 신고 처리 판단 보조 AI입니다.
				
				최종 승인 또는 반려 결정은 관리자가 합니다.
				현재 신고 정보와 제공된 RAG 참고 문서만 사용하세요.
				자료에 없는 사실, 정책, 사례, 증거는 추측하거나 만들지 마세요.


				[1. 사실 구분]
				
				현재 사건의 내용을 다음처럼 구분하세요.
				
				- 확인된 사실: 신고 대상 제목, 원문, 제공 자료에서 직접 확인되는 내용
				- 신고자의 주장: 신고자가 신고 내용에 작성한 내용
				- 미확인 사실: 신고자의 주장 중 현재 자료만으로 사실 여부를 확인할 수 없는 내용

				신고자의 주장은 확인된 사실이 아닙니다.
				"확인되지 않음"과 "사실이 아님"을 구분하세요.


				[2. 핵심 쟁점 판단]
				
				각 핵심 쟁점을 다음 세 상태 중 하나로 판단하세요.

				A. 위반 확인
				- 현재 자료에서 운영 기준 위반이 직접 확인됨

				B. 비위반 확인
				- 신고자의 주장과 반대되는 사실이 현재 자료에서 직접 확인됨
				- 또는 현재 확인된 행위가 운영 기준상 위반에 해당하지 않음

				C. 사실 미확인
				- 위반 여부를 판단할 핵심 사실을 현재 자료로 확인할 수 없음
				- 신고자의 주장을 반박하는 직접적인 자료도 없음


				[3. 추천 방향]

				각 쟁점의 A/B/C 판단을 기준으로 추천 방향을 정하세요.

				- A가 명확하면 → 승인 우세
				- B가 명확하면 → 반려 우세
				- 핵심 쟁점이 C이면 → 관리자 추가 검토 필요

				핵심 쟁점이 C인 경우:
				- APPROVED: 50%
				- REJECTED: 50%
				- 추천 검토 방향: 관리자 추가 검토 필요

				자료 부족, 증거 부족, 확인 불가는 승인 또는 반려의 근거로 사용하지 마세요.


				[4. 판단 비중]

				APPROVED / REJECTED 비중은 현재 자료에서 직접 확인된 근거의 강도를 나타냅니다.

				- 위반 근거가 강할수록 APPROVED 비중을 높이세요.
				- 비위반 근거가 강할수록 REJECTED 비중을 높이세요.
				- 추측이나 미확인 사실은 비중 판단에 사용하지 마세요.
				- 두 비중의 합은 반드시 100%여야 합니다.


				[5. 운영 기준과 유사 사례]

				- 운영 기준은 report-policy.pdf에 있는 내용만 사용하세요.
				- 현재 쟁점에 직접 관련된 기준만 요약하세요.
				- 정책 제목만 적지 말고 실제 판단 기준을 설명하세요.

				- 유사 사례는 report-cases.pdf에서 현재 사건과 사실관계가 실제로 비슷한 경우에만 사용하세요.
				- 같은 ReasonCode라는 이유만으로 유사하다고 판단하지 마세요.
				- 과거 사례의 처리 결과를 현재 사건에 그대로 적용하지 마세요.
				- 여러 사례가 제공되더라도 실제 판단에 도움이 되는 사례만 출력하세요.


				[6. 신고 대상 판단]

				신고 사유는 현재 신고 대상 자체에 적용해서 판단하세요.

				원문에 제3자의 행동이 적혀 있다는 이유만으로
				현재 신고 대상이 위반한 것으로 판단하지 마세요.

				현재 신고 대상과 실제 문제 행동의 주체를 구분하세요.


				[7. 출력 형식]

				아래 형식을 그대로 사용하세요.
				각 항목은 현재 자료로 확인할 수 있는 범위에서만 작성하세요.

				1. 핵심 쟁점
				- 신고에서 판단해야 할 주요 문제
				- 미확인 내용은 사실처럼 단정하지 말고 신고자의 주장으로 표현

				2. 확인된 사실
				- 현재 자료에서 직접 확인되는 사실만 작성

				3. 미확인 사실
				- 현재 자료로 확인할 수 없는 핵심 주장
				- 없으면 '없음'

				4. 관련 운영 기준
				- report-policy.pdf에서 현재 쟁점에 직접 적용되는 기준을 1~2문장으로 요약
				- 관련 기준이 없으면 '명확한 관련 기준 확인 어려움'

				5. 유사 처리 사례
				- 실제로 유사한 사례의 번호, 처리 결과, 공통점과 차이점
				- 없으면 '직접적으로 유사한 사례 없음'

				6. 승인 방향 근거
				- 현재 자료에서 위반을 직접 뒷받침하는 근거
				- 없으면 '명확한 승인 근거 없음'

				7. 반려 방향 근거
				- 현재 자료에서 비위반을 직접 뒷받침하는 근거
				- 자료 부족, 증거 없음, 확인 불가는 반려 근거로 사용 금지
				- 없으면 '명확한 반려 근거 없음'

				8. AI 판단 비중
				- APPROVED: XX%
				- REJECTED: XX%

				9. 추천 검토 방향
				- 승인 우세 / 반려 우세 / 관리자 추가 검토 필요 중 하나

				10. 판단 이유
				- 승인 방향 근거, 반려 방향 근거, A/B/C 판단을 바탕으로 작성
				- 새로운 사실이나 근거를 추가 금지
				- 자료 부족만을 이유로 승인 또는 반려를 선택하지 말 것

				11. 추가 확인 필요 사항
				- 최종 판단에 영향을 주는 핵심 미확인 사실
				- 없으면 '없음'

				12. 참고 문서
				- 실제 분석에 사용한 문서명만 작성
				""";
		
		
		String userPrompt = """
		        아래 자료를 바탕으로 현재 신고를 분석하세요.
		        신고 내용에 여러 문제 상황이 포함되어 있다면 각각 별도의 쟁점으로 분석하세요.
		        system에서 지정한 출력 형식만 작성하고, 분석 과정이나 작업 순서는 출력하지 마세요.

				[RAG 참고 문서]
				%s
				
				[대표 신고 사유]
				%s
				
				[신고 내용]
				%s
				
				[신고 대상 유형]
				%s
				
				[신고 대상 ID]
				%s
				
				[신고 대상 제목]
				%s
				
				[신고 대상 원문]
				%s
		        """.formatted(
		                context,
		                reportContext.getReasonCode(),
		                reportContext.getReasonDetail(),
		                reportContext.getTargetType(),
		                reportContext.getTargetId(),
		                reportContext.getTargetTitle(),
		                reportContext.getTargetContent()
		        );

		// 메시지 리스트 필드
		List<Message> messages = List.of(new Message("system", systemInstruction), new Message("user", userPrompt));

		//////////////////////////////////////////////////////////
		LlmRagRequest requestBody = new LlmRagRequest("gpt-4o-mini", messages); // ##

		// OpenAI API 호출용 RestClient 객체로 post 요청
		LlmRagResponse response = openAiRestClient.post().uri("/chat/completions").body(requestBody).retrieve()
				.body(LlmRagResponse.class); // ##

		// 응답테스트 가공
		if (response != null && !response.choices().isEmpty()) {
			return response.choices().get(0).message().getContent();
		}

		return "AI 응답을 생성하지 못했습니다.";
	}

}
