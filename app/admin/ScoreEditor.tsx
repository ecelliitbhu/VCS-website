"use client";

import { useState } from "react";

type Props = {
    userEmail: string;
    assessmentId: string;
    initialScore?: number | null;
};

export default function ScoreEditor({ userEmail, assessmentId, initialScore }: Props) {
    const [score, setScore] = useState<number | "">(initialScore ?? "");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/score`, {
                method: "POST",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_email: userEmail, assessment_id: assessmentId, score: score === "" ? null : Number(score) }),
            });
            const j = await res.json();
            if (!res.ok) {
                console.error("Save score failed", j);
                alert("Failed to save score: " + (j?.error || "unknown"));
            } else {
                setSaved(true);
            }
            setTimeout(() => setSaved(false), 2000);
            // no explicit refresh; optimistic UI assumes success
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <input type="number" value={score as any} onChange={(e) => setScore(e.target.value === "" ? "" : Number(e.target.value))} className="scout-field w-24 py-1" placeholder="score" />
            <button type="button" onClick={save} disabled={saving} className="px-2 py-1 rounded-[2px] bg-[#F86531] hover:bg-[#ff7340] text-xs font-semibold text-white">
                {saving ? "Saving..." : saved ? "Saved" : "Save"}
            </button>
        </div>
    );
}
