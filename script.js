// GLobal Variables

// Global variables for tracking completion
let completedExercises = JSON.parse(localStorage.getItem('completedExercises') || '{}');
let moduleProgress = JSON.parse(localStorage.getItem('moduleProgress') || '{}');

// Intro pages that should never be marked as completed
const INTRO_PAGES = ['index.html', 'hinweise.html'];

document.addEventListener('DOMContentLoaded', function () {
  const courseCards = document.querySelectorAll('.course-card.toggleable');

  // Kurskarte öffnen/schließen
  courseCards.forEach(card => {
    const moduleButton = card.querySelector('.show-modules-button');
    const courseLink = card.querySelector('.nav-button');

    // Klicks auf Buttons nicht zum Eltern-Card-Klick durchreichen
    [moduleButton, courseLink].forEach(el => {
      if (el) {
        el.addEventListener('click', e => e.stopPropagation());
      }
    });

    card.addEventListener('click', function () {
      if (card.classList.contains('disabled')) return;

      const isExpanded = card.classList.contains('expanded');
      courseCards.forEach(c => c.classList.remove('expanded'));

      if (!isExpanded) {
        card.classList.add('expanded');
      }
    });

    // Overlay öffnen (über Klasse)
    if (moduleButton) {
      moduleButton.addEventListener('click', () => {
        const wrapper = card.closest('.course-cards-wrapper');
        wrapper.classList.add('active');
      });
    }
  });

  // Overlay schließen
  document.querySelectorAll('.close-overlay').forEach(button => {
    button.addEventListener('click', () => {
      const wrapper = button.closest('.course-cards-wrapper');
      wrapper.classList.remove('active');
    });
  });
});


// Module configuration - defines what exercises are required for each module
const MODULE_CONFIG = {
  'modul1': {
    exercises: [
      '1_1_modul1_allgemeine_definition.html',
      '1_2_modul1_gesetzliche_definition.html',
      '1_3_modul1_lueckentext.html',
      '1_4_modul1_quiz.html',
    ],
    requiredPercentage: 80,
    nextModule: 'modul2'
  },
  'modul2': {
    exercises: [
      '2_1_modul2_barrieren_reflexion.html',
      '2_2_modul2_barrieren_sind_ueberall.html',
      '2_3_modul2_digitale_medien.html',
      // Add more exercises as they become available
    ],
    requiredPercentage: 80,
    nextModule: 'modul3'
  },
  'modul3': {
    exercises: [
      // Will be populated when modul3 content is available
    ],
    requiredPercentage: 80,
    nextModule: null
  }
};

// Page type configuration - defines how each page type should be marked as completed
const PAGE_TYPES = {
  'content': ['1_1_modul1_allgemeine_definition.html', '1_2_modul1_gesetzliche_definition.html', '1_3_modul1_soziale_praktische_aspekte.html',
    '1_4_modul1_bezug_zur_nachhaltigkeit.html', '2_1_modul2_barrieren_reflexion.html', '2_2_modul2_barrieren_sind_ueberall.html', '2_3_modul2_digitale_medien.html'],
  'quiz': ['1_7_modul1_quiz.html', '2_5_modul2_quiz.html'],
  'fillInTheBlanks': ['1_6_modul1_lueckentext.html']
};

// Page Progress Tracking
document.addEventListener("DOMContentLoaded", function () {
  const modulPages = {
    modul1: [
      "1_0_modul1_inhaltsverzeichnis.html",
      "1_1_modul1_allgemeine_definition.html",
      "1_2_modul1_gesetzliche_definition.html",
      "1_3_modul1_soziale_praktische_aspekte.html",
      "1_4_modul1_bezug_zur_nachhaltigkeit.html",
      "1_5_modul1_teste_dein_wissen.html",
      "1_6_modul1_lueckentext.html",
      "1_7_modul1_quiz.html",
      "1_8_modul1_testergebnis.html"
    ],
    modul2: [
      "2_0_modul2_inhaltsverzeichnis.html",
      "2_1_modul2_barrieren_reflexion.html",
      "2_2_modul2_barrieren_sind_ueberall.html",
      "2_3_modul2_digitale_medien.html",
      "2_4_modul2_teste_dein_wissen.html",
      "2_5_modul2_quiz.html",
      "2_6_modul2_lueckentext.html",
      "2_7_modul2_drag_and_drop_quiz.html",
      "2_8_modul2_testergebnis.html"
    ]
  };

  const path = window.location.pathname;
  const currentPage = path.substring(path.lastIndexOf("/") + 1);

  let activeModule = null;
  let activePages = [];

  // Determine which module the page belongs to
  for (const [module, pages] of Object.entries(modulPages)) {
    if (pages.includes(currentPage)) {
      activeModule = module;
      activePages = pages;
      break;
    }
  }

  // Only proceed if the page is part of a known module
  if (activeModule && activePages.length > 0) {
    const currentIndex = activePages.indexOf(currentPage);
    const completedPages = currentIndex > 0 ? currentIndex : 0;
    const progressPercent = (completedPages / activePages.length) * 100;

    const fill = document.getElementById("inhalt-progress-fill");
    const text = document.getElementById("inhalt-progress-text");

    if (fill) {
      fill.style.width = progressPercent + "%";
    }

    if (text) {
      text.textContent = `${completedPages} von ${activePages.length} Seiten abgeschlossen`;
    }
  }
});


