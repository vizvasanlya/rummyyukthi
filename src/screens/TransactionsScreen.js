import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useAppSelector } from "../redux/hooks";
import socket from "../socket";


const TransactionsScreen = () => {
    const user = useAppSelector((state) => state.auth.user);
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (!user) return;

        // Listen for real-time updates
        socket.on("update-transactions", (data) => {
            setTransactions(data);
        });

        // Fetch initial data
        fetchTransactions(filter);

        return () => {
            socket.off("update-transactions");
        };
    }, [filter, user]);

    const fetchTransactions = (type) => {
        if (user) {
            socket.emit("fetch-transactions", { userId: user.id, type });
        }
    };

    return (
        <View style={styles.container}>
            {/* Filter Options */}
            <View style={styles.filterContainer}>
                {["all", "deposits_withdrawals", "game", "other"].map((type) => (
                    <TouchableOpacity 
                        key={type} 
                        style={[styles.filterButton, filter === type && styles.activeButton]}
                        onPress={() => setFilter(type)}
                    >
                        <Text style={[styles.filterText, filter === type && styles.activeText]}>
                            {type.replace("_", " ").toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Transaction List */}
            <FlatList
                data={transactions}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.transactionItem}>
                        <Text style={styles.transactionText}>{item.description}</Text>
                        <Text style={styles.amountText}>
                            {item.amount > 0 ? `+₹${item.amount}` : `-₹${Math.abs(item.amount)}`}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#1E1E1E", padding: 10 },
    filterContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10 },
    filterButton: { padding: 10, backgroundColor: "#444", borderRadius: 5 },
    activeButton: { backgroundColor: "#666" },
    filterText: { color: "#bbb" },
    activeText: { color: "#fff", fontWeight: "bold" },
    transactionItem: { flexDirection: "row", justifyContent: "space-between", padding: 10, borderBottomWidth: 1, borderBottomColor: "#555" },
    transactionText: { color: "#fff" },
    amountText: { fontWeight: "bold", color: "#0f0" },
});

export default TransactionsScreen;
