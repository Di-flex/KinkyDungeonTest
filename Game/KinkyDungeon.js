"use strict";

// Disable interpolation when scaling, will make texture be pixelated
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

let CanvasWidth = 2000;
let CanvasHeight = 1000;
let KDStartTime = 0;

/** These languages have characters which are rendered bigger than English. */
let KDBigLanguages = ["CN", "KR", "JP"];
let KDBigLanguages2 = ["Chinese", "Korean", "Japanese"];
/** Language List */
let KDLanguages = ["", "CN", "KR", "JP", "ES"];

let KinkyDungeonPlayerNeedsRefresh = false;
let KinkyDungeonNextRefreshCheck = 0;

// Check URL to see if indev branch
const pp = new URLSearchParams(window.location.search);
let param_branch = pp.has('branch') ? pp.get('branch') : "";
let param_test = pp.has('test') ? pp.get('test') : "";
let param_localhost = pp.has('localhost') ? pp.get('localhost') : "";
let TestMode = param_test || param_branch || param_localhost || ServerURL == 'https://bc-server-test.herokuapp.com/';

let KDDebugMode = false;
let KDDebug = false;
let KDDebugPerks = false;
let KDDebugGold = false;

let KDAllModFiles = [];
let KDModFiles = {};

let KinkyDungeonPerksConfig = "1";
let KinkyDungeonSpellsConfig = "1";

let KDUnlockedPerks = [];

let KinkyDungeonBackground = "BrickWall";
/**
 * @type {Character}
 */
let KinkyDungeonPlayer = null;
let KinkyDungeonState = "Logo";

let KinkyDungeonRep = 0; // Variable to store max level to avoid losing it if the server doesnt take the rep update

function KDSetDefaultKeybindings() {
	KinkyDungeonKeybindingsTemp = Object.assign({}, KDDefaultKB);
}

let KinkyDungeonKeybindings = null;
let KinkyDungeonKeybindingsTemp = null;
let KinkyDungeonKeybindingCurrentKey = "";
let KinkyDungeonKeybindingCurrentKeyRelease = "";

let KinkyDungeonNewGame = 0;

let KinkyDungeonGameRunning = false;

let KDLose = false;


let KDLoadingFinished = false;
let KDLoadingDone = 1;
let KDLoadingMax = 1;

//let KinkyDungeonKeyLower = [87+32, 65+32, 83+32, 68+32, 81+32, 45+32, 90+32, 43+32]; // WASD
let KinkyDungeonKey = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'KeyZ', 'KeyC'];
//let KinkyDungeonKeyNumpad = [56, 52, 50, 54, 55, 57, 49, 51]; // Numpad
let KinkyDungeonKeySpell = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0']; // 1 2 3 4 5 6 7
let KinkyDungeonKeySpellConfig = ['BracketLeft', 'BracketRight', 'Backslash'];
let KinkyDungeonKeyWait = ['KeyX'];
let KinkyDungeonKeySkip = ['Space'];
let KinkyDungeonKeyEnter = ['Enter'];
let KinkyDungeonKeySprint = ['ShiftLeft'];
let KinkyDungeonKeyWeapon = ['ControlRight',];
let KinkyDungeonKeyUpcast = ['KeyR', 'ControlLeft'];
let KinkyDungeonKeyMenu = ['KeyT', 'KeyI', 'KeyP', 'KeyM', 'KeyL']; // QuikInv, Inventory, Reputation, Magic, Log
let KinkyDungeonKeyToggle = ['KeyO', 'KeyB', 'KeyV', 'KeyN', 'Semicolon', 'Quote']; // Log, Passing, Door, Auto Struggle, Auto Pathfind
let KinkyDungeonKeySpellPage = ['Backquote'];
let KinkyDungeonKeySwitchWeapon = ['KeyF', 'KeyG', 'KeyH']; // Swap, Offhand, OffhandPrevious
let KinkyDungeonKeySwitchLoadout = ['Comma', 'Period', 'Slash']; // Swap, Offhand, OffhandPrevious

let KDLoadingTextKeys = {};

let kdSpecialModePerks = [
	"arousalMode",
	"easyMode",
	"norescueMode",
	"arousalModePlug",
	"arousalModePiercing",
];


let KinkyDungeonGraphicsQuality = true;

let KDToggles = {
	VibeSounds: true,
	Music: true,
	Sound: true,
	EnableMinimap: true,
	DrawArmor: true,
	Bloom: true,
	StunFlash: true,
	ParticlesFX: true,
	ArousalHearts: true,
	VibeHearts: true,
	FancyWalls: true,
	FancyShadows: true,
	EnemyAnimations: true,
	TransparentUI: false,
	PlayerTransparencyDuringBullets: true,
	TurnCounter: true,
	ShowNPCStatuses: true,
	ForceWarnings: false,
	Drool: true,
	LazyWalk: false,
};

let KDDefaultKB = {
	Down: KinkyDungeonKey[2],
	DownLeft: KinkyDungeonKey[6],
	DownRight: KinkyDungeonKey[7],
	Left: KinkyDungeonKey[1],
	Right: KinkyDungeonKey[3],
	Up: KinkyDungeonKey[0],
	UpLeft: KinkyDungeonKey[4],
	UpRight: KinkyDungeonKey[5],

	Spell1: KinkyDungeonKeySpell[0],
	Spell2: KinkyDungeonKeySpell[1],
	Spell3: KinkyDungeonKeySpell[2],
	Spell4: KinkyDungeonKeySpell[3],
	Spell5: KinkyDungeonKeySpell[4],
	Spell6: KinkyDungeonKeySpell[5],
	Spell7: KinkyDungeonKeySpell[6],
	Spell8: KinkyDungeonKeySpell[7],
	Spell9: KinkyDungeonKeySpell[8],
	Spell0: KinkyDungeonKeySpell[9],
	SpellWeapon: KinkyDungeonKeyWeapon[0],
	SpellConfig1: KinkyDungeonKeySpellConfig[0],
	SpellConfig2: KinkyDungeonKeySpellConfig[1],
	SpellConfig3: KinkyDungeonKeySpellConfig[2],

	Wait: KinkyDungeonKeyWait[0],
	Skip: KinkyDungeonKeySkip[0],
	Enter: KinkyDungeonKeyEnter[0],
	Sprint: KinkyDungeonKeySprint[0],

	SwitchLoadout1: KinkyDungeonKeySwitchLoadout[0],
	SwitchLoadout2: KinkyDungeonKeySwitchLoadout[1],
	SwitchLoadout3: KinkyDungeonKeySwitchLoadout[2],
	SpellPage: KinkyDungeonKeySpellPage[0],
	SwitchWeapon: KinkyDungeonKeySwitchWeapon[0],
	SwitchWeaponOffhand: KinkyDungeonKeySwitchWeapon[1],
	SwitchWeaponOffhandPrevious: KinkyDungeonKeySwitchWeapon[2],

	QInventory: KinkyDungeonKeyMenu[0],
	Inventory: KinkyDungeonKeyMenu[1],
	Reputation: KinkyDungeonKeyMenu[2],
	Magic: KinkyDungeonKeyMenu[3],
	Log: KinkyDungeonKeyMenu[4],

	Upcast: KinkyDungeonKeyUpcast[0],
	UpcastCancel: KinkyDungeonKeyUpcast[1],

	MsgLog: KinkyDungeonKeyToggle[0],
	Pass: KinkyDungeonKeyToggle[1],
	Door: KinkyDungeonKeyToggle[2],
	AStruggle: KinkyDungeonKeyToggle[3],
	APathfind: KinkyDungeonKeyToggle[4],
	AInspect: KinkyDungeonKeyToggle[5],
};

let KinkyDungeonRootDirectory = "Screens/MiniGame/KinkyDungeon/";
let KinkyDungeonPlayerCharacter = null; // Other player object
let KinkyDungeonGameData = null; // Data sent by other player
let KinkyDungeonGameDataNullTimer = 4000; // If data is null, we query this often
let KinkyDungeonGameDataNullTimerTime = 0;
let KinkyDungeonStreamingPlayers = []; // List of players to stream to

let KinkyDungeonInitTime = 0;

let KinkyDungeonSleepTime = 0;
let KinkyDungeonFreezeTime = 1000;
let KinkyDungeonPlaySelfTime = 300;
let KinkyDungeonOrgasmTime = 1000;
let KinkyDungeonAutoWait = false;
let KinkyDungeonAutoWaitStruggle = false;

let KinkyDungeonConfigAppearance = false;

const Consumable = "consumable";
const Restraint = "restraint";
const LooseRestraint = "looserestraint";
const Outfit = "outfit";
const Accessory = "accessory";
const Weapon = "weapon";
const Misc = "misc";
const Armor = "armor";

let KinkyDungeonStatsChoice = new Map();

let KDJourney = "";

let KDOptOut = false;

/**
*  @typedef {{
* InventoryAction: string,
* CurseLevel: number,
* UsingConsumable: string,
* BondageTarget: number,
* KeysNeeded: boolean,
* JailRemoveRestraintsTimer: number;
* KinkyDungeonSpawnJailers: number;
* KinkyDungeonSpawnJailersMax: number;
* KinkyDungeonLeashedPlayer: number;
* KinkyDungeonLeashingEnemy: number;
* KinkyDungeonJailGuard: number;
* KinkyDungeonGuardTimer: number;
* KinkyDungeonGuardTimerMax: number;
* KinkyDungeonGuardSpawnTimer: number;
* KinkyDungeonGuardSpawnTimerMax: number;
* KinkyDungeonGuardSpawnTimerMin: number;
* KinkyDungeonMaxPrisonReduction: number;
* KinkyDungeonPrisonReduction: number;
* KinkyDungeonPrisonExtraGhostRep: number;
* PrisonGoodBehaviorFromLeash: number;
* KinkyDungeonJailTourTimer: number;
* KinkyDungeonJailTourTimerMin: number;
* KinkyDungeonJailTourTimerMax: number;
* KinkyDungeonPenanceCostCurrent: number;
* KinkyDungeonAngel: number;
* KDPenanceStage: number;
* KDPenanceStageEnd: number;
* AngelCurrentRep: string;
* KDPenanceMode: string;
* OrgasmStage: number;
* OrgasmTurns: number;
* OrgasmStamina: number;
* SleepTurns: number;
* PlaySelfTurns: number;
* RescueFlag: boolean;
* KinkyDungeonPenance: boolean;
* GuardApplyTime: number;
* WarningLevel: number;
* AncientEnergyLevel: number;
* OrigEnergyLevel: number;
* LastMP: number;
* LastAP: number;
* LastSP: number;
* LastWP: number;
* Outfit: string,
* Champion: string,
* ChampionCurrent: number,
* LastMapSeed: string,
* AlreadyOpened: {x: number, y:number}[],
* Journey: string,
* CheckpointIndices: number[],
* PrisonerState: string,
* TimesJailed: number,
* JailTurns: number,
* JailKey: boolean,
* CurrentDialog: string,
* CurrentDialogStage: string,
* OrgasmNextStageTimer: number,
* DistractionCooldown: number,
* ConfirmAttack: boolean,
* CurrentDialogMsg: string,
* CurrentDialogMsgSpeaker: string,
* CurrentDialogMsgPersonality: string,
* CurrentDialogMsgID: number,
* CurrentDialogMsgData: Record<string, string>,
* CurrentDialogMsgValue: Record<string, number>,
* AlertTimer: number,
* RespawnQueue: {enemy: string, faction: string}[],
* HeartTaken: boolean,
* CurrentVibration: KinkyVibration,
* Edged: boolean,
* TimeSinceLastVibeStart: Record<string, number>,
* TimeSinceLastVibeEnd: Record<string, number>,
* OfferFatigue: number,
* Favors: Record<string, number>,
* RoomType: string,
* MapMod: string,
* HunterTimer: number,
* Hunters: number[],
* Quests: string[],
* PriorJailbreaks: number,
* PriorJailbreaksDecay: number,
* PreviousWeapon: string,
* StaminaPause: number,
* StaminaSlow: number,
* ManaSlow: number,
* TempFlagFloorTicks: Record<string, number>,
* KneelTurns: number,
* HiddenSpellPages : Record<string, boolean>,
* KeyringLocations : {x: number, y: number}[],
* HiddenItems : Record<string, boolean>,
* ItemPriority : Record<string, number>,
* CagedTime : number,
* DelayedActions: KDDelayedAction[],
* OfferCount: number,
* ItemID: number,
* Offhand: string,
* OffhandOld: string,
* OffhandReturn: string,
* ShopkeeperFee: number,
* DollCount: number,
* ChestsGenerated: string[],
* DollRoomCount: number,
* CollectedHearts: number,
* CollectedOrbs: number,
* otherPlaying: number,
* Training: Record<string, KDTrainingRecord>,
* QuickLoadout: KDPresetLoadout[],
* CurrentLoadout: number,
* HighestLevelCurrent: number,
* HighestLevel: number,
* KDChasingEnemies: entity[],
* ShopRewardProgram: number,
* ShopRewardProgramThreshold: number,
* tickAlertTimer: boolean,
* HostileFactions: string[],
* MovePoints: number,
* Wait: number,
* Class: string,
* FloorRobotType: Record<string, string>,
* TeleportLocations: Record<string, {x: number, y: number, type: string, checkpoint: string, level: number}>,
* QuickLoadouts: Record<string, string[]>}},

*}} KDGameDataBase
*/
let KDGameDataBase = {
	TeleportLocations: {},
	CurseLevel: 0,
	UsingConsumable: "",
	MovePoints: 0,
	InventoryAction: "",
	BondageTarget: -1,
	ShopRewardProgram: 0,
	ShopRewardProgramThreshold: 500,

	QuickLoadouts: {},
	CurrentLoadout: 0,
	Training: {},
	CollectedOrbs: 0,
	CollectedHearts: 0,
	DollRoomCount: 0,
	ChestsGenerated: [],
	DollCount: 0,

	CagedTime: 0,
	HiddenItems: {},
	ItemPriority: {},
	KeyringLocations: [],
	HiddenSpellPages: {},
	PriorJailbreaks: 0,
	PriorJailbreaksDecay: 0,
	KeysNeeded: false,
	RoomType: "",
	MapMod: "",

	Quests: [],

	HunterTimer: 0,
	Hunters: [],

	AlertTimer: 0,
	OrgasmNextStageTimer: 0,
	DistractionCooldown: 0,

	JailRemoveRestraintsTimer: 0,
	KinkyDungeonSpawnJailers: 0,
	KinkyDungeonSpawnJailersMax: 5,
	KinkyDungeonLeashedPlayer: 0,
	KinkyDungeonLeashingEnemy: 0,

	KinkyDungeonJailGuard: 0,
	KinkyDungeonGuardTimer: 0,
	KinkyDungeonGuardTimerMax: 28,
	KinkyDungeonGuardSpawnTimer: 0,
	KinkyDungeonGuardSpawnTimerMax: 80,
	KinkyDungeonGuardSpawnTimerMin: 50,
	KinkyDungeonMaxPrisonReduction: 10,
	KinkyDungeonPrisonReduction: 0,
	KinkyDungeonPrisonExtraGhostRep: 0,
	PrisonGoodBehaviorFromLeash: 0,

	KinkyDungeonJailTourTimer: 0,
	KinkyDungeonJailTourTimerMin: 20,
	KinkyDungeonJailTourTimerMax: 40,

	KinkyDungeonPenanceCostCurrent: 100,

	KinkyDungeonAngel: 0,
	KDPenanceStage: 0,
	KDPenanceStageEnd: 0,
	AngelCurrentRep: "",
	KDPenanceMode: "",

	OrgasmStage: 0,
	OrgasmTurns: 0,
	OrgasmStamina: 0,

	KinkyDungeonPenance: false,

	RescueFlag: false,

	SleepTurns: 0,
	PlaySelfTurns: 0,
	GuardApplyTime: 0,

	AncientEnergyLevel: 0,
	OrigEnergyLevel: 0,
	LastAP: 0,
	LastSP: KDMaxStatStart,
	LastMP: KDMaxStatStart,
	LastWP: KDMaxStatStart,

	Outfit: "Default",

	Champion: "",
	ChampionCurrent: 0,

	WarningLevel: 0,
	LastMapSeed: "",

	AlreadyOpened: [],
	Journey: "",
	CheckpointIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],

	TempFlagFloorTicks: {},

	// "" = not a prisoner
	// "jail" = must remain in cell
	// "parole" = can roam but not allowed to take most actions
	PrisonerState: "",
	TimesJailed: 0,
	JailTurns: 0,
	JailKey: false,

	CurrentDialog: "",
	CurrentDialogStage: "",
	CurrentDialogMsg: "",
	CurrentDialogMsgSpeaker: "",
	CurrentDialogMsgPersonality: "",
	CurrentDialogMsgData: {},
	CurrentDialogMsgValue: {},
	CurrentDialogMsgID: -1,

	ConfirmAttack: false,
	RespawnQueue: [],
	HeartTaken: false,

	CurrentVibration: null,
	Edged: false,
	TimeSinceLastVibeStart: {},
	TimeSinceLastVibeEnd: {},

	OfferFatigue: 0,
	Offhand: "",
	OffhandOld: "",
	OffhandReturn: "",

	Favors: {},
	PreviousWeapon: null,
	QuickLoadout: [],

	StaminaPause: 0,
	StaminaSlow: 0,
	ManaSlow: 0,
	KneelTurns: 0,
	DelayedActions: [],

	OfferCount: 0,

	KDChasingEnemies: [],

	ItemID: 0,
	ShopkeeperFee: 0,
	otherPlaying: 0,
	CategoryIndex: {},
	HighestLevel: 1,
	HighestLevelCurrent: 1,
	tickAlertTimer: false,
	HostileFactions: [],
	Wait: 0,
	Class: "",

	FloorRobotType: {},
};
/**
 * @type {KDGameDataBase}
 */
let KDGameData = Object.assign({}, KDGameDataBase);

let KDLeashingEnemy = null;
function KinkyDungeonLeashingEnemy() {
	if (KDGameData.KinkyDungeonLeashingEnemy || KDUpdateEnemyCache) {
		if (!KDLeashingEnemy || KDLeashingEnemy.id != KDGameData.KinkyDungeonLeashingEnemy) {
			KDLeashingEnemy = KinkyDungeonFindID(KDGameData.KinkyDungeonLeashingEnemy);
		}
	}
	if (!KDIsPlayerTethered(KinkyDungeonPlayerEntity)) {
		KDLeashingEnemy = null;
	}
	return KDLeashingEnemy;
}
let KDJailGuard = null;

/**
 *
 * @returns {entity}
 */
function KinkyDungeonJailGuard() {
	if (KDGameData.KinkyDungeonJailGuard) {
		if (!KDJailGuard || KDJailGuard.id != KDGameData.KinkyDungeonJailGuard || KDUpdateEnemyCache) {
			KDJailGuard = KinkyDungeonFindID(KDGameData.KinkyDungeonJailGuard);
		}
	} else {
		KDJailGuard = null;
	}
	return KDJailGuard;
}
let KDAngel = null;
function KinkyDungeonAngel() {
	if (KDGameData.KinkyDungeonAngel) {
		if (!KDAngel || KDUpdateEnemyCache) {
			KDAngel = KinkyDungeonFindID(KDGameData.KinkyDungeonAngel);
		}
	} else {
		KDAngel = null;
	}
	return KDAngel;
}

function KDUnlockPerk(Perk) {
	if (Perk && !KDUnlockedPerks.includes(Perk)) KDUnlockedPerks.push(Perk);
	KDLoadPerks();
	localStorage.setItem("KDUnlockedPerks", JSON.stringify(KDUnlockedPerks));
}

function KDLoadPerks() {

	KDCategories = Object.assign([], KDCategoriesStart);
	for (let c of KDCategories) {
		c.buffs = [];
		c.debuffs = [];
	}

	for (let stat of Object.entries(KinkyDungeonStatsPresets)) {
		for (let c of KDCategories) {
			if (stat[1].category == c.name) {
				if (!stat[1].buff && (stat[1].debuff || KDGetPerkCost(stat[1]) < 0))
					c.debuffs.push(stat);
				else
					c.buffs.push(stat);
			}
		}
	}


	if (localStorage.getItem("KDUnlockedPerks")) {
		let perks = JSON.parse(localStorage.getItem("KDUnlockedPerks"));
		if (perks) {
			for (let p of perks) {
				if (!KDUnlockedPerks.includes(p)) {
					KDUnlockedPerks.push(p);
				}
			}
		}
	}
}

/**
 *
 * @param {any[]} list
 * @return {Record<any, any>}
 */
function KDMapInit(list) {
	let map = {};
	for (let l of list) {
		map[l] = true;
	}
	return map;
}

