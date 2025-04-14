import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/Button';
import { useRouter } from 'expo-router';
import { api } from '../services/api';
import NetInfo from '@react-native-community/netinfo';

// Add interface for ApiInfo type above the component
interface ApiInfo {
  isConnected?: boolean | null;
  type?: any;
  details?: any;
  apiUrl?: string;
  apiTest?: any;
  error?: string;
}

export default function NetworkDiagnosticScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null);
  
  const checkNetworkStatus = async () => {
    setIsLoading(true);
    try {
      // Check general network status
      const netInfo = await NetInfo.fetch();
      setNetworkInfo(netInfo);
      
      // Check API connectivity
      const apiStatus = await api.checkNetworkStatus();
      setApiInfo(apiStatus as ApiInfo);
      
      // Test API connection
      const apiTest = await api.testConnection();
      setApiInfo((prev: ApiInfo | null) => prev ? { ...prev, apiTest } : { apiTest });
      
    } catch (error) {
      console.error('Diagnostic error:', error);
      Alert.alert('Hata', 'Ağ teşhisi sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    checkNetworkStatus();
  }, []);
  
  // Değerleri güzel formatlayan helper fonksiyon
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText variant="h1" style={styles.title}>
        Ağ Teşhis Ekranı
      </ThemedText>
      
      <Button
        label="Teşhisi Yenile"
        variant="primary"
        onPress={checkNetworkStatus}
        loading={isLoading}
        style={styles.refreshButton}
      />
      
      <ScrollView style={styles.scrollView}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#4A90E2" style={styles.loader} />
        ) : (
          <>
            <ThemedView style={styles.section}>
              <ThemedText weight="semiBold" style={styles.sectionTitle}>
                Genel Ağ Bilgileri
              </ThemedText>
              
              {networkInfo ? (
                <>
                  <ThemedView style={styles.infoItem}>
                    <ThemedText weight="semiBold">Bağlantı Durumu:</ThemedText>
                    <ThemedText>{networkInfo.isConnected ? 'Bağlı ✓' : 'Bağlı Değil ✗'}</ThemedText>
                  </ThemedView>
                  
                  <ThemedView style={styles.infoItem}>
                    <ThemedText weight="semiBold">Bağlantı Tipi:</ThemedText>
                    <ThemedText>{formatValue(networkInfo.type)}</ThemedText>
                  </ThemedView>
                  
                  <ThemedView style={styles.infoItem}>
                    <ThemedText weight="semiBold">IP Adresi:</ThemedText>
                    <ThemedText>{formatValue(networkInfo.details?.ipAddress)}</ThemedText>
                  </ThemedView>
                </>
              ) : (
                <ThemedText>Ağ bilgileri alınamadı.</ThemedText>
              )}
            </ThemedView>
            
            <ThemedView style={styles.section}>
              <ThemedText weight="semiBold" style={styles.sectionTitle}>
                API Bağlantı Durumu
              </ThemedText>
              
              {apiInfo ? (
                <>
                  <ThemedView style={styles.infoItem}>
                    <ThemedText weight="semiBold">API URL:</ThemedText>
                    <ThemedText>{formatValue(apiInfo.apiUrl)}</ThemedText>
                  </ThemedView>
                  
                  <ThemedView style={styles.infoItem}>
                    <ThemedText weight="semiBold">API Test Sonucu:</ThemedText>
                    {apiInfo.apiTest ? (
                      <ThemedText>
                        {apiInfo.apiTest.success ? 'Başarılı ✓' : 'Başarısız ✗'} 
                        (Status: {apiInfo.apiTest.status || 'N/A'})
                      </ThemedText>
                    ) : (
                      <ThemedText>Test yapılmadı</ThemedText>
                    )}
                  </ThemedView>
                  
                  {apiInfo.apiTest?.error && (
                    <ThemedView style={styles.errorContainer}>
                      <ThemedText weight="semiBold">Hata:</ThemedText>
                      <ThemedText style={styles.errorText}>
                        {formatValue(apiInfo.apiTest.error)}
                      </ThemedText>
                      <ThemedText style={styles.errorText}>
                        {apiInfo.apiTest.message || ''}
                      </ThemedText>
                    </ThemedView>
                  )}
                </>
              ) : (
                <ThemedText>API bilgileri alınamadı.</ThemedText>
              )}
            </ThemedView>
            
            <ThemedView style={styles.section}>
              <ThemedText weight="semiBold" style={styles.sectionTitle}>
                Sorun Giderme Önerileri
              </ThemedText>
              
              <ThemedText style={styles.tipText}>
                1. Sunucunun çalıştığından emin olun. Genellikle "npm start" komutuyla başlatılır.
              </ThemedText>
              
              <ThemedText style={styles.tipText}>
                2. API URL yapılandırmasını kontrol edin. Android emülatörü için 10.0.2.2 kullanılmalıdır.
              </ThemedText>
              
              <ThemedText style={styles.tipText}>
                3. Cihazınızın internet bağlantısını kontrol edin.
              </ThemedText>
              
              <ThemedText style={styles.tipText}>
                4. API_URL değişkenindeki sunucu IP adresinin doğru olduğundan emin olun.
              </ThemedText>
            </ThemedView>
          </>
        )}
      </ScrollView>
      
      <Button
        label="Geri Dön"
        variant="outline"
        onPress={() => router.back()}
        style={styles.backButton}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  refreshButton: {
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  errorContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  errorText: {
    color: '#D32F2F',
    marginTop: 4,
  },
  loader: {
    marginTop: 50,
  },
  tipText: {
    marginVertical: 6,
  },
  backButton: {
    marginTop: 16,
  },
}); 