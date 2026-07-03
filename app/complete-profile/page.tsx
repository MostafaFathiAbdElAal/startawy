import CompleteProfileForm from '@/components/CompleteProfileForm';
import BrandLogo from '@/components/branding/BrandLogo';
import Footer from '@/components/layout/Footer';
import { getProfileData } from '@/app/actions/user';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile Setup',
  description: 'Tell us a bit more about you to get started',
};

export default async function CompleteProfilePage() {
  const profileData = await getProfileData();
  const user = profileData?.user || null;

  return (
    <>
      <div className="text-center mb-10">
        <BrandLogo className="mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Profile Setup</h1>
      </div>

      <CompleteProfileForm initialUser={user} />

      <Footer mode="minimal" />
    </>
  );
}
