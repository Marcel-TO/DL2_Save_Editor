import { info } from "tauri-plugin-log-api";
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';

export default function LoadSaveSpeedDial() {
  const [selectedFile, setSelectedFile] = useState<String>("No file selected.");
  const [content, setContent] = useState<String>("");

  async function handleSelectFile() {
    let filepath = await open({
      multiple: false
    });

    if (filepath != null && !Array.isArray(filepath)) {
      info(filepath);
      await setSelectedFile( await invoke("file_to_backend", {file_path: filepath}));
    }
  }

  async function handleTestIfContentAccessible() {
    await setContent( await invoke("get_content", {file_path: selectedFile}));

  }

  return (
    <div>
      <button onClick={handleSelectFile}>Select File</button>
      <p>{selectedFile}</p>
      
      <button onClick={handleTestIfContentAccessible}>Content?</button>
      <p>{content}</p>
    </div>
  );
}