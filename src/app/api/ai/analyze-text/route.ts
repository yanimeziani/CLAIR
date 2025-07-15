import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, context = 'healthcare', language = 'french', analysis_type = 'realtime' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Texte manquant ou invalide'
      }, { status: 400 });
    }

    // For real-time analysis, we can do some basic checks client-side
    // or make a lightweight call to the AI backend
    const aiBackendUrl = process.env.AI_BACKEND_URL || 'http://localhost:8001';

    const response = await fetch(`${aiBackendUrl}/analyze-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        context,
        language,
        analysis_type
      }),
    });

    if (!response.ok) {
      console.error('AI backend error:', response.status, response.statusText);
      
      // Fallback to basic analysis if AI backend is not available
      const errors = performBasicAnalysis(text, language);
      
      return NextResponse.json({
        success: true,
        errors,
        fallback: true
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      errors: data.errors || [],
      confidence_score: data.confidence_score || 0.7,
      model_used: data.model_used || 'fallback'
    });

  } catch (error) {
    console.error('Error analyzing text:', error);
    
    // Fallback to basic client-side analysis
    try {
      const { text, language = 'french' } = await request.json();
      const errors = performBasicAnalysis(text, language);
      
      return NextResponse.json({
        success: true,
        errors,
        fallback: true
      });
    } catch (fallbackError) {
      return NextResponse.json({
        success: false,
        error: 'Service temporairement indisponible'
      }, { status: 500 });
    }
  }
}

// Basic text analysis as fallback
function performBasicAnalysis(text: string, language: string) {
  const errors: Array<{
    type: 'grammar' | 'spelling' | 'style';
    message: string;
    start: number;
    end: number;
  }> = [];

  if (language === 'french') {
    // Basic French grammar checks
    const patterns = [
      {
        regex: /\b(ca|sa)\s+va\b/gi,
        type: 'grammar' as const,
        message: 'Peut-être vouliez-vous dire "ça va" ?'
      },
      {
        regex: /\bparmis\b/gi,
        type: 'spelling' as const,
        message: 'Orthographe: "parmi" (sans s)'
      },
      {
        regex: /\bquand\s+meme\b/gi,
        type: 'spelling' as const,
        message: 'Orthographe: "quand même" (avec accent)'
      },
      {
        regex: /\bbiensur\b/gi,
        type: 'spelling' as const,
        message: 'Orthographe: "bien sûr" (en deux mots avec accent)'
      },
      {
        regex: /\s{2,}/g,
        type: 'style' as const,
        message: 'Espaces multiples détectés'
      }
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        errors.push({
          type: pattern.type,
          message: pattern.message,
          start: match.index,
          end: match.index + match[0].length
        });
      }
    });
  }

  // Common issues for any language
  const commonPatterns = [
    {
      regex: /\.\s*[a-z]/g,
      type: 'style' as const,
      message: 'Majuscule manquante après un point'
    },
    {
      regex: /\s+$/gm,
      type: 'style' as const,
      message: 'Espaces en fin de ligne'
    }
  ];

  commonPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      errors.push({
        type: pattern.type,
        message: pattern.message,
        start: match.index,
        end: match.index + match[0].length
      });
    }
  });

  return errors.slice(0, 10); // Limit to 10 errors for performance
}