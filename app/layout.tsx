import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '政治权力游戏 | Political Power Game',
  description: '从基层政治人物到权力顶峰的权谋模拟游戏',
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
