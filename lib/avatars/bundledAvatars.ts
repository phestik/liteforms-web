export type BundledAvatar = {
  id: string;
  name: string;
  description: string;
  vrmUrl: string;
  thumbnailUrl: string;
};

export const bundledAvatars: BundledAvatar[] = [
  {
    id: "polybot",
    name: "Polybot",
    description: "Stylized humanoid robot.",
    vrmUrl: "/models/bundled/polybot.vrm",
    thumbnailUrl: "/models/bundled/thumbs/polybot.png"
  },
  {
    id: "retroman",
    name: "Retroman",
    description: "Retro-futurist humanoid in a flight suit.",
    vrmUrl: "/models/bundled/retroman.vrm",
    thumbnailUrl: "/models/bundled/thumbs/retroman.png"
  },
  {
    id: "coolalien",
    name: "Cool Alien",
    description: "Friendly stylized alien humanoid.",
    vrmUrl: "/models/bundled/coolalien.vrm",
    thumbnailUrl: "/models/bundled/thumbs/coolalien.png"
  },
  {
    id: "astronaut",
    name: "Astronaut",
    description: "Suited humanoid astronaut.",
    vrmUrl: "/models/bundled/astronaut.vrm",
    thumbnailUrl: "/models/bundled/thumbs/astronaut.png"
  }
];

export function getBundledAvatarById(id: string): BundledAvatar | undefined {
  return bundledAvatars.find((avatar) => avatar.id === id);
}
