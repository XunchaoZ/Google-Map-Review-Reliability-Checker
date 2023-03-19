const OPENAI_API_KEY = "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";

let placeInfo = {
  name: "The Lancaster Smokehouse",
  rating: 4.6,
  address: "574 Lancaster St W, Kitchener, ON N2K 1M3",
  numReviews: 5050,
  type: "Southern restaurant (US)"
};

let reviewInfo = {
  text: `The restaurant is a disaster, it has the worst food I've ever tasted, servers are super rude, never come to this place, i hate it so much`,
  rating: 1,
  time: "a year ago"
};

function generatePrompt(reviewInfo) {
  // retrieve info
  return `${placeInfo.name} is a ${placeInfo.type} located at ${placeInfo.address}.
  The overall rating of the restaurant is ${placeInfo.rating} out of 5.
  There are a total of ${placeInfo.numReviews} reviews for the restaurant.
  The following is a review for the restaurant:
  "${reviewInfo.text}"
  The reviewer gave a rating of ${reviewInfo.rating} out of 5.
  The review was written ${reviewInfo.time}.
  Do you think the review is reliable?
  Please return an answer between 0 to 10, where 0 stands for absolutely not reliable and 10 stands for absolutely reliable. Your answer should include the number first and some explanation. Your response should in JSON format, the first key is called "rate", should include a single number, which is the number you provided out of 10; the second key is called "explanation", which should include your explanation, in the explanation you should only provide information about this review, don't talk about that you can't say for sure or mention anything about considering multiple reviews`;
}

async function moderation(reviewText) {
  const apiURL = "https://api.openai.com/v1/moderations";
  const response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
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

async function analyzeReview(reviewInfo) {
  const systemContent = `You are a bot that checks for reliability of restaurant reviews.
                       Check if the review is genuine and warn the users if the review is a spam.`;
  const userPrompt = generatePrompt(reviewInfo);
  try {
    const moderationResult = await moderation(reviewInfo.text);
    if (moderationResult.flagged) {
      let flagMsg = "The review is flagged for the following inappropriate elements:";
      for (const cat in moderationResult.categories) {
        flagMsg += " " + String(cat);
      }
      return { success: false, result: flagMsg };
    }

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
    const data = await response.json();
    return { success: true, result: data.choices[0].message.content };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
}

analyzeReview(reviewInfo).then((response) => {
  if (response.success) {
    console.log(response.result);
  } else if (response.result){
    console.error(response.result);
  } else {
    console.error("GPT error!");
  }
});

