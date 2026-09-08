package com.moit.member.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.solapi.sdk.SolapiClient;
import com.solapi.sdk.message.model.Message;
import com.solapi.sdk.message.service.DefaultMessageService;

@Service
public class SolapiSmsService {

    private final String apiKey;
    private final String apiSecret;
    private final String sender;

    public SolapiSmsService(
            @Value("${solapi.api-key}") String apiKey,
            @Value("${solapi.api-secret}") String apiSecret,
            @Value("${solapi.sender}") String sender
    ) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.sender = sender;
    }

    /**
     * 휴대폰 인증번호 SMS 발송
     */
    public void sendVerificationCode( String mobile, String code ) {

        try {

            // SOLAPI 메시지 서비스 생성
            DefaultMessageService messageService =
                    SolapiClient.INSTANCE.createInstance( apiKey, apiSecret );

            // 메시지 생성
            Message message = new Message();

            message.setFrom(sender);
            message.setTo(mobile);

            message.setText( "[MOIT] 휴대폰 인증번호는 " + code + "입니다." );

            // SMS 발송
            messageService.send(message, null);


        } catch (Exception e) {


            e.printStackTrace();

            throw new RuntimeException( "휴대폰 인증번호 발송에 실패했습니다.", e );
        }
    }
}