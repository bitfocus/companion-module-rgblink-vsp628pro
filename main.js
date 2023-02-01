const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const { RGBLinkVSP628ProConnector } = require('./rgblink_vsp628pro_connector')

const FrontPanelManager = require('./managers/FrontPanelManager')
const UserFlashManager = require('./managers/UserFlashManager')
const SystemModeManager = require('./managers/SystemModeManager')
const LayerManager = require('./managers/LayerManager')
const SourceSwitchManager = require('./managers/SourceSwitchManager')
const OutputResolutionManager = require('./managers/OutputResolutionManager')
const FreezeManager = require('./managers/FreezeManager')
const MirrorAndRotateManager = require('./managers/MirrorAndRotateManager')
const EffectsManager = require('./managers/EffectsManager')
const { ApiConfig } = require('./rgblinkapiconnector')

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

			this.managers.push(new SourceSwitchManager(this))
			this.managers.push(new UserFlashManager(this))
			this.managers.push(new OutputResolutionManager(this))
			this.managers.push(new SystemModeManager(this))
			this.managers.push(new FreezeManager(this))
			this.managers.push(new MirrorAndRotateManager(this))
			this.managers.push(new EffectsManager(this))
			this.managers.push(new LayerManager(this))
			this.managers.push(new FrontPanelManager(this))

			this.updateActions()
			this.updateFeedbacks()
			this.updatePresets()
			this.updateVariables()

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
		let resetConnection = false

		if (this.config.host != config.host || this.config.port != config.port) {
			resetConnection = true
		}

		this.config = config

		if (resetConnection) {
			this.apiConnector.createSocket(config.host, config.port)
		}

		this.apiConnector.setPolling(this.config.polling)
		this.apiConnector.setLogEveryCommand(this.config.logEveryCommand)
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
			{
				type: 'checkbox',
				label: 'Debug logging of every sent/received command (may slow down your computer)',
				tooltip: 'test toolitp',
				description: 'test descri',
				id: 'logEveryCommand',
				width: 12,
				default: false,
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
		for (let i = 0; i < this.managers.length; i++) {
			presets = presets.concat(this.managers[i].getPresets())
		}

		this.setPresetDefinitions(presets)
	}

	updateVariables() {
		let variables = []

		for (let i = 0; i < this.managers.length; i++) {
			variables = variables.concat(this.managers[i].getVariablesDefinitions())
		}

		this.setVariableDefinitions(variables)
	}

	initApiConnector() {
		let self = this
		this.apiConnector = new RGBLinkVSP628ProConnector(
			new ApiConfig(this.config.host, this.config.port, this.config.polling, this.config.logEveryCommand)
		)
		this.apiConnector.enableLog(this)
		this.apiConnector.on(this.apiConnector.EVENT_NAME_ON_DEVICE_STATE_CHANGED, (changedEvents) => {
			self.checkAllFeedbacks(changedEvents)
			self.updateVariablesValues(changedEvents)
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
	}

	checkAllFeedbacks(changedEvents = []) {
		if (!Array.isArray(changedEvents)) {
			changedEvents = [changedEvents]
		} else if (Array.isArray(changedEvents) && changedEvents.length == 0) {
			changedEvents = [undefined]
		}

		let feedbacknames = []
		for (let evIdx = 0; evIdx < changedEvents.length; evIdx++) {
			let event = changedEvents[evIdx]
			for (let i = 0; i < this.managers.length; i++) {
				feedbacknames = feedbacknames.concat(this.managers[i].getFeedbacksNames(event))
			}
		}

		for (let i = 0; i < feedbacknames.length; i++) {
			this.checkFeedbacks(feedbacknames[i])
		}
	}

	updateVariablesValues(changedEvents = []) {
		if (!Array.isArray(changedEvents)) {
			changedEvents = [changedEvents]
		} else if (Array.isArray(changedEvents) && changedEvents.length == 0) {
			changedEvents = [undefined]
		}

		let values = {}
		for (let evIdx = 0; evIdx < changedEvents.length; evIdx++) {
			let event = changedEvents[evIdx]
			for (let i = 0; i < this.managers.length; i++) {
				values = {
					...values,
					...this.managers[i].getVariableValueForUpdate(event),
				}
			}
		}
		this.setVariableValues(values)
	}
}
runEntrypoint(VSP628ProModuleInstance, UpgradeScripts)

/**
 * usefull for developing
 * for yearn and powershell https://bobbyhadz.com/blog/yarn-cannot-be-loaded-running-scripts-disabled
 * first eslint initalization need: npm init @eslint/config
 */
