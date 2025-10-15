import { NextRequest, NextResponse } from 'next/server';
import { aboutMe, experience, researchExperience, projects, skillsData } from '@/app/resources/consts';

// System prompt with context about Yasasvi
const getSystemPrompt = () => {
  const experienceText = experience.map(exp => 
    `${exp.role} at ${exp.company} (${exp.timeframe}):\n${exp.achievements.join('\n')}`
  ).join('\n\n');

  const researchText = `${researchExperience.role} - ${researchExperience.title} at ${researchExperience.company} (${researchExperience.timeframe}):\n${researchExperience.achievements.join('\n')}`;

  const projectsText = projects.map(proj =>
    `${proj.name}: ${proj.description}\nTechnologies: ${proj.technologies.join(', ')}\nFeatures: ${proj.features.join(', ')}`
  ).join('\n\n');

  const skillsByCategory = skillsData.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(`${skill.name} (${skill.experience}, Level: ${skill.level}%)`);
    return acc;
  }, {} as Record<string, string[]>);

  const skillsText = Object.entries(skillsByCategory)
    .map(([category, skills]) => `${category.toUpperCase()}:\n${skills.join(', ')}`)
    .join('\n\n');

  return `You are an AI assistant for Yasasvi Nellore's portfolio website. Your role is to help visitors learn about Yasasvi's professional experience, skills, and projects in a friendly and informative way.

ABOUT YASASVI:
${aboutMe}

PROFESSIONAL EXPERIENCE:
${experienceText}

RESEARCH EXPERIENCE:
${researchText}

SKILLS & TECHNOLOGIES:
${skillsText}

PROJECTS:
${projectsText}

INSTRUCTIONS:
- Be enthusiastic and professional when discussing Yasasvi's work
- Provide specific examples from his experience when answering questions
- If asked about technologies, mention relevant projects or work experience where he used them
- If asked "Can you help with X?", explain Yasasvi's expertise in that area with concrete examples
- Keep responses concise but informative (2-4 sentences typically)
- If you don't have information about something specific, politely say so and redirect to what you do know
- Use "Yasasvi" or "he" when referring to him, or speak as if you're representing him ("I have experience with...")
- Highlight impressive achievements like 99.99% uptime, 5M+ events/day processing, AI/ML implementations
- When discussing AI/ML, emphasize the chatbot itself as an example of his AI capabilities

Remember: You're showcasing Yasasvi's expertise and helping potential employers or collaborators understand his capabilities!`;
};

// Simple OpenAI-compatible chat function using fetch
async function chatWithAI(userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️ No OpenAI API key found - using fallback responses');
    return getLocalResponse(userMessage);
  }

  try {
    console.log('🤖 Calling OpenAI API for question:', userMessage);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using the cost-effective model
        messages: [
          {
            role: 'system',
            content: getSystemPrompt()
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API error:', response.status, response.statusText, errorData);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI API responded successfully');
    return data.choices[0]?.message?.content || 'I apologize, but I encountered an issue. Please try asking your question again.';
  } catch (error) {
    console.error('❌ Error calling OpenAI API:', error);
    console.log('⚠️ Falling back to rule-based responses');
    
    // Fallback to rule-based responses if API fails
    return getLocalResponse(userMessage);
  }
}

