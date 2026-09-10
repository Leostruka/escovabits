import { motion } from "framer-motion";
import { Backdrop } from "./gl/Backdrop";
import { BitSphere } from "./gl/BitSphere";
import { GlassPanel } from "./components/GlassPanel";
import { LiquidTitle } from "./components/LiquidTitle";
import { CodeBlock } from "./components/CodeBlock";
import { FlowDiagram } from "./components/FlowDiagram";
import { ClassMap } from "./components/ClassMap";
import { ZoomableImage } from "./components/ZoomableImage";

const BASE = import.meta.env.BASE_URL;

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

function SectionHead({ n, title }: { n: string; title: string }) {
  return (
    <header className="section-head">
      <span className="section-head__n">{n}</span>
      <h2>{title}</h2>
    </header>
  );
}

export default function App() {
  return (
    <>
      <Backdrop />

      <nav className="nav">
        <a className="nav__brand" href="#top">escovabits<span className="nav__dot">.</span></a>
        <div className="nav__links">
          <a href="#visao">visão</a>
          <a href="#fluxo">fluxo</a>
          <a href="#config">config</a>
          <a href="#executar">executar</a>
          <a href="#diagramas">diagramas</a>
          <a href="#autores">autores</a>
          <a
            className="nav__repo"
            href="https://github.com/Andoreatta/escovabits"
            target="_blank"
            rel="noreferrer"
          >
            github ↗
          </a>
        </div>
      </nav>

      <main id="top">
        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="hero">
          <div className="hero__copy">
            <p className="hero__eyebrow">rails 8 · turbo · stimulus · sqlite</p>
            <h1 className="hero__title">
              <LiquidTitle text="EscovaBits" />
            </h1>
            <p className="hero__lede">
              Escreva C++ ou Go. O servidor compila e devolve o assembly —
              filtrado, sem diretivas nem labels mortas. Um Compiler
              Explorer enxuto, com compartilhamento por link.
            </p>
            <div className="hero__cta">
              <a className="btn" href="http://204.216.185.51" target="_blank" rel="noreferrer">acessar o projeto</a>
              <a
                className="btn btn--ghost"
                href="https://github.com/Andoreatta/escovabits"
                target="_blank"
                rel="noreferrer"
              >
                ver o código ↗
              </a>
            </div>
          </div>
          <div className="hero__orb">
            <BitSphere />
          </div>
        </section>

        {/* ── 01 VISÃO ─────────────────────────────────────── */}
        <motion.section id="visao" className="section" {...reveal}>
          <SectionHead n="01" title="Visão geral" />
          <GlassPanel>
            <p>
              Um único controller recebe o código-fonte, monta o comando
              do compilador a partir de um template por linguagem, executa
              num subprocesso com timeout e devolve a saída filtrada por
              Turbo Stream. A tabela <code>snippets</code> guarda
              compartilhamentos; não há contas nem sessão.
            </p>
            <table className="routes">
              <thead>
                <tr><th>método</th><th>caminho</th><th>ação</th></tr>
              </thead>
              <tbody>
                <tr><td><code>GET</code></td><td><code>/</code></td><td>editor</td></tr>
                <tr><td><code>POST</code></td><td><code>/compile</code></td><td>compila e devolve Turbo Stream</td></tr>
                <tr><td><code>POST</code></td><td><code>/share</code></td><td>persiste snippet, devolve <code>{"{ url }"}</code></td></tr>
                <tr><td><code>GET</code></td><td><code>/s/:slug</code></td><td>abre o editor com snippet salvo</td></tr>
                <tr><td><code>GET</code></td><td><code>/hello_world</code></td><td>template inicial por linguagem</td></tr>
              </tbody>
            </table>
          </GlassPanel>
        </motion.section>

        {/* ── 02 FLUXO ─────────────────────────────────────── */}
        <motion.section id="fluxo" className="section" {...reveal}>
          <SectionHead n="02" title="Fluxo de compilação" />
          <GlassPanel>
            <FlowDiagram />
            <ol className="steps">
              <li>O Stimulus faz <strong>debounce de 2,5 s</strong> sobre a digitação e dispara <code>POST /compile</code> com <code>source_code</code>, <code>language</code> e <code>compiler_flags</code>.</li>
              <li>O controller resolve o template via <code>LanguageConfigService.command_for</code>; as flags passam por <code>Shellwords.split</code> antes.</li>
              <li><code>CompilationService</code> grava o código num <code>Tempfile</code>, substitui <code>%{"{file}"}</code>/<code>%{"{outfile}"}</code> e executa com <code>Open3.capture3</code> sob timeout de 10 s. Em sucesso, stdout e stderr são concatenados — o Go emite o assembly em stderr. Em falha, o stderr volta como mensagem de erro.</li>
              <li><code>AssemblyFilterService</code> remove diretivas, comentários e labels não referenciadas, com regras por linguagem.</li>
              <li>O resultado volta num Turbo Stream que atualiza <code>output_frame</code> — sem reload.</li>
            </ol>
          </GlassPanel>

          <GlassPanel className="mt">
            <h3 className="panel-title">Compartilhamento</h3>
            <p>
              <code>POST /share</code> grava <code>slug</code>, <code>source_code</code>,{" "}
              <code>language</code> e <code>compiler_flags</code> na tabela{" "}
              <code>snippets</code>. O slug é <code>SecureRandom.alphanumeric(8)</code>{" "}
              gerado em loop até ser único. <code>GET /s/:slug</code> renderiza o
              editor com os campos preenchidos.
            </p>
          </GlassPanel>
        </motion.section>

        {/* ── 03 CONFIG ────────────────────────────────────── */}
        <motion.section id="config" className="section" {...reveal}>
          <SectionHead n="03" title="Configuração" />
          <GlassPanel>
            <h3 className="panel-title">Adicionar uma linguagem</h3>
            <p>
              Cada linguagem é uma entrada no hash <code>LANGUAGES</code> em{" "}
              <code>app/services/language_config_service.rb</code>:
            </p>
            <CodeBlock
              lang="ruby"
              label="language_config_service.rb"
              code={`"rust" => {
  hello_world: "fn main() { println!(\\"hi\\"); }",
  extension: ".rs",
  needs_outfile: false,
  command: ->(flags) {
    ["rustc", "--emit=asm"] + flags + ["%{file}", "-o", "-"]
  }
}`}
            />
            <ul className="kv">
              <li><code>extension</code><span>sufixo do arquivo temporário.</span></li>
              <li><code>needs_outfile</code><span>se <code>true</code>, cria um segundo <code>Tempfile</code> cujo caminho substitui <code>%{"{outfile}"}</code> (o <code>go build</code> exige <code>-o</code>).</span></li>
              <li><code>command</code><span>lambda que recebe as flags do usuário já separadas e devolve o array do comando.</span></li>
            </ul>
            <p className="warn">
              O binário do compilador precisa estar no <code>PATH</code> do
              processo Rails. Não há allowlist de flags: qualquer flag do
              cliente entra no comando — rode atrás de sandbox ou
              contêiner se isso for exposto.
            </p>
          </GlassPanel>

          <GlassPanel className="mt">
            <h3 className="panel-title">Filtro de assembly</h3>
            <p>
              <code>AssemblyFilterService::FILTERS</code> define, por
              linguagem, as regexes de diretiva, label e comentário, e se
              labels numéricas são descartadas. Para uma linguagem nova,
              adicione uma entrada com a mesma chave do hash{" "}
              <code>LANGUAGES</code>.
            </p>
          </GlassPanel>
        </motion.section>

        {/* ── 04 EXECUTAR ──────────────────────────────────── */}
        <motion.section id="executar" className="section" {...reveal}>
          <SectionHead n="04" title="Executar" />
          <GlassPanel>
            <p>
              Requisitos: Ruby 3.4.x (ver <code>.ruby-version</code>) e{" "}
              <code>g++</code> e/ou <code>go</code> no PATH.
            </p>
            <CodeBlock
              lang="bash"
              label="local"
              code={`bin/setup    # gems, banco SQLite, seeds
bin/dev      # rails server + tailwind (Procfile.dev)
# → http://localhost:3000`}
            />
            <CodeBlock
              lang="bash"
              label="testes"
              code={`bin/rails test`}
            />
            <CodeBlock
              lang="bash"
              label="docker"
              code={`docker build -t escovabits .
docker run -p 3000:80 escovabits

# ou com docker compose
cp .env.example .env      # preencha RAILS_MASTER_KEY e SECRET_KEY_BASE
docker compose up -d --build`}
            />
            <p>
              O <code>Dockerfile</code> instala os compiladores usados
              pelos serviços; <code>Dockerfile.test</code> roda a suíte.
              Produção roda com <code>docker compose</code> na OCI Always
              Free, servindo na porta 80.
            </p>
          </GlassPanel>
        </motion.section>

        {/* ── 05 DIAGRAMAS ─────────────────────────────────── */}
        <motion.section id="diagramas" className="section" {...reveal}>
          <SectionHead n="05" title="Diagramas" />
          <GlassPanel>
            <h3 className="panel-title">Mapa de classes <span className="hint">— passe o cursor num nó</span></h3>
            <ClassMap />
            <p className="caption">
              Três serviços carregam toda a lógica: configuração de
              linguagem, execução do compilador e filtragem da saída. O
              controller só orquestra.
            </p>
          </GlassPanel>

          <div className="diagram-grid mt">
            <GlassPanel>
              <h3 className="panel-title">DER — snippets <span className="hint">— clique para ampliar</span></h3>
              <ZoomableImage
                src={`${BASE}diagrams/der.png`}
                alt="Diagrama entidade-relacionamento da tabela snippets"
              />
            </GlassPanel>
            <GlassPanel>
              <h3 className="panel-title">UML gerado <span className="hint">— clique para ampliar</span></h3>
              <ZoomableImage
                src={`${BASE}diagrams/uml-classes.png`}
                alt="Diagrama de classes UML renderizado"
              />
              <p className="caption">
                Fonte PlantUML em <code>UML_Class_Diagram.md</code> no repositório.
              </p>
            </GlassPanel>
          </div>
        </motion.section>

        {/* ── 06 AUTORES ───────────────────────────────────── */}
        <motion.section id="autores" className="section" {...reveal}>
          <SectionHead n="06" title="Autores" />
          <div className="authors">
            <GlassPanel className="author">
              <img
                className="author__avatar"
                src="https://avatars.githubusercontent.com/u/81370685?v=4"
                alt="Foto de perfil de Leostruka"
                loading="lazy"
              />
              <div className="author__info">
                <span className="author__name">leandro ostruka</span>
                <span className="author__handle">@Leostruka</span>
                <span className="author__role">Líder de desenvolvimento · @FingerTechBR</span>
                <span className="author__loc">Londrina, PR</span>
                <span className="author__links">
                  <a href="https://github.com/Leostruka" target="_blank" rel="noreferrer">github</a>
                  <a href="https://www.linkedin.com/in/leostruka" target="_blank" rel="noreferrer">linkedin</a>
                </span>
              </div>
            </GlassPanel>
            <GlassPanel className="author">
              <img
                className="author__avatar"
                src="https://avatars.githubusercontent.com/u/98922859?v=4"
                alt="Foto de perfil de Andoreatta"
                loading="lazy"
              />
              <div className="author__info">
                <span className="author__name">Andoreatta</span>
                <span className="author__handle">@Andoreatta</span>
                <span className="author__role">Segurança da informação · Contego Security</span>
                <span className="author__loc">Curitiba, PR</span>
                <span className="author__links">
                  <a href="https://github.com/Andoreatta" target="_blank" rel="noreferrer">github</a>
                  <a href="https://www.linkedin.com/in/lucas-andreatta1" target="_blank" rel="noreferrer">linkedin</a>
                </span>
              </div>
            </GlassPanel>
          </div>
        </motion.section>

        <footer className="footer" id="fim">
          <span>escovabits — código para assembly, sem cerimônia.</span>
          <a href="https://github.com/Andoreatta/escovabits" target="_blank" rel="noreferrer">
            github.com/Andoreatta/escovabits ↗
          </a>
        </footer>
      </main>
    </>
  );
}
