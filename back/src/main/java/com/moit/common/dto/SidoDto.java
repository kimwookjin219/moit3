package com.moit.common.dto;

import com.moit.common.entity.Sido;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SidoDto {

    private Long sidoId;
    private String name;

    public static SidoDto from(Sido sido) {
        return SidoDto.builder()
                .sidoId(sido.getId())
                .name(sido.getName())
                .build();
    }
}
