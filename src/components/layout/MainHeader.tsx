import { Link, NavLink } from "react-router-dom";
import { getSuiteProducts } from "../../data/suiteProducts";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-xs font-medium transition-colors ${
    isActive ? "text-stone-900" : "text-stone-500 hover:text-stone-800"
  }`;

export function MainHeader() {
  const api = getSuiteProducts().find((p) => p.id === "api");

  return (
    <header className="relative z-10 border-b border-stone-200 bg-stone-50/90 backdrop-blur-sm px-4 py-4 md:px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-stone-900 text-stone-50 flex items-center justify-center font-display font-extrabold text-sm tracking-tight">
            uA
          </div>
          <div>
            <h1 className="font-display font-extrabold text-lg text-stone-900 tracking-tight">
              uAgent
            </h1>
            <p className="text-[10px] text-stone-500 font-medium tracking-wide">
              大模型 API 与智能体
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <NavLink to="/agents" className={navClass}>
            试用智能体
          </NavLink>
          {api && (
            <a
              href={api.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline text-xs font-medium text-stone-500 hover:text-orange-700 transition-colors"
            >
              接入 API
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
