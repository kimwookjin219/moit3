package com.moit.advertisement.dto;

import lombok.Builder;
import lombok.Getter;

public class AdminAdvertisementStatDto {

    @Getter
    @Builder
    public static class ApprovalStat {
        private long totalCount;
        private long waitingCount;
        private long paymentWaitingCount;
        private long rejectedCount;
    }

    @Getter
    @Builder
    public static class PaymentStat {
        private long totalCount;
        private long newPaymentCount;
        private long extensionPaymentCount;
        private long waitingCount;
    }

    @Getter
    @Builder
    public static class StatusStat {
        private long totalCount;
        private long beforeOpenCount;
        private long openCount;
        private long closedCount;
    }
}