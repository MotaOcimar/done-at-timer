import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { App } from './App';
import { useTaskStore } from './store/useTaskStore';

describe('Playlist Execution Integration', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
  });

  it('allows starting a task and progresses through tasks', async () => {
    useTaskStore.getState().addTask('Task 1', 10);
    useTaskStore.getState().addTask('Task 2', 20);

    render(<App />);

    // Check if Arrival Display is present
    expect(screen.getByText('You will be done at')).toBeInTheDocument();

    // Deve haver botões de Play para as tarefas
    const playButtons = screen.getAllByRole('button', { name: /Play task/i });
    expect(playButtons).toHaveLength(2);
    
    // Inicia a primeira tarefa
    fireEvent.click(playButtons[0]);

    // Task 1 should be IN_PROGRESS
    expect(useTaskStore.getState().tasks[0].status).toBe('IN_PROGRESS');
    
    // Verifica se o título da tarefa ativa está destacado (agora é H3 com font-bold)
    const task1Title = screen.getByText('Task 1');
    expect(task1Title.tagName).toBe('H3');
    expect(task1Title).toHaveClass('font-bold');

    // Mark as Done
    const doneBtn = screen.getByRole('button', { name: /Done/i });
    fireEvent.click(doneBtn);

    // Task 1 should be COMPLETED, Task 2 should be IN_PROGRESS (pela lógica de onComplete automática)
    const tasks = useTaskStore.getState().tasks;
    expect(tasks[0].status).toBe('COMPLETED');
    expect(tasks[1].status).toBe('IN_PROGRESS');

    const task2Title = screen.getByText('Task 2');
    expect(task2Title.tagName).toBe('H3');
    expect(task2Title).toHaveClass('font-bold');
  });
});
