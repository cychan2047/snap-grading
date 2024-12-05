import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

// Updated make_grades function
async function make_grades(image, prompt, rubric) {
  const { object } = await generateObject({
    // model: openai('gpt-4o'),
    model: google('gemini-1.5-pro'),
    schemaName: 'Grade',
    schemaDescription: 'Grading result according to the given rubric',
    schema: GradeByRubricsResponseSchema,
    temperature: 0.1,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', image }, // Pass the image buffer
          { type: 'text', text: prompt },
          { type: 'text', text: rubric },
        ],
      },
    ],
  });
  return object;
}

const GradeByStepSchema = z.object({
  step_expression: z.string(),
  correctness: z.boolean(),
  grade: z.number(),
});

const GradeByRubricsResponseSchema = z.object({
  steps_and_correctness: z.array(GradeByStepSchema),
  final_answer_correctness: z.boolean(),
  final_score: z.number(),
  remark: z.string(),
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const base64Image = formData.get('image'); // Changed from 'image_url'
    const prompt = formData.get('prompt');
    const rubric = formData.get('rubric');

    console.log("base64 image length: ", base64Image ? base64Image.length : 'No image');
    console.log("prompt: ", prompt);

    if (!base64Image || !prompt || !rubric) {
      return NextResponse.json({ error: 'Base64 image, prompt, and rubric are required' }, { status: 400 });
    }

    // Decode base64 image
    const buffer = Buffer.from(base64Image, 'base64');

    // Generate grades
    const grades = await make_grades(buffer, prompt, rubric);

    console.log(JSON.stringify(grades));

    return NextResponse.json(grades);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}