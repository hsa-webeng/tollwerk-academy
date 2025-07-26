// GLOBAL VARIABLES AND CONFIGURATION

// Reset progress on page reload (for prototyping)
function resetProgressOnReload() {
  // Check if this is a page reload (not a navigation)
  if (performance.navigation.type === 1) {
    // Clear all progress data
    localStorage.removeItem('completedExercises');
    localStorage.removeItem('moduleProgress');
    console.log('Progress reset on page reload');
  }
}

// Call reset function on page load
resetProgressOnReload();

// Global variables for tracking completion
let completedExercises = JSON.parse(localStorage.getItem('completedExercises') || '{}');
let moduleProgress = JSON.parse(localStorage.getItem('moduleProgress') || '{}');

// Intro pages that should never be marked as completed
const INTRO_PAGES = ['index.html', 'hinweise.html'];


// FIRST DOMCONTENT LOADED EVENT

// Course Cards on index.html
document.addEventListener('DOMContentLoaded', function () {
  const courseCards = document.querySelectorAll('.course-card.toggleable');

  // open/close course cards
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
      '1_6_modul1_lueckentext.html',
      '1_7_modul1_quiz.html'
    ],
    contentPages: [
      '1_0_modul1_inhaltsverzeichnis.html',
      '1_1_modul1_allgemeine_definition.html',
      '1_2_modul1_gesetzliche_definition.html',
      '1_3_modul1_soziale_praktische_aspekte.html',
      '1_4_modul1_bezug_zur_nachhaltigkeit.html',
      '1_5_modul1_teste_dein_wissen.html' 
    ],
    requiredPercentage: 80,
    nextModule: 'modul2'
  },
  'modul2': {
    exercises: [

      '2_5_modul2_quiz.html',
      '2_6_modul2_lueckentext.html',
      '2_7_modul2_drag_and_drop_quiz.html'
    ],
    contentPages: [
      '2_0_modul2_inhaltsverzeichnis.html',
      '2_1_modul2_barrieren_reflexion.html',
      '2_2_modul2_barrieren_sind_ueberall.html',
      '2_3_modul2_digitale_medien.html',
      '2_4_modul2_teste_dein_wissen.html',
    ],
    requiredPercentage: 80,
    nextModule: 'modul3'
  },
  'modul3': {
    exercises: [
      // Wird ergänzt, sobald Inhalte existieren
    ],
    contentPages: [
      // Auch später ergänzen
    ],
    requiredPercentage: 80,
    nextModule: null
  }
};


// NAVIGATION AND COMPLETION LOGIC


// Page type configuration - defines how each page type should be marked as completed
const PAGE_TYPES = {
  content: [
    '1_1_modul1_allgemeine_definition.html',
    '1_2_modul1_gesetzliche_definition.html',
    '1_3_modul1_soziale_praktische_aspekte.html',
    '1_4_modul1_bezug_zur_nachhaltigkeit.html',
    '1_5_modul1_teste_dein_wissen.html',
    '1_8_modul1_testergebnis.html',
    '2_1_modul2_barrieren_reflexion.html',
    '2_2_modul2_barrieren_sind_ueberall.html',
    '2_3_modul2_digitale_medien.html',
    '2_4_modul2_teste_dein_wissen.html',
    '2_8_modul2_testergebnis.html'
  ],
  quiz: [
    '1_7_modul1_quiz.html',
    '2_5_modul2_quiz.html'
  ],
  fillInTheBlanks: [
    '1_6_modul1_lueckentext.html',
    '2_6_modul2_lueckentext.html'
  ],
  dragAndDrop: [
    '2_7_modul2_drag_and_drop_quiz.html'
  ]
};

// SECOND DOMCONTENT LOADED EVENT
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

  // Initialize the progress manager
  const progressManager = new ProgressManager(MODULE_CONFIG, completedExercises);
  progressManager.applyAccessControl();
});



// CLASS FOR PROGRESS MANAGEMENT

