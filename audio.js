// Web Audio API Sound Generator, Real Music Engine & Auto-Repeat VAD Engine
class AngelaAudioEngine {
    constructor() {
        this.ctx = null;
        this.stream = null;
        this.sourceNode = null;
        this.scriptNode = null;
        this.analyser = null;

        // Auto Repeat VAD state
        this.isAutoRepeatActive = false;
        this.isSpeakingUser = false;
        this.isAngelaPlaying = false;
        this.silenceStartTime = 0;
        this.speechChunks = [];
        this.sampleRate = 44100;
        this.silenceThreshold = 0.025; // Volume threshold for speech detection
        this.silenceRequiredMs = 1500; // User specified: 1.5s stop/pause to trigger auto repeat
        this.minSpeechDurationMs = 400; // Must have at least 0.4s speech
        this.speechStartTime = 0;
        this.currentPitch = 1.65; // High pitch cat voice

        // Callbacks
        this.onVADStateChange = null; // (state: 'listening' | 'recording' | 'repeating') => void

        // Music playback tracking
        this.activeMusicTimers = [];
        this.isMusicPlaying = false;
    }

    initContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
                this.sampleRate = this.ctx.sampleRate || 44100;
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Play synthesized meow sound
    playMeow(pitchMultiplier = 1) {
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        const baseFreq = 520 * pitchMultiplier;
        osc.frequency.setValueAtTime(baseFreq * 0.7, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.45);
        
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.28, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.52);
    }

    // Play cute purring sound
    playPurr() {
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.8;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.ctx.sampleRate;
            const modulation = Math.sin(2 * Math.PI * 25 * t);
            data[i] = (Math.random() * 2 - 1) * 0.15 * (1 + 0.8 * modulation);
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(160, now);
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        noise.start(now);
    }

    // Cute giggle sound
    playGiggle() {
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [0, 0.12, 0.24, 0.36].forEach((delay, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const f = 750 + idx * 90;
            osc.frequency.setValueAtTime(f, now + delay);
            osc.frequency.exponentialRampToValueAtTime(f + 250, now + delay + 0.08);
            
            gain.gain.setValueAtTime(0.01, now + delay);
            gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.11);
        });
    }

    // Play cute "Uhh don't touch me" grumpy pop
    playAnnoyedSound() {
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.32);
        
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    // Eating munching sound
    playMunch() {
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [0, 0.15, 0.3].forEach((delay) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(350, now + delay);
            osc.frequency.exponentialRampToValueAtTime(120, now + delay + 0.09);
            
            gain.gain.setValueAtTime(0.25, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.11);
        });
    }

    // Sparkle chime
    playSparkle() {
        this.initContext();
        if (!this.ctx) return;
        const freqs = [880, 1174.66, 1318.51, 1567.98, 1760, 2093];
        const now = this.ctx.currentTime;
        freqs.forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + idx * 0.06);
            gain.gain.setValueAtTime(0.12, now + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.36);
        });
    }

    // ==========================================
    // AUTO REPEAT ENGINE (VAD WITH 1.5s SILENCE)
    // ==========================================
    async startAutoRepeat(onStateChange, onRepeatCallback) {
        this.initContext();
        this.onVADStateChange = onStateChange;
        this.onRepeatCallback = onRepeatCallback;

        if (this.stream) {
            this.isAutoRepeatActive = true;
            if (this.onVADStateChange) this.onVADStateChange('listening');
            return true;
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            this.sourceNode = this.ctx.createMediaStreamSource(this.stream);
            this.analyser = this.ctx.createAnalyser();
            this.analyser.fftSize = 512;

            // ScriptProcessor for real-time PCM capture
            this.scriptNode = this.ctx.createScriptProcessor(2048, 1, 1);
            
            this.sourceNode.connect(this.analyser);
            this.analyser.connect(this.scriptNode);
            // Connect to destination via zero-gain to keep processing active
            const silentGain = this.ctx.createGain();
            silentGain.gain.value = 0;
            this.scriptNode.connect(silentGain);
            silentGain.connect(this.ctx.destination);

            this.scriptNode.onaudioprocess = (e) => this.processAudioStream(e);

            this.isAutoRepeatActive = true;
            if (this.onVADStateChange) this.onVADStateChange('listening');
            return true;
        } catch (err) {
            console.error("Auto repeat mic permission failed", err);
            return false;
        }
    }

    stopAutoRepeat() {
        this.isAutoRepeatActive = false;
        this.isSpeakingUser = false;
        this.speechChunks = [];
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.sourceNode) {
            try { this.sourceNode.disconnect(); } catch (e) {}
            this.sourceNode = null;
        }
        if (this.scriptNode) {
            try { this.scriptNode.disconnect(); } catch (e) {}
            this.scriptNode = null;
        }
        if (this.onVADStateChange) this.onVADStateChange('idle');
    }

    processAudioStream(e) {
        if (!this.isAutoRepeatActive || this.isAngelaPlaying) return;

        const inputData = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        const now = Date.now();

        if (rms > this.silenceThreshold) {
            // User is speaking!
            if (!this.isSpeakingUser) {
                this.isSpeakingUser = true;
                this.speechStartTime = now;
                this.speechChunks = [];
                if (this.onVADStateChange) this.onVADStateChange('recording');
            }
            this.silenceStartTime = 0;
            // Buffer the audio
            this.speechChunks.push(new Float32Array(inputData));
        } else {
            // Silence detected
            if (this.isSpeakingUser) {
                // Keep buffering during brief pause
                this.speechChunks.push(new Float32Array(inputData));

                if (!this.silenceStartTime) {
                    this.silenceStartTime = now;
                } else if (now - this.silenceStartTime >= this.silenceRequiredMs) {
                    // SILENCE FOR 1.5 SECONDS REACHED!
                    const speechDuration = now - this.speechStartTime;
                    this.isSpeakingUser = false;
                    this.silenceStartTime = 0;

                    if (speechDuration >= this.minSpeechDurationMs && this.speechChunks.length > 0) {
                        this.triggerAutoPlayback();
                    } else {
                        this.speechChunks = [];
                        if (this.onVADStateChange) this.onVADStateChange('listening');
                    }
                }
            }
        }
    }

    triggerAutoPlayback() {
        if (this.isAngelaPlaying) return;
        this.isAngelaPlaying = true;
        if (this.onVADStateChange) this.onVADStateChange('repeating');

        // Merge float chunks
        let totalLength = 0;
        for (const chunk of this.speechChunks) totalLength += chunk.length;
        const merged = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of this.speechChunks) {
            merged.set(chunk, offset);
            offset += chunk.length;
        }
        this.speechChunks = [];

        // Create AudioBuffer
        const buffer = this.ctx.createBuffer(1, totalLength, this.sampleRate);
        buffer.copyToChannel(merged, 0);

        // Play with pitch shift
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        let rate = 1.65; // Cute Angela Cat pitch
        if (this.currentPitchMode === 'chipmunk') rate = 2.15;
        if (this.currentPitchMode === 'baby') rate = 1.45;
        if (this.currentPitchMode === 'robot') rate = 1.1;
        if (this.currentPitchMode === 'giant') rate = 0.75;
        if (this.currentPitchMode === 'normal') rate = 1.0;

        source.playbackRate.value = rate;

        if (this.currentPitchMode === 'robot') {
            const osc = this.ctx.createOscillator();
            const modGain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = 75;
            osc.start();
            source.connect(modGain.gain);
            modGain.connect(this.ctx.destination);
            osc.connect(modGain);
        } else {
            source.connect(this.ctx.destination);
        }

        if (this.onRepeatCallback) this.onRepeatCallback(true);

        source.onended = () => {
            this.isAngelaPlaying = false;
            if (this.onRepeatCallback) this.onRepeatCallback(false);
            if (this.isAutoRepeatActive && this.onVADStateChange) {
                this.onVADStateChange('listening');
            }
        };

        source.start(0);
    }

    // ==========================================
    // REAL MUSIC SYNTHESIZER (HARMONY & BEATS)
    // ==========================================
    stopMusic() {
        this.isMusicPlaying = false;
        this.activeMusicTimers.forEach(t => clearTimeout(t));
        this.activeMusicTimers = [];
    }

    // Play polyphonic musical track (Bass + Chords + Lead Melody)
    playPolyphonicTrack(songData, onStepCallback, onCompleteCallback) {
        this.initContext();
        this.stopMusic();
        this.isMusicPlaying = true;

        const bpm = songData.bpm || 110;
        const beatTime = 60 / bpm; // duration of 1 beat in seconds
        const steps = songData.steps || [];

        let currentStepIdx = 0;

        const scheduleStep = () => {
            if (!this.isMusicPlaying || currentStepIdx >= steps.length) {
                this.isMusicPlaying = false;
                if (onCompleteCallback) onCompleteCallback();
                return;
            }

            const step = steps[currentStepIdx];
            const now = this.ctx.currentTime;
            const duration = (step.duration || 1) * beatTime;

            // 1. Play Bass Note
            if (step.bass) {
                this.playBassNote(step.bass, now, duration * 0.85);
            }

            // 2. Play Chords
            if (step.chord) {
                step.chord.forEach((noteFreq) => {
                    this.playChordNote(noteFreq, now, duration * 0.8);
                });
            }

            // 3. Play Lead Melody Chime
            if (step.lead) {
                this.playLeadNote(step.lead, now, duration * 0.7);
            }

            // 4. Play Drum / Beat Accent
            if (step.beat) {
                this.playDrumBeat(step.beat, now);
            }

            // Trigger Lyric / UI step update
            if (onStepCallback) {
                onStepCallback(step, currentStepIdx);
            }

            currentStepIdx++;
            const timer = setTimeout(scheduleStep, duration * 1000);
            this.activeMusicTimers.push(timer);
        };

        scheduleStep();
    }

    playBassNote(freq, startTime, duration) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.22, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    playChordNote(freq, startTime, duration) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    playLeadNote(freq, startTime, duration) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    playDrumBeat(type, startTime) {
        if (!this.ctx) return;
        if (type === 'kick') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(120, startTime);
            osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.12);
            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.14);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.15);
        } else if (type === 'snare') {
            const noise = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
            const d = noise.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.2;
            const src = this.ctx.createBufferSource();
            src.buffer = noise;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
            src.connect(gain);
            gain.connect(this.ctx.destination);
            src.start(startTime);
        }
    }

    // Natural Human-Like Voice Synthesis (Using /api/speak with Web Speech fallback)
    speakText(text, options = {}) {
        return new Promise((resolve) => {
            this.initContext();
            this.stopSpeaking();

            if (!text || !text.trim()) {
                resolve();
                return;
            }

            // Remove emojis from speech text for clean pronunciation
            const cleanText = text.replace(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
            if (!cleanText) {
                resolve();
                return;
            }

            const isBangla = options.lang ? (options.lang === 'bn') : /[\u0980-\u09FF]/.test(cleanText);
            const lang = isBangla ? 'bn' : 'en';

            // On static hosting (like GitHub Pages) where /api/speak backend doesn't exist:
            const isStaticHost = window.location.hostname.includes('github.io') || 
                                 window.location.protocol === 'file:' || 
                                 (!window.location.port && window.location.hostname !== 'localhost');
            if (isStaticHost) {
                this.fallbackSpeechSynthesis(cleanText, options).then(resolve);
                return;
            }

            const url = `/api/speak?text=${encodeURIComponent(cleanText)}&lang=${lang}`;

            const audio = new Audio();
            this.currentAudioElement = audio;

            // Pitch & Rate adjustments
            let rate = 1.0;
            if (this.currentPitchMode === 'cat') rate = 1.15; // Sweet, lively human kitten
            if (this.currentPitchMode === 'chipmunk') rate = 1.45;
            if (this.currentPitchMode === 'baby') rate = 1.1;
            if (this.currentPitchMode === 'giant') rate = 0.8;
            if (this.currentPitchMode === 'normal') rate = 1.0;

            audio.playbackRate = rate;

            let hasStarted = false;
            audio.onplay = () => {
                if (!hasStarted) {
                    hasStarted = true;
                    if (options.onStart) options.onStart();
                }
            };

            audio.onended = () => {
                this.currentAudioElement = null;
                if (options.onEnd) options.onEnd();
                resolve();
            };

            audio.onerror = (e) => {
                console.warn("Human TTS playback error, falling back to Web Speech", e);
                this.fallbackSpeechSynthesis(cleanText, options).then(resolve);
            };

            audio.src = url;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    console.warn("Audio play() blocked by browser, falling back to Web Speech", err);
                    this.fallbackSpeechSynthesis(cleanText, options).then(resolve);
                });
            }
        });
    }

    fallbackSpeechSynthesis(text, options = {}) {
        return new Promise((resolve) => {
            if (!('speechSynthesis' in window)) {
                resolve();
                return;
            }

            try { window.speechSynthesis.cancel(); } catch (e) {}
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            const isBangla = options.lang ? (options.lang === 'bn') : /[\u0980-\u09FF]/.test(text);

            if (isBangla) {
                const bnVoice = voices.find(v => v.lang.startsWith('bn'));
                if (bnVoice) utterance.voice = bnVoice;
                utterance.lang = 'bn-BD';
            } else {
                const femaleVoice = voices.find(v => 
                    v.lang.startsWith('en') && 
                    (v.name.toLowerCase().includes('female') || 
                     v.name.toLowerCase().includes('samantha') || 
                     v.name.toLowerCase().includes('zira') || 
                     v.name.toLowerCase().includes('karen') ||
                     v.name.toLowerCase().includes('victoria'))
                ) || voices.find(v => v.lang.startsWith('en'));
                if (femaleVoice) utterance.voice = femaleVoice;
                utterance.lang = 'en-US';
            }

            const pitchFactor = options.pitch || (isBangla ? 1.45 : 1.7);
            utterance.pitch = Math.min(2.0, pitchFactor);
            utterance.rate = options.rate || 1.05;
            utterance.volume = options.volume || 1.0;

            if (options.onStart) utterance.onstart = options.onStart;

            let isFinished = false;
            const finish = () => {
                if (isFinished) return;
                isFinished = true;
                clearTimeout(safetyTimer);
                if (options.onEnd) options.onEnd();
                resolve();
            };

            // Safety timeout in case browser TTS event stalls
            const safetyTimer = setTimeout(finish, Math.max(3000, text.length * 140));

            utterance.onend = finish;
            utterance.onerror = finish;

            window.speechSynthesis.speak(utterance);
        });
    }

    stopSpeaking() {
        if (this.currentAudioElement) {
            try {
                this.currentAudioElement.pause();
                this.currentAudioElement.currentTime = 0;
            } catch (e) {}
            this.currentAudioElement = null;
        }
        if ('speechSynthesis' in window) {
            try { window.speechSynthesis.cancel(); } catch (e) {}
        }
    }
}

// Global instance
window.angelaAudio = new AngelaAudioEngine();
