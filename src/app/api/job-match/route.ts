import { NextRequest, NextResponse } from 'next/server';
import { skillsData, experience, researchExperience } from '@/app/resources/consts';

interface SkillMatch {
  skill: string;
  matched: boolean;
  yourLevel?: number;
  required: string;
  category?: string;
}

interface MatchResult {
  overallScore: number;
  matchedSkills: SkillMatch[];
  missingSkills: SkillMatch[];
  recommendations: string[];
  strengths: string[];
  gapAnalysis: {
    critical: string[];
    nice_to_have: string[];
    learning_path: string[];
  };
  jobTitle?: string;
  matchCategory: 'excellent' | 'good' | 'moderate' | 'needs_improvement';
}

// Extract skills from user's profile
function getUserSkills() {
  const skills = new Map<string, { level: number; category: string; experience: string }>();
  
  skillsData.forEach(skill => {
    skills.set(skill.name.toLowerCase(), {
      level: skill.level,
      category: skill.category,
      experience: skill.experience
    });
  });

  return skills;
}

// Extract all experience text for additional context
function getUserExperienceText(): string {
  const expText = experience.map(exp => 
    exp.achievements.join(' ')
  ).join(' ');
  
  const researchText = researchExperience.achievements.join(' ');
  
  return `${expText} ${researchText}`;
}

// Advanced skill matching using AI
async function analyzeJobWithAI(
  jobDescription: string, 
  userSkills: Map<string, any>,
  customResume?: string
): Promise<MatchResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️ No OpenAI API key found - using rule-based analysis');
    return performRuleBasedAnalysis(jobDescription, userSkills, customResume);
  }

  try {
    let candidateProfile = '';
    
    if (customResume) {
      // Use custom resume for analysis
      candidateProfile = `CANDIDATE'S RESUME:\n${customResume}`;
    } else {
      // Use default profile (Yasasvi's skills and experience)
      const skillsList = Array.from(userSkills.entries()).map(([skill, data]) => 
        `${skill} (${data.level}% proficiency, ${data.experience}, ${data.category})`
      ).join('\n');

      const experienceContext = getUserExperienceText();
      
      candidateProfile = `CANDIDATE'S SKILLS:\n${skillsList}\n\nCANDIDATE'S EXPERIENCE HIGHLIGHTS:\n${experienceContext}`;
    }

    const systemPrompt = `You are an expert career advisor and technical recruiter. Analyze job descriptions and match them against a candidate's profile (either structured skills or a resume).

${candidateProfile}

Your task is to:
1. Extract ALL required and preferred skills from the job description
2. Match them against the candidate's skills (be flexible with synonyms and related technologies)
3. Calculate an accurate match percentage
4. Identify skill gaps and provide actionable recommendations
5. Create a personalized learning path

Respond in JSON format with this exact structure:
{
  "jobTitle": "extracted job title",
  "overallScore": number (0-100),
  "matchedSkills": [
    {
      "skill": "skill name",
      "matched": true,
      "yourLevel": number,
      "required": "requirement level from JD",
      "category": "skill category"
    }
  ],
  "missingSkills": [
    {
      "skill": "skill name",
      "matched": false,
      "required": "requirement level from JD"
    }
  ],
  "strengths": ["list of 3-5 key strengths specific to this job"],
  "recommendations": ["list of 4-6 specific, actionable recommendations"],
  "gapAnalysis": {
    "critical": ["critical skills to learn for this role"],
    "nice_to_have": ["nice to have skills"],
    "learning_path": ["step by step learning recommendations"]
  }
}

Important:
- Be thorough in extracting skills from the job description
- Match similar/related skills (e.g., "React" matches "React.js", "AWS" matches "Amazon Web Services")
- Consider experience level and years
- Provide honest, helpful recommendations
- Make the learning path practical and achievable`;

    console.log('🤖 Calling OpenAI API for job matching...');
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Analyze this job description and match it against the candidate's skills:\n\n${jobDescription}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API error:', response.status, response.statusText, errorData);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0]?.message?.content || '{}');
    
    console.log('✅ OpenAI API analysis completed');
    
    // Determine match category based on score
    let matchCategory: 'excellent' | 'good' | 'moderate' | 'needs_improvement';
    if (result.overallScore >= 85) matchCategory = 'excellent';
    else if (result.overallScore >= 70) matchCategory = 'good';
    else if (result.overallScore >= 50) matchCategory = 'moderate';
    else matchCategory = 'needs_improvement';

    return {
      ...result,
      matchCategory
    };

  } catch (error) {
    console.error('❌ Error calling OpenAI API:', error);
    console.log('⚠️ Falling back to rule-based analysis');
    return performRuleBasedAnalysis(jobDescription, userSkills, customResume);
  }
}

