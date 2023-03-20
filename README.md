# AI Misinformation Hackathon: Google Maps Review Reliability Checker

This web extension provides users with an easy and reliable way to gauge the credibility of reviews on Google Maps. With just a few clicks, users can determine the reliability of any review on the platform, giving them the confidence they need to make informed decisions about the businesses they visit.

The extension works by analyzing the language used in each review and assigning a reliability score out of 10. This score takes into account various factors, including the tone of the review, the language used, and the presence of any red flags that may suggest the review is unreliable. By providing a clear and objective reliability score, users can quickly and easily assess the value of each review.

In addition to the reliability score, the extension also provides explanations to the reasoning behind the score. This information helps users understand why a particular review received a specific score and provides insights into the credibility of the review. For example, the extension may highlight key words that suggest the reviewer had a personal grudge against the business or that the review lacks specific examples or evidence to support its claims.

Overall, this web extension is an essential tool for anyone who uses Google Maps to find businesses and services. It offers a fast and reliable way to determine the credibility of reviews, making it easier for users to make informed decisions and find the best businesses in their area.


<!---

Our web extension provides valuable information about the reliability of reviews on Google Maps. Once a user clicks the button next to a review, our extension analyzes the language used in the review and assigns a reliability score out of 10 based on various factors. These factors include the restaurant's location, rating, tone of the review, language used, and the presence of any red flags that suggest the review may be unreliable.

By presenting an objective and clear reliability score, users can quickly and easily assess the value of each review. In addition to the score, our extension also highlights key words and phrases that explain the reasoning behind the score. This information helps users understand why a particular review received a specific score and provides insights into the credibility of the review.

For example, the extension may highlight key words that suggest the reviewer had a personal grudge against the business or that the review lacks specific examples or evidence to support its claims. These insights can help users make more informed decisions about businesses and services they are considering.

Our web extension is an essential tool for anyone who uses Google Maps to find businesses and services. It provides a fast and reliable way to determine the credibility of reviews, making it easier for users to find the best businesses in their area. With our extension, users can save time and avoid unreliable reviews, ensuring they have the best experience possible.

This web extension leverages the power of OpenAI API's state-of-the-art language interpretation models to provide users with reliable and insightful information. By tapping into OpenAI's cutting-edge technology, our extension delivers accurate and unbiased explanations, effective moderation, and concise summaries that enable users to make informed decisions about the credibility of reviews on Google Maps.


-->




## OpenAI

Our web extension is designed to empower users with the most advanced language interpretation capabilities available, thanks to OpenAI's industry-leading API. By using natural language processing algorithms and machine learning techniques, our extension can quickly and accurately analyze reviews on Google Maps to provide users with a comprehensive understanding of their reliability. In particular, we used the following aspects of the OpenAI API:

### Moderation

We used the Moderation endpoint to check whether the review has any inappropriate elements. If the review is detected as being inappropriate, our extension will output warnings to the users. For more details, please see the [OpenAI API Moderation endpoint documentation](https://platform.openai.com/docs/guides/moderation/quickstart).

### Chat Completion

#### Analyze Review
This is the main part of our extension.
With the help of OpenAI's chat completion API, our extension delivers reliable and insightful information about each review, including key insights into the tone, language, and credibility of the reviewer. 
The API will give a rating out of 10 to evaluate the reliability of the review, along with some explanations to the evaluation.

#### Disclaimer Statements
The output of the OpenAI will often include a disclaimer statement at the end. Instead of having the disclaimer at the end of the response, we put the disclaimer as a footer at the bottom of the popover window.
We use the OpenAI chat completion API to determine whether the last sentence of the analysis result is a disclaimer, and if yes, we remove the last sentence from the response.

## Installation Guide

### Download the source from repo
Clone the repository to your local directory
```
git clone https://github.com/XunchaoZ/Google-Map-Review-Reliability-Checker.git
```
Remember the path of the directory
```
cd Google-Map-Review-Reliability-Checker
pwd
```
### API key
Create a file called API_key.json and put your OpenAI API key inside
```
echo "{
\"OPENAI\": \"your_api_key_here\"
}">API_key.json
```
Remember to replace ```your_api_key_here``` with your OpenAI API key

### Upload extension
Open ```chrome://extensions/``` OR click on the three dots on top right of the Chrome -> More tools -> Extensions
On the top right corner enable "Developer mode" 
On the top left corner click "Load unpacked"
Go to the path of the directory returned from previous step "pwd" and click "Select folder"

### Usage
Open [Google Map](https://www.google.com/maps), for any place, there would be an "Analyze Review" button besides the Author's name for any review.

## Constraints

### Google Maps Places API

Initially, our plan was to use Google Maps Platform's Places API to retrieve all the reviews from a place and then use OpenAI API to verify the reliability of those reviews. However, as we dug deeper into the functionality of the Google Maps Platform, we realized that accessing all the reviews requires us to have funds on our Google Cloud account. Unfortunately, we did not have the resources to continue with this approach. As a result, we left the functionality as implemented but unused, and moved on to other solutions. For more details on how we implemented this feature, please refer to the 'placesapi.js' file in our codebase. Despite this setback, we remain committed to providing users with reliable and accurate information about the credibility of reviews on Google Maps.


### AWS

In the initial development of our web extension, we did not use API keys as variables. While this was a temporary solution, we recognized that it was not ideal and could pose security risks. After researching potential solutions, we considered using AWS Management Console's Key Management Service to store our API keys securely.

The Key Management Service (KMS) would enable us to create a user secret to access the API keys, and users would need a key pair saved to their computer to access the secret. To implement this, we would create a single AWS user for all our users, and users could use AWS CLI to run AWS configuration and retrieve their key pair to run the API without knowing the API key directly.

However, we found that KMS also has a limited number of API calls, and exceeding this limit would require additional funds. Due to this limitation and the potential cost implications, we decided not to proceed with implementing KMS at this time.

We are currently exploring alternative solutions to securely manage API keys and ensure the privacy and security of our users' data. In the meantime, we recommend users to manually enter their API keys as variables, and to regularly update and monitor their security practices to ensure maximum protection.

## Conclusion

In summary, our web extension is an essential tool for anyone who relies on reviews to make informed decisions about businesses and services on Google Maps. By leveraging the power of OpenAI's cutting-edge technology, our extension delivers accurate and unbiased explanations, effective moderation, and concise summaries that enable users to make informed decisions about the credibility of reviews.

