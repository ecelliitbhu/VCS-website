import { auth, signOut } from "@/auth";
import Link from "next/link";
import ProfileDropdown from "./ProfileDropdown";
import Image from "next/image";

export default async function Header() {
  const session = await auth();
  const isAdmin = !!session?.user && (session.user as any).role === "admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#091522]/70 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" aria-label="IIT BHU E-Summit '27 home" className="shrink-0">
          <Image
            src="/esummit-logo.webp"
            alt="IIT BHU E-Summit '27"
            width={200}
            height={74}
            sizes="200px"
            className="h-12 w-auto sm:h-14"
            priority
          />
        </Link>

        <nav className="flex items-center gap-5 sm:gap-7">
          <Link href="/course" className="scout-link">Course</Link>
          {isAdmin && (
            <Link href="/admin" className="scout-link">Admin</Link>
          )}

          {session && session.user ? (
            <ProfileDropdown
              user={session.user}
              signOutAction={async () => {
                "use server";
                await signOut();
              }}
            />
          ) : (
            <Link
              href="/auth"
              className="group inline-flex h-9 items-center gap-2 rounded-[3px] bg-[#F86531] px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#ff7340] hover:shadow-[0_0_24px_rgba(248,101,49,0.45)] active:scale-[0.97]"
            >
              Register
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">&rarr;</span>
            </Link>
          )}
        </nav>
      </div>
      <div className="scout-rule" aria-hidden="true" />
    </header>
  );
}
