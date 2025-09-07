import { useState, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { X, Edit, AlertCircle, CheckCircle } from "lucide-react";

interface EditItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  title: string;
  initialValue: string;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  isLoading?: boolean;
  itemType?: "action item" | "key topic" | "takeaway";
  existingItems?: { text: string }[];
  itemId?: string;
}

export function EditItemDialog({
  isOpen,
  onClose,
  onSave,
  title,
  initialValue,
  placeholder = "Enter item...",
  multiline = false,
  maxLength = 500,
  isLoading = false,
  itemType = "item",
  existingItems = [],
  itemId,
}: EditItemDialogProps) {
  const [text, setText] = useState(initialValue);
  const [error, setError] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Reset form when dialog opens/closes or initialValue changes
  useEffect(() => {
    if (isOpen) {
      setText(initialValue);
      setError("");
      setHasChanges(false);
    }
  }, [isOpen, initialValue]);

  // Track changes
  useEffect(() => {
    setHasChanges(text.trim() !== initialValue.trim());
  }, [text, initialValue]);

  const validateInput = (value: string): string => {
    const trimmed = value.trim();
    
    if (!trimmed) {
      return `${itemType} cannot be empty`;
    }
    
    if (trimmed.length < 3) {
      return `${itemType} must be at least 3 characters long`;
    }
    
    if (value.length > maxLength) {
      return `${itemType} must be ${maxLength} characters or less`;
    }
    
    // Check for duplicate items (excluding current item)
    const isDuplicate = existingItems.some(item => 
      item.text.toLowerCase().trim() === trimmed.toLowerCase() && 
      item.id !== itemId
    );
    
    if (isDuplicate) {
      return `This ${itemType} already exists`;
    }
    
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveAndClose();
  };

  const handleTextChange = (value: string) => {
    setText(value);
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveAndClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      // Show confirmation if there are unsaved changes
      const confirmed = window.confirm(
        `You have unsaved changes. Are you sure you want to cancel?`
      );
      if (!confirmed) return;
    }
    onClose();
  };

  const handleSaveAndClose = () => {
    const trimmedText = text.trim();
    const validationError = validateInput(trimmedText);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    onSave(trimmedText);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-200"
        onClick={handleBackdropClick}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-200 border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-amber-100 text-amber-600">
              <Edit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              {hasChanges && (
                <p className="text-xs text-amber-600 font-medium">
                  You have unsaved changes
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Input Field */}
            <div>
              <label htmlFor="edit-item-text" className="block text-sm font-medium text-gray-700 mb-2">
                {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
              </label>
              {multiline ? (
                <Textarea
                  id="edit-item-text"
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={placeholder}
                  className={`min-h-[100px] resize-none transition-all duration-200 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'focus:border-amber-500 focus:ring-amber-500'}`}
                  disabled={isLoading}
                  maxLength={maxLength}
                  autoFocus
                />
              ) : (
                <Input
                  id="edit-item-text"
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={placeholder}
                  className={`transition-all duration-200 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'focus:border-amber-500 focus:ring-amber-500'}`}
                  disabled={isLoading}
                  maxLength={maxLength}
                  autoFocus
                />
              )}
              
              {/* Character Count */}
              <div className="flex justify-between items-center mt-1">
                <div className="text-xs text-gray-500">
                  {text.length}/{maxLength} characters
                </div>
                {text.length > maxLength * 0.9 && (
                  <div className="text-xs text-amber-600">
                    Approaching character limit
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message for Changes */}
            {hasChanges && !error && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-700">
                  Changes detected. Click Save to apply your changes.
                </p>
              </div>
            )}

            {/* Help Text */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
              <p className="font-medium mb-1">Tips for editing {itemType}s:</p>
              <ul className="space-y-1 text-xs">
                {itemType === "action item" && (
                  <>
                    <li>• Use action verbs (e.g., "Review", "Complete", "Send")</li>
                    <li>• Be specific about what needs to be done</li>
                    <li>• Include deadlines or timeframes when relevant</li>
                  </>
                )}
                {itemType === "key topic" && (
                  <>
                    <li>• Use clear, descriptive terms</li>
                    <li>• Focus on main discussion themes</li>
                    <li>• Keep topics concise and specific</li>
                  </>
                )}
                {itemType === "takeaway" && (
                  <>
                    <li>• Summarize key insights or conclusions</li>
                    <li>• Focus on actionable learnings</li>
                    <li>• Be clear and concise</li>
                  </>
                )}
              </ul>
            </div>

            {/* Original Value Comparison */}
            {hasChanges && (
              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-md border border-blue-200">
                <p className="font-medium mb-2 text-blue-800">Original:</p>
                <p className="text-blue-700 italic line-through">
                  {initialValue}
                </p>
                <p className="font-medium mt-2 text-blue-800">New:</p>
                <p className="text-blue-700">
                  {text.trim()}
                </p>
              </div>
            )}

            {/* Existing Items Count */}
            {existingItems.length > 0 && (
              <div className="text-xs text-gray-400 text-center">
                {existingItems.length} {itemType}{existingItems.length === 1 ? '' : 's'} total
              </div>
            )}

            {/* Keyboard Shortcuts Hint */}
            <div className="text-xs text-gray-400 text-center bg-gray-50 p-2 rounded border">
              <span className="font-medium">Keyboard shortcuts:</span> 
              <span className="ml-2">
                <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+S</kbd> to save, 
                <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs ml-1">Esc</kbd> to cancel
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !text.trim() || !!error || !hasChanges}
              className={`min-w-[100px] transition-all duration-200 ${
                hasChanges 
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-md' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
