export function tone(context: AudioContext, frequency: number, duration: number, volume = .12, type: OscillatorType = 'sine', when = context.currentTime) {
  const oscillator = context.createOscillator(), gain = context.createGain()
  oscillator.type = type; oscillator.frequency.setValueAtTime(frequency,when)
  gain.gain.setValueAtTime(0,when); gain.gain.linearRampToValueAtTime(volume,when+.02); gain.gain.exponentialRampToValueAtTime(.0001,when+duration)
  oscillator.connect(gain); gain.connect(context.destination); oscillator.start(when); oscillator.stop(when+duration+.02)
}
export function gunshot(context:AudioContext){
  const buffer=context.createBuffer(1,Math.floor(context.sampleRate*.1),context.sampleRate),samples=buffer.getChannelData(0)
  for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*Math.pow(1-i/samples.length,2)
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain()
  source.buffer=buffer;filter.type='lowpass';filter.frequency.value=1800;gain.gain.value=.18
  source.connect(filter);filter.connect(gain);gain.connect(context.destination);source.start();tone(context,65,.08,.09,'triangle')
}
