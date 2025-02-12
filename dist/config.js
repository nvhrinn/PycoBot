/* 
 *  CopyRight 2024 MIT License
 *  Rasya R. - @chocopys
 *  My Github : https://github.com/Rasya25
 *  My Instagram : @r.rdtyptr
 */

import { fileURLToPath } from "url";
import fs from "fs";

export default {
    numbot: "628xxx",
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
        admin: "Features Only Used By Admin",
        owner: "Only Owner Can Use This Command",
        group: "This Command Only Works in Groups",
        private: "This Command Only Works in Private Chat",
        wait: "waitt bruh...",
        error: "An Error Occurred, Please Try Again Later",
        baned: "You are prohibited from using this bot",
        botAdmin: "the bot must be an admin",
        endLimit: "Limit Has Been Reached",
        notfound: 'Not found 404 ',
        success: "Succeed",
        reply: "Please Reply Message",
        media: {
            default: "Mohon Balas Media",
            query: "Enter the query please",
        }
    }
}

let fileP = fileURLToPath(import.meta.url);
fs.watchFile(fileP, () => {
    fs.unwatchFile(fileP);
    console.log(`Successfully To Update File ${fileP}`)
})
