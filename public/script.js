const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");
const taskCounter = document.getElementById("task-counter");

let tasks = [];

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    if (!response.ok) {
        throw new Error("Ошибка при работе с задачами");
    }

    return response.status === 204 ? null : response.json();
}

function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");

        if (task.completed) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Отметить задачу выполненной");

        checkbox.addEventListener("change", async () => {
            try {
                await request(`/api/tasks/${task.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ completed: checkbox.checked })
                });

                await loadTasks();
            } catch (error) {
                alert(error.message);
            }
        });

        const span = document.createElement("span");
        span.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Удалить";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", async () => {
            try {
                await request(`/api/tasks/${task.id}`, {
                    method: "DELETE"
                });

                await loadTasks();
            } catch (error) {
                alert(error.message);
            }
        });

        li.append(checkbox, span, deleteButton);
        taskList.appendChild(li);
    });

    emptyMessage.hidden = tasks.length > 0;

    const completedCount = tasks.filter(task => task.completed).length;

    taskCounter.textContent =
        `Всего задач: ${tasks.length} | Выполнено: ${completedCount}`;
}

async function loadTasks() {
    try {
        tasks = await request("/api/tasks");
        renderTasks();
    } catch (error) {
        alert("Не удалось загрузить задачи. Проверь работу сервера.");
    }
}

form.addEventListener("submit", async event => {
    event.preventDefault();

    const text = input.value.trim();

    if (!text) {
        return;
    }

    try {
        await request("/api/tasks", {
            method: "POST",
            body: JSON.stringify({ text })
        });

        input.value = "";
        await loadTasks();
    } catch (error) {
        alert(error.message);
    }
});

loadTasks();
