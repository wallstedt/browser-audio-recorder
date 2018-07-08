import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import RecordAudio from './RecordAudio';

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>Browser audio recorder</h1>
        <RecordAudio />
      </div>
    );
  }
}

export default App;
