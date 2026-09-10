import { useMemo, type ReactNode } from "react";

type Lang = "ruby" | "bash" | "text";

const RUBY_KEYWORDS =
  /\b(def|end|class|module|do|if|else|elsif|unless|return|true|false|nil|self|require|lambda|begin|rescue|ensure)\b/;
const BASH_KEYWORDS = /\b(docker|bin|kamal|bundle|gem|run|build|test)\b/;

// Realce mínimo, sem biblioteca: divide em linhas, isola comentários e
// strings, e marca palavras-chave. Suficiente para os trechos do site.
function highlightLine(line: string, lang: Lang, key: number): ReactNode {
  const commentIdx =
    lang === "bash"
      ? line.indexOf("#") >= 0 && !line.slice(0, line.indexOf("#")).includes('"')
        ? line.indexOf("#")
        : -1
      : lang === "ruby"
        ? line.indexOf("#")
        : -1;

  const code = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
  const comment = commentIdx >= 0 ? line.slice(commentIdx) : "";

  const parts: ReactNode[] = [];
  const tokenRe = /("[^"]*"|'[^']*')/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = tokenRe.exec(code)) !== null) {
    if (m.index > last) parts.push(<Kw key={`${key}-p${i++}`} text={code.slice(last, m.index)} lang={lang} />);
    parts.push(
      <span key={`${key}-s${i++}`} className="tok-str">
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < code.length) parts.push(<Kw key={`${key}-t${i++}`} text={code.slice(last)} lang={lang} />);

  return (
    <span key={key} className="cl">
      {parts}
      {comment && <span className="tok-com">{comment}</span>}
      {"\n"}
    </span>
  );
}

function Kw({ text, lang }: { text: string; lang: Lang }) {
  const re = lang === "ruby" ? RUBY_KEYWORDS : lang === "bash" ? BASH_KEYWORDS : null;
  if (!re) return <>{text}</>;
  const out: ReactNode[] = [];
  const wordRe = /\b(\w+[!?=]?|[:%][\w{]+|%{?\w+}?)\b/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = wordRe.exec(text)) !== null) {
    const w = m[0];
    if (re.test(w)) {
      if (m.index > last) out.push(text.slice(last, m.index));
      out.push(
        <span key={i++} className="tok-kw">
          {w}
        </span>
      );
      last = m.index + w.length;
    }
  }
  out.push(text.slice(last));
  return <>{out}</>;
}

export function CodeBlock({ code, lang = "text", label }: { code: string; lang?: Lang; label?: string }) {
  const lines = useMemo(
    () => code.replace(/\n$/, "").split("\n").map((l, i) => highlightLine(l, lang, i)),
    [code, lang]
  );
  return (
    <figure className="codeblock">
      {label && <figcaption className="codeblock__label">{label}</figcaption>}
      <pre className="codeblock__pre">
        <code>{lines}</code>
      </pre>
    </figure>
  );
}
