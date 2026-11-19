import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { getActiveCohort } from "@/lib/cohort";
import { Button } from "@/components/ui/button";

export default async function Auth() {
  const session = await auth();
  if (session) redirect("/course");
  const cohort = await getActiveCohort();
  const open = !!cohort?.registration_open;

  return (
    <div className="flex w-full flex-1 items-center justify-center px-4 pb-20 pt-12">
      <div className="scout-panel scout-panel--static scout-rise w-full max-w-sm space-y-6 p-8 text-center">
        <div className="space-y-2">
          <p className="scout-eyebrow scout-eyebrow--plain justify-center">VC Scout 2026</p>
          <h1 className="scout-heading text-4xl">Sign in</h1>
        </div>

        <p className="text-sm leading-relaxed text-white/60">
          {open
            ? "Sign in with Google to register for VC Scout 2026."
            : <>New registrations are currently closed. <br />Existing users can sign in below.</>}
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <Button type="submit" size="lg" className="w-full">
            Sign in with Google
          </Button>
        </form>
      </div>
    </div>
  );
}
