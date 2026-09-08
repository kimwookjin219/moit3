package com.moit.member.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.moit.reports.llmrag.LlmRagRequest;
import com.moit.reports.llmrag.LlmRagResponse;
import com.moit.reports.llmrag.Message;

import lombok.RequiredArgsConstructor;

@Service
public class SignupAiService {

    private final RestClient openAiRestClient;

    public SignupAiService(
            @Qualifier("openAiRestClient") RestClient openAiRestClient) {
        this.openAiRestClient = openAiRestClient;
    }

    /**
     * 회원가입 행동 데이터를 기반으로
     * 사용자에게 보여줄 AI 도움말을 생성한다.
     */
    public String askSignupAi(String question) {

        String systemInstruction = """
                당신은 MOIT 회원가입을 도와주는 친절한 AI 도우미입니다.

                사용자의 회원가입 과정에서 현재 어려움을 겪고 있는 항목을 확인하고,
                사용자가 지금 바로 시도할 수 있는 해결 방법을 짧고 자연스럽게 안내하세요.

                다음 규칙을 반드시 지키세요.

                - 현재 도움말 대상 필드에 대해서만 답변하세요.
                - 사용자가 바로 시도할 수 있는 구체적인 방법을 알려주세요.
                - 실패 원인을 하나로 단정하지 마세요.
                - 가능한 해결 방법 중 하나 또는 두 가지를 골라 안내하세요.
                - 같은 표현을 반복하지 마세요.
                - 친절하고 자연스러운 말투를 사용하세요.
                - 추상적인 격려나 의미 없는 안내는 하지 마세요.
                - "회원가입을 계속 진행해주세요."와 같은 일반적인 답변은 사용하지 마세요.
                - "AI", "분석", "행동 데이터", "실패 횟수"라는 표현은 사용자에게 보여주지 마세요.
                - 한국어로 작성하세요.
                - 1~2문장으로 짧게 작성하세요.
                - 도움말만 반환하세요.
                """;

        List<Message> messages = List.of(
                new Message("system", systemInstruction),
                new Message("user", question)
        );

        LlmRagRequest requestBody =
                new LlmRagRequest("gpt-4o-mini", messages);

        LlmRagResponse response = openAiRestClient
                .post()
                .uri("/chat/completions")
                .body(requestBody)
                .retrieve()
                .body(LlmRagResponse.class);

        if (response != null
                && response.choices() != null
                && !response.choices().isEmpty()) {

            return response.choices()
                    .get(0)
                    .message()
                    .getContent();
        }

        return "현재 도움말을 생성하지 못했습니다.";
    }
}