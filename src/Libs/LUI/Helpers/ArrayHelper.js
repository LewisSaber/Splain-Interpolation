const ArrayHelper = {
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      let temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }
    return array
  },
  sum(array) {
    let sum = 0
    for (let i = 0; i < array.length; i++) {
      sum += array[i]
    }
    return sum
  },
  toDictionary(array) {
    return (values) => {
      let result = {}
      for (let i = 0; i < array.length; i++) {
        result[array[i]] = values[i]
      }
      return result
    }
  },
  createEmptyArray(width, height) {
    let result = new Array(height)
    for (let i = 0; i < height; i++) {
      result[i] = new Array(width)
    }
    return result
  },
}

export default ArrayHelper
