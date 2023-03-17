import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * reviewInfo = {
 *   name: "",
 *   address: ""
 *   text: "",
 *   rating: "",
 *   time: ""
 * }
 */

function generatePrompt(reviewInfo) {
  return `The following is a review for the restaurant ${reviewInfo.name} at ${reviewInfo.address}:
  "${reviewInfo.text}"
  The reviewer gave a rating of ${reviewInfo.rating} out of 5.
  The review was written ${reviewInfo.time}.
  Do you think the review is reliable?`;
}

async function analyzeReview(reviewText) {
  let reviewInfo = { text: reviewText };

  let systemContent = `You are a bot that checks for reliability of restaurant reviews.
                       Check if the review is genuine and warn the users if the review is a spam.`;
  let userPrompt = generatePrompt(reviewInfo);

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: systemContent},
        {role: "user", content: userPrompt}
      ],
      temperature: 0.53,
    });
    return { success: true, result: completion.data.choices[0].text };
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      return { success: false, result: error.response.data }
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      return { success: false, result: error.message };
    }
  }
}

const extensionApi = typeof browser !== 'undefined' ? browser : chrome;

extensionApi.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze_review') {
    analyzeReview(request.text).then(sendResponse);
    return true;
  }
});
