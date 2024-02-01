// module imports
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export class SecretManager {

  client;

  constructor() {
    this.client = new SecretManagerServiceClient();
  }

  async getSecret(secretName) {
    return new Promise((resolve, reject) => {
      try {
        this.client.accessSecretVersion({
          name: `${secretName}/versions/latest`,
        }).then(([accessResponse]) => {
          const secret = accessResponse.payload?.data?.toString();
          if (!secret) {
            reject(`No secret forund for the Secret Name : ${secretName}`);
          } else {
            resolve(secret);
          }
        }).catch((error) => {
          reject(error);
        })

      } catch (error) {
        reject(error);
      }
    })
  }

}