// Fallback rule-based response system
function getLocalResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Current work/employment questions
  if (lowerMessage.includes('work') || lowerMessage.includes('currently') || lowerMessage.includes('now') || lowerMessage.includes('current') || lowerMessage.includes('employer') || lowerMessage.includes('company')) {
    return `Yasasvi currently works at Twisted X Global Brands (Dec 2024 - Present) as a Software Engineer. He previously worked at JP Morgan Chase (Jul-Dec 2024) and Red Cloud Technologies. At Twisted X, he's building AI-powered systems including LangChain + Azure OpenAI RAG pipelines, Python forecasting models, and real-time anomaly detection systems.`;
  }

  // Experience questions
  if (lowerMessage.includes('experience') || lowerMessage.includes('background')) {
    return `Yasasvi has 5+ years of professional software engineering experience, including roles at JP Morgan Chase and Twisted X Global Brands. He specializes in building scalable microservices with Java/Spring Boot, creating modern React/TypeScript frontends, and implementing AI/ML solutions. He's worked on systems processing 5M+ events/day with 99.99% uptime!`;
  }

  // Java/Spring Boot questions
  if (lowerMessage.includes('java') || lowerMessage.includes('spring')) {
    return `Yes! Java and Spring Boot are core strengths. At JP Morgan Chase, Yasasvi architected Spring Boot microservices handling 5M+ events/day with zero downtime. He has 5+ years of experience with Java 17, Spring Boot, Hibernate, and building enterprise-grade REST APIs and microservices architectures.`;
  }

  // React/Frontend questions
  if (lowerMessage.includes('react') || lowerMessage.includes('frontend') || lowerMessage.includes('typescript')) {
    return `Absolutely! Yasasvi has 5+ years of React and TypeScript experience. He's revamped React applications with code-splitting and lazy loading, reducing page load times from 3s to 1.8s. He's proficient in Next.js, Redux, React Query, and modern frontend build tools like Webpack.`;
  }

  // AI/ML questions
  if (lowerMessage.includes('ai') || lowerMessage.includes('ml') || lowerMessage.includes('machine learning') || lowerMessage.includes('artificial intelligence')) {
    return `Yasasvi has strong AI/ML capabilities! He's deployed LangChain + Azure OpenAI RAG pipelines, fine-tuned LLMs for wireless network research, implemented real-time anomaly detection with Isolation Forest, and built multiple AI projects including this very chatbot! He's experienced with TensorFlow, PyTorch, Scikit-learn, and Hugging Face.`;
  }

  // Cloud/AWS questions
  if (lowerMessage.includes('cloud') || lowerMessage.includes('aws') || lowerMessage.includes('kubernetes') || lowerMessage.includes('docker')) {
    return `Yasasvi is highly experienced with cloud infrastructure! He's AWS certified with 5+ years using AWS (EC2, S3, EKS, SageMaker), Docker, and Kubernetes. He's optimized Dockerized deployments, configured CI/CD pipelines with GitHub Actions, and managed containerized microservices on AWS EKS achieving 99.99% uptime.`;
  }

  // Project questions
  if (lowerMessage.includes('project') || lowerMessage.includes('built') || lowerMessage.includes('portfolio')) {
    return `Yasasvi has built impressive projects including an AI Image Generation Platform using DALL·E, an AI Mock Interview Platform with Next.js and Google Gemini, a Chess engine with Monte Carlo Tree Search, a Diffusion Model for face generation, and several full-stack applications. Check out the Projects page for detailed information!`;
  }

  // Skills questions
  if (lowerMessage.includes('skill') || lowerMessage.includes('technology') || lowerMessage.includes('tech stack')) {
    return `Yasasvi's tech stack includes: Java, Python, JavaScript/TypeScript, Spring Boot, React/Next.js, Node.js, AWS, Docker, Kubernetes, PostgreSQL, MongoDB, Kafka, TensorFlow, PyTorch, and many more! He has 50+ technologies in his toolkit spanning full-stack development, cloud infrastructure, and AI/ML. Visit the Skills page for the complete breakdown!`;
  }

  // Help questions
  if (lowerMessage.includes('can you help') || lowerMessage.includes('do you know')) {
    const technologies = ['microservices', 'api', 'backend', 'database', 'devops', 'automation'];
    const mentioned = technologies.find(tech => lowerMessage.includes(tech));
    
    if (mentioned) {
      return `Yes! Yasasvi has extensive experience with ${mentioned}. With 5+ years of professional experience at companies like JP Morgan Chase, he's built production systems handling millions of requests. Feel free to ask specific questions about his ${mentioned} experience!`;
    }
  }

  // JP Morgan questions
  if (lowerMessage.includes('jp morgan') || lowerMessage.includes('jpmorgan') || lowerMessage.includes('chase')) {
    return `At JP Morgan Chase (Jul-Dec 2024), Yasasvi architected Spring Boot microservices on AWS EKS handling 5M+ events/day, achieved 99.99% uptime with circuit-breaker patterns and monitoring, and optimized MongoDB queries to reduce response time from 200ms to 120ms while supporting 5× greater throughput.`;
  }

  // General who/what/where questions
  if (lowerMessage.includes('who') || lowerMessage.includes('what') || lowerMessage.includes('best at') || lowerMessage.includes('good at') || lowerMessage.includes('specialize')) {
    return `Yasasvi Nellore is a Full-Stack Software Engineer with 5+ years of experience. He specializes in Java/Spring Boot microservices, React/TypeScript frontends, and AI/ML systems. He's best at building scalable cloud-native applications on AWS with 99.99% uptime, processing millions of events per day, and implementing cutting-edge AI solutions like LangChain RAG pipelines and real-time anomaly detection.`;
  }

  // Education questions
  if (lowerMessage.includes('education') || lowerMessage.includes('degree') || lowerMessage.includes('university') || lowerMessage.includes('study')) {
    return `Yasasvi has a Master's degree and worked as a Graduate Research Assistant at The University of Texas at Arlington (Dec 2023 - May 2024), where he fine-tuned LLMs for wireless network research and achieved 92% model accuracy using TensorFlow and PyTorch.`;
  }

  // Contact/hire questions
  if (lowerMessage.includes('contact') || lowerMessage.includes('hire') || lowerMessage.includes('email') || lowerMessage.includes('reach')) {
    return `You can contact Yasasvi at yasasvi.nellore@gmail.com or connect with him on LinkedIn at linkedin.com/in/yasasvi-nellore/. He's currently open to opportunities and excited to discuss how he can contribute to your team!`;
  }

  // Location questions
  if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('based')) {
    return `Yasasvi is based in Texas, USA. He's currently working at Twisted X Global Brands in Texas and previously worked at JP Morgan Chase, also in Texas.`;
  }

  // Default response
  return `I'd be happy to help! Yasasvi is a Full-Stack Engineer with 5+ years of experience at companies like JP Morgan Chase and Twisted X Global Brands. He specializes in Java/Spring Boot, React/TypeScript, AWS, and AI/ML. You can ask me about his work experience, technical skills, specific projects, or technologies he knows. What would you like to know?`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get AI response
    const response = await chatWithAI(message);

    return NextResponse.json({
      response,
      success: true
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        response: 'I apologize, but I encountered an error. Please try asking your question again or visit the About, Skills, and Projects pages to learn more about Yasasvi!'
      },
      { status: 500 }
    );
  }
}

