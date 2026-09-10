import { useRef, type CSSProperties, type ReactNode } from "react";

// Painel de vidro: blur + borda em gradiente + brilho especular que
// segue o ponteiro via variáveis CSS --mx/--my.
export function GlassPanel({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div
      ref={ref}
      id={id}
      className={`glass ${className}`}
      style={{ "--mx": "50%", "--my": "-20%" } as CSSProperties}
      onPointerMove={onMove}
    >
      {children}
    </div>
  );
}
