import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ScoutBackground from "@/components/scout-background";

export const metadata: Metadata = {
    title: "VC Scout 2026",
    description:
        "VC Scout 2026: a hands-on venture capital programme by E-Cell IIT BHU. Learn deal flow, diligence and term sheets from working investors.",
    openGraph: {
        title: "VC Scout 2026",
        description: "A hands-on venture capital programme by E-Cell IIT BHU.",
        siteName: "VC Scout 2026",
    },
};

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
    variable: "--font-bricolage",
    subsets: ["latin"],
    weight: ["500", "600", "700", "800"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} antialiased min-h-screen flex flex-col bg-transparent text-[#F8FAFC]`}
            >
                <ScoutBackground />
                <Header />
                <main className="flex-1 flex flex-col w-full">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
