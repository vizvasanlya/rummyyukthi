import { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';

const MyMatchesScreen = ({ navigation }) => {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        fetch('/api/mymatches')
            .then(res => res.json())
            .then(data => setMatches(data));
    }, []);

    return (
        <View>
            <Text>My Matches</Text>
            {matches.length === 0 ? (
                <Text>No ongoing matches</Text>
            ) : (
                matches.map(match => (
                    <View key={match.id}>
                        <Text>Match ID: {match.id}</Text>
                        <Button title="Join Now" onPress={() => navigation.navigate('GameRoomScreen', { matchId: match.id })} />
                    </View>
                ))
            )}
        </View>
    );
};

export default MyMatchesScreen;
