import { useEffect, useRef, useState } from "react";

// Título do hero: gradiente em movimento lento (ecoando o shader de
// fundo) + scramble binário — letras viram 0/1 e se resolvem, com um
// decode completo varrendo o texto no hover.
export function LiquidTitle({ text }: { text: string }) {
  const [chars, setChars] = useState(text.split(""));
  const timers = useRef<number[]>([]);

  const reduced = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setChar = (i: number, c: string) =>
    setChars((prev) => prev.map((p, j) => (j === i ? c : p)));

  const scrambleAt = (i: number, duration = 200) => {
    const bit = () => (Math.random() < 0.5 ? "0" : "1");
    const interval = window.setInterval(() => setChar(i, bit()), 50);
    timers.current.push(
      window.setTimeout(() => {
        clearInterval(interval);
        setChar(i, text[i]);
      }, duration)
    );
  };

  // decode: varre o texto da esquerda para a direita
  const decode = () => {
    if (reduced()) return;
    for (let i = 0; i < text.length; i++) {
      timers.current.push(window.setTimeout(() => scrambleAt(i, 160), i * 45));
    }
  };

  useEffect(() => {
    if (reduced()) return;
    // flicker ocioso: um caractere aleatório pisca em bits a cada ~3 s
    const idle = window.setInterval(() => {
      const i = Math.floor(Math.random() * text.length);
      if (text[i] !== " ") scrambleAt(i, 140);
    }, 3000);
    const bag = timers.current;
    return () => {
      clearInterval(idle);
      bag.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <span className="liquid-title" onPointerEnter={decode}>
      <span className="liquid-title__text">
        {chars.map((c, i) => (
          <span key={i} className={c === "0" || c === "1" ? "liquid-title__bit" : undefined}>
            {c}
          </span>
        ))}
      </span>
    </span>
  );
}
