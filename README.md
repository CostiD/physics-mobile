# 📱 Fizică — Site Mobil

Site mobil-first cu simulări de fizică, organizate ca lecții cu teorie, simulare interactivă și probleme.

## Structura unei lecții

```
📖 Teorie    — text + formule cheie
🎮 Simulare  — componenta interactivă
✏️ Probleme  — exerciții cu răspuns ascuns (tap pentru reveal)
```

## Cum adaugi teorie și probleme

Editează fișierul `src/content.js` — fiecare lecție are secțiunile `theory` și `problems`.

### Tipuri de blocuri pentru teorie

```js
{ type: 'heading', text: 'Titlu secțiune' }
{ type: 'text',    text: 'Paragraf explicativ...' }
{ type: 'formula', text: 'E = mc²', label: 'Descriere opțională' }
{ type: 'list',    items: ['Punct 1', 'Punct 2'] }
```

### Format probleme

```js
{
  id: 'unic',
  text: 'Enunțul problemei...',
  answer: 'Rezolvare pas cu pas...',
}
```

Caută `TODO:` în fișier pentru a găsi rapid locurile de completat.

---

## 🚀 Deploy pe Vercel + GitHub (de pe telefon)

### Pasul 1 — Creează repository pe GitHub

1. **github.com** → **+** → **New repository**
2. Nume: `physics-mobile`
3. Public ✓ → **Create repository**

### Pasul 2 — Încarcă fișierele

Structura de încărcat:
```
physics-mobile/
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── content.js           ← editezi asta pentru teorie/probleme
    └── simulations/
        ├── AtomicSim.jsx
        ├── QuantumSim.jsx
        ├── MRU.jsx
        └── ThermalAgitation.jsx
```

> **Sfat pentru telefon:** Pe GitHub, apasă **"Create new file"** și scrie
> calea completă ca nume (ex: `src/content.js`). GitHub creează automat
> folderele. Sau folosește **github.dev** (schimbă `.com` cu `.dev` în URL)
> pentru un editor vizual complet în browser.

### Pasul 3 — Deploy pe Vercel

1. **vercel.com** → cont cu GitHub
2. **Add New Project** → selectează `physics-mobile`
3. **Deploy** → URL live în ~30 secunde

### Modificări ulterioare

- Editezi `src/content.js` direct pe GitHub
- Vercel face deploy automat

---

## Sfat: github.dev pe telefon

Dacă vrei să editezi mai ușor de pe telefon, mergi la repo-ul tău și
schimbă URL-ul din `github.com/user/repo` în `github.dev/user/repo`.
Se deschide VS Code în browser, cu preview și tot!
