const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const { RGBLinkVSP628ProConnector } = require('./rgblink_vsp628pro_connector')

const FrontPanelManager = require('./managers/FrontPanelManager')

class VSP628ProModuleInstance extends InstanceBase {
	apiConnector = new RGBLinkVSP628ProConnector()
	managers = []

	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		try {
			this.log('debug', 'RGBlink VSP628PRO: init...')
			this.initApiConnector()
			this.managers.push(new FrontPanelManager(this))
			// TODO all functions
			// TODO Factory reset (0x06)
			// TODO Save To the user flash(0x08) & Load from the user flash(0x09)
			// TODO Standard mode (0x04) [standard/pip/dual2k/switcher]
			// TODO Read which layer selected (0x03) [A/B]
			// TODO Source switch (0x00), different to pip and dual2k...
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
		for (var i = 0; i < this.managers.length; i++) {
			actions = { ...actions, ...this.managers[i].getActions() }
		}
		this.setActionDefinitions(actions)
	}

	updateFeedbacks() {
		let feedbacks = {}
		for (var i = 0; i < this.managers.length; i++) {
			feedbacks = { ...feedbacks, ...this.managers[i].getFeedbacks() }
		}

		this.setFeedbackDefinitions(feedbacks)
	}

	updatePresets() {
		let presets = []
		for (var i = 0; i < this.managers.length; i++) {
			presets = { ...presets, ...this.managers[i].getPresets() }
		}

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
		let feedbacknames = []
		for (let i = 0; i < this.managers.length; i++) {
			feedbacknames = feedbacknames.concat(this.managers[i].getFeedbacksNames())
		}

		for (let i = 0; i < feedbacknames.length; i++) {
			this.checkFeedbacks(feedbacknames[i])
		}
	}
}

runEntrypoint(VSP628ProModuleInstance, UpgradeScripts)

/**
 * usefull for developing
 * for yearn and powershell https://bobbyhadz.com/blog/yarn-cannot-be-loaded-running-scripts-disabled
 * first eslint initalization need: npm init @eslint/config
 */
