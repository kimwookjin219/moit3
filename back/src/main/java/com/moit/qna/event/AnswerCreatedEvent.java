package com.moit.qna.event;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class AnswerCreatedEvent {

    private final Long questionId;

}