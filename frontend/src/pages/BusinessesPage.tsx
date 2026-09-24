import React, { useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Card,
  Alert,
} from "antd";
import type { TableProps } from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getBusinesses } from "../api/admin";
import { StatusTag } from "../components/StatusTag";
import type { BusinessRead, BusinessStatus } from "../types/api";

const { Title, Text } = Typography;

export const BusinessesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const statusParam = searchParams.get("status") as BusinessStatus | null;
  const [statusFilter, setStatusFilter] = useState<BusinessStatus | undefined>(
    statusParam || undefined
  );
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>("");

  const {
    data: businesses = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["businesses", statusFilter],
    queryFn: () => getBusinesses({ status: statusFilter, limit: 100 }),
  });

  // Client-side filtering for search text and type filter
  const filteredData = businesses.filter((b) => {
    const matchesSearch =
      searchText.trim() === "" ||
      b.name.toLowerCase().includes(searchText.toLowerCase()) ||
      b.gst_no.toLowerCase().includes(searchText.toLowerCase());

    const matchesType = !typeFilter || b.business_type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Unique business types for filter dropdown
  const businessTypes = Array.from(
    new Set(businesses.map((b) => b.business_type))
  );

  const handleStatusChange = (val: BusinessStatus | undefined) => {
    setStatusFilter(val);
    if (val) {
      setSearchParams({ status: val });
    } else {
      setSearchParams({});
    }
  };

  const columns: TableProps<BusinessRead>["columns"] = [
    {
      title: "Business Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            ID: {record.id.substring(0, 8)}...
          </Text>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "business_type",
      key: "business_type",
    },
    {
      title: "GST Number",
      dataIndex: "gst_no",
      key: "gst_no",
      render: (gst: string) => <code>{gst}</code>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: BusinessStatus) => <StatusTag status={status} />,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) =>
        new Date(date).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          size="small"
          onClick={() => navigate(`/businesses/${record.id}`)}
        >
          View & Verify
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Registered Businesses
          </Title>
          <Text type="secondary">
            Verify, approve, or reject vendor and buyer GST onboarding profiles
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isLoading}
        >
          Refresh List
        </Button>
      </div>

      {isError && (
        <Alert
          type="error"
          message="Could not load businesses"
          description={error instanceof Error ? error.message : "Error"}
          showIcon
        />
      )}

      {/* Filter Toolbar */}
      <Card size="small">
        <Space wrap size="middle">
          <Input
            placeholder="Search by business name or GST..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />

          <Select
            placeholder="Filter by Status"
            value={statusFilter}
            onChange={handleStatusChange}
            allowClear
            style={{ width: 180 }}
            options={[
              { label: "All Statuses", value: undefined },
              { label: "Pending Verification", value: "pending" },
              { label: "Verified Suppliers", value: "verified" },
              { label: "Rejected Profiles", value: "rejected" },
            ]}
          />

          <Select
            placeholder="Filter by Business Type"
            value={typeFilter}
            onChange={(val) => setTypeFilter(val)}
            allowClear
            style={{ width: 200 }}
            options={[
              { label: "All Types", value: undefined },
              ...businessTypes.map((t) => ({ label: t, value: t })),
            ]}
          />

          {(searchText || statusFilter || typeFilter) && (
            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                setSearchText("");
                handleStatusChange(undefined);
                setTypeFilter(undefined);
              }}
            >
              Reset Filters
            </Button>
          )}
        </Space>
      </Card>

      {/* Ant Design Table with Pagination */}
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} businesses`,
        }}
      />
    </Space>
  );
};
