import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as aesjs from 'aes-js';
import 'react-native-get-random-values';

// As Expo's SecureStore does not support values larger than 2048
// bytes, an AES-256 key is generated and stored in SecureStore, while
// it is used to encrypt/decrypt values stored in AsyncStorage.
// Source: https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native?auth-store=secure-store#initialize-a-react-native-app
export class LargeSecureStore {
  private async _encrypt(key: string, value: string) {
    const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));
    // Generate a random 16-byte counter (IV) per encryption to prevent counter
    // reuse if the same key were ever used more than once.
    const iv = crypto.getRandomValues(new Uint8Array(16));

    const cipher = new aesjs.ModeOfOperation.ctr(
      encryptionKey,
      new aesjs.Counter(iv),
    );
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

    await SecureStore.setItemAsync(
      key,
      aesjs.utils.hex.fromBytes(encryptionKey),
    );

    // Store iv:ciphertext so decrypt can reconstruct the same counter
    return (
      aesjs.utils.hex.fromBytes(iv) +
      ':' +
      aesjs.utils.hex.fromBytes(encryptedBytes)
    );
  }

  private async _decrypt(key: string, value: string) {
    const encryptionKeyHex = await SecureStore.getItemAsync(key);
    if (!encryptionKeyHex) {
      return encryptionKeyHex;
    }

    const separatorIndex = value.indexOf(':');
    if (separatorIndex === -1) {
      // Legacy value encrypted without IV — fall back to counter=1
      const cipher = new aesjs.ModeOfOperation.ctr(
        aesjs.utils.hex.toBytes(encryptionKeyHex),
        new aesjs.Counter(1),
      );
      const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));
      return aesjs.utils.utf8.fromBytes(decryptedBytes);
    }

    const ivHex = value.slice(0, separatorIndex);
    const encryptedHex = value.slice(separatorIndex + 1);

    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(encryptionKeyHex),
      new aesjs.Counter(aesjs.utils.hex.toBytes(ivHex)),
    );
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(encryptedHex));

    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string) {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) {
      return encrypted;
    }

    return await this._decrypt(key, encrypted);
  }

  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  }

  async setItem(key: string, value: string) {
    const encrypted = await this._encrypt(key, value);

    await AsyncStorage.setItem(key, encrypted);
  }
}
