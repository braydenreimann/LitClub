import { Image } from 'expo-image';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import Header from '@/components/headerWithSearch';
import ReadingList from '@/components/ReadingList';
import { ScrollView } from 'react-native';

const GENRES = [
    'Fantasy', 'Romance', 'Fiction', 'Science-Fiction', 'Drama', 'Mystery', 'Non-Fiction', 'Thriller', 'Horror', 'Historical', 'Poetry', 'Biography', 'Memoir', 'Young Adult', 'True Crime', 'Science', 'Western Fiction', 'Philopshical', 'Action Fiction'
]