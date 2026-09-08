import { Card, Statistic } from "antd";

const AdminStatCard = ({ title, value, prefix, suffix }) => {
  return (
    <Card className="admin-stat-card">
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
      />
    </Card>
  );
};

export default AdminStatCard;