// Reset progress on page reload (for prototyping)
function resetProgressOnReload() {
  // Check if this is a page reload (not a navigation)
  if (performance.navigation.type === 1) {
    // Clear all progress data
    localStorage.removeItem('completedExercises');
    localStorage.removeItem('moduleProgress');
    completedExercises = {};
    moduleProgress = {};
    console.log('Progress reset on page reload');
  }
}

// Call reset function on page load
resetProgressOnReload();

// Enhanced Progress Tracking System
class EnhancedProgressTracker {
  constructor() {
    this.currentModule = this.getCurrentModule();
    this.currentPage = this.getCurrentPage();
    this.pageType = this.getPageType();
    this.initializeProgressTracking();
  }

  getCurrentModule() {
    const currentPage = window.location.pathname;
    if (currentPage.includes('modul1')) return 'modul1';
    if (currentPage.includes('modul2')) return 'modul2';
    if (currentPage.includes('modul3')) return 'modul3';
    return null;
  }

  getCurrentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  getPageType() {
    const currentPage = this.getCurrentPage();
    if (PAGE_TYPES.quiz.includes(currentPage)) return 'quiz';
    if (PAGE_TYPES.fillInTheBlanks.includes(currentPage)) return 'fillInTheBlanks';
    if (PAGE_TYPES.content.includes(currentPage)) return 'content';
    return 'content'; // Default to content type
  }

  initializeProgressTracking() {
    this.updateModuleProgress();
    this.controlModuleNavigation();
    this.displayModuleProgress();
    this.highlightCompletedExercises();
    this.setupContentPageTracking();
  }

