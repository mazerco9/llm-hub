// frontend/app/auth-group/layout.tsx
import MainLayout from '../../components/MainLayout';

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}