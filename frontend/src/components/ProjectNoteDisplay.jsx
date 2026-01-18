import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProjectNote } from "../lib/api";
import { Clock, Trash2 } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser"; 

const ProjectNotesDisplay = ({ projectId, notes = [], project }) => {
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();

  const deleteNoteMutation = useMutation({
    mutationFn: ({ noteId }) => deleteProjectNote(projectId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
    },
  });

  const formatTime = (dateString) => {
    if (!dateString) return "Just now";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Just now";
      
      const now = new Date();
      const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffHours < 1) return "Just now";
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const expiresAt = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const hoursLeft = Math.max(0, Math.floor((expiresAt - now) / (1000 * 60 * 60)));
      
      if (hoursLeft > 0) {
        return `${hoursLeft}h left`;
      }
      
      return "Expired";
    } catch {
      return "Just now";
    }
  };

  const recentNotes = notes.slice(0, 3);

  if (recentNotes.length === 0) return null;

  const isClient = authUser?._id === project?.client?._id;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <span className="badge badge-primary badge-sm">
            {notes.length}
          </span>
          Recent Notes
        </h4>
        <p className="text-xs opacity-70">Disappears in 24h</p>
      </div>

      <div className="space-y-2">
        {recentNotes.map((note) => {
          const isNoteOwner = authUser?._id === note.user?._id;
          const showDelete = isNoteOwner || isClient;
          
          return (
            <div
              key={note._id || note.createdAt}
              className={`p-3 rounded-lg border ${
                note.type === "client_note"
                  ? "border-primary/30 bg-primary/5"
                  : "border-secondary/30 bg-secondary/5"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="avatar">
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <img
                        src={note.user?.profilePic || "/default-avatar.png"}
                        alt={note.user?.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium">
                      {note.user?.fullName || "User"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs opacity-70 capitalize">
                        {note.user?.role || "User"}
                      </span>
                      <span className="text-xs opacity-50 mx-1">•</span>
                      <span className="text-xs opacity-70 flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatTime(note.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {showDelete && (
                  <button
                    onClick={() => deleteNoteMutation.mutate({ noteId: note._id })}
                    disabled={deleteNoteMutation.isPending}
                    className="btn btn-ghost btn-xs btn-circle opacity-50 hover:opacity-100 hover:text-error transition-opacity"
                    title="Delete note"
                  >
                    {deleteNoteMutation.isPending ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <Trash2 className="size-3" />
                    )}
                  </button>
                )}
              </div>
              
              <p className="text-sm mt-2">{note.note}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectNotesDisplay;