// Stub for RSMV OpcodeReader types
export type SharedEncoderState = {
	isWrite: boolean,
	stack: object[],
	hiddenstack: object[],
	scan: number,
	endoffset: number,
	buffer: any, // Using any for Buffer to avoid node dependency if not needed
	args: Record<string, unknown>
}

export type DecodeState = SharedEncoderState & { isWrite: false };
export type EncodeState = SharedEncoderState & { isWrite: true };
