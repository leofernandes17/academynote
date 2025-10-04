const daysContainer = document.getElementById("days");
const monthYear = document.getElementById("monthYear");
const taskList = document.getElementById("taskList");
const notifications = document.getElementById("notifications");

let selectedDate = new Date().toISOString().split("T")[0]; // data atual
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Renderizar calendário
function renderCalendar() {
    const date = new Date();
    const month = date.getMonth();
    const year = date.getFullYear();

    monthYear.textContent = date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
    });

    daysContainer.innerHTML = "";
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement("div");
        day.classList.add("day");

        const dayDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
        day.textContent = i;

        if (dayDate === selectedDate) {
            day.classList.add("active");
        }

        day.addEventListener("click", () => {
            // Remove a classe 'active' do dia anteriormente selecionado
            const currentActiveDay = document.querySelector(".day.active");
            if (currentActiveDay) {
                currentActiveDay.classList.remove("active");
            }

            selectedDate = dayDate;
            day.classList.add("active"); // Adiciona a classe 'active' ao dia clicado

            // Adiciona uma animação simples (ex: pulso ou escala)
            day.style.transform = 'scale(1.1)';
            day.style.transition = 'transform 0.1s ease-in-out';
            setTimeout(() => {
                day.style.transform = 'scale(1)';
            }, 100);

            renderTasks();
        });

        daysContainer.appendChild(day);
    }
}

// Renderizar tarefas
function renderTasks() {
    taskList.innerHTML = "";
    const filtered = tasks.filter(t => t.date === selectedDate);

    if (filtered.length === 0) {
        taskList.innerHTML = "<p>Nenhuma tarefa para este dia.</p>";
        return;
    }

    filtered.forEach(task => {
        const div = document.createElement("div");
        div.classList.add("task");

        // Adiciona classe para realce se a tarefa estiver próxima
        const taskDateTime = new Date(`${task.date}T${task.time || "00:00"}`);
        const now = new Date();
        const diff = (taskDateTime - now) / (1000 * 60); // em minutos

        if (diff > 0 && diff <= 60) {
            div.classList.add("upcoming-task"); // Classe para realce
        }

        div.innerHTML = `
            <span>${task.title} - ${task.time}</span>
            <button onclick="confirmDeleteTask('${task.id}')">❌</button>
        `;
        taskList.appendChild(div);
    });
}

// Salvar nova tarefa
document.getElementById("saveTask").addEventListener("click", () => {
    const title = document.getElementById("taskTitle").value;
    const date = document.getElementById("taskDate").value;
    const time = document.getElementById("taskTime").value;
    const details = document.getElementById("taskDetails").value;

    if (!title || !date) {
        alert("Preencha pelo menos título e data.");
        return;
    }

    const newTask = {
        id: Date.now(),
        title,
        date,
        time,
        details
    };

    tasks.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDate").value = "";
    document.getElementById("taskTime").value = "";
    document.getElementById("taskDetails").value = "";

    renderTasks();
    renderNotifications();
});

// Confirmar e Excluir tarefa
function confirmDeleteTask(id) {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
        deleteTask(id);
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id != id);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    renderNotifications();
}

// Renderizar notificações
function renderNotifications() {
    notifications.innerHTML = "";
    const now = new Date();

    tasks.forEach(task => {
        const taskDateTime = new Date(`${task.date}T${task.time || "00:00"}`);
        const diff = (taskDateTime - now) / (1000 * 60); // em minutos

        if (diff > 0 && diff <= 60) {
            const div = document.createElement("div");
            div.classList.add("notification");
            div.textContent = `⏰ "${task.title}" começa em ${Math.floor(diff)} min`;
            notifications.appendChild(div);
        }
    });
}

// Atualizar notificações a cada minuto
setInterval(renderNotifications, 60000);

// Chamadas iniciais
renderCalendar();
renderTasks();
renderNotifications();