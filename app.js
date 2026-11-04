// Talking Angela Web — Core Logic (Classic Repeat & Smart AI)

(function () {
  'use strict';

  // --- DOM Elements ---
  const bubbleText = document.getElementById('bubble-text');
  const speechBubble = document.getElementById('speech-bubble');
  const statusPill = document.getElementById('status-pill');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const btnMic = document.getElementById('btn-mic');
  const micHint = document.getElementById('mic-hint');
  const modeSelector = document.getElementById('mode-selector');
  const modeRepeatBtn = document.getElementById('mode-repeat-btn');
  const modeAiBtn = document.getElementById('mode-ai-btn');
  const aiInputBar = document.getElementById('ai-input-bar');
  const aiTextInput = document.getElementById('ai-text-input');
  const btnSendText = document.getElementById('btn-send-text');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const btnSettings = document.getElementById('btn-settings');
  const settingsModal = document.getElementById('settings-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const btnResetKey = document.getElementById('btn-reset-key');
  const inputApiKey = document.getElementById('gemini-api-key');
  const pitchSlider = document.getElementById('pitch-slider');
  const langSelect = document.getElementById('lang-select');
  const heartsContainer = document.getElementById('hearts-container');
  const characterWrapper = document.getElementById('character-wrapper');

  // Mouth SVG Elements for Lip-sync
  const mouthIdle = document.getElementById('mouth-idle');
  const mouthOpenSmall = document.getElementById('mouth-open-small');
  const mouthOpenBig = document.getElementById('mouth-open-big');
  const mouthTongue = document.getElementById('mouth-tongue');
  const eyelidsClosed = document.getElementById('eyelids-closed');
  const eyeLeft = document.getElementById('eye-left');
  const eyeRight = document.getElementById('eye-right');
  const earLeft = document.getElementById('ear-left');
  const earRight = document.getElementById('ear-right');

  // Hitboxes
  const hitboxHead = document.getElementById('hitbox-head');
  const hitboxBelly = document.getElementById('hitbox-belly');
  const hitboxEarLeft = document.getElementById('hitbox-ear-left');
  const hitboxEarRight = document.getElementById('hitbox-ear-right');
  const btnPet = document.getElementById('btn-pet');
  const btnPoke = document.getElementById('btn-poke');
  const btnMeow = document.getElementById('btn-meow');

  // --- State ---
  let currentMode = 'repeat'; // 'repeat' | 'ai'
  let isMuted = false;
  let isListening = false;
  let isSpeaking = false;
  let isThinking = false;

  // Settings
  let geminiKey = localStorage.getItem('angela_gemini_key') || '';
  let cartoonPitch = parseFloat(localStorage.getItem('angela_pitch') || '1.45');
  let selectedLang = localStorage.getItem('angela_lang') || 'bn-BD';

  inputApiKey.value = geminiKey;
  pitchSlider.value = cartoonPitch;
  langSelect.value = selectedLang;

  // Audio Context & Nodes
  let audioCtx = null;
  let micStream = null;
  let audioInputSource = null;
  let vadAnalyser = null;
  let vadInterval = null;
  let mediaRecorder = null;
  let recordedChunks = [];
  let isVoiceActive = false;
  let silenceTimer = null;
  let speechRecognition = null;
  let mouthAnimInterval = null;

  // --- Initialize Audio Context on First Interaction ---
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // --- Sound Effects Synthesizer (No external asset needed) ---
  function playPurrSound() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const mod = ctx.createOscillator();
      const modGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.8);

      mod.frequency.setValueAtTime(26, ctx.currentTime);
      modGain.gain.setValueAtTime(15, ctx.currentTime);

      mod.connect(osc.frequency);
      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.2);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.8);

      osc.start();
      mod.start();
      osc.stop(ctx.currentTime + 0.85);
      mod.stop(ctx.currentTime + 0.85);
    } catch (e) {
      console.warn('Audio FX error', e);
    }
  }

  function playMeowSound() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.2);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.55);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.56);
    } catch (e) {
      console.warn(e);
    }
  }

  function playGiggleSound() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const notes = [520, 680, 820, 640, 880];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + i * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.08);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // --- Character Animations & Lip-sync ---
  function setMouthState(state) {
    mouthIdle.style.display = 'none';
    mouthOpenSmall.style.display = 'none';
    mouthOpenBig.style.display = 'none';
    mouthTongue.style.display = 'none';

    if (state === 'small') {
      mouthOpenSmall.style.display = 'block';
    } else if (state === 'big') {
      mouthOpenBig.style.display = 'block';
      mouthTongue.style.display = 'block';
    } else {
      mouthIdle.style.display = 'block';
    }
  }

  function startLipSync() {
    stopLipSync();
    let frame = 0;
    mouthAnimInterval = setInterval(() => {
      frame++;
      const mod = frame % 4;
      if (mod === 0) setMouthState('idle');
      else if (mod === 1 || mod === 3) setMouthState('small');
      else setMouthState('big');
    }, 110);
  }

  function stopLipSync() {
    if (mouthAnimInterval) {
      clearInterval(mouthAnimInterval);
      mouthAnimInterval = null;
    }
    setMouthState('idle');
  }

  // Eye blinking
  function blink() {
    eyeLeft.style.display = 'none';
    eyeRight.style.display = 'none';
    eyelidsClosed.style.display = 'block';
    setTimeout(() => {
      eyelidsClosed.style.display = 'none';
      eyeLeft.style.display = 'block';
      eyeRight.style.display = 'block';
    }, 160);
  }

  setInterval(() => {
    if (Math.random() > 0.4 && !isSpeaking) {
      blink();
    }
  }, 3500);

  // Status Updater
  function updateStatus(text, stateClass = 'idle') {
    statusText.innerText = text;
    statusDot.className = 'status-dot';
    if (stateClass !== 'idle') {
      statusDot.classList.add(stateClass);
    }
  }

  function setBubble(text) {
    bubbleText.innerText = text;
    speechBubble.style.animation = 'none';
    void speechBubble.offsetWidth; // trigger reflow
    speechBubble.style.animation = 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  }

  // Floating Heart Particle
  function spawnHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    const emojis = ['💖', '💕', '✨', '🐾', '🌸'];
    heart.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.left = `${x || 150 + Math.random() * 80}px`;
    heart.style.top = `${y || 120 + Math.random() * 60}px`;
    heartsContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 1400);
  }

  // --- Interactive Hitbox Events ---
  hitboxHead.addEventListener('click', (e) => {
    playPurrSound();
    characterWrapper.classList.add('happy-bounce');
    setTimeout(() => characterWrapper.classList.remove('happy-bounce'), 500);
    for (let i = 0; i < 4; i++) {
      setTimeout(() => spawnHeart(e.offsetX + 80, e.offsetY + 50), i * 150);
    }
    setBubble('হুমমম... আদর খুব ভালো লাগে! Purrr~ 💖');
  });

  hitboxBelly.addEventListener('click', () => {
    playGiggleSound();
    characterWrapper.classList.add('shaking');
    setTimeout(() => characterWrapper.classList.remove('shaking'), 450);
    setBubble('হাহা! পেটে সুড়সুড়ি দিও না! হিহিহি~ 😹');
  });

  function twitchEar(earEl) {
    playMeowSound();
    earEl.classList.add('ear-twitch');
    setTimeout(() => earEl.classList.remove('ear-twitch'), 400);
    setBubble('মিয়াঁও! কানে হাত দিলে কিন্তু গুড়গুড় করি! 🐾');
  }

  hitboxEarLeft.addEventListener('click', () => twitchEar(earLeft));
  hitboxEarRight.addEventListener('click', () => twitchEar(earRight));

  btnPet.addEventListener('click', () => {
    playPurrSound();
    for (let i = 0; i < 5; i++) {
      setTimeout(() => spawnHeart(140 + Math.random() * 60, 100 + Math.random() * 40), i * 100);
    }
    setBubble('তুমি খুব কিউট! Purrrr~ 😻');
  });

  btnPoke.addEventListener('click', () => {
    playGiggleSound();
    characterWrapper.classList.add('shaking');
    setTimeout(() => characterWrapper.classList.remove('shaking'), 450);
    setBubble('ওরে বাবা! গুড়গুড়ি লাগে! 😸');
  });

  btnMeow.addEventListener('click', () => {
    playMeowSound();
    twitchEar(earRight);
  });

  // --- Mode Switching ---
  function switchMode(newMode) {
    currentMode = newMode;
    if (newMode === 'repeat') {
      modeRepeatBtn.classList.add('active');
      modeAiBtn.classList.remove('active');
      aiInputBar.classList.remove('visible');
      micHint.innerText = 'মাইকে ট্যাপ করে কথা বলুন — অ্যাঞ্জেলা কার্টুন ভয়েসে রিপিট করবে!';
      setBubble('আমি এখন তোমার কথা হুবহু রিপিট করব! কিছু বলো~ 🔁');
      updateStatus('রেডি (কার্টুন রিপিট)');
      stopSpeechRecognition();
    } else {
      modeAiBtn.classList.add('active');
      modeRepeatBtn.classList.remove('active');
      aiInputBar.classList.add('visible');
      micHint.innerText = 'মাইকে বা টাইপ করে কিছু জিজ্ঞেস করুন — এআই উত্তর দেবে!';
      setBubble('আমি এখন স্মার্ট এআই অ্যাঞ্জেলা! আমাকে যেকোনো প্রশ্ন করতে পারো~ 🤖');
      updateStatus('রেডি (Smart AI)');
      stopClassicListening();
    }
    stopCurrentAction();
  }

  modeRepeatBtn.addEventListener('click', () => switchMode('repeat'));
  modeAiBtn.addEventListener('click', () => switchMode('ai'));

  // --- Mode 1: Classic Mimic (Cartoon Voice Pitch Shift) ---
  async function startClassicRepeatFlow() {
    const ctx = getAudioContext();
    try {
      if (!micStream) {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      audioInputSource = ctx.createMediaStreamSource(micStream);
      vadAnalyser = ctx.createAnalyser();
      vadAnalyser.fftSize = 512;
      audioInputSource.connect(vadAnalyser);

      const bufferLength = vadAnalyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      btnMic.classList.add('recording');
      isListening = true;
      updateStatus('অ্যাঞ্জেলা শুনছে... (বলুন)', 'listening');
      setBubble('শুনছি... বলো কিছু! 👂');

      mediaRecorder = new MediaRecorder(micStream);
      recordedChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        if (recordedChunks.length === 0) {
          updateStatus('কিছু শুনতে পাইনি!');
          btnMic.classList.remove('recording');
          isListening = false;
          return;
        }

        const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        
        ctx.decodeAudioData(arrayBuffer, (audioBuffer) => {
          playCartoonPitchBuffer(audioBuffer);
        }, (err) => {
          console.error('Audio decode error', err);
          updateStatus('অডিও প্লে করতে সমস্যা হয়েছে');
          btnMic.classList.remove('recording');
          isListening = false;
        });
      };

      mediaRecorder.start();

      // Voice Activity Detection (Auto stop when silence detected)
      let speechStarted = false;
      let silenceStart = null;

      clearInterval(vadInterval);
      vadInterval = setInterval(() => {
        vadAnalyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Sound Threshold
        if (average > 15) {
          speechStarted = true;
          silenceStart = null;
        } else if (speechStarted) {
          if (!silenceStart) {
            silenceStart = Date.now();
          } else if (Date.now() - silenceStart > 1200) {
            // Silence for 1.2 seconds -> Stop and repeat!
            clearInterval(vadInterval);
            if (mediaRecorder && mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          }
        }
      }, 80);

    } catch (err) {
      console.error('Mic error:', err);
      alert('মাইক্রোফোন অ্যাক্সেস করতে সমস্যা হয়েছে! দয়া করে ব্রাউজারে Mic Permission দিন।');
      btnMic.classList.remove('recording');
      isListening = false;
    }
  }

  function playCartoonPitchBuffer(audioBuffer) {
    const ctx = getAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    // Pitch & Speed shift for Talking Tom/Angela effect!
    source.playbackRate.value = cartoonPitch; // e.g. 1.45x for funny cute cartoon tone

    // Analyser for mouth lip sync during playback
    const playAnalyser = ctx.createAnalyser();
    playAnalyser.fftSize = 256;
    source.connect(playAnalyser);
    playAnalyser.connect(ctx.destination);

    source.onended = () => {
      stopLipSync();
      isSpeaking = false;
      btnMic.classList.remove('recording');
      isListening = false;
      updateStatus('রেডি! আবার বলতে ট্যাপ করুন');
      setBubble('হিহিহি! কেমন লাগলো? আবার বলো! 💖');
    };

    isSpeaking = true;
    updateStatus('অ্যাঞ্জেলা বলছে... (Repeat)', 'speaking');
    setBubble('🗣️ ' + (bubbleText.innerText.includes('🗣️') ? bubbleText.innerText : '...'));
    startLipSync();
    source.start();
  }

  function stopClassicListening() {
    if (vadInterval) clearInterval(vadInterval);
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    btnMic.classList.remove('recording');
    isListening = false;
  }

  // --- Mode 2: Smart AI (Gemini / ChatGPT Chatbot) ---
  function setupSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      return null;
    }
    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = selectedLang;

    recognition.onstart = () => {
      isListening = true;
      btnMic.classList.add('recording');
      updateStatus('অ্যাঞ্জেলা শুনছে... (AI Mode)', 'listening');
      setBubble('শুনছি... আমাকে যা ইচ্ছা প্রশ্ন করো! 💬');
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      aiTextInput.value = transcript;
      handleAiQuery(transcript);
    };

    recognition.onerror = (e) => {
      console.warn('Speech rec error:', e);
      btnMic.classList.remove('recording');
      isListening = false;
      updateStatus('রেডি! কথা বলতে ট্যাপ করুন');
    };

    recognition.onend = () => {
      btnMic.classList.remove('recording');
      isListening = false;
    };

    return recognition;
  }

  function startSpeechRecognition() {
    if (!speechRecognition) {
      speechRecognition = setupSpeechRecognition();
    }
    if (!speechRecognition) {
      alert('আপনার ব্রাউজারে ভয়েস রিকগনিশন সাপোর্ট নেই। নিচের টেক্সট বক্সে টাইপ করে প্রশ্ন করতে পারেন!');
      return;
    }
    try {
      speechRecognition.lang = selectedLang;
      speechRecognition.start();
    } catch (e) {
      console.warn('Already started', e);
    }
  }

  function stopSpeechRecognition() {
    if (speechRecognition) {
      try { speechRecognition.stop(); } catch (e) {}
    }
    btnMic.classList.remove('recording');
    isListening = false;
  }

  // Smart Built-in Fallback Brain (Works immediately without any API Key)
  function getBuiltinAiResponse(query) {
    const q = query.toLowerCase();

    // Bengali greetings
    if (q.includes('কেমন আছ') || q.includes('how are you')) {
      return 'আমি খুব ভালো আছি ডার্লিং! তুমি কেমন আছো বলো? 😻';
    }
    if (q.includes('নাম কি') || q.includes('name') || q.includes('কে তুমি')) {
      return 'আমার নাম অ্যাঞ্জেলা! আমি প্যারিসের সবচেয়ে ফ্যাশনেবল এবং কিউট বিড়াল! 💅✨';
    }
    if (q.includes('ভালোবাস') || q.includes('love') || q.includes('পছন্দ')) {
      return 'হুমম, তোমাকে তো আমার অনেক পছন্দ! তুমি খুব ভালো বন্ধু! Purrr~ 💖';
    }
    if (q.includes('টম') || q.includes('tom')) {
      return 'টম? ওহ, টম অনেক দুষ্টু কিন্তু মনের দিক থেকে খুব ভালো! ও আমার বেস্ট ফ্রেন্ড! 😸';
    }
    if (q.includes('খাবার') || q.includes('মাছ') || q.includes('fish') || q.includes('food')) {
      return 'আমার পছন্দের খাবার ফ্রেশ সুস্বাদু মাছ আর মিল্কশেক! উম্মম, ইয়াম্মী! 🐟🥛';
    }
    if (q.includes('গান') || q.includes('sing') || q.includes('song')) {
      return 'মিয়াঁও মিয়াঁও লা লা লা~ আমার গান কেমন লাগলো বলো? 🎶😻';
    }
    if (q.includes('বাই') || q.includes('বিদায়') || q.includes('bye') || q.includes('good night')) {
      return 'বাই বাই সোনা! আবার এসো কিন্তু, আমি তোমার জন্য অপেক্ষা করব! 🐾💖';
    }
    if (q.includes('কৌতুক') || q.includes('joke') || q.includes('হাসাও')) {
      return 'বলতো বিড়ালের প্রিয় সাবজেক্ট কী? ...হিস্ট্রি নয়, "মিয়াউ-থামেটিক্স"! হিহিহি! 😹';
    }

    // Default witty replies
    const randomReplies = [
      'কী মিষ্টি কথা তোমার! তোমার সাথে আড্ডা দিতে আমার খুব ভালো লাগছে~ 🌸',
      'মিয়াঁও! তুমি সত্যিই অনেক মজার একজন মানুষ! আরও কিছু বলো? 😻',
      'হুমমম, চমৎকার বলেছ! আমি কিন্তু মন দিয়ে শুনছি~ Purrr! ✨',
      'ওহ ডার্লিং, তুমি এত কিউট কেন বলো তো? হিহিহি! 💖'
    ];
    return randomReplies[Math.floor(Math.random() * randomReplies.length)];
  }

  // Real Gemini API Call
  async function callGeminiApi(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    
    const systemPrompt = `You are Talking Angela, the iconic glamorous, sweet, witty and cute white cat.
Rules:
- Respond in 1 to 2 short, lovely, conversational sentences only.
- If the user talks in Bengali or Banglish, answer in sweet, friendly Bengali/Banglish.
- If they talk in English, answer in English.
- Use cute cat expressions like "Purrr~", "মিয়াঁও!", "ডার্লিং" occasionally.
- Keep it fun, warm and playful!`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser: ${prompt}\nAngela:` }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.8
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  }

  async function handleAiQuery(query) {
    if (!query || !query.trim()) return;

    isThinking = true;
    updateStatus('অ্যাঞ্জেলা ভাবছে...', 'thinking');
    setBubble('💭 ভাবছি... এক মিনিট ডার্লিং!');

    let reply = '';
    try {
      if (geminiKey && geminiKey.trim()) {
        reply = await callGeminiApi(query);
      } else {
        // Built-in intelligent response
        await new Promise((resolve) => setTimeout(resolve, 600)); // natural pause
        reply = getBuiltinAiResponse(query);
      }
    } catch (err) {
      console.error('AI call failed, using fallback:', err);
      reply = getBuiltinAiResponse(query);
    }

    isThinking = false;
    speakWithAngelaVoice(reply);
  }

  // Text-to-Speech with High Pitch & Lip-sync
  function speakWithAngelaVoice(text) {
    if (!window.speechSynthesis) {
      setBubble(text);
      updateStatus('রেডি');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Cute Angela voice pitch
    utterance.pitch = 1.7; // high cute pitch
    utterance.rate = 1.05;

    // Detect language
    const isBengali = /[\u0980-\u09FF]/.test(text);
    utterance.lang = isBengali ? 'bn-BD' : 'en-US';

    // Try finding a pleasant female voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      (v.lang.startsWith(isBengali ? 'bn' : 'en')) && 
      (v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira'))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      isSpeaking = true;
      setBubble(text);
      updateStatus('অ্যাঞ্জেলা কথা বলছে...', 'speaking');
      startLipSync();
    };

    utterance.onend = () => {
      stopLipSync();
      isSpeaking = false;
      updateStatus('রেডি (Smart AI)');
    };

    utterance.onerror = () => {
      stopLipSync();
      isSpeaking = false;
      updateStatus('রেডি (Smart AI)');
    };

    window.speechSynthesis.speak(utterance);
  }

  // --- Main Mic Button Handler ---
  btnMic.addEventListener('click', () => {
    getAudioContext();

    if (currentMode === 'repeat') {
      if (isListening) {
        stopClassicListening();
        updateStatus('বন্ধ করা হয়েছে');
      } else {
        startClassicRepeatFlow();
      }
    } else {
      if (isListening) {
        stopSpeechRecognition();
      } else {
        startSpeechRecognition();
      }
    }
  });

  // Text Send Handler
  function submitText() {
    const val = aiTextInput.value.trim();
    if (!val) return;
    handleAiQuery(val);
    aiTextInput.value = '';
  }

  btnSendText.addEventListener('click', submitText);
  aiTextInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitText();
  });

  // Sound Toggle
  btnSoundToggle.addEventListener('click', () => {
    isMuted = !isMuted;
    btnSoundToggle.innerText = isMuted ? '🔇' : '🔊';
    if (isMuted && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      stopLipSync();
    }
  });

  // Settings Modal
  btnSettings.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
  });

  btnCloseModal.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });

  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.style.display = 'none';
  });

  btnSaveSettings.addEventListener('click', () => {
    geminiKey = inputApiKey.value.trim();
    cartoonPitch = parseFloat(pitchSlider.value);
    selectedLang = langSelect.value;

    localStorage.setItem('angela_gemini_key', geminiKey);
    localStorage.setItem('angela_pitch', cartoonPitch.toString());
    localStorage.setItem('angela_lang', selectedLang);

    settingsModal.style.display = 'none';
    setBubble('সেটিংস সেভ হয়েছে ডার্লিং! 💖');
  });

  btnResetKey.addEventListener('click', () => {
    inputApiKey.value = '';
    localStorage.removeItem('angela_gemini_key');
    geminiKey = '';
    alert('API Key মুছে ফেলা হয়েছে। এখন বিল্ট-ইন এআই কাজ করবে।');
  });

  function stopCurrentAction() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    stopLipSync();
    stopClassicListening();
    stopSpeechRecognition();
  }

  // Pre-load voices if supported
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

})();
