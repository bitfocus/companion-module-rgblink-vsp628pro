const { combineRgb } = require('@companion-module/base')
const colorsSingle = {
	WHITE: combineRgb(255, 255, 255),
	BLACK: combineRgb(0, 0, 0),
	RED: combineRgb(255, 0, 0),
	GREEN: combineRgb(0, 204, 0),
	YELLOW: combineRgb(255, 255, 0),
	BLUE: combineRgb(0, 51, 204),
	PURPLE: combineRgb(255, 0, 255),
}
const colorsStyle = {
	// https://github.com/bitfocus/companion-module-base/wiki/Presets
	// Standard Colors
	// RED	255,0,0	White text	STOP,HALT,BREAK,KILL and similar terminating functions + Active program on switchers
	RED_BACKGROUND_WITH_WHITE_TEXT: {
		bgcolor: colorsSingle.RED,
		color: colorsSingle.WHITE,
	},
	// GREEN	0,204,0	White text	TAKE,GO,PLAY, and similar starting functions. + Active Preview on switchers
	GREEN_BACKGROUND_WITH_WHITE_TEXT: {
		bgcolor: colorsSingle.GREEN,
		color: colorsSingle.WHITE,
	},
	// YELLOW	255,255,0	Black text	PAUSE,HOLD,WAIT and similar holding functions + active Keyer on switchers
	YELLOW_BACKGROUND_WITH_BLACK_TEXT: {
		bgcolor: colorsSingle.YELLOW,
		color: colorsSingle.BLACK,
	},
	// BLUE	0,51,204	White text	Active AUX on switchers
	BLUE_BACKGROUND_WITH_WHITE_TEXT: {
		bgcolor: colorsSingle.BLUE,
		color: colorsSingle.WHITE,
	},
	// PURPLE	255,0,255	White text	Presets that need user configuration after they have been draged onto a button
	PURPLE_BACKGROUND_WITH_WHITE_TEXT: {
		bgcolor: colorsSingle.PURPLE,
		color: colorsSingle.WHITE,
	},
}
module.exports.colorsSingle = colorsSingle
module.exports.colorsStyle = colorsStyle
