const STORAGE_KEY = "staticRecommendations";
const STATIC_RECOMMENDATIONS = [
  {
    name: "Alex R.",
    text: "Nishant's expertise in React and system design is unparalleled. He's a true asset to any complex project.",
    date: new Date("2025-01-15"),
  },
  {
    name: "Sarah K.",
    text: "The architectural solutions Nishant provided significantly improved our application's performance and scalability. Highly recommend!",
    date: new Date("2025-02-28"),
  },
  {
    name: "J. Miller (CTO)",
    text: "A dedicated engineer who consistently delivers clean, efficient, and well-tested code. A pleasure to work with.",
    date: new Date("2025-03-10"),
  },
];

// --- Confirmation Dialog Functions ---
function closeConfirmationDialog() {
  const dialog = document.getElementById("confirmationDialog");
  dialog.classList.add("opacity-0");
  dialog.classList.remove("opacity-100");
  setTimeout(() => {
    dialog.classList.add("hidden");
    dialog.classList.remove("flex");
    document.getElementById("dialogMessage").textContent =
      "Thank you for your recommendation! It is saved locally on your browser.";
  }, 300);
}

function showConfirmationDialog(message) {
  const dialog = document.getElementById("confirmationDialog");
  document.getElementById("dialogMessage").textContent =
    message ||
    "Thank you for your recommendation! It is saved locally on your browser.";
  dialog.classList.remove("hidden");
  dialog.classList.add("flex");
  // Force reflow to trigger transition
  void dialog.offsetWidth;
  dialog.classList.remove("opacity-0");
  dialog.classList.add("opacity-100");
}

// --- Recommendation Logic ---
function getRecommendations() {
  const stored = localStorage.getItem(STORAGE_KEY);
  let userRecs = [];

  if (stored) {
    try {
      // Map stored dates back to Date objects for sorting
      userRecs = JSON.parse(stored).map((rec) => ({
        ...rec,
        date: new Date(rec.date),
      }));
    } catch (e) {
      console.error("Error parsing localStorage recommendations:", e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Combine static and user-submitted recommendations and sort by date (newest first)
  const allRecs = [...STATIC_RECOMMENDATIONS, ...userRecs];
  return allRecs.sort((a, b) => b.date.getTime() - a.date.getTime());
}

function renderRecommendations() {
  const listElement = document.getElementById("recommendationsList");
  const recommendations = getRecommendations();

  if (recommendations.length === 0) {
    listElement.innerHTML =
      '<p class="col-span-3 text-center text-gray-500">No recommendations yet. Be the first to add one locally!</p>';
    return;
  }

  // Generate HTML for each recommendation
  const html = recommendations
    .map((rec) => {
      const isLocal = !STATIC_RECOMMENDATIONS.includes(rec);
      return `
                    <div class="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 animated-card">
                        <p class="text-gray-300 italic mb-4">"${rec.text}"</p>
                        <div class="flex items-center text-sm font-medium text-green-400">
                            <i data-lucide="user" class="w-4 h-4 mr-2"></i>
                            — ${rec.name}
                        </div>
                    </div>
                `;
    })
    .join("");

  listElement.innerHTML = html;
  lucide.createIcons(); // Re-render lucide icons after injecting new HTML
}

// Form Submission Handler
document
  .getElementById("recommendationForm")
  .addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("name");
    const textInput = document.getElementById("recommendationText");
    const submitButton = document.getElementById("submitButton");

    const name = nameInput.value.trim();
    const recommendationText = textInput.value.trim();

    if (!name || !recommendationText) {
      showConfirmationDialog("Error: Please fill in both fields.");
      return;
    }

    // Disable button during "submission"
    submitButton.disabled = true;
    submitButton.innerHTML = "Saving...";

    const newRecommendation = {
      name: name,
      text: recommendationText,
      date: new Date().toISOString(), // Store as ISO string for local persistence
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const userRecs = stored ? JSON.parse(stored) : [];
      userRecs.push(newRecommendation);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userRecs));

      // Update UI
      renderRecommendations();

      // Show confirmation dialogue
      showConfirmationDialog(
        "Success! Your recommendation was submitted locally."
      );

      // Reset form fields
      nameInput.value = "";
      textInput.value = "";
    } catch (error) {
      console.error("Error saving to localStorage: ", error);
      showConfirmationDialog(
        `Error saving recommendation locally: ${error.message}`
      );
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML =
        'Submit Recommendation <i data-lucide="send" class="w-4 h-4 ml-2"></i>';
      lucide.createIcons();
    }
  });

// Initialize on window load
window.onload = () => {
  lucide.createIcons();
  renderRecommendations(); // Initial rendering of recommendations
};
