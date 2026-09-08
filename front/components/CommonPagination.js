import React from 'react';
import { Pagination } from 'antd';

function CommonPagination({ current = 1, total = 0, pageSize = 10, onChange }) {
  return (
    <div className="common-pagination">
      <Pagination
        current={current}
        total={total}
        pageSize={pageSize}
        onChange={onChange}
      />
    </div>
  );
}

export default CommonPagination;
