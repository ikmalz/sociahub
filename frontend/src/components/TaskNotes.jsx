import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addTaskNote, getTaskNotes } from "../lib/api";
import { FileText, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TaskNotes = ({ taskId, task }) => {
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const { data: notesData, isLoading } = useQuery({
    queryKey: ["task-notes", taskId],
    queryFn: () => getTaskNotes(taskId),
  });

  const notes = notesData?.notes || [];

  const addNoteMutation = useMutation({
    mutationFn: (noteText) => addTaskNote(taskId, noteText),
    onSuccess: () => {
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["task-notes", taskId] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    
    addNoteMutation.mutate(note.trim());
  };

  return (
    <div className="border-t border-base-300 pt-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="size-4 text-primary" />
        <h4 className="font-medium text-sm">Task Notes</h4>
        <span className="badge badge-primary badge-xs ml-auto">
          {notes.length}
        </span>
      </div>

      {/* Quick Note Form */}
      <form onSubmit={handleSubmit} className="mb-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Quick note..."
            className="input input-bordered input-sm flex-1"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={addNoteMutation.isPending || !note.trim()}
            className="btn btn-primary btn-sm"
          >
            <Send className="size-3" />
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {notes.slice().reverse().map((noteItem) => (
          <div
            key={noteItem._id}
            className="flex items-start gap-2 p-2 bg-base-200 rounded text-xs"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={noteItem.user?.profilePic || "/default-avatar.png"}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="font-medium">{noteItem.user?.fullName}</span>
                <span className="opacity-70 text-[10px]">
                  {formatDistanceToNow(new Date(noteItem.createdAt), { 
                    addSuffix: true 
                  })}
                </span>
              </div>
              <p>{noteItem.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskNotes;