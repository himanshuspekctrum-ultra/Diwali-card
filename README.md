# 🪔 Spekctrum Diwali Greeting Card Personalization Engine

A high-performance, production-ready **Node.js** engine that renders personalized Diwali greeting cards across all 3 official Spekctrum templates at native **1132 × 1600 px** print/mobile quality.

---

## 📁 Clean Directory Architecture

```
Diwali_greeting/
├── assets/
│   ├── raw/                 # Original WhatsApp image assets preserved untouched
│   └── templates/           # Cleanly standardized source templates (1132 × 1600)
│       ├── template1_soldier.jpg
│       ├── template2_diyas.jpg
│       └── template3_corporate.jpg
│
├── public/                  # Web Client (zero external runtime dependencies)
│   ├── index.html           # Modern Studio Web App with pure CSS design system
│   ├── assets.js            # Pre-encoded base64 assets for offline file:// support
│   └── template*.jpg        # Frontend thumbnail images
│
├── src/                     # Core Node.js Engine
│   ├── config.js            # Precise coordinates, baselines, font rules & colors
│   ├── cardRenderer.js      # @napi-rs/canvas sub-pixel 1132x1600 rendering engine
│   └── server.js            # Express Web Server & REST API endpoints
│
├── scripts/                 # CLI Command-Line Tools
│   ├── generate.js          # Node.js CLI greeting generator
│   └── generate.py          # Python CLI alternative (using PIL)
│
├── output/                  # Generated customized cards (gitignored)
├── .gitignore               # Clean repository hygiene
├── package.json             # NPM package scripts & dependencies
└── README.md                # Engineering documentation
```

---

## 🎨 Calibrated Typography & Positioning

| Template | Theme | Detected Anchor | Font Family & Weight | Color (HEX & RGB) | Insertion Position |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Template 1** | Soldier & Tricolour | `"Dear,"` | **Liberation Serif / Times**, 42px Regular | `#8A3638`<br>`rgb(138, 54, 56)` | `x = 268 px`, baseline `y = 543 px`<br>*(Masks comma and renders `Dear [Name],`)* |
| **Template 2** | Golden Hanging Diyas | `"Dear"` | **Poppins / Sans Bold**, 44px Bold | `#7A3101`<br>`rgb(122, 49, 1)` | `x = 208 px`, baseline `y = 292 px` |
| **Template 3** | Corporate CEO Reflection | `"Dear"` | **Poppins / Sans Bold**, 44px Bold | `#7A3101`<br>`rgb(122, 49, 1)` | `x = 230 px`, baseline `y = 131 px`<br>*(Includes logo collision auto-scaler)* |

---

## 🚀 How to Run

### 1. Interactive Studio Web App
```bash
npm start
```
Open **`http://localhost:3000`** in your browser.
- **Single Card Mode:** Type recipient name, choose template, live preview updates in real time, 1-click download at native 1132 × 1600 px.
- **Bulk Batch Mode:** Paste 50–500 names or upload CSV, generates all cards and downloads as a single `.zip`.
- **Offline File Access:** You can also simply double-click `public/index.html` to run completely offline.

---

### 2. Node.js Command-Line Interface (CLI)
```bash
# Generate for all 3 templates:
npm run generate -- --name "Rahul Sharma" --template all

# Generate for specific template:
npm run generate -- --name "Pooja Patel" --template 2

# Batch generate from text/CSV file:
npm run generate -- --file employees.txt --template all --outdir output/
```

---

### 3. REST API Endpoints
When `npm start` is running:
- **Download single card:**  
  `GET /api/card?name=Rahul+Sharma&template=1&download=true`
- **Stream card inline:**  
  `GET /api/card?name=Rahul+Sharma&template=1`
- **Batch generation:**  
  `POST /api/batch` with `{ "names": ["Name 1", "Name 2"], "template": "all" }`
