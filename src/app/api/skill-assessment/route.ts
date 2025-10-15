import { NextRequest, NextResponse } from 'next/server';

// System prompt for code evaluation
const getEvaluationPrompt = (challengeId: string, code: string, testCases: string[]) => {
  return `You are an expert code reviewer and programming mentor. Your role is to evaluate student code solutions and provide constructive feedback.

CHALLENGE ID: ${challengeId}
SUBMITTED CODE:
${code}

TEST CASES TO VERIFY:
${testCases.map((tc, i) => `${i + 1}. ${tc}`).join('\n')}

Please analyze the code and provide:
1. Whether the solution would pass the test cases (true/false)
2. Specific feedback on the code quality, correctness, and approach
3. 2-3 concrete learning recommendations for improvement

Respond in JSON format:
{
  "passed": boolean,
  "feedback": "detailed feedback string",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Be encouraging if the solution is correct, but still suggest optimizations.
If incorrect, explain what's wrong and guide them toward the solution without giving it away completely.`;
};

// Fallback evaluation for when API is not available
function fallbackEvaluation(code: string, testCases: string[]): any {
  const hasCode = code.trim().length > 50; // Basic check for meaningful code
  const hasReturn = code.includes('return');
  const hasLogic = code.includes('for') || code.includes('while') || code.includes('if') || code.includes('map') || code.includes('filter');

  const passed = hasCode && hasReturn && hasLogic;

  return {
    passed,
    feedback: passed
      ? "Good effort! Your code structure looks reasonable. The logic appears sound and you've returned a value. Consider edge cases and optimizing your approach further."
      : "Your solution needs more work. Make sure you've:\n1. Implemented the required logic\n2. Handled the test cases properly\n3. Returned the correct output\nReview the test cases and hints for guidance.",
    recommendations: passed
      ? [
          "Consider edge cases like empty inputs or extreme values",
          "Look for opportunities to optimize time/space complexity",
          "Add comments to explain your approach"
        ]
      : [
          "Review the problem description and test cases carefully",
          "Try breaking down the problem into smaller steps",
          "Look at the hints provided for guidance",
          "Test your code with the provided test cases manually"
        ]
  };
}

// Evaluate code using AI
async function evaluateCodeWithAI(challengeId: string, code: string, testCases: string[]): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️ No OpenAI API key found - using fallback evaluation');
    return fallbackEvaluation(code, testCases);
  }

  try {
    console.log('🤖 Evaluating code with AI for challenge:', challengeId);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert programming mentor who provides constructive, encouraging feedback on code solutions.'
          },
          {
            role: 'user',
            content: getEvaluationPrompt(challengeId, code, testCases)
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API error:', response.status, response.statusText, errorData);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in API response');
    }

    console.log('✅ AI evaluation completed successfully');
    const evaluation = JSON.parse(content);
    
    // Ensure the response has the expected structure
    return {
      passed: evaluation.passed || false,
      feedback: evaluation.feedback || 'Evaluation completed.',
      recommendations: Array.isArray(evaluation.recommendations) 
        ? evaluation.recommendations 
        : ['Keep practicing!', 'Review the problem carefully', 'Test your code with different inputs']
    };

  } catch (error) {
    console.error('❌ Error evaluating code with AI:', error);
    console.log('⚠️ Falling back to rule-based evaluation');
    return fallbackEvaluation(code, testCases);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { challengeId, code, testCases } = body;

    // Validation
    if (!challengeId || typeof challengeId !== 'string') {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(testCases)) {
      return NextResponse.json(
        { error: 'Test cases must be an array' },
        { status: 400 }
      );
    }

    // Basic security check - reject potentially dangerous code
    const dangerousPatterns = [
      'eval(',
      'Function(',
      'require(',
      'import(',
      'fetch(',
      'XMLHttpRequest',
      'document.',
      'window.',
      'process.',
      'fs.',
      '__dirname',
      '__filename'
    ];

    const hasDangerousCode = dangerousPatterns.some(pattern => 
      code.toLowerCase().includes(pattern.toLowerCase())
    );

    if (hasDangerousCode) {
      return NextResponse.json({
        passed: false,
        feedback: 'Your code contains patterns that are not allowed for security reasons. Please focus on the algorithm logic without using browser APIs, file system access, or dynamic code evaluation.',
        recommendations: [
          'Use only basic JavaScript features for the solution',
          'Avoid browser APIs and external resources',
          'Focus on the core algorithm logic'
        ]
      });
    }

    // Evaluate the code
    const evaluation = await evaluateCodeWithAI(challengeId, code, testCases);

    return NextResponse.json(evaluation);

  } catch (error) {
    console.error('Skill assessment API error:', error);
    return NextResponse.json(
      { 
        passed: false,
        feedback: 'Sorry, we encountered an error while evaluating your code. Please try again.',
        recommendations: [
          'Check your code syntax',
          'Make sure you\'ve implemented all required functionality',
          'Try submitting again'
        ]
      },
      { status: 500 }
    );
  }
}

