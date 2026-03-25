import "./globals.css";

export const metadata = {
  title: "Xiyao's Blog",
  description: "A custom blog powered by Notion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
