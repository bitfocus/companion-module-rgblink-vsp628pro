const RGBLinkApiConnector = require('./rgblinkapiconnector')

const FRONT_PANEL_LOCKED = '01'
const FRONT_PANEL_UNLOCKED = '00'
const FRONT_PANEL_NAMES = []
FRONT_PANEL_NAMES[FRONT_PANEL_LOCKED] = 'Locked'
FRONT_PANEL_NAMES[FRONT_PANEL_UNLOCKED] = 'Unlocked'

const SYSTEM_MODE_STANDARD = '16'
const SYSTEM_MODE_PIP = '11'
const SYSTEM_MODE_DUAL_2K = '15'
const SYSTEM_MODE_SWITCHER = '17'
const SYSTEM_MODE_SPLIT = '19'
//const SYSTEM_MODE_MIN_DELAY = '64' // cant set this mode by API, why?
const SYSTEM_MODE_NAMES = []
SYSTEM_MODE_NAMES[SYSTEM_MODE_STANDARD] = 'Standard'
SYSTEM_MODE_NAMES[SYSTEM_MODE_PIP] = 'PIP'
SYSTEM_MODE_NAMES[SYSTEM_MODE_DUAL_2K] = 'Dual 2K'
SYSTEM_MODE_NAMES[SYSTEM_MODE_SWITCHER] = 'Switcher'
SYSTEM_MODE_NAMES[SYSTEM_MODE_SPLIT] = 'Split'
//SYSTEM_MODE_NAMES[SYSTEM_MODE_MIN_DELAY] = 'Min Delay'

const LAYER_A = '00'
const LAYER_B = '01'
const LAYER_NAMES = []
LAYER_NAMES[LAYER_A] = 'Layer A'
LAYER_NAMES[LAYER_B] = 'Layer B'

const SOURCE_SIGNAL_SDI1 = '00'
const SOURCE_SIGNAL_SDI2 = '01'
const SOURCE_SIGNAL_DVI = '02'
const SOURCE_SIGNAL_HDMI = '03'
const SOURCE_SIGNAL_DP = '04'
const SOURCE_SIGNAL_VGA = '05'
const SOURCE_SIGNAL_7 = '06'
const SOURCE_SIGNAL_8 = '07'
const SOURCE_SIGNAL_LOGO_TP = '08'
const SOURCE_SIGNALS_NAMES = []
SOURCE_SIGNALS_NAMES[SOURCE_SIGNAL_SDI1] = 'SDI1'
SOURCE_SIGNALS_NAMES[SOURCE_SIGNAL_SDI2] = 'SDI2'
SOURCE_SIGNALS_NAMES[SOURCE_SIGNAL_DVI] = 'DVI'
SOURCE_SIGNALS_NAMES[SOURCE_SIGNAL_HDMI] = 'HDMI'
SOURCE_SIGNALS_NAMES[SOURCE_SIGNAL_DP] = 'DP'
SOURCE_SIGNALS_NAMES[SOURCE_SIGNAL_VGA] = 'VGA'
SOURCE_SIGNALS_NAMES[SOURCE_SIGNAL_7] = 'custom7' //custom
SOURCE_SIGNALS_NAMES[SOURCE_SIGNAL_8] = 'custom8' //custom
SOURCE_SIGNALS_NAMES[SOURCE_SIGNAL_LOGO_TP] = 'LOGO'

