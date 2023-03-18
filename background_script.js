var PlacesAPI = require("./placesApi.js");

const PLACES_API_KEY = "AIzaSyA2ft9Ti0ILphcvqQF3qvHvjY35LOhQxdk";
const OPENAI_API_KEY = "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";

var placeInfo = {}; // name, rating, address

function generatePrompt(reviewText) {
  // retrieve info
  return `The following is a review for the restaurant ${placeInfo.name} at ${placeInfo.address}:
  "${reviewText}"
  The overall rating of the restaurant is ${placeInfo.rating} out of 5.
  The reviewer gave a rating of ${placeInfo.reviews[reviewText].rating} out of 5.
  The review was written ${placeInfo.reviews[reviewText].relative_time_description}.
  Do you think the review is reliable?`;
}

async function analyzeReview(reviewText) {
  const systemContent = `You are a bot that checks for reliability of restaurant reviews.
                       Check if the review is genuine and warn the users if the review is a spam.`;
  const userPrompt = generatePrompt(reviewText);

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

extensionApi.tabs.onUpdated.addListener(async (tabId, tab) => {
  if (tab.url && tab.url.includes("www.google.com/maps/place")) {
    // Use the tab.url to call methods from PlacesAPI class and update the
    // the global variable placeInfo accordingly.
    const placesAPI = new PlacesAPI(PLACES_API_KEY, tab.url);
    placeInfo = await placesAPI.getPlaceInfo();
    placeInfo.reviews = await placesAPI.getReviewsDict();
  }
});
