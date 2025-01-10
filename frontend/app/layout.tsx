import { Inter } from 'next/font/google';
import './globals.css';
import MainLayout from '../components/MainLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'LLM Hub Personnel',
  description: 'Interface unifiée pour interagir avec différents LLMs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
