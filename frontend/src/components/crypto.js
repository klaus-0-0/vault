// src/components/crypto.js
import CryptoJS from 'crypto-js';

export class VaultCrypto {
  static deriveKey(masterPassword, email) {
    if (!masterPassword || !email) {
      throw new Error("Password and email are required for key derivation");
    }

    // Simple and reliable key derivation
    // Combine password + email and hash it to create a consistent key
    const keyString = masterPassword + email;
    return CryptoJS.SHA256(keyString).toString();
  }

  static encryptVaultItem(item, masterKey) {
    try {
      if (!masterKey) {
        throw new Error("Encryption key is required");
      }

      const jsonString = JSON.stringify(item);
      // Use simple encryption without complex options
      const encrypted = CryptoJS.AES.encrypt(jsonString, masterKey);
      return encrypted.toString();
    } catch (error) {
      console.error("Encryption error:", error);
      throw new Error('Encryption failed: ' + error.message);
    }
  }

  static decryptVaultItem(encryptedData, masterKey) {
    try {
      if (!encryptedData || !masterKey) {
        throw new Error("Encrypted data and key are required");
      }

      // Check if the encrypted data looks valid
      if (typeof encryptedData !== 'string' || encryptedData.length < 10) {
        throw new Error("Invalid encrypted data format");
      }

      // Use simple decryption
      const bytes = CryptoJS.AES.decrypt(encryptedData, masterKey);
      const decryptedJson = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedJson) {
        throw new Error("Decryption failed - wrong password or corrupted data");
      }

      return JSON.parse(decryptedJson);
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error('Decryption failed: ' + error.message);
    }
  }

  static generatePassword(options = {}) {
    const {
      length = 16,
      numbers = true,
      symbols = true,
      uppercase = true,
      lowercase = true,
      excludeSimilar = true
    } = options;

    // Character sets
    const similarChars = 'il1Lo0O';

    let chars = '';
    let password = '';

    if (lowercase) chars += 'abcdefghjkmnpqrstuvwxyz';
    if (uppercase) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    if (numbers) chars += '23456789';
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    // Remove similar characters if requested
    if (excludeSimilar) {
      for (const char of similarChars) {
        chars = chars.replace(char, '');
      }
    }

    // Ensure we have at least one character from each selected category
    if (lowercase) password += this.getRandomChar('abcdefghjkmnpqrstuvwxyz');
    if (uppercase) password += this.getRandomChar('ABCDEFGHJKLMNPQRSTUVWXYZ');
    if (numbers) password += this.getRandomChar('23456789');
    if (symbols) password += this.getRandomChar('!@#$%^&*()_+-=[]{}|;:,.<>?');

    // Fill the rest randomly
    while (password.length < length) {
      password += this.getRandomChar(chars);
    }

    // Shuffle the password
    return this.shuffleString(password);
  }

  static getRandomChar(charSet) {
    return charSet[Math.floor(Math.random() * charSet.length)];
  }

  static shuffleString(str) {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
  }
}