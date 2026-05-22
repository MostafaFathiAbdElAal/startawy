import LoginForm from '@/components/LoginForm';
import BrandLogo from '@/components/branding/BrandLogo';
import Footer from '@/components/layout/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your Startawy account',
};

export default function LoginPage() {
  return (
    <>
      <div className="text-center mb-10">
        <BrandLogo className="mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Startawy Portal</h1>
      </div>

      <LoginForm />

      <Footer mode="minimal" />
    </>
  );
}
