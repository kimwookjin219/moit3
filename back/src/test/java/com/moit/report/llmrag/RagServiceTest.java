package com.moit.report.llmrag;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.moit.reports.llmrag.RagChunk;
import com.moit.reports.llmrag.RagService;

@SpringBootTest
class RagServiceTest {

	@Autowired
	private RagService ragService;

	@Test
	@DisplayName("RAG PDF 문서 조각 저장 확인")
	void ragChunksLoadTest() {

		// 서버 시작 시 RagInitializer가 PDF를 읽고
		// RagService의 chunks에 저장한 문서 조각 전체 조회
		List<RagChunk> chunks = ragService.getChunks();

		System.out.println();
		System.out.println("===== RAG 문서 조각 저장 테스트 =====");

		// 저장된 전체 문서 조각 수 출력
		System.out.println("[RAG TEST] 저장된 문서 조각 수: " + chunks.size());

		// 저장된 문서 조각 하나씩 출력
		for (RagChunk chunk : chunks) {
			System.out.println("[RAG TEST] " + chunk.getDocumentName() + " / " + chunk.getTitle());
		}

		System.out.println("==================================");
		System.out.println();

		// 운영기준 5개 + 과거사례 8개 = 총 13개
		assertThat(chunks).hasSize(13);
	}

	@Test
	@DisplayName("NOSHOW 신고와 비슷한 문서 Top 3 검색")
	void searchSimilarChunksTest() {

		// 임시 query
		String question = "모임 당일 아무 연락 없이 참석하지 않았습니다.";

		// 현재 신고 내용과 가장 비슷한 문서 조각 3개 검색
		List<RagChunk> result = ragService.searchSimilarChunks(question, 3);

		System.out.println();
		System.out.println("===== RAG 유사 문서 검색 테스트 =====");

		for (RagChunk chunk : result) {
			System.out.println("[RAG TOP] " + chunk.getDocumentName() + " / " + chunk.getTitle());
			System.out.println("내용: " + chunk.getContent());
			System.out.println("----------------------------------");
		}

		System.out.println("==================================");
		System.out.println();

		assertThat(result).hasSize(3);
	}
	
	@Test
	@DisplayName("실제 신고 RAG AI 분석 테스트")
	void analyzeReportTest() {

		// 실제 DB에 존재하는 신고 번호
		Long reportId = 7L;
		String result = ragService.analyzeReport(reportId);

		System.out.println();
		System.out.println("===== RAG AI 분석 결과 =====");
		System.out.println(result);
		System.out.println("==========================");

		assertThat(result).isNotBlank();
	}
}