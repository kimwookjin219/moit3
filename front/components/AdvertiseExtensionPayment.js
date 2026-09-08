import { useEffect, useRef, useState } from 'react';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import { Button, message, Spin } from 'antd';

import {
  createExtensionPayment,
} from '../api/advertiseApi';

const clientKey =
  process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

export default function AdvertiseExtensionPayment({
  adId,
  days,
  adTitle,
  onComplete,
}) {

  const paymentWidgetRef = useRef(null);
  const paymentMethodsWidgetRef = useRef(null);

  const [amount, setAmount] = useState(0);
  const [orderId, setOrderId] = useState('');

  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const [customerInfo, setCustomerInfo] = useState(null);

  useEffect(() => {

    let isMounted = true;

    const initializePayment = async () => {

      try {

        setLoading(true);

        /*
         * 백엔드에서
         *
         * 1. 연장 가격 조회
         * 2. 결제 정보 생성
         * 3. orderId 생성
         *
         * 전부 처리
         */
        const response =
          await createExtensionPayment(
            adId,
            days
          );

        if (!isMounted) {
          return;
        }

        const payment = response.data;
        setCustomerInfo(payment);

        const serverAmount =
          Number(payment.amount);

        if (
          !serverAmount ||
          serverAmount <= 0
        ) {
          throw new Error(
            '서버에서 올바른 연장 결제 금액을 받지 못했습니다.'
          );
        }

        setAmount(serverAmount);
        setOrderId(payment.orderId);

        /*
         * Toss 고객 키
         */
        const customerKey = `customer_${payment.advertiserId}`;

        const paymentWidget =
          await loadPaymentWidget(
            clientKey,
            customerKey
          );

        if (!isMounted) {
          return;
        }

        const paymentMethodsWidget =
          paymentWidget.renderPaymentMethods(
            '#extension-payment-method',
            {
              value: serverAmount,
            },
            {
              variantKey: 'DEFAULT',
            }
          );

        paymentWidget.renderAgreement(
          '#extension-agreement',
          {
            variantKey: 'AGREEMENT',
          }
        );

        paymentMethodsWidget.on(
          'ready',
          () => {

            if (!isMounted) {
              return;
            }

            setIsReady(true);
            setLoading(false);

          }
        );

        paymentWidgetRef.current =
          paymentWidget;

        paymentMethodsWidgetRef.current =
          paymentMethodsWidget;

      } catch (error) {

        if (!isMounted) {
          return;
        }

        console.error(  '연장 결제 초기화 실패:'  );

        message.error(
          error.response?.data?.message ||
          '연장 결제를 준비하지 못했습니다.'
        );

        setLoading(false);
      }
    };

    if (adId && days) {
      initializePayment();
    }

    return () => {
      isMounted = false;
    };

  }, [adId, days]);


  const handlePayment = async () => {

    const paymentWidget =  paymentWidgetRef.current;

    if (
      !paymentWidget ||
      !isReady
    ) {

      message.warning(
        '결제창이 준비 중입니다.'
      );

      return;
    }

    if (!orderId) {

      message.error(
        '주문번호를 확인할 수 없습니다.'
      );

      return;
    }

    try {

      await paymentWidget.requestPayment({

        orderId,

        orderName:
          `${adTitle} ${days}일 연장`,

        customerName: customerInfo?.advertiserNickname,

        customerEmail: customerInfo?.advertiserEmail,

        successUrl:
          `${window.location.origin}/user/mypage/advertiseExtensionSuccess`,

        failUrl:
          `${window.location.origin}/user/mypage/advertiseExtensionSuccess`,

      });

    } catch (error) {

      if (
        error.code === 'USER_CANCEL'
      ) {

        message.warning(
          '결제가 취소되었습니다.'
        );

      } else {

        message.error(
          '결제 요청 중 오류가 발생했습니다.'
        );

      }

    }
  };


  return (
    <div
      style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: 20,
      }}
    >

      <h2
        style={{
          textAlign: 'center',
          marginBottom: 20,
        }}
      >
        광고 {days}일 연장 결제
      </h2>

      {loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '50px 0',
          }}
        >
          <Spin
            size="large"
            tip="결제창을 불러오는 중입니다..."
          />
        </div>
      )}

      <div
        id="extension-payment-method"
        style={{
          display:
            loading ? 'none' : 'block',
        }}
      />

      <div
        id="extension-agreement"
        style={{
          marginTop: 10,
          display:
            loading ? 'none' : 'block',
        }}
      />

      {!loading && (
        <Button
          type="primary"
          size="large"
          block
          onClick={handlePayment}
          disabled={!isReady}
          style={{
            marginTop: 20,
          }}
        >
          {amount.toLocaleString()}
          원 결제하기
        </Button>
      )}

    </div>
  );
}