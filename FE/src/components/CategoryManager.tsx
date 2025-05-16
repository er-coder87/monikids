import React, { useState } from 'react'
import { Plus, X, Link2, ChevronDown, ChevronRight, GripVertical, Edit2, Check, XCircle } from 'lucide-react'
import type { Category, CreateCategory } from '../types/category'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    UniqueIdentifier
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface CategoryManagerProps {
    onCategoryCreated?: (category: Category) => void
    existingCategories?: Category[]
}

interface SortableCategoryProps {
    category: Category
    isChild?: boolean
    onDelete: (id: string) => void
    isExpanded?: boolean
    onToggleExpand?: () => void
    childCategories?: Category[]
    onEdit: (id: string, updates: Partial<Category>) => void
}

function SortableCategory({ category, isChild, onDelete, isExpanded, onToggleExpand, childCategories, onEdit }: SortableCategoryProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedName, setEditedName] = useState(category.name)
    const [editedColor, setEditedColor] = useState(category.color)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: category.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const handleSave = () => {
        onEdit(category.id, {
            name: editedName,
            color: editedColor
        })
        setIsEditing(false)
    }

    const handleCancel = () => {
        setEditedName(category.name)
        setEditedColor(category.color)
        setIsEditing(false)
    }

    return (
        <div ref={setNodeRef} style={style}>
            <div className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg ${isChild ? 'ml-6 mt-1 p-2' : ''}`}>
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {!isChild && (
                        <button
                            onClick={onToggleExpand}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors flex-shrink-0"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                        </button>
                    )}
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing flex-shrink-0">
                        <GripVertical className={`${isChild ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400`} />
                    </div>
                    {isEditing ? (
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="flex-1 min-w-0 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Category name"
                            />
                            <input
                                type="color"
                                value={editedColor}
                                onChange={(e) => setEditedColor(e.target.value)}
                                className="h-6 w-6 rounded cursor-pointer flex-shrink-0"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div
                                className={`${isChild ? 'w-3 h-3' : 'w-4 h-4'} rounded-full flex-shrink-0`}
                                style={{ backgroundColor: category.color || '#3B82F6' }}
                            />
                            <span className={`${isChild ? 'text-sm text-gray-600 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300 font-medium'} truncate`}>
                                {category.name}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors"
                                title="Save changes"
                            >
                                <Check className={`${isChild ? 'h-3 w-3' : 'h-4 w-4'} text-green-600`} />
                            </button>
                            <button
                                onClick={handleCancel}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                                title="Cancel editing"
                            >
                                <XCircle className={`${isChild ? 'h-3 w-3' : 'h-4 w-4'} text-red-600`} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                title="Edit category"
                            >
                                <Edit2 className={`${isChild ? 'h-3 w-3' : 'h-4 w-4'} text-gray-500`} />
                            </button>
                            <button
                                onClick={() => onDelete(category.id)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                title="Delete category"
                            >
                                <X className={`${isChild ? 'h-3 w-3' : 'h-4 w-4'} text-gray-500`} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export function CategoryManager({ onCategoryCreated, existingCategories: initialCategories = [] }: CategoryManagerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [categories, setCategories] = useState<Category[]>(initialCategories)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set())
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
    const [newCategory, setNewCategory] = useState<CreateCategory>({
        name: '',
        parentId: undefined,
        color: '#3B82F6'
    })
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)

    const inputClassName = 'block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 px-3 py-2'

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) {
            setActiveId(null)
            return
        }

        const activeCategory = categories.find(cat => cat.id === active.id)
        const overCategory = categories.find(cat => cat.id === over.id)

        if (!activeCategory || !overCategory) {
            setActiveId(null)
            return
        }

        // If dragging a child category over a parent category
        if (activeCategory.parentId && !overCategory.parentId) {
            setCategories(prev => prev.map(category =>
                category.id === active.id
                    ? { ...category, parentId: String(over.id) }
                    : category
            ))
            // Expand the parent category
            setExpandedParents(prev => {
                const next = new Set(prev)
                next.add(String(over.id))
                return next
            })
        } else {
            // Regular reordering within the same level
            setCategories(prev => {
                const oldIndex = prev.findIndex(item => item.id === active.id)
                const newIndex = prev.findIndex(item => item.id === over.id)
                return arrayMove(prev, oldIndex, newIndex)
            })
        }

        setActiveId(null)
    }

    const handleDragCancel = () => {
        setActiveId(null)
    }

    const toggleParentExpand = (parentId: string) => {
        setExpandedParents(prev => {
            const next = new Set(prev)
            if (next.has(parentId)) {
                next.delete(parentId)
            } else {
                next.add(parentId)
            }
            return next
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCategory.name) return

        setIsLoading(true)
        setError(null)

        try {
            // Create a new category with a temporary ID
            const createdCategory: Category = {
                id: `temp-${Date.now()}`,
                ...newCategory
            }

            setCategories(prev => [...prev, createdCategory])
            onCategoryCreated?.(createdCategory)
            setNewCategory({ name: '', parentId: undefined, color: '#3B82F6' })
            setIsOpen(false)
        } catch (err) {
            setError('Failed to create category')
            console.error('Error creating category:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return

        setIsLoading(true)
        setError(null)

        try {
            setCategories(prev => prev.filter(cat => cat.id !== id))
        } catch (err) {
            setError('Failed to delete category')
            console.error('Error deleting category:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditCategory = (id: string, updates: Partial<Category>) => {
        setCategories(prev => prev.map(category =>
            category.id === id ? { ...category, ...updates } : category
        ))
    }

    const parentCategories = categories.filter(category => !category.parentId)
    const childCategories = categories.filter(category => category.parentId)

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Categories</h2>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                    >
                        Add Category
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                {isOpen && (
                    <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Category Name
                            </label>
                            <input
                                type="text"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                className={inputClassName}
                                placeholder="Enter category name"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Parent Category (Optional)
                            </label>
                            <div className="relative">
                                <select
                                    value={newCategory.parentId || ''}
                                    onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value || undefined })}
                                    className={inputClassName}
                                    disabled={isLoading}
                                >
                                    <option value="">None</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <Link2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Color
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="color"
                                    value={newCategory.color}
                                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                                    className="h-8 w-8 rounded cursor-pointer"
                                    disabled={isLoading}
                                />
                                <input
                                    type="text"
                                    value={newCategory.color}
                                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                                    className={inputClassName}
                                    placeholder="#000000"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating...' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                )}

                <SortableContext items={categories.map(cat => cat.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {categories
                            .filter(category => !category.parentId)
                            .map(category => (
                                <SortableCategory
                                    key={category.id}
                                    category={category}
                                    onDelete={handleDelete}
                                    isExpanded={expandedParents.has(category.id)}
                                    onToggleExpand={() => toggleParentExpand(category.id)}
                                    childCategories={categories.filter(cat => cat.parentId === category.id)}
                                    onEdit={handleEditCategory}
                                />
                            ))}
                    </div>
                </SortableContext>

                <DragOverlay>
                    {activeId ? (
                        <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <div className="cursor-grabbing flex-shrink-0">
                                    <GripVertical className="h-4 w-4 text-gray-400" />
                                </div>
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                    <div
                                        className="w-4 h-4 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: categories.find(cat => cat.id === activeId)?.color || '#3B82F6' }}
                                    />
                                    <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                                        {categories.find(cat => cat.id === activeId)?.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    )
} 