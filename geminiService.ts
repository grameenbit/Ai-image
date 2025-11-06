import { GoogleGenAI, Modality, Part } from "@google/genai";
import { SourceImage } from "../types";

const MODEL_NAME = 'gemini-2.5-flash-image';

export const generateImage = async (prompt: string, inputImage: SourceImage | null, style: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  
  // Create a new instance for each call to ensure the latest API key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: Part[] = [];

  if (inputImage) {
    parts.push({
      inlineData: {
        data: inputImage.data,
        mimeType: inputImage.mimeType,
      },
    });
  }

  const stylePrompts: { [key: string]: string } = {
    'Photorealistic': 'Create a high-detail, photorealistic image.',
    'Anime': 'Transform into the vibrant, expressive style of Japanese anime.',
    'Ghibli': 'Recreate in the whimsical, hand-drawn animation style of Studio Ghibli.',
    'Oil Painting': 'Render as a rich, textured oil painting with visible brushstrokes.',
    'Cyberpunk': 'Reimagine in a futuristic, neon-lit cyberpunk art style.',
    'Vintage': 'Apply a retro, vintage photograph effect with faded colors and film grain.',
    'Minimalist': 'Convert to a clean, simple, minimalist style with a limited color palette.',
    '3D Render': 'Generate as a polished, high-resolution 3D digital render, like something from Pixar.'
  };

  const styleDescription = style && style !== 'Default' && stylePrompts[style] ? stylePrompts[style] : '';
  
  // Combine user prompt with style description for a more powerful final prompt.
  const finalPrompt = [prompt, styleDescription].filter(Boolean).join('. ');

  // A text part is required by the model.
  parts.push({ text: finalPrompt || 'Turn this into a high-quality, realistic image.' });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }
    
    // Check for safety ratings and provide a more specific error if blocked.
    const safetyRatings = response.candidates?.[0]?.safetyRatings;
    if (safetyRatings && safetyRatings.some(rating => rating.blocked)) {
        throw new Error('Image generation failed due to safety settings. Please modify your prompt and try again.');
    }

    throw new Error('No image was generated. The response may be empty.');
  } catch (error) {
    console.error("Gemini API Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred with the Gemini API.';
    throw new Error(errorMessage);
  }
};

export const upscaleImage = async (inputImage: SourceImage): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts: Part[] = [
    {
      inlineData: {
        data: inputImage.data,
        mimeType: inputImage.mimeType,
      },
    },
    {
      text: 'Upscale this image, enhancing its resolution and clarity. Make the details sharper and clearer without altering the content or style.'
    }
  ];

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }

    const safetyRatings = response.candidates?.[0]?.safetyRatings;
    if (safetyRatings && safetyRatings.some(rating => rating.blocked)) {
      throw new Error('Image upscaling failed due to safety settings.');
    }

    throw new Error('No upscaled image was generated.');
  } catch (error) {
    console.error("Gemini API Error during upscaling:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred with the Gemini API during upscaling.';
    throw new Error(errorMessage);
  }
};
