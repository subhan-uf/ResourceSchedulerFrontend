// src/components/designelements/generationDescriptionModal.js
import React, { useState } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Button,
  Input,
  Stack,
} from '@mui/joy';

const GenerationDescriptionModal = ({ open, onClose, onSubmit }) => {
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    onSubmit(description);
    setDescription('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose />
        <Typography level="h5" component="h2">
          Generation Description
        </Typography>
        <Input
          placeholder="Enter description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button onClick={handleSubmit}>Submit</Button>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default GenerationDescriptionModal;
