/* 
    *   MIT License
    *  (c) 2024 Rasya R. - @chocopys
    *  My Github: https://github.com/Rasya25
    *  My Instagram: https://instagram.com/r.rdtyptr
    */

import axios from 'axios';
import readline from 'readline';
import config from '../../dist/config.js';
import chalk from 'chalk';
import { spawn } from 'child_process';
const DATABASE_URL = config.env.dbURL;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const getUserInput = (query) => {
    return new Promise((resolve, reject) => { 
        rl.question(query, (answer) => {
            if (answer) {
                resolve(answer);
            } else {
                reject(new Error('Input kosong'));
            }
        });
    });
};

const validateCredentials = (username, password, users) => {
    console.log("Data pengguna:", users);
    console.clear();
    const user = users.find(user => user.username === username);
    return user && user.password === password;
};

async function fetchData() {
    try {
        const response = await axios.get(DATABASE_URL);
        return response.data;
    } catch (error) {
        console.error(chalk.bold.red('Gagal mengambil data:', error));
        process.exit(0);
    }
}

let users = [];

async function authenticate() { 
    const userData = await fetchData();
    users = userData.users;
    
    try {
        const username = await getUserInput(chalk.bold.red('Masukkan username: '));
        const password = await getUserInput(chalk.bold.red('Masukkan password: '));

        if (validateCredentials(username, password, users)) {
            console.log(chalk.bold.green('Login sukses!'));
             const child = spawn('node', ['./system/main.js'], {
                 stdio: 'inherit'
             });
             child.on('close', (code) => {
                 console.log(`${code}`);
             });
        } else {
            console.log(chalk.bold.red('Username atau password salah'));
            process.exit(0);
        }
    } catch (error) {
        console.error(chalk.bold.red('Terjadi kesalahan saat login:', error));
        process.exit(0);
    }
}
// Ini sngaja gw bkin open source ya nd kya sbelah
authenticate();
// export { authenticate }