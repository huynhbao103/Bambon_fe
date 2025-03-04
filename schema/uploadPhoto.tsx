import { BACKEND_URL } from '../config';
import { Alert, Platform } from 'react-native';

interface TransactionResponse {
  message?: string;
  data?: {
    type: 'income' | 'expense';
    category: string;
    items: { productName: string; quantity: number; price: number }[];
    amount: number;
    userId: string;
  };
  error?: string;
  note?: string;
}

const uploadPhoto = async (photoUri: string, userId: string): Promise<TransactionResponse | null> => {
  try {
    const formData = new FormData();

    // Handle URI differences between Android and iOS
    const uri = Platform.OS === 'android' ? photoUri : photoUri.replace('file://', '');
    formData.append('image', {
      uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any); // Type assertion for FormData compatibility

    formData.append('userId', userId);

    const response = await fetch(`${BACKEND_URL}/ocr`, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        // Note: 'Content-Type' is omitted because FormData sets it automatically with the boundary
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
    }

    const result: TransactionResponse = await response.json();
    console.log('OCR Result:', result);
    return result;
  } catch (error) {
    console.error('Upload error:', error);
    Alert.alert('Lỗi', `Không thể tải ảnh lên: ${error}`);
    return null;
  }
};

export default uploadPhoto;