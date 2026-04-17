import RegisterForm from '@/components/RegisterForm';
import BrandLogo from '@/components/branding/BrandLogo';
import Footer from '@/components/layout/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - Startawy',
  description: 'Create your Startawy account',
};

export default function RegisterPage() {
  return (
    <>
      <div className="text-center mb-10">
        <BrandLogo className="mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Create Account</h1>
      </div>

      <RegisterForm />

      <Footer mode="minimal" />
    </>
  );
}
