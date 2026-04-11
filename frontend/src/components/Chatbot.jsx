import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Leaf, CloudSun } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { sendChatMessage, getWeather } from '../utils/api';
import './Chatbot.css';

const quickReplies = {
  en: [
    'Why are my leaves yellow?',
    'How to treat leaf spot?',
    'Best fertilizer tips',
    'Pest control help',
    'What should I do before rain?',
    'Summarize this project',
  ],
  hi: [
    'पत्तियां पीली क्यों हैं?',
    'धब्बों का इलाज कैसे करें?',
    'खाद की सलाह दें',
    'कीट नियंत्रण मदद',
    'बारिश से पहले क्या करें?',
    'इस प्रोजेक्ट का सारांश दें',
  ],
};

export default function Chatbot() {
  const { t, lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [assistantMode, setAssistantMode] = useState('local');
  const [weatherContext, setWeatherContext] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'bot', text: t('chat_greeting'), source: 'local' }]);
    }
  }, [isOpen, messages.length, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchWeather = (params = {}) => {
      getWeather({ lang, location: t('weather_farm_label'), ...params })
        .then(setWeatherContext)
        .catch(() => setWeatherContext(null));
    };

    if (!navigator.geolocation) {
      fetchWeather();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          location: t('weather_farm_label'),
        });
      },
      () => fetchWeather(),
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 300000 },
    );
  }, [isOpen, lang, t]);

  const handleSend = async (text = inputVal) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    try {
      const data = await sendChatMessage(text.trim(), lang, weatherContext);
      setAssistantMode(data.source || 'local');
      setMessages((prev) => [...prev, { role: 'bot', text: data.response, source: data.source || 'local' }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          source: 'local',
          text: lang === 'hi'
            ? 'माफ करें, कुछ गलत हो गया। कृपया दोबारा कोशिश करें।'
            : 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        className={`chatbot-fab ${isOpen ? 'chatbot-fab-hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open chat assistant"
      >
        <MessageCircle size={24} />
        <span className="chatbot-fab-pulse" />
      </button>

      {isOpen && (
        <div className="chatbot-panel glass-card-static animate-fade-in">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <Leaf size={18} />
              </div>
              <div>
                <div className="chatbot-header-title">{t('chat_title')}</div>
                <div className="chatbot-header-status">
                  {assistantMode === 'ai' ? t('chat_status_ai') : t('chat_status_local')}
                </div>
              </div>
            </div>

            {weatherContext && (
              <div className="chatbot-weather-pill">
                <CloudSun size={14} />
                <span>{weatherContext.temperature_c}°C</span>
              </div>
            )}

            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg-${msg.role}`}>
                <div className={`chatbot-bubble chatbot-bubble-${msg.role}`}>
                  {msg.text.split('\n').map((line, j, arr) => (
                    <span key={j}>
                      {line}
                      {j < arr.length - 1 && <br />}
                    </span>
                  ))}
                  {msg.role === 'bot' && (
                    <div className="chatbot-msg-source">
                      {msg.source === 'ai' ? t('chat_source_ai') : t('chat_source_local')}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chatbot-msg chatbot-msg-bot">
                <div className="chatbot-bubble chatbot-bubble-bot chatbot-typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="chatbot-quick-replies">
              {(quickReplies[lang] || quickReplies.en).map((q, i) => (
                <button key={i} className="chatbot-quick-btn" onClick={() => handleSend(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              className="chatbot-input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat_placeholder')}
            />
            <button
              className="chatbot-send-btn"
              onClick={() => handleSend()}
              disabled={!inputVal.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
