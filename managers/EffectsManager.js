const ACTION_SET_EFFECT = 'set_effect'

const FEEDBACK_SELECTED_EFFECT = 'feedback_selected_effect'

const { CompanionOptionValues } = require('@companion-module/base')

const { colorsStyle, colorsSingle } = require('./colors')
const {
	RGBLinkVSP628ProConnector,
	LAYER_NAMES,
	LAYER_A,
	LAYER_B,
	LayerParameters,
	COLOR_TEMP_NAMES,
	COLOR_TEMP_6500,
	GAMMA_NAMES,
	GAMMA_1_DOT_0,
	GAMMA_OFF,
	GAMMA_1_DOT_6,
	FLIP_NAMES,
	FLIP_ON,
} = require('../rgblink_vsp628pro_connector')

const LAYER_NAMES_CHOICES = []
for (let id in LAYER_NAMES) {
	LAYER_NAMES_CHOICES.push({
		id: id,
		label: LAYER_NAMES[id],
	})
}

const PRESETS_CATEGORY_NAME = 'Effects'

const EFFECT_BRIGHTNESS_RED = 'brightness_red'
const EFFECT_BRIGHTNESS_GREEN = 'brightness_green'
const EFFECT_BRIGHTNESS_BLUE = 'brightness_blue'
const EFFECT_CONTRAST_RED = 'contrast_red'
const EFFECT_CONTRAST_GREEN = 'contrast_green'
const EFFECT_CONTRAST_BLUE = 'contrast_blue'
const EFFECT_CHROMA = 'chroma'
const EFFECT_HUE = 'hue'
const EFFECT_COLOR_TEMPERATURE = 'color_temperature'
const EFFECT_GAMMA = 'gamma'
const EFFECT_SHARPNESS_HORIZONTAL = 'sharpness_horizontal'
const EFFECT_SHARPNESS_VERTICAL = 'sharpness_vertical'
const EFFECT_NOISE_REDUCTION_HORIZONTAL = 'noise_reduction_horizontal'
const EFFECT_NOISE_REDUCTION_VERTICAL = 'noise_reduction_vertical'
const EFFECT_NOISE_REDUCTION_TEMPORAL_NR = 'noise_reduction_temporal_nr'
const EFFECT_NOISE_REDUCTION_BLOCK_NR = 'noise_reduction_block_nr'
const EFFECT_NOISE_REDUCTION_MOSQUITO_NR = 'noise_reduction_mosquito_nr'
const EFFECT_NOISE_REDUCTION_COMBING_NR = 'noise_reduction_combing_nr'
const EFFECT_FLIP_INVERT = 'flip'
const EFFECT_NAMES = []
EFFECT_NAMES[EFFECT_BRIGHTNESS_RED] = 'Brightness (red)'
EFFECT_NAMES[EFFECT_BRIGHTNESS_GREEN] = 'Brightness (green)'
EFFECT_NAMES[EFFECT_BRIGHTNESS_BLUE] = 'Brightness (blue)'
EFFECT_NAMES[EFFECT_CONTRAST_RED] = 'Contrast (red)'
EFFECT_NAMES[EFFECT_CONTRAST_GREEN] = 'Contrast (green)'
EFFECT_NAMES[EFFECT_CONTRAST_BLUE] = 'Contrast (blue)'
EFFECT_NAMES[EFFECT_CHROMA] = 'Chroma'
EFFECT_NAMES[EFFECT_HUE] = 'Hue'
EFFECT_NAMES[EFFECT_COLOR_TEMPERATURE] = 'Color temperature'
EFFECT_NAMES[EFFECT_GAMMA] = 'Gamma'
EFFECT_NAMES[EFFECT_SHARPNESS_HORIZONTAL] = 'Sharpness - horizontal'
EFFECT_NAMES[EFFECT_SHARPNESS_VERTICAL] = 'Sharpness - vertical'
EFFECT_NAMES[EFFECT_NOISE_REDUCTION_HORIZONTAL] = 'Noise reduction - horizontal'
EFFECT_NAMES[EFFECT_NOISE_REDUCTION_VERTICAL] = 'Noise reduction - vertical'
EFFECT_NAMES[EFFECT_NOISE_REDUCTION_TEMPORAL_NR] = 'Noise reduction - temporal nr'
EFFECT_NAMES[EFFECT_NOISE_REDUCTION_BLOCK_NR] = 'Noise reduction - block nr'
EFFECT_NAMES[EFFECT_NOISE_REDUCTION_MOSQUITO_NR] = 'Noise reduction - mosquito nr'
EFFECT_NAMES[EFFECT_NOISE_REDUCTION_COMBING_NR] = 'Noise reduction - combing nr'
EFFECT_NAMES[EFFECT_FLIP_INVERT] = 'Flip (invert) colors'

