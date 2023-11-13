import Component from "./Component.js"
import ObjectHelper from "./Helpers/ObjectHelper.js"
import Input from "./Input.js"

export default class Form extends Component {
  static events = {
    emptyRequirement: "emptyRequirement",
  }
  constructor(inputs = []) {
    super()
    this.inputs = {}
    this.addInputs(inputs)
  }
  addInputs(inputs, required = false) {
    for (let input of inputs) {
      this.addInput(input, underfined.underfined, required)
    }
    return this
  }

  copy(toCopy = {}) {
    let copy = super.copy(toCopy)
    let inputs = Object.keys(this.inputs)
    for (const key of inputs) {
      let component = copy.getComponentByName(key)
      if (component instanceof Input) {
        component.removeEventListener(
          Component.events.nameChange,
          component.options.informational.form_input_namechange_listener_id
        )
        copy.addInput(
          component,
          false,
          undefined,
          component.options.informational.isRequired
        )
        delete inputs[key]
        // } else {
        //   console.warn(
        //     `No input for data ${key} found when copying from ${copy.getName()}`
        //   )
      }
    }

    return copy
  }

  addInput(input, shouldAttach = true, channel = "none", isRequired = false) {
    if (typeof input == "number") {
      input = input.toString()
    }
    if (typeof input == "string") {
      let inputComponent = new Input().setName(input).setSize(2, 0.5)
      inputComponent.attachToParent(this, channel)

      if (this.inputs[input]) {
        console.warn("Tried to Make duplicate input with name", input)
        return this
      }
      this.inputs[input] = inputComponent
      inputComponent.form = this
      inputComponent.options.informational.isRequired = isRequired
      inputComponent.options.informational.form_input_namechange_listener_id =
        inputComponent.addEventListener(
          Component.events.nameChange,
          (evt) => {
            delete this.inputs[evt.from]
            this.inputs[evt.to] = inputComponent
          },
          undefined,
          { return_id: true }
        )
    } else if (input instanceof Input) {
      let name = input.getName()

      if (this.inputs[name]) {
        console.warn("Tried to Make duplicate input with name", name)
        return this
      }
      this.inputs[name] = input
      input.options.informational.isRequired = isRequired
      input.form = this
      input.options.informational.form_input_namechange_listener_id =
        input.addEventListener(
          Component.events.nameChange,
          (evt) => {
            delete this.inputs[evt.from]
            this.inputs[evt.to] = input
          },
          undefined,
          { return_id: true }
        )
      if (shouldAttach) {
        if (input.hasParent()) {
          input.detachFromParent()
        }
        this.addComponent(input, channel)
      }
    }
    return this
  }

  getData(skipRequirements = false) {
    let data = {}
    let failedList = []
    for (let input in this.inputs) {
      data[input] = this.inputs[input].getValue(false)
      if (
        data[input] == "" &&
        this.inputs[input].options.informational.isRequired &&
        !skipRequirements
      ) {
        this.inputs[input].dispatchEvent(Form.events.emptyRequirement)
        failedList.push(this.inputs[input])
      }
    }
    if (failedList.length > 0) {
      this.dispatchEvent(Form.events.emptyRequirement, { list: failedList })
      return false
    }
    return data
  }

  getInput(name) {
    return ObjectHelper.get(this.inputs, name, undefined)
  }

  fill(data, empty_missing = true) {
    for (const key in this.inputs) {
      if (data[key]) this.inputs[key].setValue(data[key])
      else if (empty_missing) this.inputs[key].setValue("")
    }
  }

  removeComponent(component, triggerRefloat) {
    this.removeInput(component)
    super.removeComponent(component, triggerRefloat)
    return this
  }

  removeInput(component) {
    if (
      ObjectHelper.get(this.inputs, component.getName()) &&
      ObjectHelper.get(this.inputs, component.getName()).getId() ==
        component.getId()
    ) {
      component.removeEventListener(
        Component.events.nameChange,
        component.options.informational.form_input_namechange_listener_id
      )

      delete component.form
      delete component.options.informational.form_input_namechange_listener_id
      delete component.options.informational.isRequired
      delete this.inputs[component.getName()]
    }
  }
}
