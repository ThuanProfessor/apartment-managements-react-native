import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 20,
        textAlign: "center",
    },
    filterContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 16,
        gap: 10,
    },
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: "#e0e0e0",
    },
    filterButtonActive: {
        backgroundColor: "#2e7d32",
    },
    filterText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    filterTextActive: {
        color: "#fff",
    },
    lockerCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        alignItems: "center",
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 12,
        backgroundColor: "#eee",
    },
    infoContainer: {
        flex: 1,
        justifyContent: "center",
    },
    description: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
        marginBottom: 6,
    },
    status: {
        fontSize: 13,
        fontWeight: "600",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignSelf: "flex-start",
        overflow: "hidden",
    },
    received: {
        backgroundColor: "#d4edda",
        color: "#155724",
    },
    pending: {
        backgroundColor: "#fff3cd",
        color: "#856404",
    },
    empty: {
        textAlign: "center",
        marginTop: 40,
        color: "#666",
        fontSize: 16,
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
    },
    pageButton: {
        backgroundColor: "#2e7d32",
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    pageButtonDisabled: {
        backgroundColor: "#ccc",
    },
    pageText: {
        color: "#fff",
        fontWeight: "bold",
    },
    pageIndicator: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
    },
    date: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
    },
});

export default styles;
