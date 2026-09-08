import React, { useState } from 'react';
import { Row, Col, Select, Input, Button } from 'antd';

function AdminSearchBox({
  conditions = [],
  placeholder = '검색어를 입력하세요',
  onSearch,
}) {
  const [searchValues, setSearchValues] = useState(() => { const initialValues = {};
    conditions.forEach((condition) => {
      initialValues[condition.key] = condition.defaultValue;
    });
    return initialValues;
  });

  const [keyword, setKeyword] = useState('');
  const handleConditionChange = (key, value) => {setSearchValues((prev) => ({...prev,[key]: value,}));};
  const handleSearch = () => {onSearch?.({...searchValues,keyword,});};

  return (
    <div className="admin-search-box">
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
        {/* 검색 조건들 */}
        {conditions.map((condition, index) => (
          <Col flex={condition.width || '120px'} key={condition.key || index}>
            <Select
              className="admin-search-condition"
              value={searchValues[condition.key]}
              style={{ width: '100%' }}
              options={condition.options}
              onChange={(value) =>
                handleConditionChange(condition.key, value)
              }
            />
          </Col>
        ))}

        {/* 검색어 */}
        <Col flex="auto">
          <Input
            className="admin-search-input"
            placeholder={placeholder}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
          />
        </Col>

        {/* 검색 버튼 */}
        <Col>
          <Button
            className="admin-search-button"
            type="primary"
            onClick={handleSearch}
          >
            검색
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default AdminSearchBox;