const EFFECT_NAMES_CHOICES = []
for (let id in EFFECT_NAMES) {
	EFFECT_NAMES_CHOICES.push({
		id: id,
		label: EFFECT_NAMES[id],
	})
}

// const COLOR_TEMP_CHOICES = []
// for (let id in COLOR_TEMP_NAMES) {
// 	COLOR_TEMP_CHOICES.push({
// 		id: id,
// 		label: COLOR_TEMP_NAMES[id],
// 	})
// }

const COLOR_TEMP_CHOICES = []
for (let id in COLOR_TEMP_NAMES) {
	COLOR_TEMP_CHOICES.push({
		id: id,
		label: COLOR_TEMP_NAMES[id],
	})
}

const GAMMA_CHOICES = []
for (let id in GAMMA_NAMES) {
	GAMMA_CHOICES.push({
		id: id,
		label: GAMMA_NAMES[id],
	})
}

const FLIP_CHOICES = []
for (let id in FLIP_NAMES) {
	FLIP_CHOICES.push({
		id: id,
		label: FLIP_NAMES[id],
	})
}

class EffectsManager {
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
		let self = this

		actions[ACTION_SET_EFFECT] = {
			name: 'Set effect on layer.',
			description:
				'Set selected effect on selected layer/channel. Available effects: brightness, contrast, chroma, hue, color temperature, gamma, sharpness, flip.',
			options: [
				{
					id: 'effect',
					type: 'dropdown',
					label: 'Effect',
					choices: EFFECT_NAMES_CHOICES,
					default: EFFECT_BRIGHTNESS_RED,
				},
				{
					id: 'layer',
					type: 'dropdown',
					label: 'Layer',
					choices: LAYER_NAMES_CHOICES,
					default: LAYER_A,
				},
				{
					id: 'brightness',
					type: 'number',
					label: 'Brightness (from -512 to 512)',
					min: -512,
					max: 512,
					default: '0',
					isVisible: function (options = new CompanionOptionValues()) {
						// what a mess, can't use defined const
						return options.effect.includes('brightness')
					},
				},
				{
					id: 'contrast',
					type: 'number',
					label: 'Contrast (from 0 to 399)',
					min: 0,
					max: 399,
					default: '140',
					isVisible: function (options = new CompanionOptionValues()) {
						return options.effect.includes('contrast')
					},
				},
				{
					id: 'chroma',
					type: 'number',
					label: 'Chroma (from 0 to 399)',
					min: 0,
					max: 399,
					default: '110',
					isVisible: function (options = new CompanionOptionValues()) {
						return options.effect.includes('chroma')
					},
				},
				{
					id: 'hue',
					type: 'number',
					label: 'Hue (from -180 to 180)',
					min: -180,
					max: 180,
					default: '0',
					isVisible: function (options = new CompanionOptionValues()) {
						return options.effect.includes('hue')
					},
				},
				{
					id: 'color',
					type: 'dropdown',
					label: 'Color temperature',
					choices: COLOR_TEMP_CHOICES,
					default: COLOR_TEMP_6500,
					isVisible: function (options = new CompanionOptionValues()) {
						return options.effect.includes('color')
					},
				},
				{
					id: 'gamma',
					type: 'dropdown',
					label: 'Gamma',
					choices: GAMMA_CHOICES,
					default: GAMMA_1_DOT_0,
					isVisible: function (options = new CompanionOptionValues()) {
						return options.effect.includes('gamma')
					},
				},
				{
					id: 'sharpness',
					type: 'number',
					label: 'Sharpness (from -10 to 10)',
					min: -10,
					max: 10,
					default: '0',
					isVisible: function (options = new CompanionOptionValues()) {
						return options.effect.includes('sharpness')
					},
				},
				{
					id: 'noiseNr',
					type: 'number',
					label: 'Number (from 0 to 3)',
					min: 0,
					max: 3,
					default: '0',
					isVisible: function (options = new CompanionOptionValues()) {
						return options.effect.includes('noise')
					},
				},
				{
					id: 'flip',
					type: 'dropdown',
					label: 'On or Off',
					choices: FLIP_CHOICES,
					default: FLIP_ON,
					isVisible: function (options = new CompanionOptionValues()) {
						return options.effect.includes('flip')
					},
				},
			],
			callback: async (event) => {
				try {
					self.doAction(event)
				} catch (ex) {
					console.log(ex)
				}
			},
		}

