import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  gameMode: null,
  numberOfPlayers: null,
  pointValue: null,
  poolType: null,
  numberOfDeals: null,
  entryFee: null,
  players: [],
  roomId: null,
  roomStatus: "waiting",
  startTimer: 5,
  gameStarted: false,
  loading: false,
  error: null,
  roomId: null,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGameMode: (state, action) => {
      state.gameMode = action.payload;
      state.numberOfPlayers = null;
      state.pointValue = null;
      state.poolType = null;
      state.numberOfDeals = null;
      state.entryFee = null;
    },
    setNumberOfPlayers: (state, action) => {
      state.numberOfPlayers = action.payload;
    },
    setPointValue: (state, action) => {
      state.pointValue = action.payload;
    },
    setPoolType: (state, action) => {
      state.poolType = action.payload;
    },
    setNumberOfDeals: (state, action) => {
      state.numberOfDeals = action.payload;
    },
    setEntryFee: (state, action) => {
      state.entryFee = action.payload;
    },
    setPlayers: (state, action) => {
      state.players = action.payload;
    },
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    setRoomStatus: (state, action) => {
      state.roomStatus = action.payload;
    },
    setStartTimer: (state, action) => {
      state.startTimer = action.payload;
    },
    setGameStarted: (state, action) => {
      state.gameStarted = action.payload;
    },
    resetGameState: (state) => {
      return initialState;
    },
  },
});

export const {
  setGameMode,
  setNumberOfPlayers,
  setPointValue,
  setPoolType,
  setNumberOfDeals,
  setEntryFee,
  setPlayers,
  setRoomId,
  setRoomStatus,
  setStartTimer,
  setGameStarted,
  resetGameState,
} = gameSlice.actions;

export default gameSlice.reducer;