  setupContentPageTracking() {
    // For content pages, mark as completed when user clicks "Weiter"
    // But skip intro pages
    if (this.pageType === 'content' && !INTRO_PAGES.includes(this.currentPage)) {
      const nextButtons = document.querySelectorAll('.nav-button.next-button');
      nextButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          this.markPageAsCompleted(this.currentPage, 100);
        });
      });
    }
  }

  markPageAsCompleted(pagePath, score = 100) {
    // Nur Dateiname ohne Query oder Hash extrahieren
    const cleanPath = pagePath.split('?')[0].split('#')[0];

    if (INTRO_PAGES.includes(cleanPath)) {
      console.log(`Skipping completion tracking for intro page: ${cleanPath}`);
      return;
    }

    const isPassed = score >= 80;

    completedExercises[cleanPath] = {
      completed: isPassed,
      score: score,
      completedAt: new Date().toISOString(),
      pageType: this.pageType
    };

    localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
    this.updateModuleProgress();
    this.controlModuleNavigation();
    this.displayModuleProgress();
    this.highlightCompletedExercises();
  }


  calculateModuleProgress(moduleName) {
    const moduleConfig = MODULE_CONFIG[moduleName];
    if (!moduleConfig) return 0;

    const totalExercises = moduleConfig.exercises.length;
    if (totalExercises === 0) return 0;

    let completedCount = 0;
    moduleConfig.exercises.forEach(exercise => {
      if (completedExercises[exercise] && completedExercises[exercise].completed) {
        completedCount++;
      }
    });

    return Math.round((completedCount / totalExercises) * 100);
  }

  updateModuleProgress() {
    if (!this.currentModule) return;

    const progress = this.calculateModuleProgress(this.currentModule);
    moduleProgress[this.currentModule] = {
      percentage: progress,
      lastUpdated: new Date().toISOString(),
      exercises: MODULE_CONFIG[this.currentModule].exercises
    };

    localStorage.setItem('moduleProgress', JSON.stringify(moduleProgress));
  }

  controlModuleNavigation() {
    const currentModuleConfig = MODULE_CONFIG[this.currentModule];
    if (!currentModuleConfig) return;

    const progress = this.calculateModuleProgress(this.currentModule);
    const requiredPercentage = currentModuleConfig.requiredPercentage;

    // Control navigation to next module
    const nextModuleLinks = document.querySelectorAll(`a[href*="${currentModuleConfig.nextModule}"]`);
    nextModuleLinks.forEach(link => {
      if (progress >= requiredPercentage) {
        link.classList.remove("disabled");
        link.removeAttribute("aria-disabled");
        link.style.pointerEvents = "auto";
        link.style.opacity = "1";
        link.title = `Weiter zu ${currentModuleConfig.nextModule}`;
      } else {
        link.classList.add("disabled");
        link.setAttribute("aria-disabled", "true");
        link.style.pointerEvents = "none";
        link.style.opacity = "0.5";
        link.title = `Mindestens ${requiredPercentage}% von Modul ${this.currentModule} erforderlich (aktuell: ${progress}%)`;
      }
    });

    // Control navigation within current module
    const currentModuleLinks = document.querySelectorAll(`a[href*="${this.currentModule}"]`);
    currentModuleLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && completedExercises[href] && completedExercises[href].completed) {
        link.classList.remove("disabled");
        link.removeAttribute("aria-disabled");
        link.style.pointerEvents = "auto";
        link.style.opacity = "1";
      }
    });
  }

  displayModuleProgress() {
    if (!this.currentModule) return;

    const progress = this.calculateModuleProgress(this.currentModule);
    const moduleConfig = MODULE_CONFIG[this.currentModule];

    // Create or update progress indicator in sidebar
    let progressIndicator = document.getElementById('module-progress-indicator');
    if (!progressIndicator) {
      progressIndicator = document.createElement('div');
      progressIndicator.id = 'module-progress-indicator';
      progressIndicator.className = 'module-progress-indicator';

      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        // Insert after the nav element
        const nav = sidebar.querySelector('nav');
        if (nav) {
          nav.insertAdjacentElement('afterend', progressIndicator);
        }
      }
    }

    const completedCount = moduleConfig.exercises.filter(exercise =>
      completedExercises[exercise] && completedExercises[exercise].completed
    ).length;

    progressIndicator.innerHTML = `
      <div class="progress-header">
        <h3>Modul Fortschritt: ${progress}%</h3>
        <p>${completedCount} von ${moduleConfig.exercises.length} Übungen abgeschlossen</p>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="progress-requirements">
        <p>Für das nächste Modul benötigt: ${moduleConfig.requiredPercentage}%</p>
        ${progress >= moduleConfig.requiredPercentage ?
        '<p class="requirement-met">✅ Anforderungen erfüllt - Sie können zum nächsten Modul weitergehen!</p>' :
        '<p class="requirement-pending">⏳ Anforderungen noch nicht erfüllt</p>'
      }
      </div>
    `;
  }

  highlightCompletedExercises() {
    const navLinks = document.querySelectorAll('.sidebar nav a');
    const currentPath = window.location.pathname.split("/").pop();

    navLinks.forEach(link => {
      const href = link.getAttribute('href');

      // remove all completion classes and attributes
      link.classList.remove('completed', 'completed-quiz', 'completed-content');
      link.removeAttribute('aria-current');
      link.title = "";

      // mark current page
      if (href === currentPath) {
        link.setAttribute("aria-current", "page");
      }

      // skip intro pages
      if (href && INTRO_PAGES.includes(href)) return;

      // mark completed exercises
      if (href && completedExercises[href]) {
        const completionData = completedExercises[href];

        if (completionData.completed) {
          if (completionData.pageType === 'quiz' || completionData.pageType === 'fillInTheBlanks') {
            link.classList.add('completed', 'completed-quiz');
            link.title = `Abgeschlossen – ${completionData.score}% erreicht`;
          } else {
            link.classList.add('completed', 'completed-content');
            link.title = 'Abgeschlossen';
          }
        }
      }
    });
  }

}



