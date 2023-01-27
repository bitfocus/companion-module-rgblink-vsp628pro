const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const { RGBLinkVSP628ProConnector,
	FRONT_PANEL_LOCKED,
	FRONT_PANEL_UNLOCKED } = require('./rgblink_vsp628pro_connector')

const ACTION_FRONT_PANEL_LOCK = 'lock';
const ACTION_FRONT_PANEL_UNLOCK = 'unlock';

class ModuleInstance extends InstanceBase {
	apiConnector = new RGBLinkVSP628ProConnector();

	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		try {
			this.log('debug', "RGBlink VSP628PRO: init...")
			this.initApiConnector();
			this.updateActions()
			this.log('debug', "RGBlink VSP628PRO: init finished")
		} catch (ex) {
			this.updateStatus(InstanceStatus.UnknownError, ex);
			console.log(ex)
			this.log('error', ex);
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
		let actions = {};

		actions[ACTION_FRONT_PANEL_LOCK] = {
			name: 'Lock front panel',
			options: [],
			callback: async (/*event*/) => {
				this.apiConnector.sendSetFrontPanelLockStatus(FRONT_PANEL_LOCKED)
			},
		};

		actions[ACTION_FRONT_PANEL_UNLOCK] = {
			name: 'Unlock front panel',
			options: [],
			callback: async (/*event*/) => {
				this.apiConnector.sendSetFrontPanelLockStatus(FRONT_PANEL_UNLOCKED)
			},
		}

		this.setActionDefinitions(actions);
	}


	initApiConnector() {
		let self = this
		this.apiConnector = new RGBLinkVSP628ProConnector(
			this.config.host,
			this.config.port,
			this.config.polling
		)
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
}

runEntrypoint(ModuleInstance, UpgradeScripts)


/**
 * usefull for developing
 * for yearn and powershell https://bobbyhadz.com/blog/yarn-cannot-be-loaded-running-scripts-disabled 
 * first eslint initalization need: npm init @eslint/config
 */