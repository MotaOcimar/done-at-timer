import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';
import { useTaskStore } from './store/useTaskStore';

describe('Playlist Execution Integration', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
  });

  it('allows starting a task and progresses through tasks', async () => {
    useTaskStore.getState().addTask('Task 1', 10);
    useTaskStore.getState().addTask('Task 2', 20);

    render(<App />);

    // Deve haver botões de Play para as tarefas
    const playButtons = screen.getAllByRole('button', { name: /Play task/i });
    expect(playButtons).toHaveLength(2);
    
    // Inicia a primeira tarefa
    fireEvent.click(playButtons[0]);

    // Task 1 should be IN_PROGRESS
    expect(useTaskStore.getState().tasks[0].status).toBe('IN_PROGRESS');
    expect(screen.getByText('Working On')).toBeInTheDocument();
    
    // Verifica se o título da tarefa ativa está correto
    const task1Titles = screen.getAllByText('Task 1');
    expect(task1Titles.some(el => el.tagName === 'H2')).toBe(true);

    // Mark as Done
    const doneBtn = screen.getByRole('button', { name: /Done/i });
    fireEvent.click(doneBtn);

    // Task 1 should be COMPLETED, Task 2 should be IN_PROGRESS (pela lógica de onComplete automática)
    const tasks = useTaskStore.getState().tasks;
    expect(tasks[0].status).toBe('COMPLETED');
    expect(tasks[1].status).toBe('IN_PROGRESS');

    const task2Titles = screen.getAllByText('Task 2');
    expect(task2Titles.some(el => el.tagName === 'H2')).toBe(true);
  });
});
