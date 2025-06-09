"use client";

import { AppBar } from "@/components/uiKit";
import { Layout } from "antd";

const { Content } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout style={{ minHeight: "100dvh" }}>
      <AppBar title="Financial Transactions Management" />
      <Content style={{ padding: "2rem", minHeight: "100%" }}>
        {children}
      </Content>
    </Layout>
  );
}
