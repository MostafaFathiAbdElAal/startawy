import { getProfileData } from "@/app/actions/user";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const data = await getProfileData();

  if (!data) {
    redirect("/login");
  }

  return (
    <div className="p-0">
      <ProfileClient initialData={data} />
    </div>
  );
}