const OUTPUT_RESOLUTION_1920_1080P_50FPS = '0x35'
const OUTPUT_RESOLUTIONS_NAMES = []
OUTPUT_RESOLUTIONS_NAMES['0x00'] = 'NTSC(480i)720'
OUTPUT_RESOLUTIONS_NAMES['0x01'] = 'PAL(576i)720'
OUTPUT_RESOLUTIONS_NAMES['0x02'] = 'NTSC(480i)1440'
OUTPUT_RESOLUTIONS_NAMES['0x03'] = 'PAL(576i)1440'
OUTPUT_RESOLUTIONS_NAMES['0x04'] = '720x580p'
OUTPUT_RESOLUTIONS_NAMES['0x05'] = '720x676p'
OUTPUT_RESOLUTIONS_NAMES['0x06'] = '640x480 @60'
OUTPUT_RESOLUTIONS_NAMES['0x07'] = '640x480 @75'
OUTPUT_RESOLUTIONS_NAMES['0x08'] = '640x480 @85'
OUTPUT_RESOLUTIONS_NAMES['0x09'] = '800x600 @50'
OUTPUT_RESOLUTIONS_NAMES['0x0A'] = '800x600 @60'
OUTPUT_RESOLUTIONS_NAMES['0x0B'] = '800x600 @75'
OUTPUT_RESOLUTIONS_NAMES['0x0C'] = '800x600 @85'
OUTPUT_RESOLUTIONS_NAMES['0x0D'] = '1024x768 @50'
OUTPUT_RESOLUTIONS_NAMES['0x0E'] = '1024x768 @60'
OUTPUT_RESOLUTIONS_NAMES['0x0F'] = '1024x768 @75'
OUTPUT_RESOLUTIONS_NAMES['0x10'] = '1024x768 @85'
OUTPUT_RESOLUTIONS_NAMES['0x11'] = '1152x864 @75'
OUTPUT_RESOLUTIONS_NAMES['0x12'] = '1280x768 @60'
OUTPUT_RESOLUTIONS_NAMES['0x13'] = '1280x768 @75'
OUTPUT_RESOLUTIONS_NAMES['0x14'] = '1280x800 @50'
OUTPUT_RESOLUTIONS_NAMES['0x15'] = '1280x800 @60'
OUTPUT_RESOLUTIONS_NAMES['0x16'] = '1280x960 @50'
OUTPUT_RESOLUTIONS_NAMES['0x17'] = '1280x960 @60'
OUTPUT_RESOLUTIONS_NAMES['0x18'] = '1280x960 @85'
OUTPUT_RESOLUTIONS_NAMES['0x19'] = '1280x1024 @50'
OUTPUT_RESOLUTIONS_NAMES['0x1A'] = '1280x1024 @60'
OUTPUT_RESOLUTIONS_NAMES['0x1B'] = '1280x1024 @75'
OUTPUT_RESOLUTIONS_NAMES['0x1C'] = '1280x1024 @85'
OUTPUT_RESOLUTIONS_NAMES['0x1D'] = '1360x768 @60'
OUTPUT_RESOLUTIONS_NAMES['0x1E'] = '1366x768 @60'
OUTPUT_RESOLUTIONS_NAMES['0x1F'] = '1440x900 @60'
OUTPUT_RESOLUTIONS_NAMES['0x20'] = '1440x900 @75'
OUTPUT_RESOLUTIONS_NAMES['0x21'] = '1440x900 @85'
OUTPUT_RESOLUTIONS_NAMES['0x22'] = '1400x1050 @50'
OUTPUT_RESOLUTIONS_NAMES['0x23'] = '1400x1050 @60'
OUTPUT_RESOLUTIONS_NAMES['0x24'] = '1400x1050 @75'
OUTPUT_RESOLUTIONS_NAMES['0x25'] = '1600x1200 @50'
OUTPUT_RESOLUTIONS_NAMES['0x26'] = '1600x1200 @60'
OUTPUT_RESOLUTIONS_NAMES['0x27'] = '1680x1050 @60'
OUTPUT_RESOLUTIONS_NAMES['0x28'] = '1280x720p @23.98'
OUTPUT_RESOLUTIONS_NAMES['0x29'] = '1280x720p @24'
OUTPUT_RESOLUTIONS_NAMES['0x2A'] = '1280x720p @25'
OUTPUT_RESOLUTIONS_NAMES['0x2B'] = '1280x720p @29.97'
OUTPUT_RESOLUTIONS_NAMES['0x2C'] = '1280x720p @30'
OUTPUT_RESOLUTIONS_NAMES['0x2D'] = '1280x720p @60'
OUTPUT_RESOLUTIONS_NAMES['0x2E'] = '1280x720p @59.94'
OUTPUT_RESOLUTIONS_NAMES['0x2F'] = '1280x720p @60'
OUTPUT_RESOLUTIONS_NAMES['0x30'] = '1920x1080p @23.98'
OUTPUT_RESOLUTIONS_NAMES['0x31'] = '1920x1080p @24'
OUTPUT_RESOLUTIONS_NAMES['0x32'] = '1920x1080p @25'
OUTPUT_RESOLUTIONS_NAMES['0x33'] = '1920x1080p @29.97'
OUTPUT_RESOLUTIONS_NAMES['0x34'] = '1920x1080p @30'
OUTPUT_RESOLUTIONS_NAMES[OUTPUT_RESOLUTION_1920_1080P_50FPS] = '1920x1080p @50'
OUTPUT_RESOLUTIONS_NAMES['0x36'] = '1920x1080p @59.94'
OUTPUT_RESOLUTIONS_NAMES['0x37'] = '1920x1080p @60'
OUTPUT_RESOLUTIONS_NAMES['0x38'] = '1920x1080PsF @23.98'
OUTPUT_RESOLUTIONS_NAMES['0x39'] = '1920x1080PsF @24'
OUTPUT_RESOLUTIONS_NAMES['0x3A'] = '1920x1080PsF @25'
OUTPUT_RESOLUTIONS_NAMES['0x3B'] = '1920x1080PsF @29.97'
OUTPUT_RESOLUTIONS_NAMES['0x3C'] = '1920x1080PsF @30'
OUTPUT_RESOLUTIONS_NAMES['0x3D'] = '1920x1080i @50'
OUTPUT_RESOLUTIONS_NAMES['0x3E'] = '1920x1080i @59.94'
OUTPUT_RESOLUTIONS_NAMES['0x3F'] = '1920x1080i @60'
OUTPUT_RESOLUTIONS_NAMES['0x40'] = '1920x1200p @50'
OUTPUT_RESOLUTIONS_NAMES['0x41'] = '1920x1200p @60'
OUTPUT_RESOLUTIONS_NAMES['0x42'] = '2048x1152p @60'
OUTPUT_RESOLUTIONS_NAMES['0x43'] = '2560x816 @60'
OUTPUT_RESOLUTIONS_NAMES['0x44'] = '1536x1536p @60'
OUTPUT_RESOLUTIONS_NAMES['0x45'] = 'NTSC(480i)2880'
OUTPUT_RESOLUTIONS_NAMES['0x46'] = 'PAL(576i)2880'
OUTPUT_RESOLUTIONS_NAMES['0x47'] = '1920x1080x60.0 #'

