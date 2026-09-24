import React, { useState } from "react";
import {
  Table,
  Typography,
  Space,
  Alert,
  Button,
  Tag,
  Modal,
} from "antd";
import type { TableProps } from "antd";
import { ReloadOutlined, CodeOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../api/admin";
import type { AuditLogRead } from "../types/api";

const { Title, Text } = Typography;

export const AuditLogsPage: React.FC = () => {
  const [selectedDetails, setSelectedDetails] = useState<Record<
    string,
    unknown
  > | null>(null);

  const {
    data: logs = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => getAuditLogs({ limit: 100 }),
  });

  const getActionColor = (action: string) => {
    if (action.includes("VERIFIED")) return "success";
    if (action.includes("REJECTED")) return "error";
    if (action.includes("LOGIN")) return "blue";
    if (action.includes("STATUS")) return "purple";
    return "default";
  };

  const columns: TableProps<AuditLogRead>["columns"] = [
    {
      title: "Timestamp",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) =>
        new Date(date).toLocaleString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
    },
    {
      title: "Action Performed",
      dataIndex: "action",
      key: "action",
      render: (action: string) => (
        <Tag color={getActionColor(action)}>{action}</Tag>
      ),
    },
    {
      title: "Target Entity",
      dataIndex: "target_type",
      key: "target_type",
      render: (type: string) => <Tag>{type.toUpperCase()}</Tag>,
    },
    {
      title: "Target ID",
      dataIndex: "target_id",
      key: "target_id",
      render: (id: string) => (
        <code style={{ fontSize: 12 }}>
          {id.length > 12 ? `${id.substring(0, 10)}...` : id}
        </code>
      ),
    },
    {
      title: "Actor (Admin ID)",
      dataIndex: "actor_id",
      key: "actor_id",
      render: (actor: string | null) =>
        actor ? (
          <code style={{ fontSize: 12 }}>{actor.substring(0, 8)}...</code>
        ) : (
          <Text type="secondary">SYSTEM</Text>
        ),
    },
    {
      title: "Event Payload",
      key: "details",
      render: (_, record) =>
        record.details ? (
          <Button
            size="small"
            icon={<CodeOutlined />}
            onClick={() => setSelectedDetails(record.details)}
          >
            Inspect JSON
          </Button>
        ) : (
          <Text type="secondary">—</Text>
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
            Compliance & System Audit Trail
          </Title>
          <Text type="secondary">
            Immutable log of all administrative approvals, rejections, and state modifications
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isLoading}
        >
          Refresh Logs
        </Button>
      </div>

      {isError && (
        <Alert
          type="error"
          message="Could not load audit logs"
          description={error instanceof Error ? error.message : "Error"}
          showIcon
        />
      )}

      <Table
        dataSource={logs}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{
          defaultPageSize: 15,
          showSizeChanger: true,
          pageSizeOptions: ["15", "30", "50"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} events logged`,
        }}
      />

      {/* JSON Payload Inspector Modal */}
      <Modal
        title="Audit Event Details"
        open={!!selectedDetails}
        onCancel={() => setSelectedDetails(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedDetails(null)}>
            Close
          </Button>,
        ]}
      >
        <pre
          style={{
            background: "#f5f5f5",
            padding: 16,
            borderRadius: 8,
            overflowX: "auto",
            maxHeight: 400,
          }}
        >
          {JSON.stringify(selectedDetails, null, 2)}
        </pre>
      </Modal>
    </Space>
  );
};
