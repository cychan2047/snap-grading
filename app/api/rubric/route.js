import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

async function make_rubrics(image, prompt) {
  const { object } = await generateObject({
    // model: openai('gpt-4o'),
    model: google('gemini-1.5-pro'),
    schemaName: 'Rubrics',
    schemaDescription: 'Rubrics for the following grading.',
    schema: MakeRubricsResponseSchema,
    temperature: 0.1,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', image },
          { type: 'text', text: prompt },
        ]
      },
    ],
  });
  return object;
}

const SimpleRubricSchema = z.object({
  description: z.string(),
  expression: z.string(),
  total_points: z.number(),
});

const MakeRubricsResponseSchema = z.object({
  original_problem: z.string(),
  problem_type: z.string(),
  rubrics: z.array(SimpleRubricSchema),
  remark: z.string(),
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const base64Image = formData.get('image'); // Changed from 'image_url'
    const prompt = formData.get('prompt');

    console.log("base64 image length: ", base64Image ? base64Image.length : 'No image');

    if (!base64Image || !prompt) {
      return NextResponse.json({ error: 'Base64 image and prompt are required' }, { status: 400 });
    }

    // Decode base64 image
    const buffer = Buffer.from(base64Image, 'base64');

    // Generate rubrics
    const rubrics = await make_rubrics(buffer, prompt);

    console.log(JSON.stringify(rubrics));

    return NextResponse.json(rubrics);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}