const OUTPUT1 = '00'
const OUTPUT2 = '01'
const OUTPUT_NAMES = []
OUTPUT_NAMES[OUTPUT1] = 'Out 1'
OUTPUT_NAMES[OUTPUT2] = 'Out 2'

const FREEZE_STATUS_FREEZE = '01'
const FREEZE_STATUS_LIVE = '00'
const FREEZE_NAMES = []
FREEZE_NAMES[FREEZE_STATUS_LIVE] = 'Live'
FREEZE_NAMES[FREEZE_STATUS_FREEZE] = 'Freeze'

const MIRROR_STATUS_ON = '01'
const MIRROR_STATUS_OFF = '00'
const MIRROR_NAMES = []
MIRROR_NAMES[MIRROR_STATUS_ON] = 'On'
MIRROR_NAMES[MIRROR_STATUS_OFF] = 'Off'

class RGBLinkVSP628ProConnector extends RGBLinkApiConnector {
	EVENT_NAME_ON_DEVICE_STATE_CHANGED = 'on_device_state_changed'

	deviceStatus = {
		frontPanelLocked: undefined,
		flashUserMode: {
			lastSavedMode: undefined,
			lastLoadedMode: undefined,
		},
		systemMode: undefined,
		layer: undefined,
		sources: {
			layerA: {
				sourceId: undefined,
				hMirror: undefined,
				vMirror: undefined,
			},
			layerB: {
				sourceId: undefined,
				hMirror: undefined,
				vMirror: undefined,
			},
		},
		output: {
			resolution1: undefined,
			resolution2: undefined,
		},
		freezeStatus: undefined,
	}

