import React, { useState } from "react";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  Alert,
  Skeleton,
  message,
  Divider,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  ShopOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getBusinessById, verifyBusiness } from "../api/admin";
import { StatusTag } from "../components/StatusTag";
import type { BusinessVerifyRequest } from "../types/api";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const BusinessDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectForm] = Form.useForm();

  const {
    data: business,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["business", id],
    queryFn: () => getBusinessById(id!),
    enabled: !!id,
  });

  // Verification Mutation (Approve or Reject)
  const verifyMutation = useMutation({
    mutationFn: (payload: BusinessVerifyRequest) => verifyBusiness(id!, payload),
    onSuccess: (updated) => {
      message.success(
        `Business marked as ${updated.status.toUpperCase()} successfully.`
      );
      // Condition 5: Invalidate queries after every mutation
      queryClient.invalidateQueries({ queryKey: ["business", id] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      setRejectModalOpen(false);
      rejectForm.resetFields();
    },
    onError: (err: unknown) => {
      message.error(
        err instanceof Error
          ? err.message
          : "Failed to update business verification status"
      );
    },
  });

  const handleApprove = () => {
    Modal.confirm({
      title: "Approve Business Verification?",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to approve "${business?.name}"? This supplier will be flagged as VERIFIED and permitted to transact.`,
      okText: "Yes, Approve",
      okType: "primary",
      cancelText: "Cancel",
      onOk: () => {
        verifyMutation.mutate({ status: "verified" });
      },
    });
  };

  const handleRejectSubmit = (values: { rejection_reason: string }) => {
    verifyMutation.mutate({
      status: "rejected",
      rejection_reason: values.rejection_reason,
    });
  };

  if (isError) {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/businesses")}>
          Back to Businesses
        </Button>
        <Alert
          type="error"
          message="Business not found"
          description={error instanceof Error ? error.message : "Failed to load details"}
          showIcon
        />
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/businesses")}
          >
            Back
          </Button>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {business ? business.name : "Business Verification Details"}
            </Title>
            <Text type="secondary">Review GST and compliance documentation</Text>
          </div>
        </Space>

        {business && (
          <Space>
            {business.status !== "verified" && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
                loading={verifyMutation.isPending}
                style={{ backgroundColor: "#52c41a" }}
              >
                Approve Verification
              </Button>
            )}

            {business.status !== "rejected" && (
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setRejectModalOpen(true)}
                loading={verifyMutation.isPending}
              >
                Reject Verification
              </Button>
            )}
          </Space>
        )}
      </div>

      {isLoading ? (
        <Card>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      ) : business ? (
        <>
          {/* Rejection Alert if Rejected */}
          {business.status === "rejected" && (
            <Alert
              type="error"
              message="Verification Rejected"
              description={
                business.rejection_reason ||
                "No detailed reason provided for this rejection."
              }
              showIcon
            />
          )}

          <Card
            title={
              <Space>
                <ShopOutlined />
                <span>Onboarding Profile Overview</span>
              </Space>
            }
            extra={<StatusTag status={business.status} />}
          >
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="Company Legal Name" span={2}>
                <Text strong>{business.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Current Status">
                <StatusTag status={business.status} />
              </Descriptions.Item>

              <Descriptions.Item label="Business Classification">
                {business.business_type}
              </Descriptions.Item>
              <Descriptions.Item label="GST Identification Number (GSTIN)">
                <code>{business.gst_no}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Registration Date">
                {new Date(business.created_at).toLocaleString("en-IN")}
              </Descriptions.Item>

              <Descriptions.Item label="Registered Physical Address" span={3}>
                <Paragraph style={{ margin: 0 }}>{business.address}</Paragraph>
              </Descriptions.Item>

              <Descriptions.Item label="Verified By (Admin UUID)">
                {business.verified_by || "Pending Verification"}
              </Descriptions.Item>
              <Descriptions.Item label="Verified At">
                {business.verified_at
                  ? new Date(business.verified_at).toLocaleString("en-IN")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Last Profile Update">
                {new Date(business.updated_at).toLocaleString("en-IN")}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ background: "#fafafa", padding: 16, borderRadius: 8 }}>
              <Title level={5} style={{ margin: "0 0 8px 0" }}>
                ProcureX Compliance & Verification Rules
              </Title>
              <Text type="secondary">
                Approving this company will authorize them for B2B procurement,
                invoicing, and supplier directories. Rejecting requires an explicit
                reason that will be recorded in the audit logs and communicated to the
                supplier.
              </Text>
            </div>
          </Card>
        </>
      ) : null}

      {/* Reject Modal Requiring Reason */}
      <Modal
        title="Reject Business Verification"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleRejectSubmit}
          initialValues={{ rejection_reason: "" }}
        >
          <Paragraph type="secondary">
            Please specify why the verification for{" "}
            <strong>{business?.name}</strong> is being rejected. This reason is
            mandatory.
          </Paragraph>

          <Form.Item
            name="rejection_reason"
            label="Rejection Reason"
            rules={[
              {
                required: true,
                message: "Please enter a valid rejection reason",
              },
              {
                min: 10,
                message: "Reason must be at least 10 characters long",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="e.g., GST registration certificate blurred or invalid TIN mismatch."
            />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button
              danger
              type="primary"
              htmlType="submit"
              loading={verifyMutation.isPending}
            >
              Confirm Rejection
            </Button>
          </div>
        </Form>
      </Modal>
    </Space>
  );
};