class ProgressManager {
  constructor(moduleConfig, completedExercises) {
    this.moduleConfig = moduleConfig;
    this.completedExercises = completedExercises;
    this.currentPage = this.getCurrentPage();
    this.activeModule = this.getActiveModule();
    this.modulePages = this.getModulePages();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf("/") + 1);
  }

  getActiveModule() {
    for (const [module, data] of Object.entries(this.moduleConfig)) {
      const allPages = [...(data.contentPages || []), ...(data.exercises || [])];
      if (allPages.includes(this.currentPage)) {
        return module;
      }
    }
    return null;
  }

  getModulePages() {
    if (!this.activeModule) return [];
    const config = this.moduleConfig[this.activeModule];
    return [...(config.contentPages || []), ...(config.exercises || [])];
  }

  isPageCompleted(page) {
    return this.completedExercises[page]?.completed === true;
  }

isPageUnlocked(index) {
  if (index === 0) return true;
  
  // Für alle anderen Seiten:
  // Prüfe, ob die vorherige Seite abgeschlossen ist
  return this.isPageCompleted(this.modulePages[index - 1]);
}


  applyAccessControl() {
    this.modulePages.forEach((page, index) => {
      const link = document.querySelector(`a[href="${page}"]`);
      if (!link) return;

      const unlocked = this.isPageUnlocked(index);

      if (unlocked) {
        link.classList.remove("disabled");
        link.removeAttribute("aria-disabled");
        link.style.pointerEvents = "auto";
        link.style.opacity = "1";
      } else {
        link.classList.add("disabled");
        link.setAttribute("aria-disabled", "true");
        link.style.pointerEvents = "none";
        link.style.opacity = "0.5";
      }
    });
  }

  markCurrentPageComplete() {
  if (!this.currentPage) return;

  // Verhindere Mehrfach-Einträge
  if (!this.completedExercises[this.currentPage]) {
    this.completedExercises[this.currentPage] = {};
  }

  this.completedExercises[this.currentPage].completed = true;

  // Optional: Lokale Speicherung zur Persistenz
  localStorage.setItem('completedExercises', JSON.stringify(this.completedExercises));

  // Zugriff erneut prüfen und ggf. nächste Seite freischalten
  this.applyAccessControl();
}

}


// Class for Progress Tracking (what is done, what is not done)

// Enhanced Progress Tracking System
class EnhancedProgressTracker {
  constructor() {
    this.currentModule = this.getCurrentModule();
    this.currentPage = this.getCurrentPage();
    this.pageType = this.getPageType();
    this.initializeProgressTracking();
    window.tracker = this;
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
    if (!INTRO_PAGES.includes(this.currentPage)) {
      const nextButtons = document.querySelectorAll('.nav-button.next-button');

      nextButtons.forEach(button => {
        button.addEventListener('click', () => {
          const cleanPath = this.currentPage.split('?')[0].split('#')[0];

          // Dynamisch richtigen pageType für die aktuelle Seite ermitteln
          let detectedPageType = 'content';
          if (PAGE_TYPES.quiz.includes(cleanPath)) detectedPageType = 'quiz';
          else if (PAGE_TYPES.fillInTheBlanks.includes(cleanPath)) detectedPageType = 'fillInTheBlanks';
          else if (PAGE_TYPES.dragAndDrop?.includes(cleanPath)) detectedPageType = 'dragAndDrop';
          else if (PAGE_TYPES.content.includes(cleanPath)) detectedPageType = 'content';

          this.markPageAsCompleted(this.currentPage, 100, detectedPageType);
        });
      });
    }
  }


// mark page as completed
  markPageAsCompleted(pagePath, score = 100, pageType = null) {
    const cleanPath = pagePath.split('?')[0].split('#')[0];

    if (INTRO_PAGES.includes(cleanPath)) {
      console.log(`Skipping completion tracking for intro page: ${cleanPath}`);
      return;
    }

    const isPassed = score >= 80;

    // get page type for current page
    if (!pageType) {
      if (PAGE_TYPES.quiz.includes(cleanPath)) pageType = 'quiz';
      else if (PAGE_TYPES.fillInTheBlanks.includes(cleanPath)) pageType = 'fillInTheBlanks';
      else if (PAGE_TYPES.dragAndDrop && PAGE_TYPES.dragAndDrop.includes(cleanPath)) pageType = 'dragAndDrop';
      else if (PAGE_TYPES.content.includes(cleanPath)) pageType = 'content';
    }


    completedExercises[cleanPath] = {
      completed: isPassed,
      score: score,
      completedAt: new Date().toISOString(),
      pageType: pageType
    };

    localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
    this.updateModuleProgress();
    this.controlModuleNavigation();
    this.displayModuleProgress();
    this.highlightCompletedExercises();

    this.updateModulFortschrittsanzeige();
  }

// calculöate module progress
  calculateModuleProgress(moduleName) {
    const moduleConfig = MODULE_CONFIG[moduleName];
    if (!moduleConfig) return 0;

    const exercises = moduleConfig.exercises || [];
    const contentPages = moduleConfig.contentPages || [];

    const totalItems = exercises.length + contentPages.length;
    if (totalItems === 0) return 0;

    let completedCount = 0;

    // count finished exercises from both page types
    [...exercises, ...contentPages].forEach(page => {
      if (completedExercises[page] && completedExercises[page].completed) {
        completedCount++;
      }
    });

    return Math.round((completedCount / totalItems) * 100);
  }


// update module progress
  updateModuleProgress() {
    if (!this.currentModule) return;

    const progress = this.calculateModuleProgress(this.currentModule);
    moduleProgress[this.currentModule] = {
      percentage: progress,
      lastUpdated: new Date().toISOString(),
      exercises: MODULE_CONFIG[this.currentModule].exercises
    };

    localStorage.setItem('moduleProgress', JSON.stringify(moduleProgress));
    this.updateModulFortschrittsanzeige();
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
//display the results
  displayModuleProgress() {
    if (!this.currentModule) return;

    const progress = this.calculateModuleProgress(this.currentModule);
    const moduleConfig = MODULE_CONFIG[this.currentModule];

    const progressFill = document.getElementById('modul-progress-fill');
    const progressText = document.getElementById('modul-progress-text');

    const completedCount = moduleConfig.exercises.filter(exercise =>
      completedExercises[exercise] && completedExercises[exercise].completed
    ).length;

    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }

    if (progressText) {
      progressText.textContent = `${completedCount} von ${moduleConfig.exercises.length} Übungen abgeschlossen`;
    }
  }

