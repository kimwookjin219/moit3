package com.moit.reports.llmrag;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.moit.reports.dto.AiReportAnalysisDto;
import com.moit.reports.enums.ReasonCode;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor	// 꼭 필요한 필드만 생성
//@AllArgsConstructor		// 모든 생성자 생성
public class RagService {	// 실제 RAG 작업

	private final AiService aiService;
	private final ReportAiContextService reportAiContextService;
	
	// RAG에서 사용할 문서 조각 저장
	private final List<RagChunk> chunks = new ArrayList<>();
	
	

	
	
	
	// 문서 나누는 메서드
	public void splitAndAddDocument(String documentName, String text) {

		// 운영정책 PDF
		if ("report-policy.pdf".equals(documentName)) {
			splitPolicyDocument(documentName, text);

			// 사례 PDF
		} else if ("report-cases.pdf".equals(documentName)) {
			splitCaseDocument(documentName, text);
		}
	}

	// 운영정책 PDF								문서조각, 			내용
	private void splitPolicyDocument(String documentName, String text) {
		// 긴 PDF 문자열을 특정 제목이 나오는 위치에서 자르기
		String[] sections = text.split("(?=\\d+\\. (?:ABUSE|SPAM / AD|FAKE_INFO|NOSHOW|ETC))");

		for (String section : sections) {
			section = section.trim();
			if (section.isEmpty()) {
				continue;
			}

			// 실제 신고 기준 부분만 저장
			if (section.matches("(?s)^\\d+\\. (ABUSE|SPAM / AD|FAKE_INFO|NOSHOW|ETC).*")) {

				String title = section.lines().findFirst().orElse("기준");

				addDocument(documentName, title, section);
			}
		}
	}

	// 사례 PDF
	private void splitCaseDocument(String documentName, String text) {
		// 긴 PDF 문자열을 특정 제목이 나오는 위치에서 자르기
		String[] cases = text.split("(?=CASE-\\d{3})");

		for (String caseText : cases) {
			caseText = caseText.trim();
			if (!caseText.startsWith("CASE-")) {
				continue;
			}

			String title = caseText.lines().findFirst().orElse("CASE");

			addDocument(documentName, title, caseText);
		}
	}


	// test
	// List<RagChunk> chunks에 저장된 문서 조각 목록 조회
	public List<RagChunk> getChunks() {
		return chunks;
	}
	
	// 각 조각마다 호출하니까 처음에는 여러 번 OpenAI Embedding API가 호출
	// 서버 재실행할 때마다 다시 embedding API가 호출
	// 나중에 Embedding 결과 DB/파일 저장 → 문서가 안 바뀌었으면 기존 결과 재사용	=> 비용 절감
	// 문서 조각 하나 저장				문서 조각, 			제목, 			내용
	public void addDocument(String documentName, String title, String content) {
		// 문서 content 내용을 숫자로 변환
		List<Double> embedding = aiService.createEmbedding(content);

		// 문서정보 + 제목 + 원문 + 숫자를 하나의 객체로 묶기
		RagChunk chunk = new RagChunk(documentName, title, content, embedding);

		// 서버 메모리에 저장
		chunks.add(chunk);

//		System.out.println("[RAG] 문서 조각 저장 완료: " + documentName + " / " + title);
	}
	
	
	
