'use client';

import { useState, useEffect, useRef } from 'react';
import { getWeather } from './utils/getWeather';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: 'user', content: input },
    ];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/get-resp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });

      const data = await res.json();
      console.log('Response:', data.response);

      const responseMessage = data.response.choices[0].message;
      const toolCalls = responseMessage.tool_calls;

      if (toolCalls) {
        const availableFunctions = {
          "getWeather": async (args) => {
            const { location } = JSON.parse(args);
            const weatherData = await getWeather(location);
            return weatherData.error
              ? weatherData.error
              : `The weather in ${weatherData.location} is ${weatherData.temperature}°C with ${weatherData.description}.`;
          },
        };

        const updatedMessages = [...newMessages, responseMessage];

        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name;
          const functionToCall = availableFunctions[functionName];
          const functionArgs = toolCall.function.arguments;

          if (functionToCall) {
            const functionResponse = await functionToCall(functionArgs);

            updatedMessages.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              name: functionName,
              content: functionResponse,
            });
          }
        }

        setMessages(updatedMessages);
      } else {
        setMessages([...newMessages, responseMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages([
        ...newMessages,
        { role: 'bot', content: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 space-y-4 min-h-[550px] h-full flex flex-col">
        <h1 className="text-2xl font-bold text-center mb-4">Groq Chatbot</h1>

        <div className="flex-grow overflow-y-auto space-y-4 p-4 border rounded bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`${
                  message.role === 'user' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'
                } p-3 rounded-lg max-w-xs`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xs">
                Typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center space-x-4 mt-4">
          <input
            type="text"
            className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage(e);
            }}
          />
          <button
            onClick={handleSendMessage}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-700 transition-colors"
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
