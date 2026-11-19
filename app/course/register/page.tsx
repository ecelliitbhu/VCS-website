import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getActiveCohort, getEnrollment } from "@/lib/cohort";
import RegisterFormPage from "./RegisterFormPage";

export default async function Page() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth");
  }

  const cohort = await getActiveCohort();
  const enrollment = cohort
    ? await getEnrollment(session.user.email, cohort.id)
    : null;

  // Closed and not enrolled: nothing to fill in.
  if (!enrollment && !cohort?.registration_open) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="scout-panel scout-panel--static max-w-md w-full text-center p-8">
          <h1 className="font-display text-2xl font-bold tracking-tight mb-3">Registrations are closed</h1>
          <p className="text-[#94A3B8]">Registrations for this edition are not open right now.</p>
        </div>
      </div>
    );
  }

  return (
    <RegisterFormPage
      existingData={
        enrollment
          ? {
              full_name: enrollment.full_name,
              institution: enrollment.institution,
              current_year: enrollment.current_year,
              course: enrollment.course,
              branch: enrollment.branch,
              phone_number: enrollment.phone_number,
              registered_course_id: cohort!.id,
            }
          : null
      }
    />
  );
}
