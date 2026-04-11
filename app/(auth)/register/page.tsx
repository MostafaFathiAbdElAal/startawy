import Image from 'next/image';
import RegisterForm from '../../../components/RegisterForm';
import ThemeToggle from '../../../components/ThemeToggle';
import bgRegister from "../../../assets/imgs/signup-image.png"
export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row relative bg-white dark:bg-auth-bg-dark overflow-y-auto">
      {/* Dark Mode Toggle (Client Component) */}
      <ThemeToggle />

      {/* Left Side - Image (Static Server Content) */}
      <div className="hidden md:flex w-[40%] lg:w-[60%] relative overflow-hidden bg-linear-to-br from-teal-900 via-cyan-900 to-blue-900 border-r border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 bg-black/10 z-10"></div>
        <div className="absolute inset-0">
          <Image
            src={bgRegister}
            alt="BIS Platform"
            fill
            className="w-full h-full object-cover"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* Right Side - Form Container */}
      <div className="flex-1 flex flex-col items-center p-4 sm:p-8 bg-auth-bg-light dark:bg-gray-900/50 overflow-y-auto py-10 sm:py-16">
        <div className="w-full max-w-md">
          {/* Interactive Form (Client Component) */}
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
