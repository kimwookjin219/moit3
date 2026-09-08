package com.moit.reports.api;

import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import java.util.Properties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ApiEmail {
	
	@Value("${NAVER_HOST}")
	public String host;
	@Value("${NAVER_USER}")
	public String user;
	@Value("${NAVER_PASSWORD}")
	public String password;
	
	// 이메일 보내기			제목				본문내용			받는사람
	public void sendMail(String subject, String content, String to) {
		
		Properties props = new Properties();
		props.put("mail.smtp.host", host);		// 어떤 메일 서버 쓸지.
		props.put("mail.smtp.auth", "true");	// 아이디/비밀번호 인증 사용 여부
		props.put("mail.smtp.port", "587");		// 포트
//		props.put("mail.debug", "true");		// 전송 로그 출력
		
		props.put("mail.smtp.starttls.enable", "true");		// 이메일 전송 시 보안연결 TLS 사용
		props.put("mail.smtp.ssl.trust", "smtp.naver.com");	// ssl 인증서 연결
		props.put("mail.smtp.ssl.protocols", "TLSv1.2");	// TLS 버전 지정
		
		// 3. Session
		Session session = Session.getInstance( props, new Authenticator() {
			
			@Override
			protected PasswordAuthentication getPasswordAuthentication() {
				return new PasswordAuthentication(user, password);
			}
		});
		
		// 4. 메일보내기 (Mime 텍스트 text/plain , html text/html , 이미지 image/png) 멀티미디어메시지
		// MimeMessage -	실제로 SMTP 서버에 보낼 이메일 메시지 객체
		MimeMessage message = new MimeMessage(session);

		try {
			// 보내는 사람
			message.setFrom(new InternetAddress(user));
			// 받는 사람
			message.addRecipient(Message.RecipientType.TO, new InternetAddress(to));
			message.setSubject(subject);
			message.setText(content + "\n\n(이 메일은 자동 발송된 안내 메일입니다.)", "UTF-8");
			
			Transport.send(message);
			System.out.println("\n....... sendEmail successfully .......");
		
		} catch (Exception e) { e.printStackTrace(); }
	}
}