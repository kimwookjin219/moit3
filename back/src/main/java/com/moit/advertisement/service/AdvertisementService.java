package com.moit.advertisement.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.moit.advertisement.dto.AdminAdvertisementStatDto;
import com.moit.advertisement.dto.AdvertisementChartDto;
import com.moit.advertisement.dto.AdvertisementDto;
import com.moit.advertisement.dto.AdvertisementImageDto;
import com.moit.advertisement.dto.AdvertisementPaymentDto;
import com.moit.advertisement.dto.AdvertisementPositionPriceDto;
import com.moit.advertisement.dto.AdvertisementPriceDto;
import com.moit.advertisement.dto.AdvertisementSearchDto;
import com.moit.advertisement.dto.DashboardAiDto;


public interface AdvertisementService {
	
	// 제휴사용자 목록
	List<AdvertisementDto> searchMyAdvertisement(AdvertisementSearchDto dto);

	// 제휴사용자 목록 개수
	int selectMyAdvertisementTotalCnt(AdvertisementSearchDto dto);

	// 관리자 목록
	List<AdvertisementDto> searchByAdmin(AdvertisementSearchDto dto);

	// 관리자 목록 개수
	int selectAdminAdvertisementTotalCnt(AdvertisementSearchDto dto);
	
	// 관리자 탭별 전용 목록 및 카운트
	List<AdvertisementDto> searchApprovalTabList(AdvertisementSearchDto dto);
	Long selectApprovalTabTotalCnt(AdvertisementSearchDto dto);

	List<AdvertisementPaymentDto> searchPaymentTabList(AdvertisementSearchDto dto);
	long selectPaymentTabTotalCnt(AdvertisementSearchDto dto);

	List<AdvertisementDto> searchStatusTabList(AdvertisementSearchDto dto);
	long selectStatusTabTotalCnt(AdvertisementSearchDto dto);
	
	AdminAdvertisementStatDto.ApprovalStat getApprovalStats();
	AdminAdvertisementStatDto.PaymentStat getPaymentStats();
	AdminAdvertisementStatDto.StatusStat getStatusStats();
	
    // 관리자 결제 내역
    List<AdvertisementPaymentDto> searchPaymentHistory( AdvertisementSearchDto dto );

	// 승인 목록
	List<AdvertisementDto> searchWaitingList(AdvertisementSearchDto dto);

	// 승인 목록 개수
	int selectWaitingTotalCnt(AdvertisementSearchDto dto);
	
    // 상세 조회
    AdvertisementDto selectAdvertisementOne(Long adId);

    // 광고 등록
    Long insertAdvertisement(
	    AdvertisementDto.AdvertisementRequestDto dto,
	    Long advertiserId,
        List<String> imageTypes
	);

    // 광고 수정
    void updateAdvertisement(
            Long adId,
            Long memberId,
            AdvertisementDto.AdvertisementUpdateRequestDto dto,
            List<MultipartFile> imageFiles,
            List<String> imageTypes,
            List<String> deletedImageTypes
    );

    // 광고 삭제
    int deleteAdvertisement(Long adId, Long memberId);

    // 승인
    int updateApprovalStatus(AdvertisementDto.AdvertisementAdminUpdateDto dto);
    
    // 상태 변경
    int updateAdvertisementStatus(AdvertisementDto.AdvertisementAdminUpdateDto dto);
    
    void updateAdvertisementStatus();

    // 우선도 설정
	int updateAdGrade(Long adId, String adGrade);
	// 광고 우선도 갱신
	int updatePriorityScore();
	
	// 연장 가격 조회
	List<AdvertisementPriceDto> getExtensionPrices(Long adId, Long memberId);
	
	// 기간 변경
    void updatePeriod(Long adId, LocalDateTime start, LocalDateTime end);
    
    // 이미지 등록
    int insertAdvertisementImage(AdvertisementImageDto dto);

    // 이미지 전체 조회
    List<AdvertisementImageDto> selectAdvertisementImageList(Long adId);

    // 이미지 삭제
    int deleteAdvertisementImage(Long adId);

    // 노출 수 증가
//    void updateImpressions(Long adId);

    // 광고 조회
    AdvertisementDto selectTopAdvertisement(String position);

    // 통계
    int selectTotalAdvertisementCnt();

    int selectOpenAdvertisementCnt();

    int selectPendingAdvertisementCnt();

    int selectClosedAdvertisementCnt();
    
    AdvertisementDto selectAdvertisement(
            String position,
            Long memberId,
            String sessionId
    );

    // 클릭 로그
    boolean insertClickLog(
            Long adId,
            String position,
            Long memberId,
            String sessionId,
            String ip,
            String userAgent,
            String referrer);
	
	// 노출 로그
    boolean insertImpressionLog(
            Long adId,
            String position,
            Long memberId,
            String sessionId,
            String ip,
            String userAgent);
    
    // 포인트 적립
//    boolean processAdvertisementClick(
//            Long adId,
//            String position,
//            Long memberId,
//            String ip,
//            String userAgent
//    );

	// 일일통계
	void insertDailyStatistics();
	
	// 통계 차트
	// 총 통계
	AdvertisementChartDto selectSummary();
	// 7일치 통계차트
	List<AdvertisementChartDto> selectDailyChart();
	// ctr 탑5
	List<AdvertisementChartDto> selectTopCtrChart();
	// 등급비율
	List<AdvertisementChartDto> selectGradeChart();
	// 위치별 노출
	List<AdvertisementChartDto> selectPositionChart(); 
	// 연장률
	double selectExtensionRate();	
	// 위치별 ctr 차트
	List<AdvertisementChartDto> selectPositionCtrChart();
	
	// AI 통계 요약
	DashboardAiDto getDashboardAiData();
	DashboardAiDto getLatestAiSummary(); 
    void saveAiSummary(String summary); 
	
	
	// 피로도
//    AdvertisementStatisticsDto getAdvertisementStatistics(Long adId);

	// 메일 발송
	void sendReminderMail();

	AdvertisementPaymentDto createInitialPayment(Long adId, Long memberId);

	List<AdvertisementPriceDto> getInitialPrices();
	List<AdvertisementPositionPriceDto> getPositionPrices();
	
	AdvertisementPaymentDto createExtensionPayment(
	        Long adId,
	        Long memberId,
	        int days
	);
}