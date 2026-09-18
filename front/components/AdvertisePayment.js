import { useEffect, useRef, useState } from 'react';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import { Button, message, Spin } from 'antd';
import { createInitialPayment } from '../api/advertiseApi';

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

export default function AdvertisePayment({ adId, amount, adTitle }) {
  const paymentWidgetRef = useRef(null);
  const paymentMethodsWidgetRef = useRef(null);

  const [price, setPrice] = useState(amount);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [realOrderId, setRealOrderId] = useState('');
  const [customerInfo, setCustomerInfo] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const initializePayment = async () => {
      try {
        setLoading(true);

        // 1. Toss Client Key 확인
        if (!clientKey) {
          throw new Error(
            'Toss Payments Client Key가 설정되지 않았습니다.'
          );
        }

        // 2. 백엔드 결제 정보 생성
        const paymentResponse =
          await createInitialPayment(adId);

        if (!isMounted) {
          return;
        }

        const payment = paymentResponse.data;

        // 3. 서버 결제 정보 저장
        setCustomerInfo(payment);
        setRealOrderId(payment.orderId);

        // 4. 서버 금액 사용
        const serverAmount = Number(payment.amount);

        if (!payment.orderId) {
          throw new Error(
            '주문번호가 없습니다.'
          );
        }

        if (!serverAmount || serverAmount <= 0) {
          throw new Error(
            '서버에서 올바른 결제 금액을 받지 못했습니다.'
          );
        }

        setPrice(serverAmount);

        // 5. Toss 고객 키
        const customerKey =
          `customer_${payment.advertiserId}`;

        // 6. Toss Payment Widget 생성
        const paymentWidget =
          await loadPaymentWidget(
            clientKey,
            customerKey
          );

        if (!isMounted) {
          return;
        }

        // 7. 결제수단 렌더링
        const paymentMethodsWidget =
          paymentWidget.renderPaymentMethods(
            '#payment-method',
            {
              value: serverAmount,
            },
            {
              variantKey: 'DEFAULT',
            }
          );

        // 8. 약관 렌더링
        paymentWidget.renderAgreement(
          '#agreement',
          {
            variantKey: 'AGREEMENT',
          }
        );

        // 9. Ref 저장
        paymentWidgetRef.current =
          paymentWidget;

        paymentMethodsWidgetRef.current =
          paymentMethodsWidget;

        // 10. 준비 완료
        if (isMounted) {
          setIsReady(true);
          setLoading(false);
        }

      } catch (error) {

        if (!isMounted) {
          return;
        }

        console.error(
          '광고 결제 초기화 실패'
        );

        message.error(
          error?.message ||
          '결제 정보를 생성하지 못했습니다.'
        );

        setLoading(false);
        setIsReady(false);
      }
    };

    if (adId) {
      initializePayment();
    }

    return () => {
      isMounted = false;
    };

  }, [adId]);

  useEffect(() => {
    const paymentMethodsWidget =
      paymentMethodsWidgetRef.current;

    if (!paymentMethodsWidget) {
      return;
    }

    paymentMethodsWidget.updateAmount(
      Number(price)
    );

  }, [price]);

  const handlePayment = async () => {
    const paymentWidget =
      paymentWidgetRef.current;

    if (!paymentWidget || !isReady) {
      message.warning(
        '결제창이 준비 중입니다. 잠시만 기다려주세요.'
      );
      return;
    }

    if (!realOrderId) {
      message.error(
        '주문번호를 확인할 수 없습니다.'
      );
      return;
    }

    try {
      await paymentWidget.requestPayment({
        orderId: realOrderId,
        orderName: adTitle,
        customerName:
          customerInfo?.advertiserNickname,
        customerEmail:
          customerInfo?.advertiserEmail ||
          undefined,
        successUrl:
          `${window.location.origin}/user/mypage/advertiseSuccess`,
        failUrl:
          `${window.location.origin}/user/mypage/advertiseSuccess`,
      });

    } catch (err) {

      if (err.code === 'USER_CANCEL') {
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
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        minHeight: '350px'
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          marginBottom: '20px'
        }}
      >
        광고 결제
      </h2>

      {loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '50px 0'
          }}
        >
          <Spin
            size="large"
            tip="결제창을 불러오는 중입니다..."
          />
        </div>
      )}

      <div
        id="payment-method"
        style={{
          display: loading ? 'none' : 'block'
        }}
      />

      <div
        id="agreement"
        style={{
          marginTop: '10px',
          display: loading ? 'none' : 'block'
        }}
      />

      {!loading && (
        <Button
          type="primary"
          size="large"
          block
          onClick={handlePayment}
          style={{ marginTop: '20px' }}
          disabled={!isReady}
        >
          {`${price.toLocaleString()}원 결제하기`}
        </Button>
      )}
    </div>
  );
}