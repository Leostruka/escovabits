import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["source", "output", "languageSelect", "countdown", "sourceLineNumbers", "outputLineNumbers", "compilerFlags", "shareButton"]

  connect() {
    this.compileTimeout = null
    this.countdownInterval = null
    this.updateLineNumbers(this.sourceTarget, this.sourceLineNumbersTarget)
    this.initializeOutputObserver()
  }

  disconnect() {
    clearTimeout(this.compileTimeout)
    clearInterval(this.countdownInterval)
    if (this.outputObserver) {
      this.outputObserver.disconnect()
    }
  }

  // Ação acionada pela digitação do usuário
  startDebouncedCompile() {
    this.updateLineNumbers(this.sourceTarget, this.sourceLineNumbersTarget)
    clearTimeout(this.compileTimeout)
    clearInterval(this.countdownInterval)

    let countdown = 2.5
    this.countdownInterval = setInterval(() => {
      this.countdownTarget.textContent = `(compilando em ${countdown.toFixed(1)}s)`
      countdown -= 0.1
      if (countdown < 0) {
        clearInterval(this.countdownInterval)
        this.countdownTarget.textContent = ""
      }
    }, 100)

    this.compileTimeout = setTimeout(() => this.compile(), 2500)
  }

  compile() {
    clearTimeout(this.compileTimeout)
    clearInterval(this.countdownInterval)
    this.countdownTarget.textContent = ""

    // Pausa o observer para não detectar a nossa própria mudança de "Compilando..."
    if (this.outputObserver) this.outputObserver.disconnect()

    this.outputTarget.innerHTML = `<pre class="absolute top-0 left-0 h-full w-10 p-2 text-right text-zinc-600 bg-black/30 select-none overflow-hidden flex flex-col font-mono text-sm leading-6" data-compiler-target="outputLineNumbers">1</pre><pre class="w-full h-full font-mono text-sm leading-6 p-2 pl-12 overflow-auto text-zinc-500" data-action="scroll->compiler#syncScroll">Compilando...</pre>`
    this.element.requestSubmit()

    // Retoma o observer para aguardar a resposta do Turbo Stream
    this.initializeOutputObserver()
  }

  async changeLanguage() {
    this.compilerFlagsTarget.value = ""
    const language = this.languageSelectTarget.value
    const response = await fetch(`/hello_world?language=${language}`)
    this.sourceTarget.value = await response.text()
    this.updateLineNumbers(this.sourceTarget, this.sourceLineNumbersTarget)
    this.compile()
  }

  copyOutput(event) {
    const outputPre = this.outputTarget.querySelector('[data-action*="scroll->compiler#syncScroll"]')
    if (outputPre) {
      navigator.clipboard.writeText(outputPre.textContent)
      const button = event.currentTarget
      const originalText = button.textContent
      button.textContent = "Copiado!"
      setTimeout(() => { button.textContent = originalText }, 2000)
    }
  }

  async shareCode(event) {
    const originalText = this.shareButtonTarget.textContent
    this.shareButtonTarget.textContent = "Salvando..."
    this.shareButtonTarget.disabled = true

    try {
      const formData = new FormData()
      formData.append("source_code", this.sourceTarget.value)
      formData.append("language", this.languageSelectTarget.value)
      formData.append("compiler_flags", this.compilerFlagsTarget.value)
      
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content

      const response = await fetch("/share", {
        method: "POST",
        headers: {
          "X-CSRF-Token": csrfToken
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        const fullUrl = window.location.origin + data.url
        await navigator.clipboard.writeText(fullUrl)
        window.history.pushState({}, "", data.url)
        this.shareButtonTarget.textContent = "Link Copiado!"
      } else {
        this.shareButtonTarget.textContent = "Erro!"
      }
    } catch (e) {
      console.error("Erro ao compartilhar:", e)
      this.shareButtonTarget.textContent = "Erro!"
    } finally {
      setTimeout(() => {
        this.shareButtonTarget.textContent = "Compartilhar"
        this.shareButtonTarget.disabled = false
      }, 3000)
    }
  }

  updateLineNumbers(codeElement, lineNumbersElement) {
    const content = codeElement.tagName === 'TEXTAREA' ? codeElement.value : codeElement.textContent;
    const lineCount = (content.match(/\n/g) || []).length + 1;
    
    if (lineNumbersElement.childElementCount === lineCount) return;

    // Usar spans em vez de texto puro com \n melhora o alinhamento e a performance.
    lineNumbersElement.innerHTML = Array.from({ length: lineCount }, (_, i) => `<span>${i + 1}</span>`).join('');
  }

  syncScroll(event) {
    const codeElement = event.target
    const lineNumbersElement = codeElement.previousElementSibling
    if (lineNumbersElement) {
      lineNumbersElement.scrollTop = codeElement.scrollTop
    }
  }

  // Observa o 'outputTarget' para quando o Turbo Stream atualizar seu conteúdo
  initializeOutputObserver() {
    this.outputObserver = new MutationObserver(() => {
      this.onOutputUpdate()
    })

    this.outputObserver.observe(this.outputTarget, { childList: true })
  }

  // Chamado quando o conteúdo do output é atualizado pelo observer
  onOutputUpdate() {
    const outputPre = this.outputTarget.querySelector('[data-compiler-output-code]')
    if (outputPre && this.hasOutputLineNumbersTarget) {
      this.updateLineNumbers(outputPre, this.outputLineNumbersTarget)
      this.syncScroll({ target: outputPre })
    }
  }
}