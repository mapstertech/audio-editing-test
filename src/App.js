import React, { Component } from 'react'
import './App.css'
import jsAudio from 'audio'
import Peaks from 'peaks.js'
import bufferFrom from 'audio-buffer-from'
import toWav from 'audiobuffer-to-wav'

var counter = 0
class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            mediaRecorder: null,
            audio: null,
            audioUrl: null,
            peaks: null
        }
    }
    componentDidMount() {
        // console.log(jsAudio)
    }

    startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const mediaRecorder = new MediaRecorder(stream)
            this.setState({ mediaRecorder })
            mediaRecorder.start()

            const audioChunks = []
            mediaRecorder.addEventListener('dataavailable', event => {
                console.log('event', event)
                audioChunks.push(event.data)
            })

            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks)
                const audioUrl = URL.createObjectURL(audioBlob)
                const audio = new Audio(audioUrl)

                console.log({
                    audioBlob,
                    audioUrl,
                    audio
                })

                // audio.play()
                this.launchPeaks(audio)
                this.setState({ audio, audioUrl, audioBlob })
            })
        })
    }

    endRecording = () => {
        if (this.state.mediaRecorder) {
            this.state.mediaRecorder.stop()
            this.setState({ mediaRecorder: null })
        }
    }

    trimRecording = () => {
        if (this.state.audioBlob) {
            jsAudio.load(this.state.audioBlob).then((audio) => {
                console.log('pretrim:',audio)
                // audio.trim({ left: true, right: true }).save('trimmed.mp3')
                audio.trim({ left: true, right: true }).save('trimmed.wav', (err, audio) => {

                    const blob = new Blob([audio])
                    const url = URL.createObjectURL(blob)
                    const aud = new Audio(url)

                    this.launchPeaks(aud)
                    this.setState({ trimmed: aud })
                })

            })
            .catch((err) => console.log(err))
        } else {
            console.log('no audio')
        }
    }

    launchPeaks = (audio) => {
        console.log('launching peaks calld')
        console.log('AUDIO:', audio)
        if (audio) {
            const peaks = new Peaks.init({
                container: document.querySelector('#peaks-container'),
                mediaElement: audio,
                audioContext: new AudioContext(),
                zoomLevels:  [64, 128, 256, 512, 1024, 2048, 4096]
            })

            peaks.on('peaks.ready', () => {
                console.log(`counter: ${counter++}`)
                this.setState({ peaks })
            })               
        }
    }

    playPeak = () => {
        if (this.state.peaks) {
            this.state.peaks.player.play()
        }
    }

    stopPeak = () => {
        if (this.state.peaks) {
            this.state.peaks.player.pause()            
        }
    }

    playLongRecording = () => {
        if (this.state.audio) {
            this.state.audio.play()
        }
    }

    render() {
        return (
            <div className="App">
                <p>AUDIO MVP DITI</p>
                <div id="peaks-container" style={{ height: '66vh' }}>
                </div>
                <div id="peaks-controller">
                    <button onClick={() => this.playPeak()} style={{ margin: 10 }}>PLAY</button>
                    <button onClick={() => this.stopPeak()} style={{ margin: 10 }}>STOP</button>
                    <button onClick={() => this.trimRecording()} style={{ margin: 10 }}>TRIM</button>
                </div>
                <div style={{ margin: 20 }}>
                    <div onClick={() => this.startRecording()} style={{ margin: 20 }}>
                        <button>START RECORDING</button>
                    </div>
                    <div onClick={() => this.endRecording()} style={{ margin: 20 }}>
                        <button>END RECORDING</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default App
