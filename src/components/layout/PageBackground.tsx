import React from "react";

export function PageBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col font-sans selection:bg-violet-600/30 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-950/20 via-slate-950/30 to-slate-950 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      {children}
    </div>
  );
}
