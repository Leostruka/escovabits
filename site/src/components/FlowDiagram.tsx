import { motion } from "framer-motion";

const NODES = [
  { id: "ui", title: "Stimulus", sub: "debounce de 2,5 s sobre a digitação", tag: "cliente" },
  { id: "post", title: "POST /compile", sub: "source_code · language · compiler_flags", tag: "http" },
  { id: "ctrl", title: "CompilerController", sub: "flags via Shellwords.split", tag: "rails" },
  { id: "lang", title: "LanguageConfigService", sub: "resolve o template de comando", tag: "serviço" },
  { id: "comp", title: "CompilationService", sub: "Tempfile + Open3.capture3 · timeout 10 s", tag: "serviço" },
  { id: "filter", title: "AssemblyFilterService", sub: "remove diretivas e labels mortas", tag: "serviço" },
  { id: "turbo", title: "Turbo Stream", sub: "atualiza #output_frame", tag: "resposta" },
];

// Stepper vertical: trilha tracejada à esquerda desenhada ao entrar na
// viewport; cada nó acende em sequência. Sem scroll horizontal.
export function FlowDiagram() {
  return (
    <div
      className="flow"
      role="img"
      aria-label="Fluxo: Stimulus dispara POST /compile; o controller resolve o comando, o CompilationService executa com timeout, o AssemblyFilterService limpa a saída e um Turbo Stream atualiza o editor."
    >
      <motion.span
        className="flow__rail"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
        aria-hidden="true"
      />
      {NODES.map((n, i) => (
        <motion.div
          key={n.id}
          className="flow__node"
          initial={{ opacity: 0, x: -14 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ delay: 0.1 * i, duration: 0.45, ease: "easeOut" }}
        >
          <span className="flow__pin" aria-hidden="true" />
          <span className="flow__idx">{String(i + 1).padStart(2, "0")}</span>
          <div className="flow__body">
            <span className="flow__title">{n.title}</span>
            <span className="flow__sub">{n.sub}</span>
          </div>
          <span className="flow__tag">{n.tag}</span>
        </motion.div>
      ))}
    </div>
  );
}
