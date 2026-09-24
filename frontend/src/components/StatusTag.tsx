import React from "react";
import type { BusinessStatus, ComplaintStatus } from "../types/api";

interface StatusTagProps {
  status: BusinessStatus | ComplaintStatus | string;
}

export const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  const normalized = status.toLowerCase();

  let bg = "#f3f4f6";
  let text = "#4b5563";
  let border = "#e5e7eb";
  let dotColor = "#9ca3af";
  let label = status.toUpperCase();

  switch (normalized) {
    case "pending":
      bg = "#fef3c7";
      text = "#92400e";
      border = "#fde68a";
      dotColor = "#d97706";
      label = "PENDING";
      break;
    case "verified":
      bg = "#dcfce7";
      text = "#166534";
      border = "#bbf7d0";
      dotColor = "#16a34a";
      label = "VERIFIED";
      break;
    case "rejected":
      bg = "#fee2e2";
      text = "#991b1b";
      border = "#fecaca";
      dotColor = "#dc2626";
      label = "REJECTED";
      break;
    case "open":
      bg = "#ffedd5";
      text = "#9a3412";
      border = "#fed7aa";
      dotColor = "#ea580c";
      label = "OPEN";
      break;
    case "under_review":
      bg = "#dbeafe";
      text = "#1e40af";
      border = "#bfdbfe";
      dotColor = "#2563eb";
      label = "UNDER REVIEW";
      break;
    case "resolved":
      bg = "#dcfce7";
      text = "#166534";
      border = "#bbf7d0";
      dotColor = "#16a34a";
      label = "RESOLVED";
      break;
    case "dismissed":
      bg = "#f3f4f6";
      text = "#4b5563";
      border = "#e5e7eb";
      dotColor = "#6b7280";
      label = "DISMISSED";
      break;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 8px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
        lineHeight: "16px",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: dotColor,
        }}
      />
      {label}
    </span>
  );
};