  //display the resuölts
updateModulFortschrittsanzeige() {
  const container = document.getElementById('modul-fortschritt-container');
  if (!container) return;

  const progressFill = container.querySelector('.modul-progress-fill');
  const progressText = container.querySelector('.modul-progress-text');
  const requirementPending = container.querySelector('.modul-progress-requirements .requirement-pending');
  const percentDisplay = container.querySelector('.modul-progress-percent');

  const moduleConfig = MODULE_CONFIG[this.currentModule];
  if (!moduleConfig) return;

  const exercises = moduleConfig.exercises || [];
  const contentPages = moduleConfig.contentPages || [];

  // Gewichtung anpassen je nach gewünschtem Verhältnis
  const EXERCISE_WEIGHT = 0.8;
  const CONTENT_WEIGHT = 0.2;

  const totalExercises = exercises.length;
  const totalContent = contentPages.length;

  const totalWeight = (totalExercises * EXERCISE_WEIGHT) + (totalContent * CONTENT_WEIGHT);
  let completedWeight = 0;

  // Gewichtete Zählung: Übungen
  exercises.forEach(exercise => {
    if (completedExercises[exercise] && completedExercises[exercise].completed) {
      completedWeight += EXERCISE_WEIGHT;
    }
  });

  // Gewichtete Zählung: Inhaltsseiten
  contentPages.forEach(page => {
    if (completedExercises[page] && completedExercises[page].completed) {
      completedWeight += CONTENT_WEIGHT;
    }
  });

  const percent = totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);