	constructor(host, port, polling) {
		super(host, port, polling)
		var self = this

		this.on(this.EVENT_NAME_ON_DATA_API_NOT_STANDARD_LENGTH, (message) => {
			this.myWarn('Not standard data:' + message)
		})

		this.on(this.EVENT_NAME_ON_DATA_API, (ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4) => {
			self.consumeFeedback(ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4)
			this.emit(this.EVENT_NAME_ON_DEVICE_STATE_CHANGED, [])
		})
	}

	sendConnectMessage() {
		this.sendCommand('68', '66', '01' /*Connect*/, '00', '00')
	}

	sendDisconnectMessage() {
		//this.sendCommand('68', '66', '00' /*Disconnect*/, '00', '00')
	}

	askAboutStatus() {
		this.sendCommand('68', '03', '00', '00', '00') // [OK] read the panel state (is locked or unlocked)
		this.sendCommand('6B', '01', '00', '00', '00') // [OK] read the system mode (standard/pip/dual 2k/switcher...)
		this.sendCommand('6B', '03', '00', '00', '00') // [OK] Read which layer selected (0x03)
		this.sendCommand('72', '01', '00', '00', '00') // [OK] Read input on layer A
		this.sendCommand('72', '01', '01', '00', '00') // [OK] Read input on layer B
		this.sendCommand('74', '01', '00', '00', '00') // [TEST] Read output resolution on OUT1
		this.sendCommand('74', '01', '01', '00', '00') // [TEST] Read output resolution on OUT2
		this.sendCommand('75', '01', '01', '00', '00') // [OK] Read freeze/live
		this.sendCommand('75', '15', '00', '00', '00') // [OK] Read H Mirror for layer A
		this.sendCommand('75', '19', '00', '00', '00') // [OK] Read V Mirror for layer A
		this.sendCommand('75', '15', '01', '00', '00') // [OK] Read H Mirror for layer B
		this.sendCommand('75', '19', '01', '00', '00') // [OK] Read V Mirror for layer B

		//this.sendCommand('75', '11', '00', '00', '00') // feedback 75 11 00 80 07 // bad example for freeze live....
		//this.sendCommand('75', '11', '01', '00', '00') // feedback 75 11 01 80 02
	}

	sendSetFrontPanelLockStatus(status) {
		if (this.isLockStatusValid(status)) {
			this.sendCommand('68', '02' /*Set the panel lock or unlock*/, this.byteToTwoSignHex(status), '00', '00')
		} else {
			this.myWarn('Wrong lock status: ' + status)
		}
	}

	isLockStatusValid(lock) {
		return lock == FRONT_PANEL_LOCKED || lock == FRONT_PANEL_UNLOCKED
	}

	sendSaveToUserFlash(flashUserMode) {
		if (this.isFlashUserModeValid(flashUserMode)) {
			this.sendCommand('68', '08' /*save to user flash*/, this.byteToTwoSignHex(flashUserMode), '00', '00')
		} else {
			this.myWarn('Wrong mode: ' + flashUserMode)
		}
	}

	sendLoadFromUserFlash(flashUserMode) {
		if (this.isFlashUserModeValid(flashUserMode)) {
			this.sendCommand('68', '09' /*load from user flash*/, this.byteToTwoSignHex(flashUserMode), '00', '00')
		} else {
			this.myWarn('Wrong mode: ' + flashUserMode)
		}
	}

	isFlashUserModeValid(flashUserMode) {
		let intValue = parseInt(flashUserMode)
		return intValue >= 1 && intValue <= 21
	}

