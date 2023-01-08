/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useCallback, useContext} from 'react';
import {GiftedChat} from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import {AuthenticatedUserContext} from './Contexts';

export default function Chat({route}) {
  const [messages, setMessages] = useState([]);
  const {groupId} = route.params;
  const {user: authUser} = useContext(AuthenticatedUserContext);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('chat-group')
      .doc(groupId)
      .onSnapshot(querySnapshot => {
        setMessages(
          (querySnapshot?.data().messages ?? [])
            .map(doc => ({
              ...doc,
              createdAt: doc.createdAt.toDate(),
            }))
            .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)),
        );
      });
    return unsubscribe;
  }, []);

  const onSend = useCallback(async (chatMessages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, chatMessages),
    );
    const {_id, createdAt, text, user} = chatMessages[0];
    const lastMessage = {
      _id,
      createdAt,
      text,
      user,
    };
    try {
      await firestore()
        .collection('chat-group')
        .doc(groupId)
        .set(
          {
            messages: firestore.FieldValue.arrayUnion(lastMessage),
            lastMessage,
          },
          {merge: true},
        );
    } catch (e) {
      console.log(e);
    }
  }, []);

  return (
    <GiftedChat
      messages={messages}
      showAvatarForEveryMessage={false}
      showUserAvatar={false}
      onSend={chatMessages => onSend(chatMessages)}
      messagesContainerStyle={{
        backgroundColor: '#fff',
      }}
      textInputStyle={{
        backgroundColor: '#fff',
        borderRadius: 20,
      }}
      user={{_id: authUser.uid}}
    />
  );
}
