"use client";

import { Roboto } from "next/font/google";
import { store } from "@/store";
import { Provider } from "react-redux";
import { AntdRegistry } from "@ant-design/nextjs-registry";

import "@ant-design/v5-patch-for-react-19";
import "./globals.css";
import ThemeProvider from "@/providers/ThemeProvider";
import { App } from "antd";
import { DashboardLayout } from "@/components/layouts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "500", "700"], // optional
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable}`}>
        <AntdRegistry>
          <Provider store={store}>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider>
                <App>
                  <DashboardLayout>{children}</DashboardLayout>
                </App>
              </ThemeProvider>
            </QueryClientProvider>
          </Provider>
        </AntdRegistry>
      </body>
    </html>
  );
}
