import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { 
      text, 
      context = 'healthcare', 
      language = 'french', 
      enhancement_type = 'professional' 
    } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Texte manquant ou invalide'
      }, { status: 400 });
    }

    if (text.trim().length < 10) {
      return NextResponse.json({
        success: false,
        error: 'Le texte doit contenir au moins 10 caractères'
      }, { status: 400 });
    }

    const aiBackendUrl = process.env.AI_BACKEND_URL || 'http://localhost:8001';

    // Prepare the enhancement prompt based on type
    let enhancementPrompt = '';
    switch (enhancement_type) {
      case 'professional':
        enhancementPrompt = language === 'french' 
          ? 'Réécrivez ce texte en utilisant un ton professionnel et médical approprié, en corrigeant la grammaire et en améliorant la clarté.'
          : 'Rewrite this text using professional medical tone, correcting grammar and improving clarity.';
        break;
      case 'concise':
        enhancementPrompt = language === 'french'
          ? 'Réécrivez ce texte de manière plus concise tout en gardant toutes les informations importantes.'
          : 'Rewrite this text more concisely while keeping all important information.';
        break;
      case 'detailed':
        enhancementPrompt = language === 'french'
          ? 'Enrichissez ce texte en ajoutant des détails pertinents et des précisions médicales appropriées.'
          : 'Enhance this text by adding relevant details and appropriate medical specifications.';
        break;
    }

    const response = await fetch(`${aiBackendUrl}/enhance-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        context,
        language,
        enhancement_type,
        enhancement_prompt: enhancementPrompt
      }),
    });

    if (!response.ok) {
      console.error('AI backend error:', response.status, response.statusText);
      return NextResponse.json({
        success: false,
        error: 'Service IA temporairement indisponible'
      }, { status: 503 });
    }

    const data = await response.json();
    
    if (!data.enhanced_text) {
      return NextResponse.json({
        success: false,
        error: 'Aucune amélioration générée'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      original_text: text,
      enhanced_text: data.enhanced_text,
      enhancement_type,
      word_count_original: text.split(/\s+/).length,
      word_count_enhanced: data.enhanced_text.split(/\s+/).length,
      model_used: data.model_used || 'gemma3:4b',
      confidence_score: data.confidence_score || 0.85,
      improvements: data.improvements || {
        tone_improved: enhancement_type === 'professional',
        clarity_improved: true,
        medical_terminology_enhanced: context === 'healthcare'
      }
    });

  } catch (error) {
    console.error('Error enhancing text:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'amélioration du texte'
    }, { status: 500 });
  }
}