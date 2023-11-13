import Component from "./Component.js"

export default class Input extends Component {
  static events = {
    placeholderChange: "placeholderChange",
    change: "change",
    blur: "blur",
    input: "input",
  }
  constructor() {
    super()
    this.type = "text"
    this.radioName = undefined
  }
  createHTMLElement() {
    this.container = document.createElement("input")
    this.container.type = this.type
    this.container.innerHTML = ""
  }

  setPlaceHolder(text) {
    if (this.isBuilt) {
      this.dispatchEvent(Input.events.placeholderChange, { text })
      this.container.placeholder = text
    } else
      this.addEventListener(
        Component.events.build,
        (_, target) => {
          target.setPlaceHolder(text)
        },
        undefined,
        { once: true }
      )
    return this
  }

  setRadioName(name) {
    if (this.isBuilt) {
      this.radioName = name
      this.applyRadioName()
    } else {
      this.addEventListener(
        Component.events.build,
        () => this.setRadioName(name),
        undefined,
        { once: true }
      )
    }
    return this
  }

  setType(type) {
    this.type = type
    if (this.isBuilt) {
      this.container.type = this.type
    }
    return this
  }
  onchange(evt) {
    this.dispatchEvent(Input.events.change, evt)
  }
  onblur(evt) {
    this.dispatchEvent(Input.events.blur, evt)
  }
  oninput(evt) {
    this.dispatchEvent(Input.events.input, evt)
  }
  focus() {
    this.container.focus()
  }
  addListeners() {
    super.addListeners()
    this.container.addEventListener("change", (evt) => {
      this.onchange(evt)
    })
    this.container.addEventListener("blur", (evt) => {
      this.onblur(evt)
    })
    this.container.addEventListener("input", (evt) => {
      this.oninput(evt)
    })
  }

  applyRadioName() {
    this.container.name = this.radioName
  }

  getFile() {
    if (this.isBuilt)
      if (this.type == "file") {
        return this.container.files[0]
      }
    return false
  }
  getValue(placeholder = true) {
    if (this.isBuilt) {
      switch (this.type) {
        case "radio":
        case "checkbox":
          return this.container.checked
        case "number":
          return (
            +this.container.value ||
            (placeholder ? +this.container.placeholder : 0)
          )
        default:
          return (
            this.container.value ||
            (placeholder ? this.container.placeholder : "")
          )
      }
    }
    return ""
  }
  setValue(value, triggerInput = true) {
    if (this.isBuilt) {
      switch (this.type) {
        case "radio":
        case "checkbox":
          this.container.checked = value
          break
        default:
          this.container.value = value
          break
      }

      if (triggerInput) this.dispatchEvent(Input.events.input)
    } else {
      this.addEventListener(
        Component.events.build,
        () => this.setValue(value, triggerInput),
        undefined,
        { once: true }
      )
    }
    return this
  }
}
