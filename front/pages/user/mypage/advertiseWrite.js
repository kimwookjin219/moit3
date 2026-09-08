import axios from '../../../api/axios';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Form,  Input,  Select,  DatePicker,
  Button,  Card,  Upload,  Space,  Tag,
  Divider,  message,
} from 'antd';
import { UploadOutlined, RobotOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';  
import localeData from 'dayjs/plugin/localeData';

dayjs.extend(weekday);
dayjs.extend(localeData);

import {
  createAdvertise,
  updateAdvertise,
  getAdvertiseDetail,
} from '../../../api/advertiseApi';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

function AdvertiseWritePage() {
  const router = useRouter();
  const { adId } = router.query;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 메인기본선택용
  const [adPrices, setAdPrices] = useState([]);
  const [positionPrices, setPositionPrices] = useState([]);

  // ==========================================
  // 🤖 AI 도우미
  // ==========================================
  const [showAiHelper, setShowAiHelper] = useState(false); // 5초 동안 입력 없을 때 토글
  const [aiKeyword, setAiKeyword] = useState('');           // AI 키워드 입력값
  const [aiLoading, setAiLoading] = useState(false);        // AI 요청 중 로딩
  const typingTimerRef = useRef(null);                      // 5초 타이머 Ref

  // 5초 동안 제목(#title)이나 내용(#content) 입력이 없을 때 AI 도우미 노출
  const resetAiTimer = () => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    // 이미 AI 도우미가 열려있지 않을 때만 타이머 작동
    typingTimerRef.current = setTimeout(() => {
      setShowAiHelper(true);
    }, 5000);
  };

  // 컴포넌트 마운트 시 DB에서 가격 정보 불러오기 
  useEffect(() => {
    resetAiTimer(); // 최초 진입 시 5초 타이머 시작

    const fetchPrices = async () => {
      try {
        // 일반/프리미엄 기본 가격 목록 가져오기 
        const priceRes = await axios.get('/api/advertisement/prices');
        // 위치별 추가금 가져오기
        const positionRes = await axios.get('/api/advertisement/prices/position');

        // ==========================================
        // 🛠️ 기본 가격 (기간별로 일반/프리미엄 묶기)
        // ==========================================
        const priceMap = {};
        
        priceRes.data.forEach((item) => {
          // 신규 등록 가격만 필터링 (연장 EXTENSION 제외)
          if (item.paymentType !== 'INITIAL') return; 

          const days = item.periodDays;
          if (!priceMap[days]) {
            priceMap[days] = { days: days, generalPrice: 0, premiumPrice: 0 };
          }
          
          if (item.adGrade === 'GENERAL') {
            priceMap[days].generalPrice = item.basePrice;
          } else if (item.adGrade === 'PREMIUM') {
            priceMap[days].premiumPrice = item.basePrice;
          }
        });

        // 객체를 배열로 변환해서 State에 저장
        const formattedAdPrices = Object.values(priceMap);
        setAdPrices(formattedAdPrices);

        // ==========================================
        // 🛠️ 위치별 추가금 가공하기
        // ==========================================
        const positionLabels = {
          'MEETUP_LIST_BANNER': '모임 목록 배너',
          'MEETUP_LIST_SIDEBAR': '모임 목록 사이드',
          'MEETUP_DETAIL_SIDEBAR': '모임 상세 사이드',
        };

        const formattedPositionPrices = positionRes.data.map((item) => ({
          key: item.position,
          label: positionLabels[item.position] || item.position,
          price: item.additionalPrice,
        }));
        
        setPositionPrices(formattedPositionPrices);

        // ==========================================
        // 수정인 경우 기존 광고 데이터 Form에 채우기
        // ==========================================
        if (isEdit && adId) {
          const detailRes = await getAdvertiseDetail(adId);
          const data = detailRes.data;

          form.setFieldsValue({
            title: data.title,
            content: data.content,
            landingUrl: data.landingUrl,
            targetAgeMin: data.targetAgeMin,
            targetAgeMax: data.targetAgeMax,
            targetGender: data.targetGender,
            adGrade: data.adGrade,
            period: [
              data.startDatetime ? dayjs(data.startDatetime) : null,
              data.endDatetime ? dayjs(data.endDatetime) : null,
            ],
          });

          // 기존 이미지 미리보기 세팅
          if (data.imageList && data.imageList.length > 0) {
            const newImages = {
              MAIN: [],
              MEETUP_LIST_BANNER: [],
              MEETUP_LIST_SIDEBAR: [],
              MEETUP_DETAIL_SIDEBAR: []
            };

            const existingTypes = [];

            data.imageList.forEach((img) => {
              if (newImages[img.imageType]) {
                newImages[img.imageType] = [{
                  uid: img.imageId || -1,
                  name: img.imageUrl.split('/').pop(),
                  status: 'done',
                  url: `${process.env.NEXT_PUBLIC_API_BASE_URL}${img.imageUrl}`,
                }];
                existingTypes.push(img.imageType);
              }
            });
            setImageFiles(newImages);
            setExistingImageTypes(existingTypes);
          }
        }

      } catch (error) {
        console.error('광고 가격표 조회 실패');
        message.error('가격 정보를 불러오지 못했습니다.'); 
      }
    };
    fetchPrices();

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []); 

  const [imageFiles, setImageFiles] = useState({
    MAIN: [],
    MEETUP_LIST_BANNER: [],
    MEETUP_LIST_SIDEBAR: [],
    MEETUP_DETAIL_SIDEBAR: [],
  });

  const [existingImageTypes, setExistingImageTypes] = useState([]);
  const [deletedImageTypes, setDeletedImageTypes] = useState([]);

  // ==========================================
  // 🤖 AI 작성 버튼 클릭 이벤트 핸들러
  // ==========================================
  const handleAiGenerate = async () => {
    if (!aiKeyword.trim()) {
      message.warning('키워드를 입력해주세요.');
      return;
    }

    try {
      setAiLoading(true);
      message.loading({ content: '🤖 AI가 광고 내용을 작성 중입니다...', key: 'aiLoad', duration: 0 });

      // 2차 소스에서 쓰던 백엔드 API 엔드포인트 연동
      const response = await axios.post('/user/advertisement/aiAdvertise', {
        keyword: aiKeyword,
      });
      const data = response.data;

      if (!data) {
        message.error({ content: 'AI 생성 결과가 없습니다.', key: 'aiLoad', duration: 3 });
        return;
      }

      // Form 필드에 AI 추천 결과 세팅
      form.setFieldsValue({
        title: data.title || '',
        content: data.content || '',
        targetAgeMin: data.targetAgeMin ?? '',
        targetAgeMax: data.targetAgeMax ?? '',
        targetGender: ['ALL', 'MALE', 'FEMALE'].includes(data.targetGender) ? data.targetGender : 'ALL',
      });

      message.success({ content: '✨ AI 광고 작성이 완료되었습니다!', key: 'aiLoad', duration: 3 });
    } catch (error) {
      console.error('AI 광고 작성 실패');
      message.error({ content: 'AI 작성에 실패했습니다.', key: 'aiLoad', duration: 3 });
    } finally {
      setAiLoading(false);
    }
  };

  // ==========================================
  // 광고 기간 계산
  // 백엔드 AdvertisementCalculationServiceImpl과 동일
  // 시작일 / 종료일 모두 포함
  // ==========================================
  const calculateDays = (period) => {

    if (!period || period.length !== 2) {
      return 0;
    }

    const start = period[0];
    const end = period[1];

    if (!start || !end) {
      return 0;
    }

    const startDate = start.startOf('day');
    const endDate = end.startOf('day');

    if (endDate.isBefore(startDate)) {
      return 0;
    }

    return endDate.diff(startDate, 'day') + 1;
  };

  // ==========================================
  // 광고 기본 가격 계산
  // 백엔드 AdvertisementCalculationServiceImpl과 동일
  // ==========================================
  const calculateAdPrice = (days, grade) => {

    if (!days || days <= 0) {
      return {
        total: 0,
        details: [],
      };
    }

    let remainingDays = days;
    let total = 0;
    const details = [];

    // 기간이 큰 순서
    const prices = [...adPrices]
      .sort((a, b) => b.days - a.days);

    // ==========================================
    // 기간이 큰 상품부터 적용
    // ==========================================
    for (const price of prices) {

      if (!price.days || price.days <= 0) {
        continue;
      }

      const count =
        Math.floor(
          remainingDays / price.days
        );

      if (count <= 0) {
        continue;
      }

      const unitPrice =
        grade === 'PREMIUM'
          ? Number(price.premiumPrice || 0)
          : Number(price.generalPrice || 0);

      const amount =
        unitPrice * count;

      total += amount;

      remainingDays -=
        price.days * count;

      details.push({
        days: price.days,
        count,
        unitPrice,
        amount,
      });
    }

    // ==========================================
    // 남은 기간이 있으면
    // 가장 작은 기간 상품으로 올림 처리
    // 백엔드와 동일
    // ==========================================
    if (
      remainingDays > 0
      && prices.length > 0
    ) {

      const smallestPrice =
        prices[prices.length - 1];

      const smallestPeriod =
        smallestPrice.days;

      if (smallestPeriod > 0) {

        const count =
          Math.ceil(
            remainingDays / smallestPeriod
          );

        const unitPrice =
          grade === 'PREMIUM'
            ? Number(smallestPrice.premiumPrice || 0)
            : Number(smallestPrice.generalPrice || 0);

        const amount =
          unitPrice * count;

        total += amount;

        details.push({
          days: smallestPeriod,
          count,
          unitPrice,
          amount,
          remainingDays,
        });
      }
    }

    return {
      total, details,
    };
  };

  const isEdit = !!adId;

  const imageConfigs = [
    { type: 'MAIN', label: '메인 광고', description: '메인 화면에 노출되는 광고 이미지', required: true },
    { type: 'MEETUP_LIST_BANNER', label: '모임 목록 배너', description: '모임 목록 상단 배너 영역에 노출', required: false },
    { type: 'MEETUP_LIST_SIDEBAR', label: '모임 목록 사이드', description: '모임 목록 사이드 영역에 노출', required: false },
    { type: 'MEETUP_DETAIL_SIDEBAR', label: '모임 상세 사이드', description: '모임 상세 사이드 영역에 노출', required: false },
  ];

  const handleImageChange = (type, { fileList }) => {
    const newFileList = fileList.slice(-1);

    setImageFiles((prev) => ({
      ...prev,
      [type]: newFileList,
    }));

    // 기존 이미지가 있었는데 사용자가 삭제한 경우
    if (
      existingImageTypes.includes(type)
      && newFileList.length === 0
    ) {
      setDeletedImageTypes((prev) => {
        if (prev.includes(type)) {
          return prev;
        }
        return [...prev, type];
      });
      return
    }  
    // 새 이미지를 선택했다면 삭제 대상에서 제거
    if (newFileList.length > 0) {
      setDeletedImageTypes((prev) =>
        prev.filter((item) => item !== type)
      );
    }
  };

  // 등록 / 수정 서브밋
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // 메인 이미지 필수 검증 
      const mainFiles = imageFiles['MAIN'];
      const hasMainImage = mainFiles && mainFiles.length > 0 && (mainFiles[0].originFileObj || mainFiles[0].url);
      
      if (!hasMainImage) {
        message.error('메인 이미지는 필수입니다. 이미지를 등록해주세요.');
        setLoading(false);
        return;
      }

      const formData = new FormData();

      formData.append('title', values.title);
      formData.append('content', values.content);
      formData.append('landingUrl', values.landingUrl);
      formData.append('targetAgeMin', values.targetAgeMin);
      formData.append('targetAgeMax', values.targetAgeMax);
      formData.append('targetGender', values.targetGender);
      formData.append('adGrade', values.adGrade);
      formData.append('startDatetime', values.period[0].format('YYYY-MM-DD HH:mm:ss'));
      formData.append('endDatetime', values.period[1].format('YYYY-MM-DD HH:mm:ss'));

      Object.entries(imageFiles).forEach(([imageType, files]) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        
        // originFileObj -> 사용자가 새로 업로드한 파일
        if (file.originFileObj) {
          formData.append('imageFiles', file.originFileObj);
          formData.append('imageTypes', imageType);
        }
        // originFileObj가 없고 url만 -> 기존에 있던 이미지이므로 새로 폼데이터에 추가하지 않고 유지
      });

      // 삭제할 기존 이미지 위치 전달
      deletedImageTypes.forEach((type) => {
        formData.append(
          'deletedImageTypes',
          type
        );
      });

      if (isEdit) {
        await updateAdvertise(adId, formData);
        message.success('광고가 수정되었습니다.');
      } else {
        await createAdvertise(formData);
        message.success('광고가 등록되었습니다.');
      }
      router.push('/user/mypage/advertiseList');
    } catch (error) {
      console.error( isEdit ? '광고 수정 실패' : '광고 등록 실패' );
      message.error(error.response?.data?.message || `광고 ${isEdit ? '수정' : '등록'}에 실패했습니다.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>{isEdit ? '광고 수정' : '광고 등록'}</h2>
        <Button onClick={() => router.push('/user/mypage/advertiseList')}>목록</Button>
      </div>

      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ targetGender: 'ALL', adGrade: 'GENERAL' }}>

          {/* 기본 정보 */}
          <h3>기본 정보</h3>
          <Form.Item label="광고명" name="title" rules={[{ required: true, message: '광고명을 입력해주세요.' }]}>
            <Input placeholder="광고명을 입력해주세요." maxLength={100} onChange={resetAiTimer} />
          </Form.Item>
          <Form.Item label="광고 내용" name="content" rules={[{ required: true, message: '광고 내용을 입력해주세요.' }]}>
            <TextArea rows={6} placeholder="광고 내용을 입력해주세요." maxLength={1000} showCount onChange={resetAiTimer} />
          </Form.Item>

          {/* 🤖 AI 광고 도우미 */}
          {showAiHelper && !isEdit && (
            <Card size="small" style={{ marginBottom: 20, background: '#e1effd', borderColor: '#338cff' }}>
              <div style={{ marginBottom: 8, color: '#427dfd', fontWeight: 600 }}>
                <RobotOutlined /> 🤖 AI 광고 작성 도우미
              </div>
              <div style={{ marginBottom: 12, color: '#666', fontSize: 13 }}>
                💡 키워드만 입력해주시면 제목과 내용을 작성해드릴게요!
              </div>
              <Space.Compact style={{ width: '100%' }}>
                <Input 
                  placeholder="예) 대학생 카페 할인 이벤트" 
                  value={aiKeyword}
                  onChange={(e) => setAiKeyword(e.target.value)}
                  disabled={aiLoading}
                  allowClear
                />
                <Button 
                  type="primary" 
                  style={{ background: '#338cff', borderColor: '#427dfd' }}
                  onClick={handleAiGenerate}
                  loading={aiLoading}
                >
                  AI 작성하기
                </Button>
              </Space.Compact>
            </Card>
          )}

          <Form.Item label="랜딩 URL" name="landingUrl" rules={[{ required: true, message: '랜딩 URL을 입력해주세요.' }, { type: 'url', message: '올바른 URL을 입력해주세요.' }]}>
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Divider />
          <h3>타겟 설정</h3>
          <Space style={{ display: 'flex', width: '100%' }} align="start">
            <Form.Item label="최소 연령" name="targetAgeMin" rules={[{ required: true, message: '최소 연령을 입력해주세요.' }]}>
              <Input type="number" min={1} max={100} addonAfter="세" />
            </Form.Item>
            <Form.Item label="최대 연령" name="targetAgeMax" rules={[{ required: true, message: '최대 연령을 입력해주세요.' }]}>
              <Input type="number" min={1} max={100} addonAfter="세" />
            </Form.Item>
          </Space>
          <Form.Item label="타겟 성별" name="targetGender" rules={[{ required: true, message: '타겟 성별을 선택해주세요.' }]}>
            <Select options={[{ value: 'ALL', label: '전체' }, { value: 'MALE', label: '남성' }, { value: 'FEMALE', label: '여성' }]} />
          </Form.Item>

          <Divider />
          <h3>광고 가격표</h3>
          <Card size="small" style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 12, color: '#666', fontSize: 13 }}>광고 기간과 등급에 따라 기본 광고비가 결정됩니다.</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
              <thead>
                <tr>
                  <th style={{ padding: 10, borderBottom: '1px solid #ddd' }}>기간</th>
                  <th style={{ padding: 10, borderBottom: '1px solid #ddd' }}>일반 광고</th>
                  <th style={{ padding: 10, borderBottom: '1px solid #ddd' }}>프리미엄 광고</th>
                </tr>
              </thead>
              <tbody>
                {adPrices.map((price) => (
                  <tr key={price.days}>
                    <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>{price.days}일</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>{price.generalPrice.toLocaleString()}원</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>{price.premiumPrice.toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Divider />
            <div style={{ fontWeight: 600, marginBottom: 10 }}>광고 위치 추가금</div>
            {positionPrices.map((position) => (
              <div key={position.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span>{position.label}</span>
                <span>+{position.price.toLocaleString()}원</span>
              </div>
            ))}
          </Card>

          <Divider />
          <h3>광고 상품</h3>
          <Form.Item label="광고 등급" name="adGrade" rules={[{ required: true, message: '광고 등급을 선택해주세요.' }]}>
            <Select options={[{ value: 'GENERAL', label: '일반 광고' }, { value: 'PREMIUM', label: '프리미엄 광고' }]} />
          </Form.Item>

          <Divider />
          <h3>광고 기간</h3>
          <Form.Item label="광고 기간" name="period" rules={[{ required: true, message: '광고 기간을 선택해주세요.' }]}>
            <RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} disabledDate={(current) => current && current < dayjs().startOf('day')} />
          </Form.Item>

          <Divider />
          <h3>광고 이미지</h3>
          <p style={{ color: '#888', marginBottom: 20 }}>광고가 노출될 위치별 이미지를 등록할 수 있습니다.</p>
          {imageConfigs.map((config) => (
            <Card key={config.type} size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <strong>{config.label}</strong>
                  {config.required ? <Tag color="red" style={{ marginLeft: 8 }}>필수</Tag> : <Tag style={{ marginLeft: 8 }}>선택</Tag>}
                </div>
                <span style={{ color: '#888', fontSize: 13 }}>{config.type}</span>
              </div>
              <Upload listType="picture" fileList={imageFiles[config.type]} beforeUpload={() => false} onChange={(info) => handleImageChange(config.type, info)} maxCount={1} accept="image/*">
                {imageFiles[config.type].length === 0 && <Button icon={<UploadOutlined />}>이미지 선택</Button>}
              </Upload>
            </Card>
          ))}

          <Form.Item shouldUpdate>
            {({ getFieldValue }) => {
              const period = getFieldValue('period');
              const adGrade = getFieldValue('adGrade');
              const days = calculateDays(period);
              const result = calculateAdPrice(days, adGrade);

              const activePositions = Object.keys(imageFiles).filter((key) => imageFiles[key] && imageFiles[key].length > 0);
              
              const positionExtra = activePositions.reduce((sum, position) => {
                const item = positionPrices.find((p) => p.key === position);
                return sum + (item?.price || 0);
              }, 0);

              const finalPrice = result.total + positionExtra;

              return (
                <Card style={{ marginTop: 20, background: '#fafafa' }}>
                  <h3>예상 광고 금액</h3>
                  <div style={{ marginBottom: 6, fontWeight: 500, color: '#1890ff' }}>
                    광고 기간: <span>{days > 0 ? `${days}일` : '기간 미설정'}</span>
                  </div>
                  <div>기본 광고비: <span>{result.total.toLocaleString()}원</span></div>
                  <div>위치 추가금: <span>+{positionExtra.toLocaleString()}원</span></div>
                  <Divider />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700 }}>
                    <span>예상 광고비</span>
                    <span>{finalPrice.toLocaleString()}원</span>
                  </div>
                </Card>
              );
            }}
          </Form.Item>

          <Divider />
          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button onClick={() => router.push('/user/mypage/advertiseList')}>취소</Button>
              <Button type="primary" htmlType="submit" loading={loading}>{isEdit ? '수정하기' : '등록하기'}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default AdvertiseWritePage;