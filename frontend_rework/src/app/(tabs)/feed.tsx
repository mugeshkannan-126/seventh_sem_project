import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, Share } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TopAppBar } from '@/components/ui';

interface FeedPost {
  id: string;
  category: string;
  title: string;
  body: string;
  imageUrl: string;
  location: string;
  status: 'In Progress' | 'Resolved' | 'Reported';
  likes: number;
  comments: number;
  hasLiked?: boolean;
}

const STITCH_FEED_POSTS: FeedPost[] = [
  {
    id: 'fp_1',
    category: 'Road Safety',
    title: 'Severe Pothole on Main St.',
    body: "This pothole is expanding rapidly due to recent rains. It's becoming a hazard for cyclists and small vehicles.",
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhkdwzqDaV4DUp2zxWgY_ARjbIoL5nIKbgGl9S6ZDWI6y1bC6GhHrXfAHEDn33UbJl6KJQSM9QX_fyClxhJ5d5DmRaHTzswjEyMKnFlaoZFjy7130BBRO-EwvD6J-PbfEWN1zp9doijTzC6hWCWhIrrh7Pl5GkcrNrhWdSQ11s9Zf8ayWbbvXaeqVjwme-w0EhzEKAN9yAHj8En1LH8jJ81EluXXNJeiOI5kRsPubeGjhSGx_kNgBg',
    location: 'Oakwood District, Block 4',
    status: 'In Progress',
    likes: 42,
    comments: 12,
  },
  {
    id: 'fp_2',
    category: 'Public Park',
    title: 'Broken Park Bench',
    body: "The bench near the fountain has a broken slat. Great job to the maintenance team for fixing this so quickly!",
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRYzSI4Dved4qqNM8MsYnVBmfcva2mFo3J33XjO-EHkT8SV2AoDbL-8wmKjdNTzlWJxocg6rmO17JS0rn0OEQp3blWzj1A49Ifcl30xtlEsi5AZZ875mmVjTK20qEJIsn7-Tw-R3FqwBHq8mlEFAr2HkzyXLGIc-p9GeZXYOfUPG89pGzAzW5jkU0tPGHun-rUwFzSw2BLbJUS0J2sOGpi6GOpkLQ6t8azwalgtiy13CPRSB0Kasxz',
    location: 'Central Plaza North',
    status: 'Resolved',
    likes: 128,
    comments: 5,
  },
  {
    id: 'fp_3',
    category: 'Lighting',
    title: 'Flickering Street Light',
    body: "Street light is flickering all night. It creates a safety concern for evening commuters.",
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFVBZBoc-VHvedKg4EY64qFf1jLX4zN5xyN71FBuWc4vVzgV5TfQLPYSVzLtO5-xtaR3ebwcdcCM8d72ssqe-BuWWO4WcK7LWp7giaRXbimV_RmMoLlQoAcDSK2xtA9ck0YhP7SOaNZ-qOXeHnbQ03_lyyPTOJBd3T8UArjDTiNs5oQdFWCMT9YbGAp_aLVof7sBpFYeHG8IAbkyEpp9U6mgiDLkfRLSWmRKj1UeTJUwaesRSzRH9H',
    location: 'Westview Ave',
    status: 'Reported',
    likes: 15,
    comments: 2,
  },
];

const FILTER_CHIPS = ['Trending', 'Nearest', 'Newest'] as const;
type FilterChip = typeof FILTER_CHIPS[number];

export default function FeedScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterChip>('Trending');
  const [posts, setPosts] = useState<FeedPost[]>(STITCH_FEED_POSTS);

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          hasLiked: !p.hasLiked,
          likes: p.hasLiked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  const handleShare = async (post: FeedPost) => {
    try {
      await Share.share({
        message: `SmartCivic Report: ${post.title}\nStatus: ${post.status}\nLocation: ${post.location}\n\n${post.body}`,
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Top App Bar */}
      <TopAppBar title="SmartCivic" showAvatar showNotification />

      <ScrollView 
        className="flex-1" 
        contentContainerClassName="pb-32 px-4" 
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome & Sorting */}
        <View className="mb-6 mt-4">
          <Text className="text-title-lg font-bold text-on-surface mb-4">Community Feed</Text>
          <View className="flex-row items-center gap-3">
            {FILTER_CHIPS.map((chip) => (
              <Pressable
                key={chip}
                onPress={() => setActiveFilter(chip)}
                className={`flex-row items-center gap-2 px-4 py-2 rounded-full border ${
                  activeFilter === chip
                    ? 'bg-primary border-primary'
                    : 'bg-surface-container-high border-outline-variant'
                }`}
              >
                {chip === 'Trending' && (
                  <MaterialIcons
                    name="trending-up"
                    size={16}
                    color={activeFilter === chip ? COLORS.onPrimary : COLORS.onSurfaceVariant}
                  />
                )}
                {chip === 'Nearest' && (
                  <MaterialIcons
                    name="near-me"
                    size={16}
                    color={activeFilter === chip ? COLORS.onPrimary : COLORS.onSurfaceVariant}
                  />
                )}
                {chip === 'Newest' && (
                  <MaterialIcons
                    name="schedule"
                    size={16}
                    color={activeFilter === chip ? COLORS.onPrimary : COLORS.onSurfaceVariant}
                  />
                )}
                <Text
                  className={`text-label-lg font-semibold ${
                    activeFilter === chip ? 'text-on-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {chip}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Feed List */}
        <View className="gap-6">
          {posts.map((post) => (
            <Pressable
              key={post.id}
              onPress={() => router.push(post.status === 'Resolved' ? '/complaint/resolved-c002' : '/complaint/c001')}
              className="bg-surface-container-lowest border border-outline-variant overflow-hidden shadow-sm active:scale-[0.99]"
              style={{ borderRadius: 24 }}
            >
              <View className="relative h-64 w-full">
                <Image
                  source={post.imageUrl}
                  className="w-full h-full"
                  contentFit="cover"
                  transition={200}
                />
                
                {/* Category Overlay Tag */}
                <View className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full">
                  <Text className="text-primary font-bold text-label-lg">{post.category}</Text>
                </View>

                {/* Status Chip Overlay */}
                <View className="absolute top-4 right-4">
                  <View 
                    className={`px-3 py-1 rounded-full flex-row items-center gap-1.5 ${
                      post.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-900'
                        : post.status === 'Resolved'
                        ? 'bg-green-100 text-green-900'
                        : 'bg-orange-100 text-orange-900'
                    }`}
                  >
                    <View 
                      className={`w-2 h-2 rounded-full ${
                        post.status === 'In Progress'
                          ? 'bg-blue-500'
                          : post.status === 'Resolved'
                          ? 'bg-green-500'
                          : 'bg-orange-500'
                      }`}
                    />
                    <Text 
                      className={`text-label-lg font-bold ${
                        post.status === 'In Progress'
                          ? 'text-blue-900'
                          : post.status === 'Resolved'
                          ? 'text-green-900'
                          : 'text-orange-900'
                      }`}
                    >
                      {post.status}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Card Body */}
              <View className="p-5">
                <View className="flex-row items-center gap-1 mb-2">
                  <MaterialIcons name="location-on" size={16} color={COLORS.onSurfaceVariant} />
                  <Text className="text-label-lg text-on-surface-variant font-medium">
                    {post.location}
                  </Text>
                </View>

                <Text className="text-title-lg font-bold text-on-surface mb-2">
                  {post.title}
                </Text>
                <Text className="text-body-md text-on-surface-variant mb-6" numberOfLines={2}>
                  {post.body}
                </Text>

                {/* Footer Actions */}
                <View className="flex-row items-center justify-between pt-4 border-t border-outline-variant/30">
                  <View className="flex-row items-center gap-6">
                    <Pressable 
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleLike(post.id);
                      }}
                      className="flex-row items-center gap-1.5"
                    >
                      <MaterialIcons 
                        name={post.hasLiked ? "favorite" : "favorite-border"} 
                        size={20} 
                        color={post.hasLiked ? COLORS.error : COLORS.onSurfaceVariant} 
                      />
                      <Text className="text-label-lg font-bold text-on-surface-variant">
                        {post.likes} Support
                      </Text>
                    </Pressable>

                    <View className="flex-row items-center gap-1.5">
                      <MaterialIcons name="chat-bubble-outline" size={20} color={COLORS.onSurfaceVariant} />
                      <Text className="text-label-lg font-bold text-on-surface-variant">
                        {post.comments} Comments
                      </Text>
                    </View>
                  </View>

                   <Pressable 
                    onPress={(e) => {
                      e.stopPropagation();
                      handleShare(post);
                    }} 
                    className="p-2 rounded-full active:bg-surface-variant"
                  >
                    <MaterialIcons name="share" size={20} color={COLORS.onSurfaceVariant} />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
