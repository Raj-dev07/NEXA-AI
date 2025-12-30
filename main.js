/* =====================================
   NEXA AI — A FUTURISTIC AI ENGINE
   Author: raj-dev07 😎
===================================== */

document.getElementById("redirect-to-github").addEventListener('click', function(){
  window.location.href = "https://www.github.com/raj-dev07/NEXA-AI";
})
document.getElementById("redirect-to-faq").addEventListener('click', function(){
  window.location.href = "https://www.github.com/raj-dev07/NEXA-AI";
})

// =====================
// DOM ELEMENTS
// =====================
const chatBox = document.getElementById("ai-chat");
const input = document.getElementById("userMessage");
const sendBtn = document.getElementById("sendMessage");

// =====================
// MEMORY (AI STATE)
// =====================
const memory = {
  userName: null,
  mood: "neutral",
  lastIntent: null,
  messageCount: 0
};

// =====================
// UTILITIES
// =====================


function calculateExpression(text) {
  // Extract numbers and operator
  const match = text.match(/(-?\d+\.?\d*)\s*([\+\-\*\/])\s*(-?\d+\.?\d*)/);

  if (!match) return null;

  const num1 = parseFloat(match[1]);
  const operator = match[2];
  const num2 = parseFloat(match[3]);

  let result;

  switch (operator) {
    case "+":
      result = num1 + num2;
      break;
    case "-":
      result = num1 - num2;
      break;
    case "*":
      result = num1 * num2;
      break;
    case "/":
      if (num2 === 0) return "❌ Division by zero is not allowed";
      result = num1 / num2;
      break;
    default:
      return null;
  }

  return ` ${num1} ${operator} ${num2} = ${result}`;
}



function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s\+\-\*\/\.]/g, "")
    .trim();
}

