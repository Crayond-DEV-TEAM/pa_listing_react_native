import React from 'react';

import {
    StatusBar,
    StyleSheet,
    Text,
    Dimensions,
    View,
    Platform,
} from 'react-native';

import { WebView } from 'react-native-webview';

import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// import Geocoding from 'react-native-geocoder-reborn';

const INJECTED_JAVASCRIPT = `(function() {
    const currentLocation = window.localStorage.getItem('current_location');

    const obj = {
        currentLocation,
    }
    const getItemLocalStorage = JSON.stringify(obj);

    window.ReactNativeWebView.postMessage(getItemLocalStorage);
})();`;

export const getGeoLocationJS = () => {
    const getCurrentPosition = `
      navigator.geolocation.getCurrentPosition = (success, error, options) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'getCurrentPosition', options: options }));
  
        window.addEventListener('message', (e) => {
          let eventData = {}
          try {
            eventData = JSON.parse(e.data);
          } catch (e) {}
  
          if (eventData.event === 'currentPosition') {
            success(eventData.data);
          } else if (eventData.event === 'currentPositionError') {
            error(eventData.data);
          }
        });
      };
      true;
    `;

    const watchPosition = `
      navigator.geolocation.watchPosition = (success, error, options) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'watchPosition', options: options }));
  
        window.addEventListener('message', (e) => {
          let eventData = {}
          try {
            eventData = JSON.parse(e.data);
          } catch (e) {}
  
          if (eventData.event === 'watchPosition') {
            success(eventData.data);
          } else if (eventData.event === 'watchPositionError') {
            error(eventData.data);
          }
        });
      };
      true;
    `;

    const clearWatch = `
      navigator.geolocation.clearWatch = (watchID) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'clearWatch', watchID: watchID }));
      };
      true;
    `;

    return `
      (function() {
        ${getCurrentPosition}
        ${watchPosition}
        ${clearWatch}
      })();
    `;
};
const isIOS = Platform.OS === 'ios';
const { height } = Dimensions.get('window');
let webview = null;
const WebScreen = (props) => {
    const [status, setStatus] = React.useState(null);

    // let latitude = "";
    // let longitude = "";
    // let address = "";
    // let city = "";
    // let code = "";
    // let country_name = "";

    const [visible, setVisible] = React.useState(true);
    const [latitude, setLatitude] = React.useState("");
    const [longitude, setLongitude] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [city, setCity] = React.useState("");
    const [code, setCode] = React.useState("");
    const [country_name, setCountry_name] = React.useState("");

    const { diviceToken } = props;

    const onMessage = (payload) => {
        console.log('payload getItemLocalStorage', payload);
    };


    React.useEffect(() => {
        // async function requestLocationPermission() {
        //     let getStatus = "";
        //     if (Platform.OS === 'ios') {
        //         getStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE); // For iOS
        //     }
        //     else {
        //         getStatus = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION); // For Android
        //     }
        //     setStatus(getStatus)
        // }
        // requestLocationPermission();


    }, []);

    React.useEffect(() => {
        // getCurrentPosition = () => {
        //     // Get the current location
        //     Geolocation.getCurrentPosition(
        //         async (position) => {
        //             const { latitude, longitude } = position.coords;
        //             await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + latitude + ',' + longitude + '&key=' + "AIzaSyD2c4H1Ldomf95Y_dBG64KbNvE9tzmLDbk")
        //                 .then((response) => response.json())
        //                 .then((responseJson) => {
        //                     // latitude = latitude;
        //                     // longitude = longitude;
        //                     // address = responseJson.results[0].formatted_address;
        //                     // city = responseJson.results[0].address_components[5].long_name;
        //                     // code = responseJson.results[0].address_components[6].short_name;
        //                     // country_name = responseJson.results[0].address_components[6].long_name;

        //                     // console.log('ADDRESS GEOCODE is BACK!! => ' + JSON.stringify(responseJson));
        //                     setLatitude(latitude);
        //                     setLongitude(longitude);
        //                     setCountry_name(responseJson.results[0].address_components[6].long_name);
        //                     setCode(responseJson.results[0].address_components[6].short_name);
        //                     setCity(responseJson.results[0].address_components[5].long_name);
        //                     setAddress(responseJson.results[0].formatted_address);
        //                 })
        //         },
        //         (error) => {
        //             console.error('Error getting location:', error);
        //         },
        //         { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
        //     );
        //     // Location permission has been granted by the user.
        // };
        // if (status === RESULTS.GRANTED) {
        //     getCurrentPosition();
        // }
    }, [status]);

    const WebviewRender = () => {
        return <WebView
            injectedJavaScript={getGeoLocationJS()}
            onMessage={event => {
                let data = {}
                try {
                    data = JSON.parse(event.nativeEvent.data);
                } catch (e) {
                    console.log(e);
                }

                if (data?.event && data.event === 'getCurrentPosition') {
                    Geolocation.getCurrentPosition((position) => {
                        webview.postMessage(JSON.stringify({ event: 'currentPosition', data: position }));
                    }, (error) => {
                        webview.postMessage(JSON.stringify({ event: 'currentPositionError', data: error }));
                    }, data.options);
                } else if (data?.event && data.event === 'watchPosition') {
                    Geolocation.watchPosition((position) => {
                        webview.postMessage(JSON.stringify({ event: 'watchPosition', data: position }));
                    }, (error) => {
                        webview.postMessage(JSON.stringify({ event: 'watchPositionError', data: error }));
                    }, data.options);
                } else if (data?.event && data.event === 'clearWatch') {
                    Geolocation.clearWatch(data.watchID);
                }
            }}
            ref={ref => {
                webview = ref;
                // if (onRef) {
                //   onRef(webview)
                // }
            }}
            overScrollMode='never'
            pullToRefreshEnabled={true}

            cacheEnabled={true}
            // cacheMode={'LOAD_NO_CACHE'}
            source={{ uri: `https://listingsgoto.com` }} style={{ marginTop: isIOS ? 0 : 10 }}

            geolocationEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}

            cacheMode={'LOAD_DEFAULT'}
            sharedCookiesEnabled={true}
            setBuiltInZoomControls={false}

            useWebKit
            originWhitelist={['*']}
            incognito={false}

            mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"

            geolocationPermissionRequest={(request) => {
                if (true) {
                    // You have geolocation permission
                    request.grant();
                } else {
                    // You don't have geolocation permission
                    request.deny();
                }
            }}
        />
    }
    // 
    return (
        <View style={{ flex: 1, backgroundColor: "#091b29" }}>
            <SafeAreaProvider style={{ flex: 1 }}>
                <StatusBar translucent backgroundColor={"#091b29"} barStyle="light-content" />
                <SafeAreaView style={{ flex: 1, paddingBottom: isIOS && height < 812 ? -1 : -40 }}>
                    <WebviewRender />
                </SafeAreaView>
            </SafeAreaProvider>
        </View>
    );
}

export default WebScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: -StatusBar.currentHeight + 10,
        justifyContent: 'center',
        backgroundColor: 'white',
    },
});