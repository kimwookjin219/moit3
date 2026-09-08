package com.moit.advertisement.mapper;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.moit.advertisement.dto.AdvertisementChartDto;
import com.moit.advertisement.dto.AdvertisementDto;
import com.moit.advertisement.dto.AdvertisementImageDto;
import com.moit.advertisement.dto.AdvertisementSearchDto;
import com.moit.advertisement.dto.DashboardAiDto;
import com.moit.advertisement.dto.AdvertisementExtensionRequestDto;

@Mapper
public interface AdvertisementMapper {

	
	int updatePendingToOpen();

    int updateOpenToClosed();
    
    int updatePriorityScore();
    
	// 제휴사용자 목록
	List<AdvertisementDto> searchMyAdvertisement(AdvertisementSearchDto dto);

	int selectMyAdvertisementTotalCnt(AdvertisementSearchDto dto);

	// 관리자 목록
	List<AdvertisementDto> searchByAdmin(AdvertisementSearchDto dto);

	int selectAdminAdvertisementTotalCnt(AdvertisementSearchDto dto);

	// 승인 목록
	List<AdvertisementDto> searchWaitingList(AdvertisementSearchDto dto);

	int selectWaitingTotalCnt(AdvertisementSearchDto dto);
	
	// 연장 신청 조회목록
	List<AdvertisementDto> selectExtensionList();

    // 상세 조회
    AdvertisementDto selectAdvertisementOne(Long adId);

    // 등록
    int insertAdvertisement(AdvertisementDto dto);

    // 수정
    int updateAdvertisement(AdvertisementDto dto);

    // 논리 삭제 (adId만 사용)
    int deleteAdvertisement(Long adId);

    // 승인 상태 변경
    int updateApprovalStatus(AdvertisementDto dto);
    
    // 연장승인 상태 변경
    void updateExtensionApprove(AdvertisementDto dto);
    
    //  광고 연장 신청
    int requestExtension(AdvertisementExtensionRequestDto dto);
    
    // 상태 변경
    int updateAdvertisementStatus(AdvertisementDto dto);
        
    int approveAd(AdvertisementDto dto);

    int rejectAd(AdvertisementDto dto);
    
    // 우선도 설정
    int updateAdGrade(
            @Param("adId") Long adId,
            @Param("adGrade") String adGrade
    );
    
    // 기간 변경
    void updatePeriod(@Param("adId") Long adId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
    
    // 이미지 등록
    int insertAdvertisementImage(AdvertisementImageDto dto);

    // 이미지 조회
    List<AdvertisementImageDto> selectAdvertisementImageList(Long adId);

    // 이미지 삭제
    int deleteAdvertisementImages(Long adId);

    // 노출 증가
    int updateImpressions(Long adId);
    // 클릭 증가
    int updateAdvertisementClick(Long adId);

    // 사용자 광고 1건
    AdvertisementDto selectTopAdvertisement(
            @Param("position") String position,
            @Param("memberId") Integer memberId,
            @Param("sessionId") String sessionId
    );

    // 통계
    int selectTotalAdvertisementCnt();

    int selectOpenAdvertisementCnt();

    int selectPendingAdvertisementCnt();

    int selectClosedAdvertisementCnt();
    
    // 클릭 로그 저장
    void insertClickLog(
            @Param("adId") Long adId,
            @Param("memberId") Integer memberId,
            @Param("deviceType") String deviceType,
            @Param("ipAddress") String ipAddress,
            @Param("sessionId") String sessionId,
            @Param("referrer") String referrer,
            @Param("position") String position
    );
    
    // 광고 클릭 확인
    int checkDuplicateClick(
            @Param("adId") Long adId,
            @Param("memberId") Integer memberId,
            @Param("clickIp") String clickIp
    );
    // 광고 클릭시 포인트 증가
    void addPoint(
    	    @Param("memberId") int memberId,
    	    @Param("point") int point
    	);
    // 멤버 광고 포인트 관리
    int checkAdvertisementPoint(int memberId);

    void updateMemberPoint(@Param("memberId") int memberId);

    void insertPointHistory(@Param("memberId") int memberId);
    
 // 노출 로그 중복 체크
    int checkDuplicateImpression(
            @Param("adId") Long adId,
            @Param("memberId") Integer memberId,
            @Param("sessionId") String sessionId
    );


    // 노출 로그 저장
    void insertImpressionLog(
            @Param("adId") Long adId,
            @Param("memberId") Integer memberId,
            @Param("deviceType") String deviceType,
            @Param("ipAddress") String ipAddress,
            @Param("sessionId") String sessionId,
            @Param("position") String position
    );
    
 // 광고 일일 통계 생성
    int insertDailyStatistics();
    
//////////// 광고 통계 차트
    AdvertisementChartDto selectSummary(); // 총 통계
    List<AdvertisementChartDto> selectDailyChart();    // 일일통계
    List<AdvertisementChartDto> selectTopCtrChart();   // ctr 탑5
    List<AdvertisementChartDto> selectGradeChart();	   // 등급비율
    List<AdvertisementChartDto> selectPositionChart(); // 위치별 노출
    double selectExtensionRate();					   // 연장률
    List<AdvertisementChartDto> selectPositionCtrChart(); // 위치별 ctr
    
    // 피로도 갯수
    Integer selectFatigueWarningCount();
    /// 피로도 
    AdvertisementDto selectAdvertisementStatistics(Long adId);
//    Double selectRecentCtr(int adId);		// 최근 ctr
//    Double selectPreviousCtr(int adId);		// 이전 ctr
//    Double selectRepeatRate(int adId);		// 반복 노출률
    
    ///////
    void insertAiSummary(String summary);

    DashboardAiDto selectLatestAiSummary();
    
    
    // 광고 만료 메일 30일/14일
    List<AdvertisementDto> selectReminder30List();

    List<AdvertisementDto> selectReminder14List();

    int updateReminder30Sent(Long adId);

    int updateReminder14Sent(Long adId);
}