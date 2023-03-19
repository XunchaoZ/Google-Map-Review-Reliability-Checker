const OPENAI_API_KEY1 = "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";
const OPENAI_API_KEY2 = "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";

let placeInfo = {
  name: "The Lancaster Smokehouse",
  rating: 4.6,
  address: "574 Lancaster St W, Kitchener, ON N2K 1M3",
  numReviews: 5050,
  type: "Southern restaurant (US)"
};

let reviewInfo = {
  text: `UPDATED June 18, 2022:
  What has happened to this place ?  We have patronized restaurant for years and last night was a poor experience
  Server ( bartender ?? ) taking our table was rushed, not checking on us, did not offer food suggestions other than to tell us ( first thing out of her mouth) you know we're out of ribs and low on brisket right ). Not a hello, what can I get for you .  Nothing. Poor start.
  Brisket sandwich was mediocre. Meat dry. No garnish. Fries BARELY warm. Had to ask and remind staff of extra sides that were ordered but not brought. Had specifically asked for extra pickles. None brought. Asked twice. Ketchup was empty at table. No vinegar for fries and no one around to ask about them. No follow up on meal quality by server during meal. No offer of more drinks during meal. But those questions were asked when bringing the cheque ??  Server training 101 not practiced here. Could go on but point is made. Stay away and save your money.
  Has ownership changed here ?  Or new managers ?  Gone WAY down from previous. Won't be back
  Below you can see how much we enjoyed before. Such a shame …`,
  rating: 1,
  time: "8 months ago"
};

function generatePrompt(reviewInfo) {
  // retrieve info
  return `${placeInfo.name} is a ${placeInfo.type} located at ${placeInfo.address}.
  The overall rating of the restaurant is ${placeInfo.rating} (lowest rating is 1 and highest rating is 5).
  There are a total of ${placeInfo.numReviews} reviews for the restaurant.
  The following is a review for the restaurant:
  "${reviewInfo.text}"
  The reviewer gave a rating of ${reviewInfo.rating} (lowest rating is 1 and highest rating is 5).
  The review was written ${reviewInfo.time}.
  Do you think the review is reliable?
  Please return an answer between 0 to 10, where 0 stands for absolutely not reliable and 10 stands for absolutely reliable. 
  Your answer should include the number first and some explanation. 
  Your response should in strict JSON format that includes the opening and closing curly brackets. 
  The first key is called "rate" and should include a single number, which is the number you provided out of 10; the second key is called "explanation", which should include your explanation.
  In the explanation you should only provide information about this review.
  Please don't say that you can't say for sure or mention anything about considering multiple reviews.
  Please be confident.`;
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
  console.log(data);
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
        "Authorization": `Bearer ${OPENAI_API_KEY2}`
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
    const gptResponse = data.choices[0].message.content;
    let gptResponseJSON = {};
    try {
      gptResponseJSON = JSON.parse(gptResponse);
    } catch {
      gptResponse = `{${gptResponse}}`;
      gptResponseJSON = JSON.parse(gptResponse);
    }
    return { success: true, result: gptResponseJSON };
  } catch (err) {
    return { success: false, result: err };
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

