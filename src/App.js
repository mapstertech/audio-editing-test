import React, { Component } from 'react'
import './App.css'
import jsAudio from 'audio'

class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            mediaRecorder: null,
            audio: null,
            audioUrl: null
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

                audio.play()
                this.setState({ audio })
                this.setState({ audioUrl })
                this.setState({ audioBlob })
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
        let trimmed = null
        if (this.state.audioBlob) {
            jsAudio.load(this.state.audioBlob).then((audio) => {
                console.log(audio)
                audio.trim({ left: true, right: true }).save('trimmed.mp3')
                this.setState({ trimmed: audio.trim({ left: true, right: true }) })

                this.state.trimmed.play()
            })
            .catch((err) => console.log(err))
        } else {
            console.log('no audio')
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
                <div onClick={() => this.startRecording()}>
                    <button>START RECORDING</button>
                </div>
                <div onClick={() => this.endRecording()}>
                    <button>END RECORDING</button>
                </div>
                <div onClick={() => this.trimRecording()}>
                    <button>TRIM RECORDING</button>
                </div>
                <div onClick={() => this.playLongRecording()}>
                    <button>PLAY LONG RECORDING RECORDING</button>
                </div>
            </div>
        )
    }
}

export default App