function KDistEuclidean(x, y) {
	return Math.sqrt(x*x + y*y);
}

function KDistChebyshev(x, y) {
	return Math.max(Math.abs(x), Math.abs(y));
}


function KDistTaxicab(x, y) {
	return Math.abs(x) + Math.abs(y);
}

function KDLoadToggles() {
	let loaded = localStorage.getItem("KDToggles") ? JSON.parse(localStorage.getItem("KDToggles")) : {};
	for (let t of Object.keys(KDToggles)) {
		if (loaded[t] != undefined)
			KDToggles[t] = loaded[t];
	}

	if (!Player.GraphicsSettings) {
		Player.GraphicsSettings = {AnimationQuality: 0};
	}
}
function KDSaveToggles() {
	localStorage.setItem("KDToggles", JSON.stringify(KDToggles));
}

/**
 * Loads the kinky dungeon game
 * @returns {void} - Nothing
 */
function KinkyDungeonLoad() {
	KinkyDungeonSetupCrashHandler();
	KDStartTime = CommonTime();

	for (let entry of Object.entries(KDLoadingTextKeys)) {
		addTextKey(entry[0], entry[1]);
	}

	KDLoadPerks();

	CurrentDarkFactor = 0;

	KinkyDungeonPlayerNeedsRefresh = false;

	KinkyDungeonInitTime = CommonTime();
	KinkyDungeonGameKey.load();

	if (!KinkyDungeonIsPlayer()) KinkyDungeonGameRunning = false;
	//if (!KDPatched && KinkyDungeonState == 'Consent') KinkyDungeonState = "Menu";
	//if (!Player.KinkyDungeonSave) Player.KinkyDungeonSave = {};

	if (!KinkyDungeonGameRunning) {
		if (!KinkyDungeonPlayer) { // new game
			KDrandomizeSeed(false);
			if (KDPatched) {
				KinkyDungeonPlayer = suppressCanvasUpdate(() => CharacterLoadNPC("NPC_Avatar"));
			} else {
				KinkyDungeonPlayer = CharacterLoadNPC("NPC_Avatar");
			}
			KinkyDungeonPlayer.Type = "simple";
			KinkyDungeonPlayer.OnlineSharedSettings = {BlockBodyCosplay: true, };

			KDLoadToggles();

			KinkyDungeonBones = localStorage.getItem("KinkyDungeonBones") != undefined ? localStorage.getItem("KinkyDungeonBones") : KinkyDungeonBones;

			if (localStorage.getItem("KDResolution")) {
				let parsed = parseInt(localStorage.getItem("KDResolution"));
				if (parsed != undefined) {
					KDResolutionListIndex = parsed;
					KDResolution = KDResolutionList[KDResolutionListIndex];
				}
			}
			if (localStorage.getItem("KDVibeVolume")) {
				let parsed = parseInt(localStorage.getItem("KDVibeVolume"));
				if (parsed != undefined) {
					KDVibeVolumeListIndex = parsed;
					KDVibeVolume = KDVibeVolumeList[KDVibeVolumeListIndex];
				}
			}
			if (localStorage.getItem("KDMusicVolume")) {
				let parsed = parseInt(localStorage.getItem("KDMusicVolume"));
				if (parsed != undefined) {
					KDMusicVolumeListIndex = parsed;
					KDMusicVolume = KDMusicVolumeList[KDMusicVolumeListIndex];
				}
			}
			if (localStorage.getItem("KDSfxVolume")) {
				let parsed = parseInt(localStorage.getItem("KDSfxVolume"));
				if (parsed != undefined) {
					KDSfxVolumeListIndex = parsed;
					KDSfxVolume = KDSfxVolumeList[KDSfxVolumeListIndex];
				}
			}
			if (localStorage.getItem("KDAnimSpeed")) {
				let parsed = parseInt(localStorage.getItem("KDAnimSpeed"));
				if (parsed != undefined) {
					KDAnimSpeedListIndex = parsed;
					KDAnimSpeed = KDAnimSpeedList[KDAnimSpeedListIndex] || 0;
				}
			}
			if (localStorage.getItem("KDGamma")) {
				let parsed = parseInt(localStorage.getItem("KDGamma"));
				if (parsed != undefined) {
					KDGammaListIndex = parsed;
					KDGamma = KDGammaList[KDGammaListIndex] || 0;
					kdgammafilterstore[0] = KDGamma;
				}
			}

			KinkyDungeonSexyMode = localStorage.getItem("KinkyDungeonSexyMode") != undefined ? localStorage.getItem("KinkyDungeonSexyMode") == "True" : true;
			KinkyDungeonClassMode = localStorage.getItem("KinkyDungeonClassMode") != undefined ? localStorage.getItem("KinkyDungeonClassMode") : "Mage";
			KinkyDungeonSexyPiercing = localStorage.getItem("KinkyDungeonSexyPiercing") != undefined ? localStorage.getItem("KinkyDungeonSexyPiercing") == "True" : false;
			KinkyDungeonSexyPlug = localStorage.getItem("KinkyDungeonSexyPlug") != undefined ? localStorage.getItem("KinkyDungeonSexyPlug") == "True" : false;

			KinkyDungeonSaveMode = localStorage.getItem("KinkyDungeonSaveMode") != undefined ? localStorage.getItem("KinkyDungeonSaveMode") == "True" : false;
			KinkyDungeonHardMode = localStorage.getItem("KinkyDungeonHardMode") != undefined ? localStorage.getItem("KinkyDungeonHardMode") == "True" : false;
			KinkyDungeonExtremeMode = localStorage.getItem("KinkyDungeonExtremeMode") != undefined ? localStorage.getItem("KinkyDungeonExtremeMode") == "True" : false;
			KinkyDungeonPerksMode = localStorage.getItem("KinkyDungeonPerksMode") != undefined ? parseInt(localStorage.getItem("KinkyDungeonEasyMode")) || 0 : 0;
			KinkyDungeonRandomMode = localStorage.getItem("KinkyDungeonRandomMode") != undefined ? localStorage.getItem("KinkyDungeonRandomMode") == "True" : false;
			KinkyDungeonEasyMode = localStorage.getItem("KinkyDungeonEasyMode") != undefined ? parseInt(localStorage.getItem("KinkyDungeonEasyMode")) || 0 : 0;

			KinkyDungeonNewDress = true;
			KDCurrentOutfit = parseInt(localStorage.getItem("kdcurrentoutfit") || 0);
			let appearance = LZString.decompressFromBase64(localStorage.getItem("kinkydungeonappearance" + KDCurrentOutfit));
			if (!appearance || (StandalonePatched && JSON.parse(appearance).length && JSON.parse(appearance)[0]?.Asset)) {
				KinkyDungeonNewDress = false;
				appearance = CharacterAppearanceStringify(KinkyDungeonPlayerCharacter ? KinkyDungeonPlayerCharacter : Player);
			}

			CharacterAppearanceRestore(KinkyDungeonPlayer, appearance);


			if (KDPatched)
				suppressCanvasUpdate(() => CharacterReleaseTotal(KinkyDungeonPlayer));
			else
				CharacterReleaseTotal(KinkyDungeonPlayer);


			CharacterRefresh(KinkyDungeonPlayer);


			KinkyDungeonInitializeDresses();
			KinkyDungeonDressSet();

			if (KDPatched)
				suppressCanvasUpdate(() => CharacterNaked(KinkyDungeonPlayer));
			else
				CharacterNaked(KinkyDungeonPlayer);

			KinkyDungeonCheckClothesLoss = true;
			KinkyDungeonDressPlayer();

			KDInitProtectedGroups();

		}

		if (localStorage.getItem("KinkyDungeonKeybindings") && JSON.parse(localStorage.getItem("KinkyDungeonKeybindings"))) {
			KinkyDungeonKeybindings = JSON.parse(localStorage.getItem("KinkyDungeonKeybindings"));
			KinkyDungeonKeybindingsTemp = {};
			Object.assign(KinkyDungeonKeybindingsTemp, KinkyDungeonKeybindings);
			console.log(KinkyDungeonKeybindings);
		}
		else console.log("Failed to load keybindings");

		if (KinkyDungeonIsPlayer()) {
			//if (!KDPatched && KinkyDungeonState == "Consent")
			//KinkyDungeonState = "Menu";
			KinkyDungeonGameData = null;

			CharacterAppearancePreviousEmoticon = WardrobeGetExpression(Player).Emoticon;
			ServerSend("ChatRoomCharacterExpressionUpdate", { Name: "Gaming", Group: "Emoticon", Appearance: ServerAppearanceBundle(Player.Appearance) });
		} else {
			KinkyDungeonState = "Game";
			if (!KinkyDungeonGameData) {
				MiniGameKinkyDungeonLevel = 1;
				KinkyDungeonInitialize(1);
			}
		}

		for (const group of KinkyDungeonStruggleGroupsBase) {
			if (group == "ItemM") {
				if (InventoryGet(Player, "ItemMouth"))
					KinkyDungeonRestraintsLocked.push("ItemMouth");
				if (InventoryGet(Player, "ItemMouth2"))
					KinkyDungeonRestraintsLocked.push("ItemMouth2");
				if (InventoryGet(Player, "ItemMouth3"))
					KinkyDungeonRestraintsLocked.push("ItemMouth3");
			}
			if (group == "ItemH") {
				if (InventoryGet(Player, "ItemHood"))
					KinkyDungeonRestraintsLocked.push("ItemHood");
				if (InventoryGet(Player, "ItemHead"))
					KinkyDungeonRestraintsLocked.push("ItemHead");
			}

			if (InventoryGet(Player, group))
				KinkyDungeonRestraintsLocked.push(group);
		}
	}
}

/**
 * Restricts Devious Dungeon Challenge to only occur when inside the arcade
 * @returns {boolean} - If the player is in the arcade
 */
function KinkyDungeonDeviousDungeonAvailable() {
	return KinkyDungeonIsPlayer() && (DialogGamingPreviousRoom == "Arcade" || MiniGameReturnFunction == "ArcadeKinkyDungeonEnd") && !KDPatched;
}

/**
 * Returns whether or not the player is the one playing, which determines whether or not to draw the UI and struggle groups
 * @returns {boolean} - If the player is the game player
 */
function KinkyDungeonIsPlayer() {
	return (!KinkyDungeonPlayerCharacter || KinkyDungeonPlayerCharacter == Player) ;
}

/**
 * Runs the kinky dungeon game and draws its components on screen
 * @returns {void} - Nothing
 */

let KinkyDungeonCreditsPos = 0;
let KDMaxPatronPerPage = 4;
let KDMaxPatron = 5;
let KinkyDungeonPatronPos = 0;
let KinkyDungeonFastWait = true;
let KinkyDungeonTempWait = false;
let KinkyDungeonSexyMode = false;
let KinkyDungeonClassMode = "Mage";
let KinkyDungeonRandomMode = false;
let KinkyDungeonEasyMode = 0;
let KinkyDungeonSaveMode = false;
let KinkyDungeonHardMode = false;
let KinkyDungeonExtremeMode = false;
let KinkyDungeonPerksMode = 0;
let KinkyDungeonSexyPiercing = false;
let KinkyDungeonSexyPlug = false;
let KDOldValue = "";
let KDOriginalValue = "";

let KDRestart = false;

let fpscounter = 0;
let lastfps = 0;
let dispfps = 60;

async function sleep(msec) {
	return new Promise(resolve => setTimeout(resolve, msec));
}

let KDMarkAsCache = [];

let lastGlobalRefresh = 0;
let GlobalRefreshInterval = 2000;
let KDGlobalRefresh = false;

let KDLogoStartTime = 0;
let KDLogoEndTime = 2500;
let KDLogoEndTime2 = 500;

