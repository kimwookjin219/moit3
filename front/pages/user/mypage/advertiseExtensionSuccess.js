// pages/user/mypage/advertiseExtensionSuccess.js

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Result, Button, Spin, message } from 'antd';

import axios from '../../../api/axios';

export default function AdvertiseExtensionSuccess() {

  const router = useRouter();

  const {
    paymentKey,
    orderId,
    amount,
  } = router.query;

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Toss 성공 URL 재진입 / React effect 중복 실행 방지
  const confirmCalled = useRef(false);

  useEffect(() => {

    if (!router.isReady) {
      return;
    }

    if (!paymentKey || !orderId || !amount) {
      return;
    }

    if (confirmCalled.current) {
      return;
    }

    confirmCalled.current = true;

    const confirmPayment = async () => {

      try {
        await axios.post(
          '/api/advertisement/payment/confirm',
          {
            paymentKey,
            orderId,
            amount: Number(amount),
          }
        );

        setSuccess(true);

        message.success(
          '광고 연장 결제가 완료되었습니다.'
        );

      } catch (error) {

        console.error('연장 결제 승인 실패', error);

        const messageText =
          error.response?.data?.message ||
          error.response?.data ||
          '결제 승인에 실패했습니다.';

        setErrorMessage(messageText);

        setSuccess(false);

      } finally {

        setLoading(false);

      }
    };

    confirmPayment();

  }, [
    router.isReady,
    paymentKey,
    orderId,
    amount,
  ]);


  // 승인 처리 중
  if (loading) {

    return (
      <div
        style={{
          textAlign: 'center',
          padding: '100px 0',
        }}
      >

        <Spin size="large" />

        <h2>
          결제를 안전하게 처리하고 있습니다...
        </h2>

        <p>
          잠시만 기다려주세요.
        </p>

      </div>
    );
  }


  // 승인 실패
  if (!success) {

    return (
      <div
        style={{
          padding: '50px',
        }}
      >

        <Result
          status="error"
          title="광고 연장 결제 승인 실패"
          subTitle={errorMessage}
          extra={[
            <Button
              type="primary"
              key="list"
              onClick={() =>
                router.push(
                  '/user/mypage/advertise'
                )
              }
            >
              내 광고 목록으로
            </Button>,
          ]}
        />

      </div>
    );
  }


  // 승인 성공
  return (
    <div
      style={{
        padding: '50px',
      }}
    >

      <Result
        status="success"
        title="광고 연장 결제가 완료되었습니다!"
        subTitle={
          `주문번호: ${orderId} / 결제금액: ${Number(amount).toLocaleString()}원`
        }
        extra={[
          <Button
            type="primary"
            key="list"
            onClick={() =>
              router.push(
                '/user/mypage/advertiseList'
              )
            }
          >
            내 광고 목록으로
          </Button>,
        ]}
      />

    </div>
  );
}