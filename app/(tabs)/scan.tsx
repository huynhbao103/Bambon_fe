import React, { useState, useRef, useEffect } from 'react';
import {
  Button, StyleSheet, Text, TouchableOpacity, View,
  Image, Alert, SafeAreaView, Platform, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import uploadPhoto from '../../schema/uploadPhoto';
import { fetchUserId } from '../../schema/authen'; // Điều chỉnh đường dẫn đến file auth.ts

const ScanScreen = () => {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactionData, setTransactionData] = useState<any | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // Lấy userId từ AsyncStorage khi component mount
  useEffect(() => {
    const getUserId = async () => {
      const id = await fetchUserId();
      setUserId(id);
    };
    getUserId();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </SafeAreaView>
    );
  }

  if (!userId) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>Bạn cần đăng nhập để sử dụng tính năng này.</Text>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handlePhotoUpload = async (uri: string) => {
    setLoading(true);
    const result = await uploadPhoto(uri, userId);
    if (result) {
      if (result.error) {
        Alert.alert('Error', result.error);
      } else if (result.note) {
        Alert.alert('Note', result.note);
      } else {
        setTransactionData(result.data);
        Alert.alert('Success', 'Giao dịch đã được lưu thành công!');
      }
    } else {
      Alert.alert('Error', 'Không nhận được kết quả từ server.');
    }
    setLoading(false);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setLoading(true);
        const photo = await cameraRef.current.takePictureAsync();
        if (photo?.uri) {
          setPhotoUri(photo.uri);
          await handlePhotoUpload(photo.uri);
        } else {
          Alert.alert('Error', 'Failed to capture photo. Please try again.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setPhotoUri(result.assets[0].uri);
      await handlePhotoUpload(result.assets[0].uri);
    } else {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {photoUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
          <TouchableOpacity style={styles.retakeButton} onPress={() => {
            setPhotoUri(null);
            setTransactionData(null);
          }}>
            <Ionicons name="arrow-undo-circle-outline" size={50} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={40} color="white" />
          </TouchableOpacity>
          <CameraView style={styles.camera} ref={cameraRef}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                <Ionicons name="camera-reverse-outline" size={40} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <Ionicons name="camera-outline" size={50} color="black" />
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      )}

      {loading && <ActivityIndicator size="large" color="#fff" style={styles.loadingIndicator} />}
      {transactionData && !loading && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Dữ liệu giao dịch:</Text>
          <Text style={styles.recognizedText}>Loại: {transactionData.type}</Text>
          <Text style={styles.recognizedText}>Danh mục: {transactionData.category}</Text>
          <Text style={styles.recognizedText}>Sản phẩm:</Text>
          {transactionData.items.map((item: any, index: number) => (
            <Text key={index} style={styles.recognizedText}>
              - {item.productName}: {item.quantity} x {item.price} VNĐ
            </Text>
          ))}
          <Text style={styles.recognizedText}>Tổng tiền: {transactionData.amount} VNĐ</Text>
          <Text style={styles.recognizedText}>User ID: {transactionData.userId}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 50,
    fontSize: 16,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    padding: 10,
  },
  captureButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 50,
    padding: 15,
  },
  galleryButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    padding: 10,
    zIndex: 1,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '90%',
    height: '80%',
    resizeMode: 'contain',
    borderRadius: 10,
  },
  retakeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    padding: 10,
    marginTop: 20,
  },
  resultContainer: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    marginTop: 20,
    width: '90%',
    alignSelf: 'center',
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recognizedText: {
    color: '#ffd700',
    fontSize: 14,
    marginTop: 5,
  },
  loadingIndicator: {
    marginTop: 10,
  },
});

export default ScanScreen;