import { Globe } from "lucide-react";

export function MainFooter() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 py-6 text-center text-xs text-slate-500 z-10 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-mono">© 2026 uagent.site · Powered by LChuck Studio</p>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          克隆即上线 · 零代码定制
        </span>
      </div>
    </footer>
  );
}
