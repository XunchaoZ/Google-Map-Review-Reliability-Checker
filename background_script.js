const disclaimers = [
  "Since we do not have any information about the reviewer, we cannot be completely sure about their authenticity.",
  "It is important to note that this is only one review and other reviews should also be considered for a more accurate assessment.",
  "It is important to consider other reviews as well before making a final decision.",
  "It should be taken with a grain of salt and considered alongside other reviews.",
  "It is recommended to read other reviews as well to get a more accurate assessment."
];

var placeInfo = {}; // name, rating, address

function parsePlaceInfo(placeInfoStr) {
  console.log(placeInfoStr);
  const tokens = placeInfoStr.split('\n');
  return {
    name: tokens[0],
    rating: tokens[1],
    numReviews: tokens[2].split(' ')[0],
    type: tokens[3]
  };
}

function generatePrompt(reviewInfo) {
  // retrieve info
  const placeInfo = parsePlaceInfo(reviewInfo.place);
  console.log(placeInfo);
  return `${placeInfo.name} is a ${placeInfo.type}.
  The overall rating of this place is ${placeInfo.rating} (lowest rating is 1 and highest rating is 5).
  There are a total of ${placeInfo.numReviews} reviews for this place.
  The following is a review for this place:
  "${reviewInfo.text}"
  The reviewer gave a rating of ${reviewInfo.rating} (lowest rating is 1 and highest rating is 5).
  The review was written ${reviewInfo.time}. Note that the earlier the review was written, the less reliable the review is. Reviews written with the past 6 months are considered relevant.
  Do you think the review is reliable?

  Please return an answer between 0 to 10, where 0 stands for absolutely not reliable and 10 stands for absolutely reliable.
  Your answer should include the number first and some explanation. 
  Your response should be in strict JSON format that includes the opening and closing curly brackets. 
  The first key is called "rate" and should include a single number, which is the number you provided out of 10; the second key is called "explanation", which should include your explanation.
  Please DO NOT include any sentences that have the same meaning as the following:
    "Since we do not have any information about the reviewer, we cannot be completely sure about their authenticity."
    "It is important to note that this is only one review and other reviews should also be considered for a more accurate assessment."
    "it is important to consider other reviews as well before making a final decision."
    "it should be taken with a grain of salt and considered alongside other reviews."
    "It is recommended to read other reviews as well to get a more accurate assessment."
  `;
}

async function moderation(reviewText) {
  const apiURL = "https://api.openai.com/v1/moderations";
  const response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY2}`
    },
    body: JSON.stringify({
      input: reviewText
    })
  });
  const data = await response.json();
  if (data.results[0].flagged) {
    let flaggedList = [];
    const flagCategories = data.results[0].categories;
    for (const cat in flagCategories) {
      if (flagCategories[cat]) {
        flaggedList.push(cat);
      }
    }
    return { flagged: true, categories: flaggedList };
  } else {
    return { flagged: false };
  }
}

async function compareDisclaimer(lastSentence) {
  const systemContent = `You are a bot that checks if sentences have the same meaning. Only answer "Yes" or "No".`;
  let userPrompt = `You are given the following sentence: "${lastSentence}". Is the above sentence the same meaning as any one of the following sentences?\n`;
  for (const idx in disclaimers) {
    userPrompt += `\t"${disclaimers[idx]}"\n`;
  }
  userPrompt += 'Please only answer "Yes" or "No" and nothing else.'

  console.log(userPrompt);

  const apiURL = "https://api.openai.com/v1/chat/completions";
  const response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY2}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: systemContent},
        {role: "user", content: userPrompt}
      ],
      temperature: 0.1
    })
  });
  const data = await response.json();
  const gptResponse = data.choices[0].message.content;
  console.log(gptResponse);
  return gptResponse;
}

async function analyzeReview(reviewInfo) {
  if (reviewInfo.text === "") {
    return {
      success: true,
      result: {
        rate: 0,
        explanation: "The reviewer didn't give any comments."
      }
    }
  }
  const systemContent = `You are a bot that checks for reliability of place reviews.
                       Check if the review is genuine and warn the users if the review is a spam.`;
  const userPrompt = generatePrompt(reviewInfo);
  try {
    const moderationResult = await moderation(reviewInfo.text);
    if (moderationResult.flagged) {
      let flagMsg = "The review is flagged for the following inappropriate elements:";
      for (const cat in moderationResult.categories) {
        flagMsg += " " + String(cat);
      }
      return { 
        success: true, 
        result: {
          rate: 0,
          explanation: flagMsg
        }
      };
    }
    const apiURL = "https://api.openai.com/v1/chat/completions";
    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY2}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {role: "system", content: systemContent},
          {role: "user", content: userPrompt}
        ],
        temperature: 0.253
      })
    });
    const data = await response.json();
    const gptResponse = data.choices[0].message.content;
    let gptResponseJSON = {};
    try {
      gptResponseJSON = JSON.parse(gptResponse);
    } catch {
      gptResponse = `{${gptResponse}}`;
      gptResponseJSON = JSON.parse(gptResponse);
    }
    const sentences = gptResponseJSON.explanation.split(/(?<=\.|\?|!)\s/);
    const lastSentence = sentences[sentences.length - 1];
    const compareDisclaimerResult = await compareDisclaimer(lastSentence);
    if (compareDisclaimerResult === "Yes.") {
      sentences.pop();
      gptResponseJSON.explanation = sentences.join(" ");
    }
    return { success: true, result: gptResponseJSON };
  } catch (err) {
    return { success: false, result: err };
  }
}

const extensionApi = typeof browser !== 'undefined' ? browser : chrome;

extensionApi.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('background');
  if (request.action === 'analyze_review') {
    analyzeReview(request).then(sendResponse);
    return true;
  }
});