// Extract skills from custom resume text
function extractSkillsFromResume(resume: string): Map<string, any> {
  const resumeLower = resume.toLowerCase();
  const skills = new Map<string, any>();
  
  // Common technology keywords to look for
  const techKeywords = [
    // Languages
    'java', 'python', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin',
    // Frontend
    'react', 'angular', 'vue', 'next.js', 'svelte', 'redux', 'tailwind', 'bootstrap', 'sass', 'webpack',
    // Backend
    'node', 'express', 'spring', 'django', 'flask', 'rails', 'laravel', '.net', 'graphql',
    // Databases
    'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sql', 'nosql',
    // Cloud/DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'ci/cd',
    // AI/ML
    'tensorflow', 'pytorch', 'scikit-learn', 'machine learning', 'deep learning', 'nlp', 'computer vision',
    // Others
    'git', 'agile', 'scrum', 'rest', 'api', 'microservices', 'kafka', 'spark'
  ];
  
  // Check for each keyword in the resume
  techKeywords.forEach(keyword => {
    if (resumeLower.includes(keyword)) {
      // Try to estimate proficiency based on context
      let level = 70; // Default level
      
      // Boost level if there are indicators of expertise
      if (resumeLower.includes(`expert in ${keyword}`) || resumeLower.includes(`${keyword} expert`)) {
        level = 95;
      } else if (resumeLower.includes(`advanced ${keyword}`) || resumeLower.includes(`proficient in ${keyword}`)) {
        level = 85;
      } else if (resumeLower.includes(`senior ${keyword}`) || resumeLower.includes(`lead ${keyword}`)) {
        level = 90;
      }
      
      skills.set(keyword, {
        level,
        category: 'extracted',
        experience: 'Mentioned in resume'
      });
    }
  });
  
  return skills;
}

