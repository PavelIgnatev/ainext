import { google, Auth } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { encrypt, decrypt } from '../auth/crypto';

const TOKEN_PATH = path.join(
  process.cwd(),
  'actions/google-crm/auth/token.json'
);
const CREDENTIALS_PATH = path.join(
  process.cwd(),
  'actions/google-crm/auth/credentials.json'
);

class GoogleAuth {
  static readEncryptedToken() {
    try {
      const encryptedData = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      if (encryptedData.iv && encryptedData.data) {
        const decryptedString = decrypt(encryptedData);
        return JSON.parse(decryptedString);
      }
      return encryptedData;
    } catch (error) {
      throw new Error('TOKEN_READ_ERROR');
    }
  }

  static writeEncryptedToken(token: any) {
    try {
      const tokenString = JSON.stringify(token);
      const encryptedData = encrypt(tokenString);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(encryptedData, null, 2));
    } catch (error) {
      throw new Error('TOKEN_WRITE_ERROR');
    }
  }

  static readEncryptedCredentials() {
    try {
      const encryptedData = JSON.parse(
        fs.readFileSync(CREDENTIALS_PATH, 'utf8')
      );
      if (encryptedData.iv && encryptedData.data) {
        const decryptedString = decrypt(encryptedData);
        return JSON.parse(decryptedString);
      }
      return encryptedData;
    } catch (error) {
      throw new Error('CREDENTIALS_READ_ERROR');
    }
  }

  static writeEncryptedCredentials(credentials: any) {
    try {
      const credentialsString = JSON.stringify(credentials);
      const encryptedData = encrypt(credentialsString);
      fs.writeFileSync(
        CREDENTIALS_PATH,
        JSON.stringify(encryptedData, null, 2)
      );
    } catch (error) {
      throw new Error('CREDENTIALS_WRITE_ERROR');
    }
  }

  static async refreshToken(auth: Auth.OAuth2Client) {
    const currentToken = GoogleAuth.readEncryptedToken();
    const { credentials: newCredentials } = await auth.refreshAccessToken();

    const tokenToSave = {
      access_token: newCredentials.access_token!,
      refresh_token: newCredentials.refresh_token || currentToken.refresh_token,
    };

    GoogleAuth.writeEncryptedToken(tokenToSave);
    auth.setCredentials(newCredentials);

    return tokenToSave;
  }

  static async initializeAuth() {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      throw new Error('CREDENTIALS_PATH_NOT_FOUND');
    }

    const credentials = GoogleAuth.readEncryptedCredentials();
    const { client_secret, client_id } = credentials.installed;
    const auth = new google.auth.OAuth2(client_id, client_secret);

    if (!fs.existsSync(TOKEN_PATH)) {
      throw new Error('TOKEN_PATH_NOT_FOUND');
    }

    const token = GoogleAuth.readEncryptedToken();
    auth.setCredentials(token);

    const refreshedToken = await GoogleAuth.refreshToken(auth);
    if (!refreshedToken) {
      throw new Error('REFRESH_TOKEN_ERROR');
    }

    return auth;
  }
}

export default GoogleAuth;
