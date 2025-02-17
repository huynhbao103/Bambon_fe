import React, { useState, useRef } from 'react';
import { 
  Button, StyleSheet, Text, TouchableOpacity, View, 
  Image, Alert, SafeAreaView, Platform, ActivityIndicator 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraType } from 'expo-camera';
import { CameraView, useCameraPermissions } from 'expo-camera';
import uploadPhoto from '../../schema/uploadPhoto';

const ScanScreen = () => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

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

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handlePhotoUpload = async (uri: string) => {
    setLoading(true);
    const result = await uploadPhoto(uri);
    if (result) {
      setRecognizedText(result);
      Alert.alert('Success', result);
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
      allowsEditing: true, // Cho phép chỉnh sửa ảnh
      quality: 1, // Chất lượng ảnh (từ 0 đến 1)
    });

    if (!result.canceled && result.assets[0].uri) {
      setPhotoUri(result.assets[0].uri);
      await handlePhotoUpload(result.assets[0].uri);
    } else {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleRetakePhoto = () => {
    setPhotoUri(null);
    setRecognizedText(null);
  };

  const handleDeletePhoto = () => {
    setPhotoUri(null);
    setRecognizedText(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {photoUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.retakeButton} onPress={handleRetakePhoto}>
              <Ionicons name="arrow-undo-circle-outline" size={40} color="white" />
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePhoto}>
              <Ionicons name="trash-outline" size={40} color="white" />
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={40} color="white" />
          </TouchableOpacity>
          <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
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
      {recognizedText && !loading && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Detected Text: </Text>
          <Text style={styles.recognizedText}>{recognizedText}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
    backgroundColor: '#212121', // Dark background for modern look
  },
  message: {
    textAlign: 'center',
    paddingBottom: 50,
    fontSize: 16,
    color: '#fff',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  camera: {
    flex: 1,
    width: '100%',
    borderRadius: 20,
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
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  retakeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    padding: 10,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    borderRadius: 50,
    padding: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  resultContainer: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    marginTop: 20,
    width: '90%',
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recognizedText: {
    color: '#ffd700',
    fontSize: 14,
    marginTop: 10,
  },
  loadingIndicator: {
    marginTop: 10,
  },
});

export default ScanScreen;