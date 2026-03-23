import AdminFeedbackClient from "@/components/admin/AdminFeedbackClient";

export default function AdminFeedbackPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Feedback</h1>
        <p className="text-gray-600 dark:text-gray-400">Review and manage feedback from Founders and Consultants</p>
      </div>
      
      <AdminFeedbackClient />
    </div>
  );
}