	sendSystemMode(systemMode) {
		if (this.isSystemModeValid(systemMode)) {
			let DAT2 = this.internalGetDat2ForSystemMode(systemMode)
			this.sendCommand('6B', '00', DAT2, systemMode, '00')
		} else {
			this.myWarn('Wrong system mode: ' + systemMode)
		}
	}

	isSystemModeValid(systemMode) {
		return systemMode in SYSTEM_MODE_NAMES
	}

	internalGetDat2ForSystemMode(systemMode) {
		if (this.isSystemModeValid(systemMode)) {
			if (systemMode == SYSTEM_MODE_DUAL_2K || systemMode == SYSTEM_MODE_PIP) {
				return '01'
			} else {
				return '00'
			}
			// this.myWarn('Unsupported systemMode: ' + systemMode + '. This must be fixed by developer.')
		} else {
			this.myWarn('Wrong system mode: ' + systemMode)
		}
		return '00'
	}

	sendLayer(layer) {
		if (this.isLayerValid(layer)) {
			this.sendCommand('6B', '02', layer, '00', '00')
		} else {
			this.myWarn('Wrong layer code: ' + layer)
		}
	}

	isLayerValid(layer) {
		return layer in LAYER_NAMES
	}

	sendSourceSignalOnLayer(sourceSignal, layer) {
		if (this.isLayerValid(layer)) {
			if (this.isSourceValid(sourceSignal)) {
				this.sendCommand('72', '00', layer, sourceSignal, '00')
			} else {
				this.myWarn('Wrong source code: ' + sourceSignal)
			}
		} else {
			this.myWarn('Wrong layer code: ' + layer)
		}
	}

	isSourceValid(source) {
		return source in SOURCE_SIGNALS_NAMES
	}

	sendSetResolution(resolution, output) {
		if (this.isResolutionValid(resolution)) {
			if (this.isOutputValid(output)) {
				this.sendCommand('74', '00' /*write*/, output, resolution.slice(-2), '00')
			} else {
				this.myWarn('Wrong output id: ' + output)
			}
		} else {
			this.myWarn('Wrong resolution: ' + resolution)
		}
	}

	isResolutionValid(resolutionCode) {
		return resolutionCode in OUTPUT_RESOLUTIONS_NAMES
	}

	getResolutionName(resolutionCode) {
		if (this.isResolutionValid(resolutionCode)) {
			return OUTPUT_RESOLUTIONS_NAMES[resolutionCode]
		} else {
			this.myWarn('Wrong resolution code: ' + resolutionCode)
		}
	}

	isOutputValid(outputCode) {
		return outputCode in OUTPUT_NAMES
	}

	isFreezeStatusValid(freezeStatus) {
		return freezeStatus in FREEZE_NAMES
	}

	sendSetFreezeStatus(freezeStatus) {
		if (this.isFreezeStatusValid(freezeStatus)) {
			this.sendCommand('75', '00', '01' /*???*/, freezeStatus, '00')
		} else {
			this.myWarn('Wrong freezeStatus code: ' + freezeStatus)
		}
	}

	isMirrorStatusValid(mirrorStatus) {
		return mirrorStatus in MIRROR_NAMES
	}

	sendSetHMirror(mirrorStatus, layer) {
		if (this.isLayerValid(layer)) {
			if (this.isMirrorStatusValid(mirrorStatus)) {
				this.sendCommand('75', '14', layer, mirrorStatus, '00')
			} else {
				this.myWarn('Wrong mirror code: ' + mirrorStatus)
			}
		} else {
			this.myWarn('Wrong layer code: ' + layer)
		}
	}

	sendSetVMirror(mirrorStatus, layer) {
		if (this.isLayerValid(layer)) {
			if (this.isMirrorStatusValid(mirrorStatus)) {
				this.sendCommand('75', '18', layer, mirrorStatus, '00')
			} else {
				this.myWarn('Wrong mirror code: ' + mirrorStatus)
			}
		} else {
			this.myWarn('Wrong layer code: ' + layer)
		}
	}

	consumeFeedback(ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4) {
		let redeableMsg = [ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4].join(' ')
		// this.myLog(redeableMsg)

		try {
			if (CMD == '68') {
				if (DAT1 == '02' || DAT1 == '03') {
					// Set the front panel lock or unlock (0x02)
					if (this.isLockStatusValid(DAT2)) {
						this.emitConnectionStatusOK()
						this.deviceStatus.frontPanelLocked = DAT2
						return this.logFeedback(redeableMsg, 'Front panel lock status is ' + FRONT_PANEL_NAMES[DAT2])
					}
				} else if (DAT1 == '08') {
					// Save To the user flash(0x08)
					if (this.isFlashUserModeValid(DAT2)) {
						this.emitConnectionStatusOK()
						this.deviceStatus.flashUserMode.lastSavedMode = parseInt(DAT2, this.PARSE_INT_HEX_MODE)
						return this.logFeedback(redeableMsg, 'Save to user flash, mode ' + parseInt(DAT2, this.PARSE_INT_HEX_MODE))
					}
				} else if (DAT1 == '09') {
					// Load from the user flash(0x09)
					if (this.isFlashUserModeValid(DAT2)) {
						this.emitConnectionStatusOK()
						this.deviceStatus.flashUserMode.lastLoadedMode = parseInt(DAT2, this.PARSE_INT_HEX_MODE)
						return this.logFeedback(
							redeableMsg,
							'Load from user flash, mode ' + parseInt(DAT2, this.PARSE_INT_HEX_MODE)
						)
					}
				}
			} else if (CMD == '6B') {
				if (DAT1 == '00' || DAT1 == '01') {
					// system mode standard/pip/dula 2k/switcher
					if (this.isSystemModeValid(DAT3)) {
						this.emitConnectionStatusOK()
						this.deviceStatus.systemMode = DAT3
						return this.logFeedback(redeableMsg, 'Mode ' + SYSTEM_MODE_NAMES[this.deviceStatus.systemMode])
					}
				} else if (DAT1 == '02' || DAT1 == '03') {
					// layer
					if (this.isLayerValid(DAT2)) {
						this.emitConnectionStatusOK()
						this.deviceStatus.layer = DAT2
						return this.logFeedback(redeableMsg, 'Layer ' + LAYER_NAMES[this.deviceStatus.layer])
					}
				}
			} else if (CMD == '72') {
				if (DAT1 == '00' || DAT1 == '01') {
					// Source switch (0x00)
					// DAT2 - layer, DAT3 - source
					if (this.isLayerValid(DAT2) && this.isSourceValid(DAT3)) {
						this.emitConnectionStatusOK()
						if (DAT2 == LAYER_A) {
							this.deviceStatus.sources.layerA.sourceId = DAT3
						} else {
							this.deviceStatus.sources.layerB.sourceId = DAT3
						}
						return this.logFeedback(redeableMsg, 'Source on ' + LAYER_NAMES[DAT2] + ' is ' + SOURCE_SIGNALS_NAMES[DAT3])
					}
				}
			} else if (CMD == '74') {
				if (DAT1 == '00' || DAT1 == '01') {
					let readedResolution = '0x' + DAT3
					if (this.isResolutionValid(readedResolution))
						if (DAT2 == '00') {
							this.emitConnectionStatusOK()
							this.deviceStatus.output.resolution1 = readedResolution
							return this.logFeedback(redeableMsg, 'Output resolution 1: ' + this.getResolutionName(readedResolution))
						} else if (DAT2 == '01') {
							this.emitConnectionStatusOK()
							this.deviceStatus.output.resolution2 = readedResolution
							return this.logFeedback(redeableMsg, 'Output resolution 2: ' + this.getResolutionName(readedResolution))
						}
				}
			} else if (CMD == '75') {
				if (DAT1 == '00' || DAT1 == '01') {
					// Freeze/Live
					if (DAT2 == '01') {
						// why DAT2 == '01'? id ont know
						if (this.isFreezeStatusValid(DAT3)) {
							this.emitConnectionStatusOK()
							this.deviceStatus.freezeStatus = DAT3
							return this.logFeedback(redeableMsg, 'Freeze status: ' + FREEZE_NAMES[this.deviceStatus.freezeStatus])
						}
					}
				} else if (DAT1 == '14' || DAT1 == '15') {
					// H Mirror
					if (this.isLayerValid(DAT2)) {
						let layer = DAT2 == LAYER_A ? this.deviceStatus.sources.layerA : this.deviceStatus.sources.layerB
						if (this.isMirrorStatusValid(DAT3)) {
							this.emitConnectionStatusOK()
							layer.hMirror = DAT3
							return this.logFeedback(redeableMsg, 'H Mirror: ' + MIRROR_NAMES[DAT3] + ' on ' + LAYER_NAMES[DAT2])
						}
					}
				} else if (DAT1 == '18' || DAT1 == '19') {
					// V Mirror
					if (this.isLayerValid(DAT2)) {
						let layer = DAT2 == LAYER_A ? this.deviceStatus.sources.layerA : this.deviceStatus.sources.layerB
						if (this.isMirrorStatusValid(DAT3)) {
							this.emitConnectionStatusOK()
							layer.vMirror = DAT3
							return this.logFeedback(redeableMsg, 'V Mirror: ' + MIRROR_NAMES[DAT3] + ' on ' + LAYER_NAMES[DAT2])
						}
					}
				}
			}
		} catch (ex) {
			console.log(ex)
		}

		this.myWarn('Unrecognized feedback message:' + redeableMsg)
	}

