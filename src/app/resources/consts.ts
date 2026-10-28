export const footerButtonLinks = [{
    label : "Github",
    icon: "github",
    href: "https://github.com/Nyasasvi/",
},
{
    label : "Linkedin",
    icon: "linkedin",
    href: "https://www.linkedin.com/in/yasasvi-nellore/",
},
{
    label : "Mail",
    icon: "mail",
    href: "mailto:yasasvi.nellore@gmail.com",
},
{
    label : "Instagram",
    icon: "instagram",
    href: "https://www.instagram.com/yasasvi_reddy/profilecard/",
}]

export const aboutMe = "Full Stack & AI Engineer with 4+ years of experience designing scalable, distributed web applications and cloud-native microservices using Java, Python, and JavaScript/TypeScript. I specialize in microservices architecture, high-throughput backend systems, and API integrations across React, Spring Boot, and Node.js, and deploy cloud-native solutions with AWS, Docker, Kubernetes, and Jenkins. Today I'm focused on integrating AI and LLM-based systems (RAG, MCP, multi-agent orchestration, OpenAI/Gemini/Claude APIs) to make applications more intelligent and useful."

export const experience = [
  {
    "role": "Software Engineer – AI",
    "company": "Twisted X Global Brands",
    "location": "Texas, USA",
    "timeframe": "Dec 2024 - Present",
    "type": "Full-Time",
    "icon": "💼",
    "color": "#667eea",
    "achievements": [
      "Built and maintain an agentic AI supply chain intelligence platform using LangChain, LangGraph, and RAG, enabling multi-step reasoning, LLM orchestration, tool calling, eval harnesses, and retrieval across NetSuite ERP, supplier APIs, and logistics data, reducing reporting time by 70% and improving fulfillment by 15%.",
      "Engineered a web monitoring agent using Playwright and the Claude API to detect product listings across retailer sites, validate pricing compliance, and reduce false positives in matching workflows.",
      "Modernized inventory forecasting by replacing rolling 12-month historical averages (24–31% WAPE) with Google TimesFM 3, leveraging feature engineering and fine-tuning to achieve 11–21% WAPE across SKUs and categories while reducing manual tracking by 40%.",
      "Designed scalable ETL pipelines using Python and Snowflake to ingest supplier, trading partner, and sales data, standardizing disparate formats and building partner-specific dbt marts for consistent reporting and analytics.",
      "Streamlined CI/CD pipelines with GitHub Actions and Docker on AWS, enabling zero-downtime releases and cutting setup time from hours to minutes.",
      "Developed a product comparison tool using marqo-fashionSigLIP and DuckDB to match internal and competitor styles by image and attribute data, reducing duplication and identifying catalog gaps.",
      "Built MCP-based tool-calling agents through Celigo AI Studio, exposing NetSuite business logic via optimized RESTlet flows and JSON schema mapping, with guardrails, evaluations, rollback, and audit logging, reducing retrieval latency by 40%."
    ]
  },
  {
    "role": "Senior Associate – AI Research",
    "company": "JPMorgan Chase",
    "location": "Texas, USA",
    "timeframe": "Jul 2024 - Dec 2024",
    "type": "Full-Time",
    "icon": "🏦",
    "color": "#3b82f6",
    "achievements": [
      "Contributed to early-stage AI research projects across Commercial & Investment Banking (Markets) and Asset & Wealth Management, partnering with data scientists and engineering teams to prototype and evaluate new approaches.",
      "Prototyped LLM-based solutions using retrieval-augmented generation and prompt engineering, improving response relevance by 15% over baseline on internal test sets.",
      "Formulated problems, generated hypotheses, and developed models in Python, running experiments and evaluations that improved baseline performance by 12% on target tasks.",
      "Built and tested machine learning pipelines in Python (PyTorch, scikit-learn, pandas) on large-scale financial datasets, delivering reproducible code and cutting data prep time by 35%.",
      "Strengthened service resilience with circuit breakers, API Gateway rate limiting, and OAuth2 security, supported by Prometheus and Grafana monitoring.",
      "Developed reusable Python utilities and evaluation scripts that standardized experiment tracking and reduced new-experiment setup time by 30%."
    ]
  },
  {
    "role": "Software Engineer Intern",
    "company": "Colombo AI",
    "location": "Texas, USA",
    "timeframe": "Dec 2023 - May 2024",
    "type": "Internship",
    "icon": "🚀",
    "color": "#ec4899",
    "achievements": [
      "Built ColomboAI's end-to-end personalized feed pipeline using TypeScript, Node.js, React, and PostgreSQL, generating relevant content from follows, interests, and user interactions, increasing engagement by 30%.",
      "Developed a multi-signal feed ranking engine and REST APIs using affinity, engagement, recency, and time-decay scoring, with cursor pagination, deduplication, and creator-diversity rules for personalized infinite scrolling.",
      "Implemented the creator posting experience, including multi-modal content tools (\"Magic Pen\") for images, video, and text, increasing content creation activity by 20%.",
      "Built a Node.js recommendation pipeline that captured user interactions in PostgreSQL and computed weighted affinity scores from likes, comments, and viewing behavior to dynamically re-rank feeds.",
      "Optimized PostgreSQL performance for high-volume social feed and messaging data with targeted indexes and restructured queries, cutting average API response times by 40%."
    ]
  },
  {
    "role": "Software Developer",
    "company": "HCL Technologies",
    "location": "Hyderabad, India",
    "timeframe": "May 2021 - Jul 2022",
    "type": "Full-Time",
    "icon": "☁️",
    "color": "#10b981",
    "achievements": [
      "Delivered end-to-end Java/Spring Boot microservices on Agile teams, tuning SQL queries and integrating Elasticsearch to cut API latency by 300ms and save $12,000 in annual cloud costs.",
      "Built ETL and streaming pipelines processing 500 GB/day with Spark, Kafka, and HDFS, cutting job latency by 30% and improving data availability across downstream services.",
      "Developed 15+ responsive React UI components using TypeScript and Redux, optimizing rendering and Webpack code-splitting to reduce page-load time from 3s to 1.8s.",
      "Automated Jenkins CI/CD pipelines with Groovy and Docker, eliminating 10 hours of manual deployment weekly across 3 environments.",
      "Migrated high-volume PDF and email workflows to AWS Lambda with API Gateway and CloudWatch, lowering EC2 runtime by 320 hours per year while holding p95 latency under 800ms.",
      "Refactored PostgreSQL and MongoDB schemas, cutting report generation time from 4.5s to 2.9s and increasing analytics throughput by 8,000 transactions per hour."
    ]
  }
]

export const researchExperience = {
  "role": "Graduate Research Assistant",
  "title": "Graduate Research Assistant",
  "company": "The University of Texas at Arlington",
  "location": "Texas, USA",
  "timeframe": "Aug 2022 - May 2024",
  "icon": "🔬",
  "color": "#8b5cf6",
  "achievements": [
    "Created Python-based data processing pipelines, accelerating research analysis and improving accuracy of results.",
    "Assisted in building REST APIs for lab projects, enabling students and researchers to efficiently access and manipulate experimental datasets.",
    "Optimized backend performance by refactoring Java and Python modules, improving API speed and reliability."
  ]
}


export const homepageData = {
    description: "Hi There!!! I'm Yasasvi Nellore, Software Developer ",
    aboutButtonText : "About Me",
    resumeButtonText : "Download Resume"
}

export const projects = [
  {
    name: "AI Image Generation Platform",
    description: "Full-stack, cloud-native image generation platform using MERN stack, integrating OpenAI's DALL·E API and Cloudinary to dynamically generate, store, and deliver AI images with responsive React/Tailwind interfaces and real-time search features.",
    githubLink: "https://image-generation-ai-gilt.vercel.app/",
    liveDemo: "https://image-generation-ai-gilt.vercel.app/",
    imageUrl: "/images/ai%20image%20generation.png",
    category: "ai",
    icon: "🎨",
    color: "#8b5cf6",
    technologies: ["React", "Node.js", "MongoDB", "Express", "OpenAI", "Cloudinary", "Tailwind"],
    features: ["DALL·E Integration", "Real-time Search", "Cloud Storage", "Responsive Design"],
    featured: true
  },
  {
    name: "AI Mock Interview Platform",
    description: "AI-driven mock interview platform with Next.js 13, Tailwind CSS, and Firebase, leveraging Google Gemini LLMs via VAPI SDK to power role-specific mock sessions, real-time data persistence, and automated feedback through serverless Cloud Firestore.",
    githubLink: "https://ai-mock-interview-seven-nu.vercel.app/sign-in",
    liveDemo: "https://ai-mock-interview-seven-nu.vercel.app/sign-in",
    imageUrl: "/images/ai%20mock%20interview%20.png",
    category: "ai",
    icon: "🎤",
    color: "#3b82f6",
    technologies: ["Next.js 13", "Firebase", "Google Gemini", "Tailwind CSS", "VAPI SDK", "Firestore"],
    features: ["AI-Powered Feedback", "Role-Specific Sessions", "Real-time Data", "Serverless"],
    featured: true
  },
  {
    name: "Chess Bellator",
    description: "High-performance chess engine implementing Monte Carlo Tree Search (MCTS) algorithm with optimized move decision-making. Features intelligent AI opponent, position evaluation, and strategic gameplay analysis.",
    githubLink: "https://github.com/Nyasasvi/chess-bellator",
    imageUrl: "/images/chess.png",
    category: "algorithm",
    icon: "♟️",
    color: "#10b981",
    technologies: ["Python", "MCTS", "Game Theory", "Algorithm Optimization"],
    features: ["Monte Carlo Tree Search", "Position Evaluation", "AI Strategy", "Move Optimization"],
    featured: true
  },
  {
    name: "Diffusion Model Face Generator",
    description: "Advanced deep learning project using Hugging Face Diffusers library to generate human faces. Trained UNet2D model from scratch on MetFaces dataset using Google Colab Pro, producing artistic human faces with high-quality outputs.",
    githubLink: "https://github.com/Nyasasvi/Diffusion-Model-To-Generate-Faces",
    imageUrl: "/images/duffison_model.png.png",
    category: "ai",
    icon: "🤖",
    color: "#ec4899",
    technologies: ["PyTorch", "Hugging Face", "UNet2D", "Google Colab", "Diffusion Models"],
    features: ["Face Generation", "Art Style Transfer", "Custom Training", "MetFaces Dataset"],
    featured: true
  },
  {
    name: "AI Resume Editor",
    description: "Intelligent resume generator that creates tailored resumes based on specific job descriptions. Uses NLP to analyze job requirements and automatically optimizes professional summaries, skills, and experience sections for maximum ATS compatibility.",
    githubLink: "https://github.com/Nyasasvi/AI_Resume_Generator",
    imageUrl: "/images/ai-resume-editor.png.png",
    category: "ai",
    icon: "📄",
    color: "#f59e0b",
    technologies: ["Python", "NLP", "OpenAI API", "React", "PDF Generation"],
    features: ["Job-Specific Tailoring", "ATS Optimization", "AI-Powered", "PDF Export"],
    featured: false
  },
  {
    name: "Canvas LMS Clone",
    description: "Full-featured Learning Management System replicating Canvas's core functionality. Includes course management, assignment submission, grading system, discussion boards, and real-time notifications for students and instructors.",
    githubLink: "https://github.com/Nyasasvi/canvas-react-web-app-",
    imageUrl: "/images/canvas.webp",
    category: "fullstack",
    icon: "📚",
    color: "#667eea",
    technologies: ["React", "Redux", "Node.js", "MongoDB", "Express", "WebSockets"],
    features: ["Course Management", "Grading System", "Real-time Notifications", "Discussion Boards"],
    featured: false
  },
  {
    name: "E-Commerce Shopping Platform",
    description: "Modern e-commerce web application with sleek UI/UX design. Features product catalog, shopping cart, secure payment integration, user reviews, seller dashboard, and order tracking. Built with responsive design for optimal mobile experience.",
    githubLink: "https://github.com/Nyasasvi/Shopping-App",
    imageUrl: "/images/shopping.webp",
    category: "fullstack",
    icon: "🛒",
    color: "#06b6d4",
    technologies: ["React", "Node.js", "Express", "MongoDB", "Stripe API", "Redux"],
    features: ["Shopping Cart", "Payment Integration", "User Reviews", "Order Tracking"],
    featured: false
  },
  {
    name: "Diet AI Agent",
    description: "Intelligent diet management system powered by AI. Features meal tracking, nutritional analysis, personalized recommendations, and progress monitoring. Built with Node.js/Express backend and PostgreSQL for reliable data persistence.",
    githubLink: "https://github.com/Nyasasvi/diet-ai-agent",
    imageUrl: "/images/diet-ai-agent.png.png",
    category: "ai",
    icon: "🥗",
    color: "#84cc16",
    technologies: ["Node.js", "Express", "PostgreSQL", "OpenAI", "REST API"],
    features: ["Meal Tracking", "Nutritional Analysis", "AI Recommendations", "Progress Monitoring"],
    featured: false
  }
]

