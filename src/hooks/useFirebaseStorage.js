// src/hooks/useFirebaseStorage.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from 'src/lib/firebase';

export const useFirebaseStorage = () => {
  const uploadProductImage = async (file, index) => {
    try {
      // Создаем уникальное имя файла
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${index}_${file.name}`;
      
      // Используем правильный путь для сохранения
      const storageRef = ref(storage, `biz360/product_images/${uniqueFileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const uploadMultipleImages = async (files) => {
    try {
      const uploadPromises = Array.from(files).map((file, index) => 
        uploadProductImage(file, index)
      );
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw error;
    }
  };

  return {
    uploadProductImage,
    uploadMultipleImages
  };
};