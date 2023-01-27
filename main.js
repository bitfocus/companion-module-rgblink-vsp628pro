const { InstanceBase, Regex, runEntrypoint, InstanceStatus, combineRgb } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const { RGBLinkVSP628ProConnector, FRONT_PANEL_LOCKED, FRONT_PANEL_UNLOCKED } = require('./rgblink_vsp628pro_connector')

const ACTION_FRONT_PANEL_LOCK = 'lock'
const ACTION_FRONT_PANEL_UNLOCK = 'unlock'

const FEEDBACK_FRONT_PANEL_LOCKED = 'locked'
const FEEDBACK_FRONT_PANEL_UNLOCKED = 'unlocked'

class VSP628ProModuleInstance extends InstanceBase {
	apiConnector = new RGBLinkVSP628ProConnector()
	colorsSingle = {
		WHITE: combineRgb(255, 255, 255),
		BLACK: combineRgb(0, 0, 0),
		RED: combineRgb(255, 0, 0),
		GREEN: combineRgb(0, 204, 0),
		YELLOW: combineRgb(255, 255, 0),
		BLUE: combineRgb(0, 51, 204),
		PURPLE: combineRgb(255, 0, 255),
	}
	colorsComb = {
		// https://github.com/bitfocus/companion-module-base/wiki/Presets
		// Standard Colors
		// RED	255,0,0	White text	STOP,HALT,BREAK,KILL and similar terminating functions + Active program on switchers
		RED_BACKGROUND_WITH_WHITE_TEXT: {
			bgcolor: this.colorsSingle.RED,
			color: this.colorsSingle.WHITE,
		},
		// GREEN	0,204,0	White text	TAKE,GO,PLAY, and similar starting functions. + Active Preview on switchers
		GREEN_BACKGROUND_WITH_WHITE_TEXT: {
			bgcolor: this.colorsSingle.GREEN,
			color: this.colorsSingle.WHITE,
		},
		// YELLOW	255,255,0	Black text	PAUSE,HOLD,WAIT and similar holding functions + active Keyer on switchers
		YELLOW_BACKGROUND_WITH_BLACK_TEXT: {
			bgcolor: this.colorsSingle.YELLOW,
			color: this.colorsSingle.BLACK,
		},
		// BLUE	0,51,204	White text	Active AUX on switchers
		BLUE_BACKGROUND_WITH_WHITE_TEXT: {
			bgcolor: this.colorsSingle.BLUE,
			color: this.colorsSingle.WHITE,
		},
		// PURPLE	255,0,255	White text	Presets that need user configuration after they have been draged onto a button
		PURPLE_BACKGROUND_WITH_WHITE_TEXT: {
			bgcolor: this.colorsSingle.PURPLE,
			color: this.colorsSingle.WHITE,
		},
	}

	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		try {
			this.log('debug', 'RGBlink VSP628PRO: init...')
			this.initApiConnector()
			this.updateActions()
			this.updateFeedbacks()
			this.updatePresets()
			this.log('debug', 'RGBlink VSP628PRO: init finished')
		} catch (ex) {
			this.updateStatus(InstanceStatus.UnknownError, ex)
			console.log(ex)
			this.log('error', ex)
		}
	}
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 8,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				regex: Regex.PORT,
			},
			{
				type: 'checkbox',
				label: 'Status polling (ask for status every second)',
				id: 'polling',
				width: 12,
				default: true,
			},
		]
	}

	updateActions() {
		let actions = {}

		actions[ACTION_FRONT_PANEL_LOCK] = {
			name: 'Lock front panel',
			options: [],
			callback: async (/*event*/) => {
				this.apiConnector.sendSetFrontPanelLockStatus(FRONT_PANEL_LOCKED)
			},
		}

		actions[ACTION_FRONT_PANEL_UNLOCK] = {
			name: 'Unlock front panel',
			options: [],
			callback: async (/*event*/) => {
				this.apiConnector.sendSetFrontPanelLockStatus(FRONT_PANEL_UNLOCKED)
			},
		}

		this.setActionDefinitions(actions)
	}

	updateFeedbacks() {
		let feedbacks = {}

		let module = this

		feedbacks[FEEDBACK_FRONT_PANEL_LOCKED] = {
			type: 'boolean',
			name: 'Front panel is locked',
			defaultStyle: this.colorsComb.YELLOW_BACKGROUND_WITH_BLACK_TEXT,
			// options is how the user can choose the condition the feedback activates for
			options: [],
			callback: (/*feedback*/) => {
				module.log('debug', 'checking feedback for locked...')
				return module.apiConnector.deviceStatus.frontPanelLocked == FRONT_PANEL_LOCKED
			},
		}
		feedbacks[FEEDBACK_FRONT_PANEL_UNLOCKED] = {
			type: 'boolean',
			name: 'Front panel is unlocked',
			defaultStyle: this.colorsComb.GREEN_BACKGROUND_WITH_WHITE_TEXT,
			// options is how the user can choose the condition the feedback activates for
			options: [],
			callback: (/*feedback*/) => {
				module.log('debug', 'checking feedback for unlocked...')
				return module.apiConnector.deviceStatus.frontPanelLocked == FRONT_PANEL_UNLOCKED
			},
		}

		this.setFeedbackDefinitions(feedbacks)
	}

	updatePresets() {
		let presets = []

		presets.push({
			type: 'button',
			category: 'Front panel',
			name: `Lock front panel`, // A name for the preset. Shown to the user when they hover over it
			style: {
				text: 'Lock front panel',
				size: 'auto',
				color: this.colorsSingle.WHITE,
				bgcolor: this.colorsSingle.BLACK,
			},
			steps: [
				{
					down: [
						{
							actionId: ACTION_FRONT_PANEL_LOCK,
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: FEEDBACK_FRONT_PANEL_LOCKED,
					options: {},
					style: this.colorsComb.YELLOW_BACKGROUND_WITH_BLACK_TEXT,
				},
			],
		})
		presets.push({
			type: 'button',
			category: 'Front panel',
			name: 'Unlock front panel', // A name for the preset. Shown to the user when they hover over it
			style: {
				text: 'Unlock front panel',
				size: 'auto',
				color: this.colorsSingle.WHITE,
				bgcolor: this.colorsSingle.BLACK,
			},
			steps: [
				{
					down: [
						{
							actionId: ACTION_FRONT_PANEL_UNLOCK,
							options: [],
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: FEEDBACK_FRONT_PANEL_UNLOCKED,
					options: {},
					style: this.colorsComb.GREEN_BACKGROUND_WITH_WHITE_TEXT,
				},
			],
		})

		this.setPresetDefinitions(presets)
	}

	initApiConnector() {
		let self = this
		this.apiConnector = new RGBLinkVSP628ProConnector(this.config.host, this.config.port, this.config.polling)
		this.apiConnector.enableLog(this)
		this.apiConnector.on(this.apiConnector.EVENT_NAME_ON_DEVICE_STATE_CHANGED, () => {
			self.checkAllFeedbacks()
		})
		this.apiConnector.on(this.apiConnector.EVENT_NAME_ON_CONNECTION_OK, (message) => {
			self.updateStatus(InstanceStatus.Ok, message)
		})
		this.apiConnector.on(this.apiConnector.EVENT_NAME_ON_CONNECTION_WARNING, (message) => {
			self.updateStatus(InstanceStatus.UnknownWarning, message)
		})
		this.apiConnector.on(this.apiConnector.EVENT_NAME_ON_CONNECTION_ERROR, (message) => {
			self.updateStatus(InstanceStatus.UnknownError, message)
		})
		this.updateStatus(InstanceStatus.Connecting)
		this.apiConnector.sendConnectMessage()
		this.apiConnector.askAboutStatus()
	}

	checkAllFeedbacks() {
		this.checkFeedbacks(FEEDBACK_FRONT_PANEL_LOCKED)
		this.checkFeedbacks(FEEDBACK_FRONT_PANEL_UNLOCKED)
	}
}

runEntrypoint(VSP628ProModuleInstance, UpgradeScripts)

/**
 * usefull for developing
 * for yearn and powershell https://bobbyhadz.com/blog/yarn-cannot-be-loaded-running-scripts-disabled
 * first eslint initalization need: npm init @eslint/config
 */
