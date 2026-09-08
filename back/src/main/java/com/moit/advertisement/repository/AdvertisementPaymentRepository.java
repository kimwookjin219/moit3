package com.moit.advertisement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.moit.advertisement.entity.AdvertisementPayment;
import com.moit.advertisement.enums.PaymentHistoryStatus;
import com.moit.advertisement.enums.PaymentType;

public interface AdvertisementPaymentRepository
        extends JpaRepository<AdvertisementPayment, Long> {
	
	List<AdvertisementPayment> findByAdvertisement_AdId(Long adId);
    List<AdvertisementPayment> findByPaymentStatus(PaymentHistoryStatus paymentStatus);
    Optional<AdvertisementPayment> findByOrderId(String orderId);

    // 광고 ID와 결제 상태(REQUESTED 등)로 orderId 가져오기
    Optional<AdvertisementPayment> findByAdvertisement_AdIdAndPaymentStatus(
    		Long adId, PaymentHistoryStatus paymentStatus);
    
    List<AdvertisementPayment> findAllByAdvertisement_AdIdAndPaymentStatus(
            Long adId,
            PaymentHistoryStatus paymentStatus
    );
    
    // 관리자 결제 내역
    Page<AdvertisementPayment> findAllByOrderByCreatedAtDesc( Pageable pageable );
    
    @Query("""
        select p from AdvertisementPayment p 
        join p.advertisement a 
        join p.advertiser m 
        where a.deleteYn = :deleteYn 
          and (:searchText is null or :searchText = '' or a.title like %:searchText% or m.nickname like %:searchText%)
          and (:status is null or :status = '' or 
               (:status = 'NEW' and p.paymentType = com.moit.advertisement.enums.PaymentType.INITIAL
               and p.paymentStatus = com.moit.advertisement.enums.PaymentHistoryStatus.PAID) or
               (:status = 'EXTENSION' and p.paymentType = com.moit.advertisement.enums.PaymentType.EXTENSION
               and p.paymentStatus = com.moit.advertisement.enums.PaymentHistoryStatus.PAID) or
               (:status = 'WAITING' and p.paymentStatus = com.moit.advertisement.enums.PaymentHistoryStatus.REQUESTED))
    """)
    Page<AdvertisementPayment> findByAdvertisement_DeleteYn(
        @Param("deleteYn") Character deleteYn,
        @Param("searchText") String searchText,
        @Param("status") String status,
        Pageable pageable
    );

    @Query("""
        select count(p) from AdvertisementPayment p 
        join p.advertisement a 
        join p.advertiser m 
        where a.deleteYn = :deleteYn 
          and (:searchText is null or :searchText = '' or a.title like %:searchText% or m.nickname like %:searchText%)
          and (:status is null or :status = '' or 
               (:status = 'NEW' and p.paymentType = com.moit.advertisement.enums.PaymentType.INITIAL
	           and p.paymentStatus = com.moit.advertisement.enums.PaymentHistoryStatus.PAID) or
               (:status = 'EXTENSION' and p.paymentType = com.moit.advertisement.enums.PaymentType.EXTENSION
               and p.paymentStatus = com.moit.advertisement.enums.PaymentHistoryStatus.PAID) or
               (:status = 'WAITING' and p.paymentStatus = com.moit.advertisement.enums.PaymentHistoryStatus.REQUESTED))
    """)
    long countByAdvertisement_DeleteYnAndSearchTextAndStatus(
        @Param("deleteYn") Character deleteYn,
        @Param("searchText") String searchText,
        @Param("status") String status
    );
        
    Optional<AdvertisementPayment> findTopByAdvertisement_AdIdOrderByCreatedAtDesc(Long adId);
    
    long countByAdvertisement_DeleteYn(Character deleteYn);
    long countByAdvertisement_DeleteYnAndPaymentStatus(Character deleteYn, PaymentHistoryStatus paymentStatus);
    long countByAdvertisement_DeleteYnAndPaymentTypeAndPaymentStatus(Character deleteYn, PaymentType paymentType, PaymentHistoryStatus paymentStatus);
}