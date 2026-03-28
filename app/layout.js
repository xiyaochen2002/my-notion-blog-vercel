import "./globals.css";

export const metadata = {
  title: "Xiyao Chen",
  description: "Mathematics · Programming · Life",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
