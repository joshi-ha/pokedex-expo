// app/details.tsx
import { typeColors } from "@/constants/pokemonType";
import { PokemonDetails } from "@/types/pokemon";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Custom components with NativeWind
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
    <Text className="text-base text-gray-600">{label}</Text>
    <Text className="text-base font-semibold text-gray-800">{value}</Text>
  </View>
);

const StatRow = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <View className="mb-4">
    <View className="flex-row justify-between mb-1">
      <Text className="text-sm text-gray-600 capitalize">{label}</Text>
      <Text className="text-sm font-semibold text-gray-800">{value}</Text>
    </View>
    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <View
        className="h-full rounded-full"
        style={{
          width: `${(value / 255) * 100}%`,
          backgroundColor: color,
        }}
      />
    </View>
  </View>
);

export default function Details() {
  const params = useLocalSearchParams<{
    name: string;
    id?: string;
    image?: string;
  }>();
  const [details, setDetails] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<
    "about" | "stats" | "evolution"
  >("about");

  const { width } = Dimensions.get("window");
  const imageSize = width * 0.5;

  useEffect(() => {
    fetchPokemonByName(params.name);
  }, [params.name]);

  const fetchPokemonByName = async (name: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
      );
      const data = await res.json();
      setDetails(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatColor = (statValue: number) => {
    if (statValue >= 100) return "#4CAF50";
    if (statValue >= 70) return "#8BC34A";
    if (statValue >= 50) return "#FFC107";
    if (statValue >= 30) return "#FF9800";
    return "#F44336";
  };

  const getStatLabel = (statName: string) => {
    const labels: Record<string, string> = {
      hp: "HP",
      attack: "Attack",
      defense: "Defense",
      "special-attack": "Sp. Atk",
      "special-defense": "Sp. Def",
      speed: "Speed",
    };
    return labels[statName] || statName;
  };

  const calculateTotalStats = () => {
    if (!details) return 0;
    return details.stats.reduce((total, stat) => total + stat.base_stat, 0);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text className="mt-3 text-base text-gray-600">
          Loading Pokémon details...
        </Text>
      </View>
    );
  }

  if (!details) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="sad-outline" size={64} color="#FF6B6B" />
        <Text className="text-xl text-gray-800 mt-4">Pokémon not found!</Text>
      </View>
    );
  }

  const mainType = details.types[0]?.type.name || "normal";
  const backgroundColor = typeColors[mainType] || "#A8A878";
  const totalStats = calculateTotalStats();

  return (
    <>
      <Stack.Screen
        options={{
          title: details.name.charAt(0).toUpperCase() + details.name.slice(1),
          headerBackTitle: "Back",
          headerTintColor: "#333",
        }}
      />

      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: backgroundColor + "20" }}
      >
        <StatusBar barStyle="dark-content" />

        <ScrollView
          contentContainerClassName="pb-10"
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Header Section */}
          <View
            className="px-6 pt-14 pb-8 rounded-b-3xl"
            style={{ backgroundColor }}
          >
            <Text className="text-base text-white opacity-80 font-semibold text-center">
              #{details.id.toString().padStart(3, "0")}
            </Text>
            <Text className="text-3xl text-white font-bold text-center my-2">
              {details.name.charAt(0).toUpperCase() + details.name.slice(1)}
            </Text>

            <View className="flex-row justify-center flex-wrap mt-2">
              {details.types.map((type, index) => (
                <View
                  key={index}
                  className="px-4 py-1.5 rounded-full mx-1 my-0.5"
                  style={{ backgroundColor: typeColors[type.type.name] + "CC" }}
                >
                  <Text className="text-xs font-semibold text-white">
                    {type.type.name.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Image Section */}
          <View className="items-center -mt-10 mb-6">
            <Image
              source={{
                uri:
                  params.image ||
                  details.sprites.other["official-artwork"].front_default,
              }}
              style={{ width: imageSize, height: imageSize }}
              className="shadow-lg"
              contentFit="contain"
              transition={200}
            />
          </View>

          {/* Tab Navigation */}
          <View className="mx-5 bg-white rounded-xl p-1.5 mb-6 shadow-sm">
            <View className="flex-row">
              <TouchableOpacity
                className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${
                  selectedTab === "about" ? "bg-gray-50" : ""
                }`}
                onPress={() => setSelectedTab("about")}
              >
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={selectedTab === "about" ? backgroundColor : "#666"}
                />
                <Text
                  className={`ml-2 text-sm font-semibold ${
                    selectedTab === "about" ? "" : "text-gray-600"
                  }`}
                  style={
                    selectedTab === "about" ? { color: backgroundColor } : {}
                  }
                >
                  About
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${
                  selectedTab === "stats" ? "bg-gray-50" : ""
                }`}
                onPress={() => setSelectedTab("stats")}
              >
                <Ionicons
                  name="stats-chart"
                  size={20}
                  color={selectedTab === "stats" ? backgroundColor : "#666"}
                />
                <Text
                  className={`ml-2 text-sm font-semibold ${
                    selectedTab === "stats" ? "" : "text-gray-600"
                  }`}
                  style={
                    selectedTab === "stats" ? { color: backgroundColor } : {}
                  }
                >
                  Stats
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${
                  selectedTab === "evolution" ? "bg-gray-50" : ""
                }`}
                onPress={() => setSelectedTab("evolution")}
              >
                <Ionicons
                  name="git-network"
                  size={20}
                  color={selectedTab === "evolution" ? backgroundColor : "#666"}
                />
                <Text
                  className={`ml-2 text-sm font-semibold ${
                    selectedTab === "evolution" ? "" : "text-gray-600"
                  }`}
                  style={
                    selectedTab === "evolution"
                      ? { color: backgroundColor }
                      : {}
                  }
                >
                  Evolution
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content based on selected tab */}
          <View className="mx-5 bg-white rounded-2xl p-6 shadow-sm">
            {selectedTab === "about" && (
              <>
                <InfoRow label="Height" value={`${details.height / 10} m`} />
                <InfoRow label="Weight" value={`${details.weight / 10} kg`} />

                <View className="mt-6">
                  <Text className="text-lg font-bold text-gray-800 mb-3">
                    Abilities
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {details.abilities.map((ability, index) => (
                      <View
                        key={index}
                        className="bg-gray-100 px-3 py-1.5 rounded-lg"
                      >
                        <Text className="text-sm text-gray-800 capitalize">
                          {ability.ability.name.replace("-", " ")}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}

            {selectedTab === "stats" && (
              <View>
                <View className="flex-row justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <Text className="text-lg font-semibold text-gray-800">
                    Total Base Stats
                  </Text>
                  <View className="bg-green-500 px-4 py-2 rounded-lg">
                    <Text className="text-base font-bold text-white">
                      {totalStats}
                    </Text>
                  </View>
                </View>

                {details.stats.map((stat, index) => (
                  <StatRow
                    key={index}
                    label={getStatLabel(stat.stat.name)}
                    value={stat.base_stat}
                    color={getStatColor(stat.base_stat)}
                  />
                ))}
              </View>
            )}

            {selectedTab === "evolution" && (
              <View className="py-10 items-center">
                <Ionicons name="hourglass-outline" size={48} color="#666" />
                <Text className="text-lg font-semibold text-gray-800 mt-4">
                  Evolution chain coming soon!
                </Text>
                <Text className="text-sm text-gray-600 text-center mt-2 leading-5">
                  This feature will be implemented in the next update
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
