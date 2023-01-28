// version 2.0-SNAPSHOT
const ACTION_FRONT_PANEL_LOCK = 'lock'
const ACTION_FRONT_PANEL_UNLOCK = 'unlock'

const FEEDBACK_FRONT_PANEL_LOCKED = 'locked'
const FEEDBACK_FRONT_PANEL_UNLOCKED = 'unlocked'

const { FRONT_PANEL_LOCKED, FRONT_PANEL_UNLOCKED } = require('./../rgblink_vsp628pro_connector')
const { colorsStyle, colorsSingle } = require('./colors')

class FrontPanelManager {
	myModule

	constructor(_module) {
		this.myModule = _module
	}

	getActions() {
		let actions = []

		actions[ACTION_FRONT_PANEL_LOCK] = {
			name: 'Lock front panel',
			options: [],
			callback: async (/*event*/) => {
				this.myModule.apiConnector.sendSetFrontPanelLockStatus(FRONT_PANEL_LOCKED)
			},
		}

		actions[ACTION_FRONT_PANEL_UNLOCK] = {
			name: 'Unlock front panel',
			options: [],
			callback: async (/*event*/) => {
				this.myModule.apiConnector.sendSetFrontPanelLockStatus(FRONT_PANEL_UNLOCKED)
			},
		}
		return actions
	}

	getFeedbacksNames() {
		return [FEEDBACK_FRONT_PANEL_LOCKED, FEEDBACK_FRONT_PANEL_UNLOCKED]
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
				return this.myModule.apiConnector.deviceStatus.frontPanelLocked == FRONT_PANEL_LOCKED
			},
		}
		feedbacks[FEEDBACK_FRONT_PANEL_UNLOCKED] = {
			type: 'boolean',
			name: 'Front panel is unlocked',
			defaultStyle: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
			// options is how the user can choose the condition the feedback activates for
			options: [],
			callback: (/*feedback*/) => {
				return this.myModule.apiConnector.deviceStatus.frontPanelLocked == FRONT_PANEL_UNLOCKED
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
}

module.exports = FrontPanelManager