  // ✅ Ladebalken aktualisieren
  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }

  // ✅ Prozentanzeige aktualisieren
  if (percentDisplay) {
    percentDisplay.textContent = `${percent}%`;
  }

  // ✅ Nur Übungen in der Textanzeige
  const completedExercisesCount = exercises.filter(exercise =>
    completedExercises[exercise] && completedExercises[exercise].completed
  ).length;

  if (progressText) {
    progressText.textContent = `${completedExercisesCount} von ${exercises.length} Übungen abgeschlossen`;
  }

  // ✅ Anforderungen erfüllt?
  if (requirementPending) {
    if (percent >= moduleConfig.requiredPercentage) {
      requirementPending.textContent = '✅ Anforderungen erfüllt';
      requirementPending.classList.remove('requirement-pending');
      requirementPending.classList.add('requirement-met');
    } else {
      requirementPending.textContent = '⏳ Anforderungen noch nicht erfüllt';
      requirementPending.classList.add('requirement-pending');
      requirementPending.classList.remove('requirement-met');
    }
  }
}


  //Mark Pages as Completed in Navigation
  highlightCompletedExercises() {
    const navLinks = document.querySelectorAll('.sidebar nav a');
    const currentPath = window.location.pathname.split("/").pop();

    navLinks.forEach(link => {
      const href = link.getAttribute('href');

      // Reset all classes and attributes
      link.classList.remove('completed', 'completed-quiz', 'completed-content');
      link.removeAttribute('aria-current');
      link.title = "";

      // Mark current page
      if (href === currentPath) {
        link.setAttribute("aria-current", "page");
      }

      // Skip intro pages
      if (href && INTRO_PAGES.includes(href)) return;

      // Mark completed exercises
      if (href && completedExercises[href]) {
        const completionData = completedExercises[href];

        if (completionData.completed) {
          const type = completionData.pageType;

          if (['quiz', 'fillInTheBlanks', 'dragAndDrop'].includes(type)) {
            link.classList.add('completed-quiz');
            link.title = `Abgeschlossen – ${completionData.score}% erreicht`;
          } else {
            link.classList.add('completed-content');
            link.title = 'Abgeschlossen';
          }
        }
      }
    });
  }
}


// CONTENT MANAGEMENT

// THIRD DOMCONTENT LOADED EVENT

// Media TABs and Content Display
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


  // QUIZ/EXERCISES LOGIC


  //Initialize Progress 
  if (typeof QuizEvaluator === "function") new QuizEvaluator();
  if (typeof FillInTheBlanksEvaluator === "function") new FillInTheBlanksEvaluator();
  if (typeof EnhancedProgressTracker === "function") new EnhancedProgressTracker();
});

