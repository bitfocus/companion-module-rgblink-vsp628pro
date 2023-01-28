const RGBLinkApiConnector = require('./rgblinkapiconnector')

const FRONT_PANEL_LOCKED = '01'
const FRONT_PANEL_UNLOCKED = '00'
const FRONT_PANEL_NAMES = []
FRONT_PANEL_NAMES[FRONT_PANEL_LOCKED] = 'Locked'
FRONT_PANEL_NAMES[FRONT_PANEL_UNLOCKED] = 'Unlocked'

class RGBLinkVSP628ProConnector extends RGBLinkApiConnector {
	EVENT_NAME_ON_DEVICE_STATE_CHANGED = 'on_device_state_changed'

	deviceStatus = {
		frontPanelLocked: undefined,
		flashUserMode: {
			lastSavedMode: undefined,
			lastLoadedMode: undefined,
		},
	}

	constructor(host, port, polling) {
		super(host, port, polling)
		var self = this

		this.on(this.EVENT_NAME_ON_DATA_API_NOT_STANDARD_LENGTH, (message) => {
			this.myLog('Not standard data:' + message)
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
	}

	sendSetFrontPanelLockStatus(status) {
		if (this.isLockStatusValid(status)) {
			this.sendCommand('68', '02' /*Set the panel lock or unlock*/, this.byteToTwoSignHex(status), '00', '00')
		} else {
			this.myLog('Wrong lock status: ' + status)
		}
	}

	isLockStatusValid(lock) {
		return lock == FRONT_PANEL_LOCKED || lock == FRONT_PANEL_UNLOCKED
	}

	sendSaveToUserFlash(flashUserMode) {
		if (this.isFlashUserModeValid(flashUserMode)) {
			this.sendCommand('68', '08' /*save to user flash*/, this.byteToTwoSignHex(flashUserMode), '00', '00')
		} else {
			this.myLog('Wrong mode: ' + flashUserMode)
		}
	}

	sendLoadFromUserFlash(flashUserMode) {
		if (this.isFlashUserModeValid(flashUserMode)) {
			this.sendCommand('68', '09' /*load from user flash*/, this.byteToTwoSignHex(flashUserMode), '00', '00')
		} else {
			this.myLog('Wrong mode: ' + flashUserMode)
		}
	}

	isFlashUserModeValid(flashUserMode) {
		let intValue = parseInt(flashUserMode)
		return intValue >= 1 && intValue <= 21
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
		}

		this.myLog('Unrecognized feedback message:' + redeableMsg)
	}

	logFeedback(redeableMsg, info) {
		this.myLog('Feedback:' + redeableMsg + ' ' + info)
	}

	emitConnectionStatusOK() {
		this.emit(this.EVENT_NAME_ON_CONNECTION_OK, [])
	}
}

module.exports.RGBLinkVSP628ProConnector = RGBLinkVSP628ProConnector
module.exports.FRONT_PANEL_LOCKED = FRONT_PANEL_LOCKED
module.exports.FRONT_PANEL_UNLOCKED = FRONT_PANEL_UNLOCKED