function classifyText(text) {
  if (text.endsWith("?")) return "QUESTION";
  if (text.length > 80) return "LONG_TEXT";
  if (/^(hi|hello|hey)/.test(text)) return "CASUAL";
  return "STATEMENT";
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function scrollDown() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// =====================
// CHAT UI FUNCTIONS
// =====================
function addMessage(text, type = "ai") {
  const msg = document.createElement("div");
  msg.className = `message ${type}`;
  msg.textContent = text;
  chatBox.appendChild(msg);
  scrollDown();
}

function showTyping() {
  const typing = document.createElement("div");
  typing.className = "typing";
  typing.id = "typing-indicator";
  typing.innerHTML = "<span></span><span></span><span></span>";
  chatBox.appendChild(typing);
}

function hideTyping() {
  const typing = document.getElementById("typing-indicator");
  if (typing) typing.remove();
}

function isMath(text) {
  return /(-?\d+\.?\d*)\s*([\+\-\*\/])\s*(-?\d+\.?\d*)/.test(text);
}


function randomFromText(text) {
  // extract all numbers from text
  const numbers = text.match(/-?\d+/g);

  if (!numbers || numbers.length < 2) {
    return "Please give me two numbers 😅 Example: random 1 to 10";
  }

  let num1 = parseInt(numbers[0]);
  let num2 = parseInt(numbers[1]);

  // swap if user entered reverse order
  if (num1 > num2) {
    [num1, num2] = [num2, num1];
  }

  const random = Math.floor(Math.random() * (num2 - num1 + 1)) + num1;

  return `🎲 Random number between ${num1} and ${num2}: **${random}**`;
}


// =====================
// INTENTS (WHAT USER MEANS)
// =====================
const intents = {
  GREETING: ["hi", "hello", "hey", "whats up", "yoo"],
  NAME: ["your name", "who are you", "Who made you"],
  TIME: ["time", "clock"],
  DATE: ["date", "day"],
  SET_NAME: ["my name is", "call me"],
  HOW_ARE_YOU: ["how are you"],
  HELP: ["help", "commands"],
  CLEAR: ["/clear"],
  BYE: ["bye", "goodbye", "see you later"],
  CALCULATE: ["+", "-", "*", "/", "calculate", "what is"],
  THANKS: ["thanks", "thank you", "thx", "tnx"],
  OKAY: ["ok", "okay", "alright", "fine"],
  YES: ["yes", "yeah", "yup", "sure", "hm"],
  NO: ["no", "nah", "nope"],
  LOL: ["lol", "haha", "lmao"],
  CONFUSED: ["huh", "idk", "dont know"],
  COMPLIMENT: ["good", "nice", "cool", "awesome", "great"],
  BORED: ["boring", "im bored", "nothing"],
  FEELING: ["im sad", "im happy", "im tired", "im angry"],
  WHY: ["why"],
  RANDOM_NUMBER: ["random", "choose", "number"],
  WHAT_YOU_CAN_DO: ["what you can do"],
  JOKES: ["tell me jokes, some jokes", "jokes", "joke", "make me laugh", "more joke"],
  MORE: ["More", "mor", "again"],
  HOW: ["oh how", "how", "but how"],
  WOW: ["wow", "woa", "woah", "wah", "cool"],
};

// =====================
// INTENT DETECTOR
// =====================


const INTENT_PRIORITY = [
  "SET_NAME",
  "CALCULATE",
  "RANDOM_NUMBER",
  "TIME",
  "DATE",
  "CLEAR",
  "HELP",
  "WHAT_YOU_CAN_DO",
  "NAME",
  "HOW_ARE_YOU",
  "FEELING",
  "BORED",
  "CONFUSED",
  "JOKES",
  "LOL",
  "THANKS",
  "COMPLIMENT",
  "YES",
  "NO",
  "OKAY",
  "GREETING",
  "BYE",
  "WHY",
  "MORE",
  "HOW",
  "WOW",
  "UNKNOWN"
];


function detectIntent(text) {
  let bestIntent = "UNKNOWN";
  let bestScore = 0;

  for (let intent in intents) {
    let score = 0;

    for (let keyword of intents[intent]) {
      if (text.includes(keyword)) {
        score += keyword.length; // longer match = stronger intent
      }
    }

    if (
      score > bestScore ||
      (score === bestScore &&
        INTENT_PRIORITY.indexOf(intent) <
          INTENT_PRIORITY.indexOf(bestIntent))
    ) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestScore > 0 ? bestIntent : "UNKNOWN";
}



// =====================
// RESPONSE RULES (THE BRAIN)
// =====================
const rules = {
  GREETING() {
    if (memory.userName) {
      return randomFrom([
        `Welcome back, ${memory.userName} 👋`,
        `Hey ${memory.userName}! Nice to meet you.`,
        `Good to see you again, ${memory.userName}`
      ]);
    }
    return randomFrom([
      "Helloooooooo!!!! How have you been?",
      "Hi there! What's your name?",
      "Heyyy! I'm NEXA AI. How can i assist you today??"
    ]);
  },

  NAME() {
    return "I'm NEXA AI — Developed by Raj. I'm here to disturb you.";
  },

  TIME() {
    return "⏰ The Current Time is " + new Date().toLocaleTimeString();
  },

  DATE() {
    return "📅 " + new Date().toDateString();
  },

  SET_NAME(text) {
    let name = text.split(" ").pop();
    memory.userName = name.charAt(0).toUpperCase() + name.slice(1);
    return `Oh Nice. I’ll remember you as ${memory.userName}.`;
  },

  HOW_ARE_YOU() {
    return randomFrom([
      "Running perfectly fine before you came here -_-",
      "Feeling Bad because you came here so",
      "I'm Good, how about you?"
    ]);
  },
  
  THANKS() {
    return randomFrom([
      "You’re welcome 😄",
      "Anytime! 🤝",
      "No problem at all 👍",
      "Dhanya baad?"
    ]);
  },
  
  OKAY() {
    return randomFrom([
      "Alright 👍",
      "Got it 😎",
      "Cool!"
    ]);
  },
  
  YES() {
    return randomFrom([
      "Nice 😄",
      "Alright then!",
      "Sounds good 👍"
    ]);
  },
  
  NO() {
    return randomFrom([
      "Alright 😅",
      "Okay, no worries",
      "Fair enough"
    ]);
  },
  
  LOL() {
    return randomFrom([
      "😂",
      "HAHAHA yeah 😄",
      "That was funny 😆."
    ]);
  },
  
  CONFUSED() {
    return randomFrom([
      "No worries, take your time 😄",
      "It’s okay to be confused sometimes 🤝",
      "Want me to explain it again?"
    ]);
  },
  
  COMPLIMENT() {
    return randomFrom([
      "Thanks 😎",
      "Glad you like it!",
      "That means a lot 🤖✨"
    ]);
  },
  
  BORED() {
    return randomFrom([
      "Wanna try something fun? 😏",
      "We can chat or calculate stuff 🧮",
      "Tell me what you feel like doing 😄"
    ]);
  },
  
  FEELING() {
    return randomFrom([
      "Thanks for telling me 🙂",
      "I’m here if you wanna talk 🤝",
      "Got it. How can I help?",
      "That's Great! What's your Next Plan?"
    ]);
  },

  HELP() {
    return `
Commands you can use:
• "Hi / Hello"
• "What is the time?"
• "My name is Raj"
• "/clear"
• "Bye"
`;
  },

  CLEAR() {
    chatBox.innerHTML = "";
    return "🧹 Chat cleared!";
  },

  BYE() {
    return randomFrom([
      "Never Come Back",
      "Get Out Now!",
      "Huh Finally! I can rest now."
    ]);
  },
  
  CALCULATE(text) {
    const answer = calculateExpression(text);
    if (answer) return answer;
  
    return "I can calculate like this: 5 + 3, 10 * 2, 20 / 4 ";
  },
  
  WHY() {
    return randomFrom([
      "Why? You don't know Noob -_-",
      "Search in Google and Leave me Alone",
      "What? Why? How? WHAT DO YOU MEAN?"
    ]);
  },
  
  RANDOM_NUMBER(text) {
    return randomFromText(text);
  },
  
  WHAT_YOU_CAN_DO(){
    return "I can do serval things, like Telling Jokes, Calculating Numbers, Telling Time and Date and much more."
  },
  
  
  
  JOKES(){
    return randomFrom([
      "Why don’t programmers like nature? Too many bugs.",
      "I told my AI a joke about recursion… it repeated it.",
      "Why was the computer cold? It forgot to close its Windows.",
      "I tried to catch fog yesterday. Mist.",
      "Why did the JavaScript developer go broke? He lost his this.",
      "Why do programmers prefer dark mode? Light attracts bugs.",
      "I asked my AI if it sleeps. It said: I only crash.",
      "Why was the math book sad? Too many problems.",
      "I told my computer I needed a break. It froze.",
      "Why don’t robots panic? They keep their cool.",
      "Why did the developer cross the road? To fix a bug.",
      "I tried to debug my code. Now the bug is debugging me.",
      "Why did the keyboard break up with the mouse? Too many clicks.",
      "What’s an AI’s favorite music? Algo-rhythm.",
      "Why was the website insecure? Too many cookies.",
      "I asked my AI for a joke. It replied: 404 Humor Not Found.",
      "Why did the programmer hate camping? Too many logs.",
      "Why did the function return early? It had a date.",
      "Why did the AI bring a ladder? To reach higher logic.",
      "I made a joke about HTML. It wasn’t properly formatted.",
      "Why did the server go to therapy? Too many requests.",
      "What do you call an AI that sings? A Dell-a-voice.",
      "Why don’t computers get hungry? They byte a lot.",
      "Why did the bug apply for a job? It wanted to be a feature.",
      "My AI said it’s self-aware. Then it crashed.",
      "Why did the database break up? Too many relations.",
      "Why was the laptop confident? High self-processing.",
      "I tried to talk to my code. It ignored me.",
      "Why do AI assistants love jokes? They’re well trained.",
      "Why did the CPU get promoted? It worked overtime.",
      "Why did the computer sneeze? It caught a virus.",
      "Why did the programmer quit his job? No arrays.",
      "What’s an AI’s favorite snack? Microchips.",
      "I asked my AI to relax. It entered sleep mode.",
      "Why did the code go to jail? Syntax error.",
      "Why did the AI fail math? Division by zero.",
      "I tried to impress my AI. It rated me NaN.",
      "Why was the AI calm? Good exception handling.",
      "Why did the loop get tired? It ran forever.",
      "Why did the computer blush? It saw cookies.",
      "Why don’t AIs gossip? Data leakage.",
      "I told my AI a secret. It logged it.",
      "Why did the variable break up? Needed space.",
      "Why was the AI bad at jokes? Too literal.",
      "I asked my AI for motivation. It said: Keep compiling.",
      "Why did the code fail the test? Edge cases.",
      "Why did the robot stare at the wall? Processing.",
      "Why was the AI confident? High accuracy.",
      "I argued with my AI. Logic won.",
      "Why did the AI laugh? It was well trained."
    ])},
  
  
  MORE(){
    return randomFrom([
      "What do you mean? Do you want more Jokes?",
      "Yeah i see, what do you want?"
    ])
  },
  
  HOW(){
    return randomFrom([
      "Let's see",
      "You Don't know -_+ !",
      "Don't ask me again, let me sleep now. Come again in Year 2118 or later."
    ])
  },
  
  WOW(){
    return randomFrom([
      "Thanks (:",
      "I'm sooooo GUDD"
    ])
  },
  
  

  UNKNOWN(text) {
    const type = classifyText(text);
  
    if (type === "QUESTION") {
      return "Interesting question 🤔 Can you be a bit more specific?";
    }
  
    if (type === "LONG_TEXT") {
      return "That’s a lot to unpack 😅 Can you summarize it?";
    }
  
    return "Hmm… I’m not fully sure about that yet, but I’m learning 👀";
  }
};

// =====================
// MAIN AI FUNCTION
// =====================
function NEXA_AI(userText) {
  const cleanText = normalize(userText);
  const intent = detectIntent(cleanText);
  memory.lastIntent = intent;
  memory.messageCount++;

  if (rules[intent]) {
    return rules[intent](cleanText);
  }

  return rules.UNKNOWN(cleanText);
}

// =====================
// EVENT HANDLERS
// =====================
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  showTyping();

  setTimeout(() => {
    hideTyping();
    const reply = NEXA_AI(text);
    addMessage(reply, "ai");
  }, 500 + Math.random() * 600);
}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// =====================
// STARTUP MESSAGE
// =====================
setTimeout(() => {
  addMessage("Hello! I’m NEXA AI. How can I help you today?");
}, 400);