// CLASS FOR QUIZ EVALUATION


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

  // ⬇️ Hier Drag-and-Drop-Antworten ergänzen
  const dragContainer = document.querySelector('.drag-container');
  if (dragContainer) {
    const dropzones = dragContainer.querySelectorAll('.dropzone');
    const userAnswers = [];

    dropzones.forEach(zone => {
      const droppedId = zone.dataset.droppedId;
      if (droppedId) {
        userAnswers.push(droppedId);
      }
    });

    answers['dragAndDrop'] = userAnswers;
  }

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
      question1: ['C'],
      question2: ['A', 'B', 'D'],
      question3: ['B'],
      question4: ['C']
    };
  } else if (currentPage.includes('modul1_quiz.html')) {
    return {
      question1: ['B']
    };
  } else if (currentPage.includes('2_7_modul2_drag_and_drop_quiz.html')) {
    return {
      dragAndDrop: [
        'website',
        'video',
        'app',
        'pdf',
        'terminal'
      ]
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

  saveCompletionStatusAndNavigation() {
  const currentPage = window.location.pathname.split("/").pop();
  const formData = new FormData(this.quizForm);
  const answers = this.collectAnswers(formData);
  const correctAnswers = this.getCorrectAnswers();
  const score = this.calculateScore(answers, correctAnswers); // ergibt z. B. 83

  const scorePercentage = Math.round(score);

  // ✅ Speichern nur bei bestandenem Quiz
  if (scorePercentage >= 80) {
    completedExercises[currentPage] = {
      completed: true,
      timestamp: new Date().toISOString(),
      type: 'quiz',
      score: scorePercentage
    };
    localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
  }

  // 🧭 Weiter-Link aktivieren/deaktivieren
  const nextLink = document.getElementById("next-link");
  if (nextLink) {
    if (scorePercentage >= 80) {
      nextLink.classList.remove("disabled");
      nextLink.removeAttribute("aria-disabled");
      nextLink.style.pointerEvents = "auto";
      nextLink.style.opacity = "1";
      nextLink.title = `Weiter (${scorePercentage}% erreicht)`;
    } else {
      nextLink.classList.add("disabled");
      nextLink.setAttribute("aria-disabled", "true");
      nextLink.style.pointerEvents = "none";
      nextLink.style.opacity = "0.5";
      nextLink.title = `Mindestens 80% erforderlich (aktuell: ${scorePercentage}%)`;
    }
  }
}
}

// Fill-in-the-blanks Evaluation System
class FillInTheBlanksEvaluator {
  constructor() {
    this.validateButton = document.getElementById('validate-button');
    this.feedbackElement = document.getElementById('feedback');
    this.selects = document.querySelectorAll('section.fill-in-the-blanks select[data-solution]');
    this.nextLink = document.querySelector('.nav-buttons a.button-secondary:last-of-type');

    this.initialize();
  }

  initialize() {
    if (!this.validateButton || !this.feedbackElement || !this.selects.length) return;

    this.validateButton.addEventListener('click', () => this.handleValidation());
  }

  handleValidation() {
    const results = this.evaluateAnswers();

    this.displayFeedback(results);
    this.updateNavigation(results);
    this.saveCompletionStatus(results);

    // Update module progress after completion
    if (results.score >= 80 && typeof EnhancedProgressTracker !== 'undefined') {
      new EnhancedProgressTracker().markPageAsCompleted(window.location.pathname, results.score);
    }
  }

  evaluateAnswers() {
    let allCorrect = true;
    let allFilled = true;
    const feedbackMessages = [];
    let correctCount = 0;

    this.selects.forEach((select, index) => {
      const userAnswer = select.value.trim();
      const correctAnswer = select.dataset.solution.trim();

      if (userAnswer === "") {
        allFilled = false;
        allCorrect = false;
        select.style.borderColor = "#f39c12";
        feedbackMessages.push(`Lücke ${index + 1}: Bitte fülle diese Lücke aus.`);
      } else if (userAnswer.toLowerCase() !== correctAnswer.toLowerCase()) {
        allCorrect = false;
        select.style.borderColor = "#e74c3c";
        feedbackMessages.push(`Lücke ${index + 1}: Falsch. Die richtige Antwort ist: ${correctAnswer}.`);
      } else {
        select.style.borderColor = "#2ecc71";
        correctCount++;
        feedbackMessages.push(`✅ Lücke ${index + 1}: Richtig!`);
      }
    });

    const score = Math.round((correctCount / this.selects.length) * 100);

    return {
      allFilled,
      allCorrect: allCorrect && allFilled,
      feedback: feedbackMessages.join('\n'),
      score
    };
  }

  displayFeedback(results) {
    if (!this.feedbackElement) return;

    const { allFilled, allCorrect, feedback, score } = results;
    this.feedbackElement.style.fontWeight = "bold";
    this.feedbackElement.style.marginTop = "1rem";

    if (!allFilled) {
      this.feedbackElement.textContent = "❗ Bitte fülle alle Lücken aus.";
      this.feedbackElement.style.color = "#f39c12";
    } else if (allCorrect) {
      this.feedbackElement.textContent = "✅ Richtig! Alle Antworten sind korrekt.\n\nPunktzahl: " + score + "%";
      this.feedbackElement.style.color = "#2ecc71";
    } else {
      this.feedbackElement.textContent = "🔁 Nicht ganz richtig. Versuche es noch einmal.\n\n" + feedback + "\n\nPunktzahl: " + score + "%";
      this.feedbackElement.style.color = "#e74c3c";
    }
  }

  updateNavigation(results) {
    if (!this.nextLink) return;

    const { score } = results;

    if (score >= 80) {
      this.nextLink.classList.remove("disabled");
      this.nextLink.removeAttribute("aria-disabled");
      this.nextLink.style.pointerEvents = "auto";
      this.nextLink.style.opacity = "1";
      this.nextLink.title = `✅ Weiter (${score}% erreicht)`;
    } else {
      this.nextLink.classList.add("disabled");
      this.nextLink.setAttribute("aria-disabled", "true");
      this.nextLink.style.pointerEvents = "none";
      this.nextLink.style.opacity = "0.5";
      this.nextLink.title = `❗ Mindestens 80% erforderlich (aktuell: ${score}%)`;
    }
  }

  saveCompletionStatus(results) {
    const { score } = results;
    const currentPage = window.location.pathname;

    if (score >= 80) {
      completedExercises[currentPage] = {
        completed: true,
        timestamp: new Date().toISOString(),
        type: 'fill-in-the-blanks',
        score
      };
      localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
    }
  }
}


// Drag and Drop Functionality

// FOURTH DOMCONTENT LOADED EVENT

function getDragAnswers() {
  const dragAnswers = {};

  document.querySelectorAll('.dropzone').forEach(zone => {
    const question = zone.dataset.question;
    const droppedId = zone.dataset.droppedId;

    if (!question) return;

    if (!dragAnswers[question]) {
      dragAnswers[question] = [];
    }

    if (droppedId) {
      dragAnswers[question].push(droppedId);
    }
  });

  return dragAnswers;
}

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

  // Speichere das abgelegte ID in einem Datenattribut für spätere Auswertung
  zone.dataset.droppedId = draggedId;

  zone.textContent = zone.textContent + ` (${draggedId})`;
  zone.classList.add(correct ? "correct" : "incorrect");

    const remaining = document.querySelectorAll(".dropzone:not(.correct):not(.incorrect)");
    if (remaining.length === 0) {
      feedback.textContent = "✅ Alle Zuordnungen abgeschlossen!";
      feedback.style.color = "#2ecc71";
      document.getElementById("next-link").classList.remove("disabled");
      document.getElementById("next-link").removeAttribute("aria-disabled");
       markCurrentPageCompleteIfNeeded();
    }
  }
});

