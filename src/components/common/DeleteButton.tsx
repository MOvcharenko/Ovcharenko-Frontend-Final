import React from 'react';

interface DeleteButtonProps {
  onClick: () => void;
}

function DeleteButton({ onClick }: DeleteButtonProps) {
  return (
    <button onClick={onClick}>Delete</button>
  );
}

export default React.memo(DeleteButton);