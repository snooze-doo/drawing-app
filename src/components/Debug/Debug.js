import React, { Component } from 'react'
import { consume } from '../../utils/context'
import './Debug.css'

class Debug extends Component {
  render() {
    const { drawingState: { canvas, tool } } = this.props
    const debug = [
      {
        name: 'Tool',
        value: tool.selected.name
      },
      {
        name: 'Position',
        value: `(${canvas.transform.position.x}, ${canvas.transform.position.y})`
      },
      {
        name: 'Rotation',
        value: `${canvas.transform.rotation}°`
      },
      {
        name: 'Zoom',
        value: `${canvas.transform.scale * 100}%`
      }
    ]
    return (
      <div className='debug'>
        {debug.map((e, i) => (
          <div key={`debug-${i}`} className='debug-element'>{`${e.name.padEnd(10)}: ${e.value}`}</div>
        ))}
      </div>
    );
  }
}

export default consume(Debug)