		return actions
	}

	doAction(event) {
		var layer = event.options.layer
		switch (event.options.effect) {
			case EFFECT_BRIGHTNESS_RED:
				return this.getApiConnector().sendSetBrightnessRed(layer, event.options.brightness)
			case EFFECT_BRIGHTNESS_GREEN:
				return this.getApiConnector().sendSetBrightnessGreen(layer, event.options.brightness)
			case EFFECT_BRIGHTNESS_BLUE:
				return this.getApiConnector().sendSetBrightnessBlue(layer, event.options.brightness)
			case EFFECT_CONTRAST_RED:
				return this.getApiConnector().sendSetContrastRed(layer, event.options.contrast)
			case EFFECT_CONTRAST_GREEN:
				return this.getApiConnector().sendSetContrastGreen(layer, event.options.contrast)
			case EFFECT_CONTRAST_BLUE:
				return this.getApiConnector().sendSetContrastBlue(layer, event.options.contrast)
			case EFFECT_CHROMA:
				return this.getApiConnector().sendSetChroma(layer, event.options.chroma)
			case EFFECT_HUE:
				return this.getApiConnector().sendSetHue(layer, event.options.hue)
			case EFFECT_COLOR_TEMPERATURE:
				return this.getApiConnector().sendSetColorTemperature(layer, event.options.color)
			case EFFECT_GAMMA:
				return this.getApiConnector().sendSetGamma(layer, event.options.gamma)
			case EFFECT_SHARPNESS_HORIZONTAL:
				return this.getApiConnector().sendSetSharpnessHorizontal(layer, event.options.sharpness)
			case EFFECT_SHARPNESS_VERTICAL:
				return this.getApiConnector().sendSetSharpnessVertical(layer, event.options.sharpness)
			case EFFECT_NOISE_REDUCTION_HORIZONTAL:
				return this.getApiConnector().sendSetNoiseReductionHorizontal(layer, event.options.noiseNr)
			case EFFECT_NOISE_REDUCTION_VERTICAL:
				return this.getApiConnector().sendSetNoiseReductionVertical(layer, event.options.noiseNr)
			case EFFECT_NOISE_REDUCTION_TEMPORAL_NR:
				return this.getApiConnector().sendSetNoiseReductionTemporal(layer, event.options.noiseNr)
			case EFFECT_NOISE_REDUCTION_BLOCK_NR:
				return this.getApiConnector().sendSetNoiseReductionBlock(layer, event.options.noiseNr)
			case EFFECT_NOISE_REDUCTION_MOSQUITO_NR:
				return this.getApiConnector().sendSetNoiseReductionMosquito(layer, event.options.noiseNr)
			case EFFECT_NOISE_REDUCTION_COMBING_NR:
				return this.getApiConnector().sendSetNoiseReductionCombing(layer, event.options.noiseNr)
			case EFFECT_FLIP_INVERT:
				return this.getApiConnector().sendSetFlip(layer, event.options.flip)
		}
		this.myModule.log(
			'warn',
			'Effect ' + event.options.effect + ' still not supported. This must be fixed by developer.'
		)
	}

	getFeedbacksNames() {
		return [FEEDBACK_SELECTED_EFFECT]
	}

	getFeedbacks() {
		let feedbacks = []

		feedbacks[FEEDBACK_SELECTED_EFFECT] = {
			type: 'boolean',
			name: 'Effect value on selected layer',
			defaultStyle: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
			// options is how the user can choose the condition the feedback activates for
			options: [
				{
					id: 'effect',
					type: 'dropdown',
					label: 'Effect',
					choices: EFFECT_NAMES_CHOICES,
					default: EFFECT_BRIGHTNESS_RED,
				},
				{
					id: 'layer',
					type: 'dropdown',
					label: 'Layer',
					choices: LAYER_NAMES_CHOICES,
					default: LAYER_A,
				},
				{
					id: 'brightness',
					type: 'number',
					label: 'Brightness (from -512 to 512)',
					min: -512,
					max: 512,
					default: '0',
					isVisible: function (options = new CompanionOptionValues()) {
						// what a mess, can't use defined const
						return options.effect.includes('brightness')
					},
				},
				{
					id: 'contrast',
					type: 'number',
					label: 'Contrast (from 0 to 399)',
					min: 0,
					max: 399,
					default: '140',
					isVisible: function (options = new CompanionOptionValues()) {
						return options.effect.includes('contrast')
					},
				},
				{
					id: 'chroma',
					type: 'number',
					label: 'Chroma (from 0 to 399)',
					min: 0,
					max: 399,
					default: '110',
					isVisible: function (options = new CompanionOptionValues()) {
						return options.effect.includes('chroma')
					},
				},
				{
					id: 'hue',
					type: 'number',
					label: 'Hue (from -180 to 180)',
					min: -180,
					max: 180,
					default: '0',
					isVisible: function (options = new CompanionOptionValues()) {
						return options.effect.includes('hue')
					},
				},
				{
					id: 'color',
					type: 'dropdown',
					label: 'Color temperature',
					choices: COLOR_TEMP_CHOICES,
					default: COLOR_TEMP_6500,
					isVisible: function (options = new CompanionOptionValues()) {
						return options.effect.includes('color')
					},
				},
				{
					id: 'gamma',
					type: 'dropdown',
					label: 'Gamma',
					choices: GAMMA_CHOICES,
					default: GAMMA_1_DOT_0,
					isVisible: function (options = new CompanionOptionValues()) {
						return options.effect.includes('gamma')
					},
				},
				{
					id: 'sharpness',
					type: 'number',
					label: 'Sharpness (from -10 to 10)',
					min: -10,
					max: 10,
					default: '0',
					isVisible: function (options = new CompanionOptionValues()) {
						return options.effect.includes('sharpness')
					},
				},
				{
					id: 'noiseNr',
					type: 'number',
					label: 'Number (from 0 to 3)',
					min: 0,
					max: 3,
					default: '0',
					isVisible: function (options = new CompanionOptionValues()) {
						return options.effect.includes('noise')
					},
				},
				{
					id: 'flip',
					type: 'dropdown',
					label: 'On or Off',
					choices: FLIP_CHOICES,
					default: FLIP_ON,
					isVisible: function (options = new CompanionOptionValues()) {
						return options.effect.includes('flip')
					},
				},
			],
			callback: (feedback) => {
				return this.checkFeedback(feedback)
			},
		}
		return feedbacks
	}

	checkFeedback(feedback) {
		var layer = feedback.options.layer
		var layerStatus = new LayerParameters()
		if (layer == LAYER_A) {
			layerStatus = this.getApiConnector().deviceStatus.sources.layerA
		} else if (layer == LAYER_B) {
			layerStatus = this.getApiConnector().deviceStatus.sources.layerB
		} else {
			this.myModule.log('error', 'Wrong layer code:' + layer)
			return false
		}
		switch (feedback.options.effect) {
			case EFFECT_BRIGHTNESS_RED:
				return layerStatus.brightness.red == feedback.options.brightness
			case EFFECT_BRIGHTNESS_GREEN:
				return layerStatus.brightness.green == feedback.options.brightness
			case EFFECT_BRIGHTNESS_BLUE:
				return layerStatus.brightness.blue == feedback.options.brightness
			case EFFECT_CONTRAST_RED:
				return layerStatus.contrast.red == feedback.options.contrast
			case EFFECT_CONTRAST_GREEN:
				return layerStatus.contrast.green == feedback.options.contrast
			case EFFECT_CONTRAST_BLUE:
				return layerStatus.contrast.blue == feedback.options.contrast
			case EFFECT_CHROMA:
				return layerStatus.chroma == feedback.options.chroma
			case EFFECT_HUE:
				return layerStatus.hue == feedback.options.hue
			case EFFECT_COLOR_TEMPERATURE:
				return layerStatus.colorTemperature == feedback.options.color
			case EFFECT_GAMMA:
				return layerStatus.gamma == feedback.options.gamma
			case EFFECT_SHARPNESS_HORIZONTAL:
				return layerStatus.sharpness.horizontal == feedback.options.sharpness
			case EFFECT_SHARPNESS_VERTICAL:
				return layerStatus.sharpness.vertical == feedback.options.sharpness
			case EFFECT_NOISE_REDUCTION_HORIZONTAL:
				return layerStatus.noiseReduction.horizontal == feedback.options.noiseNr
			case EFFECT_NOISE_REDUCTION_VERTICAL:
				return layerStatus.noiseReduction.vertical == feedback.options.noiseNr
			case EFFECT_NOISE_REDUCTION_TEMPORAL_NR:
				return layerStatus.noiseReduction.temporalNR == feedback.options.noiseNr
			case EFFECT_NOISE_REDUCTION_BLOCK_NR:
				return layerStatus.noiseReduction.blockNR == feedback.options.noiseNr
			case EFFECT_NOISE_REDUCTION_MOSQUITO_NR:
				return layerStatus.noiseReduction.mosquitoNR == feedback.options.noiseNr
			case EFFECT_NOISE_REDUCTION_COMBING_NR:
				return layerStatus.noiseReduction.combingNR == feedback.options.noiseNr
			case EFFECT_FLIP_INVERT:
				return layerStatus.flip == feedback.options.flip
		}
		this.myModule.log(
			'warn',
			'Effect feedback ' + feedback.options.effect + ' still not supported. This must be fixed by developer.'
		)
	}

	getPresets() {
		let presets = []

		{
			let brightnessColorActionMap = {
				Red: EFFECT_BRIGHTNESS_RED,
				Green: EFFECT_BRIGHTNESS_GREEN,
				Blue: EFFECT_BRIGHTNESS_BLUE,
			}
			let brightnessValues = [-300, 0, 300]
			for (let colorName in brightnessColorActionMap) {
				for (let brightnessIdx in brightnessValues) {
					let brightness = brightnessValues[brightnessIdx]
					presets.push({
						type: 'button',
						category: PRESETS_CATEGORY_NAME,
						name: colorName + ' brightness ' + brightness, // A name for the preset. Shown to the user when they hover over it
						style: {
							text: colorName + ' brightness ' + brightness,
							size: 'auto',
							color: colorsSingle.WHITE,
							bgcolor: colorsSingle.BLACK,
						},
						steps: [
							{
								down: [
									{
										actionId: ACTION_SET_EFFECT,
										options: { layer: LAYER_A, effect: brightnessColorActionMap[colorName], brightness: brightness },
									},
								],
								up: [],
							},
						],
						feedbacks: [
							{
								feedbackId: FEEDBACK_SELECTED_EFFECT,
								options: { layer: LAYER_A, effect: brightnessColorActionMap[colorName], brightness: brightness },
								style: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
							},
						],
					})
				}
			}
		}

		{
			let contrastColorActionMap = {
				Red: EFFECT_CONTRAST_RED,
				Green: EFFECT_CONTRAST_GREEN,
				Blue: EFFECT_CONTRAST_BLUE,
			}
			let contrastValues = [20, 140, 300]
			for (let colorName in contrastColorActionMap) {
				for (let contrastIdx in contrastValues) {
					let contrast = contrastValues[contrastIdx]
					presets.push({
						type: 'button',
						category: PRESETS_CATEGORY_NAME,
						name: colorName + ' contrast ' + contrast, // A name for the preset. Shown to the user when they hover over it
						style: {
							text: colorName + ' contrast ' + contrast,
							size: 'auto',
							color: colorsSingle.WHITE,
							bgcolor: colorsSingle.BLACK,
						},
						steps: [
							{
								down: [
									{
										actionId: ACTION_SET_EFFECT,
										options: { layer: LAYER_A, effect: contrastColorActionMap[colorName], contrast: contrast },
									},
								],
								up: [],
							},
						],
						feedbacks: [
							{
								feedbackId: FEEDBACK_SELECTED_EFFECT,
								options: { layer: LAYER_A, effect: contrastColorActionMap[colorName], contrast: contrast },
								style: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
							},
						],
					})
				}
			}
		}

		{
			let chromaValues = [20, 110, 300]
			for (let chromaIdx in chromaValues) {
				let chroma = chromaValues[chromaIdx]
				presets.push({
					type: 'button',
					category: PRESETS_CATEGORY_NAME,
					name: 'Chroma\\n' + chroma, // A name for the preset. Shown to the user when they hover over it
					style: {
						text: 'Chroma\\n' + chroma,
						size: 'auto',
						color: colorsSingle.WHITE,
						bgcolor: colorsSingle.BLACK,
					},
					steps: [
						{
							down: [
								{
									actionId: ACTION_SET_EFFECT,
									options: { layer: LAYER_A, effect: EFFECT_CHROMA, chroma: chroma },
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: FEEDBACK_SELECTED_EFFECT,
							options: { layer: LAYER_A, effect: EFFECT_CHROMA, chroma: chroma },
							style: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
						},
					],
				})
			}
		}

		{
			let hueValues = [-150, 0, 150]
			for (let hueIdx in hueValues) {
				let hue = hueValues[hueIdx]
				presets.push({
					type: 'button',
					category: PRESETS_CATEGORY_NAME,
					name: 'Hue\\n' + hue, // A name for the preset. Shown to the user when they hover over it
					style: {
						text: 'Hue\\n' + hue,
						size: 'auto',
						color: colorsSingle.WHITE,
						bgcolor: colorsSingle.BLACK,
					},
					steps: [
						{
							down: [
								{
									actionId: ACTION_SET_EFFECT,
									options: { layer: LAYER_A, effect: EFFECT_HUE, hue: hue },
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: FEEDBACK_SELECTED_EFFECT,
							options: { layer: LAYER_A, effect: EFFECT_HUE, hue: hue },
							style: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
						},
					],
				})
			}
		}

		{
			for (let color in COLOR_TEMP_NAMES) {
				presets.push({
					type: 'button',
					category: PRESETS_CATEGORY_NAME,
					name: 'Color\\n' + COLOR_TEMP_NAMES[color], // A name for the preset. Shown to the user when they hover over it
					style: {
						text: 'Color\\n' + COLOR_TEMP_NAMES[color],
						size: 'auto',
						color: colorsSingle.WHITE,
						bgcolor: colorsSingle.BLACK,
					},
					steps: [
						{
							down: [
								{
									actionId: ACTION_SET_EFFECT,
									options: { layer: LAYER_A, effect: EFFECT_COLOR_TEMPERATURE, color: color },
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: FEEDBACK_SELECTED_EFFECT,
							options: { layer: LAYER_A, effect: EFFECT_COLOR_TEMPERATURE, color: color },
							style: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
						},
					],
				})
			}
		}

		{
			let gammaValues = [GAMMA_OFF, GAMMA_1_DOT_0, GAMMA_1_DOT_6]
			for (let gammaIdx in gammaValues) {
				let gamma = gammaValues[gammaIdx]
				presets.push({
					type: 'button',
					category: PRESETS_CATEGORY_NAME,
					name: 'Gamma\\n' + GAMMA_NAMES[gamma], // A name for the preset. Shown to the user when they hover over it
					style: {
						text: 'Gamma\\n' + GAMMA_NAMES[gamma],
						size: 'auto',
						color: colorsSingle.WHITE,
						bgcolor: colorsSingle.BLACK,
					},
					steps: [
						{
							down: [
								{
									actionId: ACTION_SET_EFFECT,
									options: { layer: LAYER_A, effect: EFFECT_GAMMA, gamma: gamma },
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: FEEDBACK_SELECTED_EFFECT,
							options: { layer: LAYER_A, effect: EFFECT_GAMMA, gamma: gamma },
							style: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
						},
					],
				})
			}
		}

		{
			let axisActionMap = {
				H: EFFECT_SHARPNESS_HORIZONTAL,
				V: EFFECT_SHARPNESS_VERTICAL,
			}
			let sharpnessValues = [-10, 0, 10]
			for (let axisName in axisActionMap) {
				for (let sharpnessIdx in sharpnessValues) {
					let sharpness = sharpnessValues[sharpnessIdx]
					presets.push({
						type: 'button',
						category: PRESETS_CATEGORY_NAME,
						name: axisName + ' sharpness\\n' + sharpness, // A name for the preset. Shown to the user when they hover over it
						style: {
							text: axisName + ' sharpness\\n' + sharpness,
							size: 'auto',
							color: colorsSingle.WHITE,
							bgcolor: colorsSingle.BLACK,
						},
						steps: [
							{
								down: [
									{
										actionId: ACTION_SET_EFFECT,
										options: { layer: LAYER_A, effect: axisActionMap[axisName], sharpness: sharpness },
									},
								],
								up: [],
							},
						],
						feedbacks: [
							{
								feedbackId: FEEDBACK_SELECTED_EFFECT,
								options: { layer: LAYER_A, effect: axisActionMap[axisName], sharpness: sharpness },
								style: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
							},
						],
					})
				}
			}
		}

		{
			let nosieTypeActionMap = {
				'Noise H nr': EFFECT_NOISE_REDUCTION_HORIZONTAL,
				'Noise V nr': EFFECT_NOISE_REDUCTION_VERTICAL,
				'Noise Temporal nr': EFFECT_NOISE_REDUCTION_TEMPORAL_NR,
				'Noise Block nr': EFFECT_NOISE_REDUCTION_BLOCK_NR,
				'Noise Mosquito nr': EFFECT_NOISE_REDUCTION_MOSQUITO_NR,
				'Noise Combing nr': EFFECT_NOISE_REDUCTION_COMBING_NR,
			}
			let nr = [0, 1, 3]
			for (let typeName in nosieTypeActionMap) {
				for (let nrIdx in nr) {
					let nrValue = nr[nrIdx]
					presets.push({
						type: 'button',
						category: PRESETS_CATEGORY_NAME,
						name: typeName + '\\n' + nrValue, // A name for the preset. Shown to the user when they hover over it
						style: {
							text: typeName + '\\n' + nrValue,
							size: 'auto',
							color: colorsSingle.WHITE,
							bgcolor: colorsSingle.BLACK,
						},
						steps: [
							{
								down: [
									{
										actionId: ACTION_SET_EFFECT,
										options: { layer: LAYER_A, effect: nosieTypeActionMap[typeName], noiseNr: nrValue },
									},
								],
								up: [],
							},
						],
						feedbacks: [
							{
								feedbackId: FEEDBACK_SELECTED_EFFECT,
								options: { layer: LAYER_A, effect: nosieTypeActionMap[typeName], noiseNr: nrValue },
								style: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
							},
						],
					})
				}
			}
		}

		{
			for (let flipCode in FLIP_NAMES) {
				presets.push({
					type: 'button',
					category: PRESETS_CATEGORY_NAME,
					name: 'Flip\\n' + FLIP_NAMES[flipCode], // A name for the preset. Shown to the user when they hover over it
					style: {
						text: 'Flip\\n' + FLIP_NAMES[flipCode],
						size: 'auto',
						color: colorsSingle.WHITE,
						bgcolor: colorsSingle.BLACK,
					},
					steps: [
						{
							down: [
								{
									actionId: ACTION_SET_EFFECT,
									options: { layer: LAYER_A, effect: EFFECT_FLIP_INVERT, flip: flipCode },
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: FEEDBACK_SELECTED_EFFECT,
							options: { layer: LAYER_A, effect: EFFECT_FLIP_INVERT, flip: flipCode },
							style: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
						},
					],
				})
			}
		}

		return presets
	}
}

module.exports = EffectsManager
