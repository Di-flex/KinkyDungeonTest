"use strict";

let KDDoorKnobChance = 0.1; // Chance to open door with mitts and arms bound
let KDDoorKnobChanceArms = 0.5; // Chance to open door with mitts but no arm bindings
let KDDoorAttractChance = 0.25; // Chance to attract someone by banging
let KDDoorAttractChanceArms = 0.1; // Chance to attract someone by rattling

/** These weapons can get removed if you start the game with them*/
let kdStartWeapons = ["Knife", "Dirk", "Sword", "Shield"];

let KDPerkParams = {
	KDEnemyDamageMult: 2.5, // Increase in enemy damage effect
	KDEnemyResistBuff: 0.85, // Buff to tease damage
	KDEnemyArmorBoost: 2.0, // Extra armor enemies get
};

let KDCategoriesStart = [
	{name: "Toggles", buffs: [], debuffs: [],},
	{name: "Multiclass", buffs: [], debuffs: [],},
	{name: "Major", buffs: [], debuffs: [],},
	{name: "Restraints", buffs: [], debuffs: [],},
	{name: "Kinky", buffs: [], debuffs: [],},
	{name: "Damage", buffs: [], debuffs: [],},
	{name: "Senses", buffs: [], debuffs: [],},
	{name: "Combat", buffs: [], debuffs: [],},
	{name: "Magic", buffs: [], debuffs: [],},
	{name: "Enemies", buffs: [], debuffs: [],},
	{name: "Common", buffs: [], debuffs: [],},
	{name: "Map", buffs: [], debuffs: [],},
	{name: "Start", buffs: [], debuffs: [],},
	{name: "Boss", buffs: [], debuffs: [],},
];

let KDPerkIcons = {
	"Pacifist" : () => {return true;},
	"BerserkerRage" : () => {return true;},
	"BoundPower" : () => {return true;},
	"UnstableMagic" : () => {return true;},
	"BurningDesire" : () => {return true;},
	"FrigidPersonality" : () => {return true;},
	"ImmovableObject" : () => {return KinkyDungeonStatWill >= KinkyDungeonStatWillMax * 0.90;},
	"GroundedInReality" : () => {return KinkyDungeonPlayerDamage && KinkyDungeonStatMana >= KinkyDungeonStatManaMax * 0.999;},
	"LikeTheWind" : () => {return KinkyDungeonStatStamina >= KinkyDungeonStatStaminaMax * 0.95;},
	"LeastResistance" : () => {return KinkyDungeonStatWill < KinkyDungeonStatWillMax * 0.01;},
	//"DistractionCast" : () => {return KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.99;},
};

let KDPerkUpdateStats = {
	"Rigger": () => {
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "Rigger1",
			type: "glueDamageBuff",
			power: KDRiggerDmgBoost,
			duration: 2
		});
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "Rigger2",
			type: "chainDamageBuff",
			power: KDRiggerDmgBoost,
			duration: 2
		});
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "Rigger3",
			type: "BindAmp",
			power: KDRiggerBindBoost,
			duration: 2
		});
	},
	"Ticklish": () => {
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "Ticklish", type: "tickleDamageResist", power: -0.5, duration: 2
		});
	},
	"Stoic": () => {
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "Stoic", type: "tickleDamageResist", power: 0.82, duration: 2
		});
	},
	"Lascivious": () => {
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "Lascivious", type: "gropeDamageResist", power: -0.5, duration: 2
		});
	},
	"Unperturbed": () => {
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "Unperturbed", type: "gropeDamageResist", power: 0.82, duration: 2
		});
	},
	"PainTolerance": () => {
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "PainTolerance", type: "painDamageResist", power: 2.0, duration: 2
		});
	},
	"Sticky": () => {
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "StickySituation", type: "glueDamageResist", power: -0.4, duration: 2
		});
	},
	"EnemyResist": () => {
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "EnemyResist", type: "TeaseBuff", power: KDPerkParams.KDEnemyResistBuff, duration: 2
		});
		/*KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "EnemyResist1", type: "soulDamageBuff", power: KDEnemyResistBuff, duration: 2
		});
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "EnemyResist2", type: "tickleDamageBuff", power: KDEnemyResistBuff, duration: 2
		});
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "EnemyResist3", type: "painDamageBuff", power: KDEnemyResistBuff, duration: 2
		});
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "EnemyResist4", type: "gropeDamageBuff", power: KDEnemyResistBuff, duration: 2
		});
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "EnemyResist5", type: "charmDamageBuff", power: KDEnemyResistBuff, duration: 2
		});*/
	},
	"BoundPower": () => {
		KDDamageAmpPerks += KDBoundPowerLevel *  KDBoundPowerMult;
	},
	"BerserkerRage": () => {
		KDDamageAmpPerksMelee += KDBerserkerAmp * KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax;
	},
	"Dodge": () => {
		if (KinkyDungeonMiscastChance < 0.001) {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: "FocusedDodge", type: "Evasion", power: 0.4, duration: 1, sfxApply: "Fwoosh"
			});
		}
	},
	"UnstableMagic": () => {
		KDDamageAmpPerksSpell += KDUnstableAmp * Math.min(1, Math.max(KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax, KinkyDungeonMiscastChance));
	},

	"CommonLatex": () => {
		KDExtraEnemyTags.latexRestraints = 0;
		KDExtraEnemyTags.latexRestraintsHeavy = 3;
	},
	"CommonLeather": () => {
		KDExtraEnemyTags.leatherRestraints = 0;
		KDExtraEnemyTags.leatherRestraintsHeavy = 3;
	},
	"CommonMaid": () => {
		KDExtraEnemyTags.maidRestraints = 0;
		KDExtraEnemyTags.maidVibeRestraintsLimited = 0;
	},
	"CommonWolf": () => {
		KDExtraEnemyTags.wolfRestraints = 0;
		KDExtraEnemyTags.wolfCuffs = 3;
		KDExtraEnemyTags.wolfGear = 0;
	},
	"CommonDress": () => {
		KDExtraEnemyTags.dressRestraints = 0;
	},
	"CommonFuuka": () => {
		KDExtraEnemyTags.mikoRestraints = 0;
	},
	"CommonCyber": () => {
		KDExtraEnemyTags.cyberdollrestraints = 0;
		KDExtraEnemyTags.cyberdollchastity = 3;
		KDExtraEnemyTags.cyberdollheavy = 7;
	},
	"CommonExp": () => {
		KDExtraEnemyTags.expRestraints = 0;
	},
	"CommonKitty": () => {
		KDExtraEnemyTags.kittyRestraints = 0;
	},
};

