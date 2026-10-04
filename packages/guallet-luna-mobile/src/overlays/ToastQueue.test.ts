import { describe, expect, it, vi } from 'vitest';
import { ToastQueue } from './ToastQueue';

describe('ToastQueue', () => {
  it('presents messages in order and advances on completion', () => {
    const queue = new ToastQueue();
    const first = queue.enqueue('success', 'Saved');
    const second = queue.enqueue('info', 'Synced');
    const third = queue.enqueue('warning', 'Offline');
    expect(queue.getSnapshot()?.message.id).toBe(first);
    queue.finish(first, queue.getSnapshot()!.generation);
    expect(queue.getSnapshot()?.message.id).toBe(second);
    queue.dismiss(second);
    expect(queue.getSnapshot()?.message.id).toBe(third);
    queue.dismiss(third);
    expect(queue.getSnapshot()).toBeNull();
  });

  it('removes queued notifications without disturbing the visible one', () => {
    const queue = new ToastQueue();
    const first = queue.enqueue('success', 'Saved');
    const removed = queue.enqueue('error', 'Failed');
    const last = queue.enqueue('info', 'Ready');
    queue.dismiss(removed);
    expect(queue.getSnapshot()?.message.id).toBe(first);
    queue.dismiss(first);
    expect(queue.getSnapshot()?.message.id).toBe(last);
  });

  it('defers until every sheet releases, tolerating duplicate callbacks', () => {
    const queue = new ToastQueue();
    queue.block('accounts');
    queue.block('accounts');
    queue.block('currency');
    const id = queue.enqueue('success', 'Saved');
    expect(queue.getSnapshot()).toBeNull();
    queue.release('accounts');
    queue.release('accounts');
    expect(queue.getSnapshot()).toBeNull();
    queue.release('currency');
    expect(queue.getSnapshot()?.message.id).toBe(id);
  });

  it('resumes interrupted messages first and ignores stale lifetime callbacks', () => {
    const queue = new ToastQueue();
    const first = queue.enqueue('success', 'Saved', { duration: 8000 });
    const original = queue.getSnapshot()!;
    const second = queue.enqueue('info', 'Ready');
    queue.block('sheet');
    expect(queue.getSnapshot()).toBeNull();
    queue.finish(first, original.generation);
    queue.release('sheet');
    const resumed = queue.getSnapshot()!;
    expect(resumed.message).toEqual(original.message);
    expect(resumed.generation).not.toBe(original.generation);
    queue.finish(first, original.generation);
    expect(queue.getSnapshot()).toBe(resumed);
    queue.finish(first, resumed.generation);
    expect(queue.getSnapshot()?.message.id).toBe(second);
  });

  it('dismisses all notifications even while they are deferred', () => {
    const queue = new ToastQueue();
    queue.enqueue('success', 'Saved');
    queue.block('sheet');
    queue.enqueue('info', 'Ready');
    queue.dismiss();
    queue.release('sheet');
    expect(queue.getSnapshot()).toBeNull();
  });

  it('dismisses the message before running its action, exactly once', () => {
    const queue = new ToastQueue();
    const onPress = vi.fn(() => expect(queue.getSnapshot()).toBeNull());
    const id = queue.enqueue('info', 'Deleted', {
      action: { label: 'Undo', onPress },
    });
    const generation = queue.getSnapshot()!.generation;
    queue.runAction(id, generation);
    queue.runAction(id, generation);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('does not invoke actions when dismissed or hidden by a sheet', () => {
    const queue = new ToastQueue();
    const onPress = vi.fn();
    const id = queue.enqueue('info', 'Deleted', {
      action: { label: 'Undo', onPress },
    });
    const generation = queue.getSnapshot()!.generation;
    queue.block('sheet');
    queue.runAction(id, generation);
    queue.dismiss(id);
    queue.release('sheet');
    expect(queue.getSnapshot()).toBeNull();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('notifies subscribers when presentations change and supports unsubscribe', () => {
    const queue = new ToastQueue();
    const listener = vi.fn();
    const unsubscribe = queue.subscribe(listener);
    queue.enqueue('info', 'Ready');
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
    queue.dismiss();
    expect(listener).toHaveBeenCalledOnce();
  });
});
