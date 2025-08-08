import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Edit3, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StickyNote {
  id: string;
  content: string;
  color: string;
  position: { x: number; y: number };
}

const Lyfeboard = () => {
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const colors = [
    "from-pink-500 to-purple-500",
    "from-blue-500 to-cyan-500", 
    "from-green-500 to-teal-500",
    "from-orange-500 to-yellow-500",
    "from-red-500 to-pink-500"
  ];

  useEffect(() => {
    loadStickyNotes();
  }, []);

  const loadStickyNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('sticky_notes')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading sticky notes:', error);
        return;
      }

      const notes = data?.map(note => ({
        id: note.id,
        content: note.content,
        color: note.color || colors[0],
        position: { x: note.position_x || 0, y: note.position_y || 0 }
      })) || [];

      setStickyNotes(notes);
    } catch (error) {
      console.error('Error loading sticky notes:', error);
    }
  };

  const addStickyNote = async () => {
    if (!newNoteContent.trim()) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newNote = {
        user_id: user.id,
        content: newNoteContent,
        color: colors[Math.floor(Math.random() * colors.length)],
        position_x: Math.random() * 200 + 50,
        position_y: Math.random() * 200 + 50
      };

      const { data, error } = await supabase
        .from('sticky_notes')
        .insert([newNote])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create sticky note",
          variant: "destructive"
        });
        return;
      }

      const note: StickyNote = {
        id: data.id,
        content: data.content,
        color: data.color || colors[0],
        position: { x: data.position_x || 0, y: data.position_y || 0 }
      };

      setStickyNotes([...stickyNotes, note]);
      setNewNoteContent("");
      setIsAddingNote(false);
    } catch (error) {
      console.error('Error creating sticky note:', error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sticky_notes')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete sticky note",
          variant: "destructive"
        });
        return;
      }

      setStickyNotes(stickyNotes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting sticky note:', error);
    }
  };

  const updateNote = async (id: string, content: string) => {
    try {
      const { error } = await supabase
        .from('sticky_notes')
        .update({ content })
        .eq('id', id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update sticky note",
          variant: "destructive"
        });
        return;
      }

      setStickyNotes(stickyNotes.map(note => 
        note.id === id ? { ...note, content } : note
      ));
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating sticky note:', error);
    }
  };

  const updateNotePosition = async (id: string, x: number, y: number) => {
    try {
      const { error } = await supabase
        .from('sticky_notes')
        .update({ position_x: x, position_y: y })
        .eq('id', id);

      if (error) {
        console.error('Error updating note position:', error);
        return;
      }

      setStickyNotes(stickyNotes.map(note => 
        note.id === id ? { ...note, position: { x, y } } : note
      ));
    } catch (error) {
      console.error('Error updating note position:', error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, noteId: string) => {
    if (editingNote === noteId) return;
    
    const note = stickyNotes.find(n => n.id === noteId);
    if (!note) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (!containerRect) return;

    setIsDragging(noteId);
    setDragOffset({
      x: e.clientX - (containerRect.left + note.position.x),
      y: e.clientY - (containerRect.top + note.position.y)
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(containerRect.width - 160, e.clientX - containerRect.left - dragOffset.x));
    const newY = Math.max(0, Math.min(containerRect.height - 128, e.clientY - containerRect.top - dragOffset.y));

    setStickyNotes(stickyNotes.map(note => 
      note.id === isDragging ? { ...note, position: { x: newX, y: newY } } : note
    ));
  };

  const handleMouseUp = () => {
    if (isDragging) {
      const note = stickyNotes.find(n => n.id === isDragging);
      if (note) {
        updateNotePosition(isDragging, note.position.x, note.position.y);
      }
      setIsDragging(null);
    }
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
      
      <div 
        ref={containerRef}
        className="relative h-80 bg-gradient-to-br from-background/50 to-card/50 rounded-lg border border-border/50 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
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
            className={`absolute w-40 h-32 p-3 rounded-lg shadow-lg transform rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-200 bg-gradient-to-br ${note.color} animate-float cursor-move select-none ${
              isDragging === note.id ? 'z-50 scale-105 rotate-0 shadow-2xl' : 'z-10'
            }`}
            style={{
              left: note.position.x,
              top: note.position.y,
              animationDelay: `${Math.random() * 2}s`
            }}
            onMouseDown={(e) => handleMouseDown(e, note.id)}
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