document.addEventListener("DOMContentLoaded", () => {
  // --- Media Tabs Setup ---
  const buttons = document.querySelectorAll(".tabs button");
  const mediaItems = {
    "Video": document.getElementById("video-content"),
    "Audio": document.getElementById("audio-content"),
    "Text": document.getElementById("text-content"),
  };

  let firstAvailable = null;

  // Tabs deaktivieren, wenn Inhalt leer ist
  buttons.forEach(button => {
    const label = button.textContent.trim();
    const mediaItem = mediaItems[label];

    const isEmpty = !mediaItem || mediaItem.querySelectorAll("img, audio, video, p").length === 0;

    if (isEmpty) {
      button.disabled = true;
      button.classList.add("disabled");
    } else if (!firstAvailable) {
      firstAvailable = { tab: button, mediaItem };
    }
  });

  // Ersten verfügbaren Tab aktivieren
  if (firstAvailable) {
    firstAvailable.tab.classList.add("active");
    firstAvailable.mediaItem.classList.remove("hidden");
  }

  // Klick-Listener für Tabs
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      if (button.disabled) return;

      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      Object.values(mediaItems).forEach(item => {
        if (item) item.classList.add("hidden");
      });

      const label = button.textContent.trim();
      if (mediaItems[label]) {
        mediaItems[label].classList.remove("hidden");
      }
    });
  });


  // --- Initialisierung von Quiz & Fortschritt ---
  if (typeof QuizEvaluator === "function") new QuizEvaluator();
  if (typeof FillInTheBlanksEvaluator === "function") new FillInTheBlanksEvaluator();
  if (typeof EnhancedProgressTracker === "function") new EnhancedProgressTracker();
});


// Quiz Evaluation System
class QuizEvaluator {
  constructor() {
    this.quizForm = document.getElementById("quiz-form");
    this.initializeQuiz();
  }

  initializeQuiz() {
    if (this.quizForm) {
      this.quizForm.addEventListener("submit", (e) => this.handleQuizSubmit(e));
      this.updateProgressDisplay();
    }
  }

  updateProgressDisplay() {
    const progressElement = document.querySelector('p[style*="margin-top: 3rem"]');
    if (progressElement) {
      const totalQuestions = this.getTotalQuestions();
      const currentQuestion = this.getCurrentQuestion();
      progressElement.textContent = `Fortschritt: Frage ${currentQuestion} von ${totalQuestions}`;
    }
  }

  getTotalQuestions() {
    const questionGroups = document.querySelectorAll('fieldset');
    return questionGroups.length;
  }

  getCurrentQuestion() {
    // For now, assuming single question quizzes
    return 1;
  }

  handleQuizSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.quizForm);
    const answers = this.collectAnswers(formData);
    const results = this.evaluateAnswers(answers);

    this.displayFeedback(results);
    this.updateNavigation(results.allCorrect);
    this.saveCompletionStatus(results.allCorrect);

    // Update module progress after completion
    if (results.score >= 80) {
      new EnhancedProgressTracker().markPageAsCompleted(window.location.pathname, results.score);
    }
  }

  collectAnswers(formData) {
    const answers = {};
    const questionGroups = document.querySelectorAll('fieldset');

    questionGroups.forEach((fieldset, index) => {
      const questionName = `question${index + 1}`;
      const inputs = fieldset.querySelectorAll('input');

      // Prüfen, ob es sich um eine Checkbox-Gruppe handelt
      const isMultiple = Array.from(inputs).some(input => input.type === 'checkbox');

      if (isMultiple) {
        answers[questionName] = formData.getAll(questionName); // gibt ein Array
      } else {
        const singleAnswer = formData.get(questionName);
        answers[questionName] = singleAnswer ? [singleAnswer] : [];
      }
    });

    return answers;
  }


  evaluateAnswers(answers) {
    const correctAnswers = this.getCorrectAnswers();
    let allCorrect = true;
    let feedback = [];

    Object.keys(answers).forEach(questionName => {
      const userAnswer = answers[questionName];
      const correct = correctAnswers[questionName];

      if (!userAnswer || userAnswer.length === 0) {
        allCorrect = false;
        feedback.push(`Frage ${questionName.replace('question', '')}: Bitte wähle eine Antwort aus.`);
        return;
      }

      // Sortiere für sauberen Vergleich
      const sortedUser = [...userAnswer].sort().join('');
      const sortedCorrect = [...correct].sort().join('');

      if (sortedUser === sortedCorrect) {
        feedback.push(`✅ Frage ${questionName.replace('question', '')}: Richtig!`);
      } else {
        allCorrect = false;
        feedback.push(`❌ Frage ${questionName.replace('question', '')}: Falsch. Richtige Antwort(en): ${correct.join(', ')}`);
      }
    });

    return {
      allCorrect,
      feedback: feedback.join('\n'),
      score: this.calculateScore(answers, correctAnswers)
    };
  }


  getCorrectAnswers() {
    const currentPage = window.location.pathname;

    if (currentPage.includes('modul2_quiz.html')) {
      return {
        question1: ['C'],           // Single Choice
        question2: ['A', 'B', 'D'], // Multiple Choice
        question3: ['B'],           // Single Choice
        question4: ['C']            // Single Choice
      };
    } else if (currentPage.includes('modul1_quiz.html')) {
      return {
        question1: ['B']
      };
    }

    return {};
  }


  calculateScore(answers, correctAnswers) {
    let correctCount = 0;
    const total = Object.keys(correctAnswers).length;

    Object.keys(correctAnswers).forEach(questionName => {
      const userAnswer = answers[questionName] || [];
      const correctAnswer = correctAnswers[questionName];

      const sortedUser = [...userAnswer].sort().join('');
      const sortedCorrect = [...correctAnswer].sort().join('');

      if (sortedUser === sortedCorrect) {
        correctCount++;
      }
    });

    return Math.round((correctCount / total) * 100);
  }


  displayFeedback(results) {
    const feedbackElement = document.getElementById("feedback");
    if (feedbackElement) {
      feedbackElement.textContent = results.feedback;
      feedbackElement.style.color = results.allCorrect ? "#2ecc71" : "#e74c3c";
      feedbackElement.style.fontWeight = "bold";
      feedbackElement.style.marginTop = "1rem";

      // Add score display
      if (results.score !== undefined) {
        const scoreText = `\n\nPunktzahl: ${results.score}%`;
        feedbackElement.textContent += scoreText;
      }
    }
  }

  updateNavigation(allCorrect) {
    const nextLink = document.getElementById("next-link");
    if (nextLink) {
      // Calculate score to check if 80% threshold is met
      const formData = new FormData(this.quizForm);
      const answers = this.collectAnswers(formData);
      const correctAnswers = this.getCorrectAnswers();
      const score = this.calculateScore(answers, correctAnswers);

      if (score >= 80) {
        nextLink.classList.remove("disabled");
        nextLink.removeAttribute("aria-disabled");
        nextLink.style.pointerEvents = "auto";
        nextLink.style.opacity = "1";
        nextLink.title = `Weiter (${score}% erreicht)`;
      } else {
        nextLink.classList.add("disabled");
        nextLink.setAttribute("aria-disabled", "true");
        nextLink.style.pointerEvents = "none";
        nextLink.style.opacity = "0.5";
        nextLink.title = `Mindestens 80% erforderlich (aktuell: ${score}%)`;
      }
    }
  }

  saveCompletionStatus(allCorrect) {
    const currentPage = window.location.pathname;
    // Calculate score to check if 80% threshold is met
    const formData = new FormData(this.quizForm);
    const answers = this.collectAnswers(formData);
    const correctAnswers = this.getCorrectAnswers();
    const score = this.calculateScore(answers, correctAnswers);

    if (score >= 80) {
      completedExercises[currentPage] = {
        completed: true,
        timestamp: new Date().toISOString(),
        type: 'quiz',
        score: score
      };
      localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
    }
  }
}

// Fill-in-the-blanks Evaluation System
class FillInTheBlanksEvaluator {
  constructor() {
    this.validateButton = document.getElementById('validate-button');
    this.initializeFillInTheBlanks();
  }

  initializeFillInTheBlanks() {
    if (this.validateButton) {
      this.validateButton.addEventListener('click', () => this.handleValidation());
    }
  }

  handleValidation() {
    const selects = document.querySelectorAll('section.fill-in-the-blanks select');
    const results = this.evaluateAnswers(selects);

    this.displayFeedback(results);
    this.updateNavigation(results.allCorrect);
    this.saveCompletionStatus(results.allCorrect);

    // Update module progress after completion
    if (results.score >= 80) {
      new EnhancedProgressTracker().markPageAsCompleted(window.location.pathname, results.score);
    }
  }

