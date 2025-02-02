import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from 'src/lib/firebase';

export const useFirebaseStorage = () => {
  const uploadProductImage = async (file, index) => {
    try {
      console.log('Начало загрузки файла:', file.name);
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${index}_${file.name}`;
      // Загружаем файл по пути "biz360/product_images/..."
      const storageRef = ref(storage, `biz360/product_images/${uniqueFileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Файл успешно загружен. URL:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
      throw error;
    }
  };

  const uploadMultipleImages = async (files) => {
    try {
      const uploadPromises = Array.from(files).map((file, index) =>
        uploadProductImage(file, index)
      );
      const urls = await Promise.all(uploadPromises);
      console.log('Все файлы успешно загружены. URLы:', urls);
      return urls;
    } catch (error) {
      console.error('Ошибка при загрузке нескольких изображений:', error);
      throw error;
    }
  };

  return {
    uploadProductImage,
    uploadMultipleImages
  };
};
