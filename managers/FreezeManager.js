const ACTION_SET_FREEZE_STATUS = 'set_freeze_status'

const FEEDBACK_FREEZE_STATUS = 'feedback_freeze_status'

const { colorsStyle, colorsSingle } = require('./colors')
const {
	RGBLinkVSP628ProConnector,
	FREEZE_NAMES,
	FREEZE_STATUS_FREEZE,
	DeviceStateChanged,
	DeviceChangeEventType,
} = require('../api/rgblink_vsp628pro_connector')

const FREEZE_NAMES_CHOICES = []
for (let id in FREEZE_NAMES) {
	FREEZE_NAMES_CHOICES.push({
		id: id,
		label: FREEZE_NAMES[id],
	})
}

const Variables = {
	FREEZE_CODE: 'freezeCode',
	FREEZE_NAME: 'freezeName',
}

class FreezeManager {
	myModule
	apiConnector = new RGBLinkVSP628ProConnector()

	// hack, only for code hints
	getApiConnector() {
		this.apiConnector = this.myModule.apiConnector
		return this.apiConnector
	}

	constructor(_module) {
		this.myModule = _module
	}

	getActions() {
		let actions = []

		actions[ACTION_SET_FREEZE_STATUS] = {
			name: 'Set freeze/live',
			options: [
				{
					id: 'status',
					type: 'dropdown',
					label: 'Status',
					choices: FREEZE_NAMES_CHOICES,
					default: FREEZE_STATUS_FREEZE,
				},
			],
			callback: async (event) => {
				this.getApiConnector().sendSetFreezeStatus(event.options.status)
			},
		}

		return actions
	}

	getFeedbacksNames(changedEvent = new DeviceStateChanged()) {
		//return [FEEDBACK_FREEZE_STATUS]
		switch (changedEvent.event) {
			case DeviceChangeEventType.FREEZE_STATUS_CHANGED:
				return [FEEDBACK_FREEZE_STATUS]
		}
		return []
	}

	getFeedbacks() {
		let feedbacks = []

		feedbacks[FEEDBACK_FREEZE_STATUS] = {
			type: 'boolean',
			name: 'Current freeze/live status',
			defaultStyle: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
			// options is how the user can choose the condition the feedback activates for
			options: [
				{
					id: 'status',
					type: 'dropdown',
					label: 'Status',
					choices: FREEZE_NAMES_CHOICES,
					default: FREEZE_STATUS_FREEZE,
				},
			],
			callback: (feedback) => {
				return this.getApiConnector().deviceStatus.getFreezeStatus() == feedback.options.status
			},
		}
		return feedbacks
	}

	getPresets() {
		let presets = []

		for (let status in FREEZE_NAMES) {
			presets.push({
				type: 'button',
				category: 'Freeze',
				name: 'Set ' + FREEZE_NAMES[status], // A name for the preset. Shown to the user when they hover over it
				style: {
					text: 'Set ' + FREEZE_NAMES[status],
					size: 'auto',
					color: colorsSingle.WHITE,
					bgcolor: colorsSingle.BLACK,
				},
				steps: [
					{
						down: [
							{
								actionId: ACTION_SET_FREEZE_STATUS,
								options: { status: status },
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: FEEDBACK_FREEZE_STATUS,
						options: { status: status },
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
			variableId: Variables.FREEZE_CODE,
			name: 'Freeze code',
		})
		variables.push({
			variableId: Variables.FREEZE_NAME,
			name: 'Freeze name',
		})
		return variables
	}

	getVariableValueForUpdate(changedEvent = new DeviceStateChanged()) {
		let retObj = {}
		switch (changedEvent.event) {
			case DeviceChangeEventType.FREEZE_STATUS_CHANGED:
				retObj[Variables.FREEZE_CODE] = changedEvent.newValue
				retObj[Variables.FREEZE_NAME] = FREEZE_NAMES[changedEvent.newValue]
				break
		}
		return retObj
	}
}

module.exports = FreezeManager
