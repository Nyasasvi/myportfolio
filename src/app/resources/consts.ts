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

export const aboutMe = "Computer science enthusiast with a passion for learning and drive to make a meaningful impact. I have a Masters degree in Computer Science from The University of Texas at Arlington. I spent two years as a full stack and back end developer building, scaling and maintaining various robust services and websites. Known among colleagues and peers as a driven, positive and quick learning individual."
export const experience =[ {
  "role": "Senior Backend Engineer,Data",
  "company": "FlowAI",
  "location": "Texas, USA",
  "timeframe": "Aug 2024 - Dec 2024",
  "achievements": [
    "Developed and deployed AI-driven solutions to identify and deliver potential customer contacts, enhancing product sales and engagement. Spearheaded the implementation of a distributed microservices architecture",
    "Configured Apache Spark Streaming for real-time data processing from Kafka to HDFS, designed ETL pipelines for seamless data integration from sources like Salesforce and SQL Server, and built scalable batch and real-time workflows using PySpark, Spark SQL, and Scala integrated with HBase.",
    "Developed and integrated RESTful and SOAP web services, leveraging Spring Framework for efficient back-end functionality and implementing Servlets and JSPs based on the MVC pattern.",
    "Designed optimized database schemas for high-traffic applications, reducing storage overhead through indexing and normalization. Worked extensively with NoSQL (MongoDB) and relational databases (Oracle 11g, SQL Server), writing advanced queries and triggers, and collaborated on seamless data migration from monolithic databases to microservices.",
    "Designed and developed integrations with Gmail, LinkedIn, Salesforce, and sequencing tools, driving increased user engagement, while enhancing system reliability and scalability with secure authentication flows and persistent user data storage.",
    "Created Python-based microservices for a platform with FastAPI, utilizing Pandas for data processing and transformation from various sources, including Excel and HBase.",
    "Worked extensively with Spring modules, including Spring Boot, Spring MVC, Spring Security, and Spring Integration, to build and deploy scalable applications.",
    "Managed message-driven architectures using RabbitMQ and JMS for seamless communication between distributed applications.",
    "Designed and deployed Docker containers and orchestrated them using Kubernetes, implemented continuous integration and deployment processes using Maven, Jenkins, and Git, ensuring smooth production releases and code versioning.",
    "Configured AWS services such as EC2 instances, VPCs, and S3 storage for deployment and maintenance of cloud-based applications.",
  ]
},
{
  "role": "Software Engineer ",
  "company": "The University of Texas at Arlington",
  "location": "Texas, USA",
  "timeframe": "Dec 2023 - May 2024",
  "achievements": [
    "Developed a web-based application to manage inventory, track sales, and handle payment processing for multiple university food courts, including Marketplace, Subway, Panda Express and Connections. The system ensures real-time inventory updates, accurate sales tracking, and secure payment handling, tailored to meet the needs of a dynamic university environment",
    "Designed a responsive Single Page Application (SPA) using React with user-friendly dashboards and forms utilizing JavaScript, TypeScript, and AJAX for dynamic functionality, implemented client-side validations with jQuery, and developed cross-platform desktop applications using Electron.js for seamless food court operations.",
    "Developed backend logic in Node.js, creating modules across multiple food courts. Built and deployed RESTful APIs with Express.js for seamless frontend-backend communication, implemented middleware for secure API requests, role-based access control, and logging, and integrated third-party libraries like Axios for real-time data synchronization.",
    "Designed interactive dashboards with React and Chart.js for administrators to monitor real-time sales, inventory levels, and payment statuses. Created SQL views and aggregation queries to provide analytics on sales performance, peak hours, and best-selling products.",
    "Streamlined development with Node Package Manager (NPM) for managing dependencies, automated builds and deployments using Jenkins, and deployed the application on AWS EC2 instances and Docker containers, ensuring high availability and scalability for university-wide operations.",
    "Led the development of a reusable Node.js and JSON Web Token (JWT) framework for Single Sign-On (SSO) to secure user authentication for administrators and food court staff."
  ]
},
{
  "role": "Java Developer",
  "company": "Red Cloud Technologies",
  "location": "Hyderabad, India",
  "timeframe": "Aug 2021 - May 2022",
  "achievements": [
    "A comprehensive web-based application designed to manage employee details, attendance, payroll, and performance reviews. This system automates routine HR tasks, ensuring efficient data management and seamless user interactions.",
    "Developed a responsive Single Page Application (SPA) using AngularJS, incorporating user controls and web forms for managing employee data, attendance tracking, and performance reviews, with JavaScript and jQuery enabling seamless client-side validations to ensure consistent and accurate data entry.",
    "Designed and implemented backend business logic using Core Java, developing modules for payroll, attendance, and performance management, along with base and utility classes featuring customized exception handling for robust error management, and built REST APIs to enable seamless communication between frontend and backend components.",
    "Designed and maintained relational database schemas using SQL for employee, attendance, and payroll data, optimizing queries for performance, developing stored procedures for payroll and attendance automation.",
    "Automated payroll generation and performance review notifications using SQL triggers and scheduled tasks, developed interactive dashboards for actionable insights, and automated the distribution of critical reports via email.",
    "Streamlined development with NPM for dependency management and applied modular design principles to improve code maintainability and scalability."
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