(function () {
"use strict";

var HEROES = [
{ id: 1, name: "Anti-Mage", slug: "antimage" },
{ id: 2, name: "Axe", slug: "axe" },
{ id: 3, name: "Bane", slug: "bane" },
{ id: 4, name: "Bloodseeker", slug: "bloodseeker" },
{ id: 5, name: "Crystal Maiden", slug: "crystal_maiden" },
{ id: 6, name: "Drow Ranger", slug: "drow_ranger" },
{ id: 7, name: "Earthshaker", slug: "earthshaker" },
{ id: 8, name: "Juggernaut", slug: "juggernaut" },
{ id: 9, name: "Mirana", slug: "mirana" },
{ id: 10, name: "Morphling", slug: "morphling" },
{ id: 11, name: "Shadow Fiend", slug: "nevermore" },
{ id: 12, name: "Phantom Lancer", slug: "phantom_lancer" },
{ id: 13, name: "Puck", slug: "puck" },
{ id: 14, name: "Pudge", slug: "pudge" },
{ id: 15, name: "Razor", slug: "razor" },
{ id: 16, name: "Sand King", slug: "sand_king" },
{ id: 17, name: "Storm Spirit", slug: "storm_spirit" },
{ id: 18, name: "Sven", slug: "sven" },
{ id: 19, name: "Tiny", slug: "tiny" },
{ id: 20, name: "Vengeful Spirit", slug: "vengefulspirit" },
{ id: 21, name: "Windranger", slug: "windrunner" },
{ id: 22, name: "Zeus", slug: "zuus" },
{ id: 23, name: "Kunkka", slug: "kunkka" },
{ id: 25, name: "Lina", slug: "lina" },
{ id: 26, name: "Lion", slug: "lion" },
{ id: 27, name: "Shadow Shaman", slug: "shadow_shaman" },
{ id: 28, name: "Slardar", slug: "slardar" },
{ id: 29, name: "Tidehunter", slug: "tidehunter" },
{ id: 30, name: "Witch Doctor", slug: "witch_doctor" },
{ id: 31, name: "Lich", slug: "lich" },
{ id: 32, name: "Riki", slug: "riki" },
{ id: 33, name: "Enigma", slug: "enigma" },
{ id: 34, name: "Tinker", slug: "tinker" },
{ id: 35, name: "Sniper", slug: "sniper" },
{ id: 36, name: "Necrophos", slug: "necrolyte" },
{ id: 37, name: "Warlock", slug: "warlock" },
{ id: 38, name: "Beastmaster", slug: "beastmaster" },
{ id: 39, name: "Queen of Pain", slug: "queenofpain" },
{ id: 40, name: "Venomancer", slug: "venomancer" },
{ id: 41, name: "Faceless Void", slug: "faceless_void" },
{ id: 42, name: "Wraith King", slug: "skeleton_king" },
{ id: 43, name: "Death Prophet", slug: "death_prophet" },
{ id: 44, name: "Phantom Assassin", slug: "phantom_assassin" },
{ id: 45, name: "Pugna", slug: "pugna" },
{ id: 46, name: "Templar Assassin", slug: "templar_assassin" },
{ id: 47, name: "Viper", slug: "viper" },
{ id: 48, name: "Luna", slug: "luna" },
{ id: 49, name: "Dragon Knight", slug: "dragon_knight" },
{ id: 50, name: "Dazzle", slug: "dazzle" },
{ id: 51, name: "Clockwerk", slug: "rattletrap" },
{ id: 52, name: "Leshrac", slug: "leshrac" },
{ id: 53, name: "Nature's Prophet", slug: "furion" },
{ id: 54, name: "Lifestealer", slug: "life_stealer" },
{ id: 55, name: "Dark Seer", slug: "dark_seer" },
{ id: 56, name: "Clinkz", slug: "clinkz" },
{ id: 57, name: "Omniknight", slug: "omniknight" },
{ id: 58, name: "Enchantress", slug: "enchantress" },
{ id: 59, name: "Huskar", slug: "huskar" },
{ id: 60, name: "Night Stalker", slug: "night_stalker" },
{ id: 61, name: "Broodmother", slug: "broodmother" },
{ id: 62, name: "Bounty Hunter", slug: "bounty_hunter" },
{ id: 63, name: "Weaver", slug: "weaver" },
{ id: 64, name: "Jakiro", slug: "jakiro" },
{ id: 65, name: "Batrider", slug: "batrider" },
{ id: 66, name: "Chen", slug: "chen" },
{ id: 67, name: "Spectre", slug: "spectre" },
{ id: 68, name: "Ancient Apparition", slug: "ancient_apparition" },
{ id: 69, name: "Doom", slug: "doom_bringer" },
{ id: 70, name: "Ursa", slug: "ursa" },
{ id: 71, name: "Spirit Breaker", slug: "spirit_breaker" },
{ id: 72, name: "Gyrocopter", slug: "gyrocopter" },
{ id: 73, name: "Alchemist", slug: "alchemist" },
{ id: 74, name: "Invoker", slug: "invoker" },
{ id: 75, name: "Silencer", slug: "silencer" },
{ id: 76, name: "Outworld Destroyer", slug: "obsidian_destroyer" },
{ id: 77, name: "Lycan", slug: "lycan" },
{ id: 78, name: "Brewmaster", slug: "brewmaster" },
{ id: 79, name: "Shadow Demon", slug: "shadow_demon" },
{ id: 80, name: "Lone Druid", slug: "lone_druid" },
{ id: 81, name: "Chaos Knight", slug: "chaos_knight" },
{ id: 82, name: "Meepo", slug: "meepo" },
{ id: 83, name: "Treant Protector", slug: "treant" },
{ id: 84, name: "Ogre Magi", slug: "ogre_magi" },
{ id: 85, name: "Undying", slug: "undying" },
{ id: 86, name: "Rubick", slug: "rubick" },
{ id: 87, name: "Disruptor", slug: "disruptor" },
{ id: 88, name: "Nyx Assassin", slug: "nyx_assassin" },
{ id: 89, name: "Naga Siren", slug: "naga_siren" },
{ id: 90, name: "Keeper of the Light", slug: "keeper_of_the_light" },
{ id: 91, name: "Io", slug: "wisp" },
{ id: 92, name: "Visage", slug: "visage" },
{ id: 93, name: "Slark", slug: "slark" },
{ id: 94, name: "Medusa", slug: "medusa" },
{ id: 95, name: "Troll Warlord", slug: "troll_warlord" },
{ id: 96, name: "Centaur Warrunner", slug: "centaur" },
{ id: 97, name: "Magnus", slug: "magnataur" },
{ id: 98, name: "Timbersaw", slug: "shredder" },
{ id: 99, name: "Bristleback", slug: "bristleback" },
{ id: 100, name: "Tusk", slug: "tusk" },
{ id: 101, name: "Skywrath Mage", slug: "skywrath_mage" },
{ id: 102, name: "Abaddon", slug: "abaddon" },
{ id: 103, name: "Elder Titan", slug: "elder_titan" },
{ id: 104, name: "Legion Commander", slug: "legion_commander" },
{ id: 105, name: "Techies", slug: "techies" },
{ id: 106, name: "Ember Spirit", slug: "ember_spirit" },
{ id: 107, name: "Earth Spirit", slug: "earth_spirit" },
{ id: 108, name: "Underlord", slug: "abyssal_underlord" },
{ id: 109, name: "Terrorblade", slug: "terrorblade" },
{ id: 110, name: "Phoenix", slug: "phoenix" },
{ id: 111, name: "Oracle", slug: "oracle" },
{ id: 112, name: "Winter Wyvern", slug: "winter_wyvern" },
{ id: 113, name: "Arc Warden", slug: "arc_warden" },
{ id: 114, name: "Monkey King", slug: "monkey_king" },
{ id: 119, name: "Dark Willow", slug: "dark_willow" },
{ id: 120, name: "Pangolier", slug: "pangolier" },
{ id: 121, name: "Grimstroke", slug: "grimstroke" },
{ id: 123, name: "Hoodwink", slug: "hoodwink" },
{ id: 126, name: "Void Spirit", slug: "void_spirit" },
{ id: 128, name: "Snapfire", slug: "snapfire" },
{ id: 129, name: "Mars", slug: "mars" },
{ id: 131, name: "Dawnbreaker", slug: "dawnbreaker" },
{ id: 136, name: "Marci", slug: "marci" },
{ id: 137, name: "Primal Beast", slug: "primal_beast" },
{ id: 138, name: "Muerta", slug: "muerta" }
];

var ITEMS = {
1: ["Blink Dagger", "blink"],
2: ["Blades of Attack", "blades_of_attack"],
3: ["Broadsword", "broadsword"],
4: ["Chainmail", "chainmail"],
5: ["Claymore", "claymore"],
6: ["Helm of Iron Will", "helm_of_iron_will"],
7: ["Javelin", "javelin"],
8: ["Mithril Hammer", "mithril_hammer"],
9: ["Platemail", "platemail"],
10: ["Quarterstaff", "quarterstaff"],
11: ["Quelling Blade", "quelling_blade"],
12: ["Ring of Basilius", "ring_of_basilius"],
13: ["Robe of the Magi", "robe_of_the_magi"],
14: ["Slippers of Agility", "slippers_of_agility"],
16: ["Hyperstone", "hyperstone"],
17: ["Ultimate Orb", "ultimate_orb"],
18: ["Sage's Mask", "sages_mask"],
19: ["Ring of Regen", "ring_of_regen"],
20: ["Soul Booster", "soul_booster"],
21: ["Voodoo Mask", "voodoo_mask"],
22: ["Blade of Alacrity", "blade_of_alacrity"],
23: ["Ogre Axe", "ogre_axe"],
24: ["Staff of Wizardry", "staff_of_wizardry"],
25: ["Ultimate Orb", "ultimate_orb"],
26: ["Gloves of Haste", "gloves"],
27: ["Boots of Speed", "boots"],
28: ["Cloak", "cloak"],
29: ["Boots of Speed", "boots"],
30: ["Magic Wand", "magic_wand"],
31: ["Clarity", "clarity"],
32: ["Tango", "tango"],
33: ["Tango (Shared)", "tango_single"],
34: ["Healing Salve", "flask"],
35: ["Dust of Appearance", "dust"],
36: ["Magic Stick", "magic_stick"],
37: ["Enchanted Mango", "enchanted_mango"],
38: ["Healing Salve", "flask"],
39: ["Sentry Ward", "ward_sentry"],
40: ["Observer Ward", "ward_observer"],
41: ["Bottle", "bottle"],
42: ["Boots of Travel", "travel_boots"],
43: ["Ring of Protection", "ring_of_protection"],
44: ["Stout Shield", "stout_shield"],
46: ["Branches", "branches"],
47: ["Gem of True Sight", "gem"],
48: ["Soul Ring", "soul_ring"],
49: ["Animal Courier", "courier"],
50: ["Phase Boots", "phase_boots"],
51: ["Bracer", "bracer"],
52: ["Null Talisman", "null_talisman"],
53: ["Wraith Band", "wraith_band"],
55: ["Aeon Disk", "aeon_disk"],
56: ["Buckler", "buckler"],
57: ["Ring of Health", "ring_of_health"],
58: ["Void Stone", "void_stone"],
59: ["Energy Booster", "energy_booster"],
60: ["Point Booster", "point_booster"],
61: ["Vitality Booster", "vitality_booster"],
62: ["Blink Dagger", "blink"],
63: ["Power Treads", "power_treads"],
64: ["Oblivion Staff", "oblivion_staff"],
65: ["Hand of Midas", "hand_of_midas"],
66: ["Boots of Travel", "travel_boots"],
67: ["Perseverance", "perseverance"],
68: ["Poor Man's Shield", "poor_mans_shield"],
69: ["Soul Ring", "soul_ring"],
70: ["Morbid Mask", "morbid_mask"],
71: ["Sange", "sange"],
72: ["Yasha", "yasha"],
73: ["Bracer", "bracer"],
74: ["Headdress", "headdress"],
75: ["Null Talisman", "null_talisman"],
76: ["Wraith Band", "wraith_band"],
77: ["Mekansm", "mekansm"],
78: ["Medallion of Courage", "medallion_of_courage"],
79: ["Aghanim's Scepter", "ultimate_scepter"],
80: ["Refresher Orb", "refresher"],
81: ["Scythe of Vyse", "sheepstick"],
82: ["Pipe of Insight", "pipe"],
83: ["Urn of Shadows", "urn_of_shadows"],
84: ["Flying Courier", "courier"],
85: ["Tranquil Boots", "tranquil_boots"],
86: ["Shadow Amulet", "shadow_amulet"],
87: ["Ghost Scepter", "ghost"],
88: ["Manta Style", "manta"],
89: ["Vladmir's Offering", "vladmir"],
90: ["Black King Bar", "black_king_bar"],
91: ["Aegis", "aegis"],
92: ["Cheese", "cheese"],
93: ["Refresher Shard", "refresher_shard"],
94: ["Ultimate Orb", "ultimate_orb"],
95: ["Radiance", "radiance"],
96: ["Scythe of Vyse", "sheepstick"],
97: ["Assault Cuirass", "assault"],
98: ["Heart of Tarrasque", "heart"],
99: ["Black King Bar", "black_king_bar"],
100: ["Bloodstone", "bloodstone"],
101: ["Nullifier", "nullifier"],
102: ["Dagon", "dagon_5"],
103: ["Dagon 5", "dagon_5"],
104: ["Sange and Yasha", "sange_and_yasha"],
105: ["Satanic", "satanic"],
106: ["Mjollnir", "mjollnir"],
107: ["Skull Basher", "basher"],
108: ["Aghanim's Shard", "aghanims_shard"],
109: ["Helm of the Dominator", "helm_of_the_dominator"],
110: ["Diffusal Blade", "diffusal_blade"],
111: ["Battle Fury", "bfury"],
112: ["Manta Style", "manta"],
113: ["Aegis of the Immortal", "aegis"],
114: ["Crimson Guard", "crimson_guard"],
115: ["Eul's Scepter", "cyclone"],
116: ["Black King Bar", "black_king_bar"],
117: ["Oblivion Staff", "oblivion_staff"],
118: ["Butterfly", "butterfly"],
119: ["Force Staff", "force_staff"],
120: ["Dagon 5", "dagon_5"],
121: ["Sange and Yasha", "sange_and_yasha"],
122: ["Satanic", "satanic"],
123: ["Shiva's Guard", "shivas_guard"],
124: ["Heart of Tarrasque", "heart"],
125: ["Moon Shard", "moon_shard"],
126: ["Aghanim's Scepter", "ultimate_scepter"],
127: ["Blade Mail", "blade_mail"],
128: ["Soul Booster", "soul_booster"],
129: ["Hood of Defiance", "hood_of_defiance"],
130: ["Shiva's Guard", "shivas_guard"],
131: ["Force Staff", "force_staff"],
132: ["Aegis of the Immortal", "aegis"],
133: ["Linken's Sphere", "sphere"],
134: ["Refresher Orb", "refresher"],
135: ["Aghanim's Scepter", "ultimate_scepter"],
136: ["Soul Booster", "soul_booster"],
137: ["Hood of Defiance", "hood_of_defiance"],
138: ["Aegis of the Immortal", "aegis"],
139: ["Assault Cuirass", "assault"],
140: ["Lotus Orb", "lotus_orb"],
141: ["Scythe of Vyse", "sheepstick"],
142: ["Eul's Scepter", "cyclone"],
143: ["Ethereal Blade", "ethereal_blade"],
144: ["Eul's Scepter of Divinity", "cyclone"],
145: ["Battle Fury", "bfury"],
146: ["Desolator", "desolator"],
147: ["Manta Style", "manta"],
148: ["Eye of Skadi", "skadi"],
149: ["Crystalys", "lesser_crit"],
150: ["Crystalys", "lesser_crit"],
151: ["Daedalus", "greater_crit"],
152: ["Daedalus", "greater_crit"],
153: ["Mjollnir", "mjollnir"],
154: ["Abyssal Blade", "abyssal_blade"],
155: ["Heart of Tarrasque", "heart"],
156: ["Satanic", "satanic"],
157: ["Mithril Hammer", "mithril_hammer"],
158: ["Mithril Hammer", "mithril_hammer"],
159: ["Vanguard", "vanguard"],
160: ["Radiance", "radiance"],
161: ["Monkey King Bar", "monkey_king_bar"],
162: ["Monkey King Bar", "monkey_king_bar"],
163: ["Ethereal Blade", "ethereal_blade"],
164: ["Dagon", "dagon_5"],
165: ["Dagon 5", "dagon_5"],
166: ["Aghanim's Scepter", "ultimate_scepter"],
167: ["Aghanim's Scepter", "ultimate_scepter"],
168: ["Desolator", "desolator"],
169: ["Battle Fury", "bfury"],
170: ["Bottle", "bottle"],
171: ["Butterfly", "butterfly"],
172: ["Daedalus", "greater_crit"],
173: ["Heart of Tarrasque", "heart"],
174: ["Diffusal Blade", "diffusal_blade"],
175: ["Ethereal Blade", "ethereal_blade"],
176: ["Manta Style", "manta"],
177: ["Radiance", "radiance"],
178: ["Refresher Orb", "refresher"],
179: ["Scythe of Vyse", "sheepstick"],
180: ["Shiva's Guard", "shivas_guard"],
181: ["Skadi", "skadi"],
182: ["Sange and Yasha", "sange_and_yasha"],
183: ["Satanic", "satanic"],
184: ["Mage Slayer", "mage_slayer"],
185: ["Skull Basher", "basher"],
186: ["Skull Basher", "basher"],
187: ["Medallion of Courage", "medallion_of_courage"],
188: ["Smoke of Deceit", "smoke_of_deceit"],
189: ["Veil of Discord", "veil_of_discord"],
190: ["Veil of Discord", "veil_of_discord"],
191: ["Drum of Endurance", "ancient_janggo"],
192: ["Drum of Endurance", "ancient_janggo"],
193: ["Sange and Yasha", "sange_and_yasha"],
194: ["Heaven's Halberd", "heavens_halberd"],
195: ["Heaven's Halberd", "heavens_halberd"],
196: ["Ring of Aquila", "ring_of_aquila"],
197: ["Ring of Aquila", "ring_of_aquila"],
198: ["Ring of Aquila", "ring_of_aquila"],
199: ["Ring of Aquila", "ring_of_aquila"],
200: ["Urn of Shadows", "urn_of_shadows"],
201: ["Dagon", "dagon_5"],
202: ["Dagon 5", "dagon_5"],
203: ["Aghanim's Scepter", "ultimate_scepter"],
204: ["Aghanim's Scepter", "ultimate_scepter"],
205: ["Ethereal Blade", "ethereal_blade"],
206: ["Ethereal Blade", "ethereal_blade"],
207: ["Eye of Skadi", "skadi"],
208: ["Eye of Skadi", "skadi"],
209: ["Sange and Yasha", "sange_and_yasha"],
210: ["Sange and Yasha", "sange_and_yasha"],
211: ["Manta Style", "manta"],
212: ["Heart of Tarrasque", "heart"],
213: ["Black King Bar", "black_king_bar"],
214: ["Tranquil Boots", "tranquil_boots"],
215: ["Vanguard", "vanguard"],
216: ["Vanguard", "vanguard"],
217: ["Bloodstone", "bloodstone"],
218: ["Satanic", "satanic"],
219: ["Satanic", "satanic"],
220: ["Mekansm", "mekansm"],
221: ["Mekansm", "mekansm"],
222: ["Sange and Yasha", "sange_and_yasha"],
223: ["Guardian Greaves", "guardian_greaves"],
224: ["Guardian Greaves", "guardian_greaves"],
225: ["Guardian Greaves", "guardian_greaves"],
226: ["Guardian Greaves", "guardian_greaves"],
227: ["Sange and Yasha", "sange_and_yasha"],
228: ["Sange and Yasha", "sange_and_yasha"],
229: ["Battle Fury", "bfury"],
230: ["Battle Fury", "bfury"],
231: ["Mjollnir", "mjollnir"],
232: ["Mjollnir", "mjollnir"],
233: ["Moon Shard", "moon_shard"],
234: ["Moon Shard", "moon_shard"],
235: ["Octarine Core", "octarine_core"],
236: ["Dragon Lance", "dragon_lance"],
237: ["Bloodthorn", "bloodthorn"],
238: ["Nullifier", "nullifier"],
239: ["Aether Lens", "aether_lens"],
240: ["Aether Lens", "aether_lens"],
241: ["Aether Lens", "aether_lens"],
242: ["Crimson Guard", "crimson_guard"],
243: ["Crimson Guard", "crimson_guard"],
244: ["Wind Waker", "wind_waker"],
245: ["Wind Waker", "wind_waker"],
246: ["Wind Waker", "wind_waker"],
247: ["Moon Shard", "moon_shard"],
248: ["Moon Shard", "moon_shard"],
249: ["Silver Edge", "silver_edge"],
250: ["Sange and Yasha", "sange_and_yasha"],
251: ["Sange and Yasha", "sange_and_yasha"],
252: ["Echo Sabre", "echo_sabre"],
253: ["Echo Sabre", "echo_sabre"],
254: ["Glimmer Cape", "glimmer_cape"],
255: ["Pipe of Insight", "pipe"],
256: ["Solar Crest", "solar_crest"],
257: ["Lotus Orb", "lotus_orb"],
258: ["Lotus Orb", "lotus_orb"],
259: ["Aether Lens", "aether_lens"],
260: ["Aether Lens", "aether_lens"],
261: ["Guardian Greaves", "guardian_greaves"],
262: ["Guardian Greaves", "guardian_greaves"],
263: ["Hurricane Pike", "hurricane_pike"],
264: ["Wind Waker", "wind_waker"],
265: ["Wind Waker", "wind_waker"],
266: ["Spirit Vessel", "spirit_vessel"],
267: ["Bloodstone", "bloodstone"],
268: ["Bloodstone", "bloodstone"],
269: ["Bloodstone", "bloodstone"],
270: ["Bloodstone", "bloodstone"],
271: ["Veil of Discord", "veil_of_discord"],
272: ["Veil of Discord", "veil_of_discord"],
273: ["Aeon Disk", "aeon_disk"],
274: ["Aeon Disk", "aeon_disk"],
275: ["Aeon Disk", "aeon_disk"],
276: ["Aeon Disk", "aeon_disk"],
277: ["Shiva's Guard", "shivas_guard"],
278: ["Shiva's Guard", "shivas_guard"],
279: ["Kaya", "kaya"],
280: ["Sange", "sange"],
281: ["Yasha", "yasha"],
282: ["Mage Slayer", "mage_slayer"],
283: ["Mage Slayer", "mage_slayer"],
284: ["Mage Slayer", "mage_slayer"],
285: ["Mage Slayer", "mage_slayer"],
286: ["Mage Slayer", "mage_slayer"],
287: ["Mage Slayer", "mage_slayer"],
288: ["Mage Slayer", "mage_slayer"],
289: ["Mage Slayer", "mage_slayer"],
290: ["Mage Slayer", "mage_slayer"],
291: ["Mage Slayer", "mage_slayer"],
292: ["Mage Slayer", "mage_slayer"],
293: ["Mage Slayer", "mage_slayer"],
294: ["Mage Slayer", "mage_slayer"],
295: ["Mage Slayer", "mage_slayer"],
296: ["Mage Slayer", "mage_slayer"],
297: ["Mage Slayer", "mage_slayer"],
298: ["Mage Slayer", "mage_slayer"],
299: ["Mage Slayer", "mage_slayer"],
300: ["Mage Slayer", "mage_slayer"],
301: ["Mage Slayer", "mage_slayer"],
302: ["Mage Slayer", "mage_slayer"],
303: ["Mage Slayer", "mage_slayer"],
304: ["Mage Slayer", "mage_slayer"],
305: ["Mage Slayer", "mage_slayer"],
306: ["Mage Slayer", "mage_slayer"],
307: ["Mage Slayer", "mage_slayer"],
308: ["Mage Slayer", "mage_slayer"],
309: ["Mage Slayer", "mage_slayer"],
310: ["Mage Slayer", "mage_slayer"],
311: ["Mage Slayer", "mage_slayer"],
312: ["Mage Slayer", "mage_slayer"],
313: ["Mage Slayer", "mage_slayer"],
314: ["Mage Slayer", "mage_slayer"],
315: ["Mage Slayer", "mage_slayer"],
316: ["Mage Slayer", "mage_slayer"],
317: ["Mage Slayer", "mage_slayer"],
318: ["Mage Slayer", "mage_slayer"],
319: ["Mage Slayer", "mage_slayer"],
320: ["Mage Slayer", "mage_slayer"],
321: ["Mage Slayer", "mage_slayer"],
322: ["Mage Slayer", "mage_slayer"],
323: ["Mage Slayer", "mage_slayer"],
324: ["Mage Slayer", "mage_slayer"],
325: ["Mage Slayer", "mage_slayer"],
326: ["Mage Slayer", "mage_slayer"],
327: ["Mage Slayer", "mage_slayer"],
328: ["Mage Slayer", "mage_slayer"],
329: ["Mage Slayer", "mage_slayer"],
330: ["Mage Slayer", "mage_slayer"],
331: ["Mage Slayer", "mage_slayer"],
332: ["Mage Slayer", "mage_slayer"],
333: ["Mage Slayer", "mage_slayer"],
334: ["Mage Slayer", "mage_slayer"],
335: ["Mage Slayer", "mage_slayer"],
336: ["Mage Slayer", "mage_slayer"],
337: ["Mage Slayer", "mage_slayer"],
338: ["Mage Slayer", "mage_slayer"],
339: ["Mage Slayer", "mage_slayer"],
340: ["Mage Slayer", "mage_slayer"],
341: ["Mage Slayer", "mage_slayer"],
342: ["Mage Slayer", "mage_slayer"],
343: ["Mage Slayer", "mage_slayer"],
344: ["Mage Slayer", "mage_slayer"],
345: ["Mage Slayer", "mage_slayer"],
346: ["Mage Slayer", "mage_slayer"],
347: ["Mage Slayer", "mage_slayer"],
348: ["Mage Slayer", "mage_slayer"],
349: ["Mage Slayer", "mage_slayer"],
350: ["Mage Slayer", "mage_slayer"],
351: ["Mage Slayer", "mage_slayer"],
352: ["Mage Slayer", "mage_slayer"],
353: ["Mage Slayer", "mage_slayer"],
354: ["Mage Slayer", "mage_slayer"],
355: ["Mage Slayer", "mage_slayer"],
356: ["Mage Slayer", "mage_slayer"],
357: ["Mage Slayer", "mage_slayer"],
358: ["Mage Slayer", "mage_slayer"],
359: ["Mage Slayer", "mage_slayer"],
360: ["Mage Slayer", "mage_slayer"],
361: ["Mage Slayer", "mage_slayer"],
362: ["Mage Slayer", "mage_slayer"],
363: ["Mage Slayer", "mage_slayer"],
364: ["Mage Slayer", "mage_slayer"],
365: ["Mage Slayer", "mage_slayer"],
366: ["Mage Slayer", "mage_slayer"],
367: ["Mage Slayer", "mage_slayer"],
368: ["Mage Slayer", "mage_slayer"],
369: ["Mage Slayer", "mage_slayer"],
370: ["Mage Slayer", "mage_slayer"],
371: ["Mage Slayer", "mage_slayer"],
372: ["Mage Slayer", "mage_slayer"],
373: ["Mage Slayer", "mage_slayer"],
374: ["Mage Slayer", "mage_slayer"],
375: ["Mage Slayer", "mage_slayer"],
376: ["Mage Slayer", "mage_slayer"],
377: ["Mage Slayer", "mage_slayer"],
378: ["Mage Slayer", "mage_slayer"],
379: ["Mage Slayer", "mage_slayer"],
380: ["Mage Slayer", "mage_slayer"],
381: ["Mage Slayer", "mage_slayer"],
382: ["Mage Slayer", "mage_slayer"],
383: ["Mage Slayer", "mage_slayer"],
384: ["Mage Slayer", "mage_slayer"],
385: ["Mage Slayer", "mage_slayer"],
386: ["Mage Slayer", "mage_slayer"],
387: ["Mage Slayer", "mage_slayer"],
388: ["Mage Slayer", "mage_slayer"],
389: ["Mage Slayer", "mage_slayer"],
390: ["Mage Slayer", "mage_slayer"],
391: ["Mage Slayer", "mage_slayer"],
392: ["Mage Slayer", "mage_slayer"],
393: ["Mage Slayer", "mage_slayer"],
394: ["Mage Slayer", "mage_slayer"],
395: ["Mage Slayer", "mage_slayer"],
396: ["Mage Slayer", "mage_slayer"],
397: ["Mage Slayer", "mage_slayer"],
398: ["Mage Slayer", "mage_slayer"],
399: ["Mage Slayer", "mage_slayer"],
400: ["Mage Slayer", "mage_slayer"],
401: ["Mage Slayer", "mage_slayer"],
402: ["Mage Slayer", "mage_slayer"],
403: ["Mage Slayer", "mage_slayer"],
404: ["Mage Slayer", "mage_slayer"],
405: ["Mage Slayer", "mage_slayer"],
406: ["Mage Slayer", "mage_slayer"],
407: ["Mage Slayer", "mage_slayer"],
408: ["Mage Slayer", "mage_slayer"],
409: ["Mage Slayer", "mage_slayer"],
410: ["Mage Slayer", "mage_slayer"],
411: ["Mage Slayer", "mage_slayer"],
412: ["Mage Slayer", "mage_slayer"],
413: ["Mage Slayer", "mage_slayer"],
414: ["Mage Slayer", "mage_slayer"],
415: ["Mage Slayer", "mage_slayer"],
416: ["Mage Slayer", "mage_slayer"],
417: ["Mage Slayer", "mage_slayer"],
418: ["Mage Slayer", "mage_slayer"],
419: ["Mage Slayer", "mage_slayer"],
420: ["Mage Slayer", "mage_slayer"],
421: ["Mage Slayer", "mage_slayer"],
422: ["Mage Slayer", "mage_slayer"],
423: ["Mage Slayer", "mage_slayer"],
424: ["Mage Slayer", "mage_slayer"],
425: ["Mage Slayer", "mage_slayer"],
426: ["Mage Slayer", "mage_slayer"],
427: ["Mage Slayer", "mage_slayer"],
428: ["Mage Slayer", "mage_slayer"],
429: ["Mage Slayer", "mage_slayer"],
430: ["Mage Slayer", "mage_slayer"],
431: ["Mage Slayer", "mage_slayer"],
432: ["Mage Slayer", "mage_slayer"],
433: ["Mage Slayer", "mage_slayer"],
434: ["Mage Slayer", "mage_slayer"],
435: ["Mage Slayer", "mage_slayer"],
436: ["Mage Slayer", "mage_slayer"],
437: ["Mage Slayer", "mage_slayer"],
438: ["Mage Slayer", "mage_slayer"],
439: ["Mage Slayer", "mage_slayer"],
440: ["Mage Slayer", "mage_slayer"],
441: ["Mage Slayer", "mage_slayer"],
442: ["Mage Slayer", "mage_slayer"],
443: ["Mage Slayer", "mage_slayer"],
444: ["Mage Slayer", "mage_slayer"],
445: ["Mage Slayer", "mage_slayer"],
446: ["Mage Slayer", "mage_slayer"],
447: ["Mage Slayer", "mage_slayer"],
448: ["Mage Slayer", "mage_slayer"],
449: ["Mage Slayer", "mage_slayer"],
450: ["Mage Slayer", "mage_slayer"],
451: ["Mage Slayer", "mage_slayer"],
452: ["Mage Slayer", "mage_slayer"],
453: ["Mage Slayer", "mage_slayer"],
454: ["Mage Slayer", "mage_slayer"],
455: ["Mage Slayer", "mage_slayer"],
456: ["Mage Slayer", "mage_slayer"],
457: ["Mage Slayer", "mage_slayer"],
458: ["Mage Slayer", "mage_slayer"],
459: ["Mage Slayer", "mage_slayer"],
460: ["Mage Slayer", "mage_slayer"],
461: ["Mage Slayer", "mage_slayer"],
462: ["Mage Slayer", "mage_slayer"],
463: ["Mage Slayer", "mage_slayer"],
464: ["Mage Slayer", "mage_slayer"],
465: ["Mage Slayer", "mage_slayer"],
466: ["Mage Slayer", "mage_slayer"],
467: ["Mage Slayer", "mage_slayer"],
468: ["Mage Slayer", "mage_slayer"],
469: ["Mage Slayer", "mage_slayer"],
470: ["Mage Slayer", "mage_slayer"],
471: ["Mage Slayer", "mage_slayer"],
472: ["Mage Slayer", "mage_slayer"],
473: ["Mage Slayer", "mage_slayer"],
474: ["Mage Slayer", "mage_slayer"],
475: ["Mage Slayer", "mage_slayer"],
476: ["Mage Slayer", "mage_slayer"],
477: ["Mage Slayer", "mage_slayer"],
478: ["Mage Slayer", "mage_slayer"],
479: ["Mage Slayer", "mage_slayer"],
480: ["Mage Slayer", "mage_slayer"],
481: ["Mage Slayer", "mage_slayer"],
482: ["Mage Slayer", "mage_slayer"],
483: ["Mage Slayer", "mage_slayer"],
484: ["Mage Slayer", "mage_slayer"],
485: ["Mage Slayer", "mage_slayer"],
486: ["Mage Slayer", "mage_slayer"],
487: ["Mage Slayer", "mage_slayer"],
488: ["Mage Slayer", "mage_slayer"],
489: ["Mage Slayer", "mage_slayer"],
490: ["Mage Slayer", "mage_slayer"],
491: ["Mage Slayer", "mage_slayer"],
492: ["Mage Slayer", "mage_slayer"],
493: ["Mage Slayer", "mage_slayer"],
494: ["Mage Slayer", "mage_slayer"],
495: ["Mage Slayer", "mage_slayer"],
496: ["Mage Slayer", "mage_slayer"],
497: ["Mage Slayer", "mage_slayer"],
498: ["Mage Slayer", "mage_slayer"],
499: ["Mage Slayer", "mage_slayer"],
500: ["Mage Slayer", "mage_slayer"],
501: ["Mage Slayer", "mage_slayer"],
502: ["Mage Slayer", "mage_slayer"],
503: ["Mage Slayer", "mage_slayer"],
504: ["Mage Slayer", "mage_slayer"],
505: ["Mage Slayer", "mage_slayer"],
506: ["Mage Slayer", "mage_slayer"],
507: ["Mage Slayer", "mage_slayer"],
508: ["Mage Slayer", "mage_slayer"],
509: ["Mage Slayer", "mage_slayer"],
510: ["Mage Slayer", "mage_slayer"],
511: ["Mage Slayer", "mage_slayer"],
512: ["Mage Slayer", "mage_slayer"],
513: ["Mage Slayer", "mage_slayer"],
514: ["Mage Slayer", "mage_slayer"],
515: ["Mage Slayer", "mage_slayer"],
516: ["Mage Slayer", "mage_slayer"],
517: ["Mage Slayer", "mage_slayer"],
518: ["Mage Slayer", "mage_slayer"],
519: ["Mage Slayer", "mage_slayer"],
520: ["Mage Slayer", "mage_slayer"],
521: ["Mage Slayer", "mage_slayer"],
522: ["Mage Slayer", "mage_slayer"],
523: ["Mage Slayer", "mage_slayer"],
524: ["Mage Slayer", "mage_slayer"],
525: ["Mage Slayer", "mage_slayer"],
526: ["Mage Slayer", "mage_slayer"],
527: ["Mage Slayer", "mage_slayer"],
528: ["Mage Slayer", "mage_slayer"],
529: ["Mage Slayer", "mage_slayer"],
530: ["Mage Slayer", "mage_slayer"],
531: ["Mage Slayer", "mage_slayer"],
532: ["Mage Slayer", "mage_slayer"],
533: ["Mage Slayer", "mage_slayer"],
534: ["Mage Slayer", "mage_slayer"],
535: ["Mage Slayer", "mage_slayer"],
536: ["Mage Slayer", "mage_slayer"],
537: ["Mage Slayer", "mage_slayer"],
538: ["Mage Slayer", "mage_slayer"],
539: ["Mage Slayer", "mage_slayer"],
540: ["Mage Slayer", "mage_slayer"],
541: ["Mage Slayer", "mage_slayer"],
542: ["Mage Slayer", "mage_slayer"],
543: ["Mage Slayer", "mage_slayer"],
544: ["Mage Slayer", "mage_slayer"],
545: ["Mage Slayer", "mage_slayer"],
546: ["Mage Slayer", "mage_slayer"],
547: ["Mage Slayer", "mage_slayer"],
548: ["Mage Slayer", "mage_slayer"],
549: ["Mage Slayer", "mage_slayer"],
550: ["Mage Slayer", "mage_slayer"],
551: ["Mage Slayer", "mage_slayer"],
552: ["Mage Slayer", "mage_slayer"],
553: ["Mage Slayer", "mage_slayer"],
554: ["Mage Slayer", "mage_slayer"],
555: ["Mage Slayer", "mage_slayer"],
556: ["Mage Slayer", "mage_slayer"],
557: ["Mage Slayer", "mage_slayer"],
558: ["Mage Slayer", "mage_slayer"],
559: ["Mage Slayer", "mage_slayer"],
560: ["Mage Slayer", "mage_slayer"],
561: ["Mage Slayer", "mage_slayer"],
562: ["Mage Slayer", "mage_slayer"],
563: ["Mage Slayer", "mage_slayer"],
564: ["Mage Slayer", "mage_slayer"],
565: ["Mage Slayer", "mage_slayer"],
566: ["Mage Slayer", "mage_slayer"],
567: ["Mage Slayer", "mage_slayer"],
568: ["Mage Slayer", "mage_slayer"],
569: ["Mage Slayer", "mage_slayer"],
570: ["Mage Slayer", "mage_slayer"],
571: ["Mage Slayer", "mage_slayer"],
572: ["Mage Slayer", "mage_slayer"],
573: ["Mage Slayer", "mage_slayer"],
574: ["Mage Slayer", "mage_slayer"],
575: ["Mage Slayer", "mage_slayer"],
576: ["Mage Slayer", "mage_slayer"],
577: ["Mage Slayer", "mage_slayer"],
578: ["Mage Slayer", "mage_slayer"],
579: ["Mage Slayer", "mage_slayer"],
580: ["Mage Slayer", "mage_slayer"],
581: ["Mage Slayer", "mage_slayer"],
582: ["Mage Slayer", "mage_slayer"],
583: ["Mage Slayer", "mage_slayer"],
584: ["Mage Slayer", "mage_slayer"],
585: ["Mage Slayer", "mage_slayer"],
586: ["Mage Slayer", "mage_slayer"],
587: ["Mage Slayer", "mage_slayer"],
588: ["Mage Slayer", "mage_slayer"],
589: ["Mage Slayer", "mage_slayer"],
590: ["Mage Slayer", "mage_slayer"],
591: ["Mage Slayer", "mage_slayer"],
592: ["Mage Slayer", "mage_slayer"],
593: ["Mage Slayer", "mage_slayer"],
594: ["Mage Slayer", "mage_slayer"],
595: ["Mage Slayer", "mage_slayer"],
596: ["Mage Slayer", "mage_slayer"],
597: ["Eternal Shroud", "eternal_shroud"],
598: ["Eternal Shroud", "eternal_shroud"],
599: ["Eternal Shroud", "eternal_shroud"],
600: ["Eternal Shroud", "eternal_shroud"],
601: ["Eternal Shroud", "eternal_shroud"],
602: ["Eternal Shroud", "eternal_shroud"],
603: ["Overwhelming Blink", "overwhelming_blink"],
604: ["Swift Blink", "swift_blink"],
605: ["Arcane Blink", "arcane_blink"]
};

var ALIASES = {
"жугер":"Juggernaut","пудж":"Pudge","инвокер":"Invoker","сф":"Shadow Fiend",
"ам":"Anti-Mage","антимаг":"Anti-Mage","па":"Phantom Assassin","фантомка":"Phantom Assassin",
"сларк":"Slark","шторм":"Storm Spirit","зевс":"Zeus","лина":"Lina",
"дров":"Drow Ranger","снайпер":"Sniper","свен":"Sven","цм":"Crystal Maiden",
"кристалка":"Crystal Maiden","лк":"Wraith King","вр":"Vengeful Spirit",
"тини":"Tiny","тимбер":"Timbersaw","рубик":"Rubick","магнус":"Magnus",
"медуза":"Medusa","луна":"Luna","тайдер":"Tidehunter","войд":"Faceless Void",
"урса":"Ursa","слардар":"Slardar","цк":"Chaos Knight","некр":"Necrophos",
"дк":"Dragon Knight","тролль":"Troll Warlord","виса":"Visage",
"фурион":"Nature's Prophet","нп":"Nature's Prophet","эмбер":"Ember Spirit",
"морф":"Morphling","лайфстил":"Lifestealer","лич":"Lich","леш":"Leshrac",
"мирана":"Mirana","пак":"Puck","разор":"Razor","раста":"Shadow Shaman",
"течис":"Techies","трент":"Treant Protector","туск":"Tusk","вивер":"Winter Wyvern",
"виндра":"Windranger","вено":"Venomancer","аба":"Abaddon","алх":"Alchemist",
"квопа":"Queen of Pain","королева":"Queen of Pain","бейн":"Bane",
"визаж":"Visage","джакиро":"Jakiro","котел":"Keeper of the Light"
};

var SHORT = {
"Anti-Mage":"AM","Ancient Apparition":"AA","Arc Warden":"AW","Bounty Hunter":"BH",
"Bristleback":"BB","Crystal Maiden":"CM","Drow Ranger":"DR","Ember Spirit":"ES",
"Faceless Void":"FV","Keeper of the Light":"KotL","Legion Commander":"LC",
"Lifestealer":"LS","Lone Druid":"LD","Monkey King":"MK","Nature's Prophet":"NP",
"Night Stalker":"NS","Outworld Destroyer":"OD","Phantom Assassin":"PA",
"Phantom Lancer":"PL","Queen of Pain":"QoP","Shadow Fiend":"SF","Skywrath Mage":"SM",
"Spirit Breaker":"SB","Storm Spirit":"SS","Templar Assassin":"TA","Treant Protector":"TP",
"Vengeful Spirit":"VS","Wraith King":"WK","Winter Wyvern":"WW","Windranger":"WR",
"Shadow Shaman":"SS","Sand King":"SK","Dragon Knight":"DK","Death Prophet":"DP",
"Dark Willow":"DW","Dark Seer":"DS","Nyx Assassin":"NA","Void Spirit":"VS",
"Centaur Warrunner":"CW","Chaos Knight":"CK","Elder Titan":"ET","Gyrocopter":"GYRO",
"Ursa":"URSA","Underlord":"UL","Undying":"UND","Viper":"VIP","Visage":"VIS",
"Warlock":"WL","Weaver":"WEA","Bloodseeker":"BS","Beastmaster":"BM","Brewmaster":"BM",
"Broodmother":"BRO","Clinkz":"CL","Clockwerk":"CW","Enchantress":"ENCH","Enigma":"ENG",
"Jakiro":"JAK","Leshrac":"LESH","Magnus":"MAG","Medusa":"MED","Mirana":"MIRA",
"Morphling":"MORPH","Naga Siren":"NAGA","Necrophos":"NEC","Ogre Magi":"OGRE",
"Omniknight":"OMNI","Oracle":"ORA","Pangolier":"PANG","Phoenix":"PHX",
"Primal Beast":"PB","Pugna":"PUGNA","Razor":"RAZ","Rubick":"RUB","Slardar":"SLAR",
"Slark":"SLARK","Snapfire":"SNAP","Spectre":"SPEC","Terrorblade":"TB",
"Tidehunter":"TIDE","Timbersaw":"TIMB","Tinker":"TINK","Troll Warlord":"TW",
"Techies":"TECH","Mars":"MARS","Hoodwink":"HOOD","Dawnbreaker":"DAWN",
"Marci":"MARCI","Muerta":"MUERTA","Sniper":"SNIP","Juggernaut":"JUG",
"Pudge":"PUD","Invoker":"INV","Lina":"LINA","Zeus":"ZEUS","Sven":"SVEN",
"Luna":"LUNA","Tiny":"TINY","Axe":"AXE","Disruptor":"DISR","Silencer":"SIL",
"Doom":"DOOM","Dazzle":"DZ","Tusk":"TUSK"
};

var CDN_BASES = [
"https://cdn.cloudflare.steamstatic.com",
"https://cdn.akamai.steamstatic.com",
"https://cdn.steamstatic.com"
];

var PROXY = "https://wsrv.nl/?url=";

function shortName(name) {
if (!name) return "?";
if (SHORT[name]) return SHORT[name];
var w = String(name).split(/\s+/).filter(Boolean);
if (w.length === 1) return w[0].slice(0, 3).toUpperCase();
return w.slice(0, 3).map(function (x) { return x[0]; }).join("").toUpperCase();
}

function grad(name) {
var h = 0;
for (var i = 0; i < name.length; i++) h = (Math.imul(h, 31) + name.charCodeAt(i)) % 360;
var h2 = (h + 60) % 360;
return "linear-gradient(135deg, hsl(" + h + " 75% 42%), hsl(" + h2 + " 70% 26%))";
}

function heroUrls(slug) {
if (!slug) return [];
var urls = [];
for (var i = 0; i < CDN_BASES.length; i++) {
urls.push(CDN_BASES[i] + "/apps/dota2/images/dota_react/heroes/" + slug + ".png");
}
urls.push(PROXY + encodeURIComponent("[cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/](https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/)" + slug + ".png"));
return urls;
}

function itemUrls(slug) {
if (!slug) return [];
var urls = [];
for (var i = 0; i < CDN_BASES.length; i++) {
urls.push(CDN_BASES[i] + "/apps/dota2/images/dota_react/items/" + slug + ".png");
}
urls.push(PROXY + encodeURIComponent("[cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/](https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/)" + slug + ".png"));
return urls;
}

function makeImgWithFallback(urls, alt, fit) {
var img = document.createElement("img");
img.alt = alt || "";
img.loading = "lazy";
img.referrerPolicy = "no-referrer-when-downgrade";
img.crossOrigin = "anonymous";
img.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:" + (fit || "cover") + ";z-index:1;display:block;";
var idx = 0;
var dead = false;
function next() {
if (dead) return;
idx++;
if (idx < urls.length) { img.src = urls[idx]; }
else { dead = true; img.style.display = "none"; }
}
img.addEventListener("error", next);
img.addEventListener("load", function () {
if (img.naturalWidth === 0) next();
});
img.src = urls[0];
return img;
}

window.getHeroes = async function () { return HEROES.slice(); };

window.findHeroId = async function (q) {
if (!q) return null;
var s = q.trim().toLowerCase();
if (!s) return null;
var alias = ALIASES[s];
var needle = alias ? alias.toLowerCase() : s;
var list = await window.getHeroes();
for (var i = 0; i < list.length; i++) if (list[i].name.toLowerCase() === needle) return list[i];
for (var j = 0; j < list.length; j++) if (needle.length >= 3 && list[j].name.toLowerCase().indexOf(needle) >= 0) return list[j];
if (needle.length >= 4) for (var k = 0; k < list.length; k++) if (list[k].name.toLowerCase().indexOf(needle.slice(0, 4)) === 0) return list[k];
return null;
};

window.heroShort = shortName;
window.heroGradient = grad;

window.heroImgEl = function (hero, size, extra) {
size = size || 64;
var r = Math.max(8, Math.round(size * 0.14));
var wrap = document.createElement("div");
wrap.style.cssText =
"position:relative;flex-shrink:0;overflow:hidden;" +
"width:" + size + "px;height:" + size + "px;" +
"border-radius:" + r + "px;border:2px solid rgba(167,139,250,0.55);" +
"background:" + grad(hero ? hero.name : "?") + ";" +
"display:flex;align-items:center;justify-content:center;" + (extra || "");
var fb = document.createElement("div");
fb.style.cssText =
"position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" +
"font-size:" + Math.round(size * 0.34) + "px;font-weight:800;" +
"color:rgba(255,255,255,0.92);font-family:'JetBrains Mono',monospace;" +
"text-shadow:0 2px 6px rgba(0,0,0,0.55);pointer-events:none;user-select:none;z-index:0;";
fb.textContent = shortName(hero ? hero.name : "?");
wrap.appendChild(fb);
var slug = hero && (hero.slug || (function () {
for (var i = 0; i < HEROES.length; i++) if (HEROES[i].id === hero.id || HEROES[i].name === hero.name) return HEROES[i].slug;
return null;
})());
if (slug) wrap.appendChild(makeImgWithFallback(heroUrls(slug), hero.name, "cover"));
return wrap;
};

window.heroTileEl = function (hero, opts) {
opts = opts || {};
var wrap = document.createElement("div");
wrap.style.cssText =
"position:relative;width:100%;aspect-ratio:1/1;border-radius:10px;" +
"overflow:hidden;background:" + grad(hero ? hero.name : "?") + ";" +
"border:2px solid " + (opts.borderColor || "transparent") + ";";
var fb = document.createElement("div");
fb.style.cssText =
"position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" +
"font-size:15px;font-weight:800;color:rgba(255,255,255,0.92);" +
"font-family:'JetBrains Mono',monospace;pointer-events:none;z-index:0;";
fb.textContent = shortName(hero ? hero.name : "?");
wrap.appendChild(fb);
var slug = hero && (hero.slug || (function () {
for (var i = 0; i < HEROES.length; i++) if (HEROES[i].id === hero.id || HEROES[i].name === hero.name) return HEROES[i].slug;
return null;
})());
if (slug) wrap.appendChild(makeImgWithFallback(heroUrls(slug), hero.name, "cover"));
if (opts.kda) {
var kda = document.createElement("div");
kda.style.cssText =
"position:absolute;bottom:0;left:0;right:0;padding:4px;" +
"background:linear-gradient(0deg,rgba(0,0,0,0.9),transparent);" +
"font-size:9px;font-weight:700;color:#fff;text-align:center;" +
"font-family:'JetBrains Mono',monospace;z-index:2;";
kda.textContent = opts.kda;
wrap.appendChild(kda);
}
return wrap;
};

window.itemImgEl = function (item) {
var wrap = document.createElement("div");
wrap.style.cssText =
"position:relative;width:100%;aspect-ratio:1/1;border-radius:10px;" +
"overflow:hidden;background:var(--bg-elev);border:1px solid var(--border);" +
"display:flex;align-items:center;justify-content:center;";
if (!item) return wrap;
var short = item.short || "?";
var fb = document.createElement("div");
fb.style.cssText =
"position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" +
"font-size:11px;font-weight:800;color:rgba(255,255,255,0.55);" +
"font-family:'JetBrains Mono',monospace;text-align:center;padding:2px;z-index:0;";
fb.textContent = short;
wrap.appendChild(fb);
var slug = item.slug;
if (!slug && item.id && ITEMS[item.id]) slug = ITEMS[item.id][1];
if (!slug && item.name) {
slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "*").replace(/^*|_$/g, "");
}
if (slug) wrap.appendChild(makeImgWithFallback(itemUrls(slug), item.name, "contain"));
if (item.name) wrap.title = item.name;
return wrap;
};

window.getItemCatalog = async function () {
var map = {};
for (var id in ITEMS) {
map[id] = { id: parseInt(id, 10), name: ITEMS[id][0], slug: ITEMS[id][1], short: (function (n) {
var w = n.split(/\s+/).filter(Boolean);
if (w.length === 1) return w[0].slice(0, 4).toUpperCase();
return w.slice(0, 4).map(function (x) { return x[0]; }).join("").toUpperCase();
})(ITEMS[id][0]) };
}
return map;
};

window.cdnUrlVariants = function () { return []; };
window.makeSmartImg = function () { return null; };
window.normalizeCdnPath = function (p) { return p || ""; };
window.cdnEnabled = function () { return true; };

window.percentileOf = function (bench, key, value) {
if (!bench || !bench[key] || !Array.isArray(bench[key])) return null;
var arr = bench[key].slice().sort(function (a, b) { return (a.percentile || 0) - (b.percentile || 0); });
if (!arr.length) return null;
var v0 = arr[0].value || 0, vN = arr[arr.length - 1].value || 0;
if (value <= v0) return (arr[0].percentile || 0) * 100;
if (value >= vN) return (arr[arr.length - 1].percentile || 0) * 100;
for (var i = 1; i < arr.length; i++) {
var a = arr[i - 1], b = arr[i];
var av = a.value || 0, bv = b.value || 0;
if (value <= bv) {
var d = bv - av;
if (d === 0) return (b.percentile || 0) * 100;
var frac = (value - av) / d;
var pa = a.percentile || 0, pb = b.percentile || 0;
return (pa + frac * (pb - pa)) * 100;
}
}
return null;
};

window.pctGrade = function (p) {
if (p === null || p === undefined) return "-";
if (p >= 90) return "S";
if (p >= 75) return "A";
if (p >= 50) return "B";
if (p >= 25) return "C";
return "D";
};

window.pctColor = function (p) {
if (p === null || p === undefined) return "var(--text-dim)";
if (p >= 75) return "var(--green)";
if (p >= 50) return "var(--yellow)";
if (p >= 25) return "var(--orange)";
return "var(--red)";
};

console.log("fallback v7 ready");
})();