/**
 * @type {Record<string, () => string>}
 */
let KDPerkCount = {
	"BerserkerRage": () => {
		return " "
			+ (KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax > 0.25 ? "! " : "")
			+ (KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax > 0.5 ? "! " : "")
			+ (KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax > 0.75 ? "! " : "");
	},
	"UnstableMagic": () => {
		return " "
			+ (KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax > 0.25 ? "! " : "")
			+ (KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax > 0.5 ? "! " : "")
			+ (KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax > 0.75 ? "! " : "");
	},
	"BoundPower": () => {
		return KDBoundPowerLevel > 0 ? Math.round(KDBoundPowerLevel * 100) + "%" : "";
	},
};

/**
 * @type {Record<string, KDPerk>}
 */
let KinkyDungeonStatsPresets = {
	"MC_Fighter":  {category: "Multiclass", id: "MC_Fighter", debuff: true, cost: 2, blockclass: ["Fighter"], tags: ["start", "mc"]},
	"MC_Rogue":  {category: "Multiclass", id: "MC_Rogue", cost: 2, blockclass: ["Rogue"], tags: ["start", "mc"]},
	"MC_Wizard":  {category: "Multiclass", id: "MC_Wizard", debuff: true, cost: 2, blockclass: ["Mage"], tags: ["start", "mc"]},
	"MC_Peasant":  {category: "Multiclass", id: "MC_Peasant", debuff: true, cost: 1, blockclass: ["Peasant"], tags: ["start", "mc"]},
	"MC_Trainee":  {category: "Multiclass", id: "MC_Trainee", cost: 2, requireArousal: true, blockclass: ["Trainee"], tags: ["start", "mc"]},

	"NovicePet":  {category: "Major", id: "NovicePet", cost: 1},
	"CurseSeeker":  {category: "Major", id: "CurseSeeker", cost: -3},
	"FutileStruggles":  {category: "Restraints", id: "FutileStruggles", cost: -1},
	"SecondWind":  {category: "Restraints", id: "SecondWind", cost: 1},

	"Stranger": {startPriority: 1000, category: "Enemies", id: "Stranger", cost: 0, block: ["WrongNeighborhood"], tags: ["start"]},
	"WrongNeighborhood": {startPriority: 1000, category: "Major", id: "WrongNeighborhood", cost: -1, block: ["Stranger"], tags: ["start"]},

	"Strong": {category: "Restraints", id: 0, cost: 2, block: ["Weak"]},
	"Weak": {category: "Restraints", id: 1, cost: -1, block: ["Strong"]},
	"Flexible": {category: "Restraints", id: 2, cost: 2, block: ["Inflexible"]},
	"Inflexible": {category: "Restraints", id: 3, cost: -1, block: ["Flexible"]},
	"Locksmith": {category: "Restraints", id: 4, cost: 2, block: ["Clueless"]},
	"Clueless": {category: "Restraints", id: 5, cost: -1, block: ["Locksmith"]},
	"HighSecurity": {category: "Restraints", id: 48, cost: -1},
	//"SearchParty": {category: "Enemies", id: 51, cost: -1},
	"NoWayOut": {category: "Restraints", id: 52, cost: -1},
	"TightRestraints": {category: "Restraints", id: 54, cost: -1},
	"MagicHands": {category: "Restraints", id: "MagicHands", cost: -1},
	"CursedLocks": {category: "Restraints", id: "CursedLocks", cost: -1},
	"FranticStruggle": {category: "Restraints", id: "FranticStruggle", cost: 1},
	"Unchained": {category: "Kinky", id: 26, cost: 2, block: ["Damsel"]},
	"Damsel": {category: "Kinky", id: 27, cost: -1, block: ["Unchained"]},
	"Artist": {category: "Kinky", id: 28, cost: 2, block: ["Bunny"]},
	"Bunny": {category: "Kinky", id: 29, cost: -1, block: ["Artist"]},
	"Slippery": {category: "Kinky", id: 30, cost: 2, block: ["Doll"]},
	"Doll": {category: "Kinky", id: 31, cost: -1, block: ["Slippery"]},
	"Escapee": {category: "Kinky", id: 32, cost: 2, block: ["Dragon"]},
	"Dragon": {category: "Kinky", id: 33, cost: -1, block: ["Escapee"]},
	"Dodge": {category: "Combat", id: 18, cost: 3, block: ["Distracted"]},
	"Distracted": {category: "Combat", id: 19, cost: -1, block: ["Dodge"]},
	"Submissive": {startPriority: 0, category: "Kinky", id: 10, cost: 0},
	"Wanted": {category: "Kinky", id: 11, cost: -1},
	"QuickDraw": {category: "Combat", id: 55, cost: 1, block: ["Disorganized"]},
	"Disorganized": {category: "Combat", id: 57, cost: -2, block: ["QuickDraw", "QuickScribe"]},
	"Brawler": {category: "Combat", id: 20, cost: 1},
	"Clumsy": {category: "Combat", id: 21, cost: -1},
	"Unfocused": {category: "Combat", id: "Unfocused", cost: -1},
	"HeelWalker": {category: "Combat", id: 53, cost: 1},
	"BondageLover": {category: "Kinky", id: 15, cost: -1},
	"Undeniable": {category: "Kinky", id: "Undeniable", cost: -1},
	"Needs": {category: "Kinky", id: "Needs", cost: -1},
	"BoundPower": {category: "Combat", id: 40, cost: 3},
	"SavourTheTaste": {category: "Combat", id: "SavourTheTaste", cost: -1},
	"ResilientFoes": {category: "Enemies", id: "ResilientFoes", cost: -1},
	"KillSquad": {category: "Major", id: 41, cost: -3, block: ["Conspicuous"]},
	"Stealthy": {category: "Major", id: 38, cost: 0},
	"HighProfile": {category: "Major", id: "HighProfile", cost: 0},
	"Conspicuous": {category: "Enemies", id: 39, cost: -1, block: ["KillSquad"]},
	"Dominant": {category: "Map", id: "Dominant", cost: 2, block: ["Oppression"]},
	"Oppression": {category: "Map", id: 50, cost: -1, block: ["Dominant"]},
	"Supermarket": {category: "Map", id: 42, cost: 1},
	"PriceGouging": {category: "Map", id: 43, cost: -2},
	"Psychic": {category: "Restraints", id: 6, cost: 4},
	"Slayer": {category: "Magic", id: 34, cost: 3},
	//"Narcoleptic": {category: "Combat", id: 37, cost: -4},
	"Magician": {category: "Magic", id: 36, cost: 3},
	"Pristine": {category: "Map", id: 22, cost: -1},
	"Conjurer": {category: "Magic", id: 35, cost: 3},
	"LostTechnology": {category: "Major", buff: true, id: 23, cost: -1},
	//"Blessed": {category: "Map", id: 8, cost: 1},
	"Cursed": {category: "Major", id: 9, cost: -3},
	"Studious": {category: "Magic", id: 12, cost: 1, tags: ["start"]},
	//"Novice": {category: "Magic", id: 7, cost: -1},
	//"Meditation": {category: "Magic", id: 13, cost: 2},
	//"DistractionCast":  {category: "Magic", id: "DistractionCast", cost: 2},
	"Clearheaded":  {category: "Magic", id: "Clearheaded", cost: 1, block: ["ArousingMagic"]},
	"ArousingMagic":  {category: "Magic", id: "ArousingMagic", cost: -1, block: ["Clearheaded"]},
	//"QuickScribe": {category: "Magic", id: 56, cost: 1, block: ["Disorganized"]},
	"BerserkerRage": {category: "Combat", id: "BerserkerRage", cost: 3},
	"UnstableMagic": {category: "Magic", id: "UnstableMagic", cost: 2},
	"Vengeance": {category: "Enemies", id: "Vengeance", cost: -1},
	"AbsoluteFocus": {category: "Magic", id: "AbsoluteFocus", cost: -1},

	"SelfBondage": {category: "Start", id: "SelfBondage", cost: 0, tags: ["start"]},

	"Hogtied": {startPriority: 50, category: "Start", id: "Hogtied", cost: -1, tags: ["start"]},
	"StartObsidian": {startPriority: 5, category: "Start", id: "StartObsidian", cost: -2, outfit: "Obsidian", tags: ["start"]},
	"StartWolfgirl": {startPriority: 10, category: "Start", id: "StartWolfgirl", cost: -2, outfit: "Wolfgirl", tags: ["start"]},
	"StartMaid": {startPriority: 20, category: "Start", id: "StartMaid", cost: -2, outfit: "Maid", tags: ["start"]},
	"StartLatex": {startPriority: 15, category: "Start", id: "StartLatex", cost: -2, tags: ["start"]},

	"StartCyberDoll": {startPriority: 7, category: "Boss", id: "StartCyberDoll", cost: -2, locked: true, tags: ["start"]},

	"DollmakerVisor": {startPriority: 31, category: "Boss", id: "DollmakerVisor", cost: -1, block: ["DollmakerMask"], locked: true, tags: ["start"]},
	"DollmakerMask": {startPriority: 31, category: "Boss", id: "DollmakerMask", cost: -1, block: ["DollmakerVisor"], locked: true, tags: ["start"]},
	"FuukaCollar": {startPriority: 40, category: "Boss", buff: true, id: "FuukaCollar", cost: -2, locked: true, tags: ["start"]},


	"CommonCyber": {category: "Boss", id: "CommonCyber", cost: -1, locked: true},
	"CommonFuuka": {category: "Boss", id: "CommonFuuka", buff: true, cost: -1, locked: true},

	"Nowhere": {category: "Enemies", id: "Nowhere", cost: -1},
	"StunBondage": {category: "Enemies", id: "StunBondage", cost: -2},
	"Prisoner": {category: "Start", id: "Prisoner", cost: 0},

	"Panic": {category: "Map", id: "Panic", cost: -1},
	"Panic2": {category: "Map", id: "Panic2", cost: -1},

	"Rusted": {category: "Map", id: "Rusted", cost: 1},


	"Unmasked": {category: "Toggles", id: "Unmasked", cost: 0, tags: ["start"]},
	"NoNurse": {category: "Toggles", id: "NoNurse", cost: 0, tags: ["start"]},
	"NoPolice": {category: "Toggles", id: "NoPolice", cost: 0, tags: ["start"]},
	"NoBrats": {category: "Toggles", id: "NoBrats", cost: 0, tags: ["start"], debuff: true, block: ["OnlyBrats"]},
	"OnlyBrats": {category: "Toggles", id: "OnlyBrats", cost: 0, tags: ["start"], debuff: true, block: ["NoBrats"]},
	"TapePref": {category: "Toggles", id: "TapePref", cost: 0, tags: ["start"], block: ["TapeOptout"]},
	"TapeOptout": {category: "Toggles", id: "TapeOptout", cost: 0, tags: ["start"], debuff: true, block: ["TapePref"]},
	"NoDoll": {category: "Toggles", id: "NoDoll", cost: 0, tags: ["start"], debuff: true},

	"Quickness": {category: "Combat", id: "Quickness", cost: 2},

	"BoundCrusader": {category: "Kinky", id: "BoundCrusader", cost: -1},

	"Trespasser": {category: "Map", id: "Trespasser", cost: -2},


	"Butterfingers":  {category: "Restraints", id: "Butterfingers", cost: -1},
	"WeakGrip":  {category: "Restraints", id: "WeakGrip", cost: -1},


	"Blackout":  {category: "Senses", id: "Blackout", cost: -1, block: ["TotalBlackout"]},
	"TotalBlackout":  {category: "Senses", id: "TotalBlackout", cost: -2, block: ["Blackout", "Forgetful"]},
	"Forgetful": {category: "Senses", id: "Forgetful", cost: -1, block: ["TotalBlackout"]},
	"NightOwl": {category: "Senses", id: "NightOwl", cost: 2},
	"Nearsighted": {category: "Senses", id: "Nearsighted", cost: -1, block: ["ArchersEye"]},
	"KeenHearing": {category: "Senses", id: "KeenHearing", cost: 1},
	"ArchersEye": {category: "Senses", id: "ArchersEye", cost: 1, block: ["Nearsighted"]},

	"Incantation":  {category: "Magic", id: "Incantation", cost: -1},


	"Stoic":  {category: "Damage", id: "Stoic", cost: 1, block: ["Ticklish"]},
	"Ticklish":  {category: "Damage", id: "Ticklish", cost: -1, block: ["Stoic"]},
	"Unperturbed":  {category: "Damage", id: "Unperturbed", cost: 1, block: ["Lascivious"]},
	"Lascivious":  {category: "Damage", id: "Lascivious", cost: -1, block: ["Unperturbed"]},
	"Masochist":  {category: "Damage", id: "Masochist", cost: -1},
	"PainTolerance":  {category: "Damage", id: "PainTolerance", cost: 1},

	"Rigger": {category: "Damage", id: 24, cost: 2},
	"Pacifist": {category: "Major", buff: true, id: 25, cost: -2},
	"EnemyResist": {category: "Enemies", id: "EnemyResist", cost: 0},
	"EnemyArmor": {category: "Enemies", id: "EnemyArmor", cost: -1},
	"EnemyDamage": {category: "Enemies", id: "EnemyDamage", cost: -1},
	"BurningDesire":  {category: "Damage", id: "BurningDesire", cost: 1},
	"FrigidPersonality":  {category: "Damage", id: "FrigidPersonality", cost: 2},
	"GroundedInReality":  {category: "Damage", id: "GroundedInReality", cost: 2},
	"LikeTheWind":  {category: "Damage", id: "LikeTheWind", cost: 1},
	"ImmovableObject":  {category: "Damage", id: "ImmovableObject", cost: 2},
	"LeastResistance":  {category: "Damage", id: "LeastResistance", cost: 1},

	"Sticky":  {category: "Damage", id: "Sticky", cost: -1},
	"Breathless":  {category: "Damage", id: "Breathless", cost: -1},

	"CommonMaid": {category: "Common", id: "CommonMaid", cost: -1, costGroup: "common"},
	"CommonLatex": {category: "Common", id: "CommonLatex", cost: -1, costGroup: "common"},
	"CommonLeather": {category: "Common", id: "CommonLeather", cost: -1, costGroup: "common"},
	"CommonExp": {category: "Common", id: "CommonExp", cost: -1, costGroup: "common"},
	"CommonDress": {category: "Common", id: "CommonDress", cost: -1, costGroup: "common"},
	"CommonWolf": {category: "Common", id: "CommonWolf", cost: -1, costGroup: "common"},
	"CommonKitty": {category: "Common", id: "CommonKitty", cost: -1, costGroup: "common"},

	"KeepOutfit":  {category: "Kinky", id: "KeepOutfit", cost: 0},

	"KinkyPrison":  {category: "Map", id: "KinkyPrison", cost: -1},
	"Doorknobs":  {category: "Map", id: "Doorknobs", cost: -1},


	"MapLarge": {category: "Map", id: "MapLarge", cost: 0, tags: ["start", "mapsize"], blocktags: ["mapsize"]},
	"MapHuge": {category: "Map", id: "MapHuge", cost: 0, tags: ["start", "mapsize"], blocktags: ["mapsize"]},
	"MapGigantic": {category: "Map", id: "MapGigantic", cost: 0, tags: ["start", "mapsize"], blocktags: ["mapsize"]},
};



function KDGetPerkCost(perk) {
	if (!perk) return 0;
	if (!perk.costGroup) return perk.cost;
	let costGroups = {};
	let first = false;
	// Only the first one has a cost
	for (let p of KinkyDungeonStatsChoice.keys()) {
		if (KinkyDungeonStatsPresets[p] && KinkyDungeonStatsPresets[p].costGroup) {
			if (!first) {
				first = true;
				if (KinkyDungeonStatsPresets[p].id == perk.id) {
					return KinkyDungeonStatsPresets[p].cost;
				}
			}
			costGroups[KinkyDungeonStatsPresets[p].costGroup] = KinkyDungeonStatsPresets[p].cost;
		}
	}
	if (costGroups[perk.costGroup] != undefined && perk.cost >= costGroups[perk.costGroup]) return 0;
	else return perk.cost;
}

function KinkyDungeonGetStatPoints(Stats) {
	let total = KinkyDungeonStatsChoice.get("hardperksMode") ? -10 : (KinkyDungeonStatsChoice.get("perksMode") ? 10 : 0);
	for (let k of Stats.keys()) {
		if (Stats.get(k)) {
			if (KinkyDungeonStatsPresets[k]) {
				total -= KDGetPerkCost(KinkyDungeonStatsPresets[k]);
			}
		}
	}
	return total;
}
/**
 * Determine if a perk can be picked with a certain number of points remaining
 * @param {string} Stat
 * @param {number} [points]
 * @returns {boolean}
 */
