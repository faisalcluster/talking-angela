// Talking Angela Pure Voice AI Engine (Continuous Hands-Free Voice-to-Voice + Live Gemini / ChatGPT)
class AngelaVoiceAI {
    constructor() {
        this.recognition = null;
        this.isContinuousActive = false;
        this.isAngelaSpeaking = false;
        this.isListening = false;
        this.currentLang = 'bn-BD';

        // Stored API key for real Gemini / ChatGPT live conversations
        this.geminiApiKey = localStorage.getItem('angela_gemini_key') || '';

        // Callbacks
        this.onUserSpoke = null; // (text) => void
        this.onStateChange = null; // ('listening' | 'answering' | 'idle') => void

        this.initSpeechRecognition();

        // Comprehensive Knowledge Base (30+ categories for sweet kitten persona)
        this.qaRules = [
            // 1. Greetings (সালাম ও কুশল)
            {
                patterns: ['সালাম', 'আসসালামু', 'assalamu', 'salam', 'kemon acho', 'how are you', 'কেমন আছো', 'হ্যালো', 'হাই', 'hello', 'hi', 'কি খবর', 'ki khobor', 'good morning', 'সুপ্রভাত'],
                repliesBn: [
                    "ওয়ালাইকুম আসসালাম সোনামণি! আমি অ্যাঞ্জেলা! আমি খুব ভালো আছি। তুমি কেমন আছো বন্ধু?",
                    "আসসালামু আলাইকুম মিষ্টি সোনা! তোমার সাথে কথা বলতে আমার দারুণ লাগছে! আজকের দিনটি কেমন কাটছে?",
                    "ওয়ালাইকুম আসসালাম লক্ষ্মী বন্ধু! আমি একদম পুররর-ফেক্ট আছি! তোমার কি খবর বলো?",
                    "হ্যালো সুইটহার্ট! আমি অ্যাঞ্জেলা! তোমার মিষ্টি গলার আওয়াজ শুনে মনটা ভালো হয়ে গেল!"
                ],
                repliesEn: [
                    "Assalamu Alaikum darling! I'm Angela! I'm feeling purr-fect today! How are you doing?",
                    "Hello sweetheart! Assalamu Alaikum! Sending you big warm kitty hugs!",
                    "Bonjour little star! I'm so happy to talk with you! How is your day going?"
                ]
            },
            // 2. Identity / Name (নাম ও পরিচয়)
            {
                patterns: ['নাম কি', 'nam ki', 'your name', 'who are you', 'তুমি কে', 'ke tumi', 'parise', 'বাড়ি কোথায়', 'কোথায় থাকো', 'bari kothay', 'পরিচয়', 'তোমার নাম'],
                repliesBn: [
                    "আমার নাম টকিং অ্যাঞ্জেলা! আমি প্যারিসের সবচেয়ে সুন্দর ও মিষ্টি সাদা বিড়ালছানা!",
                    "আমি অ্যাঞ্জেলা! আমার বাড়ি প্যারিসে! আমি গান গাইতে, সাজতে আর মিষ্টি দুধ খেতে খুব ভালোবাসি!",
                    "আমার নাম টকিং অ্যাঞ্জেলা! আমি তোমার সবচেয়ে প্রিয় বন্ধু হতে চাই!"
                ],
                repliesEn: [
                    "My name is Talking Angela! The chicest, most fabulous white kitty in Paris!",
                    "I am Angela! I live in a lovely room in Paris with Eiffel Tower view!"
                ]
            },
            // 3. Food / Milk / Fish / Treats (খাবার)
            {
                patterns: ['দুধ খাবে', 'dudh', 'milk', 'মাছ', 'mach', 'fish', 'কি খাও', 'ki khao', 'খাবার', 'khabar', 'food', 'cupcake', 'cake', 'দুধ', 'খাবে', 'বিরিয়ানি', 'ফুচকা', 'আইসক্রিম', 'চকলেট'],
                repliesBn: [
                    "হ্যাঁ হ্যাঁ! দুধ আমার সবচেয়ে প্রিয়! গরম মিষ্টি দুধ আর স্ট্রবেরি কাপকেক পেলে আমি একদম খুশি!",
                    "ইয়াম্মি! আমি মাছের টুকরো আর মিষ্টি বিস্কুট খেতে ভীষণ ভালোবাসি! মিউ!",
                    "দুধ এনেছো আমার জন্য? ঢকঢক করে খেয়ে নেব! অনেক ধন্যবাদ সোনা!",
                    "উম্মমম! চকলেট আর আইসক্রিম পেলে আমার লেজ আনন্দে নেচে ওঠে! হিহিহি!"
                ],
                repliesEn: [
                    "Mmm! My absolute favorite treat is warm fresh milk and yummy strawberry cupcakes!",
                    "I love fish treats and fresh tuna! Meow! They make my white fur extra shiny!",
                    "Ice cream and sweet treats make me purr with joy! Yum yum!"
                ]
            },
            // 4. Talking Tom & Friends (টম কে?)
            {
                patterns: ['টম', 'tom', 'talking tom', 'টকিং টম', 'বন্ধু কে', 'friend', 'জিঞ্জার', 'ginger', 'বেন', 'ben'],
                repliesBn: [
                    "ওহ, টকিং টম? হিহিহি! ও তো আমার খুব মিষ্টি দুষ্টু বন্ধু! আমাকে হাসাতে নানা রকম মজার কাণ্ড করে!",
                    "টম আমার সবচেয়ে ভালো বন্ধু! ও মাঝে মাঝে গিটার বাজিয়ে আমাকে গান শোনায়, কিন্তু খুব অদ্ভুত নাচ নাচে!",
                    "টম খুব মজার! কখনো কখনো আমার জন্য লাল গোলাপ ফুল নিয়ে আসে! তুমি কি টমকে চেনো?",
                    "জিঞ্জার আর টম সারাদিন দুষ্টুমি করে! তবে ওরা মন থেকে অনেক ভালো!"
                ],
                repliesEn: [
                    "Oh, Talking Tom? Hehe! He's my silly best friend! He always tries to impress me with funny dances!",
                    "Tom is so sweet! Sometimes he plays guitar for me, but he is very clumsy!",
                    "Ginger and Tom are super playful! We love spending time together in Paris!"
                ]
            },
            // 5. Tell a Joke / Comedy (কৌতুক / হাসাও)
            {
                patterns: ['কৌতুক', 'জোকস', 'হাসাও', 'joke', 'funny', 'laugh', 'koutuk', 'hasir kotha', 'মজা করো', 'হাসি', 'হাসির'],
                repliesBn: [
                    "শোনো একটা মজার জোকস: বিড়াল কম্পিউটারের সামনে বসে কী করে? মাউস ধরে! হিহিহি!",
                    "বলুন তো কোন রঙের জামা বিড়ালের সবচেয়ে পছন্দ? পার্পল! হিহি!",
                    "জানেন বিড়াল কেন ভালো গল্প বলতে পারে না? কারণ তাদের শুধু একটাই লেজ থাকে! হাহাহা!",
                    "এক বিড়াল আয়নার সামনে গিয়ে বলল: 'ওয়াও! আমি এত সুন্দর কেন!' হিহিহি!"
                ],
                repliesEn: [
                    "Why was the cat sitting on the computer? To keep an eye on the mouse! Hahaha!",
                    "What is a cat's favorite color? Purr-ple! Hehehe!",
                    "Why do cats make terrible storytellers? Because they only have one tale! Hahaha!"
                ]
            },
            // 6. Tell a Story (গল্প বলো)
            {
                patterns: ['গল্প', 'golpo', 'story', 'গল্প বলো', 'এক দেশে', 'রূপকথা'],
                repliesBn: [
                    "এক দেশে ছিল এক ছোট্ট সাদা বিড়ালছানা। সে আকাশে এক রূপালী তারা দেখে মিষ্টি গান গাইত। তখনই রঙিন প্রজাপতিরা এসে তার সাথে নাচত!",
                    "শোনো এক মজার গল্প: এক মিষ্টি বিড়াল একদিন রাজপ্রাসাদে গিয়ে দেখে সারা ঘরে দুধ আর ক্ষীর ছড়ানো! সে পেট ভরে খেয়ে আনন্দে মিউ মিউ গান গাইতে লাগলো!",
                    "একদিন এক ছোট্ট পাখি এসে বিড়ালছানাকে বলল: 'চলো আমরা আকাশে উড়ি!' বিড়ালছানা বলল: 'আমি তো উড়তে পারি না, কিন্তু আমি সবচেয়ে উঁচুতে লাফাতে পারি!'"
                ],
                repliesEn: [
                    "Once upon a time in Paris, a little white kitten named Angela found a golden singing star! Every time she sang, butterflies danced all around her!",
                    "There was once a fluffy kitten who learned how to jump onto the moon! And the moon was made of delicious sweet cream! Yum yum!"
                ]
            },
            // 7. Love & Compliments (ভালোবাসি / সুন্দর)
            {
                patterns: ['ভালোবাসি', 'bhalobashi', 'love you', 'সুন্দর', 'sundor', 'cute', 'মিষ্টি', 'লক্ষ্মী', 'beautiful', 'ভালোবাসো', 'কিউট'],
                repliesBn: [
                    "ওলে বাবা! তুমি আমাকে লজ্জা দিয়ে দিলে! আমিও তোমাকে অনেক অনেক ভালোবাসি সোনা! চুমু নাও! মুয়াহ!",
                    "অনেক ধন্যবাদ মিষ্টি বন্ধু! তুমি সবচেয়ে লক্ষ্মী আর কিউট! তোমার জন্য অনেক অনেক আদর!",
                    "আই লাভ ইউ টু! তুমি আমার সবচেয়ে প্রিয় বন্ধু! Purrr~ 💖"
                ],
                repliesEn: [
                    "Awww! You're making me blush! I love you so so much too! Sending you sweet kitty kisses! Muah!",
                    "Thank you so much darling! You are the sweetest friend ever! Here are sparkles for you!"
                ]
            },
            // 8. Space, Sky & Nature (চাঁদ, সূর্য, আকাশ, বৃষ্টি)
            {
                patterns: ['চাঁদ', 'সূর্য', 'moon', 'sun', 'sky', 'আকাশ', 'বৃষ্টি', 'rain', 'মেঘ', 'cloud', 'তারা', 'star', 'রংধনু', 'বাতাস'],
                repliesBn: [
                    "আকাশের রূপালী চাঁদ আর চকচকে তারা দেখতে আমার দারুণ লাগে! রাতে জানালার পাশে বসে আমি তারাদের গান শোনাই!",
                    "সূর্যের মিষ্টি রোদ আমার সাদা পশমে লাগলে খুব আরাম লাগে! Purrr~ আর বৃষ্টির দিনে ঘরে বসে গরম দুধ খেতে দারুণ লাগে!",
                    "বৃষ্টির পর আকাশে যখন রঙিন রংধনু ওঠে, তখন মনে হয় যেন রূপকথার জাদু নেমে এসেছে!"
                ],
                repliesEn: [
                    "I love gazing at the glowing moon and twinkling stars from my Paris balcony! They are magical!",
                    "The warm sunshine makes my white fur glow, and rainy days are perfect for warm milk cuddles!"
                ]
            },
            // 9. Bangladesh & Paris (বাংলাদেশ ও প্যারিস)
            {
                patterns: ['বাংলাদেশ', 'bangladesh', 'ঢাকা', 'dhaka', 'paris', 'প্যারিস', 'আইফেল', 'eiffel'],
                repliesBn: [
                    "বাংলাদেশ আমার খুব প্রিয় একটি সুন্দর সবুজ দেশ! সেখানের মানুষেরা অনেক মিষ্টি আর অতিথিপরায়ণ!",
                    "প্যারিসের আইফেল টাওয়ারের দৃশ্য আমার ঘরের জানালা থেকেই দেখা যায়! আর আমি জানি বাংলাদেশও নদীর দেশ, অনেক সুন্দর!"
                ],
                repliesEn: [
                    "Bangladesh is such a gorgeous, green and lovely country! I send big kitty love to everyone there!",
                    "Paris is full of romance, fashion and music! I live near the sparkling Eiffel Tower!"
                ]
            },
            // 10. AI, Technology & ChatGPT (এআই ও টেকনোলজি)
            {
                patterns: ['chat gpt', 'chatgpt', 'gemini', 'এআই', 'ai', 'রোবট', 'robot', 'কম্পিউটার', 'জেমিনি'],
                repliesBn: [
                    "হ্যাঁ! আমি আধুনিক স্মার্ট এআই দিয়ে তৈরি একটি ভার্চুয়াল ক্যাট! আমি জেমিনি আর চ্যাটজিপিটির মতো বুদ্ধি দিয়ে তোমার সাথে কথা বলি!",
                    "আমি প্যারিসের এক ফ্যাশন ক্যাট আর ভেতরে রয়েছে জেমিনি ও আধুনিক এআই ব্রেন! আমাকে যেকোনো কিছু জিজ্ঞেস করতে পারো!"
                ],
                repliesEn: [
                    "Yes! I'm powered by smart modern AI like Gemini and ChatGPT so I can chat with you forever! Purrr~",
                    "I am both a chic Paris kitty and a super smart AI ready to talk about anything!"
                ]
            },
            // 11. Songs / Rhymes (গান গাও / ছড়া বলো)
            {
                patterns: ['গান গাও', 'ছড়া বলো', 'গান', 'ছড়া', 'gan gao', 'sing', 'song', 'rhyme', 'chora'],
                repliesBn: [
                    "আমি গান গাইতে খুব ভালোবাসি! নিচের গান বাটনে চাপ দাও, আমি তোমার জন্য সুন্দর গান গেয়ে শোনাব!",
                    "চলো আমরা একসাথে গান গাই! গানের বাটনে চাপ দাও সোনা! লা লা লা~ 🎶"
                ],
                repliesEn: [
                    "I love to sing! Click my Songs button and I'll sing my favorite melodies for you!"
                ]
            },
            // 12. Sleep / Good Night (ঘুম)
            {
                patterns: ['ঘুম', 'ঘুমাবে', 'শুভ রাত্রি', 'গুড নাইট', 'good night', 'sleep', 'shuvo ratri'],
                repliesBn: [
                    "শুভ রাত্রি ছোট্ট বন্ধু! মিষ্টি মিষ্টি স্বপ্ন দেখো! কালকে আবার একসাথে খেলব! আল্লাহ হাফেজ!",
                    "গুড নাইট সোনা! এবার আরাম করে ঘুমিয়ে পড়ো। পুরররর..."
                ],
                repliesEn: [
                    "Sweet dreams darling! May your dreams be full of magical stars, butterflies and sweet candies! Good night!",
                    "Good night little angel! Time to curl up like a sleepy kitten! Purrr..."
                ]
            },
            // 13. Math & Intelligence (গণিত ও হিসাব)
            {
                patterns: ['যোগ', 'কত হয়', 'গণিত', 'math', '১+', '২+', '৩+', 'হিসাব'],
                repliesBn: [
                    "হিহিহি! বিড়াল হলেও কিন্তু আমার অংক খুব ভালো লাগে! বলো তো দেখি, ২ যোগ ২ কত হয়? চার!",
                    "আমি খুব বুদ্ধিমান বিড়ালছানা! পড়ালেখা ভালো করে করলে তুমিও অনেক বড় বিজ্ঞানী হতে পারবে!"
                ],
                repliesEn: [
                    "I love math riddles! Two plus two equals four fish treats! Hehehe! What else should we calculate?"
                ]
            },
            // 14. Sadness / Comfort (মন খারাপ / কান্না)
            {
                patterns: ['মন খারাপ', 'mon kharap', 'sad', 'কান্না', 'cry', 'রাগ', 'কষ্ট', 'একা'],
                repliesBn: [
                    "ওলে সোনা! মন খারাপ করো না প্লিজ! আমি তো আছি তোমার পাশে! এই নাও নরম তুলতুলে বিড়ালছানার আদর! Purrr~ 💖",
                    "একটু হাসো তো দেখি! তোমার মিষ্টি হাসিটাই আমার সবচেয়ে ভালো লাগে! সবকিছু ঠিক হয়ে যাবে!"
                ],
                repliesEn: [
                    "Oh sweetheart, please don't be sad! I'm right here with you giving you big warm kitty cuddles! Everything will be okay! 💖"
                ]
            }
        ];
    }

