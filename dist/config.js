/* 
 *  CopyRight 2024 MIT License
 *  Rasya R. - @chocopys
 *  My Github : https://github.com/Rasya25
 *  My Instagram : @r.rdtyptr
 */

import { fileURLToPath } from "url";
import fs from "fs";

export default {
    numbot: "6287777056787",
    owner: [
        "6285791346128"
        // if u have secc num
    ],
    img: {
      server: fs.readFileSync('./dist/img/server.png'),
      main: fs.readFileSync('./dist/img/main.png')
    },
    env: {
        write_store: false,
        pairing_code: true,
        self: false,
        packName: 'Have a nice day!',
        packPublish: "@chocopys",
        dbURL: "https://raw.githubusercontent.com/Rasya25/access-usr/main/db.json",
    },
    cmd: {
        info: [
            "ping"
        ],
        main: [
            "owner",
            'menu',
            'thanksto'
        ],
        tools: [
            "fetch"
        ]
    },
    mess: {
        admin: "Fitur Hanya Digunakan Oleh Admin",
        owner: "Hanya Pemilik yang Bisa Menggunakan Perintah Ini",
        group: "Perintah Ini Hanya Berfungsi di Grup",
        private: "Perintah Ini Hanya Berfungsi di Chat Pribadi",
        wait: "Mohon Tunggu, Sedang Diproses...",
        error: "Terjadi Kesalahan, Silakan Coba Lagi Nanti",
        ban: "Anda Dilarang Menggunakan Bot Ini",
        botAdmin: "Bot Harus Menjadi Admin Untuk Menggunakan Perintah Ini",
        endLimit: "Batas Telah Tercapai",
        notAllow: "Anda Tidak Diizinkan Menggunakan Perintah Ini",
        notfound: 'Tidak Ditemukan',
        success: "Berhasil",
        reply: "Mohon Balas Pesan",
        media: {
            default: "Mohon Balas Media",
            image: "Mohon Balas Gambar",
            video: "Mohon Balas Video",
            sticker: "Mohon Balas Stiker",
            audio: "Mohon Balas Audio",
            url: 'Mohon Kirimkan Tautan',
            prompt: "Mohon Balas Prompt",
            file: "Mohon Balas File",
            contact: "Mohon Balas Kontak",
            forward: "Mohon Balas Forward",
            query: "Mohon Balas Query",
        }
    }
}

let fileP = fileURLToPath(import.meta.url);
fs.watchFile(fileP, () => {
    fs.unwatchFile(fileP);
    console.log(`Successfully To Update File ${fileP}`)
})