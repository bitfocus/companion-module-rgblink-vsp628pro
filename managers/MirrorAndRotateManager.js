const ACTION_SET_MIRROR = 'set_mirror_status'

const FEEDBACK_MIRROR_STATUS = 'feedback_mirror_status'

const { colorsStyle, colorsSingle } = require('./colors')
const {
	RGBLinkVSP628ProConnector,
	MIRROR_NAMES,
	MIRROR_STATUS_ON,
	LAYER_NAMES,
	LAYER_A,
	LAYER_B,
} = require('../rgblink_vsp628pro_connector')

const LAYER_NAMES_CHOICES = []
for (let id in LAYER_NAMES) {
	LAYER_NAMES_CHOICES.push({
		id: id,
		label: LAYER_NAMES[id],
	})
}

const MIRROR_NAMES_CHOICES = []
for (let id in MIRROR_NAMES) {
	MIRROR_NAMES_CHOICES.push({
		id: id,
		label: MIRROR_NAMES[id],
	})
}

const VERTICAL = 'V'
const HORIZONTAL = 'H'
const AXIS_CHOICES = [
	{
		id: VERTICAL,
		label: 'Vertical',
	},
	{
		id: HORIZONTAL,
		label: 'Horizontal',
	},
]

class MirrorAndRotateManager {
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

		actions[ACTION_SET_MIRROR] = {
			name: 'Enable/disable mirror on selected axis',
			options: [
				{
					id: 'status',
					type: 'dropdown',
					label: 'Status',
					choices: MIRROR_NAMES_CHOICES,
					default: MIRROR_STATUS_ON,
				},
				{
					id: 'axis',
					type: 'dropdown',
					label: 'Axis',
					choices: AXIS_CHOICES,
					default: HORIZONTAL,
				},
				{
					id: 'layer',
					type: 'dropdown',
					label: 'Layer',
					choices: LAYER_NAMES_CHOICES,
					default: LAYER_A,
				},
			],
			callback: async (event) => {
				if (event.options.axis == HORIZONTAL) {
					this.getApiConnector().sendSetHMirror(event.options.status, event.options.layer)
				} else if (event.options.axis == VERTICAL) {
					this.getApiConnector().sendSetVMirror(event.options.status, event.options.layer)
				} else {
					this.myModule.log('warn', 'Bad axis? Must be fixed by developer. ' + event.options.axis)
				}
			},
		}

		return actions
	}

	getFeedbacksNames() {
		return [FEEDBACK_MIRROR_STATUS]
	}

	getFeedbacks() {
		let feedbacks = []

		feedbacks[FEEDBACK_MIRROR_STATUS] = {
			type: 'boolean',
			name: 'Current mirror status on selected axis',
			defaultStyle: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
			// options is how the user can choose the condition the feedback activates for
			options: [
				{
					id: 'status',
					type: 'dropdown',
					label: 'Status',
					choices: MIRROR_NAMES_CHOICES,
					default: MIRROR_STATUS_ON,
				},
				{
					id: 'axis',
					type: 'dropdown',
					label: 'Axis',
					choices: AXIS_CHOICES,
					default: HORIZONTAL,
				},
				{
					id: 'layer',
					type: 'dropdown',
					label: 'Layer',
					choices: LAYER_NAMES_CHOICES,
					default: LAYER_A,
				},
			],
			callback: (feedback) => {
				let layerStatus =
					feedback.options.layer == LAYER_B
						? this.getApiConnector().deviceStatus.sources.layerB
						: this.getApiConnector().deviceStatus.sources.layerA
				if (feedback.options.axis == HORIZONTAL) {
					return layerStatus.hMirror === feedback.options.status
				} else if (feedback.options.axis == VERTICAL) {
					return layerStatus.vMirror === feedback.options.status
				} else {
					this.myModule.log('warn', 'Bad axis? This must be fixed by developer. ' + feedback.options.axis)
				}
			},
		}
		return feedbacks
	}

	getPresets() {
		let presets = []
		for (let layer in LAYER_NAMES) {
			for (let axisIdx in AXIS_CHOICES) {
				let axis = AXIS_CHOICES[axisIdx]
				for (let status in MIRROR_NAMES) {
					presets.push({
						type: 'button',
						category: 'Mirror / rotate',
						name: 'Set ' + axis.label + ' mirror ' + MIRROR_NAMES[status] + ' on ' + LAYER_NAMES[layer], // A name for the preset. Shown to the user when they hover over it
						style: {
							text: 'Set ' + axis.label + ' mirror ' + MIRROR_NAMES[status] + ' on ' + LAYER_NAMES[layer],
							size: 'auto',
							color: colorsSingle.WHITE,
							bgcolor: colorsSingle.BLACK,
						},
						steps: [
							{
								down: [
									{
										actionId: ACTION_SET_MIRROR,
										options: { status: status, axis: axis.id, layer: layer },
									},
								],
								up: [],
							},
						],
						feedbacks: [
							{
								feedbackId: FEEDBACK_MIRROR_STATUS,
								options: { status: status, axis: axis.id, layer: layer },
								style: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
							},
						],
					})
				}
			}
		}

		return presets
	}
}

module.exports = MirrorAndRotateManager
