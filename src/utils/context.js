const DrawingContext = React.createContext();

export function provide (Component) {
  return class extends React.Component {
    constructor (props) {
      super(props)
      this.state = { }
    }
    render () {
      return (
        <DrawingContext.Provider>
          <Component {...this.props} />
        </DrawingContext.Provider>
      )
    }
  }
}

export function consume (Component) {
  return class extends React.Component { 
    render () {
      return (
        <DrawingContext.Provider>
          {
            context => <Component {...context} {...this.props} />
          }
        </DrawingContext.Provider>
      )
    }
  }
}