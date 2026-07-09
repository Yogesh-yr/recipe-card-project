// ===========================================================
// Interactive Recipe Card — script.js
// Handles: collapse/expand toggles, "Start Cooking" step
// sequencing, the cake-layer progress indicator, the bonus
// countdown timer, print, and reset.
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {

  const TOTAL_PREP_SECONDS = 30 * 60; // 30 minutes, matches header

  // ---- element refs ----
  const toggleIngredientsBtn = document.getElementById('toggleIngredients');
  const toggleIngredientsLabel = document.getElementById('toggleIngredientsLabel');
  const ingredientsList = document.getElementById('ingredientsList');

  const toggleStepsBtn = document.getElementById('toggleSteps');
  const toggleStepsLabel = document.getElementById('toggleStepsLabel');
  const stepsList = document.getElementById('stepsList');

  const startCookingBtn = document.getElementById('startCookingBtn');
  const nextStepBtn = document.getElementById('nextStepBtn');
  const resetBtn = document.getElementById('resetBtn');
  const printBtn = document.getElementById('printBtn');

  const stepItems = Array.from(stepsList.querySelectorAll('li'));
  const layers = Array.from(document.querySelectorAll('.layer'));
  const progressStepText = document.getElementById('progressStepText');

  const timerBox = document.getElementById('timerBox');
  const timerValue = document.getElementById('timerValue');
  const timerFill = document.getElementById('timerFill');

  const liveMessage = document.getElementById('liveMessage');

  let currentStepIndex = -1; // -1 = not started
  let timerInterval = null;
  let secondsRemaining = TOTAL_PREP_SECONDS;

  // -----------------------------------------------------------
  // Toggle: ingredients
  // -----------------------------------------------------------
  toggleIngredientsBtn.addEventListener('click', () => {
    const isOpen = ingredientsList.classList.toggle('open');
    toggleIngredientsBtn.setAttribute('aria-expanded', String(isOpen));
    toggleIngredientsLabel.textContent = isOpen ? 'Hide ingredients' : 'Show ingredients';
  });

  // -----------------------------------------------------------
  // Toggle: steps
  // -----------------------------------------------------------
  toggleStepsBtn.addEventListener('click', () => {
    const isOpen = stepsList.classList.toggle('open');
    toggleStepsBtn.setAttribute('aria-expanded', String(isOpen));
    toggleStepsLabel.textContent = isOpen ? 'Hide steps' : 'Show steps';
  });

  // -----------------------------------------------------------
  // Layer progress (signature element)
  // -----------------------------------------------------------
  function updateLayerProgress() {
    layers.forEach((layer, i) => {
      layer.classList.remove('filled', 'current');
      if (i < currentStepIndex) {
        layer.classList.add('filled');
      } else if (i === currentStepIndex) {
        layer.classList.add('filled', 'current');
      }
    });
    const completed = Math.max(currentStepIndex + 1, 0);
    progressStepText.textContent = `${completed} / ${stepItems.length} steps`;
  }

  // -----------------------------------------------------------
  // Step highlighting
  // -----------------------------------------------------------
  function setActiveStep(index) {
    stepItems.forEach((li, i) => {
      li.classList.remove('active', 'done');
      if (i < index) li.classList.add('done');
      if (i === index) li.classList.add('active');
    });
    updateLayerProgress();

    if (index >= 0 && index < stepItems.length) {
      const text = stepItems[index].querySelector('.step-text').textContent;
      liveMessage.textContent = `Step ${index + 1}: ${text}`;
      stepItems[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // -----------------------------------------------------------
  // Start cooking
  // -----------------------------------------------------------
  startCookingBtn.addEventListener('click', () => {
    // make sure the steps are visible so the highlight is seen
    if (!stepsList.classList.contains('open')) {
      stepsList.classList.add('open');
      toggleStepsBtn.setAttribute('aria-expanded', 'true');
      toggleStepsLabel.textContent = 'Hide steps';
    }

    currentStepIndex = 0;
    setActiveStep(currentStepIndex);

    startCookingBtn.disabled = true;
    startCookingBtn.textContent = 'Cooking…';
    nextStepBtn.disabled = false;

    startTimer();
  });

  // -----------------------------------------------------------
  // Next step
  // -----------------------------------------------------------
  nextStepBtn.addEventListener('click', () => {
    if (currentStepIndex < stepItems.length - 1) {
      currentStepIndex++;
      setActiveStep(currentStepIndex);
    }

    if (currentStepIndex === stepItems.length - 1) {
      // last step reached — mark done on the click after showing it
      nextStepBtn.textContent = 'Finish';
      nextStepBtn.addEventListener('click', finishCooking, { once: true });
    }
  });

  function finishCooking() {
    currentStepIndex = stepItems.length; // past the end -> all done
    stepItems.forEach(li => { li.classList.remove('active'); li.classList.add('done'); });
    layers.forEach(l => { l.classList.add('filled'); l.classList.remove('current'); });
    progressStepText.textContent = `${stepItems.length} / ${stepItems.length} steps`;
    nextStepBtn.disabled = true;
    nextStepBtn.textContent = 'Next step';
    startCookingBtn.textContent = 'Recipe complete';
    liveMessage.textContent = 'Recipe complete. Enjoy your cake!';
    stopTimer();
  }

  // -----------------------------------------------------------
  // Bonus: countdown timer
  // -----------------------------------------------------------
  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function startTimer() {
    timerBox.hidden = false;
    secondsRemaining = TOTAL_PREP_SECONDS;
    timerValue.textContent = formatTime(secondsRemaining);
    timerFill.style.width = '100%';

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      secondsRemaining--;
      if (secondsRemaining <= 0) {
        secondsRemaining = 0;
        clearInterval(timerInterval);
        timerValue.textContent = "Time's up";
      } else {
        timerValue.textContent = formatTime(secondsRemaining);
      }
      const pct = (secondsRemaining / TOTAL_PREP_SECONDS) * 100;
      timerFill.style.width = pct + '%';
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  // -----------------------------------------------------------
  // Reset
  // -----------------------------------------------------------
  resetBtn.addEventListener('click', () => {
    currentStepIndex = -1;
    stepItems.forEach(li => li.classList.remove('active', 'done'));
    layers.forEach(l => l.classList.remove('filled', 'current'));
    progressStepText.textContent = `0 / ${stepItems.length} steps`;

    startCookingBtn.disabled = false;
    startCookingBtn.textContent = 'Start cooking';
    nextStepBtn.disabled = true;
    nextStepBtn.textContent = 'Next step';

    stopTimer();
    timerBox.hidden = true;
    secondsRemaining = TOTAL_PREP_SECONDS;
    timerFill.style.width = '100%';

    liveMessage.textContent = 'Recipe reset.';
  });

  // -----------------------------------------------------------
  // Bonus: print-friendly view
  // -----------------------------------------------------------
  printBtn.addEventListener('click', () => {
    // ensure content is visible before printing
    ingredientsList.classList.add('open');
    stepsList.classList.add('open');
    window.print();
  });

});
