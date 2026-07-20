import React from "react";

export function PageBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-orange-200 selection:text-stone-900">
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(28,25,23,0.12) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      {children}
    </div>
  );
}