	///////////////////////////////////////////////////////////////////////////////////
	
	
	
	
	// 운영 정책 검색
	private List<RagChunk> getPolicyChunksByReasonCode(ReasonCode reasonCode) {
		
		String keyword = switch (reasonCode) {
			case ABUSE -> "ABUSE";
			case SPAM, AD -> "SPAM / AD";
			case FAKE_INFO -> "FAKE_INFO";
			case NOSHOW -> "NOSHOW";
			case ETC -> "ETC";
		};
		
		return chunks.stream().filter(
				chunk -> "report-policy.pdf".equals(chunk.getDocumentName()) && chunk.getTitle().contains(keyword))
				.toList();
	}
	// 유사 사례 검색
	public List<RagChunk> searchSimilarChunksByDocument(String query, String documentName, int topK) {
		List<Double> queryEmbedding = aiService.createEmbedding(query);
		return chunks.stream().filter(chunk -> documentName.equals(chunk.getDocumentName())).sorted((a, b) -> {

			double similarityA = cosineSimilarity(queryEmbedding, a.getEmbedding());
			double similarityB = cosineSimilarity(queryEmbedding, b.getEmbedding());
			return Double.compare(similarityB, similarityA);
		}).limit(topK).toList();
	}
	
	
	// 얼마나 비슷한지 유사도 계산
	private double cosineSimilarity(List<Double> a, List<Double> b) {

		double dotProduct = 0.0;
		double normA = 0.0;
		double normB = 0.0;

		for (int i = 0; i < a.size(); i++) {
			dotProduct += a.get(i) * b.get(i);
			normA += Math.pow(a.get(i), 2);
			normB += Math.pow(b.get(i), 2);
		}
		
		return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
	}
	
	
	
	
	
	
	
	public String analyzeReport(Long reportId) {
		// reportContext -	DB에서 조회한 현재 신고 데이터 + 신고 대상 원문 조회
		ReportAiContext reportContext = reportAiContextService.getReportContext(reportId);
		
		System.out.println("전체 RAG chunks 수 = " + chunks.size());
		for (RagChunk chunk : chunks) {
			System.out.println(chunk.getDocumentName() + " / " + chunk.getTitle());
		}
		
		String reasonKeyword = switch (reportContext.getReasonCode()) {
		    case ABUSE -> "욕설 비방 모욕";
		    case SPAM -> "도배 스팸 반복 게시";
		    case FAKE_INFO -> "허위 정보 사실 불일치";
		    case AD -> "광고 홍보 상업성 구매 유도 외부 링크";
		    case NOSHOW -> "노쇼 불참 주최자 불참";
		    case ETC -> "기타 신고";
		};
		
		// query -	유사 문서 Embedding 검색용 문자열 생성
		String searchQuery = """
		        신고 사유: %s
		        관련 키워드: %s
		        신고 내용: %s
		        신고 대상 유형: %s
		        신고 대상 제목: %s
		        신고 대상 원문: %s
		        """.formatted(
		            reportContext.getReasonCode(),
		            reasonKeyword,
		            reportContext.getReasonDetail(),
		            reportContext.getTargetType(),
		            reportContext.getTargetTitle(),
		            reportContext.getTargetContent()
		        );
		
		
		
		// 운영 정책 검색
		List<RagChunk> policyChunks = getPolicyChunksByReasonCode(reportContext.getReasonCode());
		// 유사 사례 검색
		List<RagChunk> caseChunks = searchSimilarChunksByDocument(searchQuery, "report-cases.pdf", 2);

		// 정책 + 사례 합치기
		List<RagChunk> similarChunks = new ArrayList<>();
		similarChunks.addAll(policyChunks);
		similarChunks.addAll(caseChunks);

		// contextBuilder - 검색된 참고자료를 하나의 문자열로 합치기
		StringBuilder contextBuilder = new StringBuilder();

		for (RagChunk chunk : similarChunks) {
			contextBuilder
					.append("[참고 문서: ").append(chunk.getDocumentName())
					.append(" / ").append(chunk.getTitle())
					.append("]\n");

			contextBuilder.append(chunk.getContent()).append("\n\n");
		}

		// ragContext -		GPT에게 줄 참고 문서
		String ragContext = contextBuilder.toString();

		// currentReport -	GPT에게 알려줄 현재 신고 정보
		AiReportAnalysisDto aiReportContext = new AiReportAnalysisDto();

		aiReportContext.setReasonCode(reportContext.getReasonCode());
		aiReportContext.setReasonDetail(reportContext.getReasonDetail());
		aiReportContext.setTargetType(reportContext.getTargetType());
		aiReportContext.setTargetId(reportContext.getTargetId());
		aiReportContext.setTargetTitle(reportContext.getTargetTitle());
		aiReportContext.setTargetContent(reportContext.getTargetContent());

		// 현재 신고 + 검색 근거를 GPT에게 전달
		return aiService.askToGptWithContext(ragContext, aiReportContext);
	}
}