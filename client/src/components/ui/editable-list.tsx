import { useState } from "react";
import { Button } from "./button";
import { InlineEdit } from "./inline-edit";
import { DeleteConfirmationDialog } from "./confirmation-dialog";
import { AddItemDialog } from "./add-item-dialog";
import { Trash2, Plus } from "lucide-react";

interface EditableListItem {
  id: string;
  text: string;
}

interface EditableListProps {
  items: EditableListItem[];
  onUpdate: (items: EditableListItem[]) => void;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
  className?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  itemType?: "action item" | "key topic" | "takeaway";
}

export function EditableList({
  items,
  onUpdate,
  placeholder = "Enter item...",
  multiline = false,
  disabled = false,
  className = "",
  showAddButton = true,
  addButtonText = "Add New",
  itemType = "item",
}: EditableListProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    item: EditableListItem | null;
  }>({
    isOpen: false,
    item: null,
  });
  const [addDialog, setAddDialog] = useState(false);

  const handleItemUpdate = (id: string, newText: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, text: newText } : item
    );
    onUpdate(updatedItems);
    setTimeout(() => setIsUpdating(false), 100);
  };

  const handleItemDelete = (id: string) => {
    if (isUpdating) return;
    
    const item = items.find(item => item.id === id);
    if (item) {
      setDeleteDialog({
        isOpen: true,
        item: item,
      });
    }
  };

  const confirmDelete = () => {
    if (!deleteDialog.item || isUpdating) return;
    
    setIsUpdating(true);
    const updatedItems = items.filter(item => item.id !== deleteDialog.item!.id);
    onUpdate(updatedItems);
    setDeleteDialog({ isOpen: false, item: null });
    setTimeout(() => setIsUpdating(false), 100);
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, item: null });
  };

  const handleAddItem = (newText: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    const newItem: EditableListItem = {
      id: Date.now().toString(),
      text: newText,
    };
    const updatedItems = [...items, newItem];
    onUpdate(updatedItems);
    setAddDialog(false);
    setTimeout(() => setIsUpdating(false), 100);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <div key={item.id} className="flex items-start space-x-2 group">
          <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500 mt-1">
            {index + 1}
          </div>
          <div className="flex-1">
            <InlineEdit
              value={item.text}
              onSave={(newValue) => handleItemUpdate(item.id, newValue)}
              placeholder={placeholder}
              multiline={multiline}
              disabled={disabled || isUpdating}
              itemType={itemType}
              existingItems={items}
              itemId={item.id}
            />
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleItemDelete(item.id)}
            disabled={disabled || isUpdating}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ))}
      
      {showAddButton && (
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={() => setAddDialog(true)}
            disabled={disabled || isUpdating}
            className="w-full flex items-center justify-center space-x-2 h-10"
          >
            <Plus className="h-4 w-4" />
            <span>{addButtonText}</span>
          </Button>
        </div>
      )}

      {/* Add Item Dialog */}
      <AddItemDialog
        isOpen={addDialog}
        onClose={() => setAddDialog(false)}
        onAdd={handleAddItem}
        title={`Add New ${itemType}`}
        placeholder={placeholder}
        multiline={multiline}
        isLoading={isUpdating}
        itemType={itemType as "action item" | "key topic" | "takeaway"}
        existingItems={items}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        itemName={deleteDialog.item?.text || ''}
        itemType={itemType as "action item" | "key topic" | "takeaway"}
        isLoading={isUpdating}
      />
    </div>
  );
}

interface EditableTableListProps {
  items: EditableListItem[];
  onUpdate: (items: EditableListItem[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  columns?: {
    label: string;
    key: string;
    width?: string;
  }[];
  itemType?: "action item" | "key topic" | "takeaway";
}

export function EditableTableList({
  items,
  onUpdate,
  placeholder = "Enter item...",
  disabled = false,
  className = "",
  showAddButton = true,
  addButtonText = "Add New",
  columns = [
    { label: "#", key: "index", width: "w-12" },
    { label: "ITEM", key: "text", width: "flex-1" },
    { label: "ACTION", key: "action", width: "w-24" },
  ],
  itemType = "item",
}: EditableTableListProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    item: EditableListItem | null;
  }>({
    isOpen: false,
    item: null,
  });
  const [addDialog, setAddDialog] = useState(false);

  const handleItemUpdate = (id: string, newText: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, text: newText } : item
    );
    onUpdate(updatedItems);
    setTimeout(() => setIsUpdating(false), 100);
  };

  const handleItemDelete = (id: string) => {
    if (isUpdating) return;
    
    const item = items.find(item => item.id === id);
    if (item) {
      setDeleteDialog({
        isOpen: true,
        item: item,
      });
    }
  };

  const confirmDelete = () => {
    if (!deleteDialog.item || isUpdating) return;
    
    setIsUpdating(true);
    const updatedItems = items.filter(item => item.id !== deleteDialog.item!.id);
    onUpdate(updatedItems);
    setDeleteDialog({ isOpen: false, item: null });
    setTimeout(() => setIsUpdating(false), 100);
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, item: null });
  };

  const handleAddItem = (newText: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    const newItem: EditableListItem = {
      id: Date.now().toString(),
      text: newText,
    };
    const updatedItems = [...items, newItem];
    onUpdate(updatedItems);
    setAddDialog(false);
    setTimeout(() => setIsUpdating(false), 100);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {columns.map((column) => (
                <th key={column.key} className={`text-left py-2 ${column.width}`}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b group">
                {columns.map((column) => {
                  if (column.key === "index") {
                    return (
                      <td key={column.key} className={`py-3 ${column.width}`}>
                        {index + 1}
                      </td>
                    );
                  }
                  
                  if (column.key === "text") {
                    return (
                      <td key={column.key} className={`py-3 ${column.width}`}>
                        <InlineEdit
                          value={item.text}
                          onSave={(newValue) => handleItemUpdate(item.id, newValue)}
                          placeholder={placeholder}
                          disabled={disabled || isUpdating}
                          itemType={itemType}
                          existingItems={items}
                          itemId={item.id}
                        />
                      </td>
                    );
                  }
                  
                  if (column.key === "action") {
                    return (
                      <td key={column.key} className={`py-3 ${column.width}`}>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleItemDelete(item.id)}
                            disabled={disabled || isUpdating}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    );
                  }
                  
                  return null;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {showAddButton && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => setAddDialog(true)}
            disabled={disabled || isUpdating}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{addButtonText}</span>
          </Button>
        </div>
      )}

      {/* Add Item Dialog */}
      <AddItemDialog
        isOpen={addDialog}
        onClose={() => setAddDialog(false)}
        onAdd={handleAddItem}
        title={`Add New ${itemType}`}
        placeholder={placeholder}
        isLoading={isUpdating}
        itemType={itemType as "action item" | "key topic" | "takeaway"}
        existingItems={items}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        itemName={deleteDialog.item?.text || ''}
        itemType={itemType as "action item" | "key topic" | "takeaway"}
        isLoading={isUpdating}
      />
    </div>
  );
}