let placeInfo;

// Function to create the "Analyze the review" option
function createAnalyzeButton(reviewText, rating, time) {
  const analyzeButton = document.createElement('button');
  analyzeButton.textContent = 'Analyze';
  analyzeButton.style.cursor = 'pointer';
  analyzeButton.style.padding = '6px 12px';
  analyzeButton.style.fontSize = '14px';
  analyzeButton.style.color = '#ffffff';
  analyzeButton.style.backgroundColor = '#9e9e9e';
  analyzeButton.style.border = 'none';
  analyzeButton.style.borderRadius = '4px';
  analyzeButton.style.marginLeft = 'auto';
  analyzeButton.setAttribute('data-review-text', reviewText);
  analyzeButton.setAttribute('data-rating', rating);
  analyzeButton.setAttribute('data-time', time);
  analyzeButton.addEventListener('click', () => { 
    const reviewText = analyzeButton.getAttribute('data-review-text');
    const rating = analyzeButton.getAttribute('data-rating');
    const time = analyzeButton.getAttribute('data-time');
    analyzeReview(reviewText, rating, time);
  });
  return analyzeButton;
}

// Function to analyze the review using OpenAI API
async function analyzeReview(reviewText, rating, time) {
  message = { action: 'analyze_review', place: placeInfo, text: reviewText, rating: rating, time: time };
  console.log(message);
  chrome.runtime.sendMessage(message, (response) => {
    if (response.success) {
      alert(`Analysis result: ${response.result.choices[0].message.content}`);
    } else {
      alert('Failed to analyze the review. Please try again later.');
    }
  });
}


// Function to add "Analyze the review" option to review menus
function addAnalyzeButtonToMenus() {
  placeInfo = document.querySelector('div.TIHn2').outerText;
  const reviewMenus = document.querySelectorAll('button.PP3Y3d.S1qRNe');
  for (const menu of reviewMenus) {
    let review = menu.parentNode.parentNode.parentNode.parentNode;
    if (review) {
      reviewText = review.querySelector('span.wiI7pd').outerText;
      rating = review.querySelector('span.kvMYJc').ariaLabel;
      time = review.querySelector('div.DU9Pgb').outerText;
      if (!menu.previousElementSibling || !menu.previousElementSibling.classList.contains('analyze-review-button')) {
        const analyzeButton = createAnalyzeButton(reviewText, rating, time);
        let bar = review.querySelector('div.DU9Pgb');
        const lastChild = bar.lastElementChild;
        if (lastChild.tagName == 'BUTTON') {
          bar.replaceChild(analyzeButton, lastChild);
        } else {
          bar.appendChild(analyzeButton);
        }
      }
    }
  }
}

// Periodically check for new review menus and add the "Analyze the review" option
setInterval(addAnalyzeButtonToMenus, 1000);
