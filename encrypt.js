const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Baca file JavaScript yang ingin diobfuscate
const sourceCode = fs.readFileSync('orig_autobridge.js', 'utf8'); // Ganti dengan nama file Anda

// Obfuscate kode
const obfuscatedCode = JavaScriptObfuscator.obfuscate(sourceCode, {
    compact: true, // Mengurangi ukuran file
    controlFlowFlattening: true, // Mengacak alur kontrol
    // Anda dapat menambahkan opsi lain sesuai kebutuhan
}).getObfuscatedCode();

// Tulis hasil obfuscation ke file baru
fs.writeFileSync('autobridge.js', obfuscatedCode);
console.log('File berhasil diobfuscate!');
