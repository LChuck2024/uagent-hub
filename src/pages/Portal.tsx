import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bot,
  ClipboardCheck,
  ExternalLink,
  KeyRound,
  Network,
} from "lucide-react";
import { getSuiteProducts, SuiteProduct } from "../data/suiteProducts";
import { PageBackground } from "../components/layout/PageBackground";
import { MainHeader } from "../components/layout/MainHeader";
import { MainFooter } from "../components/layout/MainFooter";

const accentBorder: Record<SuiteProduct["accent"], string> = {
  cyan: "hover:border-stone-400",
  violet: "hover:border-orange-600/50",
  amber: "hover:border-amber-700/40",
  ink: "hover:border-stone-600",
};

const accentBadge: Record<SuiteProduct["accent"], string> = {
  cyan: "border-stone-300 bg-stone-100 text-stone-600",
  violet: "border-orange-200 bg-orange-50 text-orange-800",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  ink: "border-stone-400 bg-stone-200/60 text-stone-800",
};

const accentIcon: Record<SuiteProduct["accent"], string> = {
  cyan: "bg-stone-900 text-stone-50",
  violet: "bg-orange-700 text-orange-50",
  amber: "bg-amber-800 text-amber-50",
  ink: "bg-stone-800 text-stone-50",
};

function ProductIcon({ id }: { id: SuiteProduct["id"] }) {
  if (id === "api") return <KeyRound className="w-5 h-5" />;
  if (id === "storm") return <Network className="w-5 h-5" />;
  if (id === "audit") return <ClipboardCheck className="w-5 h-5" />;
  return <Bot className="w-5 h-5" />;
}

export function Portal() {
  const products = getSuiteProducts();
  const apiHref = products.find((p) => p.id === "api")?.href;

  return (
    <PageBackground>
      <MainHeader />

      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-4 py-10 md:px-8 space-y-14">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white px-8 py-12 md:px-14 md:py-16"
        >
          <div className="relative max-w-2xl space-y-6">
            <p className="font-display font-extrabold text-4xl md:text-5xl text-stone-900 tracking-tight leading-[1.1]">
              uAgent
            </p>
            <h2 className="font-display font-bold text-xl md:text-2xl text-stone-800 tracking-tight leading-snug">
              把大模型接进你的产品，或直接用现成的智能体
            </h2>
            <p className="text-sm md:text-base text-stone-500 leading-relaxed max-w-xl">
              无论你是开发者要稳定 API，还是想先体验一个能干活的助手，都可以从这里开始。不用搭环境，打开就能用。
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                to="/agents"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg btn-primary text-sm"
              >
                免费试用智能体
                <ArrowRight className="w-4 h-4" />
              </Link>
              {apiHref && (
                <a
                  href={apiHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-sm font-medium hover:border-stone-500 transition-colors"
                >
                  我要接入 API
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </motion.section>

        <section className="space-y-5">
          <div>
            <h3 className="font-display font-bold text-xl text-stone-900">你想先解决哪件事？</h3>
            <p className="text-sm text-stone-500 mt-1">选最贴近你当前需求的一项即可。</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product, index) => {
              const cardClass = `glass-panel rounded-2xl p-6 flex flex-col gap-4 transition-all hover:-translate-y-0.5 ${accentBorder[product.accent]}`;
              const body = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w-11 h-11 rounded-lg flex items-center justify-center ${accentIcon[product.accent]}`}
                    >
                      <ProductIcon id={product.id} />
                    </div>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded border ${accentBadge[product.accent]}`}
                    >
                      {product.badge}
                    </span>
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="font-display font-bold text-lg text-stone-900">{product.name}</h4>
                    <p className="text-sm text-stone-700 leading-snug">{product.forWhom}</p>
                    <p className="text-sm text-stone-500 leading-relaxed">{product.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-800">
                    {product.cta}
                    {product.external ? (
                      <ExternalLink className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                  </span>
                </>
              );

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  {product.external ? (
                    <a
                      href={product.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${cardClass} block h-full`}
                    >
                      {body}
                    </a>
                  ) : (
                    <Link to={product.href} className={`${cardClass} block h-full`}>
                      {body}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {[
            { step: "01", title: "选一个入口", desc: "API、智能体、想法评估或生活审计，按你的目标点进去。" },
            { step: "02", title: "立刻开始用", desc: "试用无需部署；接入 API 拿到 Key 就能发请求。" },
            { step: "03", title: "按需升级", desc: "用得顺手再充值、生成专属链接或坚持复盘。" },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-stone-200 bg-white px-5 py-4 space-y-1.5"
            >
              <p className="text-[10px] font-mono text-orange-700">{item.step}</p>
              <p className="font-display font-semibold text-stone-900">{item.title}</p>
              <p className="text-stone-500 leading-relaxed text-xs">{item.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <MainFooter />
    </PageBackground>
  );
}
