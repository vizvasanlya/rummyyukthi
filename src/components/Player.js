// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import DraggableFlatList from "react-native-draggable-flatlist";
// import Card from "./Card";

// const PlayerHand = ({ playerHand, setPlayerHand, onCardSelect }) => {
//   const [groups, setGroups] = useState([]);

//   // Initialize Groups from Player Hand
//   useEffect(() => {
//     if (playerHand && Array.isArray(playerHand) && playerHand.length > 0) {
//       setGroups([playerHand]); // Ensure it's wrapped in an array
//     } else {
//       setGroups([]); // Prevent undefined groups
//     }
//   }, [playerHand]);

//   const [selectedCards, setSelectedCards] = useState([]);
//   const [sortVisible, setSortVisible] = useState(true);
//   const [moveTargetGroup, setMoveTargetGroup] = useState(null);

//   // Select a Card
//   const handleSelectCard = (card, groupIndex) => {
//     const isSelected = selectedCards.some((c) => c.id === card.id);
//     if (isSelected) {
//       setSelectedCards(selectedCards.filter((c) => c.id !== card.id));
//     } else {
//       setSelectedCards([...selectedCards, { ...card, groupIndex }]);
//     }

//     // Show "Move Here" only when one card is selected
//     if (selectedCards.length === 1) {
//       setMoveTargetGroup(groupIndex);
//     } else {
//       setMoveTargetGroup(null);
//     }

//     onCardSelect(card);
//   };

//   // Sort Cards by Suit
//   const handleSort = () => {
//     const allCards = groups.flat().filter((card) => card && card.suit); // Ensure valid cards
//     const sortedGroups = {};

//     allCards.forEach((card) => {
//       if (!sortedGroups[card.suit]) {
//         sortedGroups[card.suit] = [];
//       }
//       sortedGroups[card.suit].push(card);
//     });

//     setGroups(Object.values(sortedGroups));
//     setSortVisible(false);
//   };

//   return (
//     <View style={styles.container}>
//       {/* Debugging Text */}
//       <Text style={styles.debugText}>Groups: {JSON.stringify(groups)}</Text>

//       {/* Sort Button */}
//       {sortVisible && groups.length > 1 && (
//         <TouchableOpacity onPress={handleSort} style={styles.sortButton}>
//           <Text style={styles.buttonText}>Sort</Text>
//         </TouchableOpacity>
//       )}

//       {/* Render Card Groups */}
//       {groups.map((group, groupIndex) => (
//         <View key={`group-${groupIndex}`} style={styles.groupContainer}>
//           <DraggableFlatList
//             data={group.filter((item) => item && item.id)} // Ensure valid cards
//             keyExtractor={(item, index) =>
//               item?.id ? item.id.toString() : `card-${groupIndex}-${index}`
//             } // Handle undefined IDs
//             horizontal
//             renderItem={({ item, drag }) =>
//               item ? (
//                 <TouchableOpacity
//                   onPress={() => handleSelectCard(item, groupIndex)}
//                   onLongPress={drag}
//                   style={[
//                     styles.cardWrapper,
//                     selectedCards.some((c) => c.id === item.id) && styles.selectedCard,
//                   ]}
//                 >
//                   <Card rank={item.rank} suit={item.suit} />
//                 </TouchableOpacity>
//               ) : null
//             }
//           />
//         </View>
//       ))}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 10,
//     backgroundColor: "#f0f0f0",
//   },
//   debugText: {
//     color: "red",
//     fontSize: 12,
//     textAlign: "center",
//     marginBottom: 5,
//   },
//   groupContainer: {
//     flexDirection: "row",
//     marginBottom: 10,
//     alignItems: "center",
//   },
//   cardWrapper: {
//     marginLeft: -30, // Overlapping effect
//   },
//   selectedCard: {
//     borderWidth: 2,
//     borderColor: "yellow",
//   },
//   sortButton: {
//     alignSelf: "center",
//     padding: 10,
//     backgroundColor: "blue",
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   buttonText: {
//     color: "#FFF",
//     fontWeight: "bold",
//   },
// });

// export default PlayerHand;
