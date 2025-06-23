import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import Emoji from "react-native-emoji";

interface EmojiPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onEmojiSelect: (emojiName: string) => void;
}

// Define the type for emoji categories
type EmojiCategoryType = {
  [key: string]: string[];
};

// Complete emoji categories with proper typing
const EMOJI_CATEGORIES: EmojiCategoryType = {
  'Smileys & People': [
    'grinning', 'grimacing', 'grin', 'joy', 'smiley', 'smile', 'sweat_smile',
    'laughing', 'innocent', 'wink', 'blush', 'slightly_smiling_face', 'upside_down_face',
    'relaxed', 'yum', 'relieved', 'heart_eyes', 'sunglasses', 'smirk', 'neutral_face',
    'expressionless', 'unamused', 'face_with_rolling_eyes', 'thinking', 'flushed',
    'disappointed', 'worried', 'angry', 'rage', 'pensive', 'confused', 'slightly_frowning_face',
    'frowning_face', 'persevere', 'confounded', 'tired_face', 'weary', 'triumph',
    'open_mouth', 'scream', 'fearful', 'cold_sweat', 'hushed', 'frowning', 'anguished',
    'cry', 'disappointed_relieved', 'sleepy', 'sweat', 'sob', 'dizzy_face', 'astonished',
    'zipper_mouth_face', 'mask', 'thermometer_face', 'head_bandage', 'sleeping',
    'zzz', 'hankey', 'smiling_imp', 'imp', 'japanese_ogre', 'japanese_goblin', 'skull',
    'ghost', 'alien', 'robot_face', 'smiley_cat', 'smile_cat', 'joy_cat', 'heart_eyes_cat',
    'smirk_cat', 'kissing_cat', 'scream_cat', 'crying_cat_face', 'pouting_cat'
  ],
  'Finance & Business': [
    'chart_with_upwards_trend', 'chart_with_downwards_trend', 'bar_chart', 'chart',
    'money_with_wings', 'moneybag', 'dollar', 'yen', 'euro', 'pound', 'credit_card',
    'bank', 'atm', 'gem', 'scales', 'briefcase', 'office', 'factory', 'construction',
    'building_construction', 'house_with_garden', 'house', 'office_building'
  ],
  'Objects & Symbols': [
    'fire', 'rocket', 'bomb', 'warning', 'exclamation', 'question', 'grey_exclamation',
    'grey_question', 'bangbang', 'interrobang', 'low_brightness', 'high_brightness',
    'trident', 'fleur_de_lis', 'part_alternation_mark', 'warning_sign', 'children_crossing',
    'no_entry', 'no_entry_sign', 'no_bicycles', 'no_smoking', 'do_not_litter',
    'non_potable_water', 'no_pedestrians', 'no_mobile_phones', 'underage'
  ],
  'Nature': [
    'sunny', 'partly_sunny', 'cloud', 'partly_sunny_rain', 'cloud_with_rain',
    'thunder_cloud_and_rain', 'cloud_with_lightning', 'zap', 'fire', 'snowflake',
    'star', 'star2', 'dizzy', 'sparkles', 'comet', 'sunny', 'sun_with_face',
    'full_moon_with_face', 'first_quarter_moon_with_face', 'last_quarter_moon_with_face',
    'new_moon_with_face', 'full_moon', 'waning_gibbous_moon', 'last_quarter_moon',
    'waning_crescent_moon', 'new_moon', 'waxing_crescent_moon', 'first_quarter_moon',
    'waxing_gibbous_moon', 'crescent_moon', 'earth_americas', 'earth_africa', 'earth_asia'
  ]
};

const EmojiPicker: React.FC<EmojiPickerProps> = ({ isVisible, onClose, onEmojiSelect }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Finance & Business');

  // Now this will work without TypeScript errors
  const filteredEmojis = EMOJI_CATEGORIES[selectedCategory]?.filter(emoji =>
    emoji.toLowerCase().includes(searchText.toLowerCase())
  ) || [];

  const handleEmojiPress = (emojiName: string) => {
    onEmojiSelect(emojiName);
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Emoji</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search emojis..."
          value={searchText}
          onChangeText={setSearchText}
        />

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryTabs}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-around' }}
        >
          {Object.keys(EMOJI_CATEGORIES).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                selectedCategory === category && styles.selectedCategoryTab
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={styles.emojiGrid} showsVerticalScrollIndicator={false}>
          <View style={styles.emojiContainer}>
            {filteredEmojis.map((emojiName, index) => (
              <TouchableOpacity
                key={index}
                style={styles.emojiButton}
                onPress={() => handleEmojiPress(emojiName)}
              >
                <Emoji name={emojiName} style={styles.emoji} />
                <Text style={styles.emojiName}>{emojiName.replace(/_/g, ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: Dimensions.get('window').height * 0.7,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 18,
    color: '#666',
  },
  searchInput: {
    margin: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
  },
  categoryTabs: {
    paddingHorizontal: 15,
    marginBottom: 10,
    flexGrow: 0,
    flexShrink: 0,
  },
  categoryTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    minWidth: 80,
    maxWidth: 120,
    flex: 0,
  },
  selectedCategoryTab: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    flexShrink: 1,
  },
  selectedCategoryText: {
    color: 'white',
  },
  emojiGrid: {
    flex: 1,
    paddingHorizontal: 15,
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiButton: {
    width: '30%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  emoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  emojiName: {
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
  },
});

export default EmojiPicker;