import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import socket from "../socket"; // Your centralized socket instance

const OnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // Listen for active users from backend
    socket.on("active-users", (users) => {
      setOnlineUsers(users);
    });

    // Cleanup on unmount
    return () => {
      socket.off("active-users");
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Online Players ({onlineUsers.length})</Text>
      {onlineUsers.length > 0 ? (
        <FlatList
          data={onlineUsers}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <Text style={styles.username}>{item}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noUsers}>No players online</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 10,
    width: "90%",
    alignSelf: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  userItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#555",
  },
  username: {
    color: "#fff",
    fontSize: 14,
  },
  noUsers: {
    color: "#bbb",
    textAlign: "center",
    fontSize: 14,
  },
});

export default OnlineUsers;
