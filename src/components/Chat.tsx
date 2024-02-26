import { useRef, useState } from "react";

type MessageModel = {
  event: "message" | "connection";
  username: string;
  id: number;
  message: string;
};

export const Chat = () => {
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [value, setValue] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);

  const socket = useRef<WebSocket>();

  function connect() {
    socket.current = new WebSocket("ws://localhost:5000");

    socket.current.onopen = () => {
      setConnected(true);
      const message = {
        event: "connection",
        username,
        id: Date.now(),
      };
      socket.current?.send(JSON.stringify(message));
      console.log("Socket connected");
    };
    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [message, ...prev]);
    };
    socket.current.onclose = () => {
      console.log("Socket is closed");
    };
    socket.current.onerror = () => {
      console.log("Socket error");
    };
  }

  const sendMessage = async () => {
    const message = {
      username,
      message: value,
      id: Date.now(),
      event: "message",
    };
    socket.current?.send(JSON.stringify(message));
    setValue("");
  };

  if (!connected) {
    return (
      <div className="center">
        <div className="form">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="Введите ваше имя"
          />
          <button onClick={connect}>Войти</button>
        </div>
      </div>
    );
  }

  return (
    <div className="center">
      <div>
        <div className="form">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type="text"
          />
          <button onClick={sendMessage}>Отправить</button>
        </div>
        <div className="messages">
          {messages.map((message) => (
            <div key={message.id}>
              {message.event === "connection" ? (
                <div className="connection_message">
                  Пользователь {message.username} подключился
                </div>
              ) : (
                <div className="message">
                  {message.username}. {message.message}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
