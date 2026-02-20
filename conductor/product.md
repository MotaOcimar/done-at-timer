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
  - A ordem de execução é livre; o usuário pode dar play em qualquer timer da lista, não necessariamente na ordem criada.

## 2. Core Value Proposition

The primary value of this application is to solve the problem of **lateness due to time blindness** or poor estimation of task duration. By shifting the focus from "time remaining" (duration) to **"arrival time" (predicted completion time)**, the app mimics the utility of a GPS ETA for everyday tasks.

- **Problem Solved:** Users often underestimate the cumulative time required for a sequence of tasks or delay starting until it's too late, failing to realize that "20 minutes" for a shower plus "15 minutes" for breakfast means they will be ready at a specific _future time_, not just "in 35 minutes".
- **Solution:** A "Real-time Arrival Clock" that dynamically calculates and displays the exact time the user will be "free" or "done" if they start the remaining tasks _right now_. This provides a concrete, actionable data point (e.g., "If I start now, I'm done at 08:15") rather than an abstract duration.

## 3. Target Audience

- **Primary:** Individuals with **ADHD or time blindness** who struggle to visualize the passage of time and the cumulative effect of tasks.
- **Secondary:** Anyone who performs routine sequences of tasks (e.g., morning routines, cooking, getting ready for an event) and wants to avoid lateness or optimize their departure time.

## 4. Key Features

- **Real-time "Arrival" Clock:** A prominent, dynamic display showing the exact wall-clock time when the _remaining_ tasks in the current list will be completed if started immediately. This is the central feature.
- **Dynamic Update:** As tasks are completed or time passes, the "Arrival Clock" updates to reflect the new reality.
- **Task Lists:** Users can create lists of tasks with defined durations (e.g., "Morning Routine").
- **Flexible Execution:** Users can start any timer in the list in any order.
- **Web-Based:** Accessible via a web browser for easy local testing and usage.

## 5. Success Metrics

- **User Confidence:** Users report feeling more in control of their time and less anxious about lateness.
- **Reduced Lateness:** Users are able to arrive at appointments or finish routines on time more consistently.
- **Engagement:** Frequent use of the app for daily routines.

## 6. Future Roadmap & Feedback

Based on user feedback and planned improvements:

- **Dark Mode:** Implementation of a dark theme with a manual toggle for user preference.
- **Save Routines:** Allow users to save groups of tasks (e.g., "Morning Routine") to be reused and loaded later.
- **Quick Complete:** Add a button to tasks in the list to mark them as completed even if they haven't been started.
- **Swipe to Delete:** Implement a mobile-friendly "swipe to the side" gesture to delete tasks from the list.
- **Inline Editing:** Allow users to edit task names and durations by simply clicking on them in the list.
- **Drag & Drop Reordering:** Enable drag-and-drop functionality to easily reorder tasks in the list.
- **Completion Checkpoint:**
    - Add an optional confirmation step when a task timer ends ("Did you actually finish?").
    - Include a toggle setting to enable/disable this manual confirmation (auto-advance vs. manual advance).
- **Refined Animations:** Change the "pulse" animation on progress bars to a "shimmer/wave" effect (left-to-right) to better convey forward momentum.

## 7. Technical Debt

- **Code Comments:** Translate Portuguese comments in `src/hooks/useTimer.ts` to English for consistency.
- **Cleanup:** Remove unused `elapsedSeconds` variable in `src/store/useTaskStore.ts` inside the `pauseTask` action.
