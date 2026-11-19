import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
            <p className="scout-eyebrow">Signal lost</p>
            <h1 className="scout-numeral text-[7rem] sm:text-[10rem]">404</h1>
            <p className="max-w-sm text-white/65">
                We scouted everywhere, but this page isn&apos;t on the map.
            </p>
            <Button asChild size="lg">
                <Link href="/">Back to base</Link>
            </Button>
        </div>
    );
}
