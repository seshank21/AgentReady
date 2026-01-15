const { GoogleGenerativeAI } = require('@google/generative-ai');

const key = "AIzaSyBvDbTThKEGiTdHTOTYjIA3IcOorCstzqE";
const genAI = new GoogleGenerativeAI(key);

async function listModels() {
    try {
        const list = await genAI.getGenerativeModel({ model: "gemini-pro" }).listModels(); // listModels is not on the model instance
        // Correct way in newer SDKs might be genAI.listModels()
        console.log(list);
    } catch (e) {
        // Actually, listModels is an async function on the GoogleGenerativeAI instance if it's the correct version
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
            const data = await response.json();
            console.log(JSON.stringify(data, null, 2));
        } catch (err) {
            console.error(err);
        }
    }
}

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
listModels();
