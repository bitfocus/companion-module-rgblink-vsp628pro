const { colorsStyle, colorsSingle } = require('./colors')
const {
	RGBLinkVSP628ProConnector,
	OUTPUT_RESOLUTIONS_NAMES,
	OUTPUT_RESOLUTION_1920_1080P_50FPS,
	OUTPUT_NAMES,
	OUTPUT1,
	OUTPUT2,
	DeviceStateChanged,
	DeviceChangeEventType,
} = require('../api/rgblink_vsp628pro_connector')

const ACTION_SET_OUTPUT_RESOLUTION = 'set_output_resolution'

const FEEDBACK_OUTPUT_RESOLUTION = 'feedback_output_resolution'

const RESOLUTION_NAMES_CHOICES = []
for (let id in OUTPUT_RESOLUTIONS_NAMES) {
	RESOLUTION_NAMES_CHOICES.push({
		id: id,
		label: OUTPUT_RESOLUTIONS_NAMES[id],
	})
}

const OUTPUT_NAMES_CHOICES = []
for (let id in OUTPUT_NAMES) {
	OUTPUT_NAMES_CHOICES.push({
		id: id,
		label: OUTPUT_NAMES[id],
	})
}

const Variables = {
	OUTPUT_1_RESOLUTION_CODE: 'output1ResolutionCode',
	OUTPUT_1_RESOLUTION_NAME: 'output1ResolutionName',
	OUTPUT_2_RESOLUTION_CODE: 'output2ResolutionCode',
	OUTPUT_2_RESOLUTION_NAME: 'output2ResolutionName',
}

class OutputResolutionManager {
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

		actions[ACTION_SET_OUTPUT_RESOLUTION] = {
			name: 'Set output resolution',
			options: [
				{
					id: 'resolution',
					type: 'dropdown',
					label: 'Resolution',
					choices: RESOLUTION_NAMES_CHOICES,
					default: OUTPUT_RESOLUTION_1920_1080P_50FPS,
					minChoicesForSearch: 10,
				},
				{
					id: 'output',
					type: 'dropdown',
					label: 'Output',
					choices: OUTPUT_NAMES_CHOICES,
					default: OUTPUT1,
				},
			],
			callback: async (event) => {
				try {
					this.getApiConnector().sendSetResolution(event.options.resolution, event.options.output)
				} catch (ex) {
					console.log(ex)
				}
			},
		}

		return actions
	}

	getFeedbacksNames(changedEvent = new DeviceStateChanged()) {
		switch (changedEvent.event) {
			case DeviceChangeEventType.OUTPUT_RESOLUTION_1:
			case DeviceChangeEventType.OUTPUT_RESOLUTION_2:
				return [FEEDBACK_OUTPUT_RESOLUTION]
		}
		return []
	}

	getFeedbacks() {
		let feedbacks = []

		feedbacks[FEEDBACK_OUTPUT_RESOLUTION] = {
			type: 'boolean',
			name: 'Current signal on selected layer',
			defaultStyle: colorsStyle.GREEN_BACKGROUND_WITH_WHITE_TEXT,
			// options is how the user can choose the condition the feedback activates for
			options: [
				{
					id: 'resolution',
					type: 'dropdown',
					label: 'Resolution',
					choices: RESOLUTION_NAMES_CHOICES,
					default: OUTPUT_RESOLUTION_1920_1080P_50FPS,
					minChoicesForSearch: 10,
				},
				{
					id: 'output',
					type: 'dropdown',
					label: 'Output',
					choices: OUTPUT_NAMES_CHOICES,
					default: OUTPUT1,
				},
			],
			callback: (feedback) => {
				if (feedback.options.output == OUTPUT1) {
					return this.getApiConnector().deviceStatus.getOutputResolution1() == feedback.options.resolution
				} else if (feedback.options.output == OUTPUT2) {
					return this.getApiConnector().deviceStatus.getOutputResolution2() == feedback.options.resolution
				} else {
					this.myModule.log('warn', 'Bad output configured? This must be fixed by developer...')
					return false
				}
			},
		}
		return feedbacks
	}

	getPresets() {
		let presets = []

		for (let resolution in OUTPUT_RESOLUTIONS_NAMES) {
			presets.push({
				type: 'button',
				category: 'Output resolution',
				name: OUTPUT_RESOLUTIONS_NAMES[resolution] + ' on OUT1', // A name for the preset. Shown to the user when they hover over it
				style: {
					text: OUTPUT_RESOLUTIONS_NAMES[resolution] + ' on OUT1',
					size: 'auto',
					color: colorsSingle.WHITE,
					bgcolor: colorsSingle.BLACK,
				},
				steps: [
					{
						down: [
							{
								actionId: ACTION_SET_OUTPUT_RESOLUTION,
								options: { resolution: resolution, output: OUTPUT1 },
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: FEEDBACK_OUTPUT_RESOLUTION,
						options: { resolution: resolution, output: OUTPUT1 },
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
			variableId: Variables.OUTPUT_1_RESOLUTION_CODE,
			name: 'Resolution on output 1 - code',
		})
		variables.push({
			variableId: Variables.OUTPUT_1_RESOLUTION_NAME,
			name: 'Resolution on output 1 - name',
		})
		variables.push({
			variableId: Variables.OUTPUT_2_RESOLUTION_CODE,
			name: 'Resolution on output 2 - code',
		})
		variables.push({
			variableId: Variables.OUTPUT_2_RESOLUTION_NAME,
			name: 'Resolution on output 2 - name',
		})
		return variables
	}

	getVariableValueForUpdate(changedEvent = new DeviceStateChanged()) {
		let retObj = {}
		switch (changedEvent.event) {
			case DeviceChangeEventType.OUTPUT_RESOLUTION_1:
				retObj[Variables.OUTPUT_1_RESOLUTION_CODE] = changedEvent.newValue
				retObj[Variables.OUTPUT_1_RESOLUTION_NAME] = OUTPUT_RESOLUTIONS_NAMES[changedEvent.newValue]
				break
			case DeviceChangeEventType.OUTPUT_RESOLUTION_2:
				retObj[Variables.OUTPUT_2_RESOLUTION_CODE] = changedEvent.newValue
				retObj[Variables.OUTPUT_2_RESOLUTION_NAME] = OUTPUT_RESOLUTIONS_NAMES[changedEvent.newValue]
				break
		}
		return retObj
	}
}

module.exports = OutputResolutionManager
