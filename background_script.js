import { PlacesAPI } from './placesApi.js';

const PLACES_API_KEY = "AIzaSyA2ft9Ti0ILphcvqQF3qvHvjY35LOhQxdk";
const OPENAI_API_KEY = "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";

var placeInfo = {}; // name, rating, address

function generatePrompt(reviewText) {
  // retrieve info
  return `Please commment on the review of a restaurant:
  "${reviewText}"`;
}

async function analyzeReview(reviewText) {
  console.log('background');
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
    return { success: true, result: data}
  } else {
    return { success: false };
  }
}

const extensionApi = typeof browser !== 'undefined' ? browser : chrome;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze_review') {
    analyzeReview(request.text).then((data) => {
      sendResponse(data);
      console.log(data);
    });
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
