import React, { useState } from 'react';
import { useSanctuary } from '../context/SanctuaryContext';

export const TodoModal = ({ isOpen, onClose }) => {
  const { activeTasks, completedTasks, addTask, toggleTask, deleteTask, editTask } = useSanctuary();
  const [newInput, setNewInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newInput.trim()) return;
    const ok = addTask(newInput);
    if (ok) setNewInput('');
  };

  const handleStartEdit = (task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const handleSaveEdit = (id) => {
    editTask(id, editText);
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass-panel-opaque rounded-xl p-6 shadow-2xl relative border border-white/60">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Rule of 3</h2>
            <p className="font-label-sm text-label-sm text-outline">
              Focus on up to 3 active priorities ({activeTasks.length}/3)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant p-1.5 rounded-full hover:bg-white/40 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Active Priorities Section */}
        <div className="space-y-2.5 mb-5">
          <h3 className="font-label-sm text-xs text-primary uppercase tracking-widest px-1 font-semibold">
            Active Priorities
          </h3>

          {activeTasks.length === 0 ? (
            <p className="text-center py-4 font-body-md text-on-surface-variant/70 italic text-sm">
              Your active priorities are clear. Add up to 3 thoughts.
            </p>
          ) : (
            activeTasks.map((task, idx) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-white/40 shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                  <span className="font-bold text-xs text-primary bg-primary-container/50 w-5 h-5 rounded-full flex items-center justify-center">
                    {idx + 1}
                  </span>

                  <button
                    onClick={() => toggleTask(task.id)}
                    className="w-5 h-5 rounded-full border-2 border-outline hover:border-primary flex items-center justify-center transition-all shrink-0"
                    title="Mark Complete"
                  />

                  {editingId === task.id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => handleSaveEdit(task.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(task.id)}
                      autoFocus
                      className="w-full bg-white/80 border border-primary/30 rounded-lg px-2.5 py-1 text-body-md text-on-surface focus:outline-none"
                    />
                  ) : (
                    <span
                      onClick={() => toggleTask(task.id)}
                      className="font-body-md text-body-md text-on-surface cursor-pointer truncate"
                    >
                      {task.text}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {editingId !== task.id && (
                    <button
                      onClick={() => handleStartEdit(task)}
                      className="p-1 text-outline hover:text-primary rounded-full transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-outline hover:text-error rounded-full transition-colors"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Completed History Section */}
        {completedTasks.length > 0 && (
          <div className="mb-5 border-t border-white/30 pt-3">
            <h3 className="font-label-sm text-xs text-outline uppercase tracking-widest px-1 mb-2">
              Completed ({completedTasks.length})
            </h3>
            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/20 text-outline text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shrink-0"
                      title="Reopen Priority"
                    >
                      <span className="material-symbols-outlined text-[10px]">check</span>
                    </button>
                    <span className="line-through truncate">{task.text}</span>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-0.5 hover:text-error opacity-60 hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Task Form (Allowed if activeTasks < 3) */}
        {activeTasks.length < 3 ? (
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              placeholder="Add active priority..."
              value={newInput}
              onChange={(e) => setNewInput(e.target.value)}
              className="flex-1 bg-white/70 border border-white/50 rounded-full px-4 py-2 font-body-md text-body-md text-on-surface placeholder-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
            <button
              type="submit"
              className="bg-primary text-white px-5 py-2 rounded-full font-label-sm text-label-sm hover:bg-primary/90 transition-transform active:scale-95 shadow-sm"
            >
              Add
            </button>
          </form>
        ) : (
          <div className="text-center p-2 rounded-lg bg-tertiary-container/30 border border-tertiary-container text-on-tertiary-container font-label-sm text-xs">
            3 active priorities set. Complete one to open a new slot.
          </div>
        )}
      </div>
    </div>
  );
};