  evaluateAnswers(selects) {
    let allCorrect = true;
    let allFilled = true;
    let feedback = [];

    selects.forEach((select, index) => {
      const userAnswer = select.value.trim();
      const correctAnswer = select.dataset.solution.trim();

      if (userAnswer === "") {
        allFilled = false;
        select.style.borderColor = "#f39c12"; // orange
        feedback.push(`Lücke ${index + 1}: Bitte fülle diese Lücke aus.`);
      } else if (userAnswer.toLowerCase() !== correctAnswer.toLowerCase()) {
        allCorrect = false;
        select.style.borderColor = "#e74c3c"; // red
        feedback.push(`Lücke ${index + 1}: Falsch. Die richtige Antwort ist: ${correctAnswer}.`);
      } else {
        select.style.borderColor = "#2ecc71"; // green
        feedback.push(`✅ Lücke ${index + 1}: Richtig!`);
      }
    });

    return {
      allCorrect: allCorrect && allFilled,
      allFilled,
      feedback: feedback.join('\n'),
      score: this.calculateScore(selects)
    };
  }

  calculateScore(selects) {
    let correct = 0;
    let total = selects.length;

    selects.forEach(select => {
      const userAnswer = select.value.trim();
      const correctAnswer = select.dataset.solution.trim();

      if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        correct++;
      }
    });

    return Math.round((correct / total) * 100);
  }

  displayFeedback(results) {
    const feedback = document.getElementById('feedback');
    if (feedback) {
      if (!results.allFilled) {
        feedback.textContent = "Bitte fülle alle Lücken aus.";
        feedback.style.color = "#f39c12";
      } else if (results.allCorrect) {
        feedback.textContent = "✅ Richtig! Alle Antworten sind korrekt.";
        feedback.style.color = "#2ecc71";

        // Add score display
        if (results.score !== undefined) {
          feedback.textContent += `\n\nPunktzahl: ${results.score}%`;
        }
      } else {
        feedback.textContent = "Nicht ganz richtig. Versuche es noch einmal.\n\n" + results.feedback;
        feedback.style.color = "#e74c3c";

        // Add score display
        if (results.score !== undefined) {
          feedback.textContent += `\n\nPunktzahl: ${results.score}%`;
        }
      }

      feedback.style.fontWeight = "bold";
      feedback.style.marginTop = "1rem";
    }
  }

  updateNavigation(allCorrect) {
    const nextLink = document.querySelector('.nav-buttons a.button-secondary:last-of-type');
    if (nextLink) {
      // Calculate score to check if 80% threshold is met
      const selects = document.querySelectorAll('section.fill-in-the-blanks select');
      const score = this.calculateScore(selects);

      if (score >= 80) {
        nextLink.classList.remove("disabled");
        nextLink.removeAttribute("aria-disabled");
        nextLink.style.pointerEvents = "auto";
        nextLink.style.opacity = "1";
        nextLink.title = `Weiter (${score}% erreicht)`;
      } else {
        nextLink.classList.add("disabled");
        nextLink.setAttribute("aria-disabled", "true");
        nextLink.style.pointerEvents = "none";
        nextLink.style.opacity = "0.5";
        nextLink.title = `Mindestens 80% erforderlich (aktuell: ${score}%)`;
      }
    }
  }

  saveCompletionStatus(allCorrect) {
    const currentPage = window.location.pathname;
    // Calculate score to check if 80% threshold is met
    const selects = document.querySelectorAll('section.fill-in-the-blanks select');
    const score = this.calculateScore(selects);

    if (score >= 80) {
      completedExercises[currentPage] = {
        completed: true,
        timestamp: new Date().toISOString(),
        type: 'fill-in-the-blanks',
        score: score
      };
      localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
    }
  }
}

// Drag and Drop Functionality

