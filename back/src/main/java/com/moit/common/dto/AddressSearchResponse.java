package com.moit.common.dto;

import java.util.List;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class AddressSearchResponse {
//	private int totalCount;
//	List<AddressSearchResponse.AddressSearchDto> list;
	
	@Data
    public static class AddressSearchDto{
        private String address;
        private String road;
        private String jibun;
        private String zipNo;
        private Double latitude;
        private Double longitude;
        private Integer nx;         // 기상청 X
        private Integer ny;         // 기상청 Y
        private String sido;
        private String sigungu;
		
        
    }
	
	@Getter
	@Setter
	public static class AddressSearchListResponseDto{
		private List<AddressSearchDto> list;
		private Long totalCount; // 전체 데이터 수
		private Long totalPage;  // 전체 페이지 수
	}

}