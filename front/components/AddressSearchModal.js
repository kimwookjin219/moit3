import React from "react";
import { Button, Input, Modal, Space, Table } from "antd";

function AddressSearchModal({
    open,
    onCancel,
    keyword,
    onKeywordChange,
    onSearch,
    addressList,
    loading = false,
    currentPage = 1,
    total = 0,
    onPageChange,
    onSelect,
}) {
    //console.log("write addressList:", addressList);
    //console.log("write addressList array?", Array.isArray(addressList));
    const addressColumns = [
        {
            title: "주소",
            dataIndex: "address",
            key: "address",
            width: "35%",
        },
        {
            title: "도로명",
            dataIndex: "road",
            key: "road",
            width: "20%",
        },
        {
            title: "지번",
            dataIndex: "jibun",
            key: "jibun",
            width: "20%",
        },
        {
            title: "우편번호",
            dataIndex: "zipNo",
            key: "zipNo",
            width: "15%",
        },
        {
            title: "선택",
            key: "action",
            width: "10%",
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => onSelect(record)}
                >
                    선택
                </Button>
            ),
        },
    ];

    return (
        <Modal
            title="주소 검색"
            open={open}
            onCancel={onCancel}
            width={1000}
            footer={null}
        >
            <Space.Compact
                style={{
                    width: "100%",
                    marginBottom: 20,
                }}
            >
                <Input
                    size="large"
                    value={keyword}
                    onChange={(e) => onKeywordChange(e.target.value)}
                    onPressEnter={onSearch}
                    placeholder="주소를 입력해주세요."
                />

                <Button type="primary" size="large" onClick={onSearch}>
                    검색
                </Button>
            </Space.Compact>
            <Table
                rowKey={(record) =>
                    `${record.address}-${record.zipNo}-${record.latitude}-${record.longitude}`
                }
                columns={addressColumns}
                dataSource={addressList}
                loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize: 10,
                    total: total,
                    showSizeChanger: false,
                    onChange: onPageChange,
                }}
                scroll={{ x: 800 }}
            />
        </Modal>
    );
}

export default AddressSearchModal;
