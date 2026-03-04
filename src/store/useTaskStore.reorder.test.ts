import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from './useTaskStore';

describe('useTaskStore reordering consistency', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
  });

  it('should reorder tasks when status is updated to IN_PROGRESS via updateTask', () => {
    const store = useTaskStore.getState();
    
    // Add 3 tasks
    store.addTask('Task 1', 10);
    store.addTask('Task 2', 10);
    store.addTask('Task 3', 10);
    
    const tasks = useTaskStore.getState().tasks;
    const task3Id = tasks[2].id;
    
    // updateTask Task 3 to IN_PROGRESS
    useTaskStore.getState().updateTask(task3Id, { status: 'IN_PROGRESS' });
    
    const updatedTasks = useTaskStore.getState().tasks;
    
    // Task 3 should be at index 0 (top of the list)
    expect(updatedTasks[0].id).toBe(task3Id);
    expect(updatedTasks[0].status).toBe('IN_PROGRESS');
  });

  it('should maintain reordering when starting a task via startTask', () => {
    const store = useTaskStore.getState();
    
    store.addTask('Task 1', 10);
    store.addTask('Task 2', 10);
    store.addTask('Task 3', 10);
    
    const tasks = useTaskStore.getState().tasks;
    const task3Id = tasks[2].id;
    
    // startTask Task 3
    useTaskStore.getState().startTask(task3Id);
    
    const updatedTasks = useTaskStore.getState().tasks;
    
    // Task 3 should be at index 0
    expect(updatedTasks[0].id).toBe(task3Id);
    expect(updatedTasks[0].status).toBe('IN_PROGRESS');
  });
});
