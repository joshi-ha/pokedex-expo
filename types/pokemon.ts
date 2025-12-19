// types/pokemon.ts

export interface PokemonDetails {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Type[];
  abilities: Ability[];
  stats: Stat[];
  sprites: Sprite;
}

export interface Pokemon {
  name: string;
  image: string;
  imageBack: string;
  types: Type[];
  id: number;
}

interface Ability {
  ability: { name: string };
}

interface Type {
  type: { name: string };
}

interface Stat {
  base_stat: number;
  stat: { name: string };
}

interface Sprite {
  front_default: string;
  back_default: string;
  other: {
    "official-artwork": { front_default: string };
    dream_world: { front_default: string };
  };
}
