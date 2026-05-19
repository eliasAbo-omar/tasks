let tasks = JSON.parse(localStorage.getItem("todo_tasks")) || [];

const swiper = new Swiper(".mySwiper", {
  slidesPerView: 1,
  spaceBetween: 20,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  breakpoints: {
    640: { slidesPerView: 2 },
    1024: { slidesPerView: 3 },
  },
});

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const swiperWrapper = document.getElementById("swiperWrapper");
const progressPercentage = document.getElementById("progressPercentage");
const progressBarFill = document.getElementById("progressBarFill");

function escapeHTML(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#x60;",
  };
  return text.replace(/[&<>"'`/]/g, function (m) {
    return map[m];
  });
}

function saveToLocalStorage() {
  localStorage.setItem("todo_tasks", JSON.stringify(tasks));
}

function updateProgress() {
  if (tasks.length === 0) {
    progressPercentage.textContent = "0%";
    progressBarFill.style.width = "0%";
    document
      .querySelector(".progress-circle-container")
      .classList.remove("full");
    return;
  }

  const completedTasks = tasks.filter((t) => t.completed).length;
  const percentage = Math.round((completedTasks / tasks.length) * 100);

  // تحديث النص وعرض البار
  progressPercentage.textContent = `${percentage}%`;
  progressBarFill.style.width = `${percentage}%`;

  const container = document.querySelector(".progress-circle-container");
  if (percentage === 100) {
    container.classList.add("full");
  } else {
    container.classList.remove("full");
  }
}

function renderTaskSlide(task) {
  const isCompleted = task.completed ? "completed" : "";
  const slideHTML = `
        <div class="swiper-slide ${isCompleted}" id="slide-${task.id}">
            <div class="slide-content">${task.text}</div>
            <div class="slide-actions">
                <button class="btn-complete" onclick="toggleComplete(${task.id})">تم</button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">حذف</button>
            </div>
        </div>
    `;
  swiper.appendSlide(slideHTML);
}

function loadSavedTasks() {
  if (tasks.length > 0) {
    tasks.forEach((task) => {
      renderTaskSlide(task);
    });
    swiper.update();
    updateProgress();
  }
}

function addTask() {
  const rawText = taskInput.value.trim();
  if (rawText === "") return;

  const cleanText = escapeHTML(rawText);

  const taskId = Date.now();

  const newTask = {
    id: taskId,
    text: cleanText,
    completed: false,
  };
  tasks.push(newTask);

  saveToLocalStorage();

  renderTaskSlide(newTask);
  swiper.update();

  swiper.slideTo(swiper.slides.length - 1);

  taskInput.value = "";
  updateProgress();
}

function toggleComplete(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;

    saveToLocalStorage();

    const slideElement = document.getElementById(`slide-${id}`);
    if (task.completed) {
      slideElement.classList.add("completed");
    } else {
      slideElement.classList.remove("completed");
    }
    updateProgress();
  }
}

function deleteTask(id) {
  const slideElement = document.getElementById(`slide-${id}`);
  if (!slideElement) return;

  const slideIndex = Array.from(swiperWrapper.children).indexOf(slideElement);

  // حذف من المصفوفة وتحديث LocalStorage
  tasks = tasks.filter((t) => t.id !== id);
  saveToLocalStorage();

  swiper.removeSlide(slideIndex);
  swiper.update();
  updateProgress();
}

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

loadSavedTasks();
