const { InstanceBase, Regex, runEntrypoint, InstanceStatus, combineRgb } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const { RGBLinkVSP628ProConnector, FRONT_PANEL_LOCKED, FRONT_PANEL_UNLOCKED } = require('./rgblink_vsp628pro_connector')

const ACTION_FRONT_PANEL_LOCK = 'lock'
const ACTION_FRONT_PANEL_UNLOCK = 'unlock'

const FEEDBACK_FRONT_PANEL_LOCKED = 'locked'
const FEEDBACK_FRONT_PANEL_UNLOCKED = 'unlocked'

class VSP628ProModuleInstance extends InstanceBase {
	apiConnector = new RGBLinkVSP628ProConnector()
	feedbacks = {}

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
		this.feedbacks = {}

		let module = this

		this.feedbacks[FEEDBACK_FRONT_PANEL_LOCKED] = {
			type: 'boolean',
			name: 'Front panel is locked',
			defaultStyle: {
				bgcolor: combineRgb(255, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			// options is how the user can choose the condition the feedback activates for
			options: [],
			callback: (/*feedback*/) => {
				module.log('debug', 'checking feedback for locked...')
				return module.apiConnector.deviceStatus.frontPanelLocked == FRONT_PANEL_LOCKED
			},
		}
		this.feedbacks[FEEDBACK_FRONT_PANEL_UNLOCKED] = {
			type: 'boolean',
			name: 'Front panel is unlocked',
			defaultStyle: {
				bgcolor: combineRgb(0, 204, 0),
				color: combineRgb(255, 255, 255),
			},
			// options is how the user can choose the condition the feedback activates for
			options: [],
			callback: (/*feedback*/) => {
				module.log('debug', 'checking feedback for unlocked...')
				return module.apiConnector.deviceStatus.frontPanelLocked == FRONT_PANEL_UNLOCKED
			},
		}

		this.setFeedbackDefinitions(this.feedbacks)
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
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
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
					style: {
						bgcolor: combineRgb(255, 255, 0),
						color: combineRgb(0, 0, 0),
					},
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
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
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
					style: {
						bgcolor: combineRgb(0, 204, 0),
						color: combineRgb(255, 255, 255),
					},
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
