import React, { Component } from 'react'
import { ToolsArray } from '../../utils/tools'
import { KEY_NAMES } from '../../utils/keyevents'
import { consume } from '../../utils/context'
import './Info.css'

class Info extends Component {
  constructor(props){
    super(props)
    this.state = {
      hidden: false
    }
    this.toggleHidden = this.toggleHidden.bind(this)
  }

  componentWillMount = () => {
    let hidden = localStorage.getItem('info_hidden')
    if (hidden !== null) this.setState({ hidden })
  }

  toggleHidden = () => {
    let { hidden } = this.state
    hidden = !hidden
    this.setState({ hidden },
      localStorage.setItem('info_hidden', hidden)
    )
  }

  render() {
    let { hidden } = this.state
    let info = [
      `It's mostly SAI rules.`
    ]
    let tooltips = ToolsArray.filter(e => e.key !== null).map(e => {
      return `${e.name.padEnd(10, ' ')} [${KEY_NAMES[e.key]}]`
    })
    let temp_tooltips = ToolsArray.filter(e => e.tmp_key !== null).map(e => {
      return `${e.name.padEnd(10, ' ')} [${e.tmp_key.map(k => KEY_NAMES[k]).join(' + ')}]`
    })
    info = info
      .concat(``)
      .concat(`Tools`)
      .concat(tooltips)
      .concat(` `)
      .concat(`Temp Tools`)
      .concat(temp_tooltips)
    return (
      <div className='info'>
        <div
          style={{ maxHeight: hidden ? '0px' : `${info.length * 35}px` }}
          className='info-container'
        >
          {info.map((e, i) => <pre key={`tip-${i}`} className='info-element'>{e}</pre>)}
        </div>
        <div className='info-hide' onClick={this.toggleHidden}>{`${hidden ? 'Show Info' : 'Collapse'}`}</div>
      </div>
    );
  }
}

export default consume(Info)
