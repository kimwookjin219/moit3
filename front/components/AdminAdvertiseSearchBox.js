import React from 'react';
import { Input, Select, Button, Space } from 'antd';

function AdminAdvertiseSearchBox({
  searchText,
  setSearchText,
  status,
  setStatus,
  sort,
  setSort,
  statusOptions,
  sortOptions,
  onSearch,
}) {

  return (
    <div
      style={{
        marginBottom: 20,
        background: '#fff',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <Space wrap>

        {/* 검색어 */}
        <Input
          placeholder="검색어를 입력하세요."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={onSearch}
          style={{ width: 250 }}
          allowClear
        />

        {/* 상태 / 유형 */}
        <Select
          value={status}
          onChange={(value) => setStatus(value)}
          style={{ width: 150 }}
          options={statusOptions}
        />

        {/* 정렬 */}
        <Select
          value={sort}
          onChange={(value) => setSort(value)}
          style={{ width: 160 }}
          options={sortOptions}
        />

        {/* 검색 */}
        <Button type="primary" onClick={onSearch}>
          검색
        </Button>

      </Space>
    </div>
  );
}

export default AdminAdvertiseSearchBox;