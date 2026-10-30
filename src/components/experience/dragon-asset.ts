// ─── Replaceable asset and rig contract ────────────────────────────────────────
export interface DragonAsset {
  url: string;
  clips: { flight: string; glide: string };
  bones: {
    head: string;
    jaw: string;
    mouth: string;
    neck: string;
    eyes: readonly string[];
  };
}

export const dragonAsset: DragonAsset = {
  url: "/models/draconis-serpentine-reborn.glb",
  clips: { flight: "Flight", glide: "Glide" },
  bones: {
    head: "Head",
    jaw: "Jaw",
    mouth: "Mouth",
    neck: "Neck_10",
    eyes: ["EyeNear", "EyeFar"],
  },
};
