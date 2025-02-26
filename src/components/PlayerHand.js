import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import Card from "./Card"; // Your custom Card component

const PlayerHand = ({ playerHand, setPlayerHand, onCardSelect, selectedCard, onSelectionChange }) => {
  const [groupedCards, setGroupedCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [sortApplied, setSortApplied] = useState(false); // Track if sorting has been applied

  useEffect(() => {
   
    if (!sortApplied) {
      handleSort(); // Automatically sort on first render
      setSortApplied(true);
    } else {
      updateGroupsFromPlayerHand();
    }
  }, [playerHand]);

  const updateGroupsFromPlayerHand = () => {
    let newGroupedCards = groupedCards.map(group =>
      group.filter(card => playerHand.some(c => c.rank === card.rank && c.suit === card.suit))
    ).filter(group => group.length > 0);

    playerHand.forEach(card => {
      const isCardGrouped = newGroupedCards.some(group =>
        group.some(c => c.rank === card.rank && c.suit === card.suit)
      );
      if (!isCardGrouped) {
        newGroupedCards.push([card]);
      }
    });

    setGroupedCards(newGroupedCards);
  };

  const handleSort = () => {
    if (!playerHand || !Array.isArray(playerHand)) return;

    let sortedCards = [...playerHand].sort(
      (a, b) => a.suit.localeCompare(b.suit) || a.rank - b.rank
    );

    let grouped = [];
    sortedCards.forEach((card) => {
      let lastGroup = grouped[grouped.length - 1];
      if (!lastGroup || lastGroup[0].suit !== card.suit) {
        grouped.push([card]);
      } else {
        lastGroup.push(card);
      }
    });

    setGroupedCards(grouped);
  };

  const handleMoveToGroup = (groupIndex) => {
    if (selectedCards.length === 0) return;

    let newGroups = groupedCards.map((group, index) => {
      if (index === groupIndex) return [...group, ...selectedCards];
      return group.filter((card) => !selectedCards.includes(card));
    });

    newGroups = newGroups.filter((group) => group.length > 0);

    setGroupedCards(newGroups);
    setSelectedCards([]); 
    setSelectedGroup(null);
  };

  const handleCardSelection = (card) => {
    setSelectedCards((prevSelected) => {
      const updatedSelection = prevSelected.includes(card)
        ? prevSelected.filter((c) => c !== card)
        : [...prevSelected, card];

      if (updatedSelection.length === 0) {
        setSelectedGroup(null);
      }

      onSelectionChange(updatedSelection);
      return updatedSelection;
    });

    if (selectedCards.length === 0) {
      onCardSelect(card);
    }
  };

  const handleCreateGroup = () => {
    if (selectedCards.length < 2) return;

    let newGroups = groupedCards.map((group) =>
      group.filter((card) => !selectedCards.includes(card))
    );

    newGroups = newGroups.filter((group) => group.length > 0);
    newGroups.push([...selectedCards]);

    setGroupedCards(newGroups);
    setSelectedCards([]);
  };

  const handleOutsidePress = () => {
    setSelectedCards([]);
    setSelectedGroup(null);
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.handContainer}>
        {/* Sort button only appears when there are two or more groups */}
        {groupedCards.length > 1 && (
          <TouchableOpacity style={styles.sortButton} onPress={handleSort}>
            <Text style={styles.sortButtonText}>Sort</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={groupedCards}
          keyExtractor={(group, index) => `group-${index}`}
          horizontal
          contentContainerStyle={styles.flatListContainer}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: group, index: groupIndex }) => (
            <View key={groupIndex} style={[styles.cardGroup, groupIndex === 0 ? styles.firstGroupMargin : null]}>
              {selectedCards.length > 0 && selectedGroup !== groupIndex && groupedCards[groupIndex]?.length > 0 && (
                <TouchableOpacity style={styles.moveButton} onPress={() => handleMoveToGroup(groupIndex)}>
                  <Text style={styles.moveButtonText}>Move Here</Text>
                </TouchableOpacity>
              )}

              <DraggableFlatList
                data={group}
                keyExtractor={(card, index) => `${card.rank}-${card.suit}-${index}`}
                renderItem={({ item, drag, isActive, index }) => (
                  <View
                    style={[
                      styles.cardContainer,
                      index === 0 ? styles.firstCardMargin : styles.overlappingCard,
                      selectedCards.includes(item) ? styles.selectedCard : null,
                    ]}
                  >
                    <TouchableOpacity
                      onLongPress={drag}
                      disabled={isActive}
                      onPress={() => {
                        handleCardSelection(item);
                        setSelectedGroup(groupIndex);
                      }}
                    >
                      <Card rank={item.rank} suit={item.suit} />
                    </TouchableOpacity>
                  </View>
                )}
                onDragEnd={({ data }) => {
                  let newGroups = [...groupedCards];
                  newGroups[groupIndex] = data;
                  setGroupedCards(newGroups);
                }}
                horizontal
                contentContainerStyle={styles.handList}
              />
            </View>
          )}
        />

        {selectedCards.length > 1 && (
          <TouchableOpacity style={styles.groupButton} onPress={handleCreateGroup}>
            <Text style={styles.groupButtonText}>Group</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};


// 🔹 **Styles**
const styles = StyleSheet.create({
  handContainer: {
    position: "absolute",
    bottom: 30,  
    left: 0,
    right: 0,
    alignItems: "center",
    width: "100%",
    minHeight: 140, 
    maxHeight: 160,   
    overflow: "visible",
    zIndex: 15,
    border:10,
  },  
  selectedCard: {
    transform: [{ translateY: -15 }],  // ⬆ Move up properly
    zIndex: 100,  // ✅ Ensure it's above others
  },
  flatListContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    flexGrow: 1,
  },
  cardGroup: {
    flexDirection: "row",
    backgroundColor: "transparent", // ✅ Use transparent instead of rgba
    borderRadius: 8,
    paddingHorizontal: 4,
    marginHorizontal: 5,
    overflow: "visible",
  },

  firstGroupMargin: {
    marginLeft: 10,
  },
  firstCardMargin: {
    marginLeft: 20,
  },
  overlappingCard: {
    marginLeft: -5,
    marginRight: -1,
  },
  sortButton: {
    position: "absolute",
    top: -40,
    right: 20,
    padding: 10,
    backgroundColor: "#ff9800",
    borderRadius: 5,
  },
  sortButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  handList: {
    paddingHorizontal: 5,
  },
  moveButton: {
    position: "absolute",
    top: -10,
    left: "50%",
    transform: [{ translateX: -30 }],
    backgroundColor: "#4CAF50",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    zIndex: 10,
  },
  moveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  groupButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "grey",
    borderRadius: 5,
    left:380,
  },
  groupButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default PlayerHand;
