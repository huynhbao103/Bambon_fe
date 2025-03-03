import { BACKEND_URL } from '../config';
import { Alert } from 'react-native';
import { Platform } from 'react-native';

const uploadPhoto = async (photoUri: string, userId: string): Promise<any | null> => {
  try {
    const formData = new FormData();

    formData.append('image', {
      uri: Platform.OS === 'android' ? photoUri : photoUri.replace('file://', ''),
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);

    formData.append('userId', userId);

    const response = await fetch(`${BACKEND_URL}/ocr`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log('OCR Result:', result);
    return result;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
};

export default uploadPhoto;