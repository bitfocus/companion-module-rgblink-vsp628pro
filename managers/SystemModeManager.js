const { colorsStyle, colorsSingle } = require('./colors')
const {
	RGBLinkVSP628ProConnector,
	SYSTEM_MODE_NAMES,
	SYSTEM_MODE_STANDARD,
	DeviceStateChanged,
	DeviceChangeEventType,
} = require('../api/rgblink_vsp628pro_connector')

const ACTION_SET_SYSTEM_MODE = 'set_system_mode'

const FEEDBACK_SYSTEM_MODE = 'feedback_system_mode'

const SYSTEM_MODE_NAMES_CHOICES = []
for (let id in SYSTEM_MODE_NAMES) {
	SYSTEM_MODE_NAMES_CHOICES.push({
		id: id,
		label: SYSTEM_MODE_NAMES[id],
	})
}

const Variables = {
	SYSTEM_MODE_CODE: 'systemModeCode',
	SYSTEM_MODE_NAME: 'systemModeName',
}

class SystemModeManager {
	myModule
	apiConnector = new RGBLinkVSP628ProConnector()

	getApiConnector() {
		this.apiConnector = this.myModule.apiConnector
		return this.apiConnector
	}

	constructor(_module) {
		this.myModule = _module
	}

	getActions() {
		let actions = []

		actions[ACTION_SET_SYSTEM_MODE] = {
			name: 'Set system mode (standard/pip/dual 2k/switcher...)',
			options: [
				{
					id: 'mode',
					type: 'dropdown',
					label: 'System mode',
					choices: SYSTEM_MODE_NAMES_CHOICES,
					default: SYSTEM_MODE_STANDARD,
				},
			],
			callback: async (event) => {
				this.getApiConnector().sendSystemMode(event.options.mode)
			},
		}

		return actions
	}

	getFeedbacksNames(changedEvent = new DeviceStateChanged()) {
		switch (changedEvent.event) {
			case DeviceChangeEventType.SYSTEM_MODE_CHANGED:
				return [FEEDBACK_SYSTEM_MODE]
		}
		return []
	}

	getFeedbacks() {
		let feedbacks = []

		feedbacks[FEEDBACK_SYSTEM_MODE] = {
			type: 'boolean',
			name: 'Current system mode (standard/pip/dual 2k/switcher...)',
			defaultStyle: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
			// options is how the user can choose the condition the feedback activates for
			options: [
				{
					id: 'mode',
					type: 'dropdown',
					label: 'System mode',
					choices: SYSTEM_MODE_NAMES_CHOICES,
					default: SYSTEM_MODE_STANDARD,
				},
			],
			callback: (feedback) => {
				return this.getApiConnector().deviceStatus.getSystemMode() == feedback.options.mode
			},
		}
		return feedbacks
	}

	getPresets() {
		let presets = []

		for (let systemMode in SYSTEM_MODE_NAMES) {
			presets.push({
				type: 'button',
				category: 'System mode',
				name: 'Set mode ' + SYSTEM_MODE_NAMES[systemMode], // A name for the preset. Shown to the user when they hover over it
				style: {
					text: 'Set mode ' + SYSTEM_MODE_NAMES[systemMode],
					size: 'auto',
					color: colorsSingle.WHITE,
					bgcolor: colorsSingle.BLACK,
				},
				steps: [
					{
						down: [
							{
								actionId: ACTION_SET_SYSTEM_MODE,
								options: { mode: systemMode },
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: FEEDBACK_SYSTEM_MODE,
						options: { mode: systemMode },
						style: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
					},
				],
			})
		}

		return presets
	}

	getVariablesDefinitions() {
		let variables = []
		variables.push({
			variableId: Variables.SYSTEM_MODE_CODE,
			name: 'System mode code',
		})
		variables.push({
			variableId: Variables.SYSTEM_MODE_NAME,
			name: 'System mode name',
		})
		return variables
	}

	getVariableValueForUpdate(changedEvent = new DeviceStateChanged()) {
		let retObj = {}
		switch (changedEvent.event) {
			case DeviceChangeEventType.SYSTEM_MODE_CHANGED:
				retObj[Variables.SYSTEM_MODE_CODE] = changedEvent.newValue
				retObj[Variables.SYSTEM_MODE_NAME] = SYSTEM_MODE_NAMES[changedEvent.newValue]
				break
		}
		return retObj
	}
}

module.exports = SystemModeManager
