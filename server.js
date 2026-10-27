const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_DIR = process.env.DATA_DIR || "/app/data";
const DATA_FILE = path.join(DATA_DIR, "tasks.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function ensureDataFile() {
    fs.mkdirSync(DATA_DIR, { recursive: true });

    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, "[]", "utf8");
    }
}

function readTasks() {
    ensureDataFile();
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveTasks(tasks) {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), "utf8");
}

app.get("/api/tasks", (req, res) => {
    try {
        res.json(readTasks());
    } catch (error) {
        res.status(500).json({ error: "Не удалось прочитать задачи" });
    }
});

app.post("/api/tasks", (req, res) => {
    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";

    if (!text) {
        return res.status(400).json({ error: "Введите текст задачи" });
    }

    try {
        const tasks = readTasks();
        const task = {
            id: Date.now().toString(),
            text,
            completed: false
        };

        tasks.push(task);
        saveTasks(tasks);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: "Не удалось сохранить задачу" });
    }
});

app.patch("/api/tasks/:id", (req, res) => {
    try {
        const tasks = readTasks();
        const task = tasks.find(item => item.id === req.params.id);

        if (!task) {
            return res.status(404).json({ error: "Задача не найдена" });
        }

        if (typeof req.body.completed === "boolean") {
            task.completed = req.body.completed;
        }

        saveTasks(tasks);
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: "Не удалось обновить задачу" });
    }
});

app.delete("/api/tasks/:id", (req, res) => {
    try {
        const tasks = readTasks();
        const filtered = tasks.filter(item => item.id !== req.params.id);

        if (filtered.length === tasks.length) {
            return res.status(404).json({ error: "Задача не найдена" });
        }

        saveTasks(filtered);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: "Не удалось удалить задачу" });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
