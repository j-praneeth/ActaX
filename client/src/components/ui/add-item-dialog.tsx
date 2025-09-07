import { useState, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { X, Plus, AlertCircle } from "lucide-react";

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (text: string) => void;
  title: string;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  isLoading?: boolean;
  itemType?: "action item" | "key topic" | "takeaway";
  existingItems?: { text: string }[];
}

export function AddItemDialog({
  isOpen,
  onClose,
  onAdd,
  title,
  placeholder = "Enter item...",
  multiline = false,
  maxLength = 500,
  isLoading = false,
  itemType = "item",
  existingItems = [],
}: AddItemDialogProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setText("");
      setError("");
    }
  }, [isOpen]);

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
    
    // Check for duplicate items
    const isDuplicate = existingItems.some(item => 
      item.text.toLowerCase().trim() === trimmed.toLowerCase()
    );
    
    if (isDuplicate) {
      return `This ${itemType} already exists`;
    }
    
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedText = text.trim();
    const validationError = validateInput(trimmedText);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    onAdd(trimmedText);
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
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <Plus className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
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
              <label htmlFor="item-text" className="block text-sm font-medium text-gray-700 mb-2">
                {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
              </label>
              {multiline ? (
                <Textarea
                  id="item-text"
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={placeholder}
                  className={`min-h-[100px] resize-none transition-all duration-200 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                  disabled={isLoading}
                  maxLength={maxLength}
                  autoFocus
                />
              ) : (
                <Input
                  id="item-text"
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={placeholder}
                  className={`transition-all duration-200 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
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

            {/* Help Text */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
              <p className="font-medium mb-1">Tips for writing effective {itemType}s:</p>
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

            {/* Existing Items Count */}
            {existingItems.length > 0 && (
              <div className="text-xs text-gray-400 text-center">
                {existingItems.length} {itemType}{existingItems.length === 1 ? '' : 's'} already exist{existingItems.length === 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !text.trim() || !!error}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </div>
              ) : (
                `Add ${itemType}`
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
