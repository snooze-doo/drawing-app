import React, { Component } from 'react'
import { consume } from '../../utils/context'
import './Debug.css'

class Debug extends Component {
  render() {
    const { drawingState: { transform, tool } } = this.props
    const debug = [
      {
        name: 'Selected Tool',
        value: tool.selected.name
      },
      {
        name: 'Temporal Tool',
        value: tool.temporal.name
      },
      {
        name: 'Position',
        value: `(${transform.position.x}, ${transform.position.y})`
      },
      {
        name: 'Rotation',
        value: `${transform.rotation}°`
      },
      {
        name: 'Zoom',
        value: `${transform.scale * 100}%`
      }
    ]
    return (
      <div className='debug'>
        {debug.map((e, i) => (
          <div key={`debug-${i}`} className='debug-element'>{`${e.name}: ${e.value}`}</div>
        ))}
      </div>
    );
  }
}

export default consume(Debug)
