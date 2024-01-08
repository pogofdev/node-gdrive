// /**
//  * Copyright (c) React Native Community
//  *
//  * This source code is licensed under the MIT license found in the
//  * LICENSE file in the root directory of this source tree.
//  *
//  * @format
//  */

// 'use strict';

// import React, { useState, useEffect } from 'react';
// import { StyleSheet, Text, View, Alert, Button } from 'react-native';
// import Geolocation from '@react-native-community/geolocation';

// export default function WatchPositionExample() {
//   const watchPosition = () => {
//     try {
//       const watchID = Geolocation.watchPosition(
//         (position) => {
//           console.log('watchPosition', JSON.stringify(position));
//           setPosition(JSON.stringify(position));
//         },
//         (error) => Alert.alert('WatchPosition Error', JSON.stringify(error)),
//         {    interval: 1000,
//           fastestInterval: 1000,
//           timeout: 1000,
//           maximumAge: 1000,
//           enableHighAccuracy:true,
//           distanceFilter:1,
//           useSignificantChanges:true
//         }
//       );
//       setSubscriptionId(watchID);
//     } catch (error) {
//       Alert.alert('WatchPosition Error', JSON.stringify(error));
//     }
//   };

//   const clearWatch = () => {
//     subscriptionId !== null && Geolocation.clearWatch(subscriptionId);
//     setSubscriptionId(null);
//     setPosition(null);
//   };

//   const [position, setPosition] = useState<string | null>(null);
//   const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
//   useEffect(() => {
//     return () => {
//       clearWatch();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <View>
//       <Text>
//         <Text style={styles.title}>Last position: </Text>
//         {position || 'unknown'}
//       </Text>
//       {subscriptionId !== null ? (
//         <Button title="Clear Watch" onPress={clearWatch} />
//       ) : (
//         <Button title="Watch Position" onPress={watchPosition} />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   title: {
//     fontWeight: '500',
//   },
// });

/**
 * Copyright (c) React Native Community
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Alert, Button, AppState } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import Geolocation, { GeoPosition } from 'react-native-geolocation-service';
// import Geolocation from '@react-native-community/geolocation';

export default function BackgroundLocationUpdates() {
  const appState = useRef(AppState.currentState);
  const [backgroundListener, setBackgroundListener] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
  const [position, setPosition] = useState<string | null>(null);

  const [forceLocation, setForceLocation] = useState(true);
  const [highAccuracy, setHighAccuracy] = useState(true);
  const [locationDialog, setLocationDialog] = useState(true);
  const [significantChanges, setSignificantChanges] = useState(false);
  const [observing, setObserving] = useState(false);
  const [foregroundService, setForegroundService] = useState(false);
  const [useLocationManager, setUseLocationManager] = useState(false);
  const [location, setLocation] = useState<GeoPosition | null>(null);

    const watchPosition = () => {
    try {
      const watchID =   Geolocation.watchPosition(
       async (position) => {
          setLocation(position);
          const response = await fetch('http://localhost:3000/users/123', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(position),
          });
      
          const responseData = await response.json();
          console.log('Response:', responseData);
      
          // Xử lý kết quả nhận được từ server
       
          // console.log(position);
        },
        error => {
          setLocation(null);
          console.log(error);
        },
        {
          accuracy: {
            android: 'high',
            ios: 'best',
          },
          enableHighAccuracy: highAccuracy,
          distanceFilter: 50,
          interval: 10000,
          fastestInterval: 5000,
          forceRequestLocation: forceLocation,
          forceLocationManager: useLocationManager,
          showLocationDialog: locationDialog,
          useSignificantChanges: significantChanges,
        },
      );
      setSubscriptionId(watchID);
    } catch (error) {
      Alert.alert('WatchPosition Error', JSON.stringify(error));
    }
  };

  const clearWatch = () => {
    subscriptionId !== null && Geolocation.clearWatch(subscriptionId);
    setSubscriptionId(null);
    setPosition(null);
  };

  useEffect(() => {
    if (!backgroundListener) {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        BackgroundTimer.runBackgroundTimer(() => {
          Geolocation.getCurrentPosition(
            (position) => {
              console.log(
                'getCurrentPosition background',
                JSON.stringify(position)
              );
            },
            (error) =>
              console.log(
                'getCurrentPosition background error',
                JSON.stringify(error)
              ),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
          );
          console.log('timer run')
        }, 10000);

        console.log('App has entered background mode!');
      } else {
        BackgroundTimer.stopBackgroundTimer();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [backgroundListener]);

  return (
    <View>
      {/* <Button
        title={`${
          backgroundListener ? 'Disable' : 'Enable'
        } background location updates`}
        onPress={() => setBackgroundListener(!backgroundListener)}
      /> */}
       <Text>
        <Text style={styles.title}>Last position: </Text>
        {position || 'unknown'}
      </Text>
      {subscriptionId !== null ? (
        <Button title="Clear Watch" onPress={clearWatch} />
      ) : (
        <Button title="Watch Position" onPress={watchPosition} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: '500',
  },
});