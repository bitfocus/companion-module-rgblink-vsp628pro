// version 2.0-SNAPSHOT

const { UDPHelper } = require('@companion-module/base')

class RGBLinkApiConnector {
	EVENT_NAME_ON_DATA_API = 'on_data'
	EVENT_NAME_ON_DATA_API_NOT_STANDARD_LENGTH = 'on_data_not_standard_length'
	EVENT_NAME_ON_CONNECTION_OK = 'on_connection_ok'
	EVENT_NAME_ON_CONNECTION_WARNING = 'on_connection_warning'
	EVENT_NAME_ON_CONNECTION_ERROR = 'on_connection_error'
	PARSE_INT_HEX_MODE = 16

	config = {
		host: undefined,
		polling: undefined,
	}
	logProvider
	socket // = new UDPHelper()
	eventsListeners = []
	nextSn = 0
	intervalHandler = undefined
	lastDataSentTime = undefined
	lastDataReceivedTime = undefined
	createTime = new Date().getTime()

	constructor(host, port, polling) {
		this.config.polling = polling
		var self = this
		if (host) {
			this.createSocket(host, port)
		}
		this.intervalHandler = setInterval(function () {
			self.onEveryOneSecond()
		}, 1000)
	}

	enableLog(logProvider) {
		this.logProvider = logProvider
	}

	disableLog() {
		this.logProvider = undefined
	}

	myLog(msg) {
		try {
			if (this.logProvider) {
				this.logProvider.log('debug', msg)
			} else {
				console.log(msg)
			}
		} catch (ex) {
			console.log(ex) // is it log anything?
		}
	}

	onEveryOneSecond() {
		if (this.config.polling) {
			this.askAboutStatus()
		}
	}

	onAfterDataSent() {
		try {
			var sentDate = new Date().getTime()
			var self = this

			;(function (sentDate2) {
				setTimeout(function () {
					if (self.config.polling) {
						if (typeof self.lastDataReceivedTime === 'undefined' || self.lastDataReceivedTime < sentDate2) {
							let lastReceiveOrStart = self.lastDataReceivedTime || self.createTime
							self.emit(
								self.EVENT_NAME_ON_CONNECTION_WARNING,
								'The device has not sent any data since ' + new Date(lastReceiveOrStart).toLocaleTimeString()
							)
						}
					}
				}, 2000)
			})(sentDate)
		} catch (ex) {
			this.myLog(ex)
		}
	}

	createSocket(host, port) {
		this.myLog('RGBLinkApiConnector: creating socket ' + host + ':' + port + '...')
		this.config.host = host

		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
		}
		this.lastDataSentTime = undefined
		this.lastDataReceivedTime = undefined

