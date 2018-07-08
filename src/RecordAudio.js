import React, { Component } from 'react'
import Script from 'react-load-script'

URL = window.URL || window.webkitURL

let gumStream
let recorder
let input
let encodingType
let encodeAfterRecord = true

let AudioContext = window.AudioContext || window.webkitAudioContext
let audioContext = new AudioContext()

class RecordAudio extends Component {
  constructor() {
    super()

    this.state = {
      isRecording: false,
      link: '',
      recordingError: ''
    }

    this.handleStart = this.handleStart.bind(this)
    this.handleScriptLoad = this.handleScriptLoad.bind(this)
    this.handleScriptError = this.handleScriptError.bind(this)
  }

  startRecording() {
    if (!this.state.scriptLoaded || this.state.scriptLoadingError) {
      console.log('Script has not loaded correctly')
    }

    this.setState({ isRecording: true })

    const constraints = { audio: true, video: false }

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(stream => {
        gumStream = stream

        input = audioContext.createMediaStreamSource(stream)

        encodingType = 'mp3'

        recorder = new window.WebAudioRecorder(input, {
          workerDir: 'lib/',
          encoding: encodingType
        })

        recorder.onComplete = (recorder, blob) => {
          this.createDownloadLink(blob, recorder.encoding)
          const audioURL = URL.createObjectURL(blob)
          this.setState({ audioURL })
        }

        recorder.setOptions({
          timeLimit: 180,
          encodeAfterRecord: encodeAfterRecord,
          mp3: { bitRate: 160 }
        })

        recorder.startRecording()
      })
      .catch(recordingError => {
        this.setState({ recordingError }) // replace w onErrorCb
      })
  }

  stopRecording() {
    this.setState({ isRecording: false })
    gumStream.getAudioTracks()[0].stop()

    recorder.finishRecording()
    console.log('Recording stopped')
  }

  createDownloadLink(blob, encoding) {
    const url = URL.createObjectURL(blob)

    let link = `${new Date().toISOString()}.${encoding}`

    this.setState({ link })
  }

  handleStart() {
    this.state.isRecording ? this.stopRecording() : this.startRecording()
  }

  handleScriptLoad() {
    this.setState({ scriptLoaded: true })
  }

  handleScriptError() {
    this.setState({ scriptLoadingError: true })
  }
  render() {
    const renderLink = () => {
      return !this.state.link ? null : (
        <a href={this.state.audioURL} download>
          {this.state.link}
        </a>
      )
    }

    return (
      <div>
        <Script
          url="./lib/WebAudioRecorder.js"
          onLoad={this.handleScriptLoad}
          onError={this.handleScriptError}
        />
        <button onClick={this.handleStart}>
          {this.state.isRecording ? 'Stop' : 'Start'}
        </button>
        <audio
          ref={audio => (this.audio = audio)}
          src={this.state.audioURL}
          controls
        />
        {renderLink()}
      </div>
    )
  }
}

export default RecordAudio
