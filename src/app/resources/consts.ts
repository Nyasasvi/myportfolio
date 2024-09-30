export const footerButtonLinks = [{
    label : "Github",
    icon: "github",
    href: "https://github.com/Rakshith-Reddy-K/",
},
{
    label : "Linkedin",
    icon: "linkedin",
    href: "https://www.linkedin.com/in/rakshith-reddy-b65a43168/",
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

export const experience =[ {
    company: "SOFTWARE ENGINEER II",
    role:"Zemoso Technologies",
    timeframe:"2021-2023",
    achievements: [
    "Developed and maintained a scalable backend system using NestJS and DynamoDB, building RESTful APIs to securely manage UI component configurations for a builder app, enabling seamless customization.",
    "Implemented payment dispute system features to achieve business objectives and support the payment streaming pipeline at eBay, resulting in a 10% increase in customer satisfaction.",
]

},
{
company: "ML INTERN",
    role:"SmartBridge",
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
    githubLink: "https://github.com/Rakshith-Reddy-K/Chess-MCTS",
    imageUrl: "/images/chess.webp"
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
    name:"Project 6",
    description: "Description 6",
    githubLink: "",
    imageUrl:  "/images/chess.png"
  }]

export const shuffleArray = (array:any) => {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}