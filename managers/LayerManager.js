const { colorsStyle, colorsSingle } = require('./colors')
const { RGBLinkVSP628ProConnector, LAYER_NAMES, LAYER_A, DeviceStateChanged, DeviceChangeEventType } = require('../api/rgblink_vsp628pro_connector')

const ACTION_SET_LAYER = 'set_layer'

const FEEDBACK_LAYER = 'feedback_selected_layer'

const LAYER_NAMES_CHOICES = []
for (let id in LAYER_NAMES) {
	LAYER_NAMES_CHOICES.push({
		id: id,
		label: LAYER_NAMES[id],
	})
}

const Variables = {
	LAYER_CODE: 'layerCode',
	LAYER_NAME: 'layerName',
}

class LayerManager {
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

		actions[ACTION_SET_LAYER] = {
			name: 'Set layer',
			options: [
				{
					id: 'layer',
					type: 'dropdown',
					label: 'Layer',
					choices: LAYER_NAMES_CHOICES,
					default: LAYER_A,
				},
			],
			callback: async (event) => {
				this.getApiConnector().sendLayer(event.options.layer)
			},
		}

		return actions
	}

	getFeedbacksNames(changedEvent = new DeviceStateChanged()) {
		switch (changedEvent.event) {
			case DeviceChangeEventType.LAYER_CHANGED:
				return [FEEDBACK_LAYER]
		}
		return []
	}

	getFeedbacks() {
		let feedbacks = []

		feedbacks[FEEDBACK_LAYER] = {
			type: 'boolean',
			name: 'Current layer',
			defaultStyle: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
			// options is how the user can choose the condition the feedback activates for
			options: [
				{
					id: 'layer',
					type: 'dropdown',
					label: 'Layer',
					choices: LAYER_NAMES_CHOICES,
					default: LAYER_A,
				},
			],
			callback: (feedback) => {
				return this.getApiConnector().deviceStatus.getLayer() == feedback.options.layer
			},
		}
		return feedbacks
	}

	getPresets() {
		let presets = []

		for (let layer in LAYER_NAMES) {
			presets.push({
				type: 'button',
				category: 'Layer',
				name: 'Set ' + LAYER_NAMES[layer], // A name for the preset. Shown to the user when they hover over it
				style: {
					text: 'Set ' + LAYER_NAMES[layer],
					size: 'auto',
					color: colorsSingle.WHITE,
					bgcolor: colorsSingle.BLACK,
				},
				steps: [
					{
						down: [
							{
								actionId: ACTION_SET_LAYER,
								options: { layer: layer },
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: FEEDBACK_LAYER,
						options: { layer: layer },
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
			variableId: Variables.LAYER_CODE,
			name: 'Layer code',
		})
		variables.push({
			variableId: Variables.LAYER_NAME,
			name: 'Layer name',
		})
		return variables
	}

	getVariableValueForUpdate(changedEvent = new DeviceStateChanged()) {
		let retObj = {}
		switch (changedEvent.event) {
			case DeviceChangeEventType.LAYER_CHANGED:
				retObj[Variables.LAYER_CODE] = changedEvent.newValue;
				retObj[Variables.LAYER_NAME] = LAYER_NAMES[changedEvent.newValue];
				break;
		}
		return retObj
	}
}

module.exports = LayerManager
