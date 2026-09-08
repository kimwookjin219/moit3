import { useEffect, useState } from 'react';
import {
  Modal,
  Table,
  InputNumber,
  message,
  Spin,
} from 'antd';
import axios from '../api/axios'; 

function AdvertisePriceModal({ open, onClose }) {
  const [newPrices, setNewPrices] = useState([]);
  const [extensionPrices, setExtensionPrices] = useState([]);
  const [positionPrices, setPositionPrices] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // 위치명 한글 변환 헬퍼
  const getPositionLabel = (key) => {
    if (key === 'MAIN') return '메인 홈 배너';
    if (key === 'MEETUP_LIST_BANNER') return '모집목록 배너';
    if (key === 'MEETUP_LIST_SIDEBAR') return '모집목록 사이드';
    if (key === 'MEETUP_DETAIL_SIDEBAR') return '모임 상세 사이드';
    return key;
  };

  useEffect(() => {
    if (open) {
      fetchPrices();
    }
  }, [open]);

  // DB에서 기간별 기본 가격 + 위치 추가금을 모두 불러옵니다.
  const fetchPrices = async () => {
    setLoading(true);
    try {
      // 1. 기간별 기본 가격 호출
      const periodRes = await axios.get(`${BASE_URL}/api/admin/advertisement/price`, { withCredentials: true });
      const newMap = {};
      const extMap = {};

      periodRes.data.forEach((item) => {
        const isInitial = item.paymentType === 'INITIAL';
        const targetMap = isInitial ? newMap : extMap;
        const days = item.periodDays;

        if (!targetMap[days]) {
          targetMap[days] = { key: `${isInitial ? 'new' : 'ext'}-${days}`, days };
        }
        if (item.adGrade === 'GENERAL') {
          targetMap[days].generalPrice = item.basePrice;
          targetMap[days].generalPriceId = item.priceId;
        } else {
          targetMap[days].premiumPrice = item.basePrice;
          targetMap[days].premiumPriceId = item.priceId;
        }
      });
      setNewPrices(Object.values(newMap).sort((a, b) => a.days - b.days));
      setExtensionPrices(Object.values(extMap).sort((a, b) => a.days - b.days));

      // 2. 위치별 추가금 호출
      const posRes = await axios.get(`${BASE_URL}/api/admin/advertisement/price/position`, { withCredentials: true });
      const mappedPos = posRes.data.map(item => ({
        key: item.position,
        label: getPositionLabel(item.position),
        price: item.additionalPrice,
        positionPriceId: item.positionPriceId, // 백엔드 DTO와 이름 맞춰주세요
      }));
      setPositionPrices(mappedPos);

    } catch (error) {
      console.error('로딩 실패:', error);
      message.error('가격을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // [저장] 버튼 클릭 시 모든 가격 정보를 병렬로 DB에 쏩니다!
  const handleSave = async () => {
    setLoading(true);
    try {
      const promises = [];

      // 헬퍼: 기본 가격 PUT 요청 생성기
      const pushBasePricePromises = (list, paymentType) => {
        list.forEach((item) => {
          // 일반 가격 수정
          if (item.generalPriceId) {
            promises.push(axios.put(`${BASE_URL}/api/admin/advertisement/price/${item.generalPriceId}`, {
              priceId: item.generalPriceId,       // 백엔드 DTO에 맞춰 명시적 추가
              paymentType: paymentType,
              adGrade: 'GENERAL',
              periodDays: item.days,
              basePrice: Number(item.generalPrice) // 무조건 숫자형으로 강제 변환!
            }, { withCredentials: true }));
          }
          // 프리미엄 가격 수정
          if (item.premiumPriceId) {
            promises.push(axios.put(`${BASE_URL}/api/admin/advertisement/price/${item.premiumPriceId}`, {
              priceId: item.premiumPriceId,       // 백엔드 DTO에 맞춰 명시적 추가
              paymentType: paymentType,
              adGrade: 'PREMIUM',
              periodDays: item.days,
              basePrice: Number(item.premiumPrice) // 무조건 숫자형으로 강제 변환!
            }, { withCredentials: true }));
          }
        });
      };

      // 1. 신규/연장 광고 업데이트 예약
      pushBasePricePromises(newPrices, 'INITIAL');
      pushBasePricePromises(extensionPrices, 'EXTENSION');

      // 2. 위치 추가금 업데이트 예약
      positionPrices.forEach((item) => {
        if (item.positionPriceId) {
          promises.push(axios.put(`${BASE_URL}/api/admin/advertisement/price/position/${item.positionPriceId}`, {
            positionPriceId: item.positionPriceId, // 백엔드 DTO에 맞춰 명시적 추가
            position: item.key,                    // Enum 이름 명시적 추가 (MAIN 등)
            additionalPrice: Number(item.price)    // 무조건 숫자형으로 강제 변환!
          }, { withCredentials: true }));
        }
      });

      // 3. 만들어진 요청들을 한방에(병렬로) 쏴버리기!
      await Promise.all(promises);
      
      message.success('가격표가 성공적으로 업데이트되었습니다!');
      onClose();
    } catch (error) {
      console.error('저장 실패:', error);
      message.error('가격표 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const updatePrice = (setter, key, field, value) => {
    setter(prev => prev.map(item => item.key === key ? { ...item, [field]: value || 0 } : item));
  };

  const priceInput = (value, record, field, setter) => (
    <InputNumber
      value={value} min={0} step={1000} style={{ width: '100%' }}
      formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      parser={val => val.replace(/,/g, '')}
      onChange={nextVal => updatePrice(setter, record.key, field, nextVal)}
    />
  );

  const priceCols = (setter) => [
    { title: '기간', dataIndex: 'days', key: 'days', width: 100, render: days => `${days}일` },
    { title: '일반', dataIndex: 'generalPrice', render: (val, rec) => priceInput(val, rec, 'generalPrice', setter) },
    { title: '프리미엄', dataIndex: 'premiumPrice', render: (val, rec) => priceInput(val, rec, 'premiumPrice', setter) },
  ];

  return (
    <Modal title="광고 가격표 설정" open={open} onCancel={onClose} onOk={handleSave} okText="저장" cancelText="취소" width={750}>
      <Spin spinning={loading} tip="데이터 처리 중...">
        <h3>신규 광고</h3>
        <Table dataSource={newPrices} columns={priceCols(setNewPrices)} pagination={false} rowKey="key" size="small" />
        <h3 style={{ marginTop: 24 }}>연장 광고</h3>
        <Table dataSource={extensionPrices} columns={priceCols(setExtensionPrices)} pagination={false} rowKey="key" size="small" />
        <h3 style={{ marginTop: 24 }}>위치별 추가금</h3>
        <Table dataSource={positionPrices} columns={[
          { title: '광고 위치', dataIndex: 'label', key: 'label' },
          { title: '추가금', dataIndex: 'price', render: (val, rec) => priceInput(val, rec, 'price', setPositionPrices) },
        ]} pagination={false} rowKey="key" size="small" />
      </Spin>
    </Modal>
  );
}

export default AdvertisePriceModal;