const ACTION_SET_SOURCE_ON_LAYER = 'set_source_on_layer'

const FEEDBACK_SELECTED_SOURCE_ON_LAYER = 'feedback_selected_source_on_layer'

const { colorsStyle, colorsSingle } = require('./colors')
const {
	RGBLinkVSP628ProConnector,
	LAYER_NAMES,
	LAYER_A,
	SOURCE_SIGNALS_NAMES,
	SOURCE_SIGNAL_HDMI,
	LAYER_B,
} = require('../rgblink_vsp628pro_connector')

const LAYER_NAMES_CHOICES = []
for (let id in LAYER_NAMES) {
	LAYER_NAMES_CHOICES.push({
		id: id,
		label: LAYER_NAMES[id],
	})
}

const SOURCE_SIGNAL_NAMES_CHOICES = []
for (let id in SOURCE_SIGNALS_NAMES) {
	SOURCE_SIGNAL_NAMES_CHOICES.push({
		id: id,
		label: SOURCE_SIGNALS_NAMES[id],
	})
}

class SourceSwitchManager {
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

		actions[ACTION_SET_SOURCE_ON_LAYER] = {
			name: 'Switch source on layer.',
			description:
				'Set selected source signal on selected layer/channel. Layer A is main layer in PIP, and the only layer in single-layer modes.',
			options: [
				{
					id: 'layer',
					type: 'dropdown',
					label: 'Layer',
					choices: LAYER_NAMES_CHOICES,
					default: LAYER_A,
				},
				{
					id: 'source',
					type: 'dropdown',
					label: 'Source signal',
					choices: SOURCE_SIGNAL_NAMES_CHOICES,
					default: SOURCE_SIGNAL_HDMI,
				},
			],
			callback: async (event) => {
				this.getApiConnector().sendSourceSignalOnLayer(event.options.source, event.options.layer)
			},
		}

		return actions
	}

	getFeedbacksNames() {
		return [FEEDBACK_SELECTED_SOURCE_ON_LAYER]
	}

	getFeedbacks() {
		let feedbacks = []

		feedbacks[FEEDBACK_SELECTED_SOURCE_ON_LAYER] = {
			type: 'boolean',
			name: 'Current signal on selected layer',
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
				{
					id: 'source',
					type: 'dropdown',
					label: 'Source signal',
					choices: SOURCE_SIGNAL_NAMES_CHOICES,
					default: SOURCE_SIGNAL_HDMI,
				},
			],
			callback: (feedback) => {
				if (feedback.options.layer == LAYER_A) {
					return this.getApiConnector().deviceStatus.source.layerA == feedback.options.source
				} else if (feedback.options.layer == LAYER_B) {
					return this.getApiConnector().deviceStatus.source.layerB == feedback.options.source
				} else {
					this.myModule.log('warn', 'Bad layer configured? This must be fixed by developer...')
					return false
				}
			},
		}
		return feedbacks
	}

	getPresets() {
		let presets = []

		for (let layer in LAYER_NAMES) {
			for (let source in SOURCE_SIGNALS_NAMES) {
				presets.push({
					type: 'button',
					category: 'Source switch',
					name: 'Set source ' + SOURCE_SIGNALS_NAMES[source] + ' on ' + LAYER_NAMES[layer], // A name for the preset. Shown to the user when they hover over it
					style: {
						text: SOURCE_SIGNALS_NAMES[source] + ' on\\n' + LAYER_NAMES[layer],
						size: 'auto',
						color: colorsSingle.WHITE,
						bgcolor: colorsSingle.BLACK,
					},
					steps: [
						{
							down: [
								{
									actionId: ACTION_SET_SOURCE_ON_LAYER,
									options: { layer: layer, source: source },
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: FEEDBACK_SELECTED_SOURCE_ON_LAYER,
							options: { layer: layer, source: source },
							style: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
						},
					],
				})
			}
		}

		return presets
	}
}

module.exports = SourceSwitchManager
