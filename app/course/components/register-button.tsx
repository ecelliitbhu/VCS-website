import { Button } from "@/components/ui/button";
import Link from "next/link";

type RegisterButtonProps = {
  status: "no-session" | "unregistered" | "registered";
};

export default function RegisterButton({ status }: RegisterButtonProps) {
    if (status === "no-session") {
        return (
            <Button asChild size="lg" className="rounded-full px-8">
                <Link href="/auth">SIGN IN</Link>
            </Button>
        );
    }

    if (status === "registered") {
        return (
            <a href="/course/registered">
                <Button size="lg" className="border border-white/20 bg-[#13324F] px-8 text-white hover:border-white/40 hover:bg-[#1a4166]">
                    SUBMIT ASSIGNMENT
                </Button>
            </a>
        );
    }

    // unregistered case - redirect to registration form
    // This is the default return case if status is "unregistered"
    return (
        <Button asChild size="lg" variant="cosmic">
            <a href="/course/register">REGISTER </a>
        </Button>
    );
}