package com.moit.reports.llmrag;

public record Choice(int index, Message message, String finish_reason) {
	
}

//@Value - import lombok.Value;
//-------------------------------- 아래속성
//@Getter
//@FieldDefaults(makeFinal=true, level=AccessLevel.PRIVATE)
//						- 모든필드를 private final 변경
//@AllArgsConstructor	- 모든생성자
//@ToString				- 문자열연결
//@EqualsAndHashCode.