// Trigger Fortschritt nach erfolgreicher Lösung des Drag-and-Drop-Rätsels
function markCurrentPageCompleteIfNeeded() {
  const allDropzones = document.querySelectorAll(".dropzone");
  const allFilled = Array.from(allDropzones).every(zone => zone.dataset.droppedId);

  if (allFilled) {
    // Der Fortschritt soll nur dann getrackt werden, wenn alle Dropzones befüllt sind
    if (typeof progressManager !== "undefined" && progressManager !== null) {
  progressManager.markCurrentPageComplete?.();
}
  }
}


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

// FIFTH DOMCONTENT LOADED EVENT

// NOTE function
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


//Initialize Page Progress 
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

// SIXTH DOMCONTENT LOADED EVENT
document.addEventListener('DOMContentLoaded', () => {
  const nextButton = document.querySelector('.next-button');
  const feedback = document.getElementById('feedback');

  // --- Lückentext-Seite ---
  if (document.querySelector('select[data-solution]')) {
    const validateButton = document.getElementById('validate-button');
    const selects = document.querySelectorAll('select[data-solution]');
    let quizPassed = false;

    validateButton.addEventListener('click', () => {
      let allCorrect = true;

      selects.forEach(select => {
        const solution = select.dataset.solution;
        const userAnswer = select.value;

        if (userAnswer !== solution) {
          allCorrect = false;
          select.classList.add('incorrect');
          select.classList.remove('correct');
        } else {
          select.classList.add('correct');
          select.classList.remove('incorrect');
        }
      });

      if (allCorrect) {
        feedback.textContent = '✅ Alle Antworten sind korrekt!';
        quizPassed = true;

        if (typeof enhancedProgressTracker !== 'undefined') {
          enhancedProgressTracker.markPageCompleted(window.location.pathname.split('/').pop());
        }
      } else {
        feedback.textContent = '❌ Einige Antworten sind noch falsch. Bitte korrigieren.';
      }
    });

    nextButton.addEventListener('click', (event) => {
      if (!quizPassed) {
        event.preventDefault();
        feedback.textContent = '❗Bitte überprüfen Sie zuerst Ihre Antworten und korrigieren Sie sie, bevor Sie fortfahren.';
        feedback.focus();
      }
    });

  // --- Drag-and-Drop-Seite ---
  } else if (document.querySelector('.dropzone')) {
    const dropzones = document.querySelectorAll('.dropzone');
    let dragDropPassed = false;

    function checkCompletion() {
      let correctCount = 0;
      dropzones.forEach(zone => {
        if (zone.classList.contains('correct')) correctCount++;
      });
      const percentCorrect = (correctCount / dropzones.length) * 100;
      return percentCorrect >= 80;  // z.B. 80% richtig als Schwelle
    }

    nextButton.addEventListener('click', (event) => {
      if (!checkCompletion()) {
        event.preventDefault();
        feedback.textContent = '❗Bitte ordnen Sie mindestens 80 % der Elemente richtig zu, bevor Sie fortfahren.';
        feedback.focus();
      } else {
        dragDropPassed = true;
        feedback.textContent = '✅ Gut gemacht! Sie können fortfahren.';
        if (typeof enhancedProgressTracker !== 'undefined') {
          enhancedProgressTracker.markPageCompleted(window.location.pathname.split('/').pop());
        }
      }
    });

  }
});