	logFeedback(redeableMsg, info) {
		this.myDebug('Feedback:' + redeableMsg + ' ' + info)
	}

	emitConnectionStatusOK() {
		this.emit(this.EVENT_NAME_ON_CONNECTION_OK, [])
	}
}

module.exports.RGBLinkVSP628ProConnector = RGBLinkVSP628ProConnector

module.exports.FRONT_PANEL_LOCKED = FRONT_PANEL_LOCKED
module.exports.FRONT_PANEL_UNLOCKED = FRONT_PANEL_UNLOCKED

module.exports.SYSTEM_MODE_NAMES = SYSTEM_MODE_NAMES
module.exports.SYSTEM_MODE_STANDARD = SYSTEM_MODE_STANDARD
module.exports.SYSTEM_MODE_PIP = SYSTEM_MODE_PIP
module.exports.SYSTEM_MODE_DUAL_2K = SYSTEM_MODE_DUAL_2K
module.exports.SYSTEM_MODE_SWITCHER = SYSTEM_MODE_SWITCHER
module.exports.SYSTEM_MODE_SPLIT = SYSTEM_MODE_SPLIT

module.exports.LAYER_NAMES = LAYER_NAMES
module.exports.LAYER_A = LAYER_A
module.exports.LAYER_B = LAYER_B

module.exports.SOURCE_SIGNALS_NAMES = SOURCE_SIGNALS_NAMES
module.exports.SOURCE_SIGNAL_HDMI = SOURCE_SIGNAL_HDMI

module.exports.OUTPUT_RESOLUTIONS_NAMES = OUTPUT_RESOLUTIONS_NAMES
module.exports.OUTPUT_RESOLUTION_1920_1080P_50FPS

module.exports.OUTPUT_NAMES = OUTPUT_NAMES
module.exports.OUTPUT1 = OUTPUT1
module.exports.OUTPUT2 = OUTPUT2

module.exports.FREEZE_NAMES = FREEZE_NAMES
module.exports.FREEZE_STATUS_FREEZE = FREEZE_STATUS_FREEZE
module.exports.FREEZE_STATUS_LIVE = FREEZE_STATUS_LIVE

module.exports.MIRROR_STATUS_ON = MIRROR_STATUS_ON
module.exports.MIRROR_STATUS_OFF = MIRROR_STATUS_OFF
module.exports.MIRROR_NAMES = MIRROR_NAMES
