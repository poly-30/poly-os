/**
 * Comprehensive QA Verification Script for Issue 18:
 * Audio Engine, Control Center Media & Volume Attenuation
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🧪 Starting Issue 18 Deep-Dive Verification Suite...');
console.log('====================================================\n');

// 1. Mock Web Audio API
class MockAudioParam {
  constructor(initial = 1) {
    this.value = initial;
    this.history = [];
  }
  setValueAtTime(val, time) {
    this.value = val;
    this.history.push({ type: 'set', val, time });
  }
  exponentialRampToValueAtTime(val, time) {
    this.value = val;
    this.history.push({ type: 'ramp', val, time });
  }
}

class MockAudioNode {
  constructor(type = 'node') {
    this.type = type;
    this.connectedTo = [];
    if (type === 'gain') {
      this.gain = new MockAudioParam(1);
    }
    if (type === 'oscillator') {
      this.type = 'sine';
      this.frequency = new MockAudioParam(440);
      this.startedAt = null;
      this.stoppedAt = null;
    }
  }
  connect(target) {
    this.connectedTo.push(target);
  }
  start(time = 0) {
    this.startedAt = time;
  }
  stop(time = 0) {
    this.stoppedAt = time;
  }
}

class MockAnalyserNode extends MockAudioNode {
  constructor() {
    super('analyser');
    this.fftSize = 64;
    this.frequencyBinCount = 32;
  }
  getByteFrequencyData(arr) {
    for (let i = 0; i < arr.length; i++) arr[i] = 128;
  }
}

class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = new MockAudioNode('destination');
  }
  createGain() {
    return new MockAudioNode('gain');
  }
  createOscillator() {
    return new MockAudioNode('oscillator');
  }
  createAnalyser() {
    return new MockAnalyserNode();
  }
  resume() {
    this.state = 'running';
  }
}

// Set up globals
global.window = {
  AudioContext: MockAudioContext,
  webkitAudioContext: MockAudioContext
};

// 2. Extract PolyAudio definition from shell.js
const shellJsPath = path.join(__dirname, 'poly-shell', 'shell.js');
const indexHtmlPath = path.join(__dirname, 'poly-shell', 'index.html');
const shellCode = fs.readFileSync(shellJsPath, 'utf8');
const htmlCode = fs.readFileSync(indexHtmlPath, 'utf8');

// Extract PolyAudio class code using regex
const polyAudioMatch = shellCode.match(/class PolyAudio \{[\s\S]*?\n\}/);
assert(polyAudioMatch, 'PolyAudio class definition must be found in shell.js');
const PolyAudio = eval(`(${polyAudioMatch[0]})`);

// ----------------------------------------------------
// TEST 1: playChime() implementation and Web Audio graph
// ----------------------------------------------------
console.log('Checking Question 1A: playChime() verification...');
{
  const audio = new PolyAudio();
  audio.ensureContext();
  assert(audio.ctx, 'AudioContext must be initialized');
  assert(audio.masterGain, 'masterGain must be initialized');

  let oscCount = 0;
  const originalCreateOsc = audio.ctx.createOscillator.bind(audio.ctx);
  const createdOscs = [];
  audio.ctx.createOscillator = () => {
    oscCount++;
    const osc = originalCreateOsc();
    createdOscs.push(osc);
    return osc;
  };

  audio.playChime();

  assert.strictEqual(oscCount, 3, 'playChime must generate 3 harmonic oscillators (C5, E5, G5)');
  assert.deepStrictEqual(
    createdOscs.map(o => o.frequency.value),
    [523.25, 659.25, 783.99],
    'playChime frequencies must be C5 (523.25), E5 (659.25), and G5 (783.99)'
  );

  createdOscs.forEach((osc, idx) => {
    assert(osc.connectedTo.length > 0, `Oscillator ${idx} must be connected to a gain node`);
    const gainNode = osc.connectedTo[0];
    assert.strictEqual(gainNode.type, 'gain', 'Target node must be gain');
    assert.strictEqual(gainNode.connectedTo[0], audio.masterGain, 'Gain envelope must route to masterGain');
    assert.strictEqual(gainNode.gain.history[0].val, 0.09, 'Initial gain must be 0.09');
    assert.strictEqual(gainNode.gain.history[1].val, 0.0001, 'Ramp target must be 0.0001 (non-zero positive value)');
    assert(osc.stoppedAt > osc.startedAt, 'Oscillator stop must be scheduled after start');
  });
  console.log('✅ Question 1A Passed: playChime() uses clean 3-tone harmonic oscillators, positive gain envelopes, and masterGain routing.');
}

// ----------------------------------------------------
// TEST 2: playPop() implementation and Web Audio graph
// ----------------------------------------------------
console.log('Checking Question 1B: playPop() verification...');
{
  const audio = new PolyAudio();
  audio.ensureContext();

  let oscCreated = null;
  audio.ctx.createOscillator = () => {
    oscCreated = new MockAudioNode('oscillator');
    return oscCreated;
  };

  audio.playPop();

  assert(oscCreated, 'playPop must create an oscillator');
  assert.strictEqual(oscCreated.type, 'sine', 'playPop oscillator should be sine wave');
  assert.strictEqual(oscCreated.frequency.history[0].val, 440, 'playPop start frequency must be 440Hz');
  assert.strictEqual(oscCreated.frequency.history[1].val, 140, 'playPop end frequency must ramp down to 140Hz');
  assert.strictEqual(oscCreated.frequency.history[1].type, 'ramp', 'playPop frequency must exponentially ramp');

  const gainNode = oscCreated.connectedTo[0];
  assert.strictEqual(gainNode.gain.history[0].val, 0.12, 'playPop peak gain must be 0.12');
  assert.strictEqual(gainNode.gain.history[1].val, 0.0001, 'playPop ramp must safely reach 0.0001');
  assert.strictEqual(gainNode.connectedTo[0], audio.masterGain, 'Gain envelope must route to masterGain');
  console.log('✅ Question 1B Passed: playPop() uses clean down-sweeping pitch envelope and exponential decay.');
}

// ----------------------------------------------------
// TEST 3: setVolume() proportional masterGain attenuation
// ----------------------------------------------------
console.log('Checking Question 2: setVolume() proportional scaling...');
{
  const audio = new PolyAudio();
  audio.ensureContext();

  // Test various percentages
  const testCases = [
    { input: 100, expected: 1.0 },
    { input: '70', expected: 0.7 },
    { input: 50, expected: 0.5 },
    { input: 25, expected: 0.25 },
    { input: '0', expected: 0.0 },
    { input: 120, expected: 1.0 }, // clamped max
    { input: -10, expected: 0.0 }, // clamped min
    { input: 'invalid', expected: 0.0 } // NaN fallback
  ];

  for (const tc of testCases) {
    audio.setVolume(tc.input);
    assert.strictEqual(audio.volume, tc.expected, `audio.volume must equal ${tc.expected} for input ${tc.input}`);
    assert.strictEqual(
      audio.masterGain.gain.value,
      tc.expected,
      `masterGain.gain must equal ${tc.expected} for input ${tc.input}`
    );
    assert.strictEqual(
      audio.enabled,
      tc.expected > 0,
      `audio.enabled must reflect if volume > 0`
    );
  }
  console.log('✅ Question 2 Passed: setVolume() performs proportional continuous float attenuation [0.0 - 1.0] on masterGain.');
}

// ----------------------------------------------------
// TEST 4: Control Center Media & Volume UI Wiring
// ----------------------------------------------------
console.log('Checking Question 3: Control Center DOM & Wiring...');
{
  assert(htmlCode.includes('id="play-pause-btn"'), 'index.html must contain #play-pause-btn');
  assert(htmlCode.includes('id="cc-media-prev"'), 'index.html must contain #cc-media-prev');
  assert(htmlCode.includes('id="cc-media-next"'), 'index.html must contain #cc-media-next');
  assert(htmlCode.includes('id="volume-slider"'), 'index.html must contain #volume-slider');
  assert(htmlCode.includes('id="cc-media-title"'), 'index.html must contain #cc-media-title');

  // Verify event wiring in shell.js
  assert(shellCode.includes("const volSlider = document.getElementById('volume-slider')"), 'Shell must find #volume-slider');
  assert(shellCode.includes("volSlider.addEventListener('input', (e) => {"), '#volume-slider must bind continuous "input" event');
  assert(shellCode.includes("polyAudio.setVolume(e.target.value)"), '#volume-slider must pass value to polyAudio.setVolume()');

  assert(shellCode.includes("const ccPlayBtn = document.getElementById('play-pause-btn')"), 'Shell must find #play-pause-btn');
  assert(shellCode.includes("const ccPrevBtn = document.getElementById('cc-media-prev')"), 'Shell must find #cc-media-prev');
  assert(shellCode.includes("const ccNextBtn = document.getElementById('cc-media-next')"), 'Shell must find #cc-media-next');

  assert(shellCode.includes("polyAudio.toggleMusic()"), 'ccPlayBtn must call polyAudio.toggleMusic()');
  assert(shellCode.includes("polyAudio.prevTrack()"), 'ccPrevBtn must call polyAudio.prevTrack()');
  assert(shellCode.includes("polyAudio.nextTrack()"), 'ccNextBtn must call polyAudio.nextTrack()');
  console.log('✅ Question 3 Passed: Control Center buttons and volume slider are fully wired to PolyAudio.');
}

// ----------------------------------------------------
// TEST 5: Music Visualizer Loop Pause & Termination on Close
// ----------------------------------------------------
console.log('Checking Question 4: Music Visualizer Loop Termination...');
{
  // Test the logic of renderVisualizer when window closes or becomes background
  const visualizerSection = shellCode.slice(
    shellCode.indexOf('// Visualizer render loop with auto-pause and disconnect termination'),
    shellCode.indexOf('renderVisualizer();', shellCode.indexOf('// Visualizer render loop with auto-pause')) + 25
  );

  assert(visualizerSection.includes('if (!animActive || !ctx || !canvas || !canvas.isConnected)'), 
    'renderVisualizer must check canvas.isConnected');
  assert(visualizerSection.includes('animActive = false;'), 
    'renderVisualizer must set animActive = false when disconnected');
  assert(visualizerSection.includes('musicWin && (musicWin.isMinimized || musicWin.isBackgroundRunning)'), 
    'renderVisualizer must detect if music window is minimized or background running');
  assert(visualizerSection.includes('setTimeout(() => { if (animActive && canvas.isConnected) requestAnimationFrame(renderVisualizer); }, 300);'), 
    'renderVisualizer must throttle to 300ms idle poll when hidden/minimized instead of 120Hz rAF');

  // Check closeWindow forceQuit behavior
  assert(shellCode.includes("if (appKey === 'music' && window.polyAudio && polyAudio.musicPlaying) {"),
    'closeWindow must check if music is playing and toggle/stop it on forceQuit');

  console.log('✅ Question 4 Passed: Visualizer render loop throttles on background and terminates on disconnect.');
}

console.log('\n====================================================');
console.log('🎉 ALL AUDIO ENGINE & CONTROL CENTER VERIFICATIONS PASSED');
console.log('====================================================\n');
