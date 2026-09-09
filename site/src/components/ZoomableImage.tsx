import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Imagem com lightbox: clique abre em tela cheia; Esc ou clique no
// fundo fecha.
export function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="zoomable"
        onClick={() => setOpen(true)}
        aria-label={`Ampliar: ${alt}`}
      >
        <img className="diagram-img" src={src} alt={alt} loading="lazy" />
        <span className="zoomable__hint" aria-hidden="true">ampliar ⤢</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
          >
            <motion.img
              src={src}
              alt={alt}
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="lightbox__close" aria-hidden="true">esc / clique para fechar</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
