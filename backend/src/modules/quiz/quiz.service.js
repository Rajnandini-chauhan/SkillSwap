const ApiError = require("../../utils/ApiError");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

const BASIC_QUESTIONS_SCHEMA = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
          },
        },
        required: ["question"],
      },
    },
  },
  required: ["questions"],
};

const ANSWER_EVALUATION_SCHEMA = {
  type: "object",
  properties: {
    status: {
      type: "string",
      enum: [
        "correct",
        "partially_correct",
        "incorrect",
        "off_topic",
      ],
    },

    feedback: {
      type: "string",
    },

    hint: {
      type: "string",
    },
  },
  required: ["status", "feedback", "hint"],
};

const FOLLOW_UP_QUESTION_SCHEMA = {
  type: "object",
  properties: {
    question: {
      type: "string",
    },

    reason: {
      type: "string",
    },
  },
  required: ["question", "reason"],
};

function cleanText(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function cleanJson(text) {
  return cleanText(text)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function getGeminiResponseText(data) {
  const parts =
    data?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => part?.text || "")
    .join("")
    .trim();
}

async function callGeminiJson({
  prompt,
  responseJsonSchema,
  temperature = 0.2,
  maxOutputTokens = 1000,
}) {
  if (!GEMINI_API_KEY) {
    throw new ApiError(
      500,
      "GEMINI_API_KEY is missing from the backend .env file"
    );
  }

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    `${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
      GEMINI_API_KEY
    )}`;

  let response;

  try {
    response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        contents: [
          {
            role: "user",

            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],

        generationConfig: {
          temperature,
          maxOutputTokens,
          responseMimeType: "application/json",
          responseJsonSchema,
        },
      }),
    });
  } catch (error) {
    console.error(
      "Gemini connection error:",
      error
    );

    throw new ApiError(
      502,
      "Could not connect to the AI quiz service. Please try again."
    );
  }

  let responseData;

  try {
    responseData = await response.json();
  } catch {
    throw new ApiError(
      502,
      "The AI quiz service returned an unreadable response."
    );
  }

  if (!response.ok) {
    console.error(
      "Gemini API error:",
      response.status,
      responseData
    );

    if (response.status === 429) {
      throw new ApiError(
        429,
        "The AI quiz service has reached its current usage limit. Please try again later."
      );
    }

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      throw new ApiError(
        502,
        "The AI quiz service is not configured correctly. Please check the backend Gemini API key."
      );
    }

    if (response.status === 404) {
      throw new ApiError(
        502,
        `The configured Gemini model "${GEMINI_MODEL}" is not available.`
      );
    }

    throw new ApiError(
      502,
      "Gemini could not process the quiz request. Please try again."
    );
  }

  const candidate =
    responseData?.candidates?.[0];

  if (!candidate) {
    console.error(
      "Gemini returned no candidate:",
      responseData
    );

    throw new ApiError(
      502,
      "Gemini did not return a quiz response."
    );
  }

  const finishReason =
    candidate.finishReason;

  if (
    finishReason &&
    finishReason !== "STOP"
  ) {
    console.error(
      "Gemini stopped early:",
      finishReason,
      responseData
    );

    if (finishReason === "MAX_TOKENS") {
      throw new ApiError(
        502,
        "Gemini could not finish creating the quiz. Please try again."
      );
    }

    throw new ApiError(
      502,
      "Gemini could not complete the quiz request."
    );
  }

  const generatedText =
    getGeminiResponseText(responseData);

  if (!generatedText) {
    console.error(
      "Empty Gemini response:",
      responseData
    );

    throw new ApiError(
      502,
      "Gemini returned an empty response."
    );
  }

  try {
    return JSON.parse(
      cleanJson(generatedText)
    );
  } catch (error) {
    console.error(
      "Invalid Gemini JSON:",
      generatedText
    );

    console.error(
      "JSON parsing error:",
      error.message
    );

    throw new ApiError(
      502,
      "Gemini returned an invalid quiz response."
    );
  }
}

