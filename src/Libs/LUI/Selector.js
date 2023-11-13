import Component from "./Component.js"
import ObjectHelper from "./Helpers/ObjectHelper.js"

export default class Selector extends Component {
  constructor() {
    super()
    this.options = []
  }

  static copyConfig = ObjectHelper.merge(Component.copyConfig, {
    includeProperties: {
      options: true,
    },
  })

  addOption(option) {
    for (let i = 0; ; i++) {
      if (this.options[i] == undefined) {
        this.options[i] = option
        break
      }
    }
    if (this.isBuilt) this.addOptionToContainer(option)
    return this
  }
  createContainer() {
    this.container = document.createElement("select")
    this.container.style.pointerEvents = "all"
    this.container.style.position = "absolute"
  }
  addOptionToContainer(option) {
    let optionContainer = document.createElement("option")
    optionContainer.value = option.value
    optionContainer.innerText = option.text
    this.container.appendChild(optionContainer)
    return this
  }
  refrestOptions() {
    this.container.innerText = ""
    for (let option of this.options) {
      if (option != undefined) {
        this.addOptionToContainer(option)
      }
    }
  }
  removeOptionByValue(value) {
    for (let i = 0; i < this.options.length; i++) {
      if (this.options[i] != undefined && this.options[i].value == value) {
        delete this.options[i]
        this.refrestOptions()
        break
      }
    }
  }
  resize() {
    let pixelSize = this.getPixelSize()
    this.container.style.fontSize = pixelSize.x * this.size.y
    this.container.setSize(this.size.multiply(pixelSize))
    this.container.setPosition(this.position.multiply(pixelSize))
  }
  build() {
    super.build()
    this.refrestOptions()
    this.isBuilt = true
    return this
  }
}
export class Option {
  constructor(value, text) {
    this.value = value
    this.text = text
  }
}
