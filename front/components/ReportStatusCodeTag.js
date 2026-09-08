import { Tag } from 'antd';

// 뱃지
function ReportStatusCodeTag({ statusCode }) {
    if (statusCode === 'ACTIVE') {
        return (
            <Tag color="green">
                정상
            </Tag>
        );
    }
    if (statusCode === 'WARNING') {
        return (
            <Tag color="orange">
                주의
            </Tag>
        );
    }
    if (statusCode === 'DANGER') {
        return (
            <Tag color="red">
                위험
            </Tag>
        );
    }
    
    return null;
}

export default ReportStatusCodeTag;