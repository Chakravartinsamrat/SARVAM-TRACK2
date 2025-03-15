import { Client , Account, Avatars, Databases} from 'appwrite';

// initialize
const client = new Client();

//ENV before production
client.setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID).setEndpoint('https://cloud.appwrite.io/v1');


// initial appwrite account

const account = new Account(client);
//avatar
const avatars = new Avatars(client);

//db connect
const databases = new Databases(client);

export {account, avatars, databases};