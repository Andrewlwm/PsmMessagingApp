/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useEffect, useState} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  TextInput,
  StyleSheet,
  Button,
} from 'react-native';
import {AuthenticatedUserContext} from './Contexts';
import Clipboard from '@react-native-community/clipboard';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const styles = StyleSheet.create({
  text: {textAlign: 'center', fontSize: 18},
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  uid: {fontSize: 20, fontWeight: '600'},
  input: {
    fontSize: 20,
    width: '80%',
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export const Details = () => {
  const {user} = useContext(AuthenticatedUserContext);
  const [text, onChangeText] = React.useState('');
  const navigation = useNavigation();

  async function createChatGroup() {
    const newDoc = await firestore()
      .collection('chat-group')
      .add({members: [user.uid, text]});
    navigation.navigate('Chat', {groupId: newDoc.id});
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Pass this id to other users to begin a converstation
      </Text>
      <TouchableOpacity onPress={() => Clipboard.setString(user.uid)}>
        <Text style={styles.uid} selectable={true}>
          {user.uid}
        </Text>
      </TouchableOpacity>
      <Text
        style={{
          ...styles.text,
          marginTop: 20,
          fontWeight: '600',
          color: 'black',
        }}>
        Input partner id
      </Text>
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={text}
      />
      <Button title="Start conversation" onPress={createChatGroup} />
    </View>
  );
};

export default function Converstations() {
  const navigation = useNavigation();
  const [chatGroups, setChatGroups] = useState([]);

  const onSignOut = async () => {
    try {
      await auth().signOut();
    } catch {}
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{
            marginRight: 10,
          }}
          onPress={onSignOut}>
          <Text style={{fontSize: 16, fontWeight: '500', color: 'red'}}>
            Sign out
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('chat-group')
      .onSnapshot(querySnapshot => {
        setChatGroups(
          querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})),
        );
      });
    return unsubscribe;
  }, []);

  function goToChat(groupId) {
    navigation.navigate('Chat', {groupId});
  }

  return (
    <View style={{flex: 1}}>
      {chatGroups.map(g => (
        <TouchableOpacity
          style={{borderBottomWidth: 1, borderColor: 'gray', height: 60}}
          onPress={() => goToChat(g.id)}
          key={g.id}>
          <Text
            style={{
              fontSize: 16,
              color: 'black',
              fontWeight: '500',
              paddingLeft: 10,
            }}>
            {g.members[1]}
          </Text>
          {g.lastMessage ? (
            <>
              <Text style={{fontSize: 14, color: 'gray', paddingLeft: 10}}>
                {g.lastMessage.text}
              </Text>
              <Text style={{fontSize: 14, color: 'gray', paddingLeft: 10}}>
                at {g.lastMessage.createdAt.toDate().toLocaleString('en-GB')}
              </Text>
            </>
          ) : (
            <></>
          )}
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={{
          alignSelf: 'flex-end',
          marginTop: 'auto',
          marginBottom: 10,
          marginRight: 10,
        }}>
        <Button
          title="Start new conversation"
          onPress={() => navigation.navigate('Details')}
        />
      </TouchableOpacity>
    </View>
  );
}