function KinkyDungeonRun() {
	if (!KDLogoStartTime) KDLogoStartTime = CommonTime();

	if (KinkyDungeonPlayer?.Appearance) {
		for (let A = 0; A < KinkyDungeonPlayer.Appearance.length; A++) {
			if (KinkyDungeonPlayer.Appearance[A]?.Asset?.Name?.includes("Penis")) {
				KinkyDungeonPlayer.Appearance.splice(A, 1);
				A--;
			}
		}
	}
	if (StandalonePatched && KDCurrentModels) {
		let refresh = false;
		if (CommonTime() > lastGlobalRefresh + GlobalRefreshInterval) {
			lastGlobalRefresh = CommonTime();
			//console.log("refresh");
			refresh = true;
		}

		for (let MC of KDCurrentModels.values()) {


			// Cull containers that werent drawn this turn
			for (let Container of MC.Containers.entries()) {

				if (!MC.ContainersDrawn.has(Container[0]) && Container[1]) {
					Container[1].Mesh.parent.removeChild(Container[1].Container);
					MC.Containers.delete(Container[0]);
					Container[1].Mesh.destroy();
					Container[1].Container.destroy();
					Container[1].RenderTexture.destroy();
				} else if (refresh)
					MC.Update.delete(Container[0]);
			}

			MC.ContainersDrawn.clear();
		}
	}


	// Override right click and make it trigger the Skip key
	// Normally we don't override right click on websites but this is a game
	if (!CommonIsMobile)
		document.addEventListener('contextmenu', event => {
			if (CommonIsMobile || document.activeElement?.id != "MainCanvas") {
				// Nothing!!
			} else {
				event.preventDefault();
				let code = KinkyDungeonKeySkip[0];
				if (!KinkyDungeonKeybindingCurrentKey) {
					KinkyDungeonKeybindingCurrentKey = code;
					KDLastKeyTime[KinkyDungeonKeybindingCurrentKey] = CommonTime() + 100;
					// We also press it for 100 msec
					(async function() {
						KinkyDungeonGameKey.keyPressed[9] = true;
						await sleep(100);
						KinkyDungeonGameKey.keyPressed[9] = false;
					})();
				}
			}
		});

	// Reset the sprites drawn cache
	kdSpritesDrawn = new Map();

	KDLastButtonsCache = KDButtonsCache;
	KDButtonsCache = {};
	KDUpdateVibeSounds();
	KDUpdateMusic();

	if (!KDPatched)
		DrawButtonVis(1885, 25, 90, 90, "", "#ffffff", KinkyDungeonRootDirectory + "UI/Exit.png");

	// eslint-disable-next-line no-constant-condition
	if (true || KDToggles.Fullscreen) {
		KinkyDungeonGridWidthDisplay = 2000/KinkyDungeonGridSizeDisplay;//17;
		KinkyDungeonGridHeightDisplay = 1000/KinkyDungeonGridSizeDisplay;//9;
		canvasOffsetX = 0;
		canvasOffsetY = 0;
		KinkyDungeonCanvas.width = 2000;
		KinkyDungeonCanvas.height = 1000;
	} else {

		KinkyDungeonGridWidthDisplay = 16;
		KinkyDungeonGridHeightDisplay = 9;
		canvasOffsetX = canvasOffsetX_ui;
		canvasOffsetY = canvasOffsetY_ui;
		KinkyDungeonCanvas.width = KinkyDungeonGridSizeDisplay * KinkyDungeonGridWidthDisplay;
		KinkyDungeonCanvas.height = KinkyDungeonGridSizeDisplay * KinkyDungeonGridHeightDisplay;
	}
	// Check to see whether the player (outside of KD) needs a refresh
	KinkyDungeonCheckPlayerRefresh();


	if ((KinkyDungeonState != "Game" || KinkyDungeonDrawState != "Game") && KinkyDungeonState != "TileEditor") {
		let BG = (KinkyDungeonState == "Consent" || KinkyDungeonState == "Logo") ? "Logo" : "BrickWall";
		if (StandalonePatched) {
			KDDraw(kdcanvas, kdpixisprites, "bg", "Backgrounds/" + BG + ".png", 0, 0, CanvasWidth, CanvasHeight, undefined, {
				zIndex: -115,
			});
		} else {
			DrawImage("Backgrounds/" + BG + ".png", 0, 0);
		}
		kdgameboard.visible = false;
		kdgamefog.visible = false;
		kdminimap.visible = false;
	} else {
		kdgameboard.visible = true;
		kdminimap.visible = KinkyDungeonState != "TileEditor";
		kdgamefog.visible = KinkyDungeonState != "TileEditor";
	}
	// Draw the characters
	if (KinkyDungeonState != "Consent" && KinkyDungeonState != "Logo" && (KinkyDungeonState != "Game" || KinkyDungeonDrawState != "Game") && KinkyDungeonState != "Stats" && KinkyDungeonState != "TileEditor")
		DrawCharacter(KinkyDungeonPlayer, 0, 0, 1);


	if (KinkyDungeonState == "Logo") {
		if (CommonTime() > KDLogoStartTime + KDLogoEndTime) {
			KinkyDungeonState = "Consent";
			KDLogoStartTime = CommonTime();
		} else {
			// Draw the strait-laced logo
			KDDraw(kdcanvas, kdpixisprites, "logo", KinkyDungeonRootDirectory + "Logo.png", 500, 0, 1000, 1000, undefined, {
				zIndex: 0,
				alpha: 0.5 - 0.5*Math.cos(Math.PI * 2 * (CommonTime() - KDLogoStartTime) / KDLogoEndTime),
			});
		}
	} else
	if (KinkyDungeonState == "Mods") {

		DrawButtonKDEx("mods_back", (bdata) => {
			KinkyDungeonState = "Menu";
			KDExecuteMods();
			return true;
		}, true, 975, 850, 350, 64, TextGet("KinkyDungeonLoadBack"), "#ffffff", "");

		DrawButtonKDEx("mods_load", (bdata) => {
			getFileInput();
			return true;
		}, true, 975, 250, 350, 64, TextGet("KinkyDungeonLoadMod"), "#ffffff", "");
		DrawTextKD(TextGet("KinkyDungeonLoadModWarning1"), 1175, 100, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("KinkyDungeonLoadModWarning2"), 1175, 150, "#ffffff", KDTextGray2);

		KDDrawMods();

	} else if (KinkyDungeonState == "Credits") {
		let credits = TextGet("KinkyDungeonCreditsList" + KinkyDungeonCreditsPos).split('|');
		let i = 0;
		for (let c of credits) {
			DrawTextKD(c, 550, 25 + 40 * i, "#ffffff", KDTextGray2, undefined, "left");
			i++;
		}

		DrawButtonVis(1870, 930, 110, 64, TextGet("KinkyDungeonBack"), "#ffffff", "");
		DrawButtonVis(1730, 930, 110, 64, TextGet("KinkyDungeonNext"), "#ffffff", "");
	} else if (KinkyDungeonState == "Patrons") {
		let credits = KDPatrons;//TextGet("KinkyDungeonPatronsList" + x).split('|');
		DrawTextKD(TextGet("KinkyDungeonPatronsList"), 550, 25, "#ffffff", KDTextGray2, undefined, "left");
		let col = 0;
		let iter = 1;
		let height = 30;
		let maxPatron = Math.floor(975/height);
		let maxcolumn = 6;
		let colwidth = 250;
		for (let i = KinkyDungeonPatronPos * maxPatron; i < credits.length; i++) {
			let c = credits[i];
			let yy = 25 + height * iter;
			DrawTextFitKD(c, 550 + colwidth * (col), yy, colwidth - 10, "#ffffff", KDTextGray2, 24, "left", 40);
			iter++;
			if (iter > maxPatron) {
				iter = 1;
				col += 1;
			}
			if (col > maxcolumn) break;
		}


		DrawButtonVis(1870, 930, 110, 64, TextGet("KinkyDungeonBack"), "#ffffff", "");
		DrawButtonKDEx("patronnext", (bdata) => {
			if (KinkyDungeonPatronPos * maxPatron < credits.length - maxPatron * maxPatron) KinkyDungeonPatronPos += 1;
			else KinkyDungeonPatronPos = 0;
			return true;
		}, true, 1730, 930, 110, 64, TextGet("KinkyDungeonNext"), "#ffffff", "");
		//DrawButtonVis(1730, 930, 110, 64, TextGet("KinkyDungeonNext"), "#ffffff", "");
	} else if (KinkyDungeonState == "Menu") {
		KinkyDungeonGameFlag = false;
		DrawCheckboxVis(1700, 100, 64, 64, TextGet("KDToggleSound"), KDToggles.Sound, false, "#ffffff");
		// Draw temp start screen
		if (KDLose) {
			DrawTextKD(TextGet("End"), 1000, 250, "#ffffff", KDTextGray2);
			//DrawTextKD(TextGet("End2"), 1000, 310, "#ffffff", KDTextGray2);
			DrawTextKD(TextGet("End3"), 1000, 290, "#ffffff", KDTextGray2);
		} else if (!KDPatched) {
			//DrawTextKD(TextGet("Intro"), 1250, 250, "#ffffff", KDTextGray2);
			//DrawTextKD(TextGet("Intro2"), 1250, 300, "#ffffff", KDTextGray2);
			//DrawTextKD(TextGet("Intro3"), 1250, 350, "#ffffff", KDTextGray2);
			DrawTextKD(TextGet("Intro4BC"), 1000, 960, "#ffffff", KDTextGray2);
		}

		let str = TextGet("KinkyDungeon");
		DrawTextKD(str.substring(0, Math.min(str.length, Math.round((CommonTime()-KDStartTime)/100))), 1000, 80, "#ffffff", KDTextGray2, 84);
		DrawTextKD(TextGet("KDLogo2"), 1000, 180, "#ffffff", KDTextGray2);
		//DrawTextKD(TextGet("KinkyDungeon"), 1000, 200, "#ffffff", KDTextGray2);

		if (ArcadeDeviousChallenge && KinkyDungeonDeviousDungeonAvailable() && !KDPatched)
			DrawTextKD(TextGet("DeviousChallenge"), 1000, 925, "#ffffff", KDTextGray2);


		DrawButtonKDEx("GameContinue", () => {
			KinkyDungeonStartNewGame(true);
			return true;
		}, true, 1000-350/2, 360, 350, 64, TextGet("GameContinue"), localStorage.getItem('KinkyDungeonSave') ? "#ffffff" : "pink", "");
		DrawButtonKDEx("GameStart", () => {
			KinkyDungeonState = "Diff";
			KinkyDungeonLoadStats();
			return true;
		}, true, 1000-350/2, 440, 350, 64, TextGet("GameStart"), "#ffffff", "");
		DrawButtonKDEx("LoadGame", () => {
			KinkyDungeonState = "Load";
			ElementCreateTextArea("saveInputField");
			return true;
		}, true, 1000-350/2, 520, 350, 64, TextGet("LoadGame"), "#ffffff", "");
		DrawButtonKDEx("GameConfigKeys", () => {
			KinkyDungeonState = "Keybindings";

			if (!KinkyDungeonKeybindings)
				KDSetDefaultKeybindings();
			else {
				KinkyDungeonKeybindingsTemp = {};
				Object.assign(KinkyDungeonKeybindingsTemp, KinkyDungeonKeybindings);
			}
			return true;
		}, true, 1000-350/2, 600, 350, 64, TextGet("GameConfigKeys"), "#ffffff", "");
		DrawButtonKDEx("GameToggles", () => {
			KinkyDungeonState = "Toggles";
			return true;
		}, true, 1000-350/2, 680, 350, 64, TextGet("GameToggles"), "#ffffff", "");

		if (TestMode) {
			DrawButtonKDEx("TileEditor", () => {
				KDInitTileEditor();
				KinkyDungeonState = "TileEditor";
				return true;
			}, true, 1000-350/2, 760, 350, 64, "Tile Editor", "#ffffff", "");
		}

		if (!StandalonePatched) {

			DrawButtonVis(460, 942, 220, 50, TextGet((KinkyDungeonReplaceConfirm > 0 ) ? "KinkyDungeonConfirm" : "KinkyDungeonDressPlayerReset"), "#ffffff", "");
			DrawButtonVis(690, 942, 150, 50, TextGet("KinkyDungeonDressPlayerImport"), "#ffffff", "");
		}


		DrawButtonKDEx("GoToWardrobe", (bdata) => {

			if (StandalonePatched) {
				KinkyDungeonState = "Wardrobe";
				KDPlayerSetPose = false;
				KDInitCurrentPose();
				KinkyDungeonInitializeDresses();
				KDUpdateModelList();
				KDRefreshOutfitInfo();
				let orig = localStorage.getItem("kinkydungeonappearance" + KDCurrentOutfit);
				let current = LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer));
				if (orig != current) KDOriginalValue = orig;
			}
			let appearance = LZString.decompressFromBase64(localStorage.getItem("kinkydungeonappearance" + KDCurrentOutfit));
			if (appearance) {
				CharacterAppearanceRestore(KinkyDungeonPlayer, appearance);
				CharacterRefresh(KinkyDungeonPlayer);
			}
			KinkyDungeonPlayer.OnlineSharedSettings = {AllowFullWardrobeAccess: true};
			KinkyDungeonNewDress = true;
			if (KDPatched && !StandalonePatched) {
				// Give all of the items

				for (let A = 0; A < Asset.length; A++)

					if ((Asset[A] != null) && (Asset[A].Group != null) && !InventoryAvailable(Player, Asset[A].Name, Asset[A].Group.Name))

						InventoryAdd(Player, Asset[A].Name, Asset[A].Group.Name);
			}

			CharacterReleaseTotal(KinkyDungeonPlayer);
			KinkyDungeonDressPlayer();
			KinkyDungeonPlayer.OnlineSharedSettings = {BlockBodyCosplay: false, AllowFullWardrobeAccess: true};
			if (!StandalonePatched) {
				if (!KDPatched)
					MainCanvas.textAlign = "center";
				CharacterAppearanceLoadCharacter(KinkyDungeonPlayer);
			}
			KinkyDungeonConfigAppearance = true;
			if (appearance) {
				CharacterAppearanceRestore(KinkyDungeonPlayer, appearance);
				CharacterRefresh(KinkyDungeonPlayer);
			}
			return true;
		}, true, 30, 942, 440, 50, TextGet("KinkyDungeonDressPlayer"), "#ffffff", "");


		DrawButtonVis(1850, 942, 135, 50, TextGet("KinkyDungeonCredits"), "#ffffff", "");
		DrawButtonVis(1700, 942, 135, 50, TextGet("KinkyDungeonPatrons"), "#ffffff", "");

		DrawButtonKDEx("Deviantart", (bdata) => {
			let url = 'https://www.deviantart.com/ada18980';
			window.open(url, '_blank');
			return true;
		}, true, 1700, 694, 280, 50, TextGet("KinkyDungeonDeviantart"), "#ffffff", "");

		DrawButtonKDEx("Patreon", (bdata) => {
			let url = 'https://www.patreon.com/ada18980';
			KDSendEvent('patreon');
			window.open(url, '_blank');
			return true;
		}, true, 1700, 754, 280, 50, TextGet("KinkyDungeonPatreon"), "#ffeecc", "");


		if (KDPatched || StandalonePatched) {
			DrawTextKD(TextGet("Language") + " ->", 1675, 898, "#ffffff", KDTextGray2, undefined, "right");
			DrawButtonVis(1700, 874, 280, 50, localStorage.getItem("BondageClubLanguage") || "EN", "#ffffff", "");
		}

		if (KDPatched) {

			DrawButtonKDEx("mods_button", (bdata) => {
				KinkyDungeonState = "Mods";
				return true;
			}, !KDModsLoaded, 1700, 814, 280, 50, TextGet(!KDModsLoaded ? "KDMods" : "KDModsLoaded"), "#ffffff", "");
		}

		if (KDRestart)
			DrawTextKD(TextGet("RestartNeeded" + (localStorage.getItem("BondageClubLanguage") || "EN")), 1840, 600, "#ffffff", KDTextGray2);
	} else if (KinkyDungeonState == "Consent") {
		if (CommonTime() < KDLogoStartTime + KDLogoEndTime2) {
			CommonTime(); // ...
			FillRectKD(kdcanvas, kdpixisprites, "greyfade", {
				Left: 0, Top: 0, Width: 2000,
				Height: 1000,
				Color: "#383F4F", alpha: Math.max(0, 1 - (CommonTime() - KDLogoStartTime) / KDLogoEndTime2), zIndex: 200
			});
		}
		let str = TextGet("KinkyDungeon");
		DrawTextKD(str.substring(0, Math.min(str.length, Math.round((CommonTime()-KDStartTime)/100))), 1000, 80, "#ffffff", KDTextGray2, 84);
		DrawTextKD(TextGet("KDLogo2"), 1000, 180, "#ffffff", KDTextGray2);

		if (!KDLoadingFinished) {
			DrawTextKD(TextGet("KDLoading") + Math.round(100 * KDLoadingDone / KDLoadingMax) + "%", 1000, 950, "#ffffff", KDTextGray2);
		} else {

			if (KDPatched) {
				DrawButtonVis(1000-450/2, 720, 450, 64, TextGet("KDOptIn"), KDLoadingFinished ? "#ffffff" : "#888888", "");
				DrawButtonVis(1000-450/2, 820, 450, 64, TextGet("KDOptOut"), KDLoadingFinished ? "#ffffff" : "#888888", "");

				DrawTextKD(TextGet("KinkyDungeonConsent"), 1000, 450, "#ffffff", KDTextGray2);
				DrawTextKD(TextGet("KinkyDungeonConsent2"), 1000, 500, "#ffffff", KDTextGray2);
				DrawTextKD(TextGet("KinkyDungeonConsent3"), 1000, 550, "#ffffff", KDTextGray2);
			} else {
				DrawButtonVis(1000-450/2, 820, 450, 64, TextGet("KDStartGame"), KDLoadingFinished ? "#ffffff" : "#888888", "");
			}

		}
		if (KDLoadingDone >= KDLoadingMax) {

			/*for (let c of PIXI.Cache._cache.keys()) {
				KDTex(c);
			}*/
			KDLoadingFinished = true;
		}

	} else if (KinkyDungeonState == "TileEditor") {
		KDDrawTileEditor();
	} else if (KinkyDungeonState == "Load") {
		DrawButtonVis(875, 750, 350, 64, TextGet("KinkyDungeonLoadConfirm"), "#ffffff", "");
		DrawButtonVis(1275, 750, 350, 64, TextGet("KinkyDungeonLoadBack"), "#ffffff", "");

		ElementPosition("saveInputField", 1250, 550, 1000, 230);
	} else if (KinkyDungeonState == "LoadOutfit") {
		DrawButtonVis(875, 750, 350, 64, TextGet("LoadOutfit"), "#ffffff", "");
		DrawButtonVis(1275, 750, 350, 64, TextGet("KDWardrobeBackTo" + (StandalonePatched ? "Wardrobe" : "Menu")), "#ffffff", "");

		let newValue = ElementValue("saveInputField");
		if (newValue != KDOldValue) {
			let decompressed = LZString.decompressFromBase64(ElementValue("saveInputField"));
			if (decompressed) {
				let origAppearance = KinkyDungeonPlayer.Appearance;
				try {
					console.log("Trying BC code...");
					CharacterAppearanceRestore(KinkyDungeonPlayer, decompressed);
					CharacterRefresh(KinkyDungeonPlayer);
					KDOldValue = newValue;
					KDInitProtectedGroups();

					if (KinkyDungeonPlayer.Appearance.length == 0)
						throw new DOMException();
				} catch (e) {
					console.log("Trying BCX code...");
					// If we fail, it might be a BCX code. try it!
					KinkyDungeonPlayer.Appearance = origAppearance;
					try {
						let parsed = JSON.parse(decompressed);
						if (parsed.length > 0) {
							if (!StandalonePatched) {
								for (let g of parsed) {
									InventoryWear(KinkyDungeonPlayer, g.Name, g.Group, g.Color);
								}
								CharacterRefresh(KinkyDungeonPlayer);
								ElementValue("saveInputField", LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer)));
							}
							KDOldValue = newValue;
							KDInitProtectedGroups();
						} else {
							console.log("Invalid code. Maybe its corrupt?");
						}
					} catch (error) {
						console.log("Invalid code.");
					}
				}
			}
		}

		ElementPosition("saveInputField", 1250, 550, 1000, 230);
	} else if (KinkyDungeonState == "Journey") {
		DrawTextKD(TextGet("KinkyDungeonJourney"), 1250, 300, "#ffffff", KDTextGray2);
		DrawButtonVis(875, 350, 750, 64, TextGet("KinkyDungeonJourney0"), "#ffffff", "");
		DrawButtonVis(875, 450, 750, 64, TextGet("KinkyDungeonJourney1"), "#ffffff", "");
		DrawButtonVis(875, 550, 750, 64, TextGet("KinkyDungeonJourney2"), "#ffffff", "");
		DrawButtonVis(1075, 850, 350, 64, TextGet("KinkyDungeonLoadBack"), "#ffffff", "");

	} else if (KinkyDungeonState == "Diff") {
		DrawTextKD(TextGet("KinkyDungeonDifficulty"), 1250, 50, "#ffffff", KDTextGray1, 48);
		//DrawButtonVis(875, 350, 750, 64, TextGet("KinkyDungeonDifficulty0"), "#ffffff", "");
		//DrawButtonVis(875, 450, 750, 64, TextGet("KinkyDungeonDifficulty3"), "#ffffff", "");
		//DrawButtonVis(875, 550, 750, 64, TextGet("KinkyDungeonDifficulty1"), "#ffffff", "");
		DrawButtonKDEx("startQuick", () => {
			KinkyDungeonStatsChoice = new Map();
			KDUpdatePlugSettings(true);
			KDLose = false;
			KinkyDungeonStartNewGame();
			return true;
		}, true, 875, 650, 750, 64, TextGet("KinkyDungeonStartGameQuick"), "#ffffff", "");
		DrawButtonKDEx("startGame", () => {
			KinkyDungeonState = "Stats";
			KDUpdatePlugSettings(true);
			return true;
		}, true, 875, 720, 750, 64, TextGet("KinkyDungeonStartGameAdv"), "#ffffff", "");



		if (MouseIn(875, 650, 750, 64)) {
			DrawTextFitKD(TextGet("KinkyDungeonStartGameDesc"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}
		if (MouseIn(875, 720, 750, 64)) {
			DrawTextFitKD(TextGet("KinkyDungeonStartGameDescAdc"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}
		DrawButtonVis(1075, 900, 350, 64, TextGet("KinkyDungeonLoadBack"), "#ffffff", "");


		let buttonswidth = 168;
		let buttonsheight = 50;
		let buttonspad = 25;
		let buttonsypad = 10;
		let buttonsstart = 875;
		let X = 0;
		let Y = 0;

		DrawTextFitKD(TextGet("KDClasses"), 875 - 50, 190 + 22, 300, "#ffffff", KDTextGray1, undefined, "right");

		let classCount = Object.keys(KDClassStart).length;
		for (let i = 0; i < classCount; i++) {
			X = i % 4;
			Y = Math.floor(i / 4);

			DrawButtonKDEx("Class" + i, (bdata) => {
				KinkyDungeonClassMode = Object.keys(KDClassStart)[i];
				localStorage.setItem("KinkyDungeonClassMode", "" + KinkyDungeonClassMode);
				return true;
			}, (!KDClassReqs[Object.keys(KDClassStart)[i]]) || KDClassReqs[Object.keys(KDClassStart)[i]](),
			buttonsstart + (buttonspad + buttonswidth) * X, 190 + Y*(buttonsheight + buttonsypad), buttonswidth, buttonsheight, TextGet("KinkyDungeonClassMode" + i),
				((!KDClassReqs[Object.keys(KDClassStart)[i]]) || KDClassReqs[Object.keys(KDClassStart)[i]]()) ?
				(KinkyDungeonClassMode == Object.keys(KDClassStart)[i] ? "#ffffff" : "#888888")
				: "#ff5555", "");
			if (MouseIn(buttonsstart + (buttonspad + buttonswidth) * X, 210 + Y*(buttonsheight + buttonsypad), buttonswidth, buttonsheight)) {
				DrawTextFitKD(TextGet("KinkyDungeonClassModeDesc" + i), 1250, 120, 1000, "#ffffff", KDTextGray0);
			}
		}



		DrawTextFitKD(TextGet("KDSexyMode"), 875 - 50, 350 + 2, 300, "#ffffff", KDTextGray1, undefined, "right");


		DrawButtonKDEx("KinkyDungeonSexyMode0", (bdata) => {
			KinkyDungeonSexyMode = false;
			KDUpdatePlugSettings(true);
			localStorage.setItem("KinkyDungeonSexyMode", KinkyDungeonSexyMode ? "True" : "False");
			return true;
		}, true, 875, 330, 275, 50, TextGet("KinkyDungeonSexyMode0"), !KinkyDungeonSexyMode ? "#ffffff" : "#888888", "");
		if (MouseInKD("KinkyDungeonSexyMode0")) {
			DrawTextFitKD(TextGet("KinkyDungeonSexyModeDesc0"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonSexyMode1", (bdata) => {
			KinkyDungeonSexyMode = true;
			KDUpdatePlugSettings(true);
			localStorage.setItem("KinkyDungeonSexyMode", KinkyDungeonSexyMode ? "True" : "False");
			return true;
		}, true, 1175, 330, 275, 50, TextGet("KinkyDungeonSexyMode1"), KinkyDungeonSexyMode ? "#ffffff" : "#888888", "");
		if (MouseInKD("KinkyDungeonSexyMode1")) {
			DrawTextFitKD(TextGet("KinkyDungeonSexyModeDesc1"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawTextFitKD(TextGet("KDRandomMode"), 875 - 50, 410 + 2, 300, "#ffffff", KDTextGray1, undefined, "right");


		DrawButtonKDEx("KinkyDungeonRandomMode0", (bdata) => {
			KinkyDungeonRandomMode = false;
			localStorage.setItem("KinkyDungeonRandomMode", KinkyDungeonRandomMode ? "True" : "False");
			return true;
		}, true, 875, 390, 275, 50, TextGet("KinkyDungeonRandomMode0"), !KinkyDungeonRandomMode ? "#ffffff" : "#888888", "");
		if (MouseInKD("KinkyDungeonRandomMode0")) {
			DrawTextFitKD(TextGet("KinkyDungeonRandomModeDesc0"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonRandomMode1", (bdata) => {
			KinkyDungeonRandomMode = true;
			localStorage.setItem("KinkyDungeonRandomMode", KinkyDungeonRandomMode ? "True" : "False");
			return true;
		}, true, 1175, 390, 275, 50, TextGet("KinkyDungeonRandomMode1"), KinkyDungeonRandomMode ? "#ffffff" : "#888888", "");
		if (MouseInKD("KinkyDungeonRandomMode1")) {
			DrawTextFitKD(TextGet("KinkyDungeonRandomModeDesc1"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawTextFitKD(TextGet("KDSaveMode"), 875 - 50, 470 + 2, 300, "#ffffff", KDTextGray1, undefined, "right");


		DrawButtonKDEx("KinkyDungeonSaveMode0", (bdata) => {
			KinkyDungeonSaveMode = false;
			localStorage.setItem("KinkyDungeonSaveMode", KinkyDungeonSaveMode ? "True" : "False");
			return true;
		}, true, 875, 450, 275, 50, TextGet("KinkyDungeonSaveMode0"), !KinkyDungeonSaveMode ? "#ffffff" : "#888888", "");
		if (MouseInKD("KinkyDungeonSaveMode0")) {
			DrawTextFitKD(TextGet("KinkyDungeonSaveModeDesc0"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonSaveMode1", (bdata) => {
			KinkyDungeonSaveMode = true;
			localStorage.setItem("KinkyDungeonSaveMode", KinkyDungeonSaveMode ? "True" : "False");
			return true;
		}, true, 1175, 450, 275, 50, TextGet("KinkyDungeonSaveMode1"), KinkyDungeonSaveMode ? "#ffffff" : "#888888", "");
		if (MouseInKD("KinkyDungeonSaveMode1")) {
			DrawTextFitKD(TextGet("KinkyDungeonSaveModeDesc1"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}


		DrawTextFitKD(TextGet("KDHardMode"), 875 - 50, 530 + 2, 300, "#ffffff", KDTextGray1, undefined, "right");

		DrawButtonKDEx("KinkyDungeonHardMode0", (bdata) => {
			KinkyDungeonExtremeMode = false;
			KinkyDungeonHardMode = false;
			localStorage.setItem("KinkyDungeonHardMode", KinkyDungeonHardMode ? "True" : "False");
			localStorage.setItem("KinkyDungeonExtremeMode", KinkyDungeonExtremeMode ? "True" : "False");
			return true;
		}, true, 875, 510, 275, 50, TextGet("KinkyDungeonHardMode0"), !KinkyDungeonHardMode ? "#ffffff" : "#888888", "");
		if (MouseInKD("KinkyDungeonHardMode")) {
			DrawTextFitKD(TextGet("KinkyDungeonHardModeDesc0"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonHardMode1", (bdata) => {
			if (KinkyDungeonHardMode) {
				KinkyDungeonExtremeMode = true;
			}
			KinkyDungeonHardMode = true;
			localStorage.setItem("KinkyDungeonHardMode", KinkyDungeonHardMode ? "True" : "False");
			localStorage.setItem("KinkyDungeonExtremeMode", KinkyDungeonExtremeMode ? "True" : "False");
			return true;
		}, true, 1175, 510, 275, 50, TextGet(KinkyDungeonExtremeMode ? "KinkyDungeonExtremeMode" : "KinkyDungeonHardMode1"), KinkyDungeonHardMode ? "#ffffff" : "#888888", "");
		if (MouseInKD("KinkyDungeonHardMode1")) {
			DrawTextFitKD(TextGet(KinkyDungeonExtremeMode ? "KinkyDungeonExtremeModeDesc" : "KinkyDungeonHardModeDesc1"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}


		DrawTextFitKD(TextGet("KDEasyMode"), 875 - 50, 590 + 2, 300, "#ffffff", KDTextGray1, undefined, "right");


		DrawButtonKDEx("KinkyDungeonEasyMode0", (bdata) => {
			KinkyDungeonEasyMode = 0;
			localStorage.setItem("KinkyDungeonEasyMode", KinkyDungeonEasyMode + "");
			return true;
		}, true, 1075, 570, 175, 50, TextGet("KinkyDungeonEasyMode0"), KinkyDungeonEasyMode == 0 ? "#ffffff" : "#888888", "");
		if (MouseInKD("KinkyDungeonEasyMode0")) {
			DrawTextFitKD(TextGet("KinkyDungeonEasyModeDesc0"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonEasyMode1", (bdata) => {
			KinkyDungeonEasyMode = 1;
			localStorage.setItem("KinkyDungeonEasyMode", KinkyDungeonEasyMode + "");
			return true;
		}, true, 875, 570, 175, 50, TextGet("KinkyDungeonEasyMode1"), KinkyDungeonEasyMode == 1 ? "#ffffff" : "#888888", "");
		if (MouseInKD("KinkyDungeonEasyMode1")) {
			DrawTextFitKD(TextGet("KinkyDungeonEasyModeDesc1"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonEasyMode2", (bdata) => {
			KinkyDungeonEasyMode = 2;
			localStorage.setItem("KinkyDungeonEasyMode", KinkyDungeonEasyMode + "");
			return true;
		}, true, 1275, 570, 175, 50, TextGet("KinkyDungeonEasyMode2"), KinkyDungeonEasyMode == 2 ? "#ffffff" : "#888888", "");
		if (MouseInKD("KinkyDungeonEasyMode2")) {
			DrawTextFitKD(TextGet("KinkyDungeonEasyModeDesc2"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		if (KinkyDungeonSexyMode) {

			DrawCheckboxKDEx("KinkyDungeonSexyPlugs", (bdata) => {
				KinkyDungeonSexyPlug = !KinkyDungeonSexyPlug;
				localStorage.setItem("KinkyDungeonSexyPlug", KinkyDungeonSexyPlug ? "True" : "False");
				return true;
			}, true, 1500, 330, 64, 64, TextGet("KinkyDungeonSexyPlugs"), KinkyDungeonSexyPlug, false, "#ffffff");

			/*DrawCheckboxKDEx("KinkyDungeonSexyPiercings", (bdata) => {
				KinkyDungeonSexyPiercing = !KinkyDungeonSexyPiercing;
				localStorage.setItem("KinkyDungeonSexyPiercing", KinkyDungeonSexyPiercing ? "True" : "False");
				return true;
			}, true, 1500, 430, 64, 64, TextGet("KinkyDungeonSexyPiercings"), KinkyDungeonSexyPiercing, false, "#ffffff");*/
		}




		DrawTextFitKD(TextGet("KDPerksMode"), 875 - 50, 790 + 22, 300, "#ffffff", KDTextGray1, undefined, "right");

		DrawButtonKDEx("KinkyDungeonPerksMode0", (bdata) => {
			KinkyDungeonPerksMode = 0;
			localStorage.setItem("KinkyDungeonPerksMode", KinkyDungeonPerksMode + "");
			return true;
		}, true, 875, 790, 225, 50, TextGet("KinkyDungeonPerksMode0"), KinkyDungeonPerksMode == 0 ? "#ffffff" : "#888888", "");
		if (MouseInKD("KinkyDungeonPerksMode0")) {
			DrawTextFitKD(TextGet("KinkyDungeonPerksModeDesc0"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonPerksMode1", (bdata) => {
			KinkyDungeonPerksMode = 1;
			localStorage.setItem("KinkyDungeonPerksMode", KinkyDungeonPerksMode + "");
			return true;
		}, true, 1137, 790, 226, 50, TextGet("KinkyDungeonPerksMode1"), KinkyDungeonPerksMode == 1 ? "#ffffff" : "#888888", "");
		if (MouseInKD("KinkyDungeonPerksMode1")) {
			DrawTextFitKD(TextGet("KinkyDungeonPerksModeDesc1"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonPerksMode2", (bdata) => {
			KinkyDungeonPerksMode = 2;
			localStorage.setItem("KinkyDungeonPerksMode", KinkyDungeonPerksMode + "");
			return true;
		}, true, 1400, 790, 225, 50, TextGet("KinkyDungeonPerksMode2"), KinkyDungeonPerksMode == 2 ? "#ffffff" : "#888888", "");
		if (MouseInKD("KinkyDungeonPerksMode2")) {
			DrawTextFitKD(TextGet("KinkyDungeonPerksModeDesc2"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}


	} else if (KinkyDungeonState == "Wardrobe") {
		KDDrawWardrobe("menu");
	} else if (KinkyDungeonState == "Stats") {

		let tooltip = KinkyDungeonDrawPerks(false);
		DrawTextKD(TextGet("KinkyDungeonStats"), 1000, 30, "#ffffff", KDTextGray2);
		//DrawTextKD(TextGet("KinkyDungeonStats2"), 1000, 80, "#ffffff", KDTextGray2);
		if (!tooltip) {
			let points = KinkyDungeonGetStatPoints(KinkyDungeonStatsChoice);
			//let hardmode = points >= KDHardModeThresh ? TextGet("KDHardMode") : "";
			DrawTextKD(TextGet("KinkyDungeonStatPoints").replace("AMOUNT", "" + points), 1000, 150, "#ffffff", KDTextGray2);
		}

		let minPoints = 0;

		DrawButtonKDEx("KDPerksStart", (bdata) => {
			if (KinkyDungeonGetStatPoints(KinkyDungeonStatsChoice) >= minPoints) {
				//KinkyDungeonState = "Diff";
				KDLose = false;
				KinkyDungeonStartNewGame();
			}
			return true;
		}, true, 875, 920, 350, 64, TextGet("KinkyDungeonStartGame"), KinkyDungeonGetStatPoints(KinkyDungeonStatsChoice) >= minPoints ? "#ffffff" : "pink", "");

		DrawButtonKDEx("KDPerksBack", (bdata) => {
			KinkyDungeonState = "Menu";
			return true;
		}, true, 1275, 920, 350, 64, TextGet("KinkyDungeonLoadBack"), "#ffffff", "");

		DrawButtonKDEx("KDPerksClear", (bdata) => {
			KinkyDungeonStatsChoice = new Map();
			KDUpdatePlugSettings(true);
			return true;
		}, true, 40, 920, 190, 64, TextGet("KinkyDungeonClearAll"), "#ffffff", "");

		DrawButtonKDEx("KDPerkConfig1", (bdata) => {
			KinkyDungeonPerksConfig = "1";
			KinkyDungeonLoadStats();
			return true;
		}, true, 270, 930, 100, 54, TextGet("KinkyDungeonConfig") + "1", KinkyDungeonPerksConfig == "1" ? "#ffffff" : "#888888", "");

		DrawButtonKDEx("KDPerkConfig2", (bdata) => {
			KinkyDungeonPerksConfig = "2";
			KinkyDungeonLoadStats();
			return true;
		}, true, 380, 930, 100, 54, TextGet("KinkyDungeonConfig") + "2", KinkyDungeonPerksConfig == "2" ? "#ffffff" : "#888888", "");

		DrawButtonKDEx("KDPerkConfig3", (bdata) => {
			KinkyDungeonPerksConfig = "3";
			KinkyDungeonLoadStats();
			return true;
		}, true, 490, 930, 100, 54, TextGet("KinkyDungeonConfig") + "3", KinkyDungeonPerksConfig == "3" ? "#ffffff" : "#888888", "");


		let TF = KDTextField("PerksFilter", 600, 930, 210, 54, "text", "", "45");
		if (TF.Created) {
			TF.Element.oninput = (event) => {
				KDPerksFilter = ElementValue("PerksFilter");
			};
		}
		DrawTextFitKD(TextGet("KinkyDungeonFilter"), 600 + 210/2, 930 + 54/2, 210, "#aaaaaa");


		DrawButtonKDEx("copyperks", (bdata) => {
			let txt = "";
			for (let k of KinkyDungeonStatsChoice.keys()) {
				if (!k.startsWith("arousal") && !k.endsWith("Mode")) txt += (txt ? "\n" : "") + k;
			}
			navigator.clipboard.writeText(txt);
			return true;
		}, true, 1850, 930, 140, 54, TextGet("KinkyDungeonCopyPerks"), "#ffffff", "");


		DrawButtonKDEx("pasteperks", (bdata) => {
			navigator.clipboard.readText()
				.then(text => {
					let list = text.split('\n');
					let changed = 1;
					let iter = 0;
					while (changed > 0 && iter < 1000) {
						changed = 0;
						for (let l of list) {
							let lp = l.replace('\r','');// List processed
							// Find the perk that matches the name
							for (let perk of Object.entries(KinkyDungeonStatsPresets)) {
								if (perk[0] == lp && KDValidatePerk(perk[1])) {
									KinkyDungeonStatsChoice.set(perk[0], true);
									changed += 1;
								}
							}
						}
						iter += 1;
					}
				})
				.catch(err => {
					console.error('Failed to read clipboard contents: ', err);
				});
			return true;
		}, true, 1700, 930, 140, 54, TextGet("KinkyDungeonPastePerks"), "#ffffff", "");


		if (KinkyDungeonKeybindingCurrentKey && KinkyDungeonGameKeyDown()) {
			if (KinkyDungeonKeybindingCurrentKey)
				KDLastKeyTime[KinkyDungeonKeybindingCurrentKey] = CommonTime();
			KinkyDungeonKeybindingCurrentKey = '';
		}
	} else if (KinkyDungeonState == "Save") {
		// Draw temp start screen
		DrawTextKD(TextGet("KinkyDungeonSaveIntro0"), 1250, 350, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("KinkyDungeonSaveIntro"), 1250, 475, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("KinkyDungeonSaveIntro2"), 1250, 550, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("KinkyDungeonSaveIntro3"), 1250, 625, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("KinkyDungeonSaveIntro4"), 1250, 700, "#ffffff", KDTextGray2);

		ElementPosition("saveDataField", 1250, 150, 1000, 230);

		//DrawButtonVis(875, 750, 350, 64, TextGet("KinkyDungeonGameSave"), "#ffffff", "");
		DrawButtonVis(1075, 750, 350, 64, TextGet("KinkyDungeonGameContinue"), "#ffffff", "");
	} else if (KinkyDungeonState == "Game") {
		KinkyDungeonGameRunning = true;
		KinkyDungeonGameFlag = true;
		KinkyDungeonDrawGame();
		if (KinkyDungeonInputQueue.length < 1) {
			let _CharacterRefresh = CharacterRefresh;
			let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
			CharacterRefresh = () => {KDRefresh = true;};
			CharacterAppearanceBuildCanvas = () => {};


			if (KDGameData.SleepTurns > 0) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					KDGameData.SleepTurns -= 1;
					if (KinkyDungeonAggressive())
						KinkyDungeonTotalSleepTurns += 1;
					if (KinkyDungeonStatStamina >= KinkyDungeonStatStaminaMax && KinkyDungeonStatWill >= KinkyDungeonStatWillMax)  {
						KDGameData.SleepTurns = 0;
					}
					// Decrease offer fatigue
					KDIncreaseOfferFatigue(-1);
					KDSendInput("tick", {delta: 1, sleep: true}, false, true);
					KinkyDungeonSleepTime = CommonTime() + 10;
				}
				if (KDGameData.SleepTurns == 0) {
					KinkyDungeonChangeStamina(0);
					KinkyDungeonChangeWill(0);
					KDGameData.KneelTurns = 1;
				}
			} else if (KDGameData.PlaySelfTurns > 0) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					KDSendInput("tick", {delta: 1}, false, true);
					KDGameData.PlaySelfTurns -= 1;
					KinkyDungeonSleepTime = CommonTime() + (KinkyDungeonFlags.get("PlayerOrgasm") ? KinkyDungeonOrgasmTime : KinkyDungeonPlaySelfTime) * (0.25 + KDAnimSpeed * 0.75);
				}
				if (KDGameData.SleepTurns == 0) {
					KinkyDungeonChangeStamina(0);
				}
			} else if (KinkyDungeonStatFreeze > 0) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					KinkyDungeonStatFreeze -= 1;
					KDSendInput("tick", {delta: 1, NoUpdate: false, NoMsgTick: true}, false, true);
					KinkyDungeonSleepTime = CommonTime() + KinkyDungeonFreezeTime * (0.25 + KDAnimSpeed * 0.75);
				}
			} else if (KinkyDungeonSlowMoveTurns > 0) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					KinkyDungeonSlowMoveTurns -= 1;
					KDSendInput("tick", {delta: 1, NoUpdate: false, NoMsgTick: true}, false, true);
					KinkyDungeonSleepTime = CommonTime() + 150 * (0.25 + KDAnimSpeed * 0.75);
				}
			} else if (KinkyDungeonFastMove && KinkyDungeonFastMovePath && KinkyDungeonFastMovePath.length > 0) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					if (KinkyDungeonFastMovePath.length > 0) {
						let next = KinkyDungeonFastMovePath[0];
						//KinkyDungeonFastMovePath.splice(0, 1);
						if (Math.max(Math.abs(next.x-KinkyDungeonPlayerEntity.x), Math.abs(next.y-KinkyDungeonPlayerEntity.y)) < 1.5) {
							let MP = KDGameData.MovePoints;
							if (KDSendInput("move", {dir: {x:next.x-KinkyDungeonPlayerEntity.x, y:next.y-KinkyDungeonPlayerEntity.y}, delta: 1, AllowInteract: true, AutoDoor: KinkyDungeonToggleAutoDoor, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint}, false, true)
								== "move" || MP == KDGameData.MovePoints) {
								KinkyDungeonFastMovePath.splice(0, 1);
							}
						}
						else KinkyDungeonFastMovePath = [];
					}
					KinkyDungeonSleepTime = CommonTime() + 100 * (0.25 + KDAnimSpeed * 0.75);
				}
			} else if (KinkyDungeonFastStruggle && KinkyDungeonFastStruggleType && KinkyDungeonFastStruggleGroup) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					let result = KDSendInput("struggle", {group: KinkyDungeonFastStruggleGroup, type: KinkyDungeonFastStruggleType}, false, true);
					if (result != "Fail" || !KinkyDungeonHasStamina(2.5)) {
						KinkyDungeonFastStruggleType = "";
						KinkyDungeonFastStruggleGroup = "";
					}
					KinkyDungeonSleepTime = CommonTime() + 250 * (0.25 + KDAnimSpeed * 0.75);
				}
			} else if (KinkyDungeonAutoWait) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					let lastStamina = KinkyDungeonStatStamina;
					KDSendInput("move", {dir: {x:0, y: 0, delta: 0}, delta: 1, AllowInteract: true, AutoDoor: KinkyDungeonToggleAutoDoor, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint}, false, true);
					if (KinkyDungeonFastStruggle && KinkyDungeonStatStamina == KinkyDungeonStatStaminaMax && lastStamina < KinkyDungeonStatStamina) {
						if (KinkyDungeonTempWait && !KDGameData.KinkyDungeonLeashedPlayer && !KinkyDungeonInDanger())
							KDDisableAutoWait();
					}
					KinkyDungeonSleepTime = CommonTime() + (KinkyDungeonFastWait ? 100 : 300);
				}
			} else if (KinkyDungeonAutoWaitStruggle) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					//KDSendInput("move", {dir: {x:0, y: 0, delta: 0}, delta: 1, AllowInteract: true, AutoDoor: KinkyDungeonToggleAutoDoor, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint}, false, true);

					if (!(KDGameData.DelayedActions?.length > 0)) {
						KDHandleAutoStruggle(KinkyDungeonPlayerEntity);
					}
					if (KinkyDungeonInDanger())
						KDDisableAutoWait();
					KinkyDungeonSleepTime = CommonTime() + (300 + Math.min(1200, KDAutoStruggleData.lastDelay * 270)) * (0.5 + KDAnimSpeed * 0.5);
				}
			} else KinkyDungeonSleepTime = CommonTime() + 100;
			CharacterRefresh = _CharacterRefresh;
			CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
		} else KinkyDungeonSleepTime = CommonTime() + 100;

	} else if (KinkyDungeonState == "End") {
		KinkyDungeonGameRunning = false;
		// Draw temp start screen
		DrawTextKD(TextGet("EndWin"), 1250, 400, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("EndWin2"), 1250, 500, "#ffffff", KDTextGray2);

		DrawButtonVis(1075, 650, 350, 64, TextGet("KinkyDungeonNewGamePlus"), "#ffffff", "");
		DrawButtonVis(1075, 750, 350, 64, TextGet("GameReturnToMenu"), "#ffffff", "");
	} else if (KinkyDungeonState == "Keybindings") {
		// Draw temp start screen
		DrawButtonKDEx("KBBack", () => {
			KinkyDungeonKeybindings = KinkyDungeonKeybindingsTemp;
			if (KinkyDungeonGameFlag) {
				KinkyDungeonState = "Game";
				if (KinkyDungeonKeybindings) {
					KDCommitKeybindings();
				}
			} else KinkyDungeonState = "Menu";
			localStorage.setItem("KinkyDungeonKeybindings", JSON.stringify(KinkyDungeonKeybindings));
			//ServerAccountUpdate.QueueData({ KinkyDungeonKeybindings: KinkyDungeonKeybindings });
			return true;
		}, true, 1450, 780, 350, 64, TextGet("GameReturnToMenu"), "#ffffff", "");

		// Draw temp start screen
		DrawButtonKDEx("KBBack2", () => {
			KinkyDungeonKeybindingsTemp = Object.assign({}, KinkyDungeonKeybindingsTemp);
			if (KinkyDungeonGameFlag) {
				KinkyDungeonState = "Game";
			} else KinkyDungeonState = "Menu";
			//ServerAccountUpdate.QueueData({ KinkyDungeonKeybindings: KinkyDungeonKeybindings });
			return true;
		}, true, 1450, 700, 350, 64, TextGet("GameReturnToMenu2"), "#ffffff", "");



		// Draw key buttons
		DrawButtonKDEx("KBUp", () => {KinkyDungeonKeybindingsTemp.Up = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 100, 300, 38, TextGet("KinkyDungeonKeyUp") + ": '" + (KinkyDungeonKeybindingsTemp.Up) + "'",
			KinkyDungeonKeybindingsTemp.Up == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBDown", () => {KinkyDungeonKeybindingsTemp.Down = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 140, 300, 38, TextGet("KinkyDungeonKeyDown") + ": '" + (KinkyDungeonKeybindingsTemp.Down) + "'",
			KinkyDungeonKeybindingsTemp.Down == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBLeft", () => {KinkyDungeonKeybindingsTemp.Left = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 180, 300, 38, TextGet("KinkyDungeonKeyLeft") + ": '" + (KinkyDungeonKeybindingsTemp.Left) + "'",
			KinkyDungeonKeybindingsTemp.Left == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBRight", () => {KinkyDungeonKeybindingsTemp.Right = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 220, 300, 38, TextGet("KinkyDungeonKeyRight") + ": '" + (KinkyDungeonKeybindingsTemp.Right) + "'",
			KinkyDungeonKeybindingsTemp.Right == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);

		DrawButtonKDEx("KBUpLleft", () => {KinkyDungeonKeybindingsTemp.UpLeft = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 260, 300, 38, TextGet("KinkyDungeonKeyUpLeft") + ": '" + (KinkyDungeonKeybindingsTemp.UpLeft) + "'",
			KinkyDungeonKeybindingsTemp.UpLeft == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBUpRight", () => {KinkyDungeonKeybindingsTemp.UpRight = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 300, 300, 38, TextGet("KinkyDungeonKeyUpRight") + ": '" + (KinkyDungeonKeybindingsTemp.UpRight) + "'",
			KinkyDungeonKeybindingsTemp.UpRight == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBDownLeft", () => {KinkyDungeonKeybindingsTemp.DownLeft = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 340, 300, 38, TextGet("KinkyDungeonKeyDownLeft") + ": '" + (KinkyDungeonKeybindingsTemp.DownLeft) + "'",
			KinkyDungeonKeybindingsTemp.DownLeft == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBDownRight", () => {KinkyDungeonKeybindingsTemp.DownRight = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 380, 300, 38, TextGet("KinkyDungeonKeyDownRight") + ": '" + (KinkyDungeonKeybindingsTemp.DownRight) + "'",
			KinkyDungeonKeybindingsTemp.DownRight == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);

		DrawButtonKDEx("KBWait", () => {KinkyDungeonKeybindingsTemp.Wait = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 420, 300, 38, TextGet("KinkyDungeonKeyWait") + ": '" + (KinkyDungeonKeybindingsTemp.Wait) + "'",
			KinkyDungeonKeybindingsTemp.Wait == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);



		DrawButtonKDEx("KDOffhand", () => {KinkyDungeonKeybindingsTemp.SwitchWeaponOffhand = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 470, 300, 38, TextGet("KinkyDungeonKeyOffhand") + ": '" + (KinkyDungeonKeybindingsTemp.SwitchWeaponOffhand) + "'",
			KinkyDungeonKeybindingsTemp.SwitchWeaponOffhand == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KDOffhandPrev", () => {KinkyDungeonKeybindingsTemp.SwitchWeaponOffhandPrevious = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 510, 300, 38, TextGet("KinkyDungeonKeyOffhandPrevious") + ": '" + (KinkyDungeonKeybindingsTemp.SwitchWeaponOffhandPrevious) + "'",
			KinkyDungeonKeybindingsTemp.SwitchWeaponOffhandPrevious == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);

		DrawButtonKDEx("KDHotbar1", () => {KinkyDungeonKeybindingsTemp.SpellConfig1 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 560, 300, 38, TextGet("KinkyDungeonKeySpellConfig1") + ": '" + (KinkyDungeonKeybindingsTemp.SpellConfig1) + "'",
			KinkyDungeonKeybindingsTemp.SpellConfig1 == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KDHotbar2", () => {KinkyDungeonKeybindingsTemp.SpellConfig2 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 600, 300, 38, TextGet("KinkyDungeonKeySpellConfig2") + ": '" + (KinkyDungeonKeybindingsTemp.SpellConfig2) + "'",
			KinkyDungeonKeybindingsTemp.SpellConfig2 == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KDHotbar3", () => {KinkyDungeonKeybindingsTemp.SpellConfig3 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 640, 300, 38, TextGet("KinkyDungeonKeySpellConfig3") + ": '" + (KinkyDungeonKeybindingsTemp.SpellConfig3) + "'",
			KinkyDungeonKeybindingsTemp.SpellConfig3 == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);

		DrawButtonKDEx("KDSwitchLoadout1", () => {KinkyDungeonKeybindingsTemp.SwitchLoadout1 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 690, 300, 38, TextGet("KinkyDungeonKeySwitchLoadout1") + ": '" + (KinkyDungeonKeybindingsTemp.SwitchLoadout1) + "'",
			KinkyDungeonKeybindingsTemp.SwitchLoadout1 == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KDSwitchLoadout2", () => {KinkyDungeonKeybindingsTemp.SwitchLoadout2 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 730, 300, 38, TextGet("KinkyDungeonKeySwitchLoadout2") + ": '" + (KinkyDungeonKeybindingsTemp.SwitchLoadout2) + "'",
			KinkyDungeonKeybindingsTemp.SwitchLoadout2 == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KDSwitchLoadout3", () => {KinkyDungeonKeybindingsTemp.SwitchLoadout3 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 770, 300, 38, TextGet("KinkyDungeonKeySwitchLoadout3") + ": '" + (KinkyDungeonKeybindingsTemp.SwitchLoadout3) + "'",
			KinkyDungeonKeybindingsTemp.SwitchLoadout3 == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);


		DrawButtonKDEx("KBSpell1", () => {KinkyDungeonKeybindingsTemp.Spell1 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 100, 300, 38, TextGet("KinkyDungeonKeySpell1") + ": '" + (KinkyDungeonKeybindingsTemp.Spell1) + "'",
			KinkyDungeonKeybindingsTemp.Spell1 == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBSpell2", () => {KinkyDungeonKeybindingsTemp.Spell2 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 140, 300, 38, TextGet("KinkyDungeonKeySpell2") + ": '" + (KinkyDungeonKeybindingsTemp.Spell2) + "'",
			KinkyDungeonKeybindingsTemp.Spell2 == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBSpell3", () => {KinkyDungeonKeybindingsTemp.Spell3 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 180, 300, 38, TextGet("KinkyDungeonKeySpell3") + ": '" + (KinkyDungeonKeybindingsTemp.Spell3) + "'",
			KinkyDungeonKeybindingsTemp.Spell3 == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBSpell4", () => {KinkyDungeonKeybindingsTemp.Spell4 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 220, 300, 38, TextGet("KinkyDungeonKeySpell4") + ": '" + (KinkyDungeonKeybindingsTemp.Spell4) + "'",
			KinkyDungeonKeybindingsTemp.Spell4 == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBSpell5", () => {KinkyDungeonKeybindingsTemp.Spell5 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 260, 300, 38, TextGet("KinkyDungeonKeySpell5") + ": '" + (KinkyDungeonKeybindingsTemp.Spell5) + "'",
			KinkyDungeonKeybindingsTemp.Spell5 == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBSpell6", () => {KinkyDungeonKeybindingsTemp.Spell6 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 300, 300, 38, TextGet("KinkyDungeonKeySpell6") + ": '" + (KinkyDungeonKeybindingsTemp.Spell6) + "'",
			KinkyDungeonKeybindingsTemp.Spell6 == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBSpell7", () => {KinkyDungeonKeybindingsTemp.Spell7 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 340, 300, 38, TextGet("KinkyDungeonKeySpell7") + ": '" + (KinkyDungeonKeybindingsTemp.Spell7) + "'",
			KinkyDungeonKeybindingsTemp.Spell7 == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBSpell8", () => {KinkyDungeonKeybindingsTemp.Spell8 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 380, 300, 38, TextGet("KinkyDungeonKeySpell8") + ": '" + (KinkyDungeonKeybindingsTemp.Spell8) + "'",
			KinkyDungeonKeybindingsTemp.Spell8 == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBSpell9", () => {KinkyDungeonKeybindingsTemp.Spell9 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 420, 300, 38, TextGet("KinkyDungeonKeySpell9") + ": '" + (KinkyDungeonKeybindingsTemp.Spell9) + "'",
			KinkyDungeonKeybindingsTemp.Spell9 == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBSpell0", () => {KinkyDungeonKeybindingsTemp.Spell0 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 460, 300, 38, TextGet("KinkyDungeonKeySpell0") + ": '" + (KinkyDungeonKeybindingsTemp.Spell0) + "'",
			KinkyDungeonKeybindingsTemp.Spell0 == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);

		DrawButtonKDEx("KBSpellPage", () => {KinkyDungeonKeybindingsTemp.SpellPage = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 520, 300, 50, TextGet("KinkyDungeonKeySpellPage") + ": '" + (KinkyDungeonKeybindingsTemp.SpellPage) + "'",
			KinkyDungeonKeybindingsTemp.SpellPage == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);

		DrawButtonKDEx("KBUpcast", () => {KinkyDungeonKeybindingsTemp.Upcast = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 580, 300, 50, TextGet("KinkyDungeonKeyUpcast") + ": '" + (KinkyDungeonKeybindingsTemp.Upcast) + "'",
			KinkyDungeonKeybindingsTemp.Upcast == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBUpcastCancel", () => {KinkyDungeonKeybindingsTemp.UpcastCancel = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 640, 300, 50, TextGet("KinkyDungeonKeyUpcastCancel") + ": '" + (KinkyDungeonKeybindingsTemp.UpcastCancel) + "'",
			KinkyDungeonKeybindingsTemp.UpcastCancel == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);

		DrawButtonKDEx("KBSwitchWeapon", () => {KinkyDungeonKeybindingsTemp.SwitchWeapon = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 700, 300, 50, TextGet("KinkyDungeonKeySwitchWeapon") + ": '" + (KinkyDungeonKeybindingsTemp.SwitchWeapon) + "'",
			KinkyDungeonKeybindingsTemp.SwitchWeapon == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBSpellWeapon", () => {KinkyDungeonKeybindingsTemp.SpellWeapon = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 760, 300, 50, TextGet("KinkyDungeonKeySpellWeapon") + ": '" + (KinkyDungeonKeybindingsTemp.SpellWeapon) + "'",
			KinkyDungeonKeybindingsTemp.SpellWeapon == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);

		DrawButtonKDEx("KBSkip", () => {KinkyDungeonKeybindingsTemp.Skip = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 820, 300, 50, TextGet("KinkyDungeonKeySkip") + ": '" + (KinkyDungeonKeybindingsTemp.Skip) + "'",
			KinkyDungeonKeybindingsTemp.Skip == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBEnter", () => {KinkyDungeonKeybindingsTemp.Enter = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 820, 300, 50, TextGet("KinkyDungeonKeyEnter") + ": '" + (KinkyDungeonKeybindingsTemp.Enter) + "'",
			KinkyDungeonKeybindingsTemp.Enter == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);


		DrawButtonKDEx("KBMsgLog", () => {KinkyDungeonKeybindingsTemp.MsgLog = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 100, 300, 38, TextGet("KinkyDungeonKeyMsgLog") + ": '" + (KinkyDungeonKeybindingsTemp.MsgLog) + "'",
			KinkyDungeonKeybindingsTemp.MsgLog == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBDoor", () => {KinkyDungeonKeybindingsTemp.Door = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 145, 300, 38, TextGet("KinkyDungeonKeyDoor") + ": '" + (KinkyDungeonKeybindingsTemp.Door) + "'",
			KinkyDungeonKeybindingsTemp.Door == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBPass", () => {KinkyDungeonKeybindingsTemp.Pass = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 190, 300, 38, TextGet("KinkyDungeonKeyPass") + ": '" + (KinkyDungeonKeybindingsTemp.Pass) + "'",
			KinkyDungeonKeybindingsTemp.Pass == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBAStruggle", () => {KinkyDungeonKeybindingsTemp.AStruggle = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 235, 300, 38, TextGet("KinkyDungeonKeyAStruggle") + ": '" + (KinkyDungeonKeybindingsTemp.AStruggle) + "'",
			KinkyDungeonKeybindingsTemp.AStruggle == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBAPathfind", () => {KinkyDungeonKeybindingsTemp.APathfind = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 280, 300, 38, TextGet("KinkyDungeonKeyAPathfind") + ": '" + (KinkyDungeonKeybindingsTemp.APathfind) + "'",
			KinkyDungeonKeybindingsTemp.APathfind == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBASprint", () => {KinkyDungeonKeybindingsTemp.Sprint = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 325, 300, 38, TextGet("KinkyDungeonKeySprint") + ": '" + (KinkyDungeonKeybindingsTemp.Sprint) + "'",
			KinkyDungeonKeybindingsTemp.Sprint == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBInspect", () => {KinkyDungeonKeybindingsTemp.AInspect = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 370, 300, 38, TextGet("KinkyDungeonKeyInspect") + ": '" + (KinkyDungeonKeybindingsTemp.AInspect) + "'",
			KinkyDungeonKeybindingsTemp.AInspect == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);

		DrawButtonKDEx("KBQInventory", () => {KinkyDungeonKeybindingsTemp.QInventory = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 425, 300, 45, TextGet("KinkyDungeonKeyQInventory") + ": '" + (KinkyDungeonKeybindingsTemp.QInventory) + "'",
			KinkyDungeonKeybindingsTemp.QInventory == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBInventory", () => {KinkyDungeonKeybindingsTemp.Inventory = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 475, 300, 45, TextGet("KinkyDungeonKeyInventory") + ": '" + (KinkyDungeonKeybindingsTemp.Inventory) + "'",
			KinkyDungeonKeybindingsTemp.Inventory == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBReputation", () => {KinkyDungeonKeybindingsTemp.Reputation = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 525, 300, 45, TextGet("KinkyDungeonKeyReputation") + ": '" + (KinkyDungeonKeybindingsTemp.Reputation) + "'",
			KinkyDungeonKeybindingsTemp.Reputation == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBMagic", () => {KinkyDungeonKeybindingsTemp.Magic = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 575, 300, 45, TextGet("KinkyDungeonKeyMagic") + ": '" + (KinkyDungeonKeybindingsTemp.Magic) + "'",
			KinkyDungeonKeybindingsTemp.Magic == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);
		DrawButtonKDEx("KBLog", () => {KinkyDungeonKeybindingsTemp.Log = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 625, 300, 45, TextGet("KinkyDungeonKeyLog") + ": '" + (KinkyDungeonKeybindingsTemp.Log) + "'",
			KinkyDungeonKeybindingsTemp.Log == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true);

		if (KinkyDungeonKeybindingCurrentKey)
			DrawTextKD(TextGet("KinkyDungeonCurrentPress") + ": '" + (KinkyDungeonKeybindingCurrentKey) + "'", 1250, 900, "#ffffff", KDTextGray2);

		DrawTextKD(TextGet("KinkyDungeonCurrentPressInfo"), 1250, 950, "#ffffff", KDTextGray2);
	} else if (KinkyDungeonState == "Toggles") {

		let XX = 840;
		let YYstart = 200;
		let YYmax = 680;
		let YY = YYstart;
		let YYd = 70;
		let XXd = 400;
		let toggles = Object.keys(KDToggles);
		//MainCanvas.textAlign = "left";
		for (let toggle of toggles) {
			// Draw temp start screen
			DrawCheckboxKDEx("toggle" + toggle, () => {
				KDToggles[toggle] = !KDToggles[toggle];
				KDSaveToggles();
				return true;
			}, true, XX, YY, 64, 64, TextGet("KDToggle" + toggle), KDToggles[toggle], false, "#ffffff", undefined, {
				maxWidth: 280,
				fontSize: 26,
			});

			YY += YYd;
			if (YY > YYmax) {
				YY = YYstart;
				XX += XXd;
			}
		}
		//MainCanvas.textAlign = "center";

		YY = YYstart;

		if (StandalonePatched) {
			DrawBackNextButtonVis(450, YY, 350, 64, TextGet("KDResolution" + (KDResolutionConfirm ? "Confirm" : "")) + " " + Math.round(KDResolution * 100) + "%", "#ffffff", "",
				() => KDResolutionList[(KDResolutionListIndex + KDResolutionList.length - 1) % KDResolutionList.length] * 100 + "%",
				() => KDResolutionList[(KDResolutionListIndex + 1) % KDResolutionList.length] * 100 + "%");
			YY += YYd;
			DrawBackNextButtonVis(450, YY, 350, 64, TextGet("KDGamma") + " " + (Math.round(KDGamma * 100) + "%"), "#ffffff", "",
				() => KDGammaList[(KDGammaListIndex + KDGammaList.length - 1) % KDGammaList.length] * 100 + "%",
				() => KDGammaList[(KDGammaListIndex + 1) % KDGammaList.length] * 100 + "%");
			YY += YYd * 2;
		}

		DrawBackNextButtonVis(450, YY, 350, 64, TextGet("KDVibeVolume") + " " + (KDVibeVolume * 100 + "%"), "#ffffff", "",
			() => KDVibeVolumeList[(KDVibeVolumeListIndex + KDVibeVolumeList.length - 1) % KDVibeVolumeList.length] * 100 + "%",
			() => KDVibeVolumeList[(KDVibeVolumeListIndex + 1) % KDVibeVolumeList.length] * 100 + "%");
		YY += YYd;
		DrawBackNextButtonVis(450, YY, 350, 64, TextGet("KDMusicVolume") + " " + (KDMusicVolume * 100 + "%"), "#ffffff", "",
			() => KDMusicVolumeList[(KDMusicVolumeListIndex + KDMusicVolumeList.length - 1) % KDMusicVolumeList.length] * 100 + "%",
			() => KDMusicVolumeList[(KDMusicVolumeListIndex + 1) % KDMusicVolumeList.length] * 100 + "%");
		YY += YYd;
		DrawBackNextButtonVis(450, YY, 350, 64, TextGet("KDSfxVolume") + " " + (KDSfxVolume * 100 + "%"), "#ffffff", "",
			() => KDSfxVolumeList[(KDSfxVolumeListIndex + KDSfxVolumeList.length - 1) % KDSfxVolumeList.length] * 100 + "%",
			() => KDSfxVolumeList[(KDSfxVolumeListIndex + 1) % KDSfxVolumeList.length] * 100 + "%");
		YY += YYd;
		DrawBackNextButtonVis(450, YY, 350, 64, TextGet("KDAnimSpeed") + " " + (KDAnimSpeed * 100 + "%"), "#ffffff", "",
			() => KDAnimSpeedList[(KDAnimSpeedListIndex + KDAnimSpeedList.length - 1) % KDAnimSpeedList.length] * 100 + "%",
			() => KDAnimSpeedList[(KDAnimSpeedListIndex + 1) % KDAnimSpeedList.length] * 100 + "%");
		YY += YYd;




		DrawButtonKDEx("KBBackOptions", () => {
			KinkyDungeonKeybindingsTemp = Object.assign({}, KinkyDungeonKeybindingsTemp);
			if (KinkyDungeonGameFlag) {
				KinkyDungeonState = "Game";
			} else KinkyDungeonState = "Menu";
			//ServerAccountUpdate.QueueData({ KinkyDungeonKeybindings: KinkyDungeonKeybindings });
			return true;
		}, true, 975, 780, 550, 64, TextGet("GameReturnToMenuFromOptions"), "#ffffff", "");

	}

	// Cull temp elements
	KDCullTempElements();

	//if (KDDebugMode) {
	//DrawTextKD(dispfps, 20, 20, "#ffffff", undefined, undefined, "left");
	//}
	// Cull the sprites that werent rendered or updated this frame
	KDCullSprites();

	if (!StandalonePatched) {
		if (!pixiview) pixiview = KinkyDungeonGetCanvas("MainCanvas");
		if (!pixirenderer) {
			if (pixiview) {
				pixirenderer = new PIXI.CanvasRenderer({
					width: pixiview.width,
					height: pixiview.height,
					view: pixiview,
					antialias: true,
				});
			}
		}
	}


	KDDrawDelta = performance.now() - lastfps;
	fpscounter++;
	if (fpscounter > 10) {
		fpscounter = 0;
		dispfps = Math.round(1000 / Math.max(KDDrawDelta, 1));
	}

	lastfps = performance.now();
	KDUpdateParticles(KDDrawDelta);

	if (StandalonePatched) {
		/*if (KinkyDungeonState == "Game") {
			if (!kdTrackGameParticles) {
				kdcanvas.addChild(kdparticles);
				kdTrackGameParticles = true;
			}
		} else {
			if (kdTrackGameParticles) {
				kdcanvas.removeChild(kdparticles);
				kdTrackGameParticles = false;
			}
		}*/
	} else {
		// Draw the context layer even if we haven't updated it
		if (pixirenderer) {
			pixirenderer.render(kdcanvas, {
				clear: false,
			});
			pixirenderer.render(kdui, {
				clear: false,
			});
		}
	}



	//MainCanvas.textBaseline = "middle";

	KDLastButtonsCache = {};
	MouseClicked = false;

	if ((!KDDebugMode && KinkyDungeonDrawState == "Restart") || (KDDebugMode && (KinkyDungeonDrawState != "Restart" || KinkyDungeonState != "Game"))) {
		ElementRemove("DebugEnemy");
		ElementRemove("DebugItem");
	}
}

let KDDrawDelta = 0;

let kdTrackGameBoard = false;
let kdTrackGameFog = false;
let kdTrackGameParticles = false;

function KDCullSprites() {
	for (let sprite of kdpixisprites.entries()) {
		if (!kdSpritesDrawn.has(sprite[0])) {
			sprite[1].parent.removeChild(sprite[1]);
			if (kdprimitiveparams.has(sprite[0])) kdprimitiveparams.delete(sprite[0]);
			kdpixisprites.delete(sprite[0]);
			sprite[1].destroy();
		}
	}
}
function KDCullSpritesList(list) {
	for (let sprite of list.entries()) {
		if (!kdSpritesDrawn.has(sprite[0])) {
			sprite[1].parent.removeChild(sprite[1]);
			list.delete(sprite[0]);
			sprite[1].destroy();
		}
	}
}

/**
 * @type {Record<string, {Left: number, Top: number, Width: number, Height: number, enabled: boolean, func?: (bdata: any) => boolean, priority: number}>}
 */
let KDButtonsCache = {

};
/**
 * @type {Record<string, {Left: number, Top: number, Width: number, Height: number, enabled: boolean, func?: (bdata: any) => boolean, priority: number}>}
 */
let KDLastButtonsCache = {

};


/**
 * Draws a button component
 * @param {string} name - Name of the button element
 * @param {boolean} enabled - Whether or not you can click on it
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Label - Text to display in the button
 * @param {string} Color - Color of the component
 * @param {string} [Image] - URL of the image to draw inside the button, if applicable
 * @param {string} [HoveringText] - Text of the tooltip, if applicable
 * @param {boolean} [Disabled] - Disables the hovering options if set to true
 * @param {boolean} [NoBorder] - Disables the border and stuff
 * @returns {void} - Nothing
 */
function DrawButtonKD(name, enabled, Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder) {
	DrawButtonVis(Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder);
	KDButtonsCache[name] = {
		Left,
		Top,
		Width,
		Height,
		enabled,
		priority: 0,
	};
}


/**
 * Draws a button component
 * @param {string} name - Name of the button element
 * @param {(bdata: any) => boolean} func - Whether or not you can click on it
 * @param {boolean} enabled - Whether or not you can click on it
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Label - Text to display in the button
 * @param {string} Color - Color of the component
 * @param {string} [Image] - URL of the image to draw inside the button, if applicable
 * @param {string} [HoveringText] - Text of the tooltip, if applicable
 * @param {boolean} [Disabled] - Disables the hovering options if set to true
 * @param {boolean} [NoBorder] - Disables border
 * @param {string} [FillColor] - BG color
 * @param {number} [FontSize] - Font size
 * @param {boolean} [ShiftText] - Shift text to make room for the button
 * @param {object} [options] - Additional options
 * @param {boolean} [options.noTextBG] - Dont show text backgrounds
 * @param {number} [options.alpha] - Dont show text backgrounds
 * @param {number} [options.zIndex] - zIndex
 * @param {boolean} [options.scaleImage] - zIndex
 * @param {string} [options.tint] - tint
 * @returns {void} - Nothing
 */
function DrawButtonKDEx(name, func, enabled, Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder, FillColor, FontSize, ShiftText, options) {
	DrawButtonVis(Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder, FillColor, FontSize, ShiftText, undefined, options?.zIndex, options);
	KDButtonsCache[name] = {
		Left,
		Top,
		Width,
		Height,
		enabled,
		func,
		priority: (options?.zIndex || 0),
	};
}


/**
 * Draws a button component
 * @param {any} Container - Container to draw to
 * @param {string} name - Name of the button element
 * @param {(bdata: any) => boolean} func - Whether or not you can click on it
 * @param {boolean} enabled - Whether or not you can click on it
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Label - Text to display in the button
 * @param {string} Color - Color of the component
 * @param {string} [Image] - URL of the image to draw inside the button, if applicable
 * @param {string} [HoveringText] - Text of the tooltip, if applicable
 * @param {boolean} [Disabled] - Disables the hovering options if set to true
 * @param {boolean} [NoBorder] - Disables border
 * @param {string} [FillColor] - BG color
 * @param {number} [FontSize] - Font size
 * @param {boolean} [ShiftText] - Shift text to make room for the button
 * @param {object} [options] - Additional options
 * @param {boolean} [options.noTextBG] - Dont show text backgrounds
 * @param {number} [options.alpha] - Dont show text backgrounds
 * @param {number} [options.zIndex] - zIndex
 * @param {boolean} [options.unique] - This button is unique, so X and Y are not differentiators
 * @returns {void} - Nothing
 */
function DrawButtonKDExTo(Container, name, func, enabled, Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder, FillColor, FontSize, ShiftText, options) {
	DrawButtonVisTo(Container, Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder, FillColor, FontSize, ShiftText, undefined, options?.zIndex, options);
	KDButtonsCache[name] = {
		Left,
		Top,
		Width,
		Height,
		enabled,
		func,
		priority: (options?.zIndex || 0)
	};
}

function KDProcessButtons() {
	let buttons = [];
	for (let button of Object.entries(KDButtonsCache)) {
		if (button[1].enabled && button[1].func) {
			if (MouseInKD(button[0])) {
				buttons.push(button[1]);
			}
		}
	}
	if (buttons.length > 0) {
		buttons = buttons.sort((a, b) => {return b.priority - a.priority;});
		return buttons[0].func();
	}

	return false;
}

/**
 * Buttons are clickable one frame later, please factor this in to UI design (especially when enforcing validation)
 * @param {string} name
 * @returns {boolean}
 */
function KDClickButton(name) {
	let button = KDButtonsCache[name] || KDLastButtonsCache[name];
	if (button && button.enabled) {
		return button.func();
	}
	return false;
}

function MouseInKD(name) {
	let button = KDButtonsCache[name];
	if (button && button.enabled) {
		return MouseIn(button.Left, button.Top, button.Width, button.Height);
	}
	return false;
}

function KinkyDungeonGetTraitsCount() {
	return Array.from(KinkyDungeonStatsChoice.keys()).filter((element) => {return !element.includes('arousalMode');}).length;
}

function KDSendTrait(trait) {
	if (window.dataLayer)
		window.dataLayer.push({
			'event':'trait',
			'traitType':trait,
			'journey':KDJourney,
		});
}

function KDSendSpell(spell) {
	if (window.dataLayer)
		window.dataLayer.push({
			'event':'spell',
			'spellType':spell,
			'currentLevel':MiniGameKinkyDungeonLevel,
			'currentCheckpoint':MiniGameKinkyDungeonCheckpoint,
			'journey':KDJourney,
		});
}

function KDSendSpellCast(spell) {
	if (window.dataLayer)
		window.dataLayer.push({
			'event':'spellCast',
			'spellType':spell,
			'currentLevel':MiniGameKinkyDungeonLevel,
			'currentCheckpoint':MiniGameKinkyDungeonCheckpoint,
			'journey':KDJourney,
		});
}
function KDSendWeapon(weapon) {
	if (window.dataLayer)
		window.dataLayer.push({
			'event':'weapon',
			'weapon':weapon,
			'currentLevel':MiniGameKinkyDungeonLevel,
			'currentCheckpoint':MiniGameKinkyDungeonCheckpoint,
			'journey':KDJourney,
		});
}

function KDSendStatus(type, data, data2) {
	if (window.dataLayer && !KDOptOut) {
		window.dataLayer.push({
			'event':'gameStatus',
			'currentLevel':MiniGameKinkyDungeonLevel,
			'currentCheckpoint':MiniGameKinkyDungeonCheckpoint,
			'difficulty':KinkyDungeonStatsChoice.get("randomMode"),
			'newgameplus':KinkyDungeonNewGame,
			'statusType':type,
			'aroused':KinkyDungeonStatsChoice.get("arousalMode") ? 'yes' : 'no',
			'traitscount':KinkyDungeonGetTraitsCount(),
			'gold':Math.round(KinkyDungeonGold / 100) * 100,
			'spellType': type == 'learnspell' ? data : undefined,
			'goddess': type == 'goddess' ? data : undefined,
			'helpType': type == 'goddess' ? data2 : undefined,
			'restraint': (type == 'escape' || type == 'bound') ? data : undefined,
			'method': type == 'escape' ? data2 : undefined,
			'attacker': type == 'bound' ? data2 : undefined,
			'prisonerstate': KDGameData.PrisonerState,
		});
		if (type == 'nextLevel' && !KinkyDungeonStatsChoice.get("randomMode")) {
			for (let s of KinkyDungeonSpells) {
				KDSendSpell(s.name);
			}
			KDSendWeapon((KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.name) ? KinkyDungeonPlayerDamage.name : 'unarmed');
		}
	}
}
function KDSendEvent(type) {
	if (window.dataLayer && !KDOptOut)
		if (type == 'newGame') {
			window.dataLayer.push({
				'event':type,
				'aroused':KinkyDungeonStatsChoice.get("arousalMode") ? 'yes' : 'no',
				'traitscount':KinkyDungeonGetTraitsCount(),
				'journey':KDJourney,
			});
			for (let s of KinkyDungeonStatsChoice.keys()) {
				if (KinkyDungeonStatsChoice.get(s))
					KDSendTrait(s);
			}
		} else if (type == 'jail') {
			window.dataLayer.push({
				'event':type,
				'currentLevel':MiniGameKinkyDungeonLevel,
				'alreadyInJail':KinkyDungeonInJail(KDJailFilters) ? 'true' : 'false',
				'currentCheckpoint':MiniGameKinkyDungeonCheckpoint,
				'difficulty':KinkyDungeonStatsChoice.get("randomMode"),
				'newgameplus':KinkyDungeonNewGame,
				'aroused':KinkyDungeonStatsChoice.get("arousalMode") ? 'yes' : 'no',
				'traitscount':KinkyDungeonGetTraitsCount(),
				'gold':Math.round(KinkyDungeonGold / 100) * 100,
				'journey':KDJourney,
			});
		} else if (type == 'loadGame') {
			window.dataLayer.push({
				'event':type,
				'currentLevel':MiniGameKinkyDungeonLevel,
				'currentCheckpoint':MiniGameKinkyDungeonCheckpoint,
				'difficulty':KinkyDungeonStatsChoice.get("randomMode"),
				'newgameplus':KinkyDungeonNewGame,
				'aroused':KinkyDungeonStatsChoice.get("arousalMode") ? 'yes' : 'no',
				'traitscount':KinkyDungeonGetTraitsCount(),
				'gold':Math.round(KinkyDungeonGold / 100) * 100,
				'journey':KDJourney,
			});
		} else if (type == 'patreon') {
			window.dataLayer.push({
				'event':type,
			});
		} else if (type == 'optout' || type == 'optin') {
			window.dataLayer.push({
				'event':type,
			});
		}
}

function KinkyDungeonLoadStats() {
	KinkyDungeonStatsChoice = new Map();
	KDUpdatePlugSettings(false);
	let statsChoice = localStorage.getItem('KinkyDungeonStatsChoice' + KinkyDungeonPerksConfig);
	if (statsChoice) {
		let statsArray = JSON.parse(statsChoice);
		if (statsArray) {
			for (let s of statsArray) {
				if (!kdSpecialModePerks.includes(s) && KinkyDungeonStatsPresets[s] && KDValidatePerk(KinkyDungeonStatsPresets[s]))
					KinkyDungeonStatsChoice.set(s, true);
			}
		}
	}
	KDUpdatePlugSettings(true);
}

let KinkyDungeonGameFlag = false;

let KDDefaultJourney = ["grv", "cat", "jng", "tmp", "bel"];
let KDDefaultAlt = ["tmb", "lib", "cry", "ore", "bel"];

function KDInitializeJourney(Journey) {
	KDCurrentWorldSlot = {x: 0, y: 0};
	KDWorldMap = {};

	/**
	 * @type {Record<string, string>}
	 */
	let newIndex = {};

	for (let map of KDDefaultJourney) {
		newIndex[map] = map;
	}
	for (let map of KDDefaultAlt) {
		newIndex[map] = map;
	}

	if (Journey)
		KDGameData.Journey = Journey;
	// Option to shuffle the dungeon types besides the initial one (graveyard)
	if (KDGameData.Journey == "Random") {
		/* Randomize array in-place using Durstenfeld shuffle algorithm */
		// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
		let randList = Array.from(Object.keys(newIndex));
		for (let i = randList.length - 1; i >= 0; i--) {
			let j = Math.floor(KDRandom() * (i + 1));
			let temp = randList[i];
			randList[i] = randList[j];
			randList[j] = temp;
		}
		let ii = 0;
		for (let index of Object.keys(newIndex)) {
			newIndex[index] = randList[ii];
			ii++;
		}

	} else if (KDGameData.Journey == "Harder") {
		for (let i = 0; i < KDDefaultJourney.length; i++) {
			newIndex[KDDefaultAlt[i]] = KDDefaultJourney[i];
			newIndex[KDDefaultJourney[i]] = KDDefaultAlt[i];
		}
	} else if (KDGameData.Journey == "Explorer") {
		newIndex.grv = 'jng';
		newIndex.tmb = 'cry';
		newIndex.cat = 'grv';
		newIndex.lib = 'cat';
		newIndex.jng = 'tmp';
		newIndex.cry = 'lib';
		newIndex.tmp = 'ore';
		newIndex.ore = 'tmb';
		newIndex.bel = 'bel';
	} else if (KDGameData.Journey == "Doll") {
		newIndex.grv = 'tmp';
		newIndex.tmb = 'bel';
		newIndex.cat = 'bel';
		newIndex.lib = 'ore';
		newIndex.jng = 'bel';
		newIndex.cry = 'lib';
		newIndex.tmp = 'cry';
		newIndex.ore = 'tmb';
		newIndex.bel = 'cat';
	} else if (KDGameData.Journey == "Temple") {
		newIndex.grv = 'tmp';
		newIndex.tmb = 'ore';
		newIndex.cat = 'lib';
		newIndex.lib = 'ore';
		newIndex.jng = 'tmb';
		newIndex.cry = 'bel';
		newIndex.tmp = 'cat';
		newIndex.ore = 'cry';
		newIndex.bel = 'jng';
	} else if (KDGameData.Journey == "Test") {
		newIndex.grv = 'bel';
		newIndex.tmb = 'bel';
	}

	KinkyDungeonMapIndex = newIndex;
}



function KDCommitKeybindings() {
	KinkyDungeonKey = [KinkyDungeonKeybindings.Up, KinkyDungeonKeybindings.Left, KinkyDungeonKeybindings.Down, KinkyDungeonKeybindings.Right, KinkyDungeonKeybindings.UpLeft, KinkyDungeonKeybindings.UpRight, KinkyDungeonKeybindings.DownLeft, KinkyDungeonKeybindings.DownRight]; // WASD
	KinkyDungeonGameKey.KEY_UP = (KinkyDungeonKeybindings.Up);
	KinkyDungeonGameKey.KEY_DOWN = (KinkyDungeonKeybindings.Down);
	KinkyDungeonGameKey.KEY_LEFT = (KinkyDungeonKeybindings.Left);
	KinkyDungeonGameKey.KEY_RIGHT = (KinkyDungeonKeybindings.Right);
	KinkyDungeonGameKey.KEY_UPLEFT = (KinkyDungeonKeybindings.UpLeft);
	KinkyDungeonGameKey.KEY_DOWNLEFT = (KinkyDungeonKeybindings.DownLeft);
	KinkyDungeonGameKey.KEY_UPRIGHT = (KinkyDungeonKeybindings.UpRight);
	KinkyDungeonGameKey.KEY_DOWNRIGHT = (KinkyDungeonKeybindings.DownRight);

	//let KinkyDungeonKeyNumpad = [56, 52, 50, 54, 55, 57, 49, 51]; // Numpad
	KinkyDungeonKeySpell = [
		KinkyDungeonKeybindings.Spell1,
		KinkyDungeonKeybindings.Spell2,
		KinkyDungeonKeybindings.Spell3,
		KinkyDungeonKeybindings.Spell4,
		KinkyDungeonKeybindings.Spell5,
		KinkyDungeonKeybindings.Spell6,
		KinkyDungeonKeybindings.Spell7,
		KinkyDungeonKeybindings.Spell8,
		KinkyDungeonKeybindings.Spell9,
		KinkyDungeonKeybindings.Spell0,
	]; // ! @ #
	KinkyDungeonKeySpellConfig = [
		KinkyDungeonKeybindings.SpellConfig1,
		KinkyDungeonKeybindings.SpellConfig2,
		KinkyDungeonKeybindings.SpellConfig3,
	];
	KinkyDungeonKeyWait = [KinkyDungeonKeybindings.Wait];
	KinkyDungeonKeySkip = [KinkyDungeonKeybindings.Skip];
	KinkyDungeonKeyUpcast = [KinkyDungeonKeybindings.Upcast, KinkyDungeonKeybindings.UpcastCancel];
	KinkyDungeonKeyWeapon = [KinkyDungeonKeybindings.SpellWeapon]; // 8 (57)
	KinkyDungeonKeyMenu = [
		KinkyDungeonKeybindings.QInventory,
		KinkyDungeonKeybindings.Inventory,
		KinkyDungeonKeybindings.Reputation,
		KinkyDungeonKeybindings.Magic,
		KinkyDungeonKeybindings.Log,
	];
	KinkyDungeonKeyToggle = [
		KinkyDungeonKeybindings.MsgLog,
		KinkyDungeonKeybindings.Pass,
		KinkyDungeonKeybindings.Door,
		KinkyDungeonKeybindings.AStruggle,
		KinkyDungeonKeybindings.APathfind,
		KinkyDungeonKeybindings.AInspect,
	];

	KinkyDungeonKeyEnter = [KinkyDungeonKeybindings.Enter];
	KinkyDungeonKeySpellPage = [KinkyDungeonKeybindings.SpellPage];
	KinkyDungeonKeySwitchWeapon = [KinkyDungeonKeybindings.SwitchWeapon, KinkyDungeonKeybindings.SwitchWeaponOffhand, KinkyDungeonKeybindings.SwitchWeaponOffhandPrevious];
	KinkyDungeonKeySprint = [KinkyDungeonKeybindings.Sprint];
	KinkyDungeonKeySwitchLoadout = [KinkyDungeonKeybindings.SwitchLoadout1, KinkyDungeonKeybindings.SwitchLoadout2, KinkyDungeonKeybindings.SwitchLoadout3];

	KinkyDungeonGameKey.KEY_WAIT = (KinkyDungeonKeybindings.Wait);
	KinkyDungeonGameKey.KEY_SKIP = (KinkyDungeonKeybindings.Skip);
}

let afterLoaded = false;

/**
 * Dummy function. You can modify this function as part of your mod like so:
 * function _KDModsAfterLoad = KDModsAfterLoad;
 * KDModsAfterLoad = () => {
 * [Your stuff here]
 * _KDModsAfterLoad();
 * }
 * It is declared with `let` intentionally to allow the above, without suggesting a type error
 */
let KDModsAfterLoad = () => {};

function KinkyDungeonStartNewGame(Load) {
	KinkyDungeonNewGame = 0;
	let cp = KinkyDungeonMapIndex.grv;
	KDUpdateHardMode();
	KinkyDungeonInitialize(1, Load);
	MiniGameKinkyDungeonCheckpoint = "grv";
	KDMapData.Grid = "";
	if (Load) {
		KinkyDungeonLoadGame();
		KDSendEvent('loadGame');
	} else {
		KDSendEvent('newGame');
		KDGameData.RoomType = "JourneyFloor";//KinkyDungeonStatsChoice.get("easyMode") ? "ShopStart" : "JourneyFloor";
		MiniGameKinkyDungeonLevel = 0;
		KDInitializeJourney("");
		if (KDTileToTest) {
			KinkyDungeonMapIndex.grv = cp;
		}
	}
	if (!KDMapData.Grid)
		KinkyDungeonCreateMap(KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]], "JourneyFloor", "", MiniGameKinkyDungeonLevel, false, Load);
	KinkyDungeonState = "Game";

	if (KinkyDungeonKeybindings) {
		KDCommitKeybindings();
	}
	if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/StoneDoor_Close.ogg");
}

function KDUpdatePlugSettings(evalHardMode) {
	KinkyDungeonStatsChoice.set("arousalMode", KinkyDungeonSexyMode ? true : undefined);
	KinkyDungeonStatsChoice.set("arousalModePlug", KinkyDungeonSexyPlug ? true : undefined);
	KinkyDungeonStatsChoice.set("arousalModePiercing", KinkyDungeonSexyPiercing ? true : undefined);

	KinkyDungeonStatsChoice.set("randomMode", KinkyDungeonRandomMode ? true : undefined);
	KinkyDungeonStatsChoice.set("saveMode", KinkyDungeonSaveMode ? true : undefined);
	KinkyDungeonStatsChoice.set("hardMode", KinkyDungeonHardMode ? true : undefined);
	KinkyDungeonStatsChoice.set("extremeMode", KinkyDungeonExtremeMode ? true : undefined);
	KinkyDungeonStatsChoice.set("hardperksMode", KinkyDungeonPerksMode == 2 ? true : undefined);
	KinkyDungeonStatsChoice.set("perksMode", KinkyDungeonPerksMode == 1 ? true : undefined);
	KinkyDungeonStatsChoice.set("easyMode", KinkyDungeonEasyMode == 1 ? true : undefined);
	KinkyDungeonStatsChoice.set("norescueMode", KinkyDungeonEasyMode == 2 ? true : undefined);


	if (KDClassReqs[KinkyDungeonClassMode] && !KDClassReqs[KinkyDungeonClassMode]()) {
		// disable the class if we don't meet its requirements
		KinkyDungeonClassMode = "Peasant";
	}
	let classCount = Object.keys(KDClassStart).length;
	for (let i = 0; i < classCount; i++) {
		KinkyDungeonStatsChoice.set("classMode", KinkyDungeonClassMode == Object.keys(KDClassStart)[i] ? true : undefined);
	}

	if (evalHardMode) {
		KDUpdateHardMode();
	}
}

/** Deprecated */
function KDUpdateHardMode() {
	//let points = KinkyDungeonGetStatPoints(KinkyDungeonStatsChoice);
	//KinkyDungeonStatsChoice.set("hardMode", points >= KDHardModeThresh ? true : undefined);
}

let KDHardModeThresh = 10;
let KDAwaitingModLoad = false;

function KinkyDungeonHandleClick() {
	KDLastForceRefresh = CommonTime() - KDLastForceRefreshInterval - 10;
	if (KDAwaitingModLoad) return true;
	if (KDProcessButtons()) return true;

	if (MouseIn(1885, 25, 90, 90) && (!KDPatched)) {
		ElementRemove("saveDataField");
		ElementRemove("saveInputField");
		KinkyDungeonExit();
		return true;
	}
	if (KinkyDungeonState == "Credits") {
		if (MouseIn(1870, 930, 110, 64)) {
			KinkyDungeonState = "Menu";
			return true;
		}
		if (MouseIn(1730, 930, 110, 64)) {
			if (KinkyDungeonCreditsPos < 1) KinkyDungeonCreditsPos += 1;
			else KinkyDungeonCreditsPos = 0;
		}
	} if (KinkyDungeonState == "Patrons") {
		if (MouseIn(1870, 930, 110, 64)) {
			KinkyDungeonState = "Menu";
			return true;
		}
	} else if (KinkyDungeonState == "Journey") {
		if (MouseIn(875, 350, 750, 64)) {
			KDJourney = "";
			KinkyDungeonState = "Stats";
			return true;
		} else if (MouseIn(875, 450, 750, 64)) {
			KDJourney = "Random";
			KinkyDungeonState = "Stats";
			return true;
		} else if (MouseIn(875, 550, 750, 64)) {
			KDJourney = "Harder";
			KinkyDungeonState = "Stats";
			return true;
		} else if (MouseIn(1075, 850, 350, 64)) {
			KinkyDungeonState = "Menu";
			return true;
		}
	} else if (KinkyDungeonState == "Diff") {

		KDUpdatePlugSettings(true);
		if (MouseIn(1075, 900, 350, 64)) {
			KinkyDungeonState = "Menu";
			return true;
		}
	} else if (KinkyDungeonState == "Stats") {

		// Removed and moved to DrawButtonKDEx
	} else if (KinkyDungeonState == "TileEditor") {
		KDHandleTileEditor();
	}  else if (KinkyDungeonState == "Load"){
		if (MouseIn(875, 750, 350, 64)) {
			KinkyDungeonNewGame = 0;
			KDMapData.Grid = "";
			KinkyDungeonInitialize(1, true);
			MiniGameKinkyDungeonCheckpoint = "grv";
			if (KinkyDungeonLoadGame(ElementValue("saveInputField"))) {
				KDSendEvent('loadGame');
				//KDInitializeJourney(KDJourney);
				if (KDMapData.Grid == "") KinkyDungeonCreateMap(KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]], KDMapData.RoomType || "", KDMapData.MapMod || "", MiniGameKinkyDungeonLevel, false, true);
				ElementRemove("saveInputField");
				KinkyDungeonState = "Game";

				if (KinkyDungeonKeybindings) {
					KDCommitKeybindings();
				}
			}
			return true;
		} else if (MouseIn(1275, 750, 350, 64)) {
			KinkyDungeonState = "Menu";
			ElementRemove("saveInputField");
			return true;
		}
	} else if (KinkyDungeonState == "LoadOutfit"){
		if (MouseIn(875, 750, 350, 64)) {
			if (StandalonePatched) {
				KDSaveCodeOutfit();
				KinkyDungeonState = "Wardrobe";

			} else {
				let decompressed = LZString.decompressFromBase64(ElementValue("saveInputField"));
				if (decompressed) {
					let origAppearance = KinkyDungeonPlayer.Appearance;
					try {
						CharacterAppearanceRestore(KinkyDungeonPlayer, decompressed);
						CharacterRefresh(KinkyDungeonPlayer);
						KDInitProtectedGroups();
					} catch (e) {
						// If we fail, it might be a BCX code. try it!
						KinkyDungeonPlayer.Appearance = origAppearance;
						try {
							let parsed = JSON.parse(decompressed);
							if (parsed.length > 0) {
								if (!StandalonePatched) {
									for (let g of parsed) {
										InventoryWear(KinkyDungeonPlayer, g.Name, g.Group, g.Color);
									}
									CharacterRefresh(KinkyDungeonPlayer);
								}
								KDInitProtectedGroups();
							} else {
								console.log("Invalid code. Maybe its corrupt?");
							}
						} catch (error) {
							console.log("Invalid code.");
						}
					}
				}

				KinkyDungeonDressPlayer();
				KinkyDungeonNewDress = true;
				KinkyDungeonState = "Menu";
			}
			// Return to menu
			ElementRemove("saveInputField");
			return true;
		} else if (MouseIn(1275, 750, 350, 64)) {
			if (StandalonePatched) {
				KDRestoreOutfit();
				KinkyDungeonState = "Wardrobe";
			} else {
				KinkyDungeonState = "Menu";
			}
			ElementRemove("saveInputField");
			return true;
		}
	} else if (KinkyDungeonState == "Consent") {
		if (KDLoadingFinished) {
			if (MouseIn(1000-450/2, 720, 450, 64)) {
				KinkyDungeonState = "Menu";
				if (KDPatched) {
					KDSendEvent('optin');
				} else {
					KDOptOut = true;
				}

				CharacterReleaseTotal(KinkyDungeonPlayer);
				KinkyDungeonDressSet();
				CharacterNaked(KinkyDungeonPlayer);
				KinkyDungeonInitializeDresses();
				KinkyDungeonCheckClothesLoss = true;
				KinkyDungeonDressPlayer();
				KDInitProtectedGroups();
				CharacterRefresh(KinkyDungeonPlayer);

				return true;
			} else if (MouseIn(1000-450/2, 820, 450, 64)) {
				if (KDPatched) {
					KDSendEvent('optout');
				}
				KDOptOut = true;
				KinkyDungeonState = "Menu";

				CharacterReleaseTotal(KinkyDungeonPlayer);
				KinkyDungeonDressSet();
				CharacterNaked(KinkyDungeonPlayer);
				KinkyDungeonInitializeDresses();
				KinkyDungeonCheckClothesLoss = true;
				KinkyDungeonDressPlayer();
				KDInitProtectedGroups();
				CharacterRefresh(KinkyDungeonPlayer);

				return true;
			}
		}

	} else if (KinkyDungeonState == "Menu" || KinkyDungeonState == "Lose") {

		if (MouseIn(1700, 100, 64, 64)) {
			KDToggles.Sound = !KDToggles.Sound;
			KDSaveToggles();
		}

		if (MouseIn(1700, 874, 280, 50)) {
			let langIndex = KDLanguages.indexOf(localStorage.getItem("BondageClubLanguage")) || 0;
			let newIndex = (langIndex + 1) % KDLanguages.length;
			localStorage.setItem("BondageClubLanguage", KDLanguages[newIndex]);
			KDRestart = true;
			return true;
		}
		if (!StandalonePatched) {
			if (MouseIn(690, 930, 150, 64)) {
				KinkyDungeonState = "LoadOutfit";

				KDOriginalValue = LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer));
				CharacterReleaseTotal(KinkyDungeonPlayer);
				ElementCreateTextArea("saveInputField");
				ElementValue("saveInputField", LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer)));

				KinkyDungeonConfigAppearance = true;
				return true;
			} else if (MouseIn(460, 930, 220, 64)) {
				if (KinkyDungeonReplaceConfirm > 0) {
					KinkyDungeonDresses.Default = KinkyDungeonDefaultDefaultDress;
					CharacterAppearanceRestore(KinkyDungeonPlayer, CharacterAppearanceStringify(KinkyDungeonPlayerCharacter ? KinkyDungeonPlayerCharacter : Player));
					CharacterReleaseTotal(KinkyDungeonPlayer);
					KinkyDungeonSetDress("Default", "Default");
					KinkyDungeonDressPlayer();
					KDInitProtectedGroups();
					KinkyDungeonConfigAppearance = true;
					return true;
				} else {
					KinkyDungeonReplaceConfirm = 2;
					return true;
				}
			}
		}


		if (MouseIn(1850, 930, 135, 64)) {
			KinkyDungeonState = "Credits";
			return true;
		}
		if (MouseIn(1700, 930, 135, 64)) {
			KinkyDungeonState = "Patrons";
			return true;
		}
	} else if (KinkyDungeonState == "Save") {
		if (!KinkyDungeonIsPlayer()) KinkyDungeonState = "Game";
		if (MouseIn(1075, 750, 350, 64)) {
			KinkyDungeonState = "Game";
			ElementRemove("saveDataField");
			return true;
		}
	} else if (KinkyDungeonState == "Game") {
		if (KinkyDungeonIsPlayer()) KinkyDungeonClickGame();
	} else if (KinkyDungeonState == "Keybindings") {
		// Replaced by DrawButtonKDEx
	} else if (KinkyDungeonState == "Toggles") {
		let YYstart = 200;
		let YY = YYstart;
		let YYd = 70;

		YY = YYstart;


		if (StandalonePatched) {
			if (MouseIn(450, YY, 350, 64)) {
				if (MouseX <= 450 + 350/2) KDResolutionListIndex = (KDResolutionList.length + KDResolutionListIndex - 1) % KDResolutionList.length;
				else KDResolutionListIndex = (KDResolutionListIndex + 1) % KDResolutionList.length;
				KDResolution = KDResolutionList[KDResolutionListIndex];
				KDResolutionConfirm = true;
				localStorage.setItem("KDResolution", "" + KDResolutionListIndex);
			}
			YY += YYd;
			if (MouseIn(450, YY, 350, 64)) {
				if (MouseX <= 450 + 350/2) KDGammaListIndex = (KDGammaList.length + KDGammaListIndex - 1) % KDGammaList.length;
				else KDGammaListIndex = (KDGammaListIndex + 1) % KDGammaList.length;
				KDGamma = KDGammaList[KDGammaListIndex] || 0;
				localStorage.setItem("KDGamma", "" + KDGammaListIndex);
				kdgammafilterstore[0] = KDGamma;
			}
			YY += YYd*2;
		}

		if (MouseIn(450, YY, 350, 64)) {
			if (MouseX <= 450 + 350/2) KDVibeVolumeListIndex = (KDVibeVolumeList.length + KDVibeVolumeListIndex - 1) % KDVibeVolumeList.length;
			else KDVibeVolumeListIndex = (KDVibeVolumeListIndex + 1) % KDVibeVolumeList.length;
			KDVibeVolume = KDVibeVolumeList[KDVibeVolumeListIndex];
			localStorage.setItem("KDVibeVolume", "" + KDVibeVolumeListIndex);
		}
		YY += YYd;
		if (MouseIn(450, YY, 350, 64)) {
			if (MouseX <= 450 + 350/2) KDMusicVolumeListIndex = (KDMusicVolumeList.length + KDMusicVolumeListIndex - 1) % KDMusicVolumeList.length;
			else KDMusicVolumeListIndex = (KDMusicVolumeListIndex + 1) % KDMusicVolumeList.length;
			KDMusicVolume = KDMusicVolumeList[KDMusicVolumeListIndex];
			localStorage.setItem("KDMusicVolume", "" + KDMusicVolumeListIndex);
		}
		YY += YYd;
		if (MouseIn(450, YY, 350, 64)) {
			if (MouseX <= 450 + 350/2) KDSfxVolumeListIndex = (KDSfxVolumeList.length + KDSfxVolumeListIndex - 1) % KDSfxVolumeList.length;
			else KDSfxVolumeListIndex = (KDSfxVolumeListIndex + 1) % KDSfxVolumeList.length;
			KDSfxVolume = KDSfxVolumeList[KDSfxVolumeListIndex];
			localStorage.setItem("KDSfxVolume", "" + KDSfxVolumeListIndex);
		}
		YY += YYd;
		if (MouseIn(450, YY, 350, 64)) {
			if (MouseX <= 450 + 350/2) KDAnimSpeedListIndex = (KDAnimSpeedList.length + KDAnimSpeedListIndex - 1) % KDAnimSpeedList.length;
			else KDAnimSpeedListIndex = (KDAnimSpeedListIndex + 1) % KDAnimSpeedList.length;
			KDAnimSpeed = KDAnimSpeedList[KDAnimSpeedListIndex] || 0;
			localStorage.setItem("KDAnimSpeed", "" + KDAnimSpeedListIndex);
		}
		YY += YYd;
	} else if (KinkyDungeonState == "End") {
		if (MouseIn(1075, 650, 350, 64)) {
			KinkyDungeonState = "Game";
			KinkyDungeonNewGamePlus();
			return true;
		} if (MouseIn(1075, 750, 350, 64)) {
			KinkyDungeonState = "Menu";
			return true;
		}
	}


	return false;
}

/**
 * Handles clicks during the kinky dungeon game
 * @returns {void} - Nothing
 */
function KinkyDungeonClick() {
	if (KinkyDungeonState == "Logo") KinkyDungeonState = "Consent";
	else
	if (KinkyDungeonHandleClick()) {
		if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
	}
	if (KinkyDungeonReplaceConfirm > 0) KinkyDungeonReplaceConfirm -= 1;
}

/**
 * Handles exit during the kinky dungeon game
 * @returns {void} - Nothing
 */
function KinkyDungeonExit() {
	KinkyDungeonGameKey.removeKeyListener();
	CommonDynamicFunction(MiniGameReturnFunction + "()");

	// Refresh the player character if needed
	if (ArcadeDeviousChallenge && KinkyDungeonPlayerNeedsRefresh) {
		if (ServerPlayerIsInChatRoom()) {
			ChatRoomCharacterUpdate(Player);
		} else {
			CharacterRefresh(Player);
		}
	}

	if (CharacterAppearancePreviousEmoticon) {
		CharacterSetFacialExpression(Player, "Emoticon", CharacterAppearancePreviousEmoticon);
		CharacterAppearancePreviousEmoticon = "";
	}

	if (MiniGameKinkyDungeonLevel > Math.max(KinkyDungeonRep, ReputationGet("Gaming")) || Math.max(KinkyDungeonRep, ReputationGet("Gaming")) > KinkyDungeonMaxLevel) {
		KinkyDungeonRep = Math.max(KinkyDungeonRep, MiniGameKinkyDungeonLevel);
		DialogSetReputation("Gaming", KinkyDungeonRep);
	}

	if (CurrentScreen == "ChatRoom" && KinkyDungeonState != "Menu" && KDLose) {
		let Dictionary = [
			{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
			{ Tag: "KinkyDungeonLevel", Text: String(MiniGameKinkyDungeonLevel)},
		];
		ChatRoomPublishCustomAction("KinkyDungeonLose", false, Dictionary);
	}
	CharacterRefresh(Player, true);

	KinkyDungeonTeardownCrashHandler();
}




/**
 * Handles key presses during the mini game. (Both keyboard and mobile)
 * @returns {void} - Nothing
 */
function KinkyDungeonKeyDown() {
	// n/a
}



let mouseDown = false;
let MouseClicked = false;

window.addEventListener('mousedown', function() {
	mouseDown = true;
	MouseClicked = true;
});
window.addEventListener('touchstart', function() {
	MouseClicked = true;
});
window.addEventListener('mouseup', function() {
	mouseDown = false;
});

/**
 * Game keyboard input handler object: Handles keyboard inputs.
 * @constant
 * @type {object} - The game keyboard input handler object. Contains the functions and properties required to handle key press events.
 */
let KinkyDungeonGameKey = {
	keyPressed : [false, false, false, false, false, false, false, false, false],

	KEY_UP : 'KeyB',
	KEY_DOWN : 'KeyV',
	KEY_LEFT : 'KeyC',
	KEY_RIGHT : 'KeyX',
	KEY_UPLEFT : 'KeyC',
	KEY_UPRIGHT : 'KeyB',
	KEY_DOWNLEFT : 'KeyX',
	KEY_DOWNRIGHT : 'KeyV',
	KEY_WAIT : 'KeyV',
	KEY_SKIP : 'KeyEnter',

	load : function(){
		KinkyDungeonGameKey.keyPressed = [false, false, false, false, false, false, false, false, false];
		KinkyDungeonGameKey.addKeyListener();
	},

	addKeyListener : function () {
		window.addEventListener('keydown', KinkyDungeonGameKey.keyDownEvent);
		window.addEventListener('keyup', KinkyDungeonGameKey.keyUpEvent);
	},
	removeKeyListener : function () {
		window.removeEventListener('keydown', KinkyDungeonGameKey.keyDownEvent);
		window.removeEventListener('keyup', KinkyDungeonGameKey.keyUpEvent);
	},
	keyDownEvent : {
		handleEvent : function (event) {
			let code = event.code;
			if (!KDLastKeyTime[code]) {
				KinkyDungeonKeybindingCurrentKey = code;
				KDLastKeyTime[KinkyDungeonKeybindingCurrentKey] = CommonTime();
			}
			switch(code){
				case KinkyDungeonGameKey.KEY_UP:
					if(!KinkyDungeonGameKey.keyPressed[0]){
						KinkyDungeonGameKey.keyPressed[0] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_DOWN:
					if(!KinkyDungeonGameKey.keyPressed[1]){
						KinkyDungeonGameKey.keyPressed[1] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_LEFT:
					if(!KinkyDungeonGameKey.keyPressed[2]){
						KinkyDungeonGameKey.keyPressed[2] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_RIGHT:
					if(!KinkyDungeonGameKey.keyPressed[3]){
						KinkyDungeonGameKey.keyPressed[3] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_UPLEFT:
					if(!KinkyDungeonGameKey.keyPressed[4]){
						KinkyDungeonGameKey.keyPressed[4] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_UPRIGHT:
					if(!KinkyDungeonGameKey.keyPressed[5]){
						KinkyDungeonGameKey.keyPressed[5] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_DOWNLEFT:
					if(!KinkyDungeonGameKey.keyPressed[6]){
						KinkyDungeonGameKey.keyPressed[6] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_DOWNRIGHT:
					if(!KinkyDungeonGameKey.keyPressed[7]){
						KinkyDungeonGameKey.keyPressed[7] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_WAIT:
					if(!KinkyDungeonGameKey.keyPressed[8]){
						KinkyDungeonGameKey.keyPressed[8] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_SKIP:
					if(!KinkyDungeonGameKey.keyPressed[9]){
						KinkyDungeonGameKey.keyPressed[9] = true;
					}
					break;
			}
		}
	},
	keyUpEvent : {
		handleEvent : function (event) {
			let code = event.code;
			KinkyDungeonKeybindingCurrentKeyRelease = code;
			if (KinkyDungeonKeybindingCurrentKeyRelease) KinkyDungeonGameKeyUp(KDLastKeyTime[KinkyDungeonKeybindingCurrentKeyRelease]);
			if (KDLastKeyTime[code]) delete KDLastKeyTime[code];
			KinkyDungeonKeybindingCurrentKeyRelease = '';
			switch(code){
				case KinkyDungeonGameKey.KEY_UP:
					if (KinkyDungeonGameKey.keyPressed[0]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[0] = false;
					break;
				case KinkyDungeonGameKey.KEY_DOWN:
					if (KinkyDungeonGameKey.keyPressed[1]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[1] = false;
					break;
				case KinkyDungeonGameKey.KEY_LEFT:
					if (KinkyDungeonGameKey.keyPressed[2]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[2] = false;
					break;
				case KinkyDungeonGameKey.KEY_RIGHT:
					if (KinkyDungeonGameKey.keyPressed[3]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[3] = false;
					break;
				case KinkyDungeonGameKey.KEY_UPLEFT:
					if (KinkyDungeonGameKey.keyPressed[4]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[4] = false;
					break;
				case KinkyDungeonGameKey.KEY_UPRIGHT:
					if (KinkyDungeonGameKey.keyPressed[5]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[5] = false;
					break;
				case KinkyDungeonGameKey.KEY_DOWNLEFT:
					if (KinkyDungeonGameKey.keyPressed[6]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[6] = false;
					break;
				case KinkyDungeonGameKey.KEY_DOWNRIGHT:
					if (KinkyDungeonGameKey.keyPressed[7]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[7] = false;
					break;
				case KinkyDungeonGameKey.KEY_WAIT:
					if (KinkyDungeonGameKey.keyPressed[8]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[8] = false;
					break;
				case KinkyDungeonGameKey.KEY_SKIP:
					if (KinkyDungeonGameKey.keyPressed[9]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[9] = false;
					break;
			}

		}
	},
};



/**
 * Outputs a savegame
 * @returns {KinkyDungeonSave} - Saved game object
 */
function KinkyDungeonGenerateSaveData() {
	/** @type {KinkyDungeonSave} */
	let save = {};
	save.level = MiniGameKinkyDungeonLevel;
	save.checkpoint = MiniGameKinkyDungeonCheckpoint;
	save.rep = KinkyDungeonGoddessRep;
	save.costs = KinkyDungeonShrineCosts;
	save.pcosts = KinkyDungeonPenanceCosts;
	save.dress = KinkyDungeonCurrentDress;
	save.gold = KinkyDungeonGold;
	save.points = KinkyDungeonSpellPoints;
	save.id = KinkyDungeonEnemyID;
	save.idspell = KinkyDungeonSpellID;
	save.choices = KinkyDungeonSpellChoices;
	save.choices_wep = KinkyDungeonWeaponChoices;
	save.choices_arm = KinkyDungeonArmorChoices;
	save.choices_con = KinkyDungeonConsumableChoices;
	save.choices2 = KinkyDungeonSpellChoicesToggle;
	save.buffs = KinkyDungeonPlayerBuffs;
	save.lostitems = KinkyDungeonLostItems;
	save.rescued = KinkyDungeonRescued;
	save.aid = KinkyDungeonAid;
	save.seed = KinkyDungeonSeed;
	save.statchoice = Array.from(KinkyDungeonStatsChoice);
	save.mapIndex = KinkyDungeonMapIndex;
	save.flags = Array.from(KinkyDungeonFlags);
	save.faction = KinkyDungeonFactionRelations;
	save.perks = KDUnlockedPerks;
	save.inventoryVariants = KinkyDungeonInventoryVariants;
	save.KinkyDungeonPlayerEntity = KinkyDungeonPlayerEntity;

	let spells = [];
	/**@type {item[]} */
	let newInv = [];

	for (let inv of KinkyDungeonFullInventory()) {
		let item = Object.assign({}, inv);
		newInv.push(item);
	}

	for (let spell of KinkyDungeonSpells) {
		spells.push(spell.name);
	}

	save.spells = spells;
	save.inventory = newInv;
	save.KDGameData = KDGameData;
	save.KDMapData = KDMapData;
	save.KDEventData = KDEventData;
	save.KDWorldMap = KDWorldMap;
	save.KDCurrentWorldSlot = KDCurrentWorldSlot;
	save.KinkyDungeonPlayerEntity = KinkyDungeonPlayerEntity;
	save.KDCurrentWorldSlot = KDCurrentWorldSlot;


	save.stats = {
		picks: KinkyDungeonLockpicks,
		keys: KinkyDungeonRedKeys,
		bkeys: KinkyDungeonBlueKeys,
		mana: KinkyDungeonStatMana,
		manapool: KinkyDungeonStatManaPool,
		stamina: KinkyDungeonStatStamina,
		willpower: KinkyDungeonStatWill,
		distraction: KinkyDungeonStatDistraction,
		distractionlower: KinkyDungeonStatDistractionLower,
		wep: KinkyDungeonPlayerWeapon,
		npp: KinkyDungeonNewGame,
		diff: KinkyDungeonStatsChoice.get("randomMode"),
	};
	return save;
}

function KinkyDungeonSaveGame(ToString) {
	let save = KinkyDungeonGenerateSaveData();

	let data = KinkyDungeonCompressSave(save);
	if (!ToString) {
		//Player.KinkyDungeonSave = saveData.KinkyDungeonSave;
		//ServerAccountUpdate.QueueData(saveData);
		localStorage.setItem('KinkyDungeonSave', data);
	}
	return data;
}

function KinkyDungeonCompressSave(save) {
	return LZString.compressToBase64(JSON.stringify(save));
}

// N4IgNgpgbhYgXARgDQgMYAsJoNYAcB7ASwDsAXBABlQCcI8FQBxDAgZwvgFoBWakAAo0ibAiQg0EvfgBkIAQzJZJ8fgFkIZeXFWoASgTwQqqAOpEwO/gFFIAWwjk2JkAGExAKwCudFwElLLzYiMSoAX1Q0djJneGAIkAIaACNYgG0AXUisDnSskAATOjZYkAARCAAzeS8wClQAcwIwApdCUhiEAGZUSBgwWNBbCAcnBBQ3Tx9jJFQAsCCQknGEtiNLPNRSGHIkgE8ENNAokjYvO3lkyEYQEnkHBEECMiW1eTuQBIBHL3eXsgOSAixzEZwuVxmoDuD3gTxeYgAylo7KR5J9UD8/kQAStkCDTudLtc4rd7jM4UsAGLCBpEVrfX7kbGAxDAkAAdwUhGWJOh5IA0iQiJVjGE2cUyDR5B0bnzHmUvGgyAAVeRGOQNZwJF4NDBkcQlca9Ai4R7o0ASqUy3lk+WKlVqiCUiCaNTnOwHbVEXX6iCG2bgE04M1hDJhIA=
function KinkyDungeonLoadGame(String) {
	let str = String ? LZString.decompressFromBase64(String.trim()) : (localStorage.getItem('KinkyDungeonSave') ? LZString.decompressFromBase64(localStorage.getItem('KinkyDungeonSave')) : "");
	if (str) {
		let saveData = JSON.parse(str);
		if (saveData
			&& saveData.spells != undefined
			&& saveData.level != undefined
			&& saveData.checkpoint != undefined
			&& saveData.inventory != undefined
			&& saveData.costs != undefined
			&& saveData.rep != undefined
			&& saveData.dress != undefined) {


			KDPathfindingCacheFails = 0;
			KDPathfindingCacheHits = 0;
			KDPathCache = new Map();
			KDThoughtBubbles = new Map();

			KDMapData.Entities = [];
			KDCommanderRoles = new Map();
			KDUpdateEnemyCache = true;
			if (saveData.flags && saveData.flags.length) KinkyDungeonFlags = new Map(saveData.flags);
			MiniGameKinkyDungeonLevel = saveData.level;
			if (Array.from(Object.keys(KinkyDungeonMapIndex)).includes(saveData.checkpoint))
				MiniGameKinkyDungeonCheckpoint = saveData.checkpoint;
			else MiniGameKinkyDungeonCheckpoint = "grv";
			KinkyDungeonShrineCosts = saveData.costs;
			KinkyDungeonGoddessRep = saveData.rep;
			KinkyDungeonCurrentDress = saveData.dress;
			KDGameData.KinkyDungeonSpawnJailers = 0;
			KDGameData.KinkyDungeonSpawnJailersMax = 0;
			if (saveData.seed) KDsetSeed(saveData.seed);
			if (saveData.pcosts) KinkyDungeonPenanceCosts = saveData.pcosts;
			if (saveData.choices) KinkyDungeonSpellChoices = saveData.choices;
			if (saveData.choices_wep) KinkyDungeonWeaponChoices = saveData.choices_wep;
			if (saveData.choices_arm) KinkyDungeonArmorChoices = saveData.choices_arm;
			if (saveData.choices_con) KinkyDungeonConsumableChoices = saveData.choices_con;
			if (saveData.choices2) KinkyDungeonSpellChoicesToggle = saveData.choices2;
			if (saveData.buffs) KinkyDungeonPlayerBuffs = saveData.buffs;
			if (saveData.gold != undefined) KinkyDungeonGold = saveData.gold;
			if (saveData.id != undefined) KinkyDungeonEnemyID = saveData.id;
			if (saveData.idspell != undefined) KinkyDungeonSpellID = saveData.idspell;
			if (saveData.points != undefined) KinkyDungeonSpellPoints = saveData.points;
			if (saveData.lostitems != undefined) KinkyDungeonLostItems = saveData.lostitems;
			if (saveData.rescued != undefined) KinkyDungeonRescued = saveData.rescued;
			if (saveData.aid != undefined) KinkyDungeonAid = saveData.aid;
			if (saveData.KDCurrentWorldSlot) KDCurrentWorldSlot = saveData.KDCurrentWorldSlot;
			if (saveData.stats) {
				if (saveData.stats.picks != undefined) KinkyDungeonLockpicks = saveData.stats.picks;
				if (saveData.stats.keys != undefined) KinkyDungeonRedKeys = saveData.stats.keys;
				if (saveData.stats.bkeys != undefined) KinkyDungeonBlueKeys = saveData.stats.bkeys;
				if (saveData.stats.mana != undefined) KinkyDungeonStatMana = saveData.stats.mana;
				if (saveData.stats.manapool != undefined) KinkyDungeonStatManaPool = saveData.stats.manapool;
				if (saveData.stats.stamina != undefined) KinkyDungeonStatStamina = saveData.stats.stamina;
				if (saveData.stats.willpower != undefined) KinkyDungeonStatWill = saveData.stats.willpower;
				if (saveData.stats.distraction != undefined) KinkyDungeonStatDistraction = saveData.stats.distraction;
				if (saveData.stats.distractionlower != undefined) KinkyDungeonStatDistractionLower = saveData.stats.distractionlower;
				if (saveData.stats.wep != undefined) KDSetWeapon(saveData.stats.wep);
				if (saveData.stats.npp != undefined) KinkyDungeonNewGame = saveData.stats.npp;


				KDOrigStamina = KinkyDungeonStatStamina*10;
				KDOrigWill = KinkyDungeonStatWill*10;
				KDOrigMana = KinkyDungeonStatMana*10;
				KDOrigDistraction = KinkyDungeonStatDistraction*10;
			}
			KDGameData = JSON.parse(JSON.stringify(KDGameDataBase));
			if (saveData.KDGameData != undefined) KDGameData = Object.assign({}, saveData.KDGameData);
			KDEventData = JSON.parse(JSON.stringify(KDEventDataBase));
			if (saveData.KDEventData != undefined) KDEventData = Object.assign({}, saveData.KDEventData);
			if (saveData.inventoryVariants) KinkyDungeonInventoryVariants = saveData.inventoryVariants;

			if (saveData.statchoice != undefined) KinkyDungeonStatsChoice = new Map(saveData.statchoice);

			KinkyDungeonSexyMode = KinkyDungeonStatsChoice.get("arousalMode");
			KinkyDungeonSexyPlug = KinkyDungeonStatsChoice.get("arousalModePlug");
			KinkyDungeonSexyPiercing = KinkyDungeonStatsChoice.get("arousalModePiercing");
			KinkyDungeonRandomMode = KinkyDungeonStatsChoice.get("randomMode");
			KinkyDungeonSaveMode = KinkyDungeonStatsChoice.get("saveMode");
			KinkyDungeonHardMode = KinkyDungeonStatsChoice.get("hardMode");
			KinkyDungeonExtremeMode = KinkyDungeonStatsChoice.get("extremeMode");
			//KinkyDungeonPerksMode = KinkyDungeonStatsChoice.get("perksMode");
			KinkyDungeonPerksMode = KinkyDungeonStatsChoice.get("hardperksMode") ? 2 : (KinkyDungeonStatsChoice.get("perksMode") ? 1 : 0);
			KinkyDungeonEasyMode = KinkyDungeonStatsChoice.get("norescueMode") ? 2 : (KinkyDungeonStatsChoice.get("easyMode") ? 1 : 0);

			if (saveData.faction != undefined) KinkyDungeonFactionRelations = saveData.faction;
			KDInitFactions();
			if (typeof KDGameData.TimeSinceLastVibeStart === "number") KDGameData.TimeSinceLastVibeStart = {};
			if (typeof KDGameData.TimeSinceLastVibeEnd === "number") KDGameData.TimeSinceLastVibeEnd = {};

			if (!KDGameData.AlreadyOpened) KDGameData.AlreadyOpened = [];

			if (saveData.perks) {
				KDUnlockedPerks = saveData.perks;
				KDLoadPerks();
			}
			KDUnlockPerk();

			KDInitInventory();
			for (let item of saveData.inventory) {
				if (item.type == Restraint) {
					let restraint = KinkyDungeonGetRestraintByName(item.name);
					if (restraint) {
						KinkyDungeonAddRestraint(restraint, 0, true, item.lock, undefined, undefined, undefined, undefined, item.faction); // Add the item
						let createdrestraint = KinkyDungeonGetRestraintItem(restraint.Group);
						if (createdrestraint) createdrestraint.lock = item.lock; // Lock if applicable
						if (createdrestraint) createdrestraint.events = item.events; // events if applicable
						KinkyDungeonInventoryAdd(item);
					}
				} else {
					if (item.type != LooseRestraint || KDRestraint(item) != undefined)
						KinkyDungeonInventoryAdd(item);
				}
			}

			KinkyDungeonSpells = [];
			for (let spell of saveData.spells) {
				let sp = KinkyDungeonFindSpell(spell);
				if (sp) KinkyDungeonSpells.push(sp);
			}

			if (saveData.KDWorldMap) KDWorldMap = JSON.parse(JSON.stringify(saveData.KDWorldMap));

			if (saveData.KinkyDungeonPlayerEntity) KinkyDungeonPlayerEntity = saveData.KinkyDungeonPlayerEntity;
			if (saveData.KDMapData) KDMapData = Object.assign(KDDefaultMapData("", ""), JSON.parse(JSON.stringify(saveData.KDMapData)));
			else {
				if (saveData.KinkyDungeonEffectTiles) KDMapData.EffectTiles = saveData.KinkyDungeonEffectTiles;
				if (saveData.KinkyDungeonTiles) KDMapData.Tiles = saveData.KinkyDungeonTiles;
				if (saveData.KinkyDungeonTilesSkin) KDMapData.TilesSkin = saveData.KinkyDungeonTilesSkin;
				if (saveData.KinkyDungeonTilesMemory) KDMapData.TilesMemory = saveData.KinkyDungeonTilesMemory;
				if (saveData.KinkyDungeonRandomPathablePoints) KDMapData.RandomPathablePoints = saveData.KinkyDungeonRandomPathablePoints;
				if (saveData.KinkyDungeonEntities) KDMapData.Entities = saveData.KinkyDungeonEntities;
				KDCommanderRoles = new Map();
				if (saveData.KinkyDungeonBullets) KDMapData.Bullets = saveData.KinkyDungeonBullets;
				if (saveData.KinkyDungeonStartPosition) KDMapData.StartPosition = saveData.KinkyDungeonStartPosition;
				if (saveData.KinkyDungeonEndPosition) KDMapData.EndPosition = saveData.KinkyDungeonEndPosition;
				if (saveData.KinkyDungeonGrid) {
					KDMapData.Grid = saveData.KinkyDungeonGrid;
					KDMapData.GridWidth = saveData.KinkyDungeonGridWidth;
					KDMapData.GridHeight = saveData.KinkyDungeonGridHeight;
				}
				KinkyDungeonResetFog();
				if (saveData.KinkyDungeonFogGrid) KDMapData.FogGrid = saveData.KinkyDungeonFogGrid;
			}

			KDUpdateEnemyCache = true;


			KinkyDungeonSetMaxStats();
			KinkyDungeonCheckClothesLoss = true;
			KDNaked = false;
			KinkyDungeonDressPlayer();
			KDRefresh = true;
			KDUpdateEnemyCache = true;
			if (KDGameData.Journey)
				KDJourney = KDGameData.Journey;
			if (saveData.mapIndex && !saveData.mapIndex.length) KinkyDungeonMapIndex = saveData.mapIndex;

			if (String)
				localStorage.setItem('KinkyDungeonSave', String);

			if (saveData.KDGameData && saveData.KDGameData.LastMapSeed) KDsetSeed(saveData.KDGameData.LastMapSeed);

			if (!KinkyDungeonMapIndex[KDMapData.MainPath] || !KinkyDungeonMapIndex[KDMapData.ShortcutPath])
				KDInitializeJourney(KDGameData.Journey);

			if (saveData.KDMapData || saveData.KinkyDungeonGrid) {
				KDUpdateVision();
			}
			KinkyDungeonFloaters = [];
			KDFixNeeds();
			KinkyDungeonAdvanceTime(0, true, true);
			return true;
		}
	}
	return false;
}

let KinkyDungeonSeed = (Math.random() * 4294967296).toString();
let KDRandom = sfc32(xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)());

/**
 *
 * @param {boolean} Native Decides whether or not to use native KDRandom to randomize
 */
function KDrandomizeSeed(Native) {
	let rand = Native ? KDRandom : () => {return Math.random();};
	KinkyDungeonSeed = (rand() * 4294967296).toString();
	for (let i = 0; i < 20; i++) {
		let index = rand() * KinkyDungeonSeed.length;
		KinkyDungeonSeed = KinkyDungeonSeed.replaceAt(index, String.fromCharCode(65 + Math.floor(rand()*50)) + String.fromCharCode(65 + Math.floor(rand()*50)));
	}
	KDRandom = sfc32(xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)());
	for (let i = 0; i < 1000; i++) {
		KDRandom();
	}
}

function KDsetSeed(string) {
	KinkyDungeonSeed = string;
	KDRandom = sfc32(xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)());
	for (let i = 0; i < 1000; i++) {
		KDRandom();
	}
}

/**
 * It takes a string and returns a function that returns a random number
 * @param str - The string to hash.
 * @returns A function that returns a random number.
 */
function xmur3(str) {
	let h = 1779033703 ^ str.length;
	for(let i = 0; i < str.length; i++) {
		h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
		h = h << 13 | h >>> 19;
	} return function() {
		h = Math.imul(h ^ (h >>> 16), 2246822507);
		h = Math.imul(h ^ (h >>> 13), 3266489909);
		return (h ^= h >>> 16) >>> 0;
	};
}

/**
 * It takes four 32-bit integers and returns a function that returns a random number between 0 and 1
 * @param a - The first parameter.
 * @param b - 0x9e3779b9
 * @param c - 0x9e3779b9
 * @param d - The seed.
 * @returns A function that returns a random number between 0 and 1.
 */
function sfc32(a, b, c, d) {
	return function() {
		a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
		let t = (a + b) | 0;
		a = b ^ b >>> 9;
		b = c + (c << 3) | 0;
		c = (c << 21 | c >>> 11);
		d = d + 1 | 0;
		t = t + d | 0;
		c = c + t | 0;
		return (t >>> 0) / 4294967296;
	};
}

/**
 * @type {Map<string, HTMLAudioElement>}
 */
let kdSoundCache = new Map();

/**
 *
 * @param {string} Path
 * @param {number} [volume]
 */
function AudioPlayInstantSoundKD(Path, volume) {
	if (!KDToggles.Sound) return false;
	const vol = KDSfxVolume * (volume != null ? volume : Player.AudioSettings.Volume);
	if (vol > 0) {
		let src = KDModFiles[Path] || Path;
		let audio = kdSoundCache.has(src) ? kdSoundCache.get(src) : new Audio();
		if (!kdSoundCache.has(src))  {
			audio.src = src;
			kdSoundCache.set(src, audio);
		} else {
			audio.pause();
			audio.currentTime = 0;
		}
		audio.volume = Math.min(vol, 1);
		audio.play();
	}
}

/**
 * From https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
 */
function hashCode(s) {
	let h = 0;
	for(let i = 0; i < s.length; i++)
		h = Math.imul(31, h) + s.charCodeAt(i) | 0;
	return h;
}

function TextGetKD(Text) {
	if (TextGet(Text))
		return TextGet(Text);
	else return KDLoadingTextKeys[Text] || "Missing text";
}


function KinkyDungeonCheckPlayerRefresh() {
	if (!ArcadeDeviousChallenge || CommonTime() < KinkyDungeonNextRefreshCheck) {
		return;
	}

	// We've exceeded the refresh check time - check again in 1 second
	KinkyDungeonNextRefreshCheck = CommonTime() + 1000;

	if (!KinkyDungeonPlayerNeedsRefresh) {
		return;
	}

	KinkyDungeonPlayerNeedsRefresh = false;

	if (ServerPlayerIsInChatRoom()) {
		ChatRoomCharacterUpdate(Player);
	} else {
		CharacterRefresh(Player);
	}
}

function CJKcheck(text,p = 0,o = "search"){
	if (o == "search")
	{
		//Find all English characters and space
		if (p == 1){ return text.match(/[a-zA-Z0-9\s\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+/g);}
		//Find all characters except English characters
		if (p == 2){ return text.match(/^[a-zA-Z\s\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$/g);}
		//Find all CJK Symbols and Punctuation
		if (p == 3){ return text.match(/[\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\uff1f\uff01\uffe5\u3000-\u303f]+/g);}
		//Find all CJK characters
		else { return text.match(/[\u3000-\u9fff\ue000-\uf8ff\uff01-\uffdc\uac00-\ud7af]+/g);}
	} else if (o == "test")
	{
		//Check CJK Symbols and Punctuation
		if (p == 3){ return (/[\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\uff1f\uff01\uffe5\u3000-\u303f]+/g).test(text);}
	}
}

/**
 * @param {string} id
 * @returns {HTMLCanvasElement}
 */
function KinkyDungeonGetCanvas(id) {
	const canvas = document.getElementById(id);
	if (!(canvas instanceof HTMLCanvasElement)) throw new Error(`Not a canvas element: ${canvas.id}`);
	return canvas;
}