export const shuffleArray = (array:any) => {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export const skillsData = [
  // Languages
  { name: "Java", category: "languages", level: 95, experience: "4+ years", icon: "☕", tags: ["Enterprise", "Backend"] },
  { name: "Python", category: "languages", level: 90, experience: "4+ years", icon: "🐍", tags: ["AI/ML", "Scripting"] },
  { name: "JavaScript", category: "languages", level: 92, experience: "4+ years", icon: "⚡", tags: ["Full-Stack", "Web"] },
  { name: "TypeScript", category: "languages", level: 90, experience: "4+ years", icon: "🔷", tags: ["Type-Safe", "Modern"] },
  { name: "Go", category: "languages", level: 70, experience: "1+ years", icon: "🐹", tags: ["Services", "Concurrency"] },
  { name: "C++", category: "languages", level: 75, experience: "2+ years", icon: "⚙️", tags: ["Performance", "Systems"] },
  
  // Frontend
  { name: "React.js", category: "frontend", level: 95, experience: "4+ years", icon: "⚛️", tags: ["SPA", "Hooks"] },
  { name: "Next.js", category: "frontend", level: 90, experience: "3+ years", icon: "▲", tags: ["SSR", "React"] },
  { name: "Redux", category: "frontend", level: 85, experience: "4+ years", icon: "🔄", tags: ["State Mgmt"] },
  { name: "Angular", category: "frontend", level: 80, experience: "2+ years", icon: "🅰️", tags: ["Framework"] },
  { name: "Vue.js", category: "frontend", level: 75, experience: "2+ years", icon: "💚", tags: ["Progressive"] },
  { name: "Tailwind CSS", category: "frontend", level: 88, experience: "3+ years", icon: "🎨", tags: ["Utility-First"] },
  { name: "Webpack", category: "frontend", level: 82, experience: "4+ years", icon: "📦", tags: ["Bundler"] },
  { name: "React Query", category: "frontend", level: 85, experience: "2+ years", icon: "🔍", tags: ["Data Fetching"] },
  
  // Backend
  { name: "Spring Boot", category: "backend", level: 95, experience: "4+ years", icon: "🍃", tags: ["Microservices", "REST"] },
  { name: "Hibernate", category: "backend", level: 88, experience: "4+ years", icon: "💾", tags: ["ORM", "JPA"] },
  { name: "FastAPI", category: "backend", level: 88, experience: "2+ years", icon: "⚡", tags: ["Python", "API"] },
  { name: "Django", category: "backend", level: 82, experience: "3+ years", icon: "🎸", tags: ["Python", "Web"] },
  { name: "Express.js", category: "backend", level: 90, experience: "4+ years", icon: "🚂", tags: ["Node.js", "API"] },
  { name: "Node.js", category: "backend", level: 92, experience: "4+ years", icon: "🟢", tags: ["Runtime", "Backend"] },
  { name: "GraphQL", category: "backend", level: 85, experience: "3+ years", icon: "🔷", tags: ["API", "Query"] },
  { name: "LangChain", category: "backend", level: 80, experience: "1+ years", icon: "🔗", tags: ["LLM", "AI"] },
  
  { name: "LangGraph", category: "backend", level: 82, experience: "1+ years", icon: "🕸️", tags: ["Agents", "LLM"] },
  { name: "MCP", category: "backend", level: 80, experience: "1+ years", icon: "🔌", tags: ["Tool Calling", "Agents"] },
  
  // Cloud & DevOps
  { name: "AWS", category: "cloud", level: 93, experience: "4+ years", icon: "☁️", tags: ["EC2", "S3", "EKS"] },
  { name: "Docker", category: "cloud", level: 92, experience: "4+ years", icon: "🐳", tags: ["Containers"] },
  { name: "Kubernetes", category: "cloud", level: 90, experience: "4+ years", icon: "☸️", tags: ["Orchestration"] },
  { name: "Azure", category: "cloud", level: 78, experience: "2+ years", icon: "🔷", tags: ["Cloud"] },
  { name: "GCP", category: "cloud", level: 75, experience: "2+ years", icon: "🌐", tags: ["Cloud"] },
  { name: "Terraform", category: "cloud", level: 85, experience: "3+ years", icon: "🏗️", tags: ["IaC"] },
  { name: "Jenkins", category: "cloud", level: 88, experience: "4+ years", icon: "🤖", tags: ["CI/CD"] },
  { name: "GitHub Actions", category: "cloud", level: 90, experience: "3+ years", icon: "🔄", tags: ["Automation"] },
  
  // Databases
  { name: "PostgreSQL", category: "database", level: 92, experience: "4+ years", icon: "🐘", tags: ["Relational", "SQL"] },
  { name: "MongoDB", category: "database", level: 90, experience: "4+ years", icon: "🍃", tags: ["NoSQL", "Document"] },
  { name: "MySQL", category: "database", level: 88, experience: "4+ years", icon: "🐬", tags: ["Relational"] },
  { name: "Redis", category: "database", level: 85, experience: "4+ years", icon: "🔴", tags: ["Cache", "In-Memory"] },
  { name: "Oracle", category: "database", level: 80, experience: "3+ years", icon: "🔴", tags: ["Enterprise"] },
  { name: "Snowflake", category: "database", level: 82, experience: "1+ years", icon: "❄️", tags: ["Warehouse", "ETL"] },
  { name: "DuckDB", category: "database", level: 78, experience: "1+ years", icon: "🦆", tags: ["Analytics"] },
  { name: "Elasticsearch", category: "database", level: 82, experience: "3+ years", icon: "🔍", tags: ["Search"] },
  
  // AI & ML
  { name: "TensorFlow", category: "aiml", level: 85, experience: "3+ years", icon: "🧠", tags: ["Deep Learning"] },
  { name: "PyTorch", category: "aiml", level: 83, experience: "3+ years", icon: "🔥", tags: ["Neural Networks"] },
  { name: "Scikit-learn", category: "aiml", level: 88, experience: "4+ years", icon: "📊", tags: ["ML", "Analytics"] },
  { name: "Hugging Face", category: "aiml", level: 80, experience: "2+ years", icon: "🤗", tags: ["NLP", "Transformers"] },
  { name: "Diffusion Models", category: "aiml", level: 75, experience: "1+ years", icon: "🎨", tags: ["Generative AI"] },
  { name: "Apache Spark", category: "aiml", level: 88, experience: "4+ years", icon: "⚡", tags: ["Big Data"] },
  { name: "Kafka", category: "aiml", level: 90, experience: "4+ years", icon: "📨", tags: ["Streaming", "Events"] },
  { name: "Vector DBs", category: "aiml", level: 78, experience: "1+ years", icon: "🔢", tags: ["Embeddings"] },
  
  // Tools & Testing
  { name: "Git", category: "tools", level: 95, experience: "4+ years", icon: "📚", tags: ["Version Control"] },
  { name: "Prometheus", category: "tools", level: 85, experience: "3+ years", icon: "📊", tags: ["Monitoring"] },
  { name: "Grafana", category: "tools", level: 83, experience: "3+ years", icon: "📈", tags: ["Visualization"] },
  { name: "SonarQube", category: "tools", level: 80, experience: "3+ years", icon: "🔍", tags: ["Code Quality"] },
  { name: "Postman", category: "tools", level: 92, experience: "4+ years", icon: "📮", tags: ["API Testing"] },
  { name: "JUnit", category: "tools", level: 90, experience: "4+ years", icon: "✅", tags: ["Testing", "Java"] },
  { name: "Jest", category: "tools", level: 88, experience: "4+ years", icon: "🃏", tags: ["Testing", "JS"] },
  { name: "Selenium", category: "tools", level: 82, experience: "3+ years", icon: "🕷️", tags: ["E2E Testing"] },
  { name: "Playwright", category: "tools", level: 85, experience: "1+ years", icon: "🎭", tags: ["E2E", "Agents"] },
  { name: "Maven", category: "tools", level: 85, experience: "4+ years", icon: "📦", tags: ["Build Tool"] },
  { name: "Gradle", category: "tools", level: 83, experience: "4+ years", icon: "🐘", tags: ["Build Tool"] },
];