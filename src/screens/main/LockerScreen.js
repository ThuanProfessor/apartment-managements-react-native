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
} from "react-native";
import api from "../../config/api";
import { API_ENDPOINTS } from '../../config/api';
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../../styles/LokerScreensStyles";

const LockerScreen = () => {
    const [lockers, setLockers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const fetchLockers = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await api.get(API_ENDPOINTS.LOCKERS, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLockers(res.data);
        } catch (err) {
            console.error("API error:", err.response || err.message || err);
            Alert.alert("Lỗi", "Không thể tải danh sách tủ đồ.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLockers();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const filteredLockers = lockers.filter((item) => {
        if (filter === "received") return item.status === "received";
        if (filter === "pending") return item.status !== "received";
        return true;
    });

    const totalPages = Math.ceil(filteredLockers.length / itemsPerPage);

    const paginatedLockers = filteredLockers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const renderItem = ({ item }) => (
        <View style={styles.lockerCard}>
            {item.image && (
                <Image source={{ uri: item.image }} style={styles.image} />
            )}
            <View style={styles.infoContainer}>
                <Text style={styles.description}>{item.item_description}</Text>
                <Text style={styles.date}>
                    🗓 Ngày tạo: {new Date(item.created_date).toLocaleDateString()}
                </Text>

                {item.received_at && (
                    <Text style={styles.date}>
                        ✅ Nhận lúc: {new Date(item.received_at).toLocaleDateString()}
                    </Text>
                )}

                <Text
                    style={[
                        styles.status,
                        item.status === "received" ? styles.received : styles.pending,
                    ]}
                >
                    {item.status === "received" ? "Đã nhận" : "Chờ nhận"}
                </Text>
            </View>
        </View>
    );

    if (loading)
        return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>🧳 Tủ đồ của bạn</Text>

            <View style={styles.filterContainer}>
                {["all", "received", "pending"].map((type) => (
                    <TouchableOpacity
                        key={type}
                        onPress={() => setFilter(type)}
                        style={[
                            styles.filterButton,
                            filter === type && styles.filterButtonActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filter === type && styles.filterTextActive,
                            ]}
                        >
                            {type === "all"
                                ? "Tất cả"
                                : type === "received"
                                ? "Đã nhận"
                                : "Chờ nhận"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={paginatedLockers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.empty}>
                        Không có món hàng nào trong tủ đồ.
                    </Text>
                }
                contentContainerStyle={{ paddingBottom: 20 }}
            />

            {totalPages > 1 && (
                <View style={styles.pagination}>
                    <TouchableOpacity
                        onPress={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        style={[
                            styles.pageButton,
                            currentPage === 1 && styles.pageButtonDisabled,
                        ]}
                    >
                        <Text style={styles.pageText}>◀</Text>
                    </TouchableOpacity>

                    <Text style={styles.pageIndicator}>
                        Trang {currentPage} / {totalPages}
                    </Text>

                    <TouchableOpacity
                        onPress={() =>
                            setCurrentPage((p) => Math.min(p + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        style={[
                            styles.pageButton,
                            currentPage === totalPages && styles.pageButtonDisabled,
                        ]}
                    >
                        <Text style={styles.pageText}>▶</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

export default LockerScreen;