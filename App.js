import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Button,
} from 'react-native';
import axios from 'axios';

const WAIFU_API_URL = 'https://api.waifu.pics/sfw/waifu';

// Welcome Screen Component
const WelcomeScreen = ({ onExplore }) => {
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    const fetchBackgroundImages = async () => {
      try {
        const responses = await Promise.all(
          Array(10).fill().map(() => axios.get(WAIFU_API_URL))
        );
        const urls = responses.map((response) => response.data.url);
        setBackgroundImage(urls[0]);

        let currentIndex = 0;
        const interval = setInterval(() => {
          currentIndex = (currentIndex + 1) % urls.length;
          setBackgroundImage(urls[currentIndex]);
        }, 8000); // Change image every 2 seconds

        return () => clearInterval(interval); // Cleanup on unmount
      } catch (error) {
        console.error('Error fetching background images:', error);
      }
    };

    fetchBackgroundImages();
  }, []);

  return (
    <View style={styles.welcomeContainer}>
      {backgroundImage && (
        <Image source={{ uri: backgroundImage }} style={styles.backgroundImage} />
      )}
      <View style={styles.messageContainer}>
        <Text style={styles.welcomeMessage}>Welcome to the Fun World!</Text>
        <Text style={styles.inviteMessage}>Tap below to explore amazing content!</Text>
      </View>
      <View style={styles.exploreButtonContainer}>
        <TouchableOpacity style={styles.exploreButton} onPress={onExplore}>
          <Text style={styles.exploreButtonText}>Explore</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Header Component
const Header = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>It's Fun Time!</Text>
    <TouchableOpacity style={styles.avatarPlaceholder}>
      <Text style={styles.avatarText}>A</Text>
    </TouchableOpacity>
  </View>
);

// Watch List Component
const WatchList = ({ data, onImageSelect }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Watch List</Text>
    <FlatList
      horizontal
      data={data}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onImageSelect(item)} style={styles.card}>
          <Image source={{ uri: item }} style={styles.cardImage} />
          <Text style={styles.cardLabel}>Anime Title</Text>
        </TouchableOpacity>
      )}
      showsHorizontalScrollIndicator={false}
    />
  </View>
);

// Infinite Gallery Component
const InfiniteGallery = ({ data, onImageSelect, fetchMoreImages }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Infinite Gallery</Text>
    <FlatList
      data={data}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onImageSelect(item)} style={styles.card}>
          <Image source={{ uri: item }} style={styles.cardImage} />
        </TouchableOpacity>
      )}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      onEndReached={fetchMoreImages}
      onEndReachedThreshold={0.5} // Trigger fetch when 50% of the list is visible
    />
  </View>
);

// Countdown/Event Card
const EventCard = () => (
  <View style={styles.eventCard}>
    <Text style={styles.eventTitle}>Tick Tock...</Text>
    <Text style={styles.eventCountdown}>07 : 23 : 48</Text>
  </View>
);

// Image Detail Modal
const ImageDetailModal = ({ visible, onClose, imageUrl, onDownload, onFavorite }) => (
  <Modal transparent={true} visible={visible}>
    <View style={styles.modalContainer}>
      <Image source={{ uri: imageUrl }} style={styles.modalImage} />
      <View style={styles.modalButtons}>
        <Button title="Download" onPress={onDownload} color="#841584" />
        <Button title="Add to Favorites" onPress={onFavorite} color="#841584" />
        <Button title="Close" onPress={onClose} color="#841584" />
      </View>
    </View>
  </Modal>
);

// Main App
const App = () => {
  const [watchListData, setWatchListData] = useState([]);
  const [galleryData, setGalleryData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [inApp, setInApp] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (inApp) {
      fetchImages();
      fetchGalleryImages();
    }
  }, [inApp]);

  const fetchImages = async () => {
    try {
      const responses = await Promise.all(
        Array(10).fill().map(() => axios.get(WAIFU_API_URL)) // Fetching 10 images for the watch list
      );
      const urls = responses.map((response) => response.data.url);
      setWatchListData(urls);
    } catch (error) {
      console.error('Error fetching watch list images:', error);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const responses = await Promise.all(
        Array(5).fill().map(() => axios.get(WAIFU_API_URL))
      );
      const urls = responses.map((response) => response.data.url);
      setGalleryData((prevData) => [...prevData, ...urls]); // Append new images
      setPage((prevPage) => prevPage + 1); // Increment the page for future fetches
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    }
  };

  const handleImageSelect = (url) => {
    setSelectedImage(url);
    setIsModalVisible(true);
  };

  const handleDownload = () => {
    // Implement download logic here
    console.log(`Downloading image from ${selectedImage}`);
    // Use libraries like react-native-fs or react-native-fetch-blob for actual download
  };

  const handleAddToFavorites = () => {
    setFavorites([...favorites, selectedImage]);
    console.log(`${selectedImage} added to favorites.`);
    setIsModalVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {!inApp ? (
        <WelcomeScreen onExplore={() => setInApp(true)} />
      ) : (
        <ScrollView style={styles.container}>
          <Header />
          <WatchList data={watchListData} onImageSelect={handleImageSelect} />
          <EventCard />
          <InfiniteGallery
            data={galleryData}
            onImageSelect={handleImageSelect}
            fetchMoreImages={fetchGalleryImages} // Fetch more images on scroll
          />
          <ImageDetailModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            imageUrl={selectedImage}
            onDownload={handleDownload}
            onFavorite={handleAddToFavorites}
          />
        </ScrollView>
      )}
    </View>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    width: 160, // Size for watch list images
    marginRight: 10, // Adjust margin as necessary
    marginBottom: 10, // Space between rows
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  cardLabel: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  eventCard: {
    padding: 20,
    backgroundColor: '#f7c1c1',
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventCountdown: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalImage: {
    width: 300,
    height: 300,
    borderRadius: 15,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '30%',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  messageContainer: {
    alignItems: 'center',
    padding: 20,
    position: 'absolute',
    top: '40%', // Position the message higher
  },
  welcomeMessage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  inviteMessage: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  exploreButtonContainer: {
    justifyContent: 'flex-end',
    flex: 1,
    paddingBottom: 30, // Adjust padding to add space at the bottom
  },
  exploreButton: {
    padding: 15,
    backgroundColor: '#841584',
    borderRadius: 10,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',

  },
});

export default App;


