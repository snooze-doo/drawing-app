import React, { Component } from 'react';
import { provide } from "./utils/context";
import AppCanvas from './components/AppCanvas/AppCanvas'
import Debug from './components/Debug/Debug'
import './TestApp.css';
import Info from './components/Info/Info';

class TestApp extends Component {
  render() {
    return (
      <div ref='app' className='app'>
        <Info />
        <Debug />
        <AppCanvas />
      </div>
    );
  }
}

export default provide(TestApp)
