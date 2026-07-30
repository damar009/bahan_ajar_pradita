# Website Modular

Fondasi website statis dengan `index.html` sebagai cover dan daftar isi. Setiap
halaman berada di folder sendiri dan memiliki komponen:

- `index.html`
- `style.css`
- `script.js`
- `data.json`
- `assets/`

## Struktur

```text
.
├── index.html
├── assets/
├── data/
│   └── pages.json
├── pages/
│   ├── bookmark/
│   ├── contoh-halaman/
│   └── page_pd_dasnum_1/
├── scripts/
├── shared/
└── styles/
```

## Cara Cepat Menambah Halaman

Jalankan generator:

```bash
node scripts/create-page.mjs
```

Generator akan menanyakan:

- ID folder page, contoh `page_pd_dasnum_2`
- Judul page
- Ringkasan singkat
- Eyebrow/label hero

Generator otomatis:

- menduplikasi template `pages/page_pd_dasnum_1/`
- membuat folder page baru
- memastikan folder `assets/` tersedia
- mengganti judul dasar di `index.html`
- menambahkan page baru ke `data/pages.json`

Contoh command langsung tanpa prompt:

```bash
node scripts/create-page.mjs page_pd_dasnum_2 "Judul Page Baru" "Ringkasan singkat page baru" --eyebrow="Dasar-Dasar Numerasi"
```

Kalau page belum mau ditampilkan:

```bash
node scripts/create-page.mjs page_pd_dasnum_2 "Judul Page Baru" "Ringkasan singkat page baru" --draft
```

Setelah generator selesai, biasanya cukup edit:

```text
pages/page_pd_dasnum_2/data.json
```

## Menyembunyikan Pembahasan

Secara default, tombol `Tampilkan Pembahasan` muncul pada contoh dan latihan
yang memiliki pembahasan. Untuk menyembunyikannya pada satu halaman, tambahkan
konfigurasi berikut di bagian paling atas `data.json` halaman tersebut:

```json
{
  "settings": {
    "showSolutionToggle": false
  },
  "materi": []
}
```

Saat bernilai `false`, tombol dan isi pembahasannya tidak dirender. Ubah menjadi
`true` atau hapus pengaturan tersebut untuk menampilkannya kembali.

## Cara Manual Menambah Halaman

1. Duplikat folder `pages/page_pd_dasnum_1/` atau page standar lain.
2. Ganti nama folder mengikuti pola, misalnya `pages/page_pd_dasnum_2/`.
3. Edit isi `pages/page_pd_dasnum_2/data.json`.
4. Pastikan `index.html` memanggil `style.css`, `script.js`, dan `data.json`.
5. Tambahkan entri baru di `data/pages.json`.

Contoh entri:

```json
{
  "id": "profil",
  "title": "Profil",
  "summary": "Ringkasan singkat halaman profil.",
  "url": "pages/profil/index.html",
  "published": true
}
```

Bookmark sebaiknya tetap berada di urutan paling atas `data/pages.json` supaya
muncul paling atas di dropdown Daftar Isi.

## Menyembunyikan Halaman

Ubah `published` menjadi `false` di `data/pages.json`.

```json
"published": false
```

## Preview Lokal

Jalankan server lokal dari folder ini:

```bash
python3 -m http.server 8000
```

Lalu buka:

```text
http://localhost:8000
```

File JSON dimuat dengan `fetch`, jadi preview paling stabil menggunakan server
lokal atau static hosting, bukan membuka file langsung dengan `file://`.
