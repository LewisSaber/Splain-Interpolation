const StringHelper = {
  color(string, color) {
    let elem = document.createElement("span")
    elem.style.color = color
    elem.innerHTML = string
    return elem.outerHTML
  },

  capitalize(string) {
    return string[0].toUpperCase() + string.substring(1)
  },
}

export default StringHelper
