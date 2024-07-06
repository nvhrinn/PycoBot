/* 
 *  CopyRight 2024 MIT License
 *  Rasya R. - @chocopys
 *  My Github : https://github.com/Rasya25
 *  My Instagram : @r.rdtyptr
 */

import config from "../dist/config.js";
import makeWASocket, { Browsers, delay, DisconnectReason, fetchLatestWaWebVersion, jidNormalizedUser, makeCacheableSignalKeyStore, makeInMemoryStore, PHONENUMBER_MCC, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
//import { authenticate } from "./lib/secure.js";
import treeKill from "./lib/tree-kill.js";
import pino from "pino";
import smsg, { Module } from "./lib/serialize.js";
import fs from "fs"
import { exec } from "child_process";

const logger = pino({ timestamp: () => `,"time":"${new Date().toJSON()}"` }).child({ class: "chocopys" }); logger.level = "fatal"

const store = makeInMemoryStore({ logger })

if (config.env.write_store) store.readFromFile("./dist/db/store.json");

const Startup = async () => {
    const { state, saveCreds } = await useMultiFileAuthState("dist/temp/session")
    const { version } = await fetchLatestWaWebVersion()

    const client = makeWASocket.default({
        version,
        logger,
        printQRInTerminal: !config.env.pairing_code,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        browser: Browsers.macOS("Safari"),
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: true,
        retryRequestDelayMs: 10,
        transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
        defaultQueryTimeoutMs: undefined,
        maxMsgRetryCount: 15,
        appStateMacVerification: {
            patch: true,
            snapshot: true,
        },
        getMessage: async key => {
            const jid = jidNormalizedUser(key.remoteJid);
            const msg = await store.loadMessage(jid, key.id);
            return msg?.message || list || '';
        },
        shouldSyncHistoryMessage: msg => {
            console.log(`\x1b[32mLoading Chat [${msg.progress}%]\x1b[39m`);
            return !!msg.syncType;
        },
    })

    store.bind(client.ev);

    await Module({ client, store });

    if (config.env.pairing_code && !client.authState.creds.registered) {
        console.clear();
        let number = config.numbot;
        let phoneNumber = number.replace(/[^0-9]/g, '')
        if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) throw "Start with your country's WhatsApp code, Example : 62xxx";
        await delay(5000)
        let code = await client.requestPairingCode(phoneNumber);
        console.log("Pairing Code : " + `\x1b[32m${code?.match(/.{1,4}/g)?.join("-") || code}\x1b[39m`);
    }

    client.ev.on("connection.update", (update) => {
        const { lastDisconnect, connection, } = update

        if (connection) {
            console.info(`Connection Status : ${connection}`)
        }

        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode

            switch (reason) {
                case DisconnectReason.badSession:
                    console.info(`Bad Session File, Restart Required`)
                    Startup()
                    break
                case DisconnectReason.connectionClosed:
                    console.info("Connection Closed, Restart Required")
                    Startup()
                    break
                case DisconnectReason.connectionLost:
                    console.info("Connection Lost from Server, Reconnecting...")
                    Startup()
                    break
                case DisconnectReason.connectionReplaced:
                    console.info("Connection Replaced, Restart Required")
                    Startup()
                    break
                case DisconnectReason.restartRequired:
                    console.info("Restart Required, Restarting...")
                    Startup()
                    break
                case DisconnectReason.loggedOut:
                    console.error("Device has Logged Out, please rescan again...")
                    client.end()
                    fs.rmSync("./dist/temp/session", {
                        recursive: true,
                        force: true
                    })
                    exec("npm run stop:pm2", (err) => {
                        if (err) return treeKill(process.pid)
                    })
                    break
                case DisconnectReason.multideviceMismatch:
                    console.error("Need Multi Device Version, please update and rescan again...")
                    client.end()
                    fs.rmSync("./dist/temp/session", {
                        recursive: true,
                        force: true
                    })
                    exec("npm run stop:pm2", (err) => {
                        if (err) return treeKill(process.pid)
                    })
                    break
                default:
                    console.log("I don't understand this issue")
                    Startup()
            }
        }

        if (connection === "open") {
            console.info("Connection Opened")
        }
    })

    client.ev.on("creds.update", saveCreds)

    client.ev.on("contacts.update", (update) => {
        for (let contact of update) {
            let id = jidNormalizedUser(contact.id)
            if (store && store.contacts) store.contacts[id] = {
                ...(store.contacts?.[id] || {}),
                ...(contact || {})
            }
        }
    })
    client.ev.on("contacts.upsert", (update) => {
        for (let contact of update) {
            let id = jidNormalizedUser(contact.id)
            if (store && store.contacts) store.contacts[id] = {
                ...(contact || {}),
                isContact: true
            }
        }
    })

    client.ev.on("groups.update", (updates) => {
        for (const update of updates) {
            const id = update.id
            if (store.groupMetadata[id]) {
                store.groupMetadata[id] = {
                    ...(store.groupMetadata[id] || {}),
                    ...(update || {})
                }
            }
        }
    })

    client.ev.on('group-participants.update', ({
        id,
        participants,
        action
    }) => {
        const metadata = store.groupMetadata[id]
        if (metadata) {
            switch (action) {
                case 'add':
                case "revoked_membership_requests":
                    metadata.participants.push(...participants.map(id => ({
                        id: jidNormalizedUser(id),
                        admin: null
                    })))
                    break
                case 'demote':
                case 'promote':
                    for (const participant of metadata.participants) {
                        let id = jidNormalizedUser(participant.id)
                        if (participants.includes(id)) {
                            participant.admin = (action === "promote" ? "admin" : null)
                        }
                    }
                    break
                case 'remove':
                    metadata.participants = metadata.participants.filter(p => !participants.includes(jidNormalizedUser(p.id)))
                    break
            }
        }
    })

    client.ev.on("messages.upsert", async ({
        messages
    }) => {
        if (!messages[0].message) return
        let m = await smsg(client, messages[0], store)
        if (store.groupMetadata && Object.keys(store.groupMetadata).length === 0) store.groupMetadata = await client.groupFetchAllParticipating()
        if (m.key && !m.key.fromMe && m.key.remoteJid === "status@broadcast") {
            if (m.type === "protocolMessage" && m.message.protocolMessage.type === 0) return
            await client.readMessages([m.key])
        }

        let isOwner = JSON.stringify(config.owner).includes(m.sender.replace(/\D+/g, "")) || false

        if (config.env.self === 'true' && !isOwner) return;

 /*        if (process.env.NODE_ENV === "development") {
    const messageModule = await import("./message.js");
    messageModule.default(client, store, m, messages[0]); 
} else {
    const messageModule = await import(`./message.js?v=${new Date().getTime()}`);
    messageModule.default(client, store, m, messages[0]);
} */
         if (process.env.NODE_ENV === "development") await import("./message.js")
         .then(m => m.default(client, store, m, messages[0]))
        await ((await import(`./message.js?v=${new Date().getTime()}`))
        .default(client, store, m, messages[0]))
    });

    setInterval(async () => {
        if (config.env.write_store) {
            store.writeToFile("./dist/db/store.json", true)
        }
    }, 10 * 1000)

    process.on("uncaughtException", console.error)
    process.on("unhandledRejection", console.error)
}
/* async function Starts() {
    const loggeds = await authenticate();
    if (loggeds) {
        await Startup();
    }
}
Starts() */
// authenticate();
Startup();