import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProjectNote } from "../lib/api";
import { X, Send, AlertCircle } from "lucide-react";

const ProjectNoteModal = ({ projectId, isOpen, onClose }) => {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const addNoteMutation = useMutation({
    mutationFn: (noteText) => addProjectNote(projectId, noteText),
    onSuccess: () => {
      setNote("");
      setError("");
      onClose();
      queryClient.invalidateQueries({ queryKey: ["project-notes", projectId] });
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
    },
    onError: (error) => {
      setError(error.response?.data?.message || "Failed to add note");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim()) {
      setError("Note cannot be empty");
      return;
    }
    
    if (note.length > 500) {
      setError("Note is too long (max 500 characters)");
      return;
    }
    
    addNoteMutation.mutate(note.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">Add Note</h3>
            <p className="text-sm opacity-70">Note will disappear in 24 hours</p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error mb-4 py-2">
            <AlertCircle className="size-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setError("");
            }}
            placeholder="Type your note here..."
            className="textarea textarea-bordered w-full h-32 resize-none"
            maxLength={500}
            autoFocus
          />
          
          <div className="flex justify-between items-center mt-2 mb-6">
            <p className="text-xs opacity-70">
              {note.length}/500 characters
            </p>
            <p className="text-xs opacity-70">
              Disappears in 24h
            </p>
          </div>

          {/* Action Buttons */}
          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={addNoteMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addNoteMutation.isPending || !note.trim()}
              className="btn btn-primary"
            >
              {addNoteMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-xs mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Add Note
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectNoteModal;