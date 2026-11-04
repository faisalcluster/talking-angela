// Talking Angela - Pure Voice Hands-Free Kids Game Controller

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const angelaPhoto = document.getElementById('angela-photo');
    const angelaFrame = document.getElementById('angela-frame');
    const warningBadge = document.getElementById('warning-badge');
    const foodFeeder = document.getElementById('food-feeder');
    const dressGlow = document.getElementById('dress-glow');

    // Live Voice Status Bar
    const statusDot = document.getElementById('status-dot');
    const statusLabel = document.getElementById('status-label');
    const soundWaves = document.getElementById('sound-waves');

    // Mode Switcher Tabs
    const tabAiMode = document.getElementById('tab-ai-mode');
    const tabRepeatMode = document.getElementById('tab-repeat-mode');

    // Controls
    const btnLangToggle = document.getElementById('btn-lang-toggle');
    const langLabel = document.getElementById('lang-label');
    const langIndicator = document.getElementById('lang-indicator');
    const btnSoundToggle = document.getElementById('btn-sound-toggle');

    // Quick Action Buttons
    const quickTickle = document.getElementById('quick-tickle');
    const quickPoke = document.getElementById('quick-poke');
    const quickPurr = document.getElementById('quick-purr');

    // Modals
    const modalSongs = document.getElementById('modal-songs');
    const modalTreats = document.getElementById('modal-treats');
    const modalDressup = document.getElementById('modal-dressup');
    const btnOpenSongs = document.getElementById('btn-open-songs');
    const btnOpenTreats = document.getElementById('btn-open-treats');
    const btnOpenDressup = document.getElementById('btn-open-dressup');

    // Particle Canvas
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');

    // App State
    let activeMode = 'ai'; // 'ai' (Default: Hands-Free Voice Chat) or 'repeat' (Voice Repeat)
    let currentLang = 'bn'; // 'bn' or 'en'
    let soundEnabled = true;
    let isSinging = false;
    let particles = [];

    // Image assets
    const ASSETS = {
        happy: 'assets/angela_happy.jpg',
        annoyed: 'assets/angela_annoyed.jpg',
        singing: 'assets/angela_singing.jpg'
    };

    // Preload Images
    Object.values(ASSETS).forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // Setup Canvas Size
    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Particle System
    class Particle {
        constructor(x, y, symbol) {
            this.x = x;
            this.y = y;
            this.symbol = symbol || '💖';
            this.vx = (Math.random() - 0.5) * 5;
            this.vy = -Math.random() * 4 - 2;
            this.size = Math.random() * 18 + 18;
            this.opacity = 1;
            this.rotation = Math.random() * Math.PI * 2;
            this.vRot = (Math.random() - 0.5) * 0.12;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.vRot;
            this.opacity -= 0.016;
        }
        draw(c) {
            c.save();
            c.globalAlpha = Math.max(0, this.opacity);
            c.font = `${this.size}px 'Fredoka', 'Hind Siliguri', sans-serif`;
            c.translate(this.x, this.y);
            c.rotate(this.rotation);
            c.fillText(this.symbol, -this.size / 2, this.size / 2);
            c.restore();
        }
    }

    function spawnParticles(x, y, symbols = ['💖', '✨', '🌸', '⭐'], count = 16) {
        for (let i = 0; i < count; i++) {
            const sym = symbols[Math.floor(Math.random() * symbols.length)];
            particles.push(new Particle(x, y, sym));
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter(p => p.opacity > 0);
        particles.forEach(p => {
            p.update();
            p.draw(ctx);
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // Set Angela Pose
    function setAngelaPose(pose) {
        if (ASSETS[pose]) {
            angelaPhoto.src = ASSETS[pose];
        }
    }

    // Natural Human Voice Speech Helper
    function angelaSpeak(text, options = {}) {
        if (!soundEnabled || !window.angelaAudio) return Promise.resolve();

        angelaFrame.classList.add('bouncing');

        return window.angelaAudio.speakText(text, {
            onEnd: () => {
                angelaFrame.classList.remove('bouncing');
                if (options.onEnd) options.onEnd();
            }
        });
    }

    // ==========================================
    // HANDS-FREE CONTINUOUS VOICE CHAT LOOP
    // ==========================================
    function startContinuousAI() {
        if (activeMode !== 'ai') return;

        statusLabel.textContent = currentLang === 'bn' 
            ? "🎙️ শুনছি... সরাসরি কথা বলুন (অটো চলবে)" 
            : "🎙️ Listening... Speak naturally (Hands-Free)";
        statusDot.className = "status-dot";
        soundWaves.className = "sound-waves";

        const langCode = currentLang === 'bn' ? 'bn-BD' : 'en-US';

        window.angelaVoiceAI.startContinuousVoiceChat(
            langCode,
            // When Child Speaks (Automated Callback)
            async (userTranscript) => {
                if (activeMode !== 'ai' || isSinging) return;

                // 1. Pause mic during Angela's response
                window.angelaVoiceAI.pauseForAngelaSpeech();

                statusLabel.textContent = currentLang === 'bn' 
                    ? "🐱 অ্যাঞ্জেলা ভাবছে..." 
                    : "🐱 Angela is thinking...";
                statusDot.className = "status-dot speaking";
                soundWaves.className = "sound-waves speaking";

                // 2. Get AI Answer (await Gemini / intelligent brain)
                const answer = await window.angelaVoiceAI.getAnswer(userTranscript);
                spawnParticles(canvas.width / 2, canvas.height * 0.35, ['💖', '✨', '🌸', '💡'], 16);

                statusLabel.textContent = currentLang === 'bn' 
                    ? "🐱 অ্যাঞ্জেলা উত্তর দিচ্ছে..." 
                    : "🐱 Angela is answering...";

                // 3. Angela speaks out loud in Natural Human Voice
                await angelaSpeak(answer);

                // 4. Automatically resume listening for the child's next question!
                if (activeMode === 'ai' && !isSinging) {
                    statusLabel.textContent = currentLang === 'bn' 
                        ? "🎙️ শুনছি... সরাসরি কথা বলুন (অটো চলবে)" 
                        : "🎙️ Listening... Speak naturally (Hands-Free)";
                    statusDot.className = "status-dot";
                    soundWaves.className = "sound-waves";
                    window.angelaVoiceAI.resumeAfterAngelaSpeech();
                }
            },
            // State Change
            (state) => {
                if (state === 'listening') {
                    statusLabel.textContent = currentLang === 'bn' 
                        ? "🎙️ শুনছি... সরাসরি কথা বলুন (অটো চলবে)" 
                        : "🎙️ Listening... Speak naturally (Hands-Free)";
                    statusDot.className = "status-dot";
                    soundWaves.className = "sound-waves";
                } else if (state === 'answering') {
                    statusLabel.textContent = currentLang === 'bn' 
                        ? "🐱 অ্যাঞ্জেলা উত্তর দিচ্ছে..." 
                        : "🐱 Angela is answering...";
                    statusDot.className = "status-dot speaking";
                    soundWaves.className = "sound-waves speaking";
                }
            }
        );
    }

    // ==========================================
    // MODE SWITCHER (HANDS-FREE AI vs REPEAT)
    // ==========================================
    function switchMode(newMode) {
        activeMode = newMode;

        if (activeMode === 'ai') {
            tabAiMode.classList.add('active');
            tabRepeatMode.classList.remove('active');

            window.angelaAudio.stopAutoRepeat();
            startContinuousAI();

            angelaSpeak(currentLang === 'bn' 
                ? "অটো ভয়েস চ্যাট চালু হয়েছে! সরাসরি মুখে কথা বলো, আমি নিজে নিজেই উত্তর দেব!" 
                : "Auto voice chat on! Just speak to me, I will answer automatically!");

        } else if (activeMode === 'repeat') {
            tabRepeatMode.classList.add('active');
            tabAiMode.classList.remove('active');

            window.angelaVoiceAI.stopContinuousVoiceChat();

            statusLabel.textContent = currentLang === 'bn' 
                ? "🔄 ফানি রিপিট: কথা বলে ১.৫ সেকেন্ড থামুন" 
                : "🔄 Voice Repeat: Speak & pause 1.5s";
            statusDot.className = "status-dot speaking";

            // Start Auto-Repeat Engine (1.5s stop detection)
            window.angelaAudio.startAutoRepeat(
                (vadState) => {
                    if (vadState === 'recording') {
                        statusLabel.textContent = currentLang === 'bn' ? "🔴 শুনছি... (১.৫ সে থামুন)" : "🔴 Listening... (pause 1.5s)";
                    } else if (vadState === 'repeating') {
                        statusLabel.textContent = currentLang === 'bn' ? "🐱 রিপিট করছি..." : "🐱 Repeating in funny voice...";
                    } else if (vadState === 'listening') {
                        statusLabel.textContent = currentLang === 'bn' ? "👂 শুনছি... কথা বলুন" : "👂 Listening... Speak now";
                    }
                },
                (isPlaying) => {
                    if (isPlaying) {
                        angelaFrame.classList.add('bouncing');
                        spawnParticles(canvas.width / 2, canvas.height * 0.4, ['🎶', '✨', '🐾'], 12);
                    } else {
                        angelaFrame.classList.remove('bouncing');
                    }
                }
            );

            angelaSpeak(currentLang === 'bn' 
                ? "ফানি রিপিট মোড চালু হয়েছে! কথা বলে ১.৫ সেকেন্ড থামুন!" 
                : "Repeat mode on! Speak and pause for 1.5s!");
        }
    }

    tabAiMode.addEventListener('click', () => switchMode('ai'));
    tabRepeatMode.addEventListener('click', () => switchMode('repeat'));

    // Start Hands-Free Continuous AI Voice on first click anywhere
    document.body.addEventListener('click', () => {
        window.angelaAudio.initContext();
        if (activeMode === 'ai' && !window.angelaVoiceAI.isContinuousActive) {
            startContinuousAI();
        }
    }, { once: true });

    // ==========================================
    // TOUCH INTERACTIONS & "UHH DON'T TOUCH ME!"
    // ==========================================
    async function triggerAnnoyedReaction() {
        if (isSinging) return;

        if (activeMode === 'ai') window.angelaVoiceAI.pauseForAngelaSpeech();

        setAngelaPose('annoyed');
        angelaFrame.classList.remove('bouncing', 'singing', 'purring', 'twirling');
        angelaFrame.classList.add('annoyed');

        if (soundEnabled && window.angelaAudio) {
            window.angelaAudio.playAnnoyedSound();
        }

        warningBadge.classList.add('show');

        const sassyPhrasesBn = [
            "উহহ! ডোন্ট টাচ মি! আমাকে খোঁচা দিও না! 😾",
            "আরে! আমার পেটে হাত দিও না! আমি কিন্তু রেগে যাব! 😾",
            "উফফ! বিড়ালকে এভাবে খোঁচা মারতে নেই! 😾"
        ];
        const sassyPhrasesEn = [
            "Uhh, don't touch me! 😾",
            "Hey! Hands off my tummy! 😾",
            "Excuse me! I'm a classy lady cat! Don't poke me! 🎀"
        ];

        const phrase = currentLang === 'bn'
            ? sassyPhrasesBn[Math.floor(Math.random() * sassyPhrasesBn.length)]
            : sassyPhrasesEn[Math.floor(Math.random() * sassyPhrasesEn.length)];

        spawnParticles(canvas.width / 2, canvas.height * 0.45, ['😾', '💥', '⚡', '💢'], 12);
        await angelaSpeak(phrase);

        setTimeout(() => {
            warningBadge.classList.remove('show');
            angelaFrame.classList.remove('annoyed');
            setAngelaPose('happy');
            if (activeMode === 'ai') window.angelaVoiceAI.resumeAfterAngelaSpeech();
        }, 2200);
    }

    async function triggerHeadPet() {
        if (isSinging) return;
        if (activeMode === 'ai') window.angelaVoiceAI.pauseForAngelaSpeech();

        setAngelaPose('happy');
        angelaFrame.classList.add('purring');

        if (soundEnabled && window.angelaAudio) {
            window.angelaAudio.playMeow(1.2);
            window.angelaAudio.playPurr();
        }

        spawnParticles(canvas.width / 2, canvas.height * 0.25, ['💖', '💕', '✨', '🌸'], 16);

        const sweetPhrasesBn = [
            "ওলে বাবা! কত মিষ্টি আদর! আসসালামু আলাইকুম সোনা!",
            "তোমার নরম হাতের আদর আমার খুব পছন্দ! মিউ মিউ!",
            "তুমি আমার সবচেয়ে প্রিয় লক্ষ্মী বন্ধু!"
        ];
        const sweetPhrasesEn = [
            "Aww, you're so sweet! Purrrr! Assalamu Alaikum!",
            "I love soft head cuddles! Meow!",
            "You are the best friend ever!"
        ];

        const phrase = currentLang === 'bn'
            ? sweetPhrasesBn[Math.floor(Math.random() * sweetPhrasesBn.length)]
            : sweetPhrasesEn[Math.floor(Math.random() * sweetPhrasesEn.length)];

        await angelaSpeak(phrase);
        angelaFrame.classList.remove('purring');
        if (activeMode === 'ai') window.angelaVoiceAI.resumeAfterAngelaSpeech();
    }

    function triggerCheekTickle() {
        if (isSinging) return;
        if (soundEnabled) window.angelaAudio.playGiggle();
        spawnParticles(canvas.width / 2, canvas.height * 0.3, ['💋', '😽', '✨'], 10);

        const phrase = currentLang === 'bn' ? "চুমু নাও মিষ্টি সোনা! মুয়াহ! আসসালামু আলাইকুম!" : "Muah! Kisses for you!";
        angelaSpeak(phrase);
    }

    function triggerTailPull() {
        if (isSinging) return;
        if (soundEnabled) window.angelaAudio.playMeow(1.6);
        angelaFrame.classList.add('annoyed');
        spawnParticles(canvas.width * 0.25, canvas.height * 0.7, ['🐾', '🙀', '⭐'], 8);

        const phrase = currentLang === 'bn' ? "আউচ! আমার নরম লেজ ধরে টেনো না! হিহি!" : "Ouch! Don't pull my fluffy tail! Hehe!";
        angelaSpeak(phrase).then(() => {
            angelaFrame.classList.remove('annoyed');
        });
    }

    function triggerFeetTickle() {
        if (isSinging) return;
        if (soundEnabled) window.angelaAudio.playGiggle();
        angelaFrame.classList.add('bouncing');
        spawnParticles(canvas.width / 2, canvas.height * 0.85, ['😂', '🐾', '✨'], 10);

        const phrase = currentLang === 'bn' ? "হাহাহা! থামো থামো, আমার পায়ে অনেক কাতুকুতু!" : "Hahaha! Stop, my paws are too ticklish!";
        angelaSpeak(phrase).then(() => {
            angelaFrame.classList.remove('bouncing');
        });
    }

    // Touch Event Listeners on Hitboxes
    document.getElementById('hitbox-head').addEventListener('click', triggerHeadPet);
    document.getElementById('hitbox-cheeks').addEventListener('click', triggerCheekTickle);
    document.getElementById('hitbox-belly').addEventListener('click', triggerAnnoyedReaction);
    document.getElementById('hitbox-tail').addEventListener('click', triggerTailPull);
    document.getElementById('hitbox-feet').addEventListener('click', triggerFeetTickle);

    quickTickle.addEventListener('click', triggerHeadPet);
    quickPoke.addEventListener('click', triggerAnnoyedReaction);
    quickPurr.addEventListener('click', () => {
        if (window.angelaAudio) window.angelaAudio.playPurr();
        triggerHeadPet();
    });

    // ==========================================
    // REAL SONGS WITH LIVE SINGING VOCALS & MUSIC
    // ==========================================
    const songsListContainer = document.getElementById('songs-list-container');
    if (window.ANGELA_SONGS && songsListContainer) {
        window.ANGELA_SONGS.forEach(song => {
            const card = document.createElement('div');
            card.className = 'song-card';
            card.innerHTML = `
                <div class="song-info">
                    <h4>${song.title}</h4>
                    <span>${song.category}</span>
                </div>
                <span class="song-play-icon">▶️</span>
            `;
            card.addEventListener('click', () => {
                modalSongs.classList.remove('open');
                playRealSong(song);
            });
            songsListContainer.appendChild(card);
        });
    }

    async function playRealSong(song) {
        if (isSinging) return;
        isSinging = true;

        if (activeMode === 'ai') window.angelaVoiceAI.stopContinuousVoiceChat();
        if (activeMode === 'repeat') window.angelaAudio.stopAutoRepeat();

        // Switch to singing pose & animation
        setAngelaPose('singing');
        angelaFrame.classList.add('singing');

        if (soundEnabled) window.angelaAudio.playSparkle();

        // Angela sings each lyric line out loud with natural voice & musical chimes!
        for (let i = 0; i < song.lyrics.length; i++) {
            if (!isSinging) break;
            const line = song.lyrics[i];

            // Floating music particles
            spawnParticles(canvas.width / 2, canvas.height * 0.4, ['🎵', '🎶', '⭐', '✨', '💖'], 10);

            // Play background musical chord/note
            if (song.steps && song.steps[i]) {
                const step = song.steps[i];
                if (step.lead) window.angelaAudio.playLeadNote(step.lead, window.angelaAudio.ctx.currentTime, 0.8);
                if (step.bass) window.angelaAudio.playBassNote(step.bass, window.angelaAudio.ctx.currentTime, 0.8);
            }

            // Angela actively SINGS the vocal line aloud!
            await window.angelaAudio.speakText(line);
            await new Promise(r => setTimeout(r, 200));
        }

        // Finish song
        isSinging = false;
        angelaFrame.classList.remove('singing');
        setAngelaPose('happy');

        const endMsg = currentLang === 'bn' 
            ? "কেমন লাগল আমার গান ও ছড়া? হাততালি দাও! 👏💖" 
            : "Did you like my song darling? Give me a big clap! 👏✨";
        await angelaSpeak(endMsg);

        if (activeMode === 'ai') startContinuousAI();
        if (activeMode === 'repeat') switchMode('repeat');
    }

    // Modal Handlers
    btnOpenSongs.addEventListener('click', () => modalSongs.classList.add('open'));
    btnOpenTreats.addEventListener('click', () => modalTreats.classList.add('open'));
    btnOpenDressup.addEventListener('click', () => modalDressup.classList.add('open'));

    // AI Settings Modal Handlers
    const btnAiSettings = document.getElementById('btn-ai-settings');
    const modalAiSettings = document.getElementById('modal-ai-settings');
    const inputGeminiKey = document.getElementById('input-gemini-key');
    const btnSaveGemini = document.getElementById('btn-save-gemini');
    const btnClearGemini = document.getElementById('btn-clear-gemini');
    const aiBadgeTitle = document.getElementById('ai-badge-title');
    const aiBadgeDesc = document.getElementById('ai-badge-desc');

    function updateAiSettingsUI() {
        if (window.angelaVoiceAI.hasGeminiKey()) {
            aiBadgeTitle.textContent = "Google Gemini 1.5 Live AI সক্রিয়!";
            aiBadgeDesc.textContent = "রিয়েল ChatGPT/Gemini ক্লাউড ব্রেন দিয়ে উত্তর দেওয়া হচ্ছে।";
            inputGeminiKey.value = window.angelaVoiceAI.geminiApiKey;
        } else {
            aiBadgeTitle.textContent = "বিল্ট-ইন স্মার্ট এআই চালু আছে";
            aiBadgeDesc.textContent = "যেকোনো প্রশ্ন মুখে বলুন, অ্যাঞ্জেলা উত্তর দেবে!";
            inputGeminiKey.value = '';
        }
    }

    if (btnAiSettings && modalAiSettings) {
        btnAiSettings.addEventListener('click', () => {
            updateAiSettingsUI();
            modalAiSettings.classList.add('open');
        });
    }

    if (btnSaveGemini) {
        btnSaveGemini.addEventListener('click', () => {
            const key = (inputGeminiKey.value || '').trim();
            if (key) {
                window.angelaVoiceAI.setGeminiKey(key);
                updateAiSettingsUI();
                modalAiSettings.classList.remove('open');
                angelaSpeak("তোমার জেমিনি এআই ব্রেন কানেক্ট হয়ে গেছে! আমাকে যেকোনো কিছু জিজ্ঞেস করো ডার্লিং!");
            }
        });
    }

    if (btnClearGemini) {
        btnClearGemini.addEventListener('click', () => {
            window.angelaVoiceAI.clearGeminiKey();
            updateAiSettingsUI();
            angelaSpeak("এআই কি মুছে ফেলা হয়েছে। এখন বিল্ট-ইন ব্রেন কাজ করবে!");
        });
    }

    // Text Chat input handler (for typing to AI)
    const textChatInput = document.getElementById('text-chat-input');
    const btnTextSend = document.getElementById('btn-text-send');

    async function handleTextSend() {
        if (!textChatInput) return;
        const query = textChatInput.value.trim();
        if (!query) return;

        textChatInput.value = '';
        if (activeMode !== 'ai') {
            switchMode('ai');
        }

        window.angelaVoiceAI.pauseForAngelaSpeech();
        statusLabel.textContent = currentLang === 'bn' ? "🐱 অ্যাঞ্জেলা ভাবছে..." : "🐱 Angela is thinking...";
        statusDot.className = "status-dot speaking";

        const answer = await window.angelaVoiceAI.getAnswer(query);
        spawnParticles(canvas.width / 2, canvas.height * 0.35, ['💖', '✨', '🌸', '💡'], 16);

        statusLabel.textContent = currentLang === 'bn' ? "🐱 অ্যাঞ্জেলা উত্তর দিচ্ছে..." : "🐱 Angela is answering...";
        await angelaSpeak(answer);

        if (activeMode === 'ai' && !isSinging) {
            statusLabel.textContent = currentLang === 'bn' 
                ? "🎙️ শুনছি... সরাসরি কথা বলুন (অটো চলবে)" 
                : "🎙️ Listening... Speak naturally (Hands-Free)";
            statusDot.className = "status-dot";
            window.angelaVoiceAI.resumeAfterAngelaSpeech();
        }
    }

    if (btnTextSend) {
        btnTextSend.addEventListener('click', handleTextSend);
    }
    if (textChatInput) {
        textChatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleTextSend();
        });
    }

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.dataset.close;
            if (modalId) {
                document.getElementById(modalId).classList.remove('open');
            }
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('open');
            }
        });
    });

    // Treats Food Feeding
    document.querySelectorAll('[data-food]').forEach(tile => {
        tile.addEventListener('click', () => {
            const foodEmoji = tile.dataset.food;
            const foodName = tile.dataset.name;
            modalTreats.classList.remove('open');

            foodFeeder.textContent = foodEmoji;
            foodFeeder.style.opacity = '1';
            foodFeeder.style.bottom = '15%';
            foodFeeder.style.left = '50%';
            foodFeeder.style.transform = 'translate(-50%, 0) scale(1.6)';

            setTimeout(() => {
                foodFeeder.style.bottom = '55%';
                foodFeeder.style.transform = 'translate(-50%, 0) scale(0.6)';
            }, 50);

            setTimeout(() => {
                foodFeeder.style.opacity = '0';
                if (soundEnabled && window.angelaAudio) {
                    window.angelaAudio.playMunch();
                }

                angelaFrame.classList.add('bouncing');
                spawnParticles(canvas.width / 2, canvas.height * 0.4, [foodEmoji, '😋', '💖', '✨'], 14);

                const phrase = currentLang === 'bn'
                    ? `ইয়াম্মি! কী দারুণ মিষ্টি ${foodName}! অনেক ধন্যবাদ সোনা! আসসালামু আলাইকুম! 😋🥛`
                    : `Mmm! Delicious ${foodName}! Thank you my sweetheart! 😋🧁`;

                angelaSpeak(phrase).then(() => {
                    angelaFrame.classList.remove('bouncing');
                });
            }, 650);
        });
    });

    // ==========================================
    // DRESS UP & INTERACTIVE 3D FASHION TWIRL
    // ==========================================
    document.querySelectorAll('[data-acc]').forEach(tile => {
        tile.addEventListener('click', () => {
            const acc = tile.dataset.acc;
            modalDressup.classList.remove('open');

            // Trigger interactive 3D fashion twirl animation!
            angelaFrame.classList.remove('twirling');
            void angelaFrame.offsetWidth; // trigger reflow
            angelaFrame.classList.add('twirling');

            // Sparkling confetti explosion
            spawnParticles(canvas.width / 2, canvas.height * 0.35, ['👗', '✨', '👑', '💖', '🎀', '🌸'], 24);
            if (soundEnabled && window.angelaAudio) window.angelaAudio.playSparkle();

            setTimeout(() => {
                angelaFrame.classList.remove('twirling');
            }, 900);

            if (acc === 'clear') {
                document.getElementById('accessory-glasses').style.display = 'none';
                document.getElementById('accessory-tiara').style.display = 'none';
                document.getElementById('accessory-flower').style.display = 'none';
                dressGlow.className = 'dress-glow-layer';
                
                const phrase = currentLang === 'bn' ? "স্বাভাবিক সাজেই আমি সবচেয়ে মিষ্টি!" : "Natural beauty is always chic!";
                angelaSpeak(phrase);
                return;
            }

            if (acc === 'glasses') {
                const glasses = document.getElementById('accessory-glasses');
                const isShown = glasses.style.display === 'block';
                glasses.style.display = isShown ? 'none' : 'block';

                const phrase = isShown ? "সানগ্লাস খুলে ফেললাম!" : "ওয়াও! এই স্টাইলিশ সানগ্লাস পরে আমাকে একদম ফ্যাশন স্টার লাগছে!";
                angelaSpeak(phrase);
                return;
            }

            if (acc === 'tiara') {
                const tiara = document.getElementById('accessory-tiara');
                const isShown = tiara.style.display === 'block';
                tiara.style.display = isShown ? 'none' : 'block';

                const phrase = isShown ? "মুকুট রেখে দিলাম!" : "ওওওহ লা লা! আমার মাথায় সোনার মুকুট! আমি কি রাজকুমারী হয়ে গেলাম?";
                angelaSpeak(phrase);
                return;
            }

            if (acc === 'flower') {
                const flower = document.getElementById('accessory-flower');
                const isShown = flower.style.display === 'block';
                flower.style.display = isShown ? 'none' : 'block';

                const phrase = isShown ? "ফুল খুলে রাখলাম!" : "আমার কানে মিষ্টি গোলাপী ফুল! আমাকে দেখতে অনেক মিষ্টি লাগছে তাই না?";
                angelaSpeak(phrase);
                return;
            }

            if (acc === 'dress_princess') {
                dressGlow.className = 'dress-glow-layer princess';
                const phrase = "ওয়াও! এই গোলাপি প্রিন্সেস গাউনে আমাকে সত্যি রূপকথার রাজকুমারীর মতো লাগছে!";
                angelaSpeak(phrase);
                return;
            }

            if (acc === 'dress_fairy') {
                dressGlow.className = 'dress-glow-layer fairy';
                const phrase = "ওওওহ লা লা! এই জাদুকরি পরীর ফ্রক পরে আমার উড়তে ইচ্ছে করছে!";
                angelaSpeak(phrase);
                return;
            }
        });
    });

    // Language Toggle
    btnLangToggle.addEventListener('click', () => {
        currentLang = currentLang === 'bn' ? 'en' : 'bn';
        langLabel.textContent = currentLang === 'bn' ? 'English' : 'বাংলা';
        langIndicator.textContent = currentLang === 'bn' ? 'পিওর ভয়েস গেম (Pure Voice) ✨' : 'Pure Voice Game 🎀';

        if (soundEnabled && window.angelaAudio) window.angelaAudio.playSparkle();

        if (currentLang === 'bn') {
            angelaSpeak("আসসালামু আলাইকুম ছোট্ট বন্ধু! আমি অ্যাঞ্জেলা! আমার সাথে সরাসরি মুখে কথা বলো!");
        } else {
            angelaSpeak("Assalamu Alaikum little star! I am Angela! Speak to me naturally!");
        }

        if (activeMode === 'ai') {
            startContinuousAI();
        }
    });

    // Sound Toggle
    btnSoundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        btnSoundToggle.textContent = soundEnabled ? '🔊' : '🔇';
        if (!soundEnabled) {
            window.angelaAudio.stopSpeaking();
            window.angelaAudio.stopMusic();
        } else {
            window.angelaAudio.playSparkle();
        }
    });

    // Initial greeting in human voice and start continuous AI
    setTimeout(() => {
        angelaSpeak("আসসালামু আলাইকুম সোনামণি! আমি টকিং অ্যাঞ্জেলা! আমাকে সরাসরি মুখে যেকোনো প্রশ্ন করো, আমি নিজেই উত্তর দেব!").then(() => {
            startContinuousAI();
        });
        spawnParticles(canvas.width / 2, canvas.height * 0.35, ['💖', '🎀', '✨'], 14);
    }, 1000);
});
