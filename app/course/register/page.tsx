import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import RegisterFormPage from "./RegisterFormPage";

export default async function Page() {
  const session = await auth();

  // 1) If no session → redirect to /auth
  if (!session?.user?.email) {
    redirect("/auth");
  }

  let userInfo = null;

  try {
    // 2) Safely construct base URL from host headers
    const headerList = await headers();
    const host =
      headerList.get("x-forwarded-host") ||
      headerList.get("host") ||
      "localhost:3000";

    const protocol =
      headerList.get("x-forwarded-proto") ||
      (process.env.NODE_ENV === "production" ? "https" : "http");

    const baseUrl = `${protocol}://${host}`;

    console.log("BASE URL:", baseUrl);

    // 3) Fetch user registration status
    const req = await fetch(`${baseUrl}/api/user/${session.user.email}`, {
      cache: "no-store",
    });

    if (!req.ok) {
      throw new Error("HTTP error " + req.status);
    }

    const res = await req.json();
    userInfo = res; // Store complete user info
  } catch (error) {
    console.error("Error loading registration status:", error);
  }

  // 4) Pass user info to form (whether registered or not)
  // This allows both registration and profile updates
  return <RegisterFormPage existingData={userInfo} />;
}
