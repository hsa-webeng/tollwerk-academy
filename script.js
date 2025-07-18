// Global variables for tracking completion
let completedExercises = JSON.parse(localStorage.getItem('completedExercises') || '{}');
let moduleProgress = JSON.parse(localStorage.getItem('moduleProgress') || '{}');

// Intro pages that should never be marked as completed
const INTRO_PAGES = ['index.html', 'hinweise.html'];

// Event listener to handle the accessibility card toggle
 document.addEventListener('DOMContentLoaded', function () {
    const card = document.getElementById('barrierefreiheit-card');

    // Verhindere, dass ein Klick auf den Button das Öffnen auslöst
    const button = card.querySelector('a.nav-button');
    button.addEventListener('click', (e) => e.stopPropagation());

    card.addEventListener('click', function () {
      card.classList.toggle('open');
    });
  });

// Module configuration - defines what exercises are required for each module
const MODULE_CONFIG = {
  'modul1': {
    exercises: [
      'modul1_allgemeine_definitionen.html',
      'modul1_gesetzliche_definitionen.html', 
      'modul1_lueckentext.html',
      'modul1_quiz.html'
    ],
    requiredPercentage: 80,
    nextModule: 'modul2'
  },
  'modul2': {
    exercises: [
      'modul2.html',
      'modul2_quiz.html'
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
  'content': ['modul1_allgemeine_definitionen.html', 'modul1_gesetzliche_definitionen.html', 'modul_2.html'],
  'quiz': ['modul1_quiz.html', 'modul2_quiz.html'],
  'fillInTheBlanks': ['modul1_lueckentext.html']
};

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
    // Add visual indicators for completed exercises in navigation
    const navLinks = document.querySelectorAll('.sidebar nav a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      // Skip intro pages
      if (href && INTRO_PAGES.includes(href)) {
        // Remove any completion indicators from intro pages
        link.classList.remove('completed', 'completed-quiz', 'completed-content');
        return;
      }
      
      if (href && completedExercises[href]) {
        const completionData = completedExercises[href];
        
        // Remove existing completion indicators
        link.classList.remove('completed', 'completed-quiz', 'completed-content');
        
        if (completionData.completed) {
          if (completionData.pageType === 'quiz' || completionData.pageType === 'fillInTheBlanks') {
            link.classList.add('completed', 'completed-quiz');
            link.title = `Abgeschlossen - ${completionData.score}% erreicht`;
          } else {
            link.classList.add('completed', 'completed-content');
            link.title = 'Abgeschlossen';
          }
        }
      }
    });
  }
}

// Sidebar highlight current page

document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname.split("/").pop();
  const links = document.querySelectorAll(".sidebar a");

  links.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath) {
      link.setAttribute("aria-current", "page");
    }
  });
});

// Disable Media Tab buttons if content type is missing

document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".tabs button");
  const mediaItems = {
    "Video": document.getElementById("video-content"),
    "Audio": document.getElementById("audio-content"),
    "Text": document.getElementById("text-content")
  };

  let firstAvailable = null;

  tabs.forEach(tab => {
    const label = tab.textContent.trim();
    const mediaItem = mediaItems[label];

    // Ist der Inhalt wirklich leer?
    const isEmpty = !mediaItem || mediaItem.querySelectorAll("img, audio, video, p").length === 0;

    if (isEmpty) {
      tab.disabled = true;
      tab.classList.add("disabled");
    } else if (!firstAvailable) {
      firstAvailable = { tab, mediaItem };
    }
  });

  // Aktiviere den ersten verfügbaren
  if (firstAvailable) {
    firstAvailable.tab.classList.add("active");
    firstAvailable.mediaItem.classList.remove("hidden");
  }
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
      const selectedAnswer = formData.get(questionName);
      answers[questionName] = selectedAnswer;
    });
    
    return answers;
  }

  evaluateAnswers(answers) {
    const correctAnswers = this.getCorrectAnswers();
    let allCorrect = true;
    let feedback = [];
    
    Object.keys(answers).forEach(questionName => {
      const userAnswer = answers[questionName];
      const correctAnswer = correctAnswers[questionName];
      
      if (!userAnswer) {
        allCorrect = false;
        feedback.push(`Frage ${questionName.replace('question', '')}: Bitte wähle eine Antwort aus.`);
      } else if (userAnswer === correctAnswer) {
        feedback.push(`✅ Frage ${questionName.replace('question', '')}: Richtig!`);
      } else {
        allCorrect = false;
        feedback.push(`❌ Frage ${questionName.replace('question', '')}: Falsch. Die richtige Antwort ist: ${correctAnswer}.`);
      }
    });
    
    return {
      allCorrect,
      feedback: feedback.join('\n'),
      score: this.calculateScore(answers, correctAnswers)
    };
  }

  getCorrectAnswers() {
    // Define correct answers for each quiz
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('modul1_quiz.html')) {
      return { question1: 'B' };
    } else if (currentPage.includes('modul2_quiz.html')) {
      return { question1: 'A', question2: 'C' };
    }
    
    return {};
  }

  calculateScore(answers, correctAnswers) {
    let correct = 0;
    let total = Object.keys(correctAnswers).length;
    
    Object.keys(answers).forEach(questionName => {
      if (answers[questionName] === correctAnswers[questionName]) {
        correct++;
      }
    });
    
    return Math.round((correct / total) * 100);
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
    const nextLink = document.querySelector('.nav-buttons a[href*="quiz.html"]');
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

// Initialize all systems when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Media Button Funktion
  const buttons = document.querySelectorAll(".tabs button");
  const mediaItems = {
    "Video": document.getElementById("video-content"),
    "Audio": document.getElementById("audio-content"),
    "Text": document.getElementById("text-content"),
  };

  buttons.forEach(button => {
    button.addEventListener("click", () => {
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


  // Initialize evaluation systems
  new QuizEvaluator();
  new FillInTheBlanksEvaluator();
  new EnhancedProgressTracker();
});

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

  // speichern
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

  // Notiz erstellen
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

  // Notiz Laden 
  loadNotes();
});