// Rule-based analysis fallback
function performRuleBasedAnalysis(
  jobDescription: string, 
  userSkills: Map<string, any>,
  customResume?: string
): MatchResult {
  const jdLower = jobDescription.toLowerCase();
  
  // If custom resume is provided, extract skills from it
  const skillsToMatch = customResume 
    ? extractSkillsFromResume(customResume)
    : userSkills;
  
  // Extract potential job title
  const titleMatch = jobDescription.match(/(?:title|position|role):\s*([^\n]+)/i) || 
                     jobDescription.match(/^([^\n]{10,80})/);
  const jobTitle = titleMatch ? titleMatch[1].trim() : 'Position';

  const matchedSkills: SkillMatch[] = [];
  const missingSkills: SkillMatch[] = [];
  
  // Common skill keywords and their variations
  const skillPatterns = new Map([
    ['java', ['java', 'j2ee', 'jdk']],
    ['spring boot', ['spring boot', 'springboot', 'spring framework']],
    ['react', ['react', 'react.js', 'reactjs']],
    ['node', ['node', 'node.js', 'nodejs']],
    ['python', ['python', 'py']],
    ['typescript', ['typescript', 'ts']],
    ['javascript', ['javascript', 'js']],
    ['aws', ['aws', 'amazon web services']],
    ['docker', ['docker', 'containerization']],
    ['kubernetes', ['kubernetes', 'k8s']],
    ['mongodb', ['mongodb', 'mongo']],
    ['postgresql', ['postgresql', 'postgres', 'psql']],
    ['graphql', ['graphql', 'graph ql']],
    ['rest', ['rest', 'restful', 'rest api']],
    ['microservices', ['microservices', 'microservice']],
    ['ci/cd', ['ci/cd', 'continuous integration', 'continuous deployment']],
    ['kafka', ['kafka', 'apache kafka']],
    ['redis', ['redis', 'cache']],
    ['tensorflow', ['tensorflow', 'tf']],
    ['pytorch', ['pytorch', 'torch']],
  ]);

  // Check each user skill against the job description
  skillsToMatch.forEach((data, skillName) => {
    const patterns = skillPatterns.get(skillName) || [skillName];
    const found = patterns.some(pattern => jdLower.includes(pattern));
    
    if (found) {
      matchedSkills.push({
        skill: skillName.charAt(0).toUpperCase() + skillName.slice(1),
        matched: true,
        yourLevel: data.level,
        required: 'Required/Preferred',
        category: data.category
      });
    }
  });

  // Look for commonly required skills that might be missing
  const commonRequiredSkills = [
    'agile', 'scrum', 'git', 'testing', 'api', 'database',
    'cloud', 'security', 'devops', 'angular', 'vue'
  ];

  commonRequiredSkills.forEach(skill => {
    if (jdLower.includes(skill) && !skillsToMatch.has(skill)) {
      // Check if it's a related skill they have
      const hasRelated = Array.from(skillsToMatch.keys()).some(userSkill => 
        userSkill.includes(skill) || skill.includes(userSkill)
      );
      
      if (!hasRelated) {
        missingSkills.push({
          skill: skill.charAt(0).toUpperCase() + skill.slice(1),
          matched: false,
          required: 'Mentioned in JD'
        });
      }
    }
  });

  // Calculate overall score
  const totalSkillsMentioned = matchedSkills.length + missingSkills.length;
  const overallScore = totalSkillsMentioned > 0 
    ? Math.round((matchedSkills.length / totalSkillsMentioned) * 100)
    : 75; // Default score if we can't extract skills

  // Determine match category
  let matchCategory: 'excellent' | 'good' | 'moderate' | 'needs_improvement';
  if (overallScore >= 85) matchCategory = 'excellent';
  else if (overallScore >= 70) matchCategory = 'good';
  else if (overallScore >= 50) matchCategory = 'moderate';
  else matchCategory = 'needs_improvement';

  // Generate strengths based on matched skills
  const categoryGroups = matchedSkills.reduce((acc, skill) => {
    if (skill.category) {
      acc[skill.category] = (acc[skill.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryGroups)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  const strengths = [
    `Strong match with ${matchedSkills.length} required/preferred skills`,
    topCategories.length > 0 ? `Expertise in ${topCategories.join(', ')}` : 'Well-rounded technical background',
    matchedSkills.some(s => s.yourLevel && s.yourLevel >= 90) 
      ? 'Advanced proficiency in key technologies'
      : 'Solid foundation in core technologies',
    customResume 
      ? 'Your experience aligns well with the job requirements'
      : '5+ years of professional software engineering experience',
  ];

  // Generate recommendations
  const recommendations = [
    matchedSkills.length > 0 
      ? `Highlight your expertise in ${matchedSkills.slice(0, 3).map(s => s.skill).join(', ')} in your application`
      : 'Focus on transferable skills and willingness to learn',
    missingSkills.length > 0
      ? `Consider learning ${missingSkills.slice(0, 2).map(s => s.skill).join(' and ')} to strengthen your profile`
      : 'Your skills are well-aligned with this position',
    'Emphasize relevant project experience and measurable achievements',
    'Tailor your resume to highlight skills mentioned in the job description',
  ];

  // Gap analysis
  const critical = missingSkills
    .filter(s => ['required', 'must have'].some(term => s.required.toLowerCase().includes(term)))
    .map(s => s.skill)
    .slice(0, 5);

  const nice_to_have = missingSkills
    .filter(s => !critical.includes(s.skill))
    .map(s => s.skill)
    .slice(0, 5);

  const learning_path = [
    critical.length > 0 
      ? `Start with critical skills: ${critical.slice(0, 2).join(' and ')}`
      : 'Focus on deepening existing expertise',
    'Build practical projects demonstrating these skills',
    'Complete relevant online courses or certifications',
    nice_to_have.length > 0 
      ? `Then expand to: ${nice_to_have.slice(0, 2).join(' and ')}`
      : 'Stay updated with industry trends',
  ];

  return {
    jobTitle,
    overallScore,
    matchedSkills: matchedSkills.slice(0, 30), // Limit for performance
    missingSkills: missingSkills.slice(0, 15),
    strengths,
    recommendations,
    gapAnalysis: {
      critical,
      nice_to_have,
      learning_path
    },
    matchCategory
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobDescription, resume } = body;

    if (!jobDescription || typeof jobDescription !== 'string') {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    if (jobDescription.length < 50) {
      return NextResponse.json(
        { error: 'Job description is too short. Please provide more details.' },
        { status: 400 }
      );
    }

    if (resume && typeof resume !== 'string') {
      return NextResponse.json(
        { error: 'Invalid resume format' },
        { status: 400 }
      );
    }

    const userSkills = getUserSkills();
    const result = await analyzeJobWithAI(jobDescription, userSkills, resume);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Job match API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze job description',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

