import { Client, Databases, ID } from "appwrite";
import dotenv from "dotenv";

dotenv.config();

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID);

const databases = new Databases(client);

// Configuration
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'whatsapp_bot_db';
const DATABASE_NAME = 'WhatsApp Bot Database';
const CONVERSATIONS_COLLECTION_ID = process.env.APPWRITE_CONVERSATIONS_COLLECTION_ID || 'conversations';
const CHATS_COLLECTION_ID = process.env.APPWRITE_CHATS_COLLECTION_ID || 'chats';

async function setupAppwrite() {
    try {
        console.log("Setting up Appwrite database and collections...");
        
        // Create database if it doesn't exist
        try {
            const database = await databases.get(DATABASE_ID);
            console.log("Database already exists:", database.name);
        } catch (error) {
            if (error.code === 404) {
                console.log("Creating new database...");
                await databases.create(DATABASE_ID, DATABASE_NAME);
                console.log(`Created database: ${DATABASE_NAME} with ID: ${DATABASE_ID}`);
            } else {
                throw error;
            }
        }
        
        // Create conversations collection if it doesn't exist
        try {
            const conversationsCollection = await databases.getCollection(
                DATABASE_ID,
                CONVERSATIONS_COLLECTION_ID
            );
            console.log("Conversations collection already exists");
        } catch (error) {
            if (error.code === 404) {
                console.log("Creating conversations collection...");
                await databases.createCollection(
                    DATABASE_ID,
                    CONVERSATIONS_COLLECTION_ID,
                    'Conversations'
                );
                
                // Create attributes
                await databases.createStringAttribute(
                    DATABASE_ID,
                    CONVERSATIONS_COLLECTION_ID,
                    'user_id',
                    255,
                    true
                );
                
                await databases.createStringAttribute(
                    DATABASE_ID,
                    CONVERSATIONS_COLLECTION_ID,
                    'created_at',
                    255,
                    true
                );
                
                console.log("Created conversations collection with attributes");
            } else {
                throw error;
            }
        }
        
        // Create chats collection if it doesn't exist
        try {
            const chatsCollection = await databases.getCollection(
                DATABASE_ID,
                CHATS_COLLECTION_ID
            );
            console.log("Chats collection already exists");
        } catch (error) {
            if (error.code === 404) {
                console.log("Creating chats collection...");
                await databases.createCollection(
                    DATABASE_ID,
                    CHATS_COLLECTION_ID,
                    'Chats'
                );
                
                // Create attributes
                await databases.createStringAttribute(
                    DATABASE_ID,
                    CHATS_COLLECTION_ID,
                    'conversation_id',
                    255,
                    true
                );
                
                await databases.createStringAttribute(
                    DATABASE_ID,
                    CHATS_COLLECTION_ID,
                    'user_response',
                    10000,  // Long text field
                    true
                );
                
                await databases.createStringAttribute(
                    DATABASE_ID,
                    CHATS_COLLECTION_ID,
                    'ai_response',
                    10000,  // Long text field
                    true
                );
                
                await databases.createStringAttribute(
                    DATABASE_ID,
                    CHATS_COLLECTION_ID,
                    'timestamp',
                    255,
                    true
                );
                
                console.log("Created chats collection with attributes");
                
                // Create index for faster queries
                await databases.createIndex(
                    DATABASE_ID,
                    CHATS_COLLECTION_ID,
                    'conversation_id_index',
                    'key',
                    ['conversation_id']
                );
                
                console.log("Created index on conversation_id field");
            } else {
                throw error;
            }
        }
        
        console.log("Appwrite setup completed successfully!");
        
        // Log IDs for reference
        console.log({
            DATABASE_ID,
            CONVERSATIONS_COLLECTION_ID,
            CHATS_COLLECTION_ID
        });
        
    } catch (error) {
        console.error("Error during Appwrite setup:", error);
    }
}

// Run the setup
setupAppwrite();

// Export for use in other modules if needed
export {
    DATABASE_ID,
    CONVERSATIONS_COLLECTION_ID,
    CHATS_COLLECTION_ID
};