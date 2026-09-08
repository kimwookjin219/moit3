package com.moit.common.dto;

import com.moit.common.entity.Sigungu;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SigunguDto {
	private Long sigunguId;
	private String name;
	private SidoDto sido;
	
	public static SigunguDto from(Sigungu sigungu) {
		return SigunguDto.builder()
						 .sigunguId(sigungu.getId())
						 .name(sigungu.getName())
						 .sido(SidoDto.from(sigungu.getSido()))
						 .build();
	} 
}
