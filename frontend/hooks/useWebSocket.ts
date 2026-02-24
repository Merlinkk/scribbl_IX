import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { WS_URL, EVENTS } from '@/lib/constants';
import { toast } from 'sonner';

export const useWebSocket = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const {
    setConnected,
    setPlayers,
    setPhase,
    setRoomId,
    setPlayerId,
    setIsOwner,
    setCurrentRound,
    setTimeLeft,
    setWordHint,
    setWordChoices,
    setCurrentDrawerId,
    setSelectedWord,
    addMessage,
    resetGame
  } = useGameStore();

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    console.log('Connecting to WebSocket:', WS_URL);
    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      setConnected(true);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
      setConnected(false);
      // Attempt reconnect after delay
      setTimeout(connect, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error('Connection error. Retrying...');
    };

    ws.onmessage = (event) => {
      // Handle binary data (draw events) separately if needed
      if (event.data instanceof Blob) {
        // Handle binary blob
        return;
      }

      if (event.data instanceof ArrayBuffer) {
        // Handle binary array buffer
        return;
      }

      try {
        const message = JSON.parse(event.data);
        const { type, data } = message;

        console.log('Received message:', type, data);

        switch (type) {
          case EVENTS.ROOM_INFO:
            setRoomId(data.roomId);
            setPlayers(data.players);
            break;
            
          case EVENTS.GAME_STARTED:
            setPhase('roundEnd'); // Small transition before round starts
            toast.success('Game Started!');
            break;
            
          case EVENTS.ROUND_START:
            setPhase('drawing');
            setCurrentRound(data.round);
            setCurrentDrawerId(data.drawerId);
            setWordHint(data.wordHint);
            setWordChoices(null); // Clear choices for others
            addMessage({
              id: Date.now().toString(),
              text: `Round ${data.round} started! ${data.drawerName} is drawing.`,
              type: 'system',
              timestamp: Date.now()
            });
            break;
            
          case EVENTS.WORD_CHOICES:
            setPhase('choosing');
            setWordChoices(data.words);
            toast.info('Choose a word to draw!');
            break;
            
          case EVENTS.TIMER_UPDATE:
            setTimeLeft(data.timeLeft);
            break;
            
          case EVENTS.CORRECT_GUESS:
            addMessage({
              id: Date.now().toString(),
              playerId: data.playerId,
              playerName: data.playerName,
              text: 'guessed the word!',
              type: 'correct',
              timestamp: Date.now()
            });
            break;
            
          case EVENTS.CHAT:
            addMessage({
              id: Date.now().toString(),
              playerId: data.playerId,
              playerName: data.playerName,
              text: data.text,
              type: 'chat',
              timestamp: Date.now()
            });
            break;
            
          case EVENTS.ROUND_END:
            setPhase('roundEnd');
            setPlayers(data.scores);
            addMessage({
              id: Date.now().toString(),
              text: `Round ended! The word was "${data.word}"`,
              type: 'system',
              timestamp: Date.now()
            });
            break;
            
          case EVENTS.GAME_OVER:
            setPhase('gameOver');
            setPlayers(data.scores);
            toast.success(`Game Over! Winner: ${data.winner.name}`);
            break;
            
          case EVENTS.ERROR:
            toast.error(data.message);
            break;
            
          default:
            console.log('Unhandled message type:', type);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
  }, [
    setConnected, setPlayers, setPhase, setRoomId, setPlayerId, 
    setIsOwner, setCurrentRound, setTimeLeft, setWordHint, 
    setWordChoices, setCurrentDrawerId, addMessage
  ]);

  const sendMessage = useCallback((type: string, data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket not connected');
      toast.error('Not connected to server');
    }
  }, []);

  const sendBinary = useCallback((data: Uint8Array) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(data);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
    };
  }, [connect]);

  return { sendMessage, sendBinary, socket: socketRef.current };
};
