import React from 'react';
import { Row, Col, Input, Select, Button } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';

function MeetupSearchFilter({
  searchText,
  setSearchText,
  sidoId,
  setSidoId,
  orderType,
  setOrderType,
  sidoList = [],
  onSearch,
  onCreate,
}) {
  return (

<Row gutter={[12, 12]} className="meetup-search-filter">
    <Col xs={24} md={7}>
        <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="모임명 검색"
            prefix={<SearchOutlined />}
            allowClear
        />
    </Col>

    <Col xs={12} md={4}>
        <Select
            value={sidoId}
            onChange={setSidoId}
            style={{ width: '100%' }}
            options={[
                {
                    value: 0,
                    label: '전체 지역',
                },
                ...sidoList.map((item) => ({
                    value: item.sidoId,
                    label: item.name,
                })),
            ]}
        />
    </Col>

    <Col xs={12} md={5}>
        <Select
            value={orderType}
            onChange={setOrderType}
            style={{ width: '100%' }}
            options={[
                {
                    value: 'createAt',
                    label: '최신순',
                },
                {
                    value: 'like',
                    label: '인기순',
                },
                {
                    value: 'meetupAt',
                    label: '마감임박순',
                },
            ]}
        />
    </Col>

    <Col xs={24} md={4}>
        <Button
            type="primary"
            icon={<SearchOutlined />}
            block
            onClick={onSearch}
        >
            검색
        </Button>
    </Col>

    <Col xs={24} md={4}>
        <Button
            //icon={<PlusOutlined />}
            block
            onClick={onCreate}
        >
            모임등록
        </Button>
    </Col>
</Row>

  );
}

export default MeetupSearchFilter;
