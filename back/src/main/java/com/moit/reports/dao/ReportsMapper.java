package com.moit.reports.dao;

import java.util.HashMap;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.moit.reports.dto.ReportsDto;

@Mapper
public interface ReportsMapper {

	// ===== user =====
	// ===== user =====
	// 신고 작성  /     서비스에서  - target_type  (MEETUP , REVIEW )
	public int insertUserReport(ReportsDto dto);
	
	// 사용자 본인이 작성한 신고 내역 수정
	public int updateUserReport(ReportsDto dto);

	// 사용자 본인이 작성한 신고 내역 삭제 (update delete_yn = 'Y')
	public int deleteUserReport(ReportsDto dto);

	// 사용자 본인이 작성한 신고 내역 조회 & 유저 - 페이징
	public List<ReportsDto> selectUserReport( HashMap<String, Object> map );

	// select id="selectUserCnt" resultType="int"
	public int selectUserCnt(Long memberId);
	
	// 사용자 본인이 작성한 신고 내역 상세 조회
	public ReportsDto selectUserReportDetail(ReportsDto dto);
	
	// 중복 신고 방지
	public int doubleReport(ReportsDto dto);
	// 신고 난사 방지
//	public int TodayReport(ReportsDto dto);
	
	
	
    // ===== admin =====
	// 신고당한 글 작성자 조회
	public Integer selectTargetMemberId(ReportsDto dto);
	// 신고당한 글 작성자 select (targetMemberId + members.nickname) -->
	public String selectTargetMemberNickname(ReportsDto dto);
	// 신고당한 글 작성자 닉네임 조회
//	public String selectNickname(ReportsDto dto);
	
	// APPROVED 승인 건수 조회 (MEETUP + REVIEW)
//	public int approvedCnt(ReportsDto dto);
	
	/////////////////////////////////////////////
	// 단순 조회용 쿼리 (로그인/마이페이지 호출용 member_info.trust_score - DB 부하 0%)
	public ReportsDto findMemberTrustInfo(ReportsDto dto);
	
	// 실시간 신뢰도 점수 산출 쿼리 (3개)
	// approved_cnt = 모임 참여 승인 횟수 (+2)
	public int selectApprovedCnt(int reportId);
	// noshow_cnt = 모임 노쇼 횟수 (-10)
	public int selectNoshowCnt(int reportId);
	// report_cnt = 내가 작성한 MEETUP/REVIEW가 신고 승인된 횟수 (-5)
	public int selectReportCnt(int reportId);

	// 실시간 신뢰도 점수 산출 쿼리 (1개)
	public int calTrustScore(int reportId);
	
	// 계산된 신뢰도 점수 업데이트 쿼리
	public int updateMemberTrustScore(ReportsDto dto);
	// 뱃지 업데이트 쿼리
	public int updateMemberBadge(ReportsDto dto);
	
	// 새벽 배치용: 전날 활동 이력(참여/노쇼/신고)이 있는 회원 ID 타겟 추출
	public List<ReportsDto> selectTargetMembersYesterday();
	// 3일 전에 신고 상태 변경된 데이터 추출
	public List<ReportsDto> selectThreeDaysAgo();
	
	
	
	// 신뢰도 점수 select
//	public int selectTrustScore(ReportsDto dto);
	// 뱃지 select
//	public String selectBadge(ReportsDto dto);
	
	// 신뢰도 점수 update
//	public int updateTrustScore(ReportsDto dto);
	// 뱃지 1/2/3 update
//	public int updateBadge(ReportsDto dto);
	
    public int updateAdmin(ReportsDto dto);
//	members table에 report_id로 email 찾기
    public String selectEmail(ReportsDto dto); 
    public int deleteAdmin(int reportId);

    // 관리자 신고 목록 조회 (동적 조건 + 페이징 + 단건 조회까지 포함)
    public List<ReportsDto> selectAdminReports(HashMap<String, Object> map);

    // 관리자 신고 목록 카운트 (동적 조건 반영)
    public int selectAdminReportsCnt(HashMap<String, Object> map);

    // ===== 통계 =====
    public List<ReportsDto> selectReasonReportCount();
    public List<ReportsDto> selectMemberReportCount();
    public List<ReportsDto> selectTargetReportCount();
	
}
