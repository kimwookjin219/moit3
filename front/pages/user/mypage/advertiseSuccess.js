// pages/user/mypage/advertiseSuccess.js
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Result, Button, message, Spin } from 'antd'; // message와 Spin 추가
import axios from '../../../api/axios';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { paymentKey, orderId, amount } = router.query;

  // 상태 관리: 로딩 중인지, 승인이 성공했는지
  const [isConfirming, setIsConfirming] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  // 중복 호출 방지용 Ref
  const confirmCalled = useRef(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (!paymentKey || !orderId || !amount) return;

    if (confirmCalled.current) return;
    confirmCalled.current = true;

    axios.post('/api/advertisement/payment/confirm', { 
      paymentKey, 
      orderId, 
      amount: Number(amount) 
    })
    .then((res) => {
      setIsConfirming(false);
      setIsSuccess(true);
      message.success("결제가 최종 완료되었습니다!");
    })
    .catch((err) => {
      setIsConfirming(false);
      setIsSuccess(false);
      message.error("결제 승인에 실패했습니다.");
      console.error('결제 승인 요청 실패', err);
    });
  }, [router.isReady, paymentKey, orderId, amount]);

  // 1. 백엔드 승인을 기다리는 중일 때 보여줄 화면
  if (isConfirming) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <Spin size="large" />
        <h2 style={{ marginTop: '20px' }}>결제를 안전하게 처리하고 있습니다...</h2>
        <p>잠시만 기다려주세요. 창을 닫지 마세요.</p>
      </div>
    );
  }

  // 2. 승인 실패 시 보여줄 화면 (옵션)
  if (!isSuccess) {
    return (
      <div style={{ padding: '50px' }}>
        <Result
          status="error"
          title="결제 승인에 실패했습니다."
          subTitle="문제가 지속되면 관리자에게 문의해주세요."
          extra={[
            <Button type="primary" key="list" onClick={() => router.push('/user/mypage/advertiseList')}>
              목록으로 돌아가기
            </Button>,
          ]}
        />
      </div>
    );
  }

  // 3. 승인 최종 성공 시 보여줄 화면
  return (
    <div style={{ padding: '50px' }}>
      <Result
        status="success"
        title="결제가 성공적으로 완료되었습니다!"
        subTitle={`주문번호: ${orderId} / 결제금액: ${Number(amount).toLocaleString()}원`}
        extra={[
          <Button type="primary" key="home" onClick={() => router.push('/user/mypage/advertiseList')}>
            내 광고 목록으로
          </Button>,
        ]}
      />
    </div>
  );
}