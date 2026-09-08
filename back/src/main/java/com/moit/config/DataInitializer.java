package com.moit.config;

import java.math.BigDecimal;
import java.util.Arrays;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import com.moit.advertisement.entity.AdvertisementPositionPrice;
import com.moit.advertisement.entity.AdvertisementPrice;
import com.moit.advertisement.enums.AdGrade;
import com.moit.advertisement.enums.AdPosition;
import com.moit.advertisement.enums.PaymentType;
import com.moit.advertisement.repository.AdvertisementPositionPriceRepository;
import com.moit.advertisement.repository.AdvertisementPriceRepository;
import com.moit.common.entity.Sido;
import com.moit.common.entity.Sigungu;
import com.moit.common.repository.SidoRepository;
import com.moit.common.repository.SigunguRepository;
import com.moit.meetup.entity.MeetupCategory;
import com.moit.meetup.repository.MeetupCategoryRepository;
import com.moit.member.entity.Interest;
import com.moit.member.entity.MemberStatus;
import com.moit.member.entity.MemberType;
import com.moit.member.enums.MemberStatusEnum;
import com.moit.member.enums.MemberTypeEnum;
import com.moit.member.repository.InterestRepository;
import com.moit.member.repository.MemberStatusRepository;
import com.moit.member.repository.MemberTypeRepository;
import com.moit.reports.entity.MemberReportStatus;
import com.moit.reports.repository.MemberReportStatusRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {
	
	private final MemberTypeRepository memberTypeRepository;
	private final MemberStatusRepository memberStatusRepository;
	
	private final AdvertisementPriceRepository priceRepository;
    private final AdvertisementPositionPriceRepository positionPriceRepository;
	
    private final MeetupCategoryRepository categoryRepository;
    private final SidoRepository  sidoRepository;
    private final SigunguRepository  sigunguRepository;
    
    private final MemberReportStatusRepository memberReportStatusRepository;
    
    private final InterestRepository interestRepository;
    
	@Bean
	@Order(1)
	public CommandLineRunner initData() {
		return args -> {
            
			// ==========================================
			// 1. 회원유형 초기 데이터
			// ==========================================
			for(MemberTypeEnum type : MemberTypeEnum.values()) {
				if(!memberTypeRepository.existsById(type.getId())) {
					MemberType memberType = new MemberType();
					memberType.setMemberTypeId(type.getId());
					memberType.setTypeName(type.name());
					memberTypeRepository.save(memberType);					
				}
			}
			
			// ==========================================
			// 2. 회원상태 초기 데이터
			// ==========================================
			for(MemberStatusEnum status : MemberStatusEnum.values()) {
				if(!memberStatusRepository.existsById(status.getId())) {
					MemberStatus memberStatus = new MemberStatus();
					memberStatus.setStatusId(status.getId());
					memberStatus.setStatusName(status.name());
					memberStatusRepository.save(memberStatus);
				}
			}

            // ==========================================
			// 기간별 광고 가격 세팅
			// ==========================================
            if (priceRepository.count() == 0) {
                //log.info("🔥 [DataInit] 기간별 광고 가격 데이터가 없어 기본값을 생성합니다.");

                // 순서 주의: AdGrade, periodDays, PaymentType, basePrice
                priceRepository.saveAll(Arrays.asList(
                    // --- 신규(INITIAL) 일반 ---
                    AdvertisementPrice.create(AdGrade.GENERAL, 1, PaymentType.INITIAL, new BigDecimal("10000")),
                    AdvertisementPrice.create(AdGrade.GENERAL, 7, PaymentType.INITIAL, new BigDecimal("65000")),
                    AdvertisementPrice.create(AdGrade.GENERAL, 14, PaymentType.INITIAL, new BigDecimal("125000")),
                    AdvertisementPrice.create(AdGrade.GENERAL, 30, PaymentType.INITIAL, new BigDecimal("250000")),
                    AdvertisementPrice.create(AdGrade.GENERAL, 60, PaymentType.INITIAL, new BigDecimal("480000")),
                    AdvertisementPrice.create(AdGrade.GENERAL, 90, PaymentType.INITIAL, new BigDecimal("670000")),

                    // --- 신규(INITIAL) 프리미엄 ---
                    AdvertisementPrice.create(AdGrade.PREMIUM, 1, PaymentType.INITIAL, new BigDecimal("20000")),
                    AdvertisementPrice.create(AdGrade.PREMIUM, 7, PaymentType.INITIAL, new BigDecimal("130000")),
                    AdvertisementPrice.create(AdGrade.PREMIUM, 14, PaymentType.INITIAL, new BigDecimal("250000")),
                    AdvertisementPrice.create(AdGrade.PREMIUM, 30, PaymentType.INITIAL, new BigDecimal("500000")),
                    AdvertisementPrice.create(AdGrade.PREMIUM, 60, PaymentType.INITIAL, new BigDecimal("960000")),
                    AdvertisementPrice.create(AdGrade.PREMIUM, 90, PaymentType.INITIAL, new BigDecimal("1350000")),

                    // --- 연장(EXTENSION) 일반 ---
                    AdvertisementPrice.create(AdGrade.GENERAL, 7, PaymentType.EXTENSION, new BigDecimal("60000")),
                    AdvertisementPrice.create(AdGrade.GENERAL, 14, PaymentType.EXTENSION, new BigDecimal("110000")),
                    AdvertisementPrice.create(AdGrade.GENERAL, 30, PaymentType.EXTENSION, new BigDecimal("220000")),
                    AdvertisementPrice.create(AdGrade.GENERAL, 60, PaymentType.EXTENSION, new BigDecimal("420000")),
                    AdvertisementPrice.create(AdGrade.GENERAL, 90, PaymentType.EXTENSION, new BigDecimal("600000")),

                    // --- 연장(EXTENSION) 프리미엄 ---
                    AdvertisementPrice.create(AdGrade.PREMIUM, 7, PaymentType.EXTENSION, new BigDecimal("120000")),
                    AdvertisementPrice.create(AdGrade.PREMIUM, 14, PaymentType.EXTENSION, new BigDecimal("220000")),
                    AdvertisementPrice.create(AdGrade.PREMIUM, 30, PaymentType.EXTENSION, new BigDecimal("450000")),
                    AdvertisementPrice.create(AdGrade.PREMIUM, 60, PaymentType.EXTENSION, new BigDecimal("850000")),
                    AdvertisementPrice.create(AdGrade.PREMIUM, 90, PaymentType.EXTENSION, new BigDecimal("1200000"))
                ));
            }

            // ==========================================
			// 위치별 추가금 세팅 (MAIN 제거)
			// ==========================================
            if (positionPriceRepository.count() == 0) {
                //log.info("🔥 [DataInit] 위치별 추가금 데이터가 없어 기본값을 생성합니다.");

                positionPriceRepository.saveAll(Arrays.asList(
                    createPositionPrice(AdPosition.MEETUP_LIST_BANNER, new BigDecimal("30000")),
                    createPositionPrice(AdPosition.MEETUP_LIST_SIDEBAR, new BigDecimal("15000")),
                    createPositionPrice(AdPosition.MEETUP_DETAIL_SIDEBAR, new BigDecimal("10000"))
                ));
            }
            
            // ==========================================
            // 카테고리
            // ==========================================
            initCategories();

            // ==========================================
            // 시도
            // ==========================================
            initSidos();

            // ==========================================
            // 시군구
            // ==========================================
            initSigungus();
            
	         // ==========================================
	         // 회원 신고 상태 초기 데이터
	         // ==========================================
	         initMemberReportStatuses();
	         
	         // ==========================================
	         // 관심사 초기 데이터
	         // ==========================================
	         initMemberInterest();     
		};
	}

    private AdvertisementPositionPrice createPositionPrice(AdPosition position, BigDecimal price) {
        AdvertisementPositionPrice positionPrice = new AdvertisementPositionPrice();

        positionPrice.setPosition(position);
        positionPrice.setAdditionalPrice(price);
        
        return positionPrice;
    }
    
    //관심사
    private void initMemberInterest() {
    	
    	if(interestRepository.count() > 0) {
    		log.info("🔥 [DataInit] 관심사 데이터가 이미 존재합니다.");
    		return;
    	}
    	
        interestRepository.saveAll(Arrays.asList(
                createInterest(1L, "운동"),
                createInterest(2L, "여행"),
                createInterest(3L, "게임"),
                createInterest(4L, "독서"),
                createInterest(5L, "맛집"),
                createInterest(6L, "영화"),
                createInterest(7L, "음악"),
                createInterest(8L, "요리")
            ));
    }
    
    private Interest createInterest(Long interestId, String interestName) {

        Interest interest = new Interest();
        interest.setInterestId(interestId);
        interest.setInterestName(interestName);

        return interest;
    }
    
    //카테고리
    private void initCategories() {

        if (categoryRepository.count() > 0) {
            //log.info("🔥 [DataInit] 카테고리 데이터가 이미 존재합니다.");
            return;
        }

        //log.info("🔥 [DataInit] 카테고리 초기 데이터를 생성합니다.");

        // 대분류
        MeetupCategory exercise = createCategory("운동");
        MeetupCategory travel = createCategory("여행");
        MeetupCategory game = createCategory("게임");
        MeetupCategory reading = createCategory("독서");
        MeetupCategory food = createCategory("맛집");
        MeetupCategory movie = createCategory("영화");
        MeetupCategory music = createCategory("음악");
        MeetupCategory cooking = createCategory("요리");

        categoryRepository.saveAll(Arrays.asList(
            exercise,
            travel,
            game,
            reading,
            food,
            movie,
            music,
            cooking
        ));

        // 운동
        categoryRepository.saveAll(Arrays.asList(
            createCategory("축구", exercise),
            createCategory("러닝", exercise),
            createCategory("등산", exercise)
        ));

        // 여행
        categoryRepository.saveAll(Arrays.asList(
            createCategory("국내여행", travel),
            createCategory("해외여행", travel),
            createCategory("캠핑", travel)
        ));

        // 게임
        categoryRepository.saveAll(Arrays.asList(
            createCategory("PC게임", game),
            createCategory("콘솔게임", game),
            createCategory("보드게임", game)
        ));

        // 독서
        categoryRepository.saveAll(Arrays.asList(
            createCategory("소설", reading),
            createCategory("자기계발", reading),
            createCategory("독서토론", reading)
        ));

        // 맛집
        categoryRepository.saveAll(Arrays.asList(
            createCategory("한식", food),
            createCategory("카페", food),
            createCategory("맛집탐방", food)
        ));

        // 영화
        categoryRepository.saveAll(Arrays.asList(
            createCategory("영화관", movie),
            createCategory("OTT", movie),
            createCategory("영화토론", movie)
        ));

        // 음악
        categoryRepository.saveAll(Arrays.asList(
            createCategory("악기", music),
            createCategory("노래", music),
            createCategory("공연", music)
        ));

        // 요리
        categoryRepository.saveAll(Arrays.asList(
            createCategory("한식요리", cooking),
            createCategory("베이킹", cooking),
            createCategory("홈카페", cooking)
        ));

        //log.info("🔥 [DataInit] 카테고리 초기 데이터 생성 완료");
    }
    
    private MeetupCategory createCategory(String categoryName) {

        MeetupCategory category = new MeetupCategory();
        category.setCategoryName(categoryName);
        category.setParent(null);

        return category;
    }

    private MeetupCategory createCategory(
            String categoryName,
            MeetupCategory parent
    ) {

        MeetupCategory category = new MeetupCategory();
        category.setCategoryName(categoryName);
        category.setParent(parent);

        return category;
    }
    
    //시도
    private void initSidos() {

        if (sidoRepository.count() > 0) {
            return;
        }

        //log.info("🔥 [DataInit] 시도 초기 데이터를 생성합니다.");

        sidoRepository.saveAll(Arrays.asList(
            createSido("서울특별시"),
            createSido("경기도"),
            createSido("인천광역시"),
            createSido("부산광역시"),
            createSido("대전광역시")
        ));

        //log.info("🔥 [DataInit] 시도 초기 데이터 생성 완료");
    }
    
    // 시군구
    private void initSigungus() {

        if (sigunguRepository.count() > 0) {
            return;
        }

        //log.info("🔥 [DataInit] 시군구 초기 데이터를 생성합니다.");

        Sido seoul = sidoRepository.findByName("서울특별시")
                .orElseThrow();

        Sido gyeonggi = sidoRepository.findByName("경기도")
                .orElseThrow();

        Sido incheon = sidoRepository.findByName("인천광역시")
                .orElseThrow();

        Sido busan = sidoRepository.findByName("부산광역시")
                .orElseThrow();

        Sido daejeon = sidoRepository.findByName("대전광역시")
                .orElseThrow();

        sigunguRepository.saveAll(Arrays.asList(

            // 서울
            createSigungu("강남구", seoul),
            createSigungu("마포구", seoul),
            createSigungu("송파구", seoul),

            // 경기도
            createSigungu("부천시", gyeonggi),
            createSigungu("수원시", gyeonggi),
            createSigungu("성남시", gyeonggi),

            // 인천
            createSigungu("남동구", incheon),
            createSigungu("부평구", incheon),

            // 부산
            createSigungu("해운대구", busan),
            createSigungu("수영구", busan),

            // 대전
            createSigungu("유성구", daejeon),
            createSigungu("서구", daejeon)
        ));

        //log.info("🔥 [DataInit] 시군구 초기 데이터 생성 완료");
    }   
    
    
    private Sido createSido(String name) {

        Sido sido = new Sido();
        sido.setName(name);

        return sido;
    }

    private Sigungu createSigungu(String name, Sido sido) {

        Sigungu sigungu = new Sigungu();
        sigungu.setName(name);
        sigungu.setSido(sido);

        return sigungu;
    }
    
    private void initMemberReportStatuses() {

        if (memberReportStatusRepository.count() > 0) {
            //log.info("🔥 [DataInit] 회원 신고 상태 데이터가 이미 존재합니다.");
            return;
        }

        //log.info("🔥 [DataInit] 회원 신고 상태 초기 데이터를 생성합니다.");

        memberReportStatusRepository.saveAll(Arrays.asList(
            new MemberReportStatus("ACTIVE", "정상"),
            new MemberReportStatus("WARNING", "주의"),
            new MemberReportStatus("DANGER", "위험")
        ));

        //log.info("🔥 [DataInit] 회원 신고 상태 초기 데이터 생성 완료");
    }
    
}