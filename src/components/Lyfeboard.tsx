import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Edit3, Save } from "lucide-react";

interface StickyNote {
  id: string;
  content: string;
  color: string;
  position: { x: number; y: number };
}

const Lyfeboard = () => {
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([
    {
      id: "1",
      content: "Remember to practice gratitude daily ✨",
      color: "from-pink-500 to-purple-500",
      position: { x: 20, y: 20 }
    },
    {
      id: "2", 
      content: "Goal: Read 20 pages today 📚",
      color: "from-blue-500 to-cyan-500",
      position: { x: 200, y: 80 }
    }
  ]);
  
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState<string | null>(null);

  const colors = [
    "from-pink-500 to-purple-500",
    "from-blue-500 to-cyan-500", 
    "from-green-500 to-teal-500",
    "from-orange-500 to-yellow-500",
    "from-red-500 to-pink-500"
  ];

  const addStickyNote = () => {
    if (!newNoteContent.trim()) return;
    
    const newNote: StickyNote = {
      id: Date.now().toString(),
      content: newNoteContent,
      color: colors[Math.floor(Math.random() * colors.length)],
      position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 }
    };
    
    setStickyNotes([...stickyNotes, newNote]);
    setNewNoteContent("");
    setIsAddingNote(false);
  };

  const deleteNote = (id: string) => {
    setStickyNotes(stickyNotes.filter(note => note.id !== id));
  };

  const updateNote = (id: string, content: string) => {
    setStickyNotes(stickyNotes.map(note => 
      note.id === id ? { ...note, content } : note
    ));
    setEditingNote(null);
  };

  return (
    <Card className="vyral-card animate-fade-in relative min-h-96 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold vyral-text-glow">Lyfeboard</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-primary"
          onClick={() => setIsAddingNote(true)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="relative h-80 bg-gradient-to-br from-background/50 to-card/50 rounded-lg border border-border/50 overflow-hidden">
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-10" 
             style={{
               backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
               backgroundSize: '20px 20px'
             }} 
        />
        
        {/* Sticky Notes */}
        {stickyNotes.map((note) => (
          <div
            key={note.id}
            className={`absolute w-40 h-32 p-3 rounded-lg shadow-lg transform rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-200 bg-gradient-to-br ${note.color} animate-float cursor-move`}
            style={{
              left: note.position.x,
              top: note.position.y,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            <div className="relative h-full">
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-1 -right-1 w-6 h-6 p-0 rounded-full bg-black/20 hover:bg-black/40 text-white"
                onClick={() => deleteNote(note.id)}
              >
                <X className="w-3 h-3" />
              </Button>
              
              {editingNote === note.id ? (
                <Textarea
                  value={note.content}
                  onChange={(e) => updateNote(note.id, e.target.value)}
                  className="w-full h-20 text-xs bg-transparent border-none resize-none text-white placeholder:text-white/70"
                  onBlur={() => setEditingNote(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      setEditingNote(null);
                    }
                  }}
                  autoFocus
                />
              ) : (
                <div 
                  className="text-xs text-white/90 leading-relaxed cursor-text h-20 overflow-hidden"
                  onClick={() => setEditingNote(note.id)}
                >
                  {note.content}
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-0 right-0 w-6 h-6 p-0 rounded-full bg-black/20 hover:bg-black/40 text-white"
                onClick={() => setEditingNote(note.id)}
              >
                <Edit3 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
        
        {/* Add Note Interface */}
        {isAddingNote && (
          <div className="absolute bottom-4 left-4 right-4 bg-card border border-border rounded-lg p-4 animate-slide-up">
            <div className="space-y-3">
              <Textarea
                placeholder="What's on your mind? ✨"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="min-h-20 resize-none"
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={addStickyNote}
                  className="vyral-button-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNoteContent("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Lyfeboard;