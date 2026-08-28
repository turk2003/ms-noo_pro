import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ระบบเบิกอุปกรณ์ PEA",
  description: "ระบบจัดการการเบิกอุปกรณ์สำหรับการไฟฟ้าส่วนภูมิภาค",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
