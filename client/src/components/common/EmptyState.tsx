import React from "react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No content yet",
  message = "There are no items to display at the moment. Check back later!",
  icon,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        textAlign: "center",
        color: "#6b7280",
        minHeight: "200px",
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem", opacity: 0.6 }}>
        {icon ?? "📭"}
      </div>
      <h3
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "#374151",
          margin: "0 0 0.375rem 0",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "0.875rem",
          maxWidth: "320px",
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {message}
      </p>
    </div>
  );
};

export default EmptyState;
