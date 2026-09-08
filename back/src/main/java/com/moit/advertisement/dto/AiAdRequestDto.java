package com.moit.advertisement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AiAdRequestDto {

	@NotBlank(message = "키워드를 입력해주세요.")
	@Size(min = 1, max = 50, message = "키워드는 1~50자까지 입력해주세요.")
    private String keyword;

}
