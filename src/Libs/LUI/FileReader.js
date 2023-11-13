import Button from "./Button.js"
import Component from "./Component.js"
import EventHandler from "./EventHandler.js"
import Input from "./Input.js"

export default class MyFileReader extends EventHandler {
  static events = {
    load: "load",
  }
  constructor() {
    super()
    this.input = new Input()
      .setType("file")
      .addAttributes({ accept: ".txt" })
      .build()
    this.button = new Button()

    this.input.addEventListener(Input.events.change, () => {
      let reader = new FileReader()

      reader.onload = (event) => {
        this.dispatchEvent(MyFileReader.events.load, event.target.result)
      }
      reader.readAsText(this.input.getFile())
    })
    this.button.addEventListener(Component.events.mousedown, () => {
      this.input.getContainer().click()
    })
  }
  setFilesAccept(files) {
    this.input.addAttributes({ accept: files })
  }

  getButton() {
    return this.button
  }
}
