import React from 'react';
import { Button } from 'antd';

function ListTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="admin-list-tabs">
      {tabs.map((tab) => (
        <Button
          key={tab.key}
          type="button"
          className={`admin-list-button ${
            activeTab === tab.key ? 'active' : ''
          }`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}

export default ListTabs;
