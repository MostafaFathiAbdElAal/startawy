import CompleteProfileForm from '@/components/CompleteProfileForm';
import BrandLogo from '@/components/branding/BrandLogo';
import Footer from '@/components/layout/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Your Profile - Startawy',
  description: 'Tell us a bit more about you to get started',
};

export default function CompleteProfilePage() {
  return (
    <>
      <div className="text-center mb-10">
        <BrandLogo className="mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Profile Setup</h1>
      </div>

      <CompleteProfileForm />

      <Footer mode="minimal" />
    </>
  );
}
