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
    analyzeReview(reviewText, rating, time, analyzeButton);
  });
  return analyzeButton;
}

// Function to create the popover container
function createPopoverContainer() {
  const popover = document.createElement('div');
  popover.style.position = 'absolute';
  popover.style.backgroundColor = '#fff';
  popover.style.border = '1px solid #ccc';
  popover.style.borderRadius = '4px';
  popover.style.padding = '16px';
  popover.style.width = '200px';
  popover.style.zIndex = '1000';
  popover.style.display = 'none';
  popover.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';

  const arrow = document.createElement('div');
  arrow.style.position = 'absolute';
  arrow.style.left = '10px';
  arrow.style.top = '-10px';
  arrow.style.border = '5px solid transparent';
  arrow.style.borderBottomColor = '#ccc';

  popover.appendChild(arrow);
  return popover;
}

// Function to show the popover container with the analysis result
function showPopoverContainer(popover, analyzeButton, result, explanation) {
  const ratingColor = result >= 5 ? 'green' : 'red';
  popover.innerHTML += `
    <h2 style="color: ${ratingColor}; margin-top: 0;">Rating: ${result}/10</h2>
    <p>${explanation}</p>
    <button style="cursor: pointer; padding: 6px 12px; font-size: 14px; color: #fff; background-color: #2196f3; border: none; border-radius: 4px;">Done</button>
  `;
  popover.style.display = 'block';

  const buttonRect = analyzeButton.getBoundingClientRect();
  popover.style.left = `${buttonRect.left}px`;
  popover.style.top = `${buttonRect.bottom + 8}px`;

  const doneButton = popover.querySelector('button');
  doneButton.addEventListener('click', () => {
    popover.style.display = 'none';
  });
}

// Function to analyze the review using OpenAI API
async function analyzeReview(reviewText, rating, time, analyzeButton) {
  message = { action: 'analyze_review', place: placeInfo, text: reviewText, rating: rating, time: time };
  console.log(message);
  chrome.runtime.sendMessage(message, (response) => {
    if (response.success) {
      const popover = createPopoverContainer();
      document.body.appendChild(popover);
      console.log(response.result);
      showPopoverContainer(popover, analyzeButton, response.result.rate, response.result.explanation);
    } else {
      alert('Failed to analyze the review. Please try again later.');
    }
  });
}


// Function to add "Analyze the review" option to review menus
function addAnalyzeButtonToMenus() {
  if (document.querySelector('div.TIHn2')) {
    placeInfo = document.querySelector('div.TIHn2').outerText;
  }
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
