const { colorsStyle, colorsSingle } = require('./colors')
const { RGBLinkVSP628ProConnector, DeviceStateChanged, DeviceChangeEventType } = require('../api/rgblink_vsp628pro_connector')

const ACTION_SAVE_TO_USER_FLASH = 'flash_save'
const ACTION_LOAD_FROM_USER_FLASH = 'flash_load'

const FEEDBACK_FLASH_LAST_SAVED = 'flash_last_saved'
const FEEDBACK_FLASH_LAST_LOADED = 'flash_last_loaded'

const MODE_NUMBER_CHOICES = []
for (let i = 1; i <= 21; i++) {
	MODE_NUMBER_CHOICES.push({
		id: i,
		label: 'Mode ' + i,
	})
}

const Variables = {
	FLASH_LAST_SAVED_BANK: 'flashLastSavedBank',
	FLASH_LAST_LOADED_BANK: 'flashLastLoadedBank',
}

class UserFlashManager {
	//@
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

		actions[ACTION_SAVE_TO_USER_FLASH] = {
			name: 'Save to user flash',
			options: [
				{
					id: 'mode',
					type: 'dropdown',
					label: 'Bank number',
					choices: MODE_NUMBER_CHOICES,
					default: '1',
				},
			],
			callback: async (event) => {
				try {
					this.getApiConnector().sendSaveToUserFlash(event.options.mode)
				} catch (ex) {
					console.log(ex)
				}
			},
		}

		actions[ACTION_LOAD_FROM_USER_FLASH] = {
			name: 'Load from user flash',
			options: [
				{
					id: 'mode',
					type: 'dropdown',
					label: 'Bank number',
					choices: MODE_NUMBER_CHOICES,
					default: '1',
				},
			],
			callback: async (event) => {
				try {
					this.getApiConnector().sendLoadFromUserFlash(event.options.mode)
				} catch (ex) {
					console.log(ex)
				}
			},
		}

		return actions
	}

	getFeedbacksNames(changedEvent = new DeviceStateChanged()) {
		switch (changedEvent.event) {
			case DeviceChangeEventType.FLASH_LAST_LOADED_BANK:
				return [FEEDBACK_FLASH_LAST_LOADED]
			case DeviceChangeEventType.FLASH_LAST_SAVED_BANK:
				return [FEEDBACK_FLASH_LAST_SAVED]
		}
		return []
	}

	getFeedbacks() {
		let feedbacks = []

		feedbacks[FEEDBACK_FLASH_LAST_SAVED] = {
			type: 'boolean',
			name: 'Last saved mode to flash',
			defaultStyle: colorsStyle.YELLOW_BACKGROUND_WITH_BLACK_TEXT,
			// options is how the user can choose the condition the feedback activates for
			options: [
				{
					id: 'mode',
					type: 'dropdown',
					label: 'Bank number',
					choices: MODE_NUMBER_CHOICES,
					default: '1',
				},
			],
			callback: (feedback) => {
				return this.getApiConnector().deviceStatus.getFlashLastSavedBank() == feedback.options.mode
			},
		}
		feedbacks[FEEDBACK_FLASH_LAST_LOADED] = {
			type: 'boolean',
			name: 'Last loaded mode from flash',
			defaultStyle: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
			// options is how the user can choose the condition the feedback activates for
			options: [
				{
					id: 'mode',
					type: 'dropdown',
					label: 'Bank number',
					choices: MODE_NUMBER_CHOICES,
					default: '1',
				},
			],
			callback: (feedback) => {
				return this.getApiConnector().deviceStatus.getFlashLastLoadedBank() == feedback.options.mode
			},
		}
		return feedbacks
	}

	getPresets() {
		let presets = []

		for (let i = 1; i <= 21; i++) {
			presets.push({
				type: 'button',
				category: 'Flash - Load/Save bank',
				name: 'Save to flash, bank ' + i, // A name for the preset. Shown to the user when they hover over it
				style: {
					text: 'Save\nbank ' + i,
					size: 'auto',
					color: colorsSingle.WHITE,
					bgcolor: colorsSingle.BLACK,
				},
				steps: [
					{
						down: [
							{
								actionId: ACTION_SAVE_TO_USER_FLASH,
								options: { mode: i },
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: FEEDBACK_FLASH_LAST_SAVED,
						options: { mode: i },
						style: colorsStyle.YELLOW_BACKGROUND_WITH_BLACK_TEXT,
					},
				],
			})
			presets.push({
				type: 'button',
				category: 'Flash - Load/Save bank',
				name: 'Load from flash, bank ' + i, // A name for the preset. Shown to the user when they hover over it
				style: {
					text: 'Load\nbank ' + i,
					size: 'auto',
					color: colorsSingle.WHITE,
					bgcolor: colorsSingle.BLACK,
				},
				steps: [
					{
						down: [
							{
								actionId: ACTION_LOAD_FROM_USER_FLASH,
								options: { mode: i },
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: FEEDBACK_FLASH_LAST_LOADED,
						options: { mode: i },
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
			variableId: Variables.FLASH_LAST_LOADED_BANK,
			name: 'Last loaded bank (flash)',
		})
		variables.push({
			variableId: Variables.FLASH_LAST_SAVED_BANK,
			name: 'Last saved bank (flash)',
		})
		return variables
	}

	getVariableValueForUpdate(changedEvent = new DeviceStateChanged()) {
		let retObj = {}
		switch (changedEvent.event) {
			case DeviceChangeEventType.FLASH_LAST_LOADED_BANK:
				retObj[Variables.FLASH_LAST_LOADED_BANK] = changedEvent.newValue;
				break;
			case DeviceChangeEventType.FLASH_LAST_SAVED_BANK:
				retObj[Variables.FLASH_LAST_SAVED_BANK] = changedEvent.newValue;
				break;
		}
		return retObj
	}
}

module.exports = UserFlashManager
