const fs = require('fs');
const crypto = require('crypto');

// Fungsi untuk mendekripsi data
function decrypt(text, password) {
    const parts = text.split(':'); // Pisahkan iv dan encrypted
    const iv = Buffer.from(parts.shift(), 'hex'); // Ambil iv
    const encryptedText = Buffer.from(parts.join(':'), 'hex'); // Ambil encrypted

    const key = crypto.scryptSync(password, 'salt', 24); // Buat kunci dari password
    const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv); // Buat decipher
    let decrypted = decipher.update(encryptedText, 'binary', 'utf8'); // Dekripsi data
    decrypted += decipher.final('utf8'); // Selesaikan dekripsi

    return decrypted; // Kembalikan data yang terdekripsi
}

// Baca file terenkripsi
const encryptedFilePath = 'unichain.encrypted'; // Ganti dengan nama file terenkripsi Anda
const password = '@cobaaja@'; // Ganti dengan password Anda

fs.readFile(encryptedFilePath, 'utf8', (err, data) => {
    if (err) throw err;
    const decryptedData = decrypt(data, password);
    console.log('Data yang terdekripsi:', decryptedData);
});
