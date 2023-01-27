const RGBLinkApiConnector = require('./rgblinkapiconnector')

const FRONT_PANEL_LOCKED = '01'
const FRONT_PANEL_UNLOCKED = '00'
const FRONT_PANEL_NAMES = [];
FRONT_PANEL_NAMES[FRONT_PANEL_LOCKED] = 'Locked'
FRONT_PANEL_NAMES[FRONT_PANEL_UNLOCKED] = 'Unlocked'

class RGBLinkVSP628ProConnector extends RGBLinkApiConnector {
	EVENT_NAME_ON_DEVICE_STATE_CHANGED = 'on_device_state_changed'

	deviceStatus = {
		frontPanelLocked: undefined,
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
		//this.sendCommand('78', '02', '00', '00', '00') // 3.2.20 Read the master and secondary channel

		// THIS NOT WORK, it closes graph?
		//this.sendCommand('C7', '01' /*read*/, '00', '00', '00') // 3.2.44 Waveform diagram, vector diagram, and histogram:
	}

	sendSetFrontPanelLockStatus(status) {
		if (this.isLockStatusValid(status)) {
			this.sendCommand('68', '02' /*Set the panel lock or unlock*/, this.byteToTwoSignHex(status), '00', '00')
		} else {
			this.myLog('Wrong lock status: ' + status)
		}
	}

	isLockStatusValid(lock) {
		return lock == FRONT_PANEL_LOCKED || lock == FRONT_PANEL_UNLOCKED;
	}

	consumeFeedback(ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4) {
		let redeableMsg = [ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4].join(' ')
		this.myLog(redeableMsg)


		if (CMD == '68') {
			if (DAT1 == '02') {
				if (this.isLockStatusValid(DAT2)) {
					this.emitConnectionStatusOK();
					this.deviceStatus.frontPanelLocked = DAT2;
					return this.logFeedback(redeableMsg, 'Front panel lock status is ' + FRONT_PANEL_NAMES[DAT2]);
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
