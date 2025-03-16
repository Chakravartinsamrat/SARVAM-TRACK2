import twilio from "twilio";
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import {getAiResponse} from "./model/googleAI.js";
import axios from "axios";

dotenv.config();

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false })); 

const client = twilio(import.meta.TWILIO_ACCOUNT_SID, import.meta.TWILIO_AUTH_TOKEN);

app.get("/", (req, res) => {
    res.send("WhatsApp Bot is running!");
});

app.post("/send", async (req, res) => {
    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).json({ error: "Missing parameters" });
    }

    try {
        const response = await client.messages.create({
            body: message,
            from: "whatsapp:+14155238886",
            to: `whatsapp:${to}`, 
        });

        return res.status(200).json({ success: true, response });
    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ error: error.message });
    }
});

app.post("/whatsapp", async (req, res) => {
    console.log("Incoming request from Twilio:", req.body);
    const prompt = req.body.Body;
    try {
        const response = await getAiResponse(prompt,[]);
        console.log(response)
        const response2 = await axios.post("http://localhost:3000/send", {
            to: `+${req.body.WaId}`,
            message: response,
        });
        console.log(response2.data);
    } catch (error) {
        console.log(error)
    }
    
});


const PORT = import.meta.PORT || 3000;
app.listen(PORT, () => {
    console.log(`WhatsApp Bot is running on port ${PORT}`);
});
