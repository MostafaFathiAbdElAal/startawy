import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BookConsultantClient from "@/components/consultants/BookConsultantClient";

export const metadata: Metadata = {
  title: "Book a Consultant",
};

export default async function BookConsultantPage() {
  // Fetch only fully verified consultants (both email AND phone must be verified)
  const dbConsultants = await prisma.consultant.findMany({
    where: {
      user: {
        isEmailVerified: true,
        isPhoneVerified: true,
      }
    },
    include: {
      user: {
        select: { name: true, image: true, isEmailVerified: true, isPhoneVerified: true }
      }
    }
  });

  // Map DB records to UI-friendly format
  const consultants = dbConsultants.map(c => ({
    id: c.id,
    name: c.user.name,
    specialization: c.specialization,
    rating: c.rating,
    reviews: c.reviewCount,
    experience: `${c.yearsOfExp} years`,
    price: c.sessionRate,
    location: "Global",
    certifications: c.certifications ? c.certifications.split(';') : [],
    avatar: c.user.image,
    availability: c.availability || "Check Profile",
    availableColor: "green",
    bio: c.bio || "No biography provided.",
  }));

  const specializations = Array.from(
    new Set(dbConsultants.map(c => c.specialization).filter(Boolean))
  ) as string[];

  return (
    <BookConsultantClient 
      initialConsultants={consultants} 
      specializations={specializations} 
    />
  );
}
