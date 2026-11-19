// app/admin/UploadScores.tsx
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export default function UploadScores() {
  const [loading, setLoading] = useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(sheet); // [{ email, assessment, score }, ...]

      const res = await fetch("/api/admin/upload-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });

      const j = await res.json();
      if (!res.ok) {
        alert("Upload failed: " + (j?.error || "unknown"));
      } else {
        alert(`Updated ${j.updated} rows`);
      }
    } catch (err) {
      console.error(err);
      alert("Error reading or uploading file");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="mb-4 flex items-center gap-3">
      <label className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[#94A3B8]">Upload scores (columns: email, assessment, score):</label>
      <input
        type="file"
        accept=".xlsx,.xls,.csv,.numbers"
        onChange={onFileChange}
        disabled={loading}
        className="text-sm"
      />
      {loading && <span className="font-mono text-xs text-[#94A3B8]">Processing...</span>}
    </div>
  );
}