function KinkyDungeonCanPickStat(Stat, points) {
	let stat = KinkyDungeonStatsPresets[Stat];
	if (!stat) return false;
	if (KDGetPerkCost(stat) > 0 && (points != undefined ? points : KinkyDungeonGetStatPoints(KinkyDungeonStatsChoice)) < KDGetPerkCost(stat)) return false;
	if (!KDValidatePerk(stat)) return false;
	for (let k of KinkyDungeonStatsChoice.keys()) {
		if (KinkyDungeonStatsChoice.get(k)) {
			if (KinkyDungeonStatsPresets[k] && KinkyDungeonStatsPresets[k].block && KinkyDungeonStatsPresets[k].block.includes(Stat)) {
				return false;
			}
			if (KinkyDungeonStatsPresets[k] && stat.tags && KinkyDungeonStatsPresets[k].blocktags) {
				for (let t of KinkyDungeonStatsPresets[k].blocktags)
					if (stat.tags.includes(t)) return false;
			}
		}
	}
	return true;
}

/**
 * General validation for a perk
 * @param {KDPerk} stat
 * @returns {boolean}
 */
function KDValidatePerk(stat) {
	if (stat.requireArousal && !KinkyDungeonStatsChoice.get("arousalMode")) return false;
	if (stat.blockclass) {
		for (let t of stat.blockclass)
			if (KinkyDungeonClassMode == t) return false;
	}
	return true;
}

/**
 * @param {string} perk1
 * @param {string} perk2
 * @returns {boolean}
 * Determines if perk1 is blocked by another perk or in general */