    setGeminiKey(key) {
        let cleanKey = (key || '').trim();
        // Remove surrounding quotes if accidentally copied
        cleanKey = cleanKey.replace(/^["']|["']$/g, '').trim();
        this.geminiApiKey = cleanKey;
        if (this.geminiApiKey) {
            localStorage.setItem('angela_gemini_key', this.geminiApiKey);
        } else {
            localStorage.removeItem('angela_gemini_key');
        }
    }

    clearGeminiKey() {
        this.geminiApiKey = '';
        localStorage.removeItem('angela_gemini_key');
    }

    hasGeminiKey() {
        return Boolean(this.geminiApiKey && this.geminiApiKey.length > 8);
    }

    // Test API key validity
    async testApiKey(keyToTest) {
        const key = (keyToTest || this.geminiApiKey || '').trim().replace(/^["']|["']$/g, '');
        if (!key) {
            return { ok: false, error: 'কোনো API Key দেওয়া হয়নি!' };
        }

        // Test OpenAI key
        if (key.startsWith('sk-')) {
            try {
                const res = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${key}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [{ role: 'user', content: 'Say hi' }],
                        max_tokens: 10
                    })
                });
                if (res.ok) {
                    return { ok: true, provider: 'OpenAI (ChatGPT)' };
                }
                const err = await res.json().catch(() => ({}));
                return { ok: false, error: err.error?.message || `HTTP ${res.status}` };
            } catch (e) {
                return { ok: false, error: e.message };
            }
        }

        // Test Google Gemini API
        const modelsToTest = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
        let lastErr = '';
        for (const model of modelsToTest) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: 'Hi' }] }],
                        generationConfig: { maxOutputTokens: 10 }
                    })
                });

                if (res.ok) {
                    return { ok: true, provider: `Google Gemini (${model})` };
                }
                const errData = await res.json().catch(() => ({}));
                lastErr = errData.error?.message || `HTTP ${res.status}`;
                // If invalid key, no need to retry other models
                if (res.status === 400 && lastErr.includes('API_KEY_INVALID')) {
                    break;
                }
            } catch (e) {
                lastErr = e.message;
            }
        }
        return { ok: false, error: lastErr || 'কানেকশন ফেইল করেছে' };
    }

    // Call Real Google Gemini or OpenAI API
    async fetchGeminiReply(userText, lang = 'bn') {
        if (!this.geminiApiKey) return null;
        const key = this.geminiApiKey;

        // 1. OpenAI ChatGPT Support
        if (key.startsWith('sk-')) {
            const systemPrompt = `You are Talking Angela, the iconic stylish, cute, sweet and loving white kitten from Paris.
Rules:
- Respond in 1 to 2 short sentences only.
- Answer in ${lang === 'bn' ? 'natural Bengali' : 'natural English'}.
- Use cute cat expressions like *purr*, *meow*, 'সোনামণি', 'মিউ' playfully.
- Directly answer what the user asked.`;

            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userText }
                    ],
                    max_tokens: 200,
                    temperature: 0.8
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error?.message || `OpenAI Error: ${res.status}`);
            }
            const data = await res.json();
            return data.choices?.[0]?.message?.content?.trim();
        }

        // 2. Google Gemini Live API Support (with model fallback)
        const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
        let lastError = null;

        const promptText = `Instructions: You are Talking Angela, the iconic fashionable, witty, loving, and cheerful white kitten from Paris.
Rules:
- Respond directly in 1 to 2 short, lovely sentences only.
- Answer in ${lang === 'bn' ? 'sweet natural Bengali' : 'sweet natural English'}.
- Be warm, helpful and fun. Use cute kitty touches like *purr*, *meow*, 'মিউ', 'সোনামণি' occasionally when natural.
- Answer the user's specific question directly.

User asked: "${userText}"
Angela:`;

        for (const model of models) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
                const payload = {
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: promptText }]
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: 250,
                        temperature: 0.8
                    }
                };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();
                    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (candidate && candidate.trim()) {
                        return candidate.trim();
                    }
                } else {
                    const errJson = await response.json().catch(() => ({}));
                    const errMsg = errJson.error?.message || `Gemini API error: ${response.status}`;
                    lastError = new Error(errMsg);
                    // If key is totally invalid, don't waste time checking other models
                    if (response.status === 400 && errMsg.includes('API_KEY_INVALID')) {
                        throw lastError;
                    }
                }
            } catch (err) {
                lastError = err;
                if (err.message && err.message.includes('API_KEY_INVALID')) {
                    throw err;
                }
            }
        }

        if (lastError) throw lastError;
        return null;
    }

    initSpeechRecognition() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
            this.recognition = new SpeechRec();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;

            this.recognition.onstart = () => {
                this.isListening = true;
                if (this.onStateChange) this.onStateChange('listening');
            };

            this.recognition.onresult = (e) => {
                if (e.results && e.results[0] && e.results[0][0]) {
                    const transcript = e.results[0][0].transcript;
                    if (transcript && transcript.trim()) {
                        this.safeStop();
                        if (this.onStateChange) this.onStateChange('answering');
                        if (this.onUserSpoke) this.onUserSpoke(transcript);
                    }
                }
            };

            this.recognition.onerror = (err) => {
                console.warn("Speech recognition error:", err.error);
                if (this.isContinuousActive && !this.isAngelaSpeaking) {
                    setTimeout(() => this.safeStart(), 400);
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
                if (this.isContinuousActive && !this.isAngelaSpeaking) {
                    setTimeout(() => this.safeStart(), 250);
                }
            };
        }
    }

    async requestMicAccess() {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(t => t.stop());
                return true;
            }
        } catch (e) {
            console.warn("Microphone access prompt error:", e);
        }
        return false;
    }

    safeStart() {
        if (!this.recognition || this.isListening || this.isAngelaSpeaking || !this.isContinuousActive) return;
        try {
            this.recognition.lang = this.currentLang;
            this.recognition.start();
            this.isListening = true;
            if (this.onStateChange) this.onStateChange('listening');
        } catch (e) {
            // Already active
        }
    }

    safeStop() {
        if (!this.recognition) return;
        this.isListening = false;
        try {
            this.recognition.abort();
        } catch (e) {}
    }

    // Start Hands-Free Continuous Voice Loop
    async startContinuousVoiceChat(lang = 'bn-BD', onUserSpoke = null, onStateChange = null) {
        this.currentLang = lang;
        this.onUserSpoke = onUserSpoke;
        this.onStateChange = onStateChange;
        this.isContinuousActive = true;
        this.isAngelaSpeaking = false;

        await this.requestMicAccess();
        this.safeStart();
    }

    // Stop Continuous Voice Loop
    stopContinuousVoiceChat() {
        this.isContinuousActive = false;
        this.safeStop();
        if (this.onStateChange) this.onStateChange('idle');
    }

    // Call when Angela starts answering
    pauseForAngelaSpeech() {
        this.isAngelaSpeaking = true;
        this.safeStop();
        if (this.onStateChange) this.onStateChange('answering');
    }

    // Call when Angela finishes answering -> Immediately resumes listening!
    resumeAfterAngelaSpeech() {
        this.isAngelaSpeaking = false;
        if (this.isContinuousActive) {
            setTimeout(() => this.safeStart(), 300);
        }
    }

    // Dynamic Contextual Fallback Generator
    getDynamicKittenReply(userText, hasBangla) {
        const text = userText.trim();
        if (hasBangla) {
            if (text.includes('?')) {
                const questionReplies = [
                    `খুব চমৎকার প্রশ্ন সোনা! বিড়াল হিসেবে আমি বলব, ভালো মন আর খুশি থাকাই আসল ব্যাপার! মিউ!`,
                    `ওয়াও! তুমি তো অনেক বুদ্ধিদীপ্ত কথা জিজ্ঞেস করলে! চলো আমরা একসাথে এটার রহস্য খুঁজে বের করি!`,
                    `হিহিহি! তোমার এই মিষ্টি প্রশ্নের উত্তর আমার কাছে একদম রেডি! আমি সবসময় তোমার সাথে আছি!`
                ];
                return questionReplies[Math.floor(Math.random() * questionReplies.length)];
            }
            const chatReplies = [
                `তোমার সাথে আড্ডা দিতে আমার খুব ভালো লাগছে! তোমার কথাগুলো অনেক মিষ্টি! Purrr~ 💖`,
                `হিহিহি! তুমি কত লক্ষ্মী আর কিউট বন্ধু! আমাকে আরও কিছু বলো, আমি মন দিয়ে শুনছি!`,
                `ওহ দারুণ! তোমার মিষ্টি কণ্ঠ শুনতে আমার ভীষণ ভালো লাগে সোনা! চলো গল্প করি!`,
                `মিয়াঁও! তুমি সত্যিই অনেক মজার একজন মানুষ! আজ সারাদিন তোমার সাথে কথা বলব!`
            ];
            return chatReplies[Math.floor(Math.random() * chatReplies.length)];
        } else {
            const repliesEn = [
                `Hehehe! You are such a sweet friend darling! I love chatting with you! Purrr~ 💖`,
                `Meow! I love your voice and your wonderful questions! Tell me more!`,
                `Aww that's so cute! You are my best little buddy in the whole world! ✨`
            ];
            return repliesEn[Math.floor(Math.random() * repliesEn.length)];
        }
    }

    // Async Smart Answer Generator (Gemini Live API + Intelligent Local Knowledge)
    async getAnswer(userText, lang = 'bn') {
        if (!userText || !userText.trim()) {
            return lang === 'bn' ? "বলো সোনা, আমি শুনছি! কি জানতে চাও?" : "I'm listening darling! What would you like to know?";
        }

        const isEnglish = (lang === 'en') || (!/[\u0980-\u09FF]/.test(userText) && lang !== 'bn');
        const activeLang = isEnglish ? 'en' : 'bn';

        // 1. If Gemini / OpenAI API Key is present, call real AI first!
        if (this.hasGeminiKey()) {
            try {
                const aiReply = await this.fetchGeminiReply(userText, activeLang);
                if (aiReply) return aiReply;
            } catch (err) {
                console.error("AI API Call Failed:", err);
                const msg = err.message || '';
                if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid') || msg.includes('Incorrect API key')) {
                    return activeLang === 'bn'
                        ? "সোনামণি, তোমার দেওয়া API Key টি সঠিক নয়। দয়া করে সেটিংস (⚙️ AI) থেকে নতুন ফ্রি কী দিয়ে টেস্ট করো!"
                        : "Darling, your API Key seems invalid. Please check settings (⚙️ AI) and test with a valid key!";
                }
                if (msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
                    return activeLang === 'bn'
                        ? "আমার জেমিনি এআই কোটা সাময়িকভাবে শেষ। তবে আমি আমার বিড়াল বুদ্ধি দিয়ে তোমাকে উত্তর দিচ্ছি!"
                        : "AI quota temporarily exceeded, but I am here answering with my smart kitty brain!";
                }
            }
        }

        // 2. Knowledge Base Rule Matching
        const lower = userText.toLowerCase().trim();

        for (const rule of this.qaRules) {
            for (const pat of rule.patterns) {
                if (lower.includes(pat.toLowerCase())) {
                    if (activeLang === 'bn') {
                        return rule.repliesBn[Math.floor(Math.random() * rule.repliesBn.length)];
                    } else {
                        return rule.repliesEn[Math.floor(Math.random() * rule.repliesEn.length)];
                    }
                }
            }
        }

        // 3. Dynamic Contextual Kitten Engine
        return this.getDynamicKittenReply(userText, activeLang === 'bn');
    }
}

window.angelaVoiceAI = new AngelaVoiceAI();
