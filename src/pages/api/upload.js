// src/pages/api/upload.js
import { v2 as cloudinary } from 'cloudinary';
const formidable = require('formidable');
import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.API_SECRET,
  });

export const config = {
  api: {
    bodyParser: false,
  },
};

// Buffer is used to work with binary data[images, files] - Function to fetch an image and return it as a buffer
async function fetchImageAsBuffer(imageURL) {
    try {
      const response = await axios.get(imageURL, { responseType: 'arraybuffer' }); //It sends a request to the URL of the image using a tool called axios, it gets the image as raw data—a long sequence of numbers (binary data) that represent the image file.
      return Buffer.from(response.data, 'binary');  //raw data it into a "buffer". Function that takes the raw data (binary data) and converts it into a buffer
      // image is in the buffer, you can do things with it, like saving it to your computer or sending it somewhere else.
    } catch (error) {
      console.error('Error fetching the image:', error);
      throw new Error('Image fetch error'); // it causes the function to stop - till function scope only
    }
    // An ArrayBuffer holds raw binary data, and you can convert that raw data into a format that's easier to work with, such as a Buffer in Node.js.
  }
  
// Function to convert the buffer into the format needed for the generative part
function fileToGenerativePart(buffer, mimeType) {
    const base64Data = buffer.toString('base64');
    return {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };
  }
  
  async function aiResponse(imageURL) {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
    const imageBuffer = await fetchImageAsBuffer(imageURL);//receive buffer
  
    if (!imageBuffer) {
      throw new Error('Image buffer is null');
    }

    const imagePart = fileToGenerativePart(imageBuffer, "image/jpeg");//buffer to format needed for AI input
  
    const prompt = `REPLY WITH EVERYTHING ASKED, NEVER REPLY WITH
    THAT SOMETHING IS NOT MENTIONED ON THE PACKAGE YOUR DUTY IS TO REPLY BASED ON YOUR CONSIDERATION, 
    JUST REPLY WITH THE DIRECT INFORMATION, NOTHING EXTRA AS YOUR RESPONSE IS 
    SEEN BY USERS IN AN APP SO YOUR CHAT LIKE EXTRA RESPONSE SOUNDS UNREAL: STRICTLY DO NOT GIVE ANY DISCLAIMERS
    health % overall based on several important health parameters according to you, benefits according to you,
    disadvantages according to you, precautions according to you, who should strictly avoid according to you and % of cholesterol, protein, vitamins etc.
    GIVE YOUR RESPONSE IN HEADINGS, IF YOU FOUND IMAGE AS NOT CLEAR OR IRRELEVANT SO REPLY WITH 'UPLOAD CLEAR IMAGE' OR 'UPLOAD RELEVANT IMAGE'. WHEN GIVING RESPONSE FOR ALL DATA UNDER HEADING 
    IF THERE ARE BULLET POINTS KINDLY ASSIGN NUMBER TO BULLETS. GIVE RESULT IN HTML and response other than html should not exceed more than 80 words`; // Your AI prompt here
  
    try {
      const result = await model.generateContent([prompt, imagePart]);
      return result.response.text();
    } catch (error) {
      console.error('Error with AI response:', error);
      throw new Error('AI response error');
    }
  }
  
  export default async function handler(req, res) {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing the file' });
      }
  
      try {
        const file = files.file[0]; // Get the uploaded file

        // Upload the file to Cloudinary
        const result = await cloudinary.uploader.upload(file.filepath);
        // filepath is the temporary location where Formidable stores the uploaded file until you decide what to do with it.
        
        // Generate AI response using the Cloudinary URL
        const response = await aiResponse(result.secure_url);//string response

        // Send back the AI response
        res.status(200).json({ response });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process the image' });
      }
    });
  }