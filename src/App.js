import React, {
    Component
} from 'react'
import './App.css'
import jsAudio from 'audio'
import Peaks from 'peaks.js'
import bufferFrom from 'audio-buffer-from'
import toWav from 'audiobuffer-to-wav'

var counter = 1
class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            mediaRecorder: null,
            audio: null,
            audioUrl: null,
            peaks: null,
            segments: []
        }
    }
    componentDidMount() {
        // console.log(jsAudio)
    }

    startRecording = () => {
        navigator.mediaDevices.getUserMedia({
            audio: true
        }).then(stream => {
            const mediaRecorder = new MediaRecorder(stream)
            this.setState({
                mediaRecorder
            })
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
                this.setState({
                    audio,
                    audioUrl,
                    audioBlob
                })
            })
        })
    }

    endRecording = () => {
        if (this.state.mediaRecorder) {
            this.state.mediaRecorder.stop()
            this.setState({
                mediaRecorder: null
            })
        }
    }

    trimRecording = () => {
        if (this.state.audioBlob) {
            jsAudio.load(this.state.audioBlob).then((audio) => {
                    audio.trim({ left: true, right: true }).getWav((err, audio) => {
                        const blob = new Blob([audio])
                        const url = URL.createObjectURL(blob)
                        const aud = new Audio(url)
                        this.launchPeaks(aud)
                        this.setState({
                            trimmed: aud
                        })
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
                zoomLevels: [64, 128, 256, 512, 1024, 2048, 4096]
            })

            peaks.on('peaks.ready', () => {
                // console.log(`counter: ${counter++}`)
                this.setState({ peaks })
                window.peaks = peaks
            })
            
            // const peaksInstance = peaks
            // peaksInstance.on('points.mouseenter', function(point) {
            //     console.log('points.mouseenter:', point);
            // });
            // peaksInstance.on('points.mouseleave', function(point) {
            //     console.log('points.mouseleave:', point);
            // });
            // peaksInstance.on('points.dblclick', function(point) {
            //     console.log('points.dblclick:', point);
            // });
            // peaksInstance.on('points.dragstart', function(point) {
            //     console.log('points.dragstart:', point);
            // });
            // peaksInstance.on('points.dragmove', function(point) {
            //     console.log('points.dragmove:', point);
            // });
            // peaksInstance.on('points.dragend', function(point) {
            //     console.log('points.dragend:', point);
            // });
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

    addSection = () => {
        if (this.state.peaks) {
            const currentTime = this.state.peaks.player.getCurrentTime()
            console.log('ct:', currentTime)
            const segmentName = `Segment ${counter}`
            counter++
            
            this.state.peaks.segments.add({
                startTime: currentTime, 
                endTime: currentTime + 1,
                editable: true,
                // color,
                labelText: segmentName,
                id: segmentName
            })

            this.setState({ segments: [...this.state.segments, segmentName] })
        }
    }

    deleteSegment = (segName) => {
        if (this.state.peaks) {
            const segmentsCopy = JSON.parse(JSON.stringify(this.state.segments))
            this.state.peaks.segments.removeById(segName)
            segmentsCopy.splice(this.state.segments.indexOf(segName), 1)
            this.setState({ segments: segmentsCopy })
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
                    <button onClick={() => this.trimRecording()} style={{ margin: 10 }}>AUTO TRIM</button>
                    <button onClick={() => this.addSection()}>ADD SECTION</button>
                </div>
                <div>
                    <p>Delete sections</p>
                    {this.state.segments.map((segName) => {
                        return (
                            <div key={segName}>
                                <h3>{segName}</h3>
                                <button onClick={() => this.deleteSegment(segName)}>DELETE SEGMENT</button>
                            </div>
                        )
                    })}
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
