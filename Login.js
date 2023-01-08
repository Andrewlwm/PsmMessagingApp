import React from 'react';
import {View} from 'react-native';
import {StyleSheet} from 'react-native';
import {useState} from 'react';
import auth from '@react-native-firebase/auth';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import {GOOGLE_AUTH_TOKEN} from './constants';

GoogleSignin.configure({
  webClientId: GOOGLE_AUTH_TOKEN,
});

export default function Login({navigation}) {
  const [isLoading, setLoading] = useState(false);
  const onGoogleButtonPress = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      const {idToken} = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
    } catch (e) {
      console.error(e.message, {e});
    }
    setLoading(false);
    return;
  };

  return (
    <View style={styles.container}>
      <GoogleSigninButton
        color={GoogleSigninButton.Color.Dark}
        size={GoogleSigninButton.Size.Wide}
        onPress={onGoogleButtonPress}
        disabled={isLoading}
      />
    </View>
  );
}