async function generateBasicQuestions(
  notes
) {
  const cleanedNotes = cleanText(notes);

  if (cleanedNotes.length < 20) {
    throw new ApiError(
      400,
      "Notes must contain at least 20 characters."
    );
  }

  const prompt = `
You are creating a five-question learning quiz from a student's notes.

STUDENT NOTES:
--- NOTES START ---
${cleanedNotes}
--- NOTES END ---

Generate exactly five quiz questions.

Question order:

1. Question 1 must test basic recall.
2. Question 2 must test understanding.
3. Question 3 must ask the student to explain a concept in their own words.
4. Question 4 must test practical application.
5. Question 5 must test deeper reasoning, comparison, or limitations.

Rules:

- Use only information present in the student's notes.
- Every question must be answerable from the notes.
- Do not use outside information.
- Do not include answers.
- Do not repeat questions.
- Keep every question clear and focused.
- Return exactly five questions.
`;

  const result =
    await callGeminiJson({
      prompt,

      responseJsonSchema:
        BASIC_QUESTIONS_SCHEMA,

      temperature: 0.2,

      maxOutputTokens: 2000,
    });

  if (
    !Array.isArray(result.questions) ||
    result.questions.length !== 5
  ) {
    console.error(
      "Unexpected basic quiz response:",
      result
    );

    throw new ApiError(
      502,
      "Gemini did not return exactly five questions."
    );
  }

  return result.questions.map(
    (item, index) => {
      const question = cleanText(
        item?.question
      );

      if (!question) {
        throw new ApiError(
          502,
          `Gemini returned an empty question at position ${
            index + 1
          }.`
        );
      }

      return {
        question,
        answer: "",
        status: "unanswered",
        feedback: "",
        hint: "",
        attempts: 0,
      };
    }
  );
}

async function evaluateAnswer({
  notes,
  question,
  answer,
}) {
  const cleanedNotes =
    cleanText(notes);

  const cleanedQuestion =
    cleanText(question);

  const cleanedAnswer =
    cleanText(answer);

  if (!cleanedNotes) {
    throw new ApiError(
      400,
      "Notes are required to evaluate the answer."
    );
  }

  if (!cleanedQuestion) {
    throw new ApiError(
      400,
      "A quiz question is required."
    );
  }

  if (!cleanedAnswer) {
    throw new ApiError(
      400,
      "Please write an answer first."
    );
  }

  const prompt = `
You are evaluating a student's quiz answer.

Use the student's notes as the main learning source.

STUDENT NOTES:
--- NOTES START ---
${cleanedNotes}
--- NOTES END ---

QUESTION:
--- QUESTION START ---
${cleanedQuestion}
--- QUESTION END ---

STUDENT ANSWER:
--- ANSWER START ---
${cleanedAnswer}
--- ANSWER END ---

Classify the answer as exactly one of these statuses:

"correct"
The answer is relevant and demonstrates correct understanding.

"partially_correct"
The answer contains some correct understanding but is incomplete, vague, unclear, or contains a small mistake.

"incorrect"
The student attempts the question, but the answer demonstrates a major misunderstanding.

"off_topic"
The answer is unrelated to the notes and question, meaningless, random, or does not genuinely attempt the question.

Evaluation rules:

- Judge understanding, not English grammar.
- Accept correct ideas written in different words.
- Do not require exact memorized wording.
- Do not mark an answer correct merely because it contains keywords.
- Be encouraging but honest.
- Keep the feedback below 80 words.
- For a correct answer, explain specifically what the student understood.
- For a partially correct answer, mention what is correct and what is missing.
- For an incorrect answer, explain the main misunderstanding.
- For partially correct or incorrect answers, provide one concise hint.
- Do not reveal a long complete model answer.
- For an off-topic answer, feedback must be exactly:
  "Your answer does not relate to the question. Please read the notes again and try once more."
- The hint must be empty for correct and off-topic answers.
`;

  const result =
    await callGeminiJson({
      prompt,

      responseJsonSchema:
        ANSWER_EVALUATION_SCHEMA,

      temperature: 0.1,

      maxOutputTokens: 800,
    });

  const allowedStatuses = [
    "correct",
    "partially_correct",
    "incorrect",
    "off_topic",
  ];

  const status = cleanText(
    result.status
  );

  if (
    !allowedStatuses.includes(status)
  ) {
    console.error(
      "Invalid evaluation status:",
      result
    );

    throw new ApiError(
      502,
      "Gemini returned an invalid answer status."
    );
  }

  if (status === "off_topic") {
    return {
      status: "off_topic",

      feedback:
        "Your answer does not relate to the question. Please read the notes again and try once more.",

      hint: "",

      canContinue: false,

      canRetry: true,
    };
  }

  const feedback = cleanText(
    result.feedback
  );

  if (!feedback) {
    throw new ApiError(
      502,
      "Gemini did not return feedback."
    );
  }

  return {
    status,

    feedback,

    hint:
      status === "correct"
        ? ""
        : cleanText(result.hint),

    canContinue:
      status === "correct",

    canRetry:
      status !== "correct",
  };
}

async function generateFollowUpQuestion({
  notes,
  basicQuestions,
  previousFollowUpQuestions = [],
}) {
  const cleanedNotes =
    cleanText(notes);

  if (!cleanedNotes) {
    throw new ApiError(
      400,
      "Notes are required to generate a follow-up question."
    );
  }

  if (
    !Array.isArray(basicQuestions) ||
    basicQuestions.length !== 5
  ) {
    throw new ApiError(
      400,
      "Five completed basic questions are required."
    );
  }

  const completedQuestions =
    basicQuestions
      .map(
        (item, index) => `
Question ${index + 1}:
${cleanText(item.question)}

Student's correct answer:
${cleanText(item.answer)}
`
      )
      .join("\n");

  const previousQuestions =
    previousFollowUpQuestions.length > 0
      ? previousFollowUpQuestions
          .map(
            (item, index) =>
              `${index + 1}. ${cleanText(
                item.question
              )}`
          )
          .join("\n")
      : "No previous follow-up questions.";

  const prompt = `
The student has correctly completed five basic questions.

STUDENT NOTES:
--- NOTES START ---
${cleanedNotes}
--- NOTES END ---

COMPLETED BASIC QUESTIONS:
--- BASIC QUESTIONS START ---
${completedQuestions}
--- BASIC QUESTIONS END ---

PREVIOUS FOLLOW-UP QUESTIONS:
--- PREVIOUS FOLLOW-UPS START ---
${previousQuestions}
--- PREVIOUS FOLLOW-UPS END ---

Generate exactly one deeper follow-up question.

Rules:

- The follow-up question must be based on the notes.
- It must be more challenging than the five basic questions.
- It may test application, reasoning, comparison, limitations, analysis, or teaching ability.
- Do not repeat any basic question.
- Do not repeat any previous follow-up question.
- Do not provide the answer.
- Include a short reason explaining which learning skill the question tests.
`;

  const result =
    await callGeminiJson({
      prompt,

      responseJsonSchema:
        FOLLOW_UP_QUESTION_SCHEMA,

      temperature: 0.2,

      maxOutputTokens: 800,
    });

  const question = cleanText(
    result.question
  );

  const reason = cleanText(
    result.reason
  );

  if (!question) {
    console.error(
      "Unexpected follow-up response:",
      result
    );

    throw new ApiError(
      502,
      "Gemini did not return a follow-up question."
    );
  }

  return {
    question,

    reason,

    answer: "",

    status: "unanswered",

    feedback: "",

    hint: "",

    attempts: 0,
  };
}

module.exports = {
  generateBasicQuestions,
  evaluateAnswer,
  generateFollowUpQuestion,
};