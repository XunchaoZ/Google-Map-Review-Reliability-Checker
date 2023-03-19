let placeInfo;

// Function to create the "Analyze the review" option
function createAnalyzeButton(reviewText, rating, time) {
  const analyzeButton = document.createElement('button');
  analyzeButton.textContent = 'Analyze';
  analyzeButton.style.cursor = 'pointer';
  analyzeButton.style.padding = '6px 12px';
  analyzeButton.style.fontSize = '14px';
  analyzeButton.style.color = '#ffffff';
  analyzeButton.style.backgroundColor = '#5fce72';
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

// Function to create a loading animation
function createLoadingAnimation() {
  const loadingContainer = document.createElement('div');
  loadingContainer.style.display = 'flex';
  loadingContainer.style.alignItems = 'center';

  const spinner = document.createElement('div');
  spinner.style.border = '4px solid #f3f3f3';
  spinner.style.borderTop = '4px solid #3498db';
  spinner.style.borderRadius = '50%';
  spinner.style.width = '24px';
  spinner.style.height = '24px';
  spinner.style.animation = 'spin 2s linear infinite';

  const loadingText = document.createElement('span');
  loadingText.textContent = 'Analysis result loading...';
  loadingText.style.marginLeft = '8px';
  loadingText.style.animation = 'fadeinout 2s infinite';

  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes fadeinout {
      0%, 100% { opacity: 0; }
      50% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  loadingContainer.appendChild(spinner);
  loadingContainer.appendChild(loadingText);

  return loadingContainer;
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
  document.body.appendChild(popover);

  let ratingColor = 'green';
  if (result <= 3) ratingColor = 'red';
  else if (result <= 6) ratingColor = 'orange';

  popover.innerHTML += `
    <h2 style="color: ${ratingColor}; margin-top: 0;">Rating: ${result}/10</h2>
    <p>${explanation}</p>
    <button style="cursor: pointer; padding: 6px 12px; font-size: 14px; color: #fff; background-color: #2196f3; border: none; border-radius: 4px;">Done</button>
  `;

  popover.style.display = 'block';
  popover.style.left = `400px`; // 400
  popover.style.top = `100px`; // 100

  const doneButton = popover.querySelector('button');
  doneButton.addEventListener('click', () => {
    popover.style.display = 'none';
  });
}

// Function to analyze the review using OpenAI API
async function analyzeReview(reviewText, rating, time, analyzeButton) {
  const popover = createPopoverContainer();
  document.body.appendChild(popover);
  popover.style.display = 'block';
  const loadingAnimation = createLoadingAnimation();
  popover.style.left = `400px`;
  popover.style.top = `100px`;
  popover.appendChild(loadingAnimation);

  message = { action: 'analyze_review', place: placeInfo, text: reviewText, rating: rating, time: time };
  console.log(message);
  chrome.runtime.sendMessage(message, (response) => {
    if (response.success) {
      popover.remove();
      const newpopover = createPopoverContainer();
      console.log(response.result);
      showPopoverContainer(newpopover, analyzeButton, response.result.rate, response.result.explanation);
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
      time = review.querySelector('div.DU9Pgb').outerText.split('\n')[0];
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
