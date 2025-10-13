import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { View } from 'react-native';
import BodyText from '../components/BodyText';
import Heading from '../components/Heading';
import Subheading from '../components/Subheading';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../theme';


SplashScreen.preventAutoHideAsync();

export default function testing_themesheet() {
  const [fontsLoaded] = useFonts({
    Fraunces_700Bold,
    ChivoMono_500Medium,
    NotoSansMono_400Regular,
  });

  React.useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={globalStyles.container}>
      <Heading style={{ color: colors.midBlue}}>Example of Heading</Heading>
      <Subheading style={{ color: colors.sage }}>Example of Subheading</Subheading>
      <Subheading>If you don't specify style, this is the default subheading color!</Subheading>

      <BodyText>
        This body text automatically uses your Noto Sans Mono font and color scheme.
        Isn't it great? I love body text.
      </BodyText>
    </View>
  );
}