function KDPerkBlocked(perk1, perk2) {
	if (KinkyDungeonStatsPresets[perk2] && KinkyDungeonStatsPresets[perk1]) {
		if (!KDValidatePerk(KinkyDungeonStatsPresets[perk1])) return false;
		if (KinkyDungeonStatsPresets[perk2].block && KinkyDungeonStatsPresets[perk2].block.includes(perk1)) {
			return true;
		}
		if (KinkyDungeonStatsPresets[perk2] && KinkyDungeonStatsPresets[perk1].tags && KinkyDungeonStatsPresets[perk2].blocktags) {
			for (let t of KinkyDungeonStatsPresets[perk2].blocktags)
				if (KinkyDungeonStatsPresets[perk1].tags.includes(t)) return true;
		}
	}
	return false;
}

function KinkyDungeonCanUnPickStat(Stat) {
	let stat = KinkyDungeonStatsPresets[Stat];
	if (!stat) return false;
	if (KDGetPerkCost(stat) < 0 && KinkyDungeonGetStatPoints(KinkyDungeonStatsChoice) < -KDGetPerkCost(stat)) return false;
	for (let k of KinkyDungeonStatsChoice.keys()) {
		if (KinkyDungeonStatsChoice.get(k)) {
			if (KinkyDungeonStatsPresets[k] && KinkyDungeonStatsPresets[k].require == Stat) {
				return false;
			}
		}
	}
	return true;
}


let KDPerkStart = {
	Studious: () => {
		KinkyDungeonSpellPoints += 3;
	},

	Submissive: () => {
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("BasicCollar"), 0, true, "Red", false, undefined, undefined, undefined, true);
	},
	Pacifist: () =>{
		KinkyDungeonInventoryAddWeapon("Rope");
	},
	Rigger: () =>{
		KinkyDungeonInventoryAddWeapon("Rope");
		KinkyDungeonInventoryAddWeapon("Scissors");
	},
	Unchained: () =>{
		KinkyDungeonRedKeys += 1;
	},

	FuukaCollar: () =>{
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar"), 0, true, undefined, false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoDress"), 0, true, undefined, false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoGag"), 0, true, undefined, false, undefined, undefined, undefined, true);
	},
	Prisoner: () =>{
		KDGameData.PrisonerState = 'parole';
	},
	Slayer: () =>{
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("Firebolt"));
		KinkyDungeonSpellChoices[0] = KinkyDungeonSpells.length - 1;
	},
	Conjurer: () =>{
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("ChainBolt"));
		KinkyDungeonSpellChoices[0] = KinkyDungeonSpells.length - 1;
	},
	Magician: () =>{
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("Dagger"));
		KinkyDungeonSpellChoices[0] = KinkyDungeonSpells.length - 1;
	},
	Brawler: () =>{
		KinkyDungeonInventoryAddWeapon("Knife");
		KDSetWeapon("Knife");
		KinkyDungeonGetPlayerWeaponDamage(KinkyDungeonCanUseWeapon());
	},
	NovicePet: () =>{
		KinkyDungeonInventoryAddLoose("MagicPetsuit");
	},
	SelfBondage: () =>{
		if (KinkyDungeonStatsChoice.get("arousalMode")) {
			KinkyDungeonInventoryAddLoose("TrapBelt");
			KinkyDungeonInventoryAddLoose("TrapVibe");
			KinkyDungeonInventoryAddLoose("TrapPlug");
		}
		if (KinkyDungeonStatsChoice.get("arousalModePlug")) {
			KinkyDungeonInventoryAddLoose("RearVibe1");
		}
		KinkyDungeonInventoryAddLoose("TrapCuffs");
		KinkyDungeonInventoryAddLoose("TrapGag");
		KinkyDungeonInventoryAddLoose("TrapBlindfold");
		KinkyDungeonInventoryAddLoose("TrapArmbinder");
		KinkyDungeonInventoryAddLoose("RopeSnakeArmsBoxtie");
		KinkyDungeonInventoryAddLoose("RopeSnakeArmsWrist");
		KinkyDungeonInventoryAddLoose("RopeSnakeLegs");
		KinkyDungeonInventoryAddLoose("RopeSnakeFeet");
		KinkyDungeonInventoryAddLoose("SturdyLeatherBeltsArms");
		KinkyDungeonInventoryAddLoose("SturdyLeatherBeltsLegs");
		KinkyDungeonInventoryAddLoose("SturdyLeatherBeltsFeet");
	},
	StartLatex: () =>{
		KinkyDungeonChangeRep("Latex", 10);
		KinkyDungeonAddRestraintIfWeaker("LatexCatsuit", 5, true, "Red", false, undefined, undefined, "Jail", true);
		for (let i = 0; i < 30; i++) {
			let r = KinkyDungeonGetRestraint({tags: ["latexRestraints", "latexStart", "latexCollar", "latexRestraintsForced"]}, 12, "grv", true, "Red");
			if (r)
				KinkyDungeonAddRestraintIfWeaker(r, 0, true, r.Group == "ItemNeck" ? "Blue" : "Purple", undefined, undefined, undefined, "Jail", true);
		}
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("KiguMask"), 0, true, "Purple");
	},
	DollmakerVisor: () =>{
		KinkyDungeonAddRestraintIfWeaker("DollmakerVisor", 5, true, "Gold", false, undefined, undefined, undefined, true);
	},
	DollmakerMask: () =>{
		KinkyDungeonAddRestraintIfWeaker("DollmakerMask", 5, true, "Gold", false, undefined, undefined, undefined, true);
	},
	StartCyberDoll: () =>{
		KinkyDungeonChangeRep("Metal", 10);
		KinkyDungeonAddRestraintIfWeaker("ControlHarness", 5, true, "Blue", false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker("TrackingCollar", 5, true, "Blue", false, undefined, undefined, undefined, true);


		KinkyDungeonAddRestraintIfWeaker("CyberBelt", 5, true, "Blue", false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker("CyberBra", 5, true, "Blue", false, undefined, undefined, undefined, true);

		KinkyDungeonAddRestraintIfWeaker("CyberHeels", 5, true, "Blue", false, undefined, undefined, undefined, true);
		//KinkyDungeonAddRestraintIfWeaker("CyberBallGag", 5, true, "Red", false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker("CyberPlugGag", 5, true, "Red", false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker("CyberMuzzle", 5, true, "Red", false, undefined, undefined, undefined, true);
		//KinkyDungeonAddRestraintIfWeaker("DollmakerVisor", 5, true, "Gold", false, undefined, undefined, undefined, true);



		KinkyDungeonAddRestraintIfWeaker("CyberArmCuffs", 5, true, "Blue", false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker("CyberLegCuffs", 5, true, "Blue", false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker("CyberAnkleCuffs", 5, true, "Blue", false, undefined, undefined, undefined, true);

		//KinkyDungeonAddRestraintIfWeaker("CyberDollJacket", 5, true, "Red", false, undefined, undefined, undefined, true);

		KinkyDungeonSetDress("CyberDoll", "CyberDoll");
	},
	StartMaid: () =>{
		KDChangeFactionRelation("Player", "Maidforce", 0.2 - KDFactionRelation("Player", "Maidforce"), true);
		for (let i = 0; i < 30; i++) {
			let r = KinkyDungeonGetRestraint({tags: ["maidRestraints", "maidVibeRestraints", "noMaidJacket", "handcuffer"]}, 12, "grv", true, "Purple");
			if (r)
				KinkyDungeonAddRestraintIfWeaker(r, 0, true, r.Group == "ItemNeck" ? "Blue" : "Purple", undefined, undefined, undefined, undefined, true);
		}
		let outfit = {name: "Maid", id: KinkyDungeonGetItemID(), type: Outfit};
		if (!KinkyDungeonInventoryGet("Maid")) KinkyDungeonInventoryAdd(outfit);
		//if (KinkyDungeonInventoryGet("Default")) KinkyDungeonInventoryRemove(KinkyDungeonInventoryGet("Default"));
		KinkyDungeonSetDress("Maid", "Maid");
	},
	StartWolfgirl: () =>{
		KDChangeFactionRelation("Player", "Nevermere", 0.2 - KDFactionRelation("Player", "Nevermere"), true);
		for (let i = 0; i < 30; i++) {
			let r = KinkyDungeonGetRestraint({tags: (i < (KinkyDungeonStatsChoice.has("NoWayOut") ? 3 : 1) ? ["wolfCuffs"] : ["wolfGear", "wolfRestraints"])}, 12, "grv", true, "Red");
			if (r) {
				KinkyDungeonAddRestraintIfWeaker(r, 0, true, r.Group == "ItemNeck" ? "Blue" : "Red", undefined, undefined, undefined, undefined, true);
				if (r.Link) {
					let newRestraint = KinkyDungeonGetRestraintByName(r.Link);
					KinkyDungeonAddRestraintIfWeaker(newRestraint, 0, true, "Red", undefined, undefined, undefined, undefined, true);
				}
			}
		}
		KDAddQuest("WolfgirlHunters");
		let outfit = {name: "Wolfgirl", id: KinkyDungeonGetItemID(), type: Outfit};
		if (!KinkyDungeonInventoryGet("Wolfgirl")) KinkyDungeonInventoryAdd(outfit);
		//if (KinkyDungeonInventoryGet("Default")) KinkyDungeonInventoryRemove(KinkyDungeonInventoryGet("Default"));
		KinkyDungeonSetDress("Wolfgirl", "Wolfgirl");
	},
	StartObsidian: () =>{
		KDChangeFactionRelation("Player", "Elemental", 0.2 - KDFactionRelation("Player", "Elemental"), true);
		for (let i = 0; i < 30; i++) {
			let r = KinkyDungeonGetRestraint({tags: ["obsidianRestraints", "ornateChastity", "genericToys"]}, 12, "grv", true, "Red");
			if (r) {
				KinkyDungeonAddRestraintIfWeaker(r, 0, true, r.Group == "ItemNeck" ? "Blue" : "Purple", false, undefined, undefined, undefined, true);
				let item = r;
				for (let j = 0; j < 2; j++) {
					if (item && item.Link) {
						let newRestraint = KinkyDungeonGetRestraintByName(item.Link);
						KinkyDungeonAddRestraintIfWeaker(newRestraint, 0, true, "Purple", undefined, undefined, undefined, undefined, true);
						item = newRestraint;
					}
				}
			}
		}
		let outfit = {name: "Obsidian", id: KinkyDungeonGetItemID(), type: Outfit};
		if (!KinkyDungeonInventoryGet("Obsidian")) KinkyDungeonInventoryAdd(outfit);
		//if (KinkyDungeonInventoryGet("Default")) KinkyDungeonInventoryRemove(KinkyDungeonInventoryGet("Default"));
		KinkyDungeonSetDress("Obsidian", "Obsidian");
	},
	Hogtied: () =>{
		for (let i = 0; i < 30; i++) {
			let r = KinkyDungeonGetRestraint({tags: ["ropeRestraints", "ropeRestraints2", "ropeRestraintsHogtie", "ropeRestraintsWrist", "tapeRestraints", "genericToys"]}, 24, "grv", true, undefined);
			if (r) {
				KinkyDungeonAddRestraintIfWeaker(r, 8, true, undefined, false, undefined, undefined, undefined, true);
				let item = r;
				for (let j = 0; j < 2; j++) {
					if (item && item.Link) {
						let newRestraint = KinkyDungeonGetRestraintByName(item.Link);
						KinkyDungeonAddRestraintIfWeaker(newRestraint, 8, true, undefined, undefined, undefined, undefined, undefined, true);
						item = newRestraint;
					}
				}
			}
		}
		KinkyDungeonAddRestraintIfWeaker("TrapMittens", 5, true, undefined, false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker("Stuffing", 5, true, undefined, false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker("HarnessPanelGag", 5, true, undefined, false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker("TrapBlindfold", 5, true, undefined, false, undefined, undefined, undefined, true);

		for (let w of kdStartWeapons) {
			if (KinkyDungeonInventoryGet(w)) KinkyDungeonInventoryRemove(KinkyDungeonInventoryGet(w));
		}
	},
	Stranger: () => {
		for (let key of Object.keys(KinkyDungeonFactionTag)) {
			KDSetFactionRelation("Player", key, -1 + 0.45 * KDRandom() + 0.45 * KDRandom() + 0.45 * KDRandom());
		}
	},
	WrongNeighborhood: () => {
		for (let key of Object.keys(KinkyDungeonFactionTag)) {
			KDSetFactionRelation("Player", key, -1);
			for (let key2 of Object.keys(KinkyDungeonFactionTag)) {
				KDSetFactionRelation(key, key2, 0.5);
			}
		}
	},
	Cursed: () => {
		KinkyDungeonChangeFactionRep("Angel", -100);
	},
	MC_Trainee: () => {
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("DistractionCast"));
	},
	MC_Wizard: () => {
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("ManaRegen"));
	},
	MC_Rogue: () => {
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("RogueTargets"));
	},
	MC_Peasant: () => {
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("Peasant"));
	},
	MC_Fighter: () => {
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("BattleRhythm"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("Offhand"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);

	},
};


let KDPerksFilter = "";

let KDPerksButtonWidth = 298;
let KDPerksButtonWidthPad = 2;
let KDPerksButtonHeight = 44;
let KDPerksButtonHeightPad = 2;
let KDPerksXPad = 50;
let KDPerksYPad = 50;
let KDPerksYStart = 220;
let KDPerksXStart = 50;
let KDPerksMaxY = 900;
let KDPerksScroll = KDPerksButtonWidth * 2 + KDPerksButtonWidthPad * 2 + KDPerksXPad;
let KDPerksIndex = 0;
let KDPerksIndexUI = 0;
let KDPerksIndexUIWeight = 4;

let KDCategories = [

];
function KinkyDungeonDrawPerks(NonSelectable) {
	let fadeColor = NonSelectable ? "#808080" : "#999999";
	let X = Math.round(KDPerksXStart - KDPerksScroll * KDPerksIndexUI);
	let Y = KDPerksYStart;
	let Y_alt = KDPerksYStart;
	if (CommonIsMobile) KDPerksIndexUIWeight = 1;
	KDPerksIndexUI = (KDPerksIndex + (KDPerksIndexUIWeight - 1) * KDPerksIndexUI) / KDPerksIndexUIWeight;

	/*MainCanvas.beginPath();
	MainCanvas.lineWidth = 3;
	MainCanvas.strokeStyle = KDBorderColor;
	MainCanvas.moveTo(50, 120);
	MainCanvas.lineTo(1950, 120);
	MainCanvas.stroke();
	MainCanvas.closePath();*/

	let tooltip = false;
	let catsdrawn = 0;
	let catsdrawnStrict = 0;

	function inView() {
		return X > -2 * KDPerksButtonWidth - KDPerksButtonWidthPad && X < 2000 - KDPerksButtonWidth;
	}
	function inViewStrict() {
		return X > 0 && X < 2000 - KDPerksButtonWidth;
	}

	let indexX = 0;
	let indexList = {};

	let firstDrawn = "";

	let filled_x = {

	};
	for (let c of KDCategories) {
		Y = Math.max(Y, Y_alt);
		let height = KDPerksYPad + KDPerksButtonHeight*Math.max(c.buffs.length, c.debuffs.length);
		if (Y + height > KDPerksMaxY) {
			X += (KDPerksButtonWidth + KDPerksButtonWidthPad)*2 + KDPerksXPad;
			indexX += 1;
			Y = KDPerksYStart;
		}

		Y += KDPerksYPad;
		Y_alt = Y;
		//MainCanvas.textAlign = "left";
		DrawTextFitKDTo(kdUItext, TextGet("KDCategory" + c.name), X + KDPerksButtonWidth + KDPerksButtonWidthPad/2, Y - KDPerksButtonHeight/2 - 5, KDPerksButtonWidth*2, "#ffffff",
			undefined, undefined, undefined, undefined, undefined, undefined, true);
		//MainCanvas.textAlign = "center";
		if (inView()) {
			catsdrawn += 1;
		}
		if (inViewStrict()) {
			catsdrawnStrict += 1;
			if (!firstDrawn) firstDrawn = c.name;
		}
		for (let stat of c.buffs.concat(c.debuffs)) {
			if ((!stat[1].locked || KDUnlockedPerks.includes(stat[0]))
				&& (NonSelectable|| !KDPerksFilter || TextGet("KinkyDungeonStat" + ("" + stat[1].id)).toLocaleLowerCase().includes(KDPerksFilter.toLocaleLowerCase()))) {
				let YY = (!stat[1].buff && (stat[1].cost < 0 || stat[1].debuff)) ? Y_alt : Y;
				let XX = (!stat[1].buff && (stat[1].cost < 0 || stat[1].debuff)) ? X + KDPerksButtonWidth + KDPerksButtonWidthPad : X;

				if (inView()) {
					let colorAvailable = NonSelectable ?
					fadeColor :
					KDGetPerkCost(stat[1]) > 0 ?
						"#aaaacc" :
						KDGetPerkCost(stat[1]) < 0 ?
							"#ccaaaa" :
							"#aaaacc";
					let colorSelected = KDGetPerkCost(stat[1]) > 0 ? "#eeeeff" : KDGetPerkCost(stat[1]) < 0 ? "#ffeeee" : "#eeeeff";
					let colorExpensive = KDGetPerkCost(stat[1]) > 0 ? "#555588" : KDGetPerkCost(stat[1]) < 0 ? "#885555" : "#555588";

					DrawButtonKDExTo(kdUItext, stat[0], (bdata) => {
						if (!KinkyDungeonStatsChoice.get(stat[0]) && KinkyDungeonCanPickStat(stat[0])) {
							KinkyDungeonStatsChoice.set(stat[0], true);
							localStorage.setItem('KinkyDungeonStatsChoice' + KinkyDungeonPerksConfig, JSON.stringify(Array.from(KinkyDungeonStatsChoice.keys())));
						} else if (KinkyDungeonStatsChoice.get(stat[0])) {
							KinkyDungeonStatsChoice.delete(stat[0]);
							localStorage.setItem('KinkyDungeonStatsChoice' + KinkyDungeonPerksConfig, JSON.stringify(Array.from(KinkyDungeonStatsChoice.keys())));
						}
						return true;
					}, !NonSelectable && (KinkyDungeonState == "Stats" || (KinkyDungeonDrawState == "Perks2" && KDDebugPerks)), XX, YY, KDPerksButtonWidth, KDPerksButtonHeight, TextGet("KinkyDungeonStat" + (stat[1].id)) + ` (${KDGetPerkCost(stat[1])})`,
						(!KinkyDungeonStatsChoice.get(stat[0]) && KinkyDungeonCanPickStat(stat[0])) ? colorAvailable : (KinkyDungeonStatsChoice.get(stat[0]) ? colorSelected : (NonSelectable ? colorAvailable : colorExpensive)),
						KinkyDungeonStatsChoice.get(stat[0]) ? (KinkyDungeonRootDirectory + "UI/TickPerk.png") : "", undefined, false, true,
						KinkyDungeonStatsChoice.get(stat[0]) ? "rgba(140, 140, 140, 0.5)" : KDButtonColor, undefined, undefined, {
							noTextBG: true,
							unique: true,
						});
					if (MouseIn(XX, YY, KDPerksButtonWidth, KDPerksButtonHeight)) {
						DrawTextFitKD(TextGet("KinkyDungeonStatDesc" + (stat[1].id)), 1000, 150, 1500, KDTextWhite, KDTextGray1);
						DrawTextFitKD(TextGet("KinkyDungeonStatCost").replace("AMOUNT", KDGetPerkCost(stat[1]) + ""), 1000, 190, 1400, KDTextWhite, KDTextGray1);
						tooltip = true;
					}
				}
				if (!filled_x[X]) {
					FillRectKD(kdUItext, kdpixisprites, c.name, {
						Left: X - KDPerksButtonWidthPad,
						Top: KDPerksYStart,
						Width: 2 * KDPerksButtonWidth + 3 * KDPerksButtonWidthPad,
						Height: KDPerksMaxY - KDPerksYStart,
						Color: KDTextGray0,
						LineWidth: 1,
						zIndex: 60,
						alpha: 0.4,
					});
					filled_x[X] = X;
				}
				if (!stat[1].buff && (stat[1].cost < 0 || stat[1].debuff)) Y_alt += KDPerksButtonHeight + KDPerksButtonHeightPad;
				else Y += KDPerksButtonHeight + KDPerksButtonHeightPad;
			}
		}
		indexList[c.name] = indexX;
	}


	DrawButtonKDEx("perks>", (bdata) => {
		if (catsdrawn > 2 && !(document.activeElement?.id == 'PerksFilter')) {
			KDPerksIndex += 1;
		}
		return true;
	}, true, 1750, 50, 100, 50, ">>", KDTextWhite);

	DrawButtonKDEx("perks<", (bdata) => {
		if (KDPerksIndex > 0 && !(document.activeElement?.id == 'PerksFilter')) {
			KDPerksIndex -= 1;
		}
		return true;
	}, true, 150, 50, 100, 50, "<<", KDTextWhite);

	let procList = KDCategoriesStart.map((e) => {return e.name;});
	let adjLists = GetAdjacentList(procList, procList.indexOf(firstDrawn), catsdrawnStrict);
	let left = adjLists.left;
	let right = adjLists.right;

	drawVertList(left.reverse(), 380, tooltip ? 85 : 190, 250, 25, tooltip ? 4 : 8, 18, (data) => {
		return (bdata) => {
			KDPerksIndex = indexList[data.name];
			return true;
		};
	}, "KDCategory");
	drawVertList(right, 1620, tooltip ? 85 : 190, 250, 25, tooltip ? 4 : 8, 18, (data) => {
		return (bdata) => {
			KDPerksIndex = Math.max(0, indexList[data.name] - 2);
			return true;
		};
	}, "KDCategory");

	if (catsdrawn < 3 && KDPerksIndex > 0) KDPerksIndex -= 1;

	return tooltip;
}

/**
 *
 * @param {any[]} list
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} max
 * @param {number} fontSize
 * @param {(any) => ((any) => boolean)} clickfnc
 * @param {string} prefix
 */
function drawVertList(list, x, y, w, h, max, fontSize, clickfnc, prefix) {
	for (let i = 0; i < list.length && i < max; i++) {
		let name = list[i];
		DrawButtonKDEx(name + x + "," + y, clickfnc({name: name}), true, x - w/2, y - (h+1) * i, w, h, TextGet(prefix + name), KDTextWhite, undefined, undefined, undefined, true, undefined, fontSize);
	}
}

/**
 *
 * @param {Record<string, boolean>} existing
 * @returns {string[]}
 */
function KDGetRandomPerks(existing) {
	let poscandidates = [];
	let singlepointcandidates = [];
	let negcandidates = [];
	for (let p of Object.entries(KinkyDungeonStatsPresets)) {
		if (!existing[p[0]] && !KinkyDungeonStatsChoice.get(p[0]) && KinkyDungeonCanPickStat(p[0], 999)) { // No dupes
			if ((!p[1].tags || !p[1].tags.includes("start"))) {
				if (!p[1].locked || KDUnlockedPerks.includes(p[0])) {
					if (KDGetPerkCost(p[1]) > 0) {
						poscandidates.push(p);
						if (KDGetPerkCost(p[1]) == 1)
							singlepointcandidates.push(p);
					} else if (KDGetPerkCost(p[1]) < 0) {
						negcandidates.push(p);
					}
				}
			}
		}
	}

	let poscandidate = poscandidates[Math.floor(poscandidates.length * KDRandom())];
	if (!poscandidate) return [];

	let netcost = KDGetPerkCost(poscandidate[1]);
	let perks = [poscandidate[0]];
	if (KDGetPerkCost(poscandidate[1]) > 1) {
		negcandidates = negcandidates.filter((p) => {
			return (KinkyDungeonCanPickStat(p[0], 999))
				&& !KDPerkBlocked(p[0], poscandidate[0])
				&& (-KDGetPerkCost(p[1])) >= (KDGetPerkCost(poscandidate[1]) - 1);
		});
		let negperk = null;
		if (negcandidates.length > 0) {
			negperk = negcandidates[Math.floor(negcandidates.length * KDRandom())];
			perks.push(negperk[0]);
			netcost += KDGetPerkCost(negperk[1]);
		}

		if (netcost < 0 && negperk) {
			singlepointcandidates = negcandidates.filter((p) => {
				return (KinkyDungeonCanPickStat(p[0], 999)
				&& p[0] != poscandidate[0]
				&& p[0] != negperk[0]
				&& !KDPerkBlocked(p[0], poscandidate[0])
				&& !KDPerkBlocked(p[0], negperk[0]));
			});
			let newperk = singlepointcandidates[Math.floor(singlepointcandidates.length * KDRandom())];
			perks = [perks[0], newperk[0], perks[1]];
		}
	}
	return perks;
}
