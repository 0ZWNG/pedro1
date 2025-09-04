import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';

// === Identidades disponíveis ===
const identities = [
  { id: '1', name: 'Pessoal', color: '#2ECC71' },
  { id: '2', name: 'Profissional', color: '#3498DB' },
  { id: '3', name: 'Anônimo', color: '#9B59B6' }
];

// === Tipos de visibilidade ===
const visibilityOptions = ['público', 'privado', 'efêmero'];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [currentIdentity, setCurrentIdentity] = useState(identities[0]);
  const [feeds, setFeeds] = useState({ '1': [], '2': [], '3': [] });
  const [newPost, setNewPost] = useState('');
  const [selectedVisibility, setSelectedVisibility] = useState('público');
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Alternar identidade
  const switchIdentity = () => {
    const nextIndex = (identities.findIndex(i => i.id === currentIdentity.id) + 1) % identities.length;
    setCurrentIdentity(identities[nextIndex]);
  };

  // Adicionar post no feed da identidade atual
  const addPost = () => {
    if (newPost.trim() === '') return;
    const post = {
      id: Date.now().toString(),
      author: currentIdentity.name,
      content: newPost,
      visibility: selectedVisibility
    };

    setFeeds(prev => ({
      ...prev,
      [currentIdentity.id]: [post, ...prev[currentIdentity.id]]
    }));

    // Se for efêmero → apagar em 10s
    if (selectedVisibility === 'efêmero') {
      setTimeout(() => {
        setFeeds(prev => {
          const filtered = prev[currentIdentity.id].filter(p => p.id !== post.id);
          return { ...prev, [currentIdentity.id]: filtered };
        });
      }, 10000);
    }

    setNewPost('');
  };

  // Enviar mensagem efêmera no chat
  const sendMessage = () => {
    if (chatInput.trim() === '') return;
    const msg = { id: Date.now().toString(), text: chatInput };
    setMessages(prev => [...prev, msg]);
    setChatInput('');

    // Mensagem desaparece após 5 segundos
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== msg.id));
    }, 5000);
  };

  // === Tela de login ===
  if (!loggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🌐 Prisma</Text>
        <Text style={styles.subtitle}>Rede Transparente e Segura</Text>
        <TextInput
          placeholder="Digite seu nome"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
        <Button title="Entrar" onPress={() => username.trim() !== '' && setLoggedIn(true)} />
      </View>
    );
  }

  // === Tela principal ===
  return (
    <View style={styles.container}>
      {/* Identidade atual */}
      <View style={[styles.identityBar, { backgroundColor: currentIdentity.color }]}>
        <Text style={styles.identityText}>Identidade: {currentIdentity.name}</Text>
        <Button title="Trocar" color="#FFF" onPress={switchIdentity} />
      </View>

      {/* Feed */}
      <Text style={styles.sectionTitle}>📌 Feed ({currentIdentity.name})</Text>
      <TextInput
        placeholder="Escreva algo..."
        style={styles.input}
        value={newPost}
        onChangeText={setNewPost}
      />

      {/* Selecionar visibilidade */}
      <View style={styles.visibilityRow}>
        {visibilityOptions.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.visibilityButton,
              selectedVisibility === option && styles.visibilitySelected
            ]}
            onPress={() => setSelectedVisibility(option)}
          >
            <Text style={selectedVisibility === option ? { color: '#FFF' } : {}}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Postar" onPress={addPost} />

      <FlatList
        data={feeds[currentIdentity.id]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.author}>{item.author} ({item.visibility})</Text>
            <Text style={styles.content}>{item.content}</Text>
          </View>
        )}
      />

      {/* Chat efêmero */}
      <Text style={styles.sectionTitle}>💬 Chat Efêmero</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.chatBubble}>
            <Text style={styles.chatText}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.chatInputContainer}>
        <TextInput
          placeholder="Digite uma mensagem..."
          style={styles.chatInput}
          value={chatInput}
          onChangeText={setChatInput}
        />
        <TouchableOpacity style={styles.chatButton} onPress={sendMessage}>
          <Text style={{ color: '#FFF' }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ECF0F1', padding: 20, paddingTop: 40 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#7f8c8d' },
  input: { backgroundColor: '#FFF', padding: 10, marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#BDC3C7' },
  identityBar: { padding: 10, flexDirection: 'row', justifyContent: 'space-between', borderRadius: 8, marginBottom: 15 },
  identityText: { color: '#FFF', fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15, marginBottom: 10 },
  card: { backgroundColor: '#FFF', padding: 15, marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#DDD' },
  author: { fontWeight: 'bold', marginBottom: 5 },
  content: { fontSize: 16 },
  visibilityRow: { flexDirection: 'row', marginBottom: 10 },
  visibilityButton: { padding: 8, borderWidth: 1, borderColor: '#BDC3C7', borderRadius: 6, marginRight: 5 },
  visibilitySelected: { backgroundColor: '#3498DB', borderColor: '#3498DB' },
  chatBubble: { backgroundColor: '#3498DB', padding: 10, borderRadius: 15, marginVertical: 5, alignSelf: 'flex-start' },
  chatText: { color: '#FFF' },
  chatInputContainer: { flexDirection: 'row', marginTop: 10 },
  chatInput: { flex: 1, backgroundColor: '#FFF', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#BDC3C7' },
  chatButton: { backgroundColor: '#2ECC71', padding: 10, marginLeft: 5, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }
});
