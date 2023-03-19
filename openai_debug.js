const OPENAI_API_KEY = "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";

let placeInfo = {
  name: "",
  rating: "",
  address: "",
  numReviews: "",
  type: ""
};

let reviewInfo = {
  text: "",
  rating: 0,
  relative_time_description: ""
};

function generatePrompt(reviewInfo) {
  // retrieve info
  return `The following is a review for the restaurant ${placeInfo.name} at ${placeInfo.address}:
  "${reviewInfo.text}"
  The overall rating of the restaurant is ${placeInfo.rating} out of 5.
  The reviewer gave a rating of ${reviewInfo.rating} out of 5.
  The review was written ${reviewInfo.relative_time_description}.
  Do you think the review is reliable?`;
}

async function analyzeReview(reviewInfo) {
  console.log('background');
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

analyzeReview.then((response) => {
  if (response.success) {
    console.log(response.result);
  } else {
    console.error("GPT error!");
  }
});

