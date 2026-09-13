# Otakudesu Scraping

Streaming dan download Anime subtitle Indonesia

# Sumber:

https://otakudesu.media

# Instalasi

- Jalankan perintah di terminal

```sh
# clone repo
git clone https://github.com/andrenaskleng3-svg/akira

# masuk folder
cd otakudesu-scraping

# install dependensi
npm install

# jalankan server
npm start
```

- Server akan berjalan di http://localhost:3000

# Routes

| Endpoint              | Params          | Description                |
| --------------------- | --------------- | -------------------------- |
| /home                 | -               | Homepage                   |
| /schedule             | -               | Jadwal Tayang              |
| /ongoing              | page            | default page: 1            |
| /completed            | page            | default page: 1            |
| /genres               | -               | Genre List                 |
| /genre/:id            | :id, page       | default page: 1            |
| /search               | query           | Search Anime               |
| /anime/:id            | :id             | Anime details              |
| /episode/:id          | :id             | Streaming Anime            |

# Frontend Web (index.html)

Frontend siap pakai ada di `public/index.html` (single file, tanpa build step).
Server Express melayani-nya di `/`, REST API tetap di `/api/*`.

## Termux / lokal

```sh
npm install
npm start   # http://localhost:3000
```

## Vercel

Deploy langsung (`vercel --prod`). `vercel.json` sudah menyertakan folder `public`,
dan semua request non-`/api` dikembalikan ke `index.html`.

## Halaman

`#/` beranda, `#/ongoing/1`, `#/completed/1`, `#/genres`, `#/genre/:id/1`,
`#/schedule`, `#/search/:query`, `#/anime/:id`, `#/episode/:id`, `#/batch/:id`
