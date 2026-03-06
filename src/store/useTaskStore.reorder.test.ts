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
describe('reorderTasks with mixed status clamping', () => {
  it('prevents reordering non-PENDING tasks', () => {
    const store = useTaskStore.getState();
    store.addTask('C1', 10);
    store.addTask('P1', 10);
    const tasks = useTaskStore.getState().tasks;
    const idC1 = tasks[0].id;
    const idP1 = tasks[1].id;
    store.updateTask(idC1, { status: 'COMPLETED' });

    // Try to move COMPLETED task
    store.reorderTasks(idC1, idP1);

    const finalTasks = useTaskStore.getState().tasks;
    expect(finalTasks[0].id).toBe(idC1);
    expect(finalTasks[1].id).toBe(idP1);
  });

  it('clamps PENDING task reordering to after COMPLETED and IN_PROGRESS tasks', () => {
    const store = useTaskStore.getState();
    store.addTask('C1', 10);
    store.addTask('I1', 10);
    store.addTask('P1', 10);
    store.addTask('P2', 10);

    const tasks = useTaskStore.getState().tasks;
    const idC1 = tasks[0].id;
    const idI1 = tasks[1].id;
    const idP1 = tasks[2].id;
    const idP2 = tasks[3].id;

    store.updateTask(idC1, { status: 'COMPLETED' });
    store.updateTask(idI1, { status: 'IN_PROGRESS' });

    // Try to move P2 (index 3) to index 0 (over C1)
    store.reorderTasks(idP2, idC1);

    let currentTasks = useTaskStore.getState().tasks;
    // Should be clamped to index 2 (first pending position)
    expect(currentTasks[2].id).toBe(idP2);
    expect(currentTasks[3].id).toBe(idP1);
    expect(currentTasks[0].id).toBe(idC1);
    expect(currentTasks[1].id).toBe(idI1);

    // Try to move P1 (now at index 3) to index 1 (over I1)
    store.reorderTasks(idP1, idI1);

    currentTasks = useTaskStore.getState().tasks;
    // Should be clamped to index 2
    expect(currentTasks[2].id).toBe(idP1);
    expect(currentTasks[3].id).toBe(idP2);
  });
});

});
