const ACTION_FRONT_PANEL_LOCK = 'lock'
const ACTION_FRONT_PANEL_UNLOCK = 'unlock'

const FEEDBACK_FRONT_PANEL_LOCKED = 'locked'
const FEEDBACK_FRONT_PANEL_UNLOCKED = 'unlocked'

const {
	FRONT_PANEL_LOCKED,
	FRONT_PANEL_UNLOCKED,
	RGBLinkVSP628ProConnector,
	DeviceStateChanged,
	DeviceChangeEventType,
} = require('./../rgblink_vsp628pro_connector')
const { colorsStyle, colorsSingle } = require('./colors')

const Variables = {
	VARIABLE_FRONT_PANEL_LOCK_STATUS: 'frontPanelLockStatus',
}

class FrontPanelManager {
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

		actions[ACTION_FRONT_PANEL_LOCK] = {
			name: 'Lock front panel',
			options: [],
			callback: async (/*event*/) => {
				this.getApiConnector().sendSetFrontPanelLockStatus(FRONT_PANEL_LOCKED)
			},
		}

		actions[ACTION_FRONT_PANEL_UNLOCK] = {
			name: 'Unlock front panel',
			options: [],
			callback: async (/*event*/) => {
				this.getApiConnector().sendSetFrontPanelLockStatus(FRONT_PANEL_UNLOCKED)
			},
		}
		return actions
	}

	getFeedbacksNames(changedEvent = new DeviceStateChanged()) {
		switch (changedEvent.event) {
			case DeviceChangeEventType.FRONT_PANEL_LOCK_CHANGED:
				return [FEEDBACK_FRONT_PANEL_LOCKED, FEEDBACK_FRONT_PANEL_UNLOCKED]
		}
		return []
	}

	getFeedbacks() {
		let feedbacks = []

		feedbacks[FEEDBACK_FRONT_PANEL_LOCKED] = {
			type: 'boolean',
			name: 'Front panel is locked',
			defaultStyle: colorsStyle.YELLOW_BACKGROUND_WITH_BLACK_TEXT,
			// options is how the user can choose the condition the feedback activates for
			options: [],
			callback: (/*feedback*/) => {
				return this.getApiConnector().deviceStatus.getFrontPanelLockStatus() == FRONT_PANEL_LOCKED
			},
		}
		feedbacks[FEEDBACK_FRONT_PANEL_UNLOCKED] = {
			type: 'boolean',
			name: 'Front panel is unlocked',
			defaultStyle: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
			// options is how the user can choose the condition the feedback activates for
			options: [],
			callback: (/*feedback*/) => {
				return this.getApiConnector().deviceStatus.getFrontPanelLockStatus() == FRONT_PANEL_UNLOCKED
			},
		}
		return feedbacks
	}

	getPresets() {
		let presets = []

		presets.push({
			type: 'button',
			category: 'Front panel',
			name: 'Lock front panel', // A name for the preset. Shown to the user when they hover over it
			style: {
				text: 'Lock front panel',
				size: 'auto',
				color: colorsSingle.WHITE,
				bgcolor: colorsSingle.BLACK,
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
					style: colorsStyle.YELLOW_BACKGROUND_WITH_BLACK_TEXT,
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
				color: colorsSingle.WHITE,
				bgcolor: colorsSingle.BLACK,
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
					style: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
				},
			],
		})
		return presets
	}

	getVariablesDefinitions() {
		let variables = []
		variables.push({
			variableId: Variables.VARIABLE_FRONT_PANEL_LOCK_STATUS,
			name: 'Front panel lock status',
		})
		return variables
	}

	getVariableValueForUpdate(changedEvent = new DeviceStateChanged()) {
		let retObj = {}
		switch (changedEvent.event) {
			case DeviceChangeEventType.FRONT_PANEL_LOCK_CHANGED:
				if (this.getApiConnector().deviceStatus.getFrontPanelLockStatus() == FRONT_PANEL_LOCKED) {
					retObj[Variables.VARIABLE_FRONT_PANEL_LOCK_STATUS] = 'Locked'
				} else if (this.getApiConnector().deviceStatus.getFrontPanelLockStatus() == FRONT_PANEL_UNLOCKED) {
					retObj[Variables.VARIABLE_FRONT_PANEL_LOCK_STATUS] = 'Unlocked'
				}
		}
		return retObj
	}
}

module.exports = FrontPanelManager
