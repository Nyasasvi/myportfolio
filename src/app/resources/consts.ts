export const footerButtonLinks = [{
    label : "Github",
    icon: "github",
    href: "https://github.com/Rakshith-Reddy-K/",
},
{
    label : "Linkedin",
    icon: "linkedin",
    href: "https://www.linkedin.com/in/rakshith-reddy-kokonda-b65a43168/",
},
{
    label : "Mail",
    icon: "mail",
    href: "mailto:kokonda.r@northeastern.edu",
},
{
    label : "Instagram",
    icon: "instagram",
    href: "https://www.instagram.com/rakshith_reddy_4?igsh=MWczNmp4eWxnaDJuZA==",
}]

export const aboutMe = "Computer science enthusiast with a passion for learning and drive to make a meaningful impact. I am a computer science graduate at Northeastern University. I spent two years as a full stack developer building, scaling and maintaining various robust services and websites. Known among colleagues and peers as a driven, positive and quick learning individual."
export const experience =[ {
  "role": "Software Engineer II",
  "company": "ZeMoSo Technologies Pvt. Ltd",
  "location": "Hyderabad, India",
  "timeframe": "Jan 2023 - Aug 2023",
  "achievements": [
    "Enhanced the payment dispute system to support the payment streaming pipeline at eBay, while adhering to new policies, resulting in a 10% improvement in dispute resolution efficiency.",
    "Seamlessly integrated front-end components with back-end services using MarkoJS, ReactJS, and SpringBoot to enhance eBay seller dashboards, achieving a 20% reduction in support inquiries.",
    "Successfully migrated REST APIs in UserDAO to GraphQL calls, improving query response times by 25%."
  ]
},
{
  "role": "Software Engineer I",
  "company": "ZeMoSo Technologies Pvt. Ltd",
  "location": "Hyderabad, India",
  "timeframe": "Aug 2022 - Dec 2022",
  "achievements": [
    "Boosted performance in a microservice architecture by 15% through the adoption of a BFF framework.",
    "Spearheaded the redesign of healthcare dashboards with UI/UX teams to ensure consistency and enhance usability across all user touchpoints, leading to a 20% increase in new user registrations.",
    "Collaborated with product managers and cross-functional teams to design, create, and launch patient portals using React and AWS EC2 and Amplify."
  ]
},
{
  "role": "Associate Software Engineer",
  "company": "ZeMoSo Technologies Pvt. Ltd",
  "location": "Hyderabad, India",
  "timeframe": "Mar 2021 - Jul 2022",
  "achievements": [
    "Developed and maintained a scalable backend system using NestJS and DynamoDB, building over 40 RESTful APIs to securely manage UI component configurations for a builder application.",
    "Created a custom database migration software to version control incremental changes to DynamoDB, managing over 70,000 records.",
    "Automated regression and unit tests using JUnit and Selenium, integrating them into CI/CD pipelines with Jenkins, enhancing test coverage by 40% and significantly accelerating deployment cycles.",
    "Identified and resolved 70 critical bugs, refactored code for improved scalability, resulting in a 20% reduction in technical debt and enhanced overall system stability."
  ]
},
{
role: "ML INTERN",
    company:"SmartBridge",
    timeframe:"2019",
    achievements: [
    "Worked on Handwriting Recognition using fully connected Convolutional Neural Networks, to recognize various handwritten characters and digits from images. Used ReLU activation for feature extraction.",
"    Trained and tested the model with a large NIST handwritten image dataset, achieving an accuracy of ~95%"

    ]}
]

export const homepageData = {
    description: "Hi There!!! I'm Rakshith Reddy Kokonda, Software Developer ",
    aboutButtonText : "About Me",
    resumeButtonText : "Download Resume"
}

export const projects = [{
    name:"Chess Bellator",
    description: "Developed and optimized a chess engine using Monte Carlo Tree Search(MCTS) to enhance move decision-making.",
    githubLink: "https://github.com/Rakshith-Reddy-K/Chess-Bellator",
    imageUrl: "/images/chess.png"
  },{
    name:"Image Processing Application",
    description: "An image processing application with a text-based interface, allowing users to perform various image manipulations such as flipping, brightening, and blurring, while supporting common formats like JPG, PNG, and ASCII PPM.",
    githubLink: "https://github.com/Rakshith-Reddy-K/Image-Processing-Application",
    imageUrl:  "/images/image_processing.webp"
  },{
    name:"Sales Predictor",
    description: "A sales prediction model to forecast product sales in retail outlets using various features, helping in areas like inventory management and marketing strategies.",
    githubLink: "https://github.com/Rakshith-Reddy-K/Sales-predictor",
    imageUrl:  "/images/sales_predictor.webp"
  },
  {
    name:"Canvas Clone",
    description: "Web application that replicates the core functionality of the Canvas learning management system.",
    githubLink: "https://github.com/Rakshith-Reddy-K/kanbas-react-web-app",
    imageUrl:  "/images/canvas.webp"
  },{
    name:"Shopping App",
    description: "Built a sleek, easy-to-navigate e-commerce web application with a modern user interface. Users can explore products, engage with sellers, and provide feedback through reviews, all while enjoying a seamless and interactive experience.",
    githubLink: "https://github.com/Rakshith-Reddy-K/Shopping-App",
    imageUrl:  "/images/shopping.webp"
  },{
    name:"Forest Fire Detection",
    description: "Developed a Machine Learning model that detects forest fires in their early stages by analyzing environmental data (such as temperature, humidity, and wind speed) to provide critical fire alerts to forestry services and local authorities.",
    githubLink: "https://github.com/Rakshith-Reddy-K/Forest-fires",
    imageUrl:  "/images/forest_fires.webp"
  }]

export const shuffleArray = (array:any) => {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}