import { useState } from "react";

type Node = { id: string; x: number; y: number; w: number; title: string; lines: string[]; kind: string };
type Edge = { from: string; to: string; d: string; lx: number; ly: number; label: string; anchor?: "start" | "middle" | "end" };

const W = 220;
const H = 112;

const NODES: Node[] = [
  {
    id: "stimulus",
    x: 40, y: 60, w: W, kind: "js",
    title: "CompilerController (Stimulus)",
    lines: ["+ startDebouncedCompile()", "+ compile()", "+ syncScroll()"],
  },
  {
    id: "ctrl",
    x: 370, y: 60, w: W, kind: "rails",
    title: "CompilerController",
    lines: ["+ index()", "+ compile()", "+ share() · shared()", "+ hello_world()"],
  },
  {
    id: "filter",
    x: 700, y: 60, w: W, kind: "svc",
    title: "AssemblyFilterService",
    lines: ["- FILTERS", "+ call()", "- should_keep_line?()", "- remove_comments()"],
  },
  {
    id: "snippet",
    x: 40, y: 270, w: W, kind: "model",
    title: "Snippet (ActiveRecord)",
    lines: ["slug · source_code", "language · compiler_flags", "- generate_slug()"],
  },
  {
    id: "comp",
    x: 370, y: 270, w: W, kind: "svc",
    title: "CompilationService",
    lines: ["- COMPILER_TIMEOUT = 10", "+ call()", "- execute_command()", "- build_command()"],
  },
  {
    id: "lang",
    x: 700, y: 270, w: W, kind: "svc",
    title: "LanguageConfigService",
    lines: ["- LANGUAGES", "+ command_for()", "+ extension_for()", "+ needs_outfile?()"],
  },
];

// Arestas com caminho e label explícitos — cada label fica num vão
// livre, sem cruzar caixas nem outras arestas.
const EDGES: Edge[] = [
  { from: "stimulus", to: "ctrl",   d: "M 260 96 L 370 96",                    lx: 315, ly: 88,  label: "POST /compile" },
  { from: "ctrl",     to: "filter", d: "M 590 96 L 700 96",                    lx: 645, ly: 88,  label: "call" },
  { from: "ctrl",     to: "comp",   d: "M 480 172 L 480 270",                  lx: 472, ly: 224, label: "call", anchor: "end" },
  { from: "ctrl",     to: "snippet",d: "M 420 172 Q 320 205 245 264",          lx: 265, ly: 196, label: "create / find_by!", anchor: "end" },
  { from: "ctrl",     to: "lang",   d: "M 545 172 Q 645 205 715 264",          lx: 660, ly: 196, label: "command_for", anchor: "start" },
  { from: "comp",     to: "lang",   d: "M 590 318 L 700 318",                  lx: 645, ly: 310, label: "ext · outfile" },
];

// Mapa de classes interativo: passar o ponteiro num nó acende as
// arestas que partem ou chegam nele.
export function ClassMap() {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div className="classmap">
      <svg viewBox="0 0 960 400" role="img" aria-label="Diagrama de classes: CompilerController usa LanguageConfigService, CompilationService e AssemblyFilterService; o Stimulus chama o controller; o controller persiste Snippets.">
        <defs>
          <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="currentColor" />
          </marker>
        </defs>

        {EDGES.map((e) => {
          const active = hover === e.from || hover === e.to;
          return (
            <g key={`${e.from}-${e.to}`} className={`cm-edge ${active ? "is-active" : ""}`}>
              <path d={e.d} fill="none" markerEnd="url(#arrow)" />
              <text x={e.lx} y={e.ly} textAnchor={e.anchor ?? "middle"}>
                {e.label}
              </text>
            </g>
          );
        })}

        {NODES.map((n) => (
          <g
            key={n.id}
            className={`cm-node cm-node--${n.kind} ${hover === n.id ? "is-hover" : ""}`}
            onPointerEnter={() => setHover(n.id)}
            onPointerLeave={() => setHover(null)}
          >
            <rect x={n.x} y={n.y} width={n.w} height={H} rx="10" />
            <text className="cm-title" x={n.x + 14} y={n.y + 26}>
              {n.title}
            </text>
            <line x1={n.x + 10} x2={n.x + n.w - 10} y1={n.y + 36} y2={n.y + 36} />
            {n.lines.map((l, i) => (
              <text key={i} className="cm-member" x={n.x + 14} y={n.y + 54 + i * 14}>
                {l}
              </text>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
