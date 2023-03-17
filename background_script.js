/**
 * reviewInfo = {
 *   name: "",
 *   address: ""
 *   text: "",
 *   rating: "",
 *   time: ""
 * }
 */
const PLACES_API_KEY = "AIzaSyA2ft9Ti0ILphcvqQF3qvHvjY35LOhQxdk";
const OPENAI_API_KEY = "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";

var PlacesAPI = require("./placesApi.js");
const placesAPI = new PlacesAPI(PLACES_API_KEY);
var placeInfo = {};

function generatePrompt(reviewInfo) {
  return `The following is a review for the restaurant ${reviewInfo.name} at ${reviewInfo.address}:
  "${reviewInfo.text}"
  The reviewer gave a rating of ${reviewInfo.rating} out of 5.
  The review was written ${reviewInfo.time}.
  Do you think the review is reliable?`;
}

function retrieveReviewInfo(reviewText) {
  // retrieve review info from placeInfo
}

async function analyzeReview(reviewText) {
  let reviewInfo = retrieveReviewInfo(reviewText);

  const systemContent = `You are a bot that checks for reliability of restaurant reviews.
                       Check if the review is genuine and warn the users if the review is a spam.`;
  const userPrompt = generatePrompt(reviewInfo);

  const apiURL = "https://api.openai.com/v1/chat/completions";
  const response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: systemContent},
        {role: "user", content: userPrompt}
      ],
      temperature: 0.53
    })
  });

  if (response.ok) {
    const data = await response.json();
    return { success: true, result: data.choices[0].text.trim() };
  } else {
    return { success: false };
  }
}

const extensionApi = typeof browser !== 'undefined' ? browser : chrome;

extensionApi.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze_review') {
    analyzeReview(request.text).then(sendResponse);
    return true;
  }
});

extensionApi.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("www.google.com/maps/place")) {
    // Use the tab.url to call methods from PlacesAPI class and update the
    // the global variable placeInfo accordingly.
  }
});
