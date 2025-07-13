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

    // Call AI backend for summary generation
    const aiBackendUrl = process.env.AI_BACKEND_URL || 'http://localhost:8001';
    
    const response = await fetch(`${aiBackendUrl}/generate-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text,
        context: 'healthcare', // Specify medical/healthcare context
        language: 'french'
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Backend error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      summary: data.summary || 'Résumé non disponible',
      keywords: data.keywords || []
    });

  } catch (error) {
    console.error('Summary generation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Service IA temporairement indisponible',
      summary: null
    }, { status: 503 });
  }
}