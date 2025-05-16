import React, { useState, useCallback, useRef, useEffect } from "react";
import {
    DndContext,
    DragEndEvent,
    useDraggable,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { EmptyState } from "../../components/EmptyState";
import { Edit2, Plus, X, GripVertical, Search, Archive, Palette } from "lucide-react";
import { calculateNewPosition, getElementBoundaries } from "../../utilities/cursorUtils";
import type { Position } from "../../types/common";

interface Note {
    id: string;
    content: string;
    position: Position;
    color: string;
    tags: string[];
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NOTE_COLORS = [
    { name: 'Yellow', value: '#fef3c7' },
    { name: 'Green', value: '#dcfce7' },
    { name: 'Purple', value: '#f3e8ff' },
    { name: 'Blue', value: '#dbeafe' },
    { name: 'Pink', value: '#fae8ff' },
    { name: 'Orange', value: '#ffedd5' },
    { name: 'Red', value: '#fee2e2' },
];

const DEFAULT_TAGS = ['Important', 'Work', 'Personal', 'Ideas', 'Tasks'];

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    note?: Note;
    onSave: (note: Omit<Note, 'id' | 'position' | 'createdAt' | 'updatedAt'>) => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, note, onSave }) => {
    const [content, setContent] = useState(note?.content || '');
    const [selectedColor, setSelectedColor] = useState(note?.color || NOTE_COLORS[0].value);
    const [tags, setTags] = useState<string[]>(note?.tags || []);
    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        if (note) {
            setContent(note.content);
            setSelectedColor(note.color);
            setTags(note.tags);
        }
    }, [note]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            content,
            color: selectedColor,
            tags,
            isArchived: note?.isArchived || false,
        });
        onClose();
    };

    const addTag = () => {
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setNewTag('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {note ? 'Edit Note' : 'New Note'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Content
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Write your note here..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Color
                            </label>
                            <div className="flex gap-2">
                                {NOTE_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setSelectedColor(color.value)}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedColor === color.value
                                            ? 'scale-110 border-indigo-500'
                                            : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tags
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => setTags(tags.filter(t => t !== tag))}
                                            className="ml-2 hover:text-indigo-900"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Add a tag..."
                                    className="flex-1 rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                                >
                                    Add Tag
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                {note ? 'Save Changes' : 'Create Note'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const STORAGE_KEY = 'expense-tracker-notes';

export const NotesTab: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>(() => {
        // Initialize notes from localStorage
        const savedNotes = localStorage.getItem(STORAGE_KEY);
        if (savedNotes) {
            try {
                const parsedNotes = JSON.parse(savedNotes);
                // Convert string dates back to Date objects
                return parsedNotes.map((note: any) => ({
                    ...note,
                    createdAt: new Date(note.createdAt),
                    updatedAt: new Date(note.updatedAt),
                }));
            } catch (error) {
                console.error('Error parsing saved notes:', error);
                return [];
            }
        }
        return [];
    });

    // Save notes to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }, [notes]);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>(DEFAULT_TAGS);
    const [showArchived, setShowArchived] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Update available tags whenever notes change
    useEffect(() => {
        const allTags = new Set(DEFAULT_TAGS);
        notes.forEach(note => {
            note.tags.forEach(tag => allTags.add(tag));
        });
        setAvailableTags(Array.from(allTags));
    }, [notes]);

    const addNote = () => {
        setIsModalOpen(true);
        setEditingId(null);
    };

    const editNote = (id: string) => {
        setEditingId(id);
        setIsModalOpen(true);
    };

    const handleSaveNote = (noteData: Omit<Note, 'id' | 'position' | 'createdAt' | 'updatedAt'>) => {
        if (editingId) {
            setNotes((prev) =>
                prev.map((n) =>
                    n.id === editingId
                        ? {
                            ...n,
                            ...noteData,
                            updatedAt: new Date(),
                        }
                        : n
                )
            );
        } else {
            const id = Math.random().toString(36).substr(2, 9);
            const now = new Date();

            // Calculate center position
            const containerWidth = containerRef.current?.clientWidth || 800;
            const containerHeight = containerRef.current?.clientHeight || 600;
            const noteWidth = 288; // 72 * 4 (w-72 class)
            const noteHeight = 200; // Approximate height of a new note

            const centerX = Math.max(0, (containerWidth - noteWidth) / 2);
            const centerY = Math.max(0, (containerHeight - noteHeight) / 2);

            const newNote: Note = {
                id,
                ...noteData,
                position: { x: centerX, y: centerY },
                createdAt: now,
                updatedAt: now,
            };
            setNotes((prev) => [...prev, newNote]);
        }
        setIsModalOpen(false);
        setEditingId(null);
    };

    const deleteNote = useCallback((id: string) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const archiveNote = useCallback((id: string) => {
        setNotes((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isArchived: !n.isArchived, updatedAt: new Date() } : n))
        );
    }, []);

    const updateNoteTags = useCallback((id: string, tags: string[]) => {
        setNotes((prev) =>
            prev.map((n) => (n.id === id ? { ...n, tags, updatedAt: new Date() } : n))
        );
    }, []);

    const updateNoteColor = useCallback((id: string, color: string) => {
        setNotes((prev) =>
            prev.map((n) => (n.id === id ? { ...n, color, updatedAt: new Date() } : n))
        );
        setShowColorPicker(null);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Minimum distance before drag starts
                delay: 0, // No delay before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;
        if (!containerRef.current) return;

        setNotes((prev) =>
            prev.map((note) => {
                if (note.id === active.id) {
                    const noteElement = document.getElementById(`note-${note.id}`);
                    if (!noteElement) return note;

                    const boundaries = getElementBoundaries(containerRef.current!, noteElement);
                    const newPosition = calculateNewPosition(note.position, delta, boundaries);

                    return {
                        ...note,
                        position: newPosition,
                        updatedAt: new Date(),
                    };
                }
                return note;
            })
        );
    };

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => note.tags.includes(tag));

        const matchesArchive = note.isArchived === showArchived;
        return matchesSearch && matchesTags && matchesArchive;
    });

    const DraggableNote: React.FC<{ note: Note }> = ({ note }) => {
        const isEditing = editingId === note.id;
        const { attributes, listeners, setNodeRef, transform } = useDraggable({
            id: note.id,
            disabled: isEditing,
            data: {
                current: note,
            },
        });

        const style: React.CSSProperties | undefined = transform
            ? {
                transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
                transition: 'none',
            }
            : {
                transition: 'transform 0.2s ease-out',
            };

        return (
            <div
                id={`note-${note.id}`}
                ref={setNodeRef}
                className="absolute w-72 rounded-lg shadow-lg p-4 transition-all duration-200 hover:shadow-xl"
                style={{
                    ...style,
                    left: note.position.x,
                    top: note.position.y,
                    backgroundColor: note.color,
                }}
            >
                <div className="flex justify-between items-start mb-2">
                    <div
                        {...attributes}
                        {...listeners}
                        className="p-1 cursor-grab hover:bg-black/10 rounded"
                    >
                        <GripVertical className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex space-x-1">
                        <button
                            onClick={() => setShowColorPicker(showColorPicker === note.id ? null : note.id)}
                            className="p-1 hover:bg-black/10 rounded"
                            disabled={isEditing}
                        >
                            <Palette className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                            onClick={() => editNote(note.id)}
                            className="p-1 hover:bg-black/10 rounded"
                            disabled={isEditing}
                        >
                            <Edit2 className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                            onClick={() => archiveNote(note.id)}
                            className="p-1 hover:bg-black/10 rounded"
                        >
                            <Archive className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                            onClick={() => deleteNote(note.id)}
                            className="p-1 hover:bg-black/10 rounded"
                        >
                            <X className="h-4 w-4 text-gray-600" />
                        </button>
                    </div>
                </div>

                {showColorPicker === note.id && (
                    <div className="absolute top-12 right-4 bg-white rounded-lg shadow-lg p-2 z-10">
                        <div className="grid grid-cols-4 gap-2">
                            {NOTE_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => updateNoteColor(note.id, color.value)}
                                    className="w-6 h-6 rounded-full border border-gray-200"
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <p className="whitespace-pre-wrap text-gray-800">
                    {note.content || 'No content'}
                </p>

                <div className="mt-2 flex flex-wrap gap-1">
                    {note.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-black/10 rounded-full text-gray-700"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="mt-2 text-xs text-gray-500">
                    Last updated: {note.updatedAt.toLocaleString()}
                </div>
            </div>
        );
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                addNote();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const removeTag = useCallback((tagToRemove: string) => {
        // Remove tag from all notes
        setNotes(prev => prev.map(note => ({
            ...note,
            tags: note.tags.filter(tag => tag !== tagToRemove),
            updatedAt: new Date()
        })));

        // Remove from selected tags if it was selected
        setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
    }, []);

    return (
        <div ref={containerRef} className="relative min-h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Notes</h2>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search notes..."
                            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={`px-4 py-2 rounded-lg transition-colors ${showArchived
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        <Archive className="h-4 w-4 inline mr-2" />
                        {showArchived ? 'Show Active' : 'Show Archived'}
                    </button>
                    <button
                        onClick={addNote}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                    </button>
                </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                    <div
                        key={tag}
                        className={`group inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${selectedTags.includes(tag)
                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        <button
                            onClick={() => {
                                setSelectedTags(prev =>
                                    prev.includes(tag)
                                        ? prev.filter(t => t !== tag)
                                        : [...prev, tag]
                                );
                            }}
                            className="flex-1"
                        >
                            {tag}
                        </button>
                        {!DEFAULT_TAGS.includes(tag) && (
                            <button
                                onClick={() => removeTag(tag)}
                                className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/20 transition-colors"
                                title="Remove tag"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <DndContext
                sensors={sensors}
                modifiers={[restrictToWindowEdges]}
                onDragEnd={handleDragEnd}
            >
                {filteredNotes.map((note) => (
                    <DraggableNote key={note.id} note={note} />
                ))}
            </DndContext>

            {filteredNotes.length === 0 && (
                <EmptyState
                    title={showArchived ? "No archived notes" : "No notes yet"}
                    message={showArchived
                        ? "You haven't archived any notes yet."
                        : "Create your first note to start organizing your thoughts."
                    }
                />
            )}

            <NoteModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                }}
                note={editingId ? notes.find(n => n.id === editingId) : undefined}
                onSave={handleSaveNote}
            />
        </div>
    );
};