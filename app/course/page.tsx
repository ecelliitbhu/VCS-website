import { auth } from "@/auth";
import { getUserStatus } from "@/lib/signup";
import CourseClient from "./CourseClient";

export default async function Page() {
  const session = await auth();
  const status = await getUserStatus(session?.user?.email);

  return <CourseClient
      status={status}
      isAdmin={(session?.user as any)?.role === "admin"}
    />;
}
