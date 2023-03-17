// Function to create the "Analyze the review" option
function createAnalyzeButton(reviewText) {
    const analyzeButton = document.createElement('button');
    analyzeButton.textContent = 'Analyze';
    analyzeButton.style.cursor = 'pointer';
    analyzeButton.style.padding = '6px 12px';
    analyzeButton.style.fontSize = '14px';
    analyzeButton.style.color = '#ffffff';
    analyzeButton.style.backgroundColor = '#9e9e9e';
    analyzeButton.style.border = 'none';
    analyzeButton.style.borderRadius = '4px';
    analyzeButton.style.marginRight = '8px';
    analyzeButton.addEventListener('click', () => analyzeReview(reviewText));
    return analyzeButton;
  }
  
  
  // Function to analyze the review using OpenAI API
  async function analyzeReview(reviewText) {
    const response = await chrome.runtime.sendMessage({ action: 'analyze_review', text: reviewText });
  
    if (response.success) {
      alert(`Analysis result: ${response.result}`);
    } else {
      alert('Failed to analyze the review. Please try again later.');
    }
  }
  
  // Function to add "Analyze the review" option to review menus
  function addAnalyzeButtonToMenus() {
    const reviewMenus = document.querySelectorAll('button.PP3Y3d.S1qRNe');
  
    for (const menu of reviewMenus) {
      if (!menu.previousElementSibling || !menu.previousElementSibling.classList.contains('analyze-review-button')) {
        const analyzeButton = createAnalyzeButton('reviewText');
        analyzeButton.classList.add('analyze-review-button');

        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.justifyContent = 'flex-end';
        wrapper.classList.add('analyze-review-wrapper');

        menu.parentNode.insertBefore(wrapper, menu);
        wrapper.appendChild(analyzeButton);
        wrapper.appendChild(menu);
      }
    }
  }
  
  // Periodically check for new review menus and add the "Analyze the review" option
  setInterval(addAnalyzeButtonToMenus, 1000);
  