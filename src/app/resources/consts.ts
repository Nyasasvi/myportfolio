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

export const aboutMe = "Full-Stack Engineer specializing in Java 17/Spring Boot microservices and React/TypeScript front ends, with 5+ years building cloud-native, event-driven systems on AWS. Proficient in developing RESTful and GraphQL APIs, optimizing relational and NoSQL databases (PostgreSQL, MongoDB), and deploying scalable applications. Passionate about leveraging user feedback and Open-Source technologies to drive continuous product improvement and operational excellence."

export const experience = [
  {
    "role": "Software Engineer",
    "company": "Twisted X Global Brands",
    "location": "Texas, USA",
    "timeframe": "Dec 2024 - Present",
    "type": "Full-Time",
    "icon": "💼",
    "color": "#667eea",
    "achievements": [
      "Integrated custom React/Node.js applications and built a Python-based forecasting model (Prophet, scikit-learn) to automate inventory workflows, cutting manual tracking by 40% and boosting system uptime to 99.9%.",
      "Designed and deployed a LangChain + Azure OpenAI RAG pipeline integrated with NetSuite ERP, supplier APIs, and logistics data; enabled natural language queries with secure RBAC + PII handling, cutting planner reporting time by 70% and improving order fulfillment rates by 15%.",
      "Deployed a real-time Python anomaly detection using Isolation Forest & DBSCAN, streaming data through Kafka and processing with Pandas and NumPy to flag inventory and order inconsistencies and cut manual reconciliation by 30%.",
      "Implemented RESTful and GraphQL APIs for ERP and e-commerce systems, increased data accuracy and improved production schedules, combined supplier and logistics APIs with Node.js, MongoDB, and Oracle for real-time data sync.",
      "Revamped React.js front end by introducing code-splitting and lazy loading in Webpack, other performance enhancing strategies, slashing page-load times from 3s to 1.8s.",
      "Optimized Dockerized deployments by containerizing backend services and configuring CI/CD pipelines (GitHub Actions + AWS EKS), enabling faster rollouts, zero-downtime updates, and cutting environment setup time by 60%.",
      "Spearheaded implementation of Test-Driven Development (TDD) and Agile methodologies, leading to the timely delivery of 95% of project milestones and a 15% reduction in post-deployment defects.",
      "Prototyped MCP (Model Context Protocol) integration with Netsuite ERP and internal React/Node.js tools using WebSockets and context aware APIs."
    ]
  },
  {
    "role": "Software Engineer",
    "company": "JP Morgan Chase",
    "location": "Texas, USA",
    "timeframe": "Jul 2024 - Dec 2024",
    "type": "Full-Time",
    "icon": "🏦",
    "color": "#3b82f6",
    "achievements": [
      "Architected scalable Spring Boot microservices containerized with Docker on AWS EKS handling 5M+ events/day with zero downtime and led enterprise-grade API design using domain-driven design and OpenAPI standards.",
      "Developed and reviewed Java 17 (Spring Boot) and React TypeScript code with OWASP checks and SonarQube quality gates, catching and fixing 30+ critical defects before production.",
      "Automated remediation workflows using Spring Boot health checks and Kubernetes operators, eliminating 80% of recurring incidents and boosting system uptime to 99.99%.",
      "Streamed 1M+ document ingestion events/day via Apache Kafka and Spark Structured Streaming; orchestrated AI enrichment tasks with Kubernetes Jobs, ensuring lossless processing and ≤ 200ms end-to-end resolution.",
      "Introduced circuit-breaker patterns, API Gateway rate-limiting, and JWT/OAuth2 guards across microservices, achieved 99.99% uptime with proactive alerting via Prometheus and Grafana.",
      "Engineered a MongoDB NoSQL schema with compound indexes and aggregation pipelines, cutting average query time from 200ms to 120ms and supporting 5× greater read throughput compared to the legacy SQL system.",
      "Provisioned and tuned Elasticsearch/OpenSearch clusters (AWS Elasticsearch Service), and MongoDB replica sets to index 50M+ documents improving full-text query performance by 70% under peak load."
    ]
  },
  {
    "role": "Java Developer",
    "company": "Red Cloud Technologies",
    "location": "Hyderabad, India",
    "timeframe": "May 2021 - May 2022",
    "type": "Full-Time",
    "icon": "☁️",
    "color": "#10b981",
    "achievements": [
      "Delivered end-to-end Java/J2EE solutions on Oracle and MySQL within Agile SCRUM teams, leading requirement analysis, design, and deployment to reduce turnaround by 15% and boost CPU efficiency by 20%.",
      "Strengthened system throughput and resilience by architecting Spring MVC microservices with multithreading and hash-based caching layers, reducing average API response time from 200ms to 160ms under 1,000 RPS peak load.",
      "Deployed end-to-end ETL pipelines processing over 500 GB/day using Apache Spark for batch jobs, Apache Kafka for streaming ingestion, and HDFS for storage cutting job latency by 30% and delivering 99.9% reliability.",
      "Developed comprehensive API-driven front-ends, SOAP building RESTful Spring Boot and services consumed by an React.js UI, optimized client-side rendering and minimized page-load times by 25%.",
      "Assessed critical performance indicators using AWS CloudWatch and implemented optimizations that slashed server latency from 1.2 seconds down to an impressive 800 milliseconds under heavy traffic conditions."
    ]
  },
  {
    "role": "Web Developer Intern",
    "company": "Nivee Properties",
    "location": "Hyderabad, India",
    "timeframe": "Apr 2019 - Aug 2019",
    "type": "Internship",
    "icon": "🏢",
    "color": "#f59e0b",
    "achievements": [
      "Engineered 10+ interactive internal dashboards using React.js, D3.js, and Bootstrap 4 visualizing key KPIs (occupancy rates, lease renewals) for 200+ property managers and cutting manual reporting effort by 60%.",
      "Authored and maintained RESTful APIs in Node.js (v12) and Express.js (v4) with MySQL backends to aggregate lease, maintenance, and billing data boosting data-retrieval speed by 40% for dashboard queries.",
      "Configured client-side routing with React Router and managed complex application state via Redux implementing role-based views and data caching to elevate UX consistency and reduce load-time variability.",
      "Spearheaded test automation and CI by writing 100+ Jest unit tests and establishing Travis CI/GitHub pipelines achieving 85% code coverage, catching 75% of regressions pre-merge, and accelerating releases."
    ]
  }
]

export const researchExperience = {
  "role": "Graduate Research Assistant",
  "title": "Wireless Network Research & AI-Driven Data Processing",
  "company": "The University of Texas at Arlington",
  "location": "Texas, USA",
  "timeframe": "Dec 2023 - May 2024",
  "icon": "🔬",
  "color": "#8b5cf6",
  "achievements": [
    "Fine-tuned LLMs using NLP techniques to automate insight extraction and improve predictive accuracy by 15% on wireless communication datasets.",
    "Programmed scalable data pipelines in Python for processing large-scale network data, leveraging Pandas, NumPy, and Scikit-learn to enhance feature engineering and reduce processing time by 35%.",
    "Leveraged ML algorithms and deep learning models with TensorFlow and PyTorch to forecast network load and traffic patterns, achieving 92% model accuracy.",
    "Utilized Jupyter Notebooks and deployed models using AWS SageMaker and GCP Vertex AI, accelerating training workflows and reducing iteration time by 40%."
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
  { name: "Java", category: "languages", level: 95, experience: "5+ years", icon: "☕", tags: ["Enterprise", "Backend"] },
  { name: "Python", category: "languages", level: 90, experience: "4+ years", icon: "🐍", tags: ["AI/ML", "Scripting"] },
  { name: "JavaScript", category: "languages", level: 92, experience: "5+ years", icon: "⚡", tags: ["Full-Stack", "Web"] },
  { name: "TypeScript", category: "languages", level: 90, experience: "4+ years", icon: "🔷", tags: ["Type-Safe", "Modern"] },
  { name: "C++", category: "languages", level: 75, experience: "2+ years", icon: "⚙️", tags: ["Performance", "Systems"] },
  
  // Frontend
  { name: "React.js", category: "frontend", level: 95, experience: "5+ years", icon: "⚛️", tags: ["SPA", "Hooks"] },
  { name: "Next.js", category: "frontend", level: 90, experience: "3+ years", icon: "▲", tags: ["SSR", "React"] },
  { name: "Redux", category: "frontend", level: 85, experience: "4+ years", icon: "🔄", tags: ["State Mgmt"] },
  { name: "Angular", category: "frontend", level: 80, experience: "2+ years", icon: "🅰️", tags: ["Framework"] },
  { name: "Vue.js", category: "frontend", level: 75, experience: "2+ years", icon: "💚", tags: ["Progressive"] },
  { name: "Tailwind CSS", category: "frontend", level: 88, experience: "3+ years", icon: "🎨", tags: ["Utility-First"] },
  { name: "Webpack", category: "frontend", level: 82, experience: "4+ years", icon: "📦", tags: ["Bundler"] },
  { name: "React Query", category: "frontend", level: 85, experience: "2+ years", icon: "🔍", tags: ["Data Fetching"] },
  
  // Backend
  { name: "Spring Boot", category: "backend", level: 95, experience: "5+ years", icon: "🍃", tags: ["Microservices", "REST"] },
  { name: "Hibernate", category: "backend", level: 88, experience: "4+ years", icon: "💾", tags: ["ORM", "JPA"] },
  { name: "Django", category: "backend", level: 82, experience: "3+ years", icon: "🎸", tags: ["Python", "Web"] },
  { name: "Express.js", category: "backend", level: 90, experience: "4+ years", icon: "🚂", tags: ["Node.js", "API"] },
  { name: "Node.js", category: "backend", level: 92, experience: "5+ years", icon: "🟢", tags: ["Runtime", "Backend"] },
  { name: "GraphQL", category: "backend", level: 85, experience: "3+ years", icon: "🔷", tags: ["API", "Query"] },
  { name: "LangChain", category: "backend", level: 80, experience: "1+ years", icon: "🔗", tags: ["LLM", "AI"] },
  
  // Cloud & DevOps
  { name: "AWS", category: "cloud", level: 93, experience: "5+ years", icon: "☁️", tags: ["EC2", "S3", "EKS"] },
  { name: "Docker", category: "cloud", level: 92, experience: "5+ years", icon: "🐳", tags: ["Containers"] },
  { name: "Kubernetes", category: "cloud", level: 90, experience: "4+ years", icon: "☸️", tags: ["Orchestration"] },
  { name: "Azure", category: "cloud", level: 78, experience: "2+ years", icon: "🔷", tags: ["Cloud"] },
  { name: "GCP", category: "cloud", level: 75, experience: "2+ years", icon: "🌐", tags: ["Cloud"] },
  { name: "Terraform", category: "cloud", level: 85, experience: "3+ years", icon: "🏗️", tags: ["IaC"] },
  { name: "Jenkins", category: "cloud", level: 88, experience: "4+ years", icon: "🤖", tags: ["CI/CD"] },
  { name: "GitHub Actions", category: "cloud", level: 90, experience: "3+ years", icon: "🔄", tags: ["Automation"] },
  
  // Databases
  { name: "PostgreSQL", category: "database", level: 92, experience: "5+ years", icon: "🐘", tags: ["Relational", "SQL"] },
  { name: "MongoDB", category: "database", level: 90, experience: "4+ years", icon: "🍃", tags: ["NoSQL", "Document"] },
  { name: "MySQL", category: "database", level: 88, experience: "5+ years", icon: "🐬", tags: ["Relational"] },
  { name: "Redis", category: "database", level: 85, experience: "4+ years", icon: "🔴", tags: ["Cache", "In-Memory"] },
  { name: "Oracle", category: "database", level: 80, experience: "3+ years", icon: "🔴", tags: ["Enterprise"] },
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
  { name: "Git", category: "tools", level: 95, experience: "5+ years", icon: "📚", tags: ["Version Control"] },
  { name: "Prometheus", category: "tools", level: 85, experience: "3+ years", icon: "📊", tags: ["Monitoring"] },
  { name: "Grafana", category: "tools", level: 83, experience: "3+ years", icon: "📈", tags: ["Visualization"] },
  { name: "SonarQube", category: "tools", level: 80, experience: "3+ years", icon: "🔍", tags: ["Code Quality"] },
  { name: "Postman", category: "tools", level: 92, experience: "5+ years", icon: "📮", tags: ["API Testing"] },
  { name: "JUnit", category: "tools", level: 90, experience: "5+ years", icon: "✅", tags: ["Testing", "Java"] },
  { name: "Jest", category: "tools", level: 88, experience: "4+ years", icon: "🃏", tags: ["Testing", "JS"] },
  { name: "Selenium", category: "tools", level: 82, experience: "3+ years", icon: "🕷️", tags: ["E2E Testing"] },
  { name: "Maven", category: "tools", level: 85, experience: "5+ years", icon: "📦", tags: ["Build Tool"] },
  { name: "Gradle", category: "tools", level: 83, experience: "4+ years", icon: "🐘", tags: ["Build Tool"] },
];