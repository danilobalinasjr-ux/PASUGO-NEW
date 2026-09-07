// src/app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false, // Hides the default bulky Expo header so our minimalist layout shines
          animation: 'slide_from_right',
        }}
      >
        {/* Our custom registered app routes */}
        <Stack.Screen name="index" />
        <Stack.Screen name="post-errand" />
        <Stack.Screen name="tracking" />
        <Stack.Screen name="rider/dashboard" />
      </Stack>
    </>
  );
}
