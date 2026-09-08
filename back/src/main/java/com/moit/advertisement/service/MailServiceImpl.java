package com.moit.advertisement.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.moit.advertisement.dto.AdvertisementDto;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String mailSenderEmail;

    // =========================================================
    // 광고 종료 예정 메일
    // =========================================================
    @Override
    public void sendAdvertisementReminderMail(AdvertisementDto ad, String advertiserEmail, int remainDay) {

		  try {
		  
		  MimeMessage message = mailSender.createMimeMessage();
		  
		  MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
		  
		  helper.setFrom(mailSenderEmail);
		  helper.setTo(advertiserEmail);
		  helper.setSubject("[MOIT] 광고 종료 예정 안내");
		  
		  String html = """
                  <html>
                  <body style="font-family:Arial,sans-serif;
                               background:#f5f5f5;
                               padding:30px;">

                  <div style="max-width:600px;
                              margin:auto;
                              background:white;
                              border-radius:10px;
                              padding:40px;
                              border:1px solid #e5e5e5;">

                      <h2 style="color:#0d6efd;margin-top:0;">
                          광고 종료 예정 안내
                      </h2>
		  
		  <p> 안녕하세요. <b>%s</b>님. </p>
		  
		  <p> 등록하신 광고 <b>『%s』</b>의 종료일까지 <span
		  style="color:red;font-weight:bold;">%d일</span> 남았습니다. </p>
		  
		  <p> 광고를 계속 게시하시려면 아래 버튼을 눌러 광고 연장을 신청해주세요. </p>
		  
		  <div style="margin:35px 0;text-align:center;">
		  
		  <a href="http://localhost:3000/user/mypage/advertiseList" style="
		  display:inline-block; padding:14px 28px; background:#0d6efd; color:#ffffff;
		  text-decoration:none; border-radius:6px; font-weight:bold;"> 광고 연장 신청하기 </a>
		  
		  </div>
		  
		  <hr>
		  
		  <p style="font-size:13px;color:#888;"> 본 메일은 MOIT 시스템에서 자동 발송되었습니다. </p>
		  
		  </div>
		  
		  </body> </html> """ .formatted( ad.getAdvertiserNickname(), ad.getTitle(), remainDay
		  );
		  
		  helper.setText(html, true);
		  
		  mailSender.send(message);
		  
		  log.info(
			        "광고 종료 예정 메일 발송 완료. adId={} | remainDay={}",
			        ad.getAdId(),
			        remainDay
			);

			} catch (Exception e) {
			    log.error(
			            "광고 종료 예정 메일 발송 실패. adId={}",
			            ad.getAdId(),
			            e
			    );
			}
    }
    
    @Override
    public void sendAdvertisementPaymentRequestMail(
            AdvertisementDto ad,
            String advertiserEmail) {

        if (advertiserEmail == null || advertiserEmail.isBlank()) {
            throw new IllegalArgumentException(
                    "광고주 이메일이 존재하지 않습니다."
            );
        }

        try {

            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailSenderEmail);
            helper.setTo(advertiserEmail);
            helper.setSubject("[MOIT] 광고 승인 완료 및 결제 요청");

            String html = """
                    <html>
                    <body style="font-family:Arial,sans-serif;
                                 background:#f5f5f5;
                                 padding:30px;">

                        <div style="max-width:600px;
                                    margin:auto;
                                    background:white;
                                    border-radius:10px;
                                    padding:40px;
                                    border:1px solid #e5e5e5;">

                            <h2 style="color:#0d6efd;margin-top:0;">
                                광고 승인 완료
                            </h2>

                            <p>
                                안녕하세요. MOIT입니다.
                            </p>

                            <p>
                                신청하신 광고
                                <b>『%s』</b>
                                가 관리자 승인을 완료했습니다.
                            </p>

                            <div style="background:#f8f9fa;
                                        padding:20px;
                                        border-radius:8px;
                                        margin:25px 0;">

                                <p>
                                    <b>광고명</b><br>
                                    %s
                                </p>

                                <p>
                                    <b>광고 기간</b><br>
                                    %s ~ %s
                                </p>

                                <p>
                                    <b>결제 금액</b><br>
                                    %s원
                                </p>

                            </div>

                            <p>
                                아래 버튼을 눌러 결제를 진행해주세요.
                            </p>

                            <p style="color:#dc3545;
                                      font-weight:bold;">
                                ※ 결제가 완료되어야 광고가 정상적으로 운영됩니다.
                            </p>

                            <div style="margin:35px 0;
                                        text-align:center;">

                                <a href="http://localhost:3000/user/mypage/advertiseList"
                                   style="
                                   display:inline-block;
                                   padding:14px 28px;
                                   background:#0d6efd;
                                   color:#ffffff;
                                   text-decoration:none;
                                   border-radius:6px;
                                   font-weight:bold;">
                                    결제하러 가기
                                </a>

                            </div>

                        </div>

                    </body>
                    </html>
                    """.formatted(
                            ad.getTitle(),
                            ad.getTitle(),
                            ad.getStartDatetime(),
                            ad.getEndDatetime(),
                            ad.getPaymentAmount()
                    );
            
            helper.setText(html, true);
            
            log.info(
                    "광고 결제 요청 메일 발송 | adId={} | title={} | start={} | end={} | amount={}",
                    ad.getAdId(),
                    ad.getTitle(),
                    ad.getStartDatetime(),
                    ad.getEndDatetime(),
                    ad.getPaymentAmount()
            );

            // 실제 메일 발송
            mailSender.send(message);

            log.info(
                    "광고 결제 요청 메일 발송 완료. adId={}",
                    ad.getAdId()
            );

        } catch (Exception e) {

            log.error(
                    "광고 결제 요청 메일 발송 실패. adId={}",
                    ad.getAdId(),
                    e
            );

            throw new RuntimeException(
                    "광고 결제 요청 메일 발송 실패",
                    e
            );
        }
    }
}