const { GoogleGenerativeAI } = require('@google/generative-ai');
const cheerio = require('cheerio');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const key = "AIzaSyBvDbTThKEGiTdHTOTYjIA3IcOorCstzqE";
const genAI = new GoogleGenerativeAI(key);

async function test() {
    const url = "https://mlada.in/products/mehroon-cotton-linen-long-kurta";
    console.log('Fetching:', url);
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('title').text();
    const bodyText = $('body').text().replace(/\s+/g, ' ').substring(0, 1000);

    console.log('Scraped Title:', title);

    const systemPrompt = "Extract: 'product_name', 'price', 'buy_link_found', 'summary'. Return JSON.";
    const userPrompt = `Title: ${title}\nContent: ${bodyText}`;

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-pro-latest',
            generationConfig: {}
        });
        const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
        console.log('Gemini Result:', result.response.text());
    } catch (e) {
        console.error('Gemini Error:', e);
    }
}

test();
