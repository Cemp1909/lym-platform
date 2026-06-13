"use client";

import { FileText } from "lucide-react";

type PrintButtonProps = {
  label?: string;
};

export function PrintButton({ label = "PDF" }: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex h-10 items-center gap-2 rounded-lg bg-[#0A3D5C] px-4 text-sm font-bold text-white"
    >
      <FileText className="size-4" />
      {label}
    </button>
  );
}
