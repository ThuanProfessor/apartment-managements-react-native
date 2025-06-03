import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    RefreshControl,
} from "react-native";
import api, { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Title, Button } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';

const LockerScreen = () => {
  const { user } = useAuth();
  const [lockers, setLockers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLockers();
  }, []);

  const fetchLockers = async () => {
    if (!user?.id) {
      console.log('No user ID found');
      return;
    }
    
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      console.log('Using token:', token);
      
      const response = await api.get(API_ENDPOINTS.LOCKERS(user.id), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Lockers response:', response.data);
      setLockers(response.data);
    } catch (error) {
      console.error('Error fetching lockers:', error.response?.data);
      Alert.alert('Lỗi', 'Không thể tải danh sách tủ đồ');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

    const handleReceived = async (lockerId) => {
        try {
            if (!user || !user.id) {
                throw new Error('User not authenticated');
            }

            await api.patch(API_ENDPOINTS.LOCKER_DETAIL(user.id, lockerId), {
                status: 'received'
            });
            
            fetchLockers(); // Refresh list after update
            Alert.alert('Thành công', 'Đã cập nhật trạng thái nhận đồ');
        } catch (error) {
            console.error('Error updating locker:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
        }
    };

    if (loading)
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text>Đang tải...</Text>
            </View>
        );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>🧳 Tủ đồ của bạn</Text>
            {lockers.length === 0 ? (
                <Text style={styles.emptyText}>Không có món đồ nào trong tủ</Text>
            ) : (
                <FlatList
                    data={lockers}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={fetchLockers} />
                    }
                    renderItem={({ item }) => (
                        <Card key={item.id} style={styles.card}>
                            <Card.Content>
                                <Title style={styles.itemTitle}>{item.item_description}</Title>
                                <Text style={styles.itemTrackingCode}>Mã theo dõi: {item.tracking_code}</Text>
                                <Text style={styles.itemStatus}>
                                    Trạng thái: {item.status === "pending" ? "Chờ nhận" : "Đã nhận"}
                                </Text>
                                <Text style={styles.itemTimestamp}>
                                    Thời gian: {new Date(item.created_date).toLocaleDateString("vi-VN")}
                                </Text>

                                {item.status === "pending" && (
                                    <Button
                                        mode="contained"
                                        onPress={() => handleReceived(item.id)}
                                        style={styles.button}
                                    >
                                        Xác nhận đã nhận
                                    </Button>
                                )}
                            </Card.Content>
                        </Card>
                    )}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#1976D2",
        textAlign: "center",
    },
    card: {
        marginBottom: 16,
        elevation: 2,
        backgroundColor: "#fff",
    },
    emptyText: {
        textAlign: "center",
        fontSize: 16,
        color: "#666",
        marginTop: 24,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    itemTrackingCode: {
        fontSize: 14,
        color: "#666",
        marginVertical: 4,
    },
    itemStatus: {
        fontSize: 14,
        color: "#666",
        marginVertical: 4,
    },
    itemTimestamp: {
        fontSize: 12,
        color: "#999",
    },
    button: {
        marginTop: 12,
    },
});

export default LockerScreen;
