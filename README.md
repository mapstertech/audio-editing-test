start with
```bash
npm start
```

for now, you will need to edit the node_module audio as follows:
path: node_modules/audio/src/core.js
```js
// In node_modules/audio/src/core.js add this function getWav())

// return a wav file not for download
Audio.prototype.getWav = function getWav (callback) {
    try {
        let buffer = this.read({format: 'audiobuffer'})

        let wav = toWav(buffer)

        callback && callback(null, wav)

        return this
    } catch(err) {
        callback(err)
    }
}
```
