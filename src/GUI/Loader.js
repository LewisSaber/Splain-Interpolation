import BackGround from "../Libs/LUI/Background.js"
import Button from "../Libs/LUI/Button.js"
import Component from "../Libs/LUI/Component.js"
import Form from "../Libs/LUI/Form.js"
import Input from "../Libs/LUI/Input.js"
import Label from "../Libs/LUI/Label.js"
import MainComponent from "../Libs/LUI/MainComponent.js"
import patterns from "./Patterns.js"

export default function loadComponents() {
  new MainComponent(20)
    .setDecoration({ "font-family": "arial" })
    .addComponent(
      new BackGround()
        .setImg("../Images/Background.jpg")
        .setSize("100%", "100%")
    )
  let inputForm = new Form()
    .setName("Input")
    .setDecoration({
      "background-color": "lightgray",
      border: "inset 10px lightblue",
    })
    .setSize("10", 12)
    .setFontSize(1)
    .setFloat("left")
    .setMargin(0.5, 1, 0.5, 1)
    .addComponent(
      new Label().setText("Формула").setSize("100%", 1).setFloat("left")
    )
    .addInput(
      new Input()
        .setName("Formula")
        .setFloat("left")
        .setSize("80%", 1)
        .setMargin(0, 0.5, "10%"),
      true,
      "none",
      false
    )
    .addComponent(
      new Label()
        .setText("Інтервал:")
        .centerText()
        .setFloat("left")
        .setSize("100%", 1)
    )
    .addInput(
      new Input()
        .setName("a")
        .setType("number")
        .setFloat("left")
        .setSize("20%", 1)
        .setMargin(0, 0, "20%"),
      true,
      "none",
      false
    )
    .addComponent(
      new Label().setText("-").centerText().setFloat("left").setSize("20%", 1)
    )
    .addInput(
      new Input()
        .setName("b")
        .setType("number")
        .setFloat("left")
        .setSize("20%", 1),
      true,
      "none",
      false
    )
    .addComponent(
      new Label()
        .setText("n:")
        .centerText()
        .setFloat("left")
        .setSize("20%", 1)
        .setMargin(0.5, 0, "30%")
    )
    .addInput(
      new Input()
        .setName("n")
        .setType("number")
        .setFloat("left")
        .setSize("20%", 1)
        .setMargin(0.5),
      true,
      "none",
      false
    )
    .addComponent(
      new Button()
        .setText("DO IT", 0.9)
        .setSize("60%", 1)
        .setMargin(0.5, 0, "20%")
        .setFloat("left")
        .setName("DO IT")
    )
    .attachToParent(new MainComponent())

  new Component()
    .setSize(22, 15.5)
    .setDecoration({
      "background-color": "lightgray",
      border: "inset 10px lightblue",
    })
    .setMargin(0.5, 1, 0.5, 1)
    .setFloat("left")
    .setName("grapthDisplay")
    .attachToParent(new MainComponent())

  new Component()
    .setName("PointsDisplay")
    .setSize(inputForm.size.x, 4)
    .setFloat("left")
    .setDecoration({
      "background-color": "lightgray",
      border: "inset 10px lightblue",
    })
    .setMargin(0.5, 1, 0.5, 1)
    .addComponent(
      new Label().setSize("100%", 1).setText("Вузли Інтерполяції").centerText()
    )
    .setFontSize(1)
    .attachToParent(new MainComponent())
}
