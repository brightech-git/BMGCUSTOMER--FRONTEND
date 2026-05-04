import React from "react";
import { View, Button, StyleSheet } from "react-native";

export default function AdminHome({ navigation }) {

  return (
    <View style={styles.container}>

      <Button
        title="Customer List"
        onPress={() => navigation.navigate("CustomerList")}
      />

            <Button
        title="create User"
        onPress={() => navigation.navigate("CreateUser")}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1,justifyContent:"center",gap:20,padding:20 }
});