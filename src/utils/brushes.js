class Brush {
  constructor(
    name = 'Totally Normal Brush', 
    src = 'brush.png', 
    maxSize = 50, 
    minSize = 1, 
    maxAlpha = 1, 
    minAlpha = 0, 
    sizePressure = true, 
    alphaPressure = true) {
      this.name = name
      this.src = src
      this.maxSize = maxSize
      this.minSize = minSize
      this.maxAlpha = maxAlpha
      this.minAlpha = minAlpha
      this.sizePressure = sizePressure
      this.alphaPressure = alphaPressure
  }

  Image = () => {
    let image = new Image()
    image.src = this.src
  }

  

}