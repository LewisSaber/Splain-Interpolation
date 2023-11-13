import Component from "./Component.js"
import Input from "./Input.js"

export default class TextField extends Component {
  createHTMLElement() {
    this.container = document.createElement("textarea")
  }

  addListeners() {
    super.addListeners()
    this.container.addEventListener("wheel", (evt) => {
      this.onmousewheel(evt)
    })
  }
  onmousewheel(evt) {
    if (evt.shiftKey) {
      evt.preventDefault()
      const FONT_CHANGE = 0.03
      let sign = evt.deltaY < 0 ? 1 : -1
      let font_size = Math.max(0.25, this.getFontSize() + sign * FONT_CHANGE)
      this.setFontSize(font_size)
    }
  }
  loadText(text) {
    this.container.value = text
  }
  getText() {
    return this.container.value
  }
  clear() {
    this.container.value = ""
    return this
  }
  uploadFile() {
    let loadFileInput = new Input()
      .setType("file")
      .addAttributes({ accept: ".txt" })
    loadFileInput.addEventListener(Input.events.change, () => {
      let reader = new FileReader()
      reader.onload = (event) => {
        this.loadText(event.target.result)
      }
      reader.readAsText(loadFileInput.getFile())
    })
    loadFileInput.build().getContainer().click()
  }

  saveAsTXT(filename) {
    let text = this.getText()
    if (text.length == 0) return
    let blob = new Blob([text], { type: "text/txt" })
    let url = URL.createObjectURL(blob)
    let downloadLink = document.createElement("a")
    downloadLink.href = url
    downloadLink.download = `${filename}.txt`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    return true
  }
}
