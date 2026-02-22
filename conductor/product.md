# Product Definition

## 1. Initial Concept

O usuário quer construir um aplicativo de timer focado na _previsão de término_.
**Funcionalidades Principais:**

- **Foco no Horário de Término:** O destaque principal do timer é mostrar a hora exata em que ele vai acabar (ex: "Termina às 14:30"), ao invés de apenas uma contagem regressiva.
- **Plataforma Web:** App web acessível via navegador e deployado publicamente no GitHub Pages.
- **Listas de Tarefas (Timers Consecutivos):**
  - O usuário pode criar listas de tarefas (ex: "Rotina Matinal").
  - Cada tarefa tem uma duração definida (ex: "Tomar banho - 20 min").
  - **Previsão Total:** O app soma todos os tempos da lista e mostra, com destaque, o _horário previsto para terminar toda a lista_.
- **Execução Flexível:**
  - O usuário inicia (dá play) em cada tarefa individualmente.
  - A ordem de execução é livre; o usuário pode dar play em qualquer timer da lista.
  - **Reordenação Intuitiva:** O usuário pode reorganizar a ordem das tarefas arrastando-as (Drag and Drop), facilitando o planejamento da rotina.

## 2. Core Value Proposition

The primary value of this application is to solve the problem of **lateness due to time blindness** or poor estimation of task duration. By shifting the focus from "time remaining" (duration) to **"arrival time" (predicted completion time)**, the app mimics the utility of a GPS ETA for everyday tasks.

- **Problem Solved:** Users often underestimate the cumulative time required for a sequence of tasks or delay starting until it's too late, failing to realize that "20 minutes" for a shower plus "15 minutes" for breakfast means they will be ready at a specific _future time_, not just "in 35 minutes".
- **Solution:** A "Real-time Arrival Clock" that dynamically calculates and displays the exact time the user will be "free" or "done" if they start the remaining tasks _right now_. This provides a concrete, actionable data point (e.g., "If I start now, I'm done at 08:15") rather than an abstract duration.

## 3. Target Audience

- **Primary:** Individuals who experience **time blindness** and struggle to visualize the passage of time or the cumulative effect of sequences of tasks.
- **Secondary:** Anyone who performs routine sequences of tasks (e.g., morning routines, cooking, getting ready for an event) and wants to avoid lateness or optimize their departure time.

## 4. Key Features

- **Real-time "Arrival" Clock:** A prominent, dynamic display showing the exact wall-clock time when the _remaining_ tasks in the current list will be completed if started immediately. This is the central feature.
- **Manual Completion Confirmation:** Tasks do not auto-advance when time expires. Users must manually confirm completion, ensuring the Arrival Clock remains accurate even when tasks take longer than estimated.
- **Actual vs Estimated Tracking:** When a task is completed, the app records and displays the real time taken side-by-side with the original estimate.
- **Dynamic Update:** As tasks are completed or time passes, the "Arrival Clock" updates to reflect the new reality.
- **Task Lists:** Users can create lists of tasks with defined durations (e.g., "Morning Routine").
- **Flexible Execution:** Users can start any timer in the list in any order.
- **Inline Editing:** Ability to update task names and durations directly within the list by clicking on them.
- **Web-Based:** Accessible via a web browser for easy local testing and usage.

## 5. Success Metrics

- **User Confidence:** Users report feeling more in control of their time and less anxious about lateness.
- **Reduced Lateness:** Users are able to arrive at appointments or finish routines on time more consistently.
- **Engagement:** Frequent use of the app for daily routines.

## 6. Project Roadmap & Backlog

All future ideas, requested improvements, and technical debt are tracked in the centralized [Backlog](./backlog.md) file.
