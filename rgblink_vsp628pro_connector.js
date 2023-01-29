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
		source: {
			layerA: undefined,
			layerB: undefined,
		},
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
		//this.sendCommand('68', '66', '01' /*Connect*/, '00', '00')
	}

	sendDisconnectMessage() {
		//this.sendCommand('68', '66', '00' /*Disconnect*/, '00', '00')
	}

	askAboutStatus() {
		this.sendCommand('68', '03', '00', '00', '00') // [OK] read the panel state (is locked or unlocked)
		this.sendCommand('6B', '01', '00', '00', '00') // [OK] read the system mode (standard/pip/dual 2k/switcher...)
		this.sendCommand('6B', '03', '00', '00', '00') // [OK] Read which layer selected (0x03)
		this.sendCommand('72', '01', '00', '00', '00') // [TEST] Read input on layer A
		this.sendCommand('72', '01', '01', '00', '00') // [TEST] Read input on layer B
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
		console.log('sendSourceSignalOnLayer:' + sourceSignal + ',' + layer)
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

	consumeFeedback(ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4) {
		let redeableMsg = [ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4].join(' ')
		// this.myLog(redeableMsg)

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
					return this.logFeedback(redeableMsg, 'Load from user flash, mode ' + parseInt(DAT2, this.PARSE_INT_HEX_MODE))
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
						this.deviceStatus.source.layerA = DAT3
					} else {
						this.deviceStatus.source.layerB = DAT3
					}
					return this.logFeedback(
						redeableMsg,
						'Source on ' + LAYER_NAMES[DAT2] + ' is ' + SOURCE_SIGNALS_NAMES[DAT3]
					)
				}
			}
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
