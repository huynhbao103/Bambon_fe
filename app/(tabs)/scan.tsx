import React, { useState, useRef, useEffect } from 'react';
import {
  Button, StyleSheet, Text, TouchableOpacity, View,
  Image, Alert, SafeAreaView, Platform, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import uploadPhoto from '../../schema/uploadPhoto';
import { fetchUserId } from '../../schema/authen';

const ScanScreen = () => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactionData, setTransactionData] = useState<any | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    const getUserId = async () => {
      const id = await fetchUserId();
      if (!id) {
        Alert.alert('Lỗi', 'Không thể lấy userId. Vui lòng đăng nhập lại.');
      }
      setUserId(id);
    };
    getUserId();
  }, []);

  if (!permission) {
    return <View testID="loading-screen" />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} testID="camera-permission-screen">
        <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>Chúng tôi cần quyền truy cập camera</Text>
        <Button onPress={requestPermission} title="Cấp quyền" testID="grant-permission-button" />
      </SafeAreaView>
    );
  }

  if (!userId) {
    return (
      <SafeAreaView style={styles.container} testID="login-required-screen">
        <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>Bạn cần đăng nhập để sử dụng tính năng này.</Text>
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
        Alert.alert('Lỗi', result.error);
      } else if (result.note) {
        Alert.alert('Thông báo', result.note);
      } else if (result.data) {
        setTransactionData(result.data);
        Alert.alert('Thành công', result.message || 'Giao dịch đã được lưu thành công!');
      }
    } else {
      Alert.alert('Lỗi', 'Không nhận được phản hồi từ server.');
    }
    setLoading(false);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setLoading(true);
        const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
        if (photo?.uri) {
          setPhotoUri(photo.uri);
          await handlePhotoUpload(photo.uri);
        } else {
          Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
        }
      } catch (error) {
        console.error('Take picture error:', error);
        Alert.alert('Lỗi', 'Không thể chụp ảnh: ' + error);
      } finally {
        setLoading(false);
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        setPhotoUri(result.assets[0].uri);
        await handlePhotoUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh: ' + error);
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="scan-screen">
      {photoUri ? (
        <View style={styles.previewContainer} testID="photo-preview">
          <Image source={{ uri: photoUri }} style={styles.previewImage} testID="preview-image" />
          <View style={styles.previewButtons}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => {
                setPhotoUri(null);
                setTransactionData(null);
              }}
              testID="retake-photo-button"
            >
              <Ionicons name="arrow-undo-circle-outline" size={40} color="white" />
              <Text style={styles.buttonText}>Chụp lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                setPhotoUri(null);
                setTransactionData(null);
              }}
              testID="confirm-photo-button"
            >
              <Ionicons name="checkmark-circle-outline" size={40} color="white" />
              <Text style={styles.buttonText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer} testID="camera-container">
          <CameraView style={styles.camera} facing={facing} ref={cameraRef} testID="camera-view">
            <View style={styles.topControls}>
              <TouchableOpacity 
                style={styles.galleryButton} 
                onPress={pickImage} 
                testID="pick-image-button"
              >
                <Ionicons name="images-outline" size={30} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.flashButton} 
                onPress={() => {}}
                testID="flash-button"
              >
                <Ionicons name="flash-outline" size={30} color="white" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.bottomControls}>
              <TouchableOpacity 
                style={styles.flipButton} 
                onPress={toggleCameraFacing} 
                testID="flip-camera-button"
              >
                <Ionicons name="camera-reverse-outline" size={30} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.captureButton} 
                onPress={takePicture} 
                testID="capture-button"
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
              
              <View style={{ width: 30 }} /> {/* Spacer */}
            </View>
          </CameraView>
        </View>
      )}

      {loading && <ActivityIndicator size="large" color="#fff" style={styles.loadingIndicator} testID="loading-indicator" />}
      {transactionData && !loading && (
        <View style={styles.resultContainer} testID="transaction-data-container">
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setTransactionData(null)}
            testID="close-transaction-button"
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.resultText}>Dữ liệu giao dịch:</Text>
          <Text style={styles.recognizedText}>Loại: {transactionData.type}</Text>
          <Text style={styles.recognizedText}>Danh mục: {transactionData.category}</Text>
          {transactionData.items && transactionData.items.length > 0 && (
            <>
              <Text style={styles.recognizedText}>Sản phẩm:</Text>
              {transactionData.items.map((item: any, index: number) => (
                <Text key={index} style={styles.recognizedText} testID={`transaction-item-${index}`}>
                  - {item.productName}: {item.quantity} x {item.price} VNĐ
                </Text>
              ))}
            </>
          )}
          <Text style={styles.recognizedText}>Tổng tiền: {transactionData.amount} VNĐ</Text>
          
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  galleryButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  previewButtons: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  retakeButton: {
    alignItems: 'center',
  },
  confirmButton: {
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    marginTop: 5,
    fontSize: 14,
  },
  resultContainer: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    margin: 20,
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
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
  },
  transactionContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  itemContainer: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5
  },
  totalAmount: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 16
  },
  errorText: {
    color: 'red',
    marginTop: 10
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    padding: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ScanScreen;