// src/pages/notes/NotesPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  Edit,
  Trash2,
  Grid,
  List,
  Eye,
  Pin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { notesService } from '@/services/notesService';
import { topicService } from '@/services/topicService';
import RichTextEditor from '@/components/notes/RichTextEditor';
import NoteViewer from '@/components/notes/NoteViewer';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [allTags, setAllTags] = useState([]); 
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    loadNotes();
    loadAllTags();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [searchQuery, notes, selectedTags]);

  const loadNotes = async () => {
    try {
      const data = await notesService.getAll();
      console.log('📊 Raw data from API:', data);
      console.log('Is array?', Array.isArray(data));
      
      const notesArray = Array.isArray(data) ? data : [];
      console.log('📝 Notes to set:', notesArray);
      console.log('Notes count:', notesArray.length);
      
      setNotes(notesArray);
    } catch (error) {
      console.error('❌ Error loading notes:', error);
      toast.error('Failed to load notes');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Notes changed:', notes.length);
    console.log('🔄 Filtered notes:', filteredNotes.length);
    filterNotes();
  }, [searchQuery, notes, selectedTags]);

  const filterNotes = () => {
    let filtered = notes; 
    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note =>
        selectedTags.some(tag => note.tags?.includes(tag))
      );
    }
    setFilteredNotes(filtered);
  };

  const handleEdit = (note) => {
    setSelectedNote(note);
    setEditDialogOpen(true);
  };

  const handleView = (note) => {
    setSelectedNote(note);
    setViewDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesService.delete(id);
      toast.success('Note deleted');
      loadNotes();
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleTogglePin = async (id) => {
    try {
      await notesService.togglePin(id);
      toast.success('Note pin status updated');
      loadNotes();
    } catch (error) {
      toast.error('Failed to update pin status');
    }
  };

  const loadAllTags = async () => {
    try {
      const tags = await notesService.getAllTags();
      setAllTags(tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-text-dark dark:text-foreground mb-2">
            My <span className="text-green-700">Notes</span>
          </h1>
          <p className="text-text-medium dark:text-muted-foreground">
            Organize and manage your study notes with rich text formatting
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="w-5 h-5 mr-2" />
                AI Generate
              </Button>
            </DialogTrigger>
            <GenerateNotesDialog onSuccess={loadNotes} onClose={() => setGenerateDialogOpen(false)} />
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-forest to-forest-light">
                <Plus className="w-5 h-5 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <CreateNoteDialog onSuccess={loadNotes} onClose={() => setCreateDialogOpen(false)} />
          </Dialog>
        </div>
      </div>

      {/* Search & View Toggle */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-text-medium">Filter by tags:</span>
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
              onClick={() => {
                setSelectedTags(prev =>
                  prev.includes(tag)
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                );
              }}
            >
              {tag}
            </Badge>
          ))}
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTags([])}
              className="h-6 text-xs"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Notes Grid/List */}
      {filteredNotes.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              viewMode={viewMode}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-text-light mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No notes yet</h3>
            <p className="text-text-medium mb-4">
              Create your first note or let AI generate one for you
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setCreateDialogOpen(true)}>
                Create Note
              </Button>
              <Button variant="outline" onClick={() => setGenerateDialogOpen(true)}>
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <EditNoteDialog
          note={selectedNote}
          onSuccess={() => {
            loadNotes();
            setEditDialogOpen(false);
          }}
          onClose={() => setEditDialogOpen(false)}
        />
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <ViewNoteDialog
          note={selectedNote}
          onClose={() => setViewDialogOpen(false)}
        />
      </Dialog>
    </div>
  );
};

// Note Card Component
const NoteCard = ({ note, viewMode, onEdit, onView, onDelete, onTogglePin }) => {
  const typeColors = {
    generated: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    custom: 'bg-forest/10 text-forest border-forest/20',
    uploaded: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
  };

  // Strip HTML tags for preview
  const getPlainText = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-all">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 bg-gradient-to-br from-forest/10 to-forest-light/10 rounded-xl">
                <FileText className="w-6 h-6 text-forest" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-text-dark dark:text-foreground mb-1">
                  {note.title}
                </h3>
                <p className="text-sm text-text-medium line-clamp-1">
                  {getPlainText(note.content)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={typeColors[note.type] || typeColors.custom}>{note.type}</Badge>
              <Button variant="ghost" size="icon" onClick={() => onView(note)}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(note)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(note._id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onTogglePin(note._id)}
                className={note.isPinned ? 'text-yellow-500' : ''}
              >
                <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-yellow-500' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}>
      <Card className="h-full hover:shadow-lg transition-all">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-forest/10 to-forest-light/10 rounded-lg">
                <FileText className="w-5 h-5 text-forest" />
              </div>
              
              {note.isPinned && (
                <Pin className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              )}
            </div>
            <Badge className={typeColors[note.type] || typeColors.custom}>{note.type}</Badge>
          </div>
          <CardTitle className="text-xl line-clamp-2">{note.title}</CardTitle>
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {note.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-medium line-clamp-3">
            {getPlainText(note.content)}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onView(note)} className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(note)} className="flex-1">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onTogglePin(note._id)}
              className={note.isPinned ? 'text-yellow-500' : ''}
            >
              <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-yellow-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(note._id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CreateNoteDialog = ({ onSuccess, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]); 
  const [tagInput, setTagInput] = useState(''); 
  
    const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);
    try {
      await notesService.create({ title, content, tags, type: 'custom' }); // ← Include tags
      toast.success('Note created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create Note</DialogTitle>
        <DialogDescription>Write your study notes with rich text formatting</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="e.g., OSI Model Summary"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <Label>Content *</Label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your notes..."
          />
        </div>
        
        <div>
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            placeholder="Type a tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                  onClick={() => handleRemoveTag(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-forest to-forest-light">
            {loading ? 'Creating...' : 'Create Note'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Edit Note Dialog
const EditNoteDialog = ({ note, onSuccess, onClose }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
    }
  }, [note]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);
    try {
      await notesService.update(note._id, { title, content });
      toast.success('Note updated successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  if (!note) return null;

  return (
    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Note</DialogTitle>
        <DialogDescription>Update your note with rich text formatting</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="edit-title">Title *</Label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <Label>Content *</Label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Edit your notes..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-forest to-forest-light">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// View Note Dialog
const ViewNoteDialog = ({ note, onClose }) => {
  if (!note) return null;

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{note.title}</DialogTitle>
        <DialogDescription>
          <Badge className="mt-2">{note.type}</Badge>
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        <NoteViewer content={note.content} />
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onClose}>Close</Button>
      </div>
    </DialogContent>
  );
};

// Generate Notes Dialog (same as before)
const GenerateNotesDialog = ({ onSuccess, onClose }) => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState('');

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const data = await topicService.getAll();
      setTopics(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load topics:', error);
      setTopics([]);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTopic) {
      toast.error('Please select a topic');
      return;
    }

    setLoading(true);
    try {
      const result = await notesService.generateNotes(selectedTopic);
      setGeneratedNotes(result.content);
      toast.success('Notes generated!');
    } catch (error) {
      toast.error('Failed to generate notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedNotes) return;

    try {
      const topic = topics.find(t => t._id === selectedTopic);
      await notesService.create({
        title: `${topic?.name || 'Topic'} - AI Generated Notes`,
        content: generatedNotes,
        type: 'generated',
        topicId: selectedTopic
      });
      toast.success('Notes saved!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-500" />
          AI Generate Notes
        </DialogTitle>
        <DialogDescription>Let AI create comprehensive study notes for you</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="topic">Select Topic *</Label>
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a topic" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(topics) && topics.length > 0 ? (
                topics.map((topic) => (
                  <SelectItem key={topic._id} value={topic._id}>
                    {topic.name} - {topic.subject}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-topics" disabled>
                  No topics available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading || !selectedTopic || topics.length === 0}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Notes
            </>
          )}
        </Button>

        {generatedNotes && (
          <div className="space-y-4">
            <div>
              <Label>Generated Notes</Label>
              <div className="mt-2 p-4 bg-muted rounded-lg max-h-96 overflow-y-auto">
                <NoteViewer content={generatedNotes} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-forest to-forest-light">
                Save Notes
              </Button>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );
};

export default NotesPage;