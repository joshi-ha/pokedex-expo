// app/index.tsx
import { typeColors, typeTextColors } from "@/constants/pokemonType";
import { Pokemon } from "@/types/pokemon";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { Link } from "expo-router";
import { cssInterop } from "nativewind";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

cssInterop(ExpoImage, { className: "style" });

// Improved debounce function with type safety
const useDebounce = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const timeoutRef = useRef<number>(0);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPokemons, setTotalPokemons] = useState(0);
  const limit = 20;
  const flatListRef = useRef<FlatList>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch pokemon
  useEffect(() => {
    fetchPokemons();

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchPokemons = async (
    pageNum: number = 1,
    append: boolean = false
  ) => {
    try {
      if (!append) setLoading(true);
      const offset = (pageNum - 1) * limit;

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
        { signal: abortControllerRef.current.signal }
      );
      const data = await res.json();
      if (!append) setTotalPokemons(data.count);

      // Fetch Pokemon details
      const fetchedPokemons = await Promise.all(
        data.results.map(async (pokemon: any) => {
          const res = await fetch(pokemon.url);
          const details = await res.json();
          return {
            name: pokemon.name,
            image:
              details.sprites.other["official-artwork"].front_default ||
              details.sprites.front_default,
            imageBack: details.sprites.back_default,
            types: details.types,
            id: details.id,
          };
        })
      );

      if (!append) {
        setPokemons(fetchedPokemons);
        setFilteredPokemons(fetchedPokemons);
      } else {
        setPokemons((prev) => [...prev, ...fetchedPokemons]);
        setFilteredPokemons((prev) => [...prev, ...fetchedPokemons]);
      }
    } catch (e: any) {
      if (e.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.error(e);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSearchLoading(false);
    }
  };

  const fetchPokemonByIdOrName = async (query: string) => {
    if (!query || query.trim() === "") return;

    try {
      setSearchLoading(true);

      // Cancel previous search request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`,
        { signal: abortControllerRef.current.signal }
      );

      if (!res.ok) {
        // If not found, fall back to local filtering
        filterLocalPokemons(query);
        return;
      }

      const details = await res.json();
      const pokemon: Pokemon = {
        name: details.name,
        image:
          details.sprites.other["official-artwork"].front_default ||
          details.sprites.front_default,
        imageBack: details.sprites.back_default,
        types: details.types,
        id: details.id,
      };

      setFilteredPokemons([pokemon]);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (e: any) {
      if (e.name === "AbortError") {
        console.log("Search aborted");
      } else {
        console.error(e);
        filterLocalPokemons(query);
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const filterLocalPokemons = (query: string) => {
    if (!query || query.trim() === "") {
      setFilteredPokemons(pokemons);
      return;
    }

    const filtered = pokemons.filter(
      (pokemon) =>
        pokemon.name.toLowerCase().includes(query.toLowerCase()) ||
        pokemon.id.toString().includes(query)
    );
    setFilteredPokemons(filtered);
  };

  // Use the improved debounce hook
  const debouncedSearch = useDebounce((query: string) => {
    if (!query || query.trim() === "") {
      setFilteredPokemons(pokemons);
      return;
    }

    // If query is a number or less than 3 characters, search API directly
    if (!isNaN(Number(query)) || query.length <= 2) {
      fetchPokemonByIdOrName(query);
    } else {
      // For longer names, search locally first, then API if not found
      const localResults = pokemons.filter(
        (pokemon) =>
          pokemon.name.toLowerCase().includes(query.toLowerCase()) ||
          pokemon.id.toString().includes(query)
      );

      if (localResults.length > 0) {
        setFilteredPokemons(localResults);
      } else {
        fetchPokemonByIdOrName(query);
      }
    }
  }, 300);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setSearchQuery("");
    fetchPokemons(1, false);
  };

  const loadMore = () => {
    if (pokemons.length < totalPokemons && !loading && !searchQuery) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPokemons(nextPage, true);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredPokemons(pokemons);
  };

  const renderPokemonCard = ({ item }: { item: Pokemon }) => {
    const mainType = item.types[0]?.type.name || "normal";
    const backgroundColor = typeColors[mainType] || "#A8A878";
    const textColor = typeTextColors[mainType] || "#000000";

    return (
      <Link
        key={`${item.name}-${item.id}`}
        href={{
          pathname: "/details",
          params: {
            name: item.name,
            id: item.id,
            image: item.image,
          },
        }}
        asChild
      >
        <TouchableOpacity
          className="rounded-2xl p-3 shadow-lg mb-3"
          style={{
            backgroundColor,
            width: (Dimensions.get("window").width - 48) / 2,
          }}
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text
              className="text-xs font-semibold opacity-80"
              style={{ color: textColor }}
            >
              #{item.id.toString().padStart(3, "0")}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={textColor} />
          </View>

          <View className="items-center">
            <ExpoImage
              source={{ uri: item.image }}
              className="w-28 h-28 mb-3"
              transition={200}
              contentFit="contain"
            />

            <View className="items-center">
              <Text
                className="text-base font-bold mb-2 text-center"
                style={{ color: textColor }}
              >
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </Text>

              <View className="flex-row justify-center flex-wrap gap-1">
                {item.types.map((typeObj, index) => {
                  const typeName = typeObj.type.name;
                  return (
                    <View
                      key={index}
                      className="px-2 py-1 rounded-xl"
                      style={{
                        backgroundColor: typeColors[typeName] || "#A8A878",
                        minWidth: 60,
                      }}
                    >
                      <Text className="text-xs font-semibold text-white text-center">
                        {typeName.toUpperCase()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  const renderFooter = () => {
    if (!loading && !searchLoading) return null;
    return (
      <View className="py-5 items-center">
        <ActivityIndicator size="large" color="#FF6B6B" />
        {searchLoading && (
          <Text className="mt-2 text-sm text-gray-600">Searching...</Text>
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View className="flex-1 justify-center items-center py-20">
        <Ionicons name="search-outline" size={64} color="#999" />
        <Text className="text-base text-gray-600 text-center mt-4 mx-8">
          {searchQuery
            ? `No Pokémon found for "${searchQuery}"`
            : "No Pokémon found"}
        </Text>
        {searchQuery && (
          <TouchableOpacity
            className="mt-5 bg-red-500 px-5 py-2.5 rounded-lg"
            onPress={clearSearch}
          >
            <Text className="text-white font-semibold">Clear Search</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading && pokemons.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text className="mt-3 text-base text-gray-600">Loading Pokémon...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-5 pt-5 pb-3 bg-white border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-800">Pokédex</Text>
        <Text className="text-sm text-gray-600 mt-1">
          {totalPokemons} Pokémon discovered
        </Text>
      </View>

      {/* Search Bar */}
      <View className="mx-4 my-3 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
        <View className="flex-row items-center">
          <Ionicons name="search" size={20} color="#666" className="mr-2" />
          <TextInput
            className="flex-1 py-3 text-base text-gray-800"
            placeholder="Search Pokémon by name or ID..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearchChange}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} className="ml-2 p-1">
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Pokémon Grid */}
      <FlatList
        ref={flatListRef}
        data={filteredPokemons}
        renderItem={renderPokemonCard}
        keyExtractor={(item) => `${item.id}-${item.name}`}
        contentContainerClassName="px-4 pb-5"
        numColumns={2}
        columnWrapperClassName="justify-between"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B6B"]}
            tintColor="#FF6B6B"
          />
        }
        onEndReached={searchQuery ? undefined : loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={true}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </SafeAreaView>
  );
}
