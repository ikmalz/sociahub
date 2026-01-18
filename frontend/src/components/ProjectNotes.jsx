import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addProjectNote, getProjectNotes } from "../lib/api";
import { MessageSquare, Send, User, Clock } from "lucide-react";

const ProjectNotes = ({ projectId, project }) => {
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const { data: notesData, isLoading } = useQuery({
    queryKey: ["project-notes", projectId],
    queryFn: () => getProjectNotes(projectId),
  });

  const notes = notesData?.notes || [];
  const lastNote = notesData?.lastNote;

  const addNoteMutation = useMutation({
    mutationFn: (noteText) => addProjectNote(projectId, noteText),
    onSuccess: () => {
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["project-notes", projectId] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    
    addNoteMutation.mutate(note.trim());
  };

  // Helper function untuk format waktu yang aman
  const formatTime = (dateString) => {
    if (!dateString) return "Just now";
    
    try {
      const date = new Date(dateString);
      
      // Cek jika date valid
      if (isNaN(date.getTime())) {
        return "Just now";
      }
      
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      if (diffSec < 60) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      if (diffDay < 7) return `${diffDay}d ago`;
      
      // Format date untuk > 7 hari
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Just now";
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="size-5 text-primary" />
          <div>
            <h3 className="font-semibold">Project Notes</h3>
            <p className="text-xs opacity-70">
              Leave quick notes like Instagram comments
            </p>
          </div>
          <span className="badge badge-primary badge-sm ml-auto">
            {notes.length} notes
          </span>
        </div>

        {/* Last Note Preview */}
        {lastNote && (
          <div className="mb-4 p-3 bg-base-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="avatar">
                <div className="w-6 h-6 rounded-full">
                  <img
                    src={lastNote.user?.profilePic || "/default-avatar.png"}
                    alt={lastNote.user?.fullName}
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium">{lastNote.user?.fullName || "User"}</p>
                <p className="text-xs opacity-70">{lastNote.user?.role || "User"}</p>
              </div>
              <span className="text-xs opacity-70 ml-auto">
                {formatTime(lastNote.createdAt)}
              </span>
            </div>
            <p className="text-sm">{lastNote.note}</p>
          </div>
        )}

        {/* Add Note Form */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="textarea textarea-bordered flex-1 textarea-sm"
              rows={2}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={addNoteMutation.isPending || !note.trim()}
              className="btn btn-primary btn-sm self-start"
            >
              {addNoteMutation.isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Send className="size-4" />
              )}
            </button>
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-xs opacity-70">
              {note.length}/500 characters
            </p>
            <p className="text-xs opacity-70">
              Press Enter to send
            </p>
          </div>
        </form>

        {/* Notes List */}
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-sm text-primary" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-6 opacity-70">
              <MessageSquare className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notes yet</p>
              <p className="text-xs">Be the first to leave a note!</p>
            </div>
          ) : (
            notes.slice().reverse().map((noteItem) => (
              <div
                key={noteItem._id || noteItem.createdAt}
                className="flex gap-3 p-3 border border-base-300 rounded-lg"
              >
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full">
                    <img
                      src={noteItem.user?.profilePic || "/default-avatar.png"}
                      alt={noteItem.user?.fullName}
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-sm font-medium">
                        {noteItem.user?.fullName || "User"}
                      </p>
                      <span className={`badge badge-xs ${
                        noteItem.type === "client_note" 
                          ? "badge-primary" 
                          : "badge-secondary"
                      }`}>
                        {noteItem.user?.role || "User"}
                      </span>
                    </div>
                    <span className="text-xs opacity-70">
                      {formatTime(noteItem.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm">{noteItem.note}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectNotes;