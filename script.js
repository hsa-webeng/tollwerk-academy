//Note Funktion
document.addEventListener("DOMContentLoaded", function() {
      const addNoteBtn = document.getElementById("add-note");
      const notesContainer = document.getElementById("notes-container");

      addNoteBtn.addEventListener("click", () => {
        const note = document.createElement("div");
        note.className = "note";

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-note";
        deleteButton.innerHTML = "✕";
        deleteButton.title = "Notiz löschen";

        deleteButton.addEventListener("click", () => {
          notesContainer.removeChild(note);
        });

        const textarea = document.createElement("textarea");
        textarea.placeholder = "Deine Notiz...";

        note.appendChild(deleteButton);
        note.appendChild(textarea);
        notesContainer.appendChild(note);
      });
    });
    // Lückentext-Logik
      document.getElementById('validate-button').addEventListener('click', function () {
    const selects = document.querySelectorAll('section.fill-in-the-blanks select');

    let allCorrect = true;
    let allFilled = true;

    selects.forEach(select => {
      const userAnswer = select.value.trim();
      const correctAnswer = select.dataset.solution.trim();

      if (userAnswer === "") {
        allFilled = false;
        select.style.borderColor = "#f39c12"; // orange für Hinweis
      } else if (userAnswer.toLowerCase() !== correctAnswer.toLowerCase()) {
        allCorrect = false;
        select.style.borderColor = "#e74c3c"; // rot für falsch
      } else {
        select.style.borderColor = "#2ecc71"; // grün für richtig
      }
    });

    const feedback = document.getElementById('feedback');
    if (!allFilled) {
      feedback.textContent = "Bitte fülle alle Lücken aus.";
      feedback.style.color = "#f39c12";
    } else if (allCorrect) {
      feedback.textContent = "Richtig! Alle Antworten sind korrekt.";
      feedback.style.color = "#2ecc71";
    } else {
      feedback.textContent = "Nicht ganz richtig. Versuche es noch einmal.";
      feedback.style.color = "#e74c3c";
    }
  });

   // Quiz-Logik
    document.getElementById("quiz-form").addEventListener("submit", function (e) {
      e.preventDefault();

      const selected = document.querySelector('input[name="question1"]:checked');
      const feedback = document.getElementById("feedback");
      const nextLink = document.getElementById("next-link");

      if (!selected) {
        feedback.textContent = "Bitte wähle eine Antwort aus.";
        feedback.style.color = "black";
        return;
      }

      if (selected.value === "B") {
        feedback.textContent = "✅ Richtig! Digitale Barrierefreiheit bedeutet, dass alle Menschen – unabhängig von Behinderungen – digitale Inhalte nutzen können.";
        feedback.style.color = "green";
        nextLink.style.display = "inline-block";
      } else {
        feedback.textContent = "❌ Leider falsch. Die richtige Antwort ist: B.";
        feedback.style.color = "red";
        nextLink.style.display = "inline-block";
      }
    });