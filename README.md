# 🐱 Talking Angela Web (Classic Repeat & Smart AI)

একটি ব্রাউজার-রেডি **Talking Angela** ওয়েব অ্যাপ যা সম্পূর্ণ ক্লায়েন্ট-সাইডে চলে এবং সরাসরি **GitHub Pages**-এ বিনামূল্যে হোস্ট করা যায়।

---

## ✨ ফিচারসমূহ

1. **🔁 কার্টুন রিপিট মোড (Classic Talking Tom / Angela Style):**
   - ব্রাউজারের মাইক্রোফোন দিয়ে কথা শুনবে।
   - কথা শেষ হলে স্বয়ংক্রিয়ভাবে ডিটেক্ট করে কার্টুন পিচে (Pitch Shift - চিকন কিউট কন্ঠ) হুবহু কথাটি রিপ্লে করবে।
   - কথা বলার সময় অ্যাঞ্জেলার মুখ এবং ঠোঁট অ্যানিমেশন (Lip-sync) করবে।

2. **🤖 স্মার্ট AI মোড (Gemini & ChatGPT Style):**
   - আপনি যা বলবেন বা টাইপ করবেন, তা শুনে আসল এআই বুদ্ধিমত্তা দিয়ে উত্তর দেবে।
   - বাংলা, বাংলিশ এবং ইংরেজি বুঝতে ও মিষ্টি কন্ঠে উত্তর দিতে পারে।
   - **Google Gemini API** সাপোর্ট (Settings থেকে ফ্রি API Key সেট করা যায়, যা ইউজারের লোকাল ব্রাউজারে সংরক্ষিত থাকে)।
   - API Key ছাড়াও তাত্ক্ষণিকভাবে টেস্ট করার জন্য **বিল্ট-ইন স্মার্ট AI ইঞ্জিন** দেওয়া আছে।

3. **🐾 কিউট ইন্টারেকশন ও রিঅ্যাকশন:**
   - মাথায় হাত বোলালে (Pet) গুড়গুড় শব্দ (Purr) এবং ভালোবাসার হার্ট পার্টিকেল।
   - পেটে ট্যাপ করলে সুড়সুড়ি (Tickle & Giggle) রিঅ্যাকশন।
   - কানে ট্যাপ করলে কান নাড়ানো (Ear twitch) ও মিয়াঁও শব্দ।

---

## 🚀 GitHub Pages-এ লাইভ হোস্ট করার নিয়ম (২ মিনিটে)

### ধাপ ১: GitHub-এ একটি নতুন রিপোজিটরি তৈরি করুন
1. [github.com/new](https://github.com/new) এ যান।
2. Repository name দিন: `talking-angela` (অথবা আপনার পছন্দমতো নাম)।
3. এটি **Public** রাখুন এবং "Create repository" বাটনে ক্লিক করুন।

### ধাপ ২: কোড গিটহাবে পুশ করুন
টার্মিনালে এই ফোল্ডারে এসে নিচের কমান্ডগুলো দিন:

```bash
cd /Users/faisal/.gemini/antigravity/scratch/talking-angela-web
git init
git add .
git commit -m "Initial commit of Talking Angela Web"
git branch -M main
git remote add origin https://github.com/<আপনার-ইউজারনেম>/talking-angela.git
git push -u origin main
```
*(এখানে `<আপনার-ইউজারনেম>`-এর জায়গায় আপনার আসল GitHub Username দিন)*

### ধাপ ৩: GitHub Pages একটিভ করুন
1. আপনার GitHub রিপোজিটরির **Settings** ট্যাবে যান।
2. বাম পাশের মেনু থেকে **Pages** অপশনে ক্লিক করুন।
3. **Build and deployment > Branch** এ `None`-এর জায়গায় **`main`** সিলেক্ট করে **Save** দিন।
4. ১ মিনিটের মধ্যে আপনার লাইভ লিংক রেডি হয়ে যাবে:
   👉 `https://<আপনার-ইউজারনেম>.github.io/talking-angela/`

---

## 💻 লোকাল কম্পিউটারে রান করে দেখার নিয়ম

কোনো সফটওয়্যার ছাড়া সরাসরি ব্রাউজারে দেখতে পারেন:
- ফোল্ডারের `index.html` ফাইলটিতে ডাবল ক্লিক করুন।
- অথবা পাইথন দিয়ে লোকাল সার্ভার রান করতে পারেন:
  ```bash
  python3 -m http.server 8080
  ```
  এরপর ব্রাউজারে `http://localhost:8080` ভিজিট করুন।