document.addEventListener("DOMContentLoaded", () => {
  const draggables = document.querySelectorAll(".draggable");
  const dropzones = document.querySelectorAll(".dropzone");
  const feedback = document.getElementById("drop-feedback");

  draggables.forEach(draggable => {
    // Mausbedienung
    draggable.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", draggable.dataset.id);
    });

    // Tastaturbedienung
    draggable.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        draggable.classList.add("dragging");
        draggable.setAttribute("aria-grabbed", "true");
      }
    });

    draggable.addEventListener("keyup", e => {
      if ((e.key === "Enter" || e.key === " ") && draggable.classList.contains("dragging")) {
        draggable.classList.remove("dragging");
        draggable.setAttribute("aria-grabbed", "false");
      }
    });
  });

  dropzones.forEach(dropzone => {
    // Drag & Drop mit Maus
    dropzone.addEventListener("dragover", e => e.preventDefault());

    dropzone.addEventListener("drop", e => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData("text/plain");
      handleDrop(dropzone, draggedId);
    });

    // Tastatur: per Enter loslassen
    dropzone.addEventListener("keydown", e => {
      if ((e.key === "Enter" || e.key === " ") && document.querySelector(".dragging")) {
        const dragged = document.querySelector(".dragging");
        handleDrop(dropzone, dragged.dataset.id);
        dragged.classList.remove("dragging");
        dragged.setAttribute("aria-grabbed", "false");
      }
    });
  });

  function handleDrop(zone, draggedId) {
    const correct = zone.dataset.accept === draggedId;
    zone.textContent = zone.textContent + ` (${draggedId})`;
    zone.classList.add(correct ? "correct" : "incorrect");

    // Deaktivieren weiterer Drops
    zone.setAttribute("tabindex", "-1");
    zone.setAttribute("aria-disabled", "true");

    const remaining = document.querySelectorAll(".dropzone:not(.correct):not(.incorrect)");
    if (remaining.length === 0) {
      feedback.textContent = "✅ Alle Zuordnungen abgeschlossen!";
      feedback.style.color = "#2ecc71";
      document.getElementById("next-link").classList.remove("disabled");
      document.getElementById("next-link").removeAttribute("aria-disabled");
    }
  }
});


// Initialize Functions

// Utility function to check if exercise is completed
function isExerciseCompleted(pagePath) {
  return completedExercises[pagePath] && completedExercises[pagePath].completed;
}

// Utility function to get completion data
function getCompletionData(pagePath) {
  return completedExercises[pagePath] || null;
}

// Utility function to get module progress
function getModuleProgress(moduleName) {
  return moduleProgress[moduleName] || { percentage: 0 };
}

// Utility function to check if module requirements are met
function isModuleRequirementsMet(moduleName) {
  const progress = getModuleProgress(moduleName);
  const config = MODULE_CONFIG[moduleName];
  return config && progress.percentage >= config.requiredPercentage;
}

// Note Funktion
document.addEventListener("DOMContentLoaded", function () {
  const addNoteBtn = document.getElementById("add-note");
  const notesContainer = document.getElementById("notes-container");
  // Kann man dann noch auf die einzelnen Module anwenden
  const storageKey = "global_notes";

  // save
  function saveNotes() {
    const notes = [];
    notesContainer.querySelectorAll("textarea").forEach(textarea => {
      const text = textarea.value.trim();
      if (text !== "") {
        notes.push(text);
      }
    });
    localStorage.setItem(storageKey, JSON.stringify(notes));
  }

  // make note
  function createNote(content = "") {
    const note = document.createElement("div");
    note.className = "note";

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-note";
    deleteButton.innerHTML = "✕";
    deleteButton.title = "Notiz löschen";

    deleteButton.addEventListener("click", () => {
      notesContainer.removeChild(note);
      saveNotes();
    });

    const textarea = document.createElement("textarea");
    textarea.placeholder = "Deine Notiz...";
    textarea.value = content;

    textarea.addEventListener("input", saveNotes);

    note.appendChild(deleteButton);
    note.appendChild(textarea);
    notesContainer.appendChild(note);
  }

  function loadNotes() {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      JSON.parse(saved).forEach(text => createNote(text));
    }
  }

  addNoteBtn.addEventListener("click", () => {
    createNote();
    saveNotes();
  });

  // load notes 
  loadNotes();
});

document.addEventListener("DOMContentLoaded", () => {
  const nextButton = document.querySelector(".next-button");
  if (nextButton) {
    nextButton.addEventListener("click", () => {
      const currentPage = window.location.pathname.split("/").pop();

      // Mark current page as completed (as content)
      completedExercises[currentPage] = {
        completed: true,
        pageType: "content"
      };

      localStorage.setItem("completedExercises", JSON.stringify(completedExercises));

      // Optional: sofort visuelles Update in Navigation (nützlich falls SPA oder Soft-Reload)
      if (typeof enhancedProgress !== "undefined") {
        enhancedProgress.highlightCompletedExercises();
      }
    });
  }
});
