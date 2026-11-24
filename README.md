# Our Little Universe / دنیای کوچک ما

آسمون شب سه‌بعدی که هر ستاره‌ش یه خاطره‌ست. استاتیک، بدون build، مناسب GitHub Pages.

## ساختار
```
index.html        # صفحه + ورودی + HUD + کارت خاطره
css/style.css     # هویت بصری (پالت و Vazirmatn)
js/main.js        # صحنه‌ی Three.js، shaderها، کنترل لمسی/ژیروسکوپ، صدا
data/memories.js  # ✏️ تنها فایل قابل‌ویرایش: رمز ورود، تاریخ شروع، خاطره‌ها
assets/           # عکس‌ها (مثلاً assets/met.jpg)
```

## اجرا روی لوکال
ماژول‌های ES نیاز به سرور دارن: `python3 -m http.server 8000` و بعد `http://localhost:8000`

## دیپلوی روی GitHub Pages
1. یه ریپو بساز (مثلاً `our-universe`) و همه‌ی فایل‌ها رو push کن.
2. Settings ← Pages ← Source: `Deploy from a branch` ← Branch: `main` / `(root)` ← Save.
3. بعد از یکی دو دقیقه آدرس `https://USERNAME.github.io/our-universe/` فعال میشه.

## قبل از دادن لینک
- در `data/memories.js` سؤال و جواب ورودی، و متن و عکس خاطره‌ها رو پر کن.
- ورودی فقط یه قفل نرمه، نه امنیتی؛ چیز خیلی خصوصی داخل ریپوی public نذار.

## فاز بعدی (هنوز ساخته نشده)
شبیه‌ساز آسمون روز مهم، نقشه‌ی خاطرات، نامه‌های قفل‌شده، بازی دکور خونه با گربه، سوپرایز روزانه با Python/Actions، کتاب مهمان با Firebase، ماژول‌های WASM.

## امکانات اضافه (تنظیم در `data/more.js`)
- پیام صوتی: فایل mp3 رو بذار توی `assets/audio/` و توی `VOICES` به id خاطره وصلش کن. آهنگ پس‌زمینه: `SONG`.
- ستاره‌ی آینده (`FUTURE`)، شمارنده‌ی روز مهم (`NEXT_DAY`)، صورت فلکی (`HEART`)، کوپن‌ها و لیست کارها.
- PWA: توی مرورگر گوشی «Add to Home screen» بزن تا مثل اپ نصب بشه.