		if (host) {
			this.socket = new UDPHelper(host, port)
			this.socket.on('status_change', (status, message) => {
				this.myLog('RGBLinkApiConnector: udp status_change:' + status + ' ' + message)
			})

			this.socket.on('error', (err) => {
				this.myLog('RGBLinkApiConnector: udp error:' + err)
			})

			this.socket.on('data', (message) => {
				this.myLog('FEEDBACK: ' + message)
				this.onDataReceived(message)
			})
		}
	}

	onDataReceived(message) {
		try {
			if (message.length !== 19) {
				this.emit(this.EVENT_NAME_ON_DATA_API_NOT_STANDARD_LENGTH, [message])
			} else {
				this.validateReceivedDataAndEmitIfValid(message)
			}
			this.lastDataReceivedTime = new Date().getTime()
		} catch (ex) {
			this.myLog(ex)
		}
	}

	onDestroy() {
		if (this.socket !== undefined) {
			this.socket.destroy()
		}
		clearInterval(this.intervalHandler)
	}

	on = function (event, listener) {
		if (typeof this.eventsListeners[event] !== 'object') {
			this.eventsListeners[event] = []
		}
		this.eventsListeners[event].push(listener)
	}

	emit = function (event, args) {
		if (typeof this.eventsListeners[event] === 'object') {
			let listeners = this.eventsListeners[event].slice()

			if (!Array.isArray(args)) {
				args = [args]
			}
			for (var i = 0; i < listeners.length; i++) {
				listeners[i].apply(this, args)
			}
		}
	}

	sendCommandNative(cmd) {
		//let self = this
		try {
			if (cmd !== undefined && cmd != '') {
				if (this.socket !== undefined) {
					this.socket.send(cmd).then(function () {
						// self.myLog('sent?')
					})
					this.myLog('SENT    : ' + cmd)
					this.lastDataSentTime = new Date().getTime()
					this.onAfterDataSent()
				} else {
					this.myLog("Can't send command, socket undefined!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
				}
			}
		} catch (ex) {
			this.myLog(ex)
		}
	}

	setPolling(polling) {
		this.config.polling = polling
	}

	askAboutStatus() {
		// to overrirde during implementation with specific device
	}

	sendCommand(CMD, DAT1, DAT2, DAT3, DAT4) {
		let ADDR = '00'
		this.sendCommandWithAddr(ADDR, CMD, DAT1, DAT2, DAT3, DAT4)
	}

	sendCommandWithAddr(ADDR, CMD, DAT1, DAT2, DAT3, DAT4) {
		let SN = this.byteToTwoSignHex(this.nextSn)
		this.incrementNextSn()
		let checksum = this.calculateChecksum(ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4)
		let cmd = '<T' + ADDR + SN + CMD + DAT1 + DAT2 + DAT3 + DAT4 + checksum + '>'
		this.sendCommandNative(cmd)
	}

	byteToTwoSignHex(b) {
		let out = parseInt(b).toString(this.PARSE_INT_HEX_MODE).toUpperCase()
		while (out.length < 2) {
			out = '0' + out
		}
		return out
	}

	incrementNextSn() {
		this.nextSn++
		if (this.nextSn > 255) {
			this.nextSn = 0
		}
	}

	validateReceivedDataAndEmitIfValid(message) {
		let redeableMsg = message.toString('utf8').toUpperCase()

		// Checksum checking
		let checksumInMessage = redeableMsg.substr(16, 2)
		let ADDR = redeableMsg.substr(2, 2)
		let SN = redeableMsg.substr(4, 2)
		let CMD = redeableMsg.substr(6, 2)
		let DAT1 = redeableMsg.substr(8, 2)
		let DAT2 = redeableMsg.substr(10, 2)
		let DAT3 = redeableMsg.substr(12, 2)
		let DAT4 = redeableMsg.substr(14, 2)
		let calculatedChecksum = this.calculateChecksum(ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4)
		if (checksumInMessage != calculatedChecksum) {
			this.emit(this.EVENT_NAME_ON_CONNECTION_WARNING, 'Incorrect checksum ' + redeableMsg)
			this.myLog('redeableMsg Incorrect checksum: ' + checksumInMessage + ' != ' + calculatedChecksum)
			return
		}

		if (redeableMsg[0] != '<' || redeableMsg[1] != 'F' || redeableMsg[18] != '>') {
			this.emit(this.EVENT_NAME_ON_CONNECTION_WARNING, 'Message is not a feedback:' + redeableMsg)
			return
		}

		if (redeableMsg.includes('FFFFFFFF')) {
			this.emit(this.EVENT_NAME_ON_CONNECTION_WARNING, 'Feedback with error:' + redeableMsg)
			return
		}
		// end of validate section

		this.emit(this.EVENT_NAME_ON_DATA_API, [ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4])
	}

	calculateChecksum(ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4) {
		let sum = 0
		sum += parseInt(ADDR, this.PARSE_INT_HEX_MODE)
		sum += parseInt(SN, this.PARSE_INT_HEX_MODE)
		sum += parseInt(CMD, this.PARSE_INT_HEX_MODE)
		sum += parseInt(DAT1, this.PARSE_INT_HEX_MODE)
		sum += parseInt(DAT2, this.PARSE_INT_HEX_MODE)
		sum += parseInt(DAT3, this.PARSE_INT_HEX_MODE)
		sum += parseInt(DAT4, this.PARSE_INT_HEX_MODE)
		let checksum = (sum % 256).toString(this.PARSE_INT_HEX_MODE).toUpperCase()
		while (checksum.length < 2) {
			checksum = '0' + checksum
		}
		return checksum
	}
}

module.exports = RGBLinkApiConnector
