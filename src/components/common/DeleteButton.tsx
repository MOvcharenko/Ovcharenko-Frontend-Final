import React, { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';

interface DeleteButtonProps {
  onClick: () => void;
  itemType?: 'card' | 'deck' | 'item';
}

function DeleteButton({ onClick, itemType = 'item' }: DeleteButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleConfirm = () => {
    setIsConfirmOpen(false);
    onClick();
  };

  const itemLabel = itemType === 'card' ? 'card' : itemType === 'deck' ? 'deck' : 'item';

  return (
    <>
      <button className="delete-button" onClick={() => setIsConfirmOpen(true)}>
        Delete
      </button>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Confirmation"
        message={`Are you sure you want to delete this ${itemLabel}?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
        isDangerous={true}
      />
    </>
  );
}

export default React.memo(DeleteButton);