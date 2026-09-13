import mammoth from 'mammoth';
import { Question } from '../types';

/**
 * Parses Word (.docx) documents containing Olympiad questions.
 * Format supported:
 * 1. Savol matni. [10 ball]
 * A) Variant 1
 * B) Variant 2*
 * C) Variant 3
 * D) Variant 4
 * 
 * Or:
 * To'g'ri javob: B
 */
export async function parseDocxQuestions(file: File, olympiadId: string): Promise<Question[]> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value || '';

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const questions: Question[] = [];
  let currentQuestion: {
    content: string;
    points: number;
    options: { key: string; text: string; isCorrect: boolean }[];
    correctAnswer?: string;
  } | null = null;

  // Question header regex: e.g. "1.", "1)", "1-savol:", "Savol 1:"
  const questionHeaderRegex = /^(?:(\d+)[\.\)]|Savol\s*\d+:?)\s*(.*)/i;
  // Option regex: e.g. "A)", "A.", "a)", "a."
  const optionRegex = /^([A-Z])[\.\)]\s*(.*)/i;
  // Correct answer line regex: e.g. "To'g'ri javob: B", "Javob: B"
  const correctAnswerLineRegex = /^(?:To['’`]?g['’`]?ri\s+javob|Javob|Answer):\s*([A-Z])/i;
  // Points regex: e.g. "[10 ball]", "[15 points]", "[10]"
  const pointsRegex = /\[(\d+)\s*(?:ball|ballari|points|pts)?\]/i;

  function finalizeCurrentQuestion() {
    if (!currentQuestion) return;
    if (!currentQuestion.content) return;

    let correctAns = currentQuestion.correctAnswer;
    const optionsTextList: string[] = [];

    currentQuestion.options.forEach((opt) => {
      optionsTextList.push(opt.text);
      if (opt.isCorrect) {
        correctAns = opt.key;
      }
    });

    // If correctAns was not specified by asterisk or separate line, default to 'A' if options exist
    if (!correctAns && currentQuestion.options.length > 0) {
      correctAns = currentQuestion.options[0].key;
    }

    questions.push({
      id: `q-docx-${Date.now()}-${questions.length + 1}`,
      olympiadId,
      roundId: 'r1',
      type: currentQuestion.options.length > 0 ? 'multiple_choice' : 'open_text',
      content: currentQuestion.content,
      points: currentQuestion.points || 10,
      order: questions.length + 1,
      options: currentQuestion.options.length > 0 ? optionsTextList : undefined,
      correctAnswer: correctAns
    });

    currentQuestion = null;
  }

  for (const line of lines) {
    const qMatch = line.match(questionHeaderRegex);
    const optMatch = line.match(optionRegex);
    const correctLineMatch = line.match(correctAnswerLineRegex);

    if (correctLineMatch && currentQuestion) {
      currentQuestion.correctAnswer = correctLineMatch[1].toUpperCase();
      continue;
    }

    if (optMatch && currentQuestion) {
      const optionKey = optMatch[1].toUpperCase();
      let optionVal = optMatch[2].trim();
      let isCorrect = false;

      if (optionVal.endsWith('*')) {
        isCorrect = true;
        optionVal = optionVal.slice(0, -1).trim();
      }

      currentQuestion.options.push({
        key: optionKey,
        text: optionVal,
        isCorrect
      });
      continue;
    }

    if (qMatch) {
      // Finalize previous question if any
      finalizeCurrentQuestion();

      let qText = line.replace(/^(?:\d+[\.\)]|Savol\s*\d+:?)\s*/i, '').trim();
      let pts = 10;

      const pMatch = qText.match(pointsRegex);
      if (pMatch) {
        pts = parseInt(pMatch[1], 10) || 10;
        qText = qText.replace(pointsRegex, '').trim();
      }

      currentQuestion = {
        content: qText,
        points: pts,
        options: []
      };
      continue;
    }

    // Append text if question is currently active
    if (currentQuestion) {
      if (currentQuestion.options.length > 0) {
        const lastOpt = currentQuestion.options[currentQuestion.options.length - 1];
        lastOpt.text += ' ' + line;
      } else {
        const pMatch = line.match(pointsRegex);
        if (pMatch) {
          currentQuestion.points = parseInt(pMatch[1], 10) || currentQuestion.points;
          currentQuestion.content += ' ' + line.replace(pointsRegex, '').trim();
        } else {
          currentQuestion.content += ' ' + line;
        }
      }
    }
  }

  // Finalize last question
  finalizeCurrentQuestion();

  return questions;
}
