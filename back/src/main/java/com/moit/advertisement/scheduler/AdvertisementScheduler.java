package com.moit.advertisement.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.moit.advertisement.dto.DashboardAiDto;
import com.moit.advertisement.service.AdvertisementService;
import com.moit.advertisement.service.AiSummaryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdvertisementScheduler {

    private final AdvertisementService advertisementService;
    private final AiSummaryService aiSummaryService;


    // 1분마다 광고 상태 체크
    @Scheduled(cron = "0 * * * * *")
    //@Scheduled(cron = "0 */5 * * * *")

    public void updateAdvertisementStatus() {

    	log.info("광고 상태 체크 스케줄러 시작");

        advertisementService.updateAdvertisementStatus();

        log.info("광고 상태 체크 스케줄러 종료");
    }

    // 5분마다 광고 우선도 갱신 실행 
    @Scheduled(cron = "0 */5 * * * *")
    //@Scheduled(cron = "0 */1 * * * *")
    public void updateAdvertisementPriority() {


        int count =
            advertisementService.updatePriorityScore();

        log.info(
                "광고 우선도 갱신 완료. 변경 건수={}",
                count
            );
    }
    
    // 매일 새벽 1시  일일통계 저장
    @Scheduled(cron = "0 0 1 * * *")
    //@Scheduled(cron = "0 */1 * * * *")
    public void createDailyStatistics(){
    	log.info("광고 일일 통계 생성 스케줄러 시작");

        advertisementService.insertDailyStatistics();

        log.info("광고 일일 통계 생성 스케줄러 완료");
    }
    
    
    // 매일 오전 9시 광고기간 만료 30/14일자 발송
//    @Scheduled(cron = "0 0 9 * * *")
    @Scheduled(cron = "0 */5 * * * *")

    public void advertisementReminder() {
    	log.info("광고 연장 안내 메일 스케줄러 실행");

        advertisementService.sendReminderMail();

        log.info("광고 연장 안내 메일 스케줄러 완료");
    }
    
    
    // 3시간마다 통계 ai 요약 저장
    @Scheduled(cron = "0 0 */3 * * *")
    //@Scheduled(cron = "0 */1 * * * *")

    public void generateAiSummary() {

        log.info("AI 광고 통계 요약 스케줄러 시작");

    	try {
	    	// 1. 통계 데이터 조회
	        DashboardAiDto dto = advertisementService.getDashboardAiData();
	        
	        // 2. AI 요약 생성
	        String summary = aiSummaryService.createSummary(dto);
	        
	        // 3. DB 저장	
	        advertisementService.saveAiSummary(summary);
	        
	        log.info("AI 광고 통계 요약 저장 완료");

        } catch (Exception e) {

            log.error(
                "AI 광고 통계 요약 처리 중 오류가 발생했습니다.",
                e
            );
        }
    }
}