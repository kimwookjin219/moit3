import {
  Modal,
  Radio,
  Space,
  Typography,
  Divider,
  Button,
  Spin,
  message,
} from 'antd';

import { useEffect, useState } from 'react';

import { getExtensionPrices } from '../api/advertiseApi';

const { Text, Title } = Typography;

function AdvertiseExtensionModal({
  open,
  onCancel,
  advertisement,
  onPayment,
}) {

  const [priceList, setPriceList] = useState([]);
  const [selectedDays, setSelectedDays] = useState(7);

  const [loading, setLoading] = useState(false);

  /*
   * 연장 가격 조회
   */
  useEffect(() => {

    if (!open || !advertisement?.adId) {
      return;
    }

    const loadExtensionPrices = async () => {

      try {

        setLoading(true);

        const response = await getExtensionPrices(
          advertisement.adId
        );

        const prices = response.data || [];

        console.log(
          '연장 가격 조회 결과:',
          prices
        );

        setPriceList(prices);

        if (prices.length > 0) {
          setSelectedDays(prices[0].periodDays);
        }

      } catch (error) {

        console.error(
          '연장 가격 조회 실패',
          error
        );

        message.error(
          error.response?.data?.message ||
          '연장 가격을 불러오지 못했습니다.'
        );

      } finally {

        setLoading(false);

      }
    };

    loadExtensionPrices();

  }, [open, advertisement?.adId]);


  /*
   * 선택한 기간의 가격
   */
  const selectedOption = priceList.find(
    option =>
      option.periodDays === selectedDays
  );


  if (!advertisement) {
    return null;
  }


  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="광고 연장"
      footer={null}
      destroyOnClose
      width={500}
    >

      <Title level={5}>
        {advertisement.title}
      </Title>

      <Text type="secondary">
        현재 광고 기간
      </Text>

      <div style={{ marginTop: 8 }}>
        {String(advertisement.startDatetime).substring(0, 10)}
        {' ~ '}
        {String(advertisement.endDatetime).substring(0, 10)}
      </div>

      <Divider />

      <Title level={5}>
        연장 기간 선택
      </Title>


      {loading ? (

        <div
          style={{
            textAlign: 'center',
            padding: '30px 0',
          }}
        >
          <Spin />
        </div>

      ) : (

        <Radio.Group
          value={selectedDays}
          onChange={(e) =>
            setSelectedDays(e.target.value)
          }
        >

          <Space direction="vertical">

            {priceList.map(option => (

              <Radio
                key={option.periodDays}
                value={option.periodDays}
              >
                {option.periodDays}일
                {' '}
                ({Number(option.basePrice).toLocaleString()}원)
              </Radio>

            ))}

          </Space>

        </Radio.Group>

      )}


      <Divider />


      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >

        <Text strong>
          결제 금액
        </Text>

        <Text strong>
          {selectedOption
            ? Number(
                selectedOption.basePrice
              ).toLocaleString()
            : '0'
          }원
        </Text>

      </div>


      <Button
        type="primary"
        block
        disabled={
          loading ||
          !selectedOption
        }
        onClick={() => {

          onPayment({

            adId: advertisement.adId,

            days: selectedOption.periodDays,

            amount: selectedOption.basePrice,

          });

        }}
      >
        {selectedOption
          ? `${selectedOption.periodDays}일 연장 결제하기`
          : '가격을 불러오는 중입니다.'
        }
      </Button>

    </Modal>
  );
}

export default AdvertiseExtensionModal;