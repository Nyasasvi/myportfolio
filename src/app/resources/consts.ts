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
    "achievements": [
      "Integrated custom React/Node.js applications and built a Python-based forecasting model (Prophet, scikit-learn) to automate inventory workflows, cutting manual tracking by 40% and boosting system uptime to 99.9%.",
      "Prototyped MCP (Model Context Protocol) integration with NetSuite ERP and internal React/Node.js tools using WebSockets and context-aware APIs, demonstrating AI-powered task automation with Claude Code and multi-agent orchestration in Claude Desktop.",
      "Deployed a real-time Python anomaly detection system using Isolation Forest & DBSCAN, streaming data through Kafka and processing with Pandas/NumPy to flag inconsistencies and cut manual reconciliation by 30%.",
      "Implemented RESTful and GraphQL APIs for ERP and e-commerce systems, improving production schedules and data accuracy by syncing supplier/logistics APIs with Node.js, MongoDB, and Oracle.",
      "Revamped React.js front end with code-splitting and lazy loading in Webpack, slashing page-load times from 3s to 1.8s.",
      "Optimized Docker and Kubernetes for scaling and reduced infra costs, cutting system errors by 35% with Postman/Jest automation."
    ]
  },
  {
    "role": "Software Engineer",
    "company": "JP Morgan Chase",
    "location": "Texas, USA",
    "timeframe": "Dec 2023 - Dec 2024",
    "achievements": [
      "Architected scalable Spring Boot microservices on AWS EKS handling 5M+ events/day with zero downtime, following domain-driven design and OpenAPI standards.",
      "Developed and reviewed Java 17 and React TypeScript code with OWASP checks and SonarQube gates, catching 30+ critical defects before production.",
      "Automated remediation with Spring Boot health checks and Kubernetes operators, eliminating 80% of recurring incidents and boosting uptime to 99.99%.",
      "Provisioned/tuned Elasticsearch and MongoDB clusters indexing 50M+ documents, improving query performance by 70%.",
      "Streamed 1M+ ingestion events/day via Kafka + Spark Structured Streaming, orchestrating AI enrichment tasks with K8s Jobs under 200ms SLA.",
      "Introduced circuit-breakers, API rate-limiting, JWT/OAuth2 across microservices, achieving 99.99% uptime with Prometheus/Grafana alerts.",
      "Led TDD and Agile adoption, delivering 95% of milestones on time with a 15% drop in post-deployment defects."
    ]
  },
  {
    "role": "Graduate Research Assistant",
    "company": "University of Texas at Arlington",
    "location": "Texas, USA",
    "timeframe": "Jun 2023 - Dec 2023",
    "achievements": [
      "Conducted performance analysis of Digital Twin models for wireless networks, identifying optimization strategies that improved simulated network efficiency by 28%.",
      "Fine-tuned LLMs using NLP techniques to automate insight extraction and improve predictive accuracy by 15% on wireless communication datasets.",
      "Developed scalable Python pipelines with Pandas and NumPy to process large-scale network data, reducing processing time by 35%.",
      "Leveraged TensorFlow and PyTorch models to forecast network load and traffic patterns with 92% accuracy.",
      "Deployed models on AWS SageMaker and GCP Vertex AI, accelerating training workflows and cutting iteration cycles by 40%."
    ]
  },
  {
    "role": "Java Developer",
    "company": "Red Cloud Technologies",
    "location": "Hyderabad, India",
    "timeframe": "Jan 2021 - May 2022",
    "achievements": [
      "Delivered Java/J2EE solutions with Oracle/MySQL in Agile teams, reducing turnaround by 15% and boosting CPU efficiency by 20%.",
      "Strengthened throughput with Spring MVC microservices, multithreading, and caching, cutting API response from 200ms to 160ms at 1,000 RPS.",
      "Built ETL pipelines handling 500GB/day with Spark (batch), Kafka (streaming), and HDFS storage, cutting job latency by 30% and delivering 99.9% reliability.",
      "Developed RESTful/SOAP APIs consumed by React.js UI, improving client rendering and reducing load times by 25%.",
      "Optimized performance with AWS CloudWatch monitoring, reducing server latency from 1.2s to 800ms under peak traffic."
    ]
  },
  {
    "role": "Web Developer Intern",
    "company": "Nivee Properties",
    "location": "Hyderabad, India",
    "timeframe": "Apr 2019 - Aug 2019",
    "achievements": [
      "Built 10+ React.js/D3.js dashboards visualizing KPIs for 200+ property managers, cutting reporting effort by 60%.",
      "Developed RESTful Node.js/Express APIs with MySQL backends, boosting data retrieval by 40% for dashboards.",
      "Configured React Router and Redux for role-based views and caching, improving UX consistency and reducing load variance.",
      "Established CI/CD with Jest unit tests and Travis CI pipelines, hitting 85% coverage and catching 75% of regressions pre-merge."
    ]
  }
]


export const homepageData = {
    description: "Hi There!!! I'm Yasasvi Nellore, Software Developer ",
    aboutButtonText : "About Me",
    resumeButtonText : "Download Resume"
}

export const projects = [{
    name:"Chess Bellator",
    description: "Developed and optimized a chess engine using Monte Carlo Tree Search(MCTS) to enhance move decision-making.",
    githubLink: "https://github.com/Nyasasvi/chess-bellator",
    imageUrl: "/images/chess.png"
  },{
    name:"Diffusion-Model-To-Generate-Faces",
    description: "Created a diffusion model using the Huggingface Diffusers library. Trained a UNet2D model from scratch on the MetFaces dataset using Google Colab Pro to generate human faces resembling works of art.",
    githubLink: "https://github.com/Nyasasvi/Diffusion-Model-To-Generate-Faces",
    imageUrl:  "/images/duffison_model.png.png"
  },{
    name:"AI Resume Editor",
    description: "Generates a resume specific to a job description.give user's professional summary and job description.",
    githubLink: "https://github.com/Nyasasvi/AI_Resume_Generator",
    imageUrl:  "/images/ai-resume-editor.png.png"
  },
  {
    name:"Canvas Clone",
    description: "Web application that replicates the core functionality of the Canvas learning management system.",
    githubLink: "https://github.com/Nyasasvi/canvas-react-web-app-",
    imageUrl:  "/images/canvas.webp"
  },{
    name:"Shopping App",
    description: "Built a sleek, easy-to-navigate e-commerce web application with a modern user interface. Users can explore products, engage with sellers, and provide feedback through reviews, all while enjoying a seamless and interactive experience.",
    githubLink: "https://github.com/Nyasasvi/Shopping-App",
    imageUrl:  "/images/shopping.webp"
  },{
    name:"Diet-AI-Agent",
    description: "AI Agent for diet management. Created a simple node express js server and linked it with postgresql database to track the diet of users.",
    githubLink: "https://github.com/Nyasasvi/diet-ai-agent",
    imageUrl:  "/images/diet-ai-agent.png.png"
  }]

export const shuffleArray = (array:any) => {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}