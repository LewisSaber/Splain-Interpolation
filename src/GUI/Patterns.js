import Component from "../Libs/LUI/Component.js"
import Input from "../Libs/LUI/Input.js"
import Label from "../Libs/LUI/Label.js"

let patterns = {}

patterns.radioInput = {
  create: function (radioName, name, text) {
    let result = new Component().setSize("100%").setFloat("left")
    new Input()
      .setRadioName(radioName)
      .setName(name)
      .setType("radio")
      .setParentRelation("radio")
      .setSize("80h", "80h")
      .setPosition("10h", "10h")
      .attachToParent(result)
    new Label()
      .setText(text)
      .setPosition("120h")
      .setParentRelation("label")
      .setSize("90w", "100%")
      .centerText(false)
      .attachToParent(result)
    return result
  },
}

export default patterns
