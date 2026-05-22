import ForgotPasswordForm from '@/components/ForgotPasswordForm';
import BrandLogo from '@/components/branding/BrandLogo';
import Footer from '@/components/layout/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your password securely via WhatsApp OTP',
};

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="text-center mb-10">
        <BrandLogo className="mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Recover Password</h1>
      </div>

      <ForgotPasswordForm />

      <Footer mode="minimal" />
    </>
  );
}
