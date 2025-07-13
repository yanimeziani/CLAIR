import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Texte requis' },
        { status: 400 }
      );
    }

    // Call AI backend for text correction
    const aiBackendUrl = process.env.AI_BACKEND_URL || 'http://localhost:8001';
    
    const response = await fetch(`${aiBackendUrl}/correct-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`AI Backend error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      correctedText: data.corrected_text || text, // Fallback to original text
      corrections: data.corrections || []
    });

  } catch (error) {
    console.error('Text correction error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Service IA temporairement indisponible',
      correctedText: null
    }, { status: 503 });
  }
}