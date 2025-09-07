import { useState, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { EditItemDialog } from "./edit-item-dialog";
import { Edit, Check, X, Plus } from "lucide-react";

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  disabled?: boolean;
  itemType?: "action item" | "key topic" | "takeaway";
  existingItems?: { text: string; id: string }[];
  itemId?: string;
}

export function InlineEdit({
  value,
  onSave,
  onCancel,
  placeholder = "Enter text...",
  multiline = false,
  className = "",
  disabled = false,
  itemType = "item",
  existingItems = [],
  itemId,
}: InlineEditProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleSave = (newValue: string) => {
    onSave(newValue);
    setIsEditDialogOpen(false);
  };

  const handleCancel = () => {
    setIsEditDialogOpen(false);
    onCancel?.();
  };

  return (
    <>
      <div className={`flex items-center space-x-2 group ${className}`}>
        <div className="flex-1 text-sm text-gray-700">
          {value || <span className="text-gray-400 italic">{placeholder}</span>}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleEdit}
          disabled={disabled}
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      {/* Edit Dialog */}
      <EditItemDialog
        isOpen={isEditDialogOpen}
        onClose={handleCancel}
        onSave={handleSave}
        title={`Edit ${itemType}`}
        initialValue={value}
        placeholder={placeholder}
        multiline={multiline}
        itemType={itemType}
        existingItems={existingItems}
        itemId={itemId}
      />
    </>
  );
}

interface AddNewItemProps {
  onAdd: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  disabled?: boolean;
}

export function AddNewItem({
  onAdd,
  placeholder = "Add new item...",
  multiline = false,
  className = "",
  disabled = false,
}: AddNewItemProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState("");

  const handleAdd = () => {
    if (newValue.trim()) {
      onAdd(newValue.trim());
      setNewValue("");
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewValue("");
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleAdd();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isAdding) {
    return (
      <div className={`flex items-start space-x-2 ${className}`}>
        {multiline ? (
          <Textarea
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 min-h-[80px]"
            disabled={disabled}
            autoFocus
          />
        ) : (
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1"
            disabled={disabled}
            autoFocus
          />
        )}
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAdd}
            disabled={disabled || !newValue.trim()}
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={disabled}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => setIsAdding(true)}
      disabled={disabled}
      className={`flex items-center space-x-2 ${className}`}
    >
      <Plus className="h-4 w-4" />
      <span>Add New</span>
    </Button>
  );
}
