/* 
 *  CopyRight 2024 MIT License
 *  Rasya R. - @chocopys
 *  My Github : https://github.com/Rasya25
 *  My Instagram : @r.rdtyptr
 */

import config from "../dist/config.js"
import { appenTextMessage } from "./lib/serialize.js";
import * as Func from "./lib/functions.js"
import os from "os"
import util from "util"
import chalk from "chalk"
import fs from "fs";
import axios from 'axios';
import { fileURLToPath } from "url";
import { exec } from "child_process";
import speed from "performance-now"
import { performance } from "perf_hooks";

const usr = JSON.parse(fs.readFileSync('./dist/db/users.json'));

export default async function message(client, store, m, chatUpdate) {
    try {
        (m.type === 'conversation') ? m.message.conversation : (m.type == 'imageMessage') ? m.message.imageMessage.caption : (m.type == 'videoMessage') ? m.message.videoMessage.caption : (m.type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.type == 'interactiveResponseMessage') ? appenTextMessage(JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id, chatUpdate, m, client) : (m.type == 'templateButtonReplyMessage') ? appenTextMessage(m.msg.selectedId, chatUpdate, m, client) : (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ''
        let quoted = m.isQuoted ? m.quoted : m
        let Downloaded = async (fileName) => await client.downloadMediaMessage(quoted, fileName)
        let isOwner = JSON.stringify(config.owner).includes(m.sender.replace(/\D+/g, "")) || false
        let isUsers = usr.includes(m.sender)
        let isCommand = (m.prefix && m.body.startsWith(m.prefix)) || false

        if (m.isBot) return;
        
        if (m.message && !m.isBot) {
            if (!isUsers) {
                usr.push(m.sender)
                fs.writeFileSync('./dist/db/users.json', JSON.stringify(usr, null, 2))
            }

            console.log(
                `--------------------------------------------------\n` +
                `${chalk.blackBright.bold.blue("FROM")}: ${chalk.bgYellow.bold.black(m.pushName + " => " + m.sender)}\n` +
                `${chalk.blackBright.bold.blue("IN")}: ${chalk.magenta(m.isGroup ? "👥 Group" : "👤 Private")}\n` +
                `${chalk.blackBright.bold.blue("MESSAGE")}: ${chalk.bold.green(m.body || m.type)}\n` +
                `${chalk.blackBright.bold.blue("TYPE")}: ${chalk.bgBlue.bold.yellow(m.type)}\n` +
                `${chalk.blackBright.bold.blue("TIME")}: ${chalk.bold.red(new Date().toLocaleTimeString())}\n` +
                `--------------------------------------------------\n`
            );
        }

        switch (isCommand ? m.command.toLowerCase() : false) {
            case "menu":
            case "help": 
            case "allmenu":
            {
                let txt = `Hello ${m.pushName} 👋🏻\n\n`;
                Object.entries(config.cmd).forEach(([category, commands]) => {
                    txt += `*${Func.toUpper(category)} Commands*\n`
                    txt += `* ${commands.map(command => `${m.prefix + command}`).join('\n- ')}\n\n`
                })
                m.reply(txt)}
                break

            case 'tqto':
            case 'thanksto':
                {const api = ["Allah SWT.", "Nabi Muhammad SAW.", "My Parrents.", "My Friends.", "Rasya R.", "Xyz Teams ( All Members )."]
                let txt = "*Thank To:*\n\n";
                api.map(v => txt += `* ${v}\n`);
                client.reply(m.from, txt, m)}
                break
            
            case 'ping':
            case 'botstatus':
            case 'statusbot': {
                const used = process.memoryUsage()
                const cpus = os.cpus().map(cpu => {
                    cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0)
                    return cpu
                })
                const cpu = cpus.reduce((last, cpu, _, { length }) => {
                    last.total += cpu.total
                    last.speed += cpu.speed / length
                    last.times.user += cpu.times.user
                    last.times.nice += cpu.times.nice
                    last.times.sys += cpu.times.sys
                    last.times.idle += cpu.times.idle
                    last.times.irq += cpu.times.irq
                    return last
                }, {
                    speed: 0,
                    total: 0,
                    times: {
                        user: 0,
                        nice: 0,
                        sys: 0,
                        idle: 0,
                        irq: 0
                    }
                })
                let timestamp = speed()
                let latensi = speed() - timestamp
                let neww = performance.now()
                let oldd = performance.now()
                let respon = `
Kecepatan Respon ${latensi.toFixed(4)} _Second_ \n ${oldd - neww} _miliseconds_\n\nRuntime : ${Func.runtime(process.uptime())}

💻 Info Server
RAM: ${Func.formatp(os.totalmem() - os.freemem())} / ${Func.formatp(os.totalmem())}

_NodeJS Memory Usaage_
${Object.keys(used).map((key, _, arr) => `${key.padEnd(Math.max(...arr.map(v => v.length)), ' ')}: ${Func.formatp(used[key])}`).join('\n')}

${cpus[0] ? `_Total CPU Usage_
${cpus[0].model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `- *${(type + '*').padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}
_CPU Core(s) Usage (${cpus.length} Core CPU)_
${cpus.map((cpu, i) => `${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `- *${(type + '*').padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}`).join('\n\n')}` : ''}
`.trim()
                client.sendMessage(m.from, {
                    text: respon,
                    contextInfo: {
                        externalAdReply: {
                            title: "Server Status",
                            // body: '',
                            thumbnail: config.img.server,
                            showAdAttribution: true,
                            renderLargerThumbnail: true,
                            mediaType: 1
                        }
                    }
                }, { quoted: m });
            }
            break
            
            case "owner":
            case "developer":
            case "author": {
                await client.sendContact(m.from, config.owner, m)
                m.reply("Hello, that is my owner please don't call and spamm.")
            }
                break
            
            case 'get':
            case 'fetch': {
                if (!m.text) return client.reply(m.from, config.mess.media.url, m)
                const res = await axios.request(m.text, {
                    method: 'GET',
                    headers: {
                        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Windows; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36"
                    }
                })
                if (!/text|json/.test(res.headers['content-type'])) {
                    if (res.headers['content-length'] > 300 * 1024 * 1024) return m.reply('File terlalu besar')
                    return m.reply(util.format(res.data))
                } else {
                    return m.reply(util.format(res.data))
                }
            }
                break

            default:
                if (['>', 'eval', '=>'].some(a => m.command.toLowerCase().startsWith(a)) && isOwner) {
                    let evalCmd = '';
                    try {
                        evalCmd = /await/i.test(m.text) ? eval('(async() => { ' + m.text + ' })()') : eval(m.text);
                    } catch (e) {
                        evalCmd = e;
                    }
                    new Promise((resolve, reject) => {
                        try {
                            resolve(evalCmd);
                        } catch (err) {
                            reject(err);
                        }
                    })
                        ?.then(res => m.reply(util.format(res)))
                        ?.catch(err => m.reply(util.format(err)));
                }
                if (['$', 'exec'].some(a => m.command.toLowerCase().startsWith(a)) && isOwner) {
                    try {
                        exec(m.text, async (err, stdout) => {
                            if (err) return m.reply(util.format(err));
                            if (stdout) return m.reply(util.format(stdout));
                        });
                    } catch (e) {
                        await m.reply(util.format(e));
                    }
                }
        }
    } catch (e) {
        console.log(e);
        m.reply(m.from, util.format(e), m)
    }
}

let fileP = fileURLToPath(import.meta.url);
fs.watchFile(fileP, () => {
    fs.unwatchFile(fileP);
    console.log(`Successfully To Update File ${fileP}`)
})