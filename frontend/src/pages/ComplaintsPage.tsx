import React, { useState } from "react";
import {
  Table,
  Select,
  Typography,
  Card,
  Space,
  Alert,
  Modal,
  Form,
  Input,
  message,
  Button,
} from "antd";
import type { TableProps } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComplaints, updateComplaintStatus } from "../api/admin";
import { StatusTag } from "../components/StatusTag";
import type { ComplaintRead, ComplaintStatus } from "../types/api";

const { Title, Text } = Typography;
const { TextArea } = Input;

export const ComplaintsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | undefined>(
    undefined
  );

  // Modal state for adding resolution notes when closing/updating a complaint
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] =
    useState<ComplaintRead | null>(null);
  const [pendingStatus, setPendingStatus] = useState<ComplaintStatus | null>(
    null
  );
  const [resolutionForm] = Form.useForm();

  const {
    data: complaints = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["complaints", statusFilter],
    queryFn: () => getComplaints({ status: statusFilter, limit: 100 }),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      resolution_notes,
    }: {
      id: string;
      status: ComplaintStatus;
      resolution_notes?: string;
    }) => updateComplaintStatus(id, { status, resolution_notes }),
    onSuccess: (updated) => {
      message.success(
        `Complaint updated to ${updated.status.toUpperCase()} successfully.`
      );
      // Condition 5: Invalidate queries after every mutation
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      setResolutionModalOpen(false);
      setSelectedComplaint(null);
      setPendingStatus(null);
      resolutionForm.resetFields();
    },
    onError: (err: unknown) => {
      message.error(
        err instanceof Error
          ? err.message
          : "Failed to update complaint status"
      );
    },
  });

  const handleStatusSelect = (
    complaint: ComplaintRead,
    newStatus: ComplaintStatus
  ) => {
    if (newStatus === "resolved" || newStatus === "dismissed") {
      setSelectedComplaint(complaint);
      setPendingStatus(newStatus);
      resolutionForm.setFieldsValue({
        resolution_notes: complaint.resolution_notes || "",
      });
      setResolutionModalOpen(true);
    } else {
      statusMutation.mutate({
        id: complaint.id,
        status: newStatus,
      });
    }
  };

  const handleModalSubmit = (values: { resolution_notes: string }) => {
    if (!selectedComplaint || !pendingStatus) return;
    statusMutation.mutate({
      id: selectedComplaint.id,
      status: pendingStatus,
      resolution_notes: values.resolution_notes,
    });
  };

  const columns: TableProps<ComplaintRead>["columns"] = [
    {
      title: "Complaint Title",
      dataIndex: "title",
      key: "title",
      render: (title: string, record) => (
        <div style={{ maxWidth: 300 }}>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary" ellipsis style={{ fontSize: 13 }}>
            {record.description}
          </Text>
        </div>
      ),
    },
    {
      title: "Target Business ID",
      dataIndex: "business_id",
      key: "business_id",
      render: (bizId: string) => (
        <code style={{ fontSize: 12 }}>{bizId.substring(0, 8)}...</code>
      ),
    },
    {
      title: "Current Status",
      dataIndex: "status",
      key: "status",
      render: (status: ComplaintStatus) => <StatusTag status={status} />,
    },
    {
      title: "Resolution Notes",
      dataIndex: "resolution_notes",
      key: "resolution_notes",
      render: (notes: string | null) =>
        notes ? (
          <Text type="secondary" italic style={{ fontSize: 12 }}>
            "{notes}"
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Filed At",
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
      title: "Update Status",
      key: "update_status",
      render: (_, record) => (
        <Select
          value={record.status}
          onChange={(newVal) => handleStatusSelect(record, newVal)}
          style={{ width: 150 }}
          options={[
            { label: "Open", value: "open" },
            { label: "Under Review", value: "under_review" },
            { label: "Resolved", value: "resolved" },
            { label: "Dismissed", value: "dismissed" },
          ]}
        />
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
            Dispute & Complaints Moderation
          </Title>
          <Text type="secondary">
            Oversee supplier order disputes, non-compliance, and quality grievances
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isLoading}
        >
          Refresh Complaints
        </Button>
      </div>

      {isError && (
        <Alert
          type="error"
          message="Could not load complaints"
          description={error instanceof Error ? error.message : "Error"}
          showIcon
        />
      )}

      {/* Filter Toolbar */}
      <Card size="small">
        <Space wrap>
          <Select
            placeholder="Filter by Status"
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            allowClear
            style={{ width: 200 }}
            options={[
              { label: "All Complaints", value: undefined },
              { label: "Open", value: "open" },
              { label: "Under Review", value: "under_review" },
              { label: "Resolved", value: "resolved" },
              { label: "Dismissed", value: "dismissed" },
            ]}
          />
        </Space>
      </Card>

      <Table
        dataSource={complaints}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} complaints`,
        }}
      />

      {/* Resolution Notes Modal */}
      <Modal
        title={`Add Resolution Notes (${pendingStatus?.toUpperCase()})`}
        open={resolutionModalOpen}
        onCancel={() => {
          setResolutionModalOpen(false);
          setSelectedComplaint(null);
          setPendingStatus(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={resolutionForm}
          layout="vertical"
          onFinish={handleModalSubmit}
        >
          <Form.Item
            name="resolution_notes"
            label="Resolution / Closing Notes"
            rules={[
              {
                required: true,
                message: "Please provide resolution notes before closing.",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="e.g., Replacement parts dispatched under warranty tracking #9821."
            />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button
              onClick={() => {
                setResolutionModalOpen(false);
                setSelectedComplaint(null);
                setPendingStatus(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={statusMutation.isPending}
            >
              Save & Update
            </Button>
          </div>
        </Form>
      </Modal>
    </Space>
  );
};
