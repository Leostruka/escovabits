import { Controller } from "@hotwired/stimulus"

// Custom dropdown that syncs a hidden native <select> (the compiler-target + change action live there).
export default class extends Controller {
  static targets = ["button", "menu", "label", "option"]
  static values = { open: Boolean }

  connect() {
    this.openValue = false
    this.close = this.close.bind(this)
  }

  toggle() {
    this.openValue ? this.close() : this.open()
  }

  open() {
    this.openValue = true
    this.menuTarget.style.display = "block"
    this.buttonTarget.setAttribute("aria-expanded", "true")
    document.addEventListener("click", this.close)
  }

  close(event) {
    if (event && this.element.contains(event.target)) return
    this.openValue = false
    this.menuTarget.style.display = "none"
    this.buttonTarget.setAttribute("aria-expanded", "false")
    document.removeEventListener("click", this.close)
  }

  choose(event) {
    event.stopPropagation()
    const option = event.currentTarget
    const value = option.dataset.value
    const text = option.textContent.trim()

    this.optionTargets.forEach((li) => {
      li.classList.toggle("text-teal-300", li.dataset.value === value)
    })

    const select = this.element.closest("[data-testid='toolbar']").querySelector("select")
    select.value = value
    this.labelTarget.textContent = text

    select.dispatchEvent(new Event("change", { bubbles: true }))
    this.close()
  }
}
