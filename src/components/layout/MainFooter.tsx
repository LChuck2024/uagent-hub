import { Link } from "react-router-dom";
import { getRootDomain } from "../../lib/tenant";
import { getSuiteProducts } from "../../data/suiteProducts";

export function MainFooter() {
  const domain = getRootDomain();
  const api = getSuiteProducts().find((p) => p.id === "api");

  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-50 px-4 py-6 text-center text-xs text-stone-500 z-10 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© 2026 {domain}</p>
        <div className="flex items-center gap-4 text-[11px]">
          <Link to="/agents" className="text-stone-500 hover:text-stone-900 transition-colors">
            试用智能体
          </Link>
          {api && (
            <a
              href={api.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-500 hover:text-stone-900 transition-colors"
            >
              接入 API
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
