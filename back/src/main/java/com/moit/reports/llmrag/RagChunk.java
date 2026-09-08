package com.moit.reports.llmrag;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @AllArgsConstructor
public class RagChunk {	// 문서 조각 & 문서 조각을 숫자로 바꾼 결과

    // 어떤 PDF에서 나온 문서 조각인지
    private String documentName;

    // 문서 조각의 제목 (ABUSE, SPAM, FAKE_INFO, AD, NOSHOW, ETC)
    private String title;

    // 실제 문서 내용
    private String content;

    // content를 embedding(숫자로 변환)한 결과
    private List<Double> embedding;
}