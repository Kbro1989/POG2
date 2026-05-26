import { lastLegacyBuildnr } from "./CacheConstants.js";
import type * as jsonschema from "json-schema";
import type { ClientscriptObfuscation } from "rsmv/clientscript/callibrator.js";

export type TypeDef = { [name: string]: unknown };

const BufferTypes = {
	buffer: { constr: Buffer as any as Uint8ArrayConstructor },//Buffer typings doesn't have BYTES_PER_ELEMENT
	hex: { constr: Uint8Array },//used to debug into json file
	byte: { constr: Int8Array },
	ubyte: { constr: Uint8Array },
	short: { constr: Int16Array },
	ushort: { constr: Uint16Array },
	int: { constr: Int32Array },
	uint: { constr: Uint32Array },
	float: { constr: Float32Array }
};

let debugdata: null | {
	rootstate: unknown,
	opcodes: {
		op: string,
		index: number,
		stacksize: number,
		jump?: { to: number }
	}[]
} = null;

export function getDebug(trigger: boolean) {
	const ret = debugdata;
	debugdata = trigger ? { rootstate: null, opcodes: [] } : null;
	return ret;
}

type SharedEncoderState = {
	isWrite: boolean,
	stack: object[],
	hiddenstack: object[],
	scan: number,
	endoffset: number,
	buffer: Buffer,
	args: Record<string, unknown>
}

export type DecodeState = SharedEncoderState & { isWrite: false };
export type EncodeState = SharedEncoderState & { isWrite: true };

export type ResolvedReference = {
	stackdepth: number,
	resolve(v: unknown, oldvalue: number): number
}

export type ChunkParser = {
	read(state: DecodeState): any,
	write(state: EncodeState, v: unknown): void,
	getTypescriptType(indent: string): string,
	getJsonSchema(): any,
	readConst?(state: SharedEncoderState): any
}

let parserFunctions: any;
let parserPrimitives: any;
let hardcodes: any;

type ChunkParentCallback = (prop: string, childresolve: ResolvedReference) => ResolvedReference;

function resolveAlias(typename: string, parent: ChunkParentCallback, typedef: TypeDef) {
	if (!Object.hasOwn(typedef, typename)) {
		throw new Error(`Type '${typename}' not found in typedef.json`);
	}
	const newtype = typedef[typename];
	if (typeof newtype != "string") {
		//TODO this recursion is unchecked
		return buildParser(parent, newtype, typedef);
	} else if (Object.hasOwn(parserPrimitives, newtype)) {
		return parserPrimitives[newtype];
	} else {
		return resolveAlias(newtype, parent, typedef);
	}
}

export function buildParser(parent: ChunkParentCallback | null, chunkdef: unknown, typedef: TypeDef): ChunkParser {
	parent ??= () => { throw new Error("reference failed to resolve"); };
	switch (typeof chunkdef) {
		case "boolean":
		case "number":
			return literalValueParser(chunkdef);
		case "string": {
			if (Object.hasOwn(parserPrimitives, chunkdef)) {
				return parserPrimitives[chunkdef];
			} else {
				return resolveAlias(chunkdef, parent, typedef);
			}
		}
		case "object":
			if (chunkdef == null) {
				return literalValueParser(null);
			} else if (!Array.isArray(chunkdef)) {
				return opcodesParser(chunkdef, parent, typedef);
			} else {
				if (chunkdef.length < 1) throw new Error(`'read' variables must either be a valid type-defining string, an array of type-defining strings / objects, or a valid type-defining object: ${JSON.stringify(chunkdef)}`);
				const args = chunkdef.slice(1);
				if (parserFunctions[chunkdef[0]]) {
					return parserFunctions[chunkdef[0]](args, parent, typedef);
				}
			}
		default:
			throw new Error(`'read' variables must either be a valid type-defining string, an array of type-defining strings / objects, or a valid type-defining object: ${JSON.stringify(chunkdef)}`);
	}
}

function opcodesParser(chunkdef: {}, parent: ChunkParentCallback, typedef: TypeDef) {
	const r: ChunkParser = {
		read(state) {
			const r: Record<string, any> = {};
			const hidden: any = { $opcode: 0 };
			state.stack.push(r);
			state.hiddenstack.push(hidden);
			if (debugdata && !debugdata.rootstate) { debugdata.rootstate = r; }
			while (true) {
				if (state.scan == state.endoffset) {
					if (!hasexplicitnull) {
						// throw new Error("ended reading opcode struct at end of file without 0x00 opcode");
						console.log("ended reading opcode struct at end of file without 0x00 opcode");
					}
					break;
				}
				const opt = opcodetype.read(state);
				hidden.$opcode = opt;
				if (!hasexplicitnull && opt == 0) { break; }
				const parser = map.get(opt);
				if (debugdata) {
					debugdata.opcodes.push({ op: (parser ? parser.key as string : `_0x${opt.toString(16)}_`), index: state.scan - 1, stacksize: state.stack.length });
				}
				if (!parser) { throw new Error("unknown chunk 0x" + opt.toString(16).toUpperCase()); }
				(r as any)[parser.key] = parser.parser.read(state);
			}
			state.stack.pop();
			state.hiddenstack.pop();
			return r;
		},
		write(state: EncodeState, value: any) {
			if (typeof value != "object" || !value) { throw new Error("oject expected") }
			state.stack.push(value);
			state.hiddenstack.push({});
			for (const key in value) {
				if (key.startsWith("$")) { continue; }
				const opt = (opts as any)[key];
				if (!opt) { throw new Error("unknown property " + key); }
				opcodetype.write(state, opt.op);
				opt.parser.write(state, value[key]);
			}
			if (!hasexplicitnull) {
				opcodetype.write(state, 0);
			}
			state.stack.pop();
			state.hiddenstack.pop();
		},
		getTypescriptType(indent) {
			let r = "{\n";
			const newindent = indent + "\t";
			for (const val of map.values()) {
				r += newindent + (val.key as string) + "?: " + val.parser.getTypescriptType(newindent) + " | null\n";
			}
			r += indent + "}";
			return r;
		},
		getJsonSchema() {
			return {
				type: "object",
				properties: Object.fromEntries([...map.values()]
					.filter(prop => !(prop.key as string).startsWith("$"))
					.map((prop) => {
						return [prop.key, { oneOf: [prop.parser.getJsonSchema(), { type: "null" }] }];
					})
				)
			}
		}
	}

	const resolveReference = function (targetprop: string, name: string, childresolve: ResolvedReference) {
		const result: ResolvedReference = {
			stackdepth: childresolve.stackdepth + 1,
			resolve(v, oldvalue) {
				if (typeof v != "object" || !v) { throw new Error("object expected"); }
				const res = (v as any)[targetprop!];
				return childresolve.resolve(res, oldvalue);
			}
		};
		if (name == "$opcode" || Object.prototype.hasOwnProperty.call(opts, name)) {
			refs[name] ??= [];
			refs[name]!.push(result);
			return result;
		} else {
			return buildReference(name, parent, result);
		}
	}
	const refs: Record<string, ResolvedReference[] | undefined> = {};
	const opcodetype = buildParser(null, ((chunkdef as any)["$opcode"] ?? "unsigned byte"), typedef);
	const opts: Record<string, { op: number, parser: ChunkParser }> = {};
	for (const key in chunkdef) {
		if (key.startsWith("$")) { continue; }
		const op = (chunkdef as any)[key];
		if (typeof op != "object" || !op) { throw new Error("op name expected"); }
		const opname = op["name"];
		if (typeof opname != "string") { throw new Error("op name expected"); }
		if (opts[opname]) { throw new Error("duplicate opcode key " + opname); }
		opts[opname] = {
			op: parseInt(key),
			parser: buildParser(resolveReference.bind(null, key), op["read"], typedef)
		};
	}

	const map = new Map<number, { key: string, parser: ChunkParser }>();
	for (const key in opts) {
		const opt = opts[key];
		map.set(opt.op, { key: key, parser: opt.parser });
	}
	const hasexplicitnull = !!map.get(0);

	return r;
}

function tuppleParser(args: unknown[], parent: ChunkParentCallback, typedef: TypeDef) {
	const r: ChunkParser = {
		read(state) {
			const r: any[] = [];
			for (const prop of props) {
				const v = prop.read(state);
				r.push(v);
			}
			return r;
		},
		write(state, value) {
			if (!Array.isArray(value)) { throw new Error("array expected"); }
			for (const [i, prop] of props.entries()) {
				prop.write(state, value[i]);
			}
		},
		getTypescriptType(indent) {
			let r = "[\n";
			const newindent = indent + "\t";
			for (const prop of props) { r += newindent + prop.getTypescriptType(newindent) + ",\n"; }
			r += indent + "]";
			return r;
		},
		getJsonSchema() {
			return {
				type: "array",
				items: Object.entries(props).map(([k, v]: [string, ChunkParser]) => v.getJsonSchema()),
				minItems: Object.keys(props).length,
				maxItems: Object.keys(props).length
			};
		}
	};

	const resolveReference = function (index: number, name: string, child: ResolvedReference) {
		return buildReference(name, parent, {
			stackdepth: child.stackdepth,
			resolve(v, old) {
				if (!Array.isArray(v)) { throw new Error("Array expected"); }
				return child.resolve(v[index], old)
			}
		})
	}

	const props = args.map((d, i) => buildParser(resolveReference.bind(null, i), d, typedef));
	return r;
}

export function buildReference(name: string, container: ChunkParentCallback | null, startingpoint: ResolvedReference) {
	if (!container) { throw new Error("reference " + name + " could not be resolved"); }
	return container(name, startingpoint);
}

function refgetter(refparent: ChunkParentCallback | null, propname: string, resolve: (v: unknown, old: number) => number) {
	const final = buildReference(propname, refparent, { stackdepth: 0, resolve });
	const depth = final.stackdepth;
	const hidden = propname.startsWith("$");
	return {
		read(state: SharedEncoderState) {
			const stack = (hidden ? state.hiddenstack : state.stack) as Record<string, any>[];
			return stack[stack.length - depth][propname];
		},
		write(state: SharedEncoderState, newvalue: number) {
			if (state.isWrite && !hidden) { throw new Error(`can update ref values in write mode when they are hidden (prefixed with $) in ${propname}`); }
			const stack = (hidden ? state.hiddenstack : state.stack) as Record<string, any>[];
			stack[stack.length - depth][propname] = newvalue;
		}
	}
}

function structParser(args: unknown[], parent: ChunkParentCallback, typedef: TypeDef) {
	const refs: Record<string, ResolvedReference[] | undefined> = {};
	const r: ChunkParser = {
		read(state) {
			const r = {};
			const hidden = {};
			state.stack.push(r);
			state.hiddenstack.push(hidden);
			if (debugdata && !debugdata.rootstate) { debugdata.rootstate = r; }
			for (const key of keys) {
				if (debugdata) { debugdata.opcodes.push({ op: key, index: state.scan, stacksize: state.stack.length }); }
				const v = (props as any)[key].read(state);
				if (v !== undefined) {
					if (key[0] == "$") {
						(hidden as any)[key] = v;
					} else {
						(r as any)[key] = v;
					}
				}
			}
			state.stack.pop();
			state.hiddenstack.pop();
			return r;
		},
		write(state, value) {
			if (typeof value != "object" || !value) { throw new Error("object expected"); }
			const hiddenvalue = {};
			state.stack.push(value);
			state.hiddenstack.push(hiddenvalue);
			for (const key of keys) {
				let propvalue = (value as any)[key as string];
				const prop = (props as any)[key];

				if (key.startsWith("$")) {
					if (prop.readConst != undefined) {
						propvalue = prop.readConst(state);
					} else {
						const refarray = refs[key];
						if (!refarray) { throw new Error("cannot write hidden values if they are not constant or not referenced"); }
						propvalue ??= 0;
						for (const ref of refarray) {
							propvalue = ref.resolve(value, propvalue);
						}
					}
					(hiddenvalue as any)[key] = propvalue;
				}
				prop.write(state, propvalue);
			}
			state.stack.pop();
			state.hiddenstack.pop();
		},
		getTypescriptType(indent) {
			let r = "{\n";
			const newindent = indent + "\t";
			for (const key of keys) {
				if (key[0] == "$") { continue; }
				r += newindent + key + ": " + (props as any)[key].getTypescriptType(newindent) + ",\n";
			}
			r += indent + "}";
			return r;
		},
		getJsonSchema() {
			return {
				type: "object",
				properties: Object.fromEntries([...Object.entries(props)]
					.filter(([key]) => !key.startsWith("$"))
					.map(([key, prop]) => [key, (prop as ChunkParser).getJsonSchema()])
				),
				required: keys.filter(k => !k.startsWith("$"))
			}
		}
	}

	const resolveReference = function (targetprop: string, name: string, childresolve: ResolvedReference) {
		const result: ResolvedReference = {
			stackdepth: childresolve.stackdepth + 1,
			resolve(v, oldvalue) {
				if (typeof v != "object" || !v) { throw new Error("object expected"); }
				const res = (v as any)[targetprop!];
				return childresolve.resolve(res, oldvalue);
			}
		};
		if (Object.prototype.hasOwnProperty.call(props, name)) {
			refs[name] ??= [];
			refs[name]!.push(result);
			return result;
		} else {
			return buildReference(name, parent, result);
		}
	}

	const props = {};
	for (const propdef of args) {
		if (!Array.isArray(propdef) || propdef.length != 2) { throw new Error("each struct args should be a [name,type] pair"); }
		if (typeof propdef[0] != "string") { throw new Error("prop name should be string"); }
		if ((props as any)[propdef[0]]) { throw new Error("duplicate struct prop " + propdef[0]); }
		(props as any)[propdef[0]] = buildParser(resolveReference.bind(null, propdef[0]), propdef[1], typedef);
	}
	const keys = Object.keys(props);
	return r;
}

function optParser(args: unknown[], parent: ChunkParentCallback, typedef: TypeDef) {
	const r: ChunkParser = {
		read(state) {
			const matchindex = condchecker.match(state);
			if (matchindex == -1) { return null; }
			return type.read(state);
		},
		write(state, value) {
			if (value != null) {
				return type.write(state, value);
			}
		},
		getTypescriptType(indent) {
			return type.getTypescriptType(indent) + " | null";
		},
		getJsonSchema() {
			return {
				oneOf: [
					type.getJsonSchema(),
					{ type: "null" }
				]
			}
		}
	};

	const resolveReference = function (name: string, child: ResolvedReference) {
		return buildReference(name, parent, {
			stackdepth: child.stackdepth,
			resolve(v, old) {
				return (v != null ? child.resolve(v, old) : old);
			}
		})
	}

	if (args.length < 2) throw new Error(`2 arguments exptected for proprety with type opt`);
	const arg1 = args[0];
	let condstr = "";
	if (typeof arg1 == "string") {
		condstr = arg1;
	} else {
		type CompareMode = "eq" | "eqnot" | "bitflag" | "bitflagnot" | "bitor" | "bitand" | "gteq" | "lteq";

		let condvar: string;
		let condvalue: number;
		let cmpmode: CompareMode = "eq";
		if (Array.isArray(arg1)) {
			if (typeof arg1[1] != "number") {
				throw new Error("only literal ints as condition value are supported");
			}
			condvar = arg1[0];
			cmpmode = arg1[2] ?? "eq";
			condvalue = arg1[1];
		} else {
			if (typeof arg1 != "number") { throw new Error(""); }
			condvar = "$opcode";
			condvalue = arg1;
		}
		const condmap: Record<CompareMode, string> = {
			bitand: "&=",
			bitflag: "&",
			bitflagnot: "!&",
			bitor: "&",
			eq: "==",
			eqnot: "!=",
			gteq: ">=",
			lteq: "<="
		}
		const mapped = condmap[cmpmode]
		if (cmpmode == "bitflag" || cmpmode == "bitflagnot") {
			condvalue = 1 << condvalue;
		}
		condstr = `${condvar}${mapped}${condvalue}`;
	}
	const condchecker = conditionParser(resolveReference, [condstr], v => (v == null ? -1 : 0));

	const type = buildParser(resolveReference, args[1], typedef);

	return r;
}

function chunkedArrayParser(args: unknown[], parent: ChunkParentCallback, typedef: TypeDef) {
	const r: ChunkParser = {
		read(state: DecodeState) {
			let len = lengthtype.read(state);
			// Jagex rev 221+ version sentinel: 0xFFFF means versioned header
			if (len === 0xFFFF) {
				const version = state.buffer.readUInt8(state.scan);
				state.scan += 1;
				len = lengthtype.read(state);
				if (debugdata) {
					debugdata.opcodes.push({ op: `chunkedarray_version_${version}`, index: state.scan, stacksize: state.stack.length });
				}
			}
			const r: object[] = [];
			const hiddenprops: object[] = [];
			for (let chunkindex = 0; chunkindex < chunktypes.length; chunkindex++) {
				const proptype = chunktypes[chunkindex];
				if (debugdata) {
					debugdata.opcodes.push({ op: Object.keys(proptype).join(), index: state.scan, stacksize: state.stack.length });
				}
				for (let i = 0; i < len; i++) {
					let hidden: object;
					let obj: any;
					if (chunkindex == 0) {
						obj = {};
						(r as any).push(obj);
						hidden = {};
						hiddenprops.push(hidden);
					} else {
						obj = (r as any)[i];
						hidden = hiddenprops[i];
					}
					state.stack.push(obj);
					state.hiddenstack.push(hidden);
					for (const key in proptype) {
						const value = (proptype as any)[key].read(state);
						if (key.startsWith("$")) {
							(hidden as any)[key] = value;
						} else {
							(obj as any)[key] = value;
						}
					}
					state.stack.pop();
					state.hiddenstack.pop();
				}
			}
			return r;
		},
		write(state: EncodeState, v: any) {
			if (!Array.isArray(v)) { throw new Error("array expected"); }
			lengthtype.write(state, v.length);

			const hiddenprops: object[] = [];
			for (let chunkindex = 0; chunkindex < chunktypes.length; chunkindex++) {
				const proptype = chunktypes[chunkindex];
				for (let i = 0; i < v.length; i++) {
					const entry = v[i];
					const hiddenvalue = (chunkindex == 0 ? (hiddenprops[i] = {}) : hiddenprops[i]);
					state.stack.push(entry);
					state.hiddenstack.push(hiddenvalue);
					if (typeof entry != "object" || !entry) { throw new Error("object expected"); }
					for (const key in proptype) {
						const prop = (proptype as any)[key];
						let propvalue = (entry as any)[key];
						if (key.startsWith("$")) {
							if (prop.readConst != undefined) {
								propvalue = prop.readConst(state);
							} else {
								const refarray = refs[key];
								if (!refarray) { throw new Error("cannot write hidden values if they are not constant or not referenced"); }
								propvalue ??= 0;
								for (const ref of refarray) {
									propvalue = ref.resolve(entry, propvalue);
								}
							}
							(hiddenvalue as any)[key] = propvalue;
						}
						prop.write(state, propvalue);
					}
					state.stack.pop();
					state.hiddenstack.pop();
				}
			}
		},
		getTypescriptType(indent: string) {
			let r = "{\n";
			const newindent = indent + "\t";
			for (const [key, prop] of Object.entries(fullobj)) {
				if (key[0] == "$") { continue; }
				r += newindent + key + ": " + prop.getTypescriptType(newindent) + ",\n";
			}
			r += indent + "}[]";
			return r;
		},
		getJsonSchema() {
			return {
				type: "array",
				items: {
					type: "object",
					properties: Object.fromEntries([...Object.entries(fullobj)]
						.filter(([key]) => !key.startsWith("$"))
						.map(([key, prop]) => [key, prop.getJsonSchema()])
					),
					required: keys.filter(k => !k.startsWith("$"))
				}
			};
		}
	};

	const resolveLength: ChunkParentCallback = function (prop, childresolve) {
		return buildReference(prop, parent, {
			stackdepth: childresolve.stackdepth,
			resolve(v, old) {
				if (!Array.isArray(v)) { throw new Error("array expected"); }
				return childresolve.resolve(v.length, old);
			}
		});
	}

	const resolveReference = function (targetprop: string, name: string, childresolve: ResolvedReference) {
		const result: ResolvedReference = {
			stackdepth: childresolve.stackdepth + 1,
			resolve(v, oldvalue) {
				if (typeof v != "object" || !v) { throw new Error("object expected"); }
				const res = (v as any)[targetprop!];
				return childresolve.resolve(res, oldvalue);
			}
		};
		if (Object.prototype.hasOwnProperty.call(fullobj, name)) {
			refs[name] ??= [];
			refs[name]!.push(result);
			return result;
		} else {
			return buildReference(name, parent, result);
		}
	}

	const refs: Record<string, ResolvedReference[] | undefined> = {};
	const fullobj: Record<string, ChunkParser> = {};
	const chunktypes: Record<string, ChunkParser>[] = [];
	const rawchunks = args.slice(1);

	for (const chunk of rawchunks) {
		if (!Array.isArray(chunk)) { throw new Error("each argument for composed chunk should be an array") }
		const group: Record<string, ChunkParser> = {};
		chunktypes.push(group);
		for (const propdef of chunk as unknown[]) {
			if (!Array.isArray(propdef) || propdef.length != 2 || typeof propdef[0] != "string") { throw new Error("each composedchunk should be a [name,type] pair"); }
			const p = buildParser(resolveReference.bind(null, propdef[0]), propdef[1], typedef);
			group[propdef[0]] = p;
			fullobj[propdef[0]] = p;
		}
	}

	const keys = chunktypes.flatMap(Object.keys);
	const lengthtype = buildParser(resolveLength, args[0], typedef);

	return r;
}

function literalValueParser(value: any): ChunkParser {
	return {
		read(state) { return value; },
		write(state, v) { if (v !== value) { throw new Error("literal mismatch"); } },
		getTypescriptType(indent) { return JSON.stringify(value); },
		getJsonSchema() { return { const: value }; }
	};
}

function referenceValueParser(args: unknown[], parent: ChunkParentCallback, typedef: TypeDef) {
	if (args.length < 1) { throw new Error("reference name expected"); }
	const name = args[0] as string;
	const resolve: ResolvedReference = {
		stackdepth: 0,
		resolve(v, old) { return (v as any) ?? old; }
	};
	const getter = refgetter(parent, name, (v, old) => (v as any) ?? old);
	return {
		read(state: DecodeState) { return getter.read(state); },
		write(state: EncodeState, v: any) { getter.write(state, v as any); },
		getTypescriptType(indent: string) { return "any"; },
		getJsonSchema() { return { type: "any" }; }
	};
}

function intAccumolatorParser(args: unknown[], parent: ChunkParentCallback, typedef: TypeDef) {
	const name = args[0] as string;
	const getter = refgetter(parent, name, (v, old) => (v as any) + old);
	const type = buildParser(parent, args[1], typedef);
	return {
		read(state: DecodeState) {
			const val = type.read(state);
			const old = getter.read(state);
			getter.write(state, val + old);
			return val + old;
		},
		write(state: EncodeState, v: any) {
			const old = getter.read(state);
			type.write(state, (v as any) - old);
			getter.write(state, v as any);
		},
		getTypescriptType(indent: string) { return "number"; },
		getJsonSchema() { return { type: "number" }; }
	};
}

function arrayParser(args: unknown[], parent: ChunkParentCallback, typedef: TypeDef) {
	const r: ChunkParser = {
		read(state) {
			const len = lengthtype.read(state);
			const r: any[] = [];
			for (let i = 0; i < len; i++) {
				r.push(type.read(state));
			}
			return r;
		},
		write(state, v) {
			if (!Array.isArray(v)) { throw new Error("array expected"); }
			lengthtype.write(state, v.length);
			for (let i = 0; i < v.length; i++) {
				type.write(state, v[i]);
			}
		},
		getTypescriptType(indent) {
			return `${type.getTypescriptType(indent)}[]`;
		},
		getJsonSchema() {
			return {
				type: "array",
				items: type.getJsonSchema()
			};
		}
	}

	const lengthtype = buildParser(null, args[0], typedef);
	const type = buildParser(null, args[1], typedef);
	return r;
}

function arrayNullTerminatedParser(args: unknown[], parent: ChunkParentCallback, typedef: TypeDef) {
	const type = buildParser(parent, args[0], typedef);
	return {
		read(state: DecodeState) {
			const r: any[] = [];
			while (state.scan < state.endoffset) {
				if (state.buffer[state.scan] == 0) {
					state.scan++;
					break;
				}
				r.push(type.read(state));
			}
			return r;
		},
		write(state: EncodeState, v: any) {
			if (!Array.isArray(v)) { throw new Error("array expected"); }
			for (let i = 0; i < v.length; i++) {
				type.write(state, v[i]);
			}
			state.buffer[state.scan++] = 0;
		},
		getTypescriptType(indent: string) { return `${type.getTypescriptType(indent)}[]`; },
		getJsonSchema() { return { type: "array", items: type.getJsonSchema() }; }
	};
}

function bytesRemainingParser(args: unknown[], parent: ChunkParentCallback, typedef: TypeDef) {
	return {
		read(state: DecodeState) {
			const r = state.buffer.slice(state.scan, state.endoffset);
			state.scan = state.endoffset;
			return r;
		},
		write(state: EncodeState, v: any) {
			if (!Buffer.isBuffer(v)) { throw new Error("buffer expected"); }
			v.copy(state.buffer, state.scan);
			state.scan += v.length;
		},
		getTypescriptType(indent: string) { return "Buffer"; },
		getJsonSchema() { return { type: "string", format: "binary" }; }
	};
}

function bufferParser(args: unknown[], parent: ChunkParentCallback, typedef: TypeDef) {
	const lengthtype = buildParser(null, args[0], typedef);
	return {
		read(state: DecodeState) {
			const len = lengthtype.read(state);
			const r = state.buffer.slice(state.scan, state.scan + len);
			state.scan += len;
			return r;
		},
		write(state: EncodeState, v: any) {
			if (!Buffer.isBuffer(v)) { throw new Error("buffer expected"); }
			lengthtype.write(state, v.length);
			v.copy(state.buffer, state.scan);
			state.scan += v.length;
		},
		getTypescriptType(indent: string) { return "Buffer"; },
		getJsonSchema() { return { type: "string", format: "binary" }; }
	};
}

function stringParser(prebytes: number[]): ChunkParser {
	const encoding = "latin1";
	return {
		read(state) {
			const terminator = (getClientVersion(state.args) <= lastLegacyBuildnr ? 0xA : 0);
			for (let i = 0; i < prebytes.length; i++, state.scan++) {
				if (state.buffer.readUInt8(state.scan) != prebytes[i]) {
					throw new Error("failed to match string header bytes");
				}
			}
			let end = state.scan;
			while (true) {
				if (end == state.endoffset) {
					throw new Error("reading string without null termination");
				}
				if (state.buffer.readUInt8(end) == terminator) {
					break;
				}
				end++;
			}
			const outputstr = state.buffer.toString(encoding, state.scan, end);
			state.scan = end + 1;
			return outputstr;
		},
		write(state, value) {
			if (typeof value != "string") throw new Error(`string expected`);
			const terminator = (getClientVersion(state.args) <= lastLegacyBuildnr ? 0xA : 0);
			const writebytes = [
				...prebytes,
				...Buffer.from(value, encoding),
				terminator
			];
			state.buffer.set(writebytes, state.scan);
			state.scan += writebytes.length;
		},
		getTypescriptType() { return "string"; },
		getJsonSchema() { return { type: "string" }; }
	}
}

function conditionParser(parent: ChunkParentCallback, optionstrings: string[], writegetindex?: (v: unknown) => number) {
	type ops = "=" | "<" | "<=" | ">" | ">=" | "&" | "!&" | "!=" | "&=";
	type cond = { op: ops, value: number, varname: string, varindex: number };

	const varmap: { name: string, parser: ReturnType<typeof refgetter> }[] = [];
	const options: cond[][] = [];
	for (let str of optionstrings) {
		str = str.replace(/\s/g, "");
		const parts = str.split(/&&/g);
		const conds: cond[] = [];
		for (const opt of parts) {
			let op: ops;
			let varname: string;
			let value = 0;
			if (opt == "default" || opt == "other") {
				continue;
			} else {
				const m = opt.match(/^((?<var>[\$a-zA-Z]\w*)?(?<op><|<=|>|>=|&|==|=|!&|&=|!=)?)?(?<version>0x[\da-fA=F]+|-?\d+)$/);
				if (!m) { throw new Error("invalid match value, expected <op><version>. For example '>10'"); }
				value = parseInt(m.groups!.version);
				op = (m.groups!.op ?? "=") as ops;
				if (op as any == "==") { op = "="; }
				varname = m.groups!.var ?? "$opcode";
			}

			let varindex = varmap.findIndex(q => q.name == varname);
			if (varindex == -1) {
				varindex = varmap.length;
				varmap.push({
					name: varname,
					parser: refgetter(parent, varname, (v, oldvalue) => {
						if (!writegetindex) { throw new Error("write not implemented"); }
						const index = writegetindex(v);
						for (let optionindex = 0; optionindex < options.length; optionindex++) {
							const option = options[optionindex];
							for (const con of option) {
								if (con.varindex != varindex) { continue; }
								const state = optionindex == index;
								const compValue = con.value;
								switch (con.op) {
									case "=": oldvalue = state ? compValue : oldvalue; break;
									case "!=": oldvalue = state ? oldvalue : compValue; break;
									case "&": oldvalue = (state ? oldvalue | compValue : oldvalue & ~compValue); break;
									case "&=": oldvalue = (state ? oldvalue | compValue : oldvalue & ~compValue); break;
									case "!&": oldvalue = (state ? oldvalue & ~compValue : oldvalue | compValue); break;
									case ">=": oldvalue = state ? Math.max(compValue, oldvalue) : oldvalue; break;
									case ">": oldvalue = state ? Math.max(compValue + 1, oldvalue) : oldvalue; break;
									case "<=": oldvalue = state ? Math.min(compValue, oldvalue) : oldvalue; break;
									case "<": oldvalue = state ? Math.min(compValue - 1, oldvalue) : oldvalue; break;
									default: throw new Error("unknown condition " + con.op);
								}
							}
						}
						return oldvalue;
					})
				});
			}
			conds.push({ op, value, varname, varindex });
		}
		options.push(conds);
	}

	const match = (state: SharedEncoderState) => {
		const vars = varmap.map(q => q.parser.read(state));
		for (let optindex = 0; optindex < options.length; optindex++) {
			const opt = options[optindex];
			let matched = true;
			for (const cond of opt) {
				const value = vars[cond.varindex];
				switch (cond.op) {
					case "=": matched = value == cond.value; break;
					case "!=": matched = value != cond.value; break;
					case "<": matched = value < cond.value; break;
					case "<=": matched = value <= cond.value; break;
					case ">": matched = value > cond.value; break;
					case ">=": matched = value >= cond.value; break;
					case "&": matched = (value & cond.value) != 0; break;
					case "!&": matched = (value & cond.value) == 0; break;
					case "&=": matched = (value & cond.value) == cond.value; break;
					default: throw new Error("unknown op" + cond.op);
				}
				if (!matched) { break; }
			}
			if (matched) { return optindex; }
		}
		return -1;
	}

	return { match };
}

function getClientVersion(args: Record<string, unknown>) {
	if (typeof args.clientVersion != "number") { throw new Error("client version not set"); }
	return args.clientVersion;
}

function checkBounds(s: DecodeState, bytes: number) {
	if (s.scan + bytes > s.endoffset) {
		console.warn(`[GhostLimb] Buffer underrun at ${s.scan}/${s.endoffset} (reading ${bytes} bytes)`);
		throw new RangeError(`Buffer underrun at ${s.scan}/${s.endoffset}`);
	}
}

hardcodes = {
	playeritem: function () {
		return {
			read(state: DecodeState) {
				const byte0 = state.buffer.readUInt8(state.scan++);
				if (byte0 == 0) { return 0; }
				const byte1 = state.buffer.readUInt8(state.scan++);
				if (byte1 == 0xff && byte0 == 0xff) { return -1; }
				return (byte0 << 8) | byte1;
			},
			write(state: EncodeState, value: any) {
				if (typeof value != "number") { throw new Error("number expected"); }
				if (value == 0) {
					state.buffer.writeUInt8(0, state.scan++);
				} else {
					state.buffer.writeUint16BE((value == -1 ? 0xffff : value & 0xffff), state.scan);
					state.scan += 2;
				}
			},
			getTypescriptType() { return "number"; },
			getJsonSchema() { return { type: "integer", minimum: -1, maximum: 0xffff - 0x4000 - 1 }; }
		}
	},
	itemvar: function (args: any) {
		const type = args[0];
		if (typeof type != "string" || !["ref", "matcount", "colorcount", "modelcount"].includes(type)) { throw new Error(); }

		return {
			read(state: DecodeState) {
				let activeitem = (typeof state.args.activeitem == "number" ? state.args.activeitem : -1);
				if (type == "ref") {
					activeitem++;
					state.args.activeitem = activeitem;
				}
				if (!Array.isArray(state.args.slots)) { throw new Error(""); }
				const ref = state.args.slots[activeitem];
				if (type == "ref") { return ref; }
				else if (type == "matcount") { return ref?.replaceMaterials?.length ?? 0; }
				else if (type == "colorcount") { return ref?.replaceColors?.length ?? 0; }
				else if (type == "modelcount") { return ref?.models.length; }
				else { throw new Error(); }
			},
			write() { /*noop*/ },
			getTypescriptType() { return (type == "ref" ? "any" : "number"); },
			getJsonSchema() { return { type: (type == "ref" ? "any" : "integer") } }
		}
	},
	buildnr: function (args: any, typedef: any) {
		return {
			readConst(state: SharedEncoderState) {
				return getClientVersion(state.args);
			},
			read(state: DecodeState) {
				return getClientVersion(state.args);
			},
			write(state: EncodeState, v: any) {/*noop*/ },
			getTypescriptType(indent: string) { return "number"; },
			getJsonSchema() { return { type: "number" } }
		}
	},
	match: function (args: any[], parent: any, typedef: any) {
		const r: ChunkParser = {
			read(state) {
				const opcodeprop = { $opcode: 0 };
				state.stack.push({});
				state.hiddenstack.push(opcodeprop);
				const value = (opvalueparser ? opvalueparser.read(state) : 0);
				opcodeprop.$opcode = value;
				const opindex = conditionparser.match(state);
				if (opindex == -1) {
					throw new Error("no opcode matched");
				}
				const res = optionvalues[opindex].read(state);

				state.stack.pop();
				state.hiddenstack.pop();
				return res;
			},
			write(state, v) {
				const opcodeprop = { $opcode: 0 };
				state.stack.push({});
				state.hiddenstack.push(opcodeprop);

				if (opvalueparser) {
					if (!opvalueparser.readConst) { throw new Error("non-const or non-reference match value not implemented in write mode"); }
					opcodeprop.$opcode = opvalueparser.readConst(state);
				}
				const opindex = conditionparser.match(state);
				if (opindex == -1) { throw new Error("no opcode matched"); }
				optionvalues[opindex].write(state, v);

				state.stack.pop();
				state.hiddenstack.pop();
			},
			getTypescriptType(indent) {
				return "(" + optionvalues.map(opt => opt.getTypescriptType(indent + "\t")).join("|") + ")";
			},
			getJsonSchema() {
				return { anyOf: optionvalues.map(opt => opt.getJsonSchema()) };
			}
		}

		const resolveReference: ChunkParentCallback = function (name, child) {
			const res: ResolvedReference = {
				stackdepth: child.stackdepth + 1,
				resolve(v, old) {
					throw new Error("write not supported");
				}
			}
			if (name == "$opcode") { return res; }
			return buildReference(name, parent, res);
		}

		if (args.length == 1) { args = [null, args[0]]; }
		if (args.length != 2) { throw new Error("match chunks needs 2 arguments") }
		if (typeof args[1] != "object") { throw new Error("match chunk requires 2n+2 arguments"); }

		const opvalueparser = (args[0] ? buildParser(resolveReference, args[0], typedef) : null);
		const conditionstrings = Object.keys(args[1] as any);
		const optionvalues = Object.values(args[1] as any).map(q => buildParser(resolveReference, q, typedef))
		const conditionparser = conditionParser(resolveReference, conditionstrings);
		return r;
	},
	footer: function (args: any[], parent: any, typedef: any) {
		if (args.length != 2) { throw new Error("footer requires length and subtype arguments"); }
		const lentype = buildParser(parent, args[0] as any, typedef);
		const subtype = buildParser(parent, args[1] as any, typedef);
		return {
			read(state: DecodeState) {
				const len = lentype.read(state);
				const oldscan = state.scan;
				const footstart = state.endoffset - len;
				state.scan = footstart;
				if (debugdata) {
					debugdata.opcodes.push({ op: `footer`, index: oldscan, stacksize: state.stack.length + 1, jump: { to: footstart } });
				}
				const res = subtype.read(state);
				if (debugdata) {
					debugdata.opcodes.push({ op: `footer`, index: state.scan, stacksize: state.stack.length + 1, jump: { to: oldscan } });
				}
				if (state.scan != state.endoffset) { console.log(`didn't read full footer, ${state.endoffset - state.scan} bytes left`); }
				state.scan = oldscan;
				state.endoffset = state.endoffset - len;

				return res;
			},
			write(state: EncodeState, v: any) {
				const oldscan = state.scan;
				subtype.write(state, v);
				const len = state.scan - oldscan;
				state.buffer.copyWithin(state.endoffset - len, oldscan, state.scan);
				state.scan = oldscan;
				state.endoffset -= len;
			},
			getTypescriptType(indent: string) {
				return subtype.getTypescriptType(indent);
			},
			getJsonSchema() {
				return subtype.getJsonSchema();
			},
		}
	},
	"tailed varushort": function (args: any, parent: any, typedef: any) {
		const overflowchunk = 0x7fff;
		return {
			read(state: DecodeState) {
				let sum = 0;
				while (true) {
					const byte0 = state.buffer.readUint8(state.scan++);
					let v: number;
					if ((byte0 & 0x80) == 0) {
						v = byte0;
					} else {
						const byte1 = state.buffer.readUint8(state.scan++);
						v = ((byte0 & 0x7f) << 8) | byte1;
					}
					sum += v;
					if (v != overflowchunk) {
						return sum;
					}
				}
			},
			write(state: EncodeState, v: any) {
				if (typeof v != "number") { throw new Error("number expected"); }
				while (v >= 0) {
					const chunk = Math.min(overflowchunk, v);
					if (chunk < 0x80) {
						state.buffer.writeUint8(chunk, state.scan++);
					} else {
						state.buffer.writeUint16BE(chunk | 0x8000, state.scan);
						state.scan += 2;
					}
					v -= chunk;
				}
			},
			getTypescriptType(indent: string) {
				return "number";
			},
			getJsonSchema() {
				return { type: "number" };
			}
		}
	},
	"legacy_maptile": function (args: any, parent: any, typedef: any) {
		return {
			read(state: DecodeState) {
				const res = {
					flags: 0,
					shape: null as number | null,
					overlay: null as number | null,
					settings: null as number | null,
					underlay: null as number | null,
					height: null as number | null
				}
				while (true) {
					const op = state.buffer.readUint8(state.scan++);
					if (op == 0) { break; }
					if (op == 1) {
						res.height = state.buffer.readUint8(state.scan++);
						break;
					}
					if (op >= 2 && op <= 49) {
						res.shape = op - 2;
						res.overlay = state.buffer.readUint8(state.scan);
						state.scan += 1;
					}
					if (op >= 50 && op <= 81) {
						res.settings = op - 49;
					}
					if (op >= 82) {
						res.underlay = op - 81;
					}
				}
				return res;
			},
			write(state: EncodeState) {
				throw new Error("not implemented");
			},
			getTypescriptType(indent: string) {
				const newindent = indent + "\t";
				return `{\n`
					+ `${newindent}flags: number,\n`
					+ `${newindent}shape: number | null,\n`
					+ `${newindent}overlay: number | null,\n`
					+ `${newindent}settings: number | null,\n`
					+ `${newindent}underlay: number | null,\n`
					+ `${newindent}height: number | null,\n`
					+ `${indent}}`;
			},
			getJsonSchema() {
				return { type: "any" };
			}
		}
	},
	scriptopt: function (args: any, parent: any, typedef: any) {
		return {
			read(state: DecodeState) {
				const cali = state.args.clientScriptDeob as ClientscriptObfuscation | undefined;
				if (!cali) {
					throw new Error("opcode callibration not set for clientscript with obfuscated opcodes");
				}
				if (debugdata) {
					debugdata.opcodes.push({ op: "opcode", index: state.scan, stacksize: state.stack.length + 1 });
				}
				const res = (cali as ClientscriptObfuscation).readOpcode(state);
				return res;
			},
			write(state: EncodeState, v: unknown) {
				const cali = state.args.clientScriptDeob as ClientscriptObfuscation | undefined;
				if (!cali) {
					throw new Error("opcode callibration not set for clientscript with obfuscated opcodes");
				}
				cali.writeOpCode(state, v);
			},
			getJsonSchema() {
				return {
					type: "object",
					properties: {
						opcode: { type: "number" },
						imm: { type: "number" },
						imm_obj: { oneOf: [{ type: "number" }, { type: "string" }, { type: "null" }] }
					}
				}
			},
			getTypescriptType(indent: string) {
				const newindent = indent + "\t";
				return `{\n`
					+ `${newindent}opcode:number,\n`
					+ `${newindent}imm:number,\n`
					+ `${newindent}imm_obj:number|string|[number,number]|null,\n`
					+ `${indent}}`;
			}
		}
	}
}

const numberTypes: Record<string, { read: (s: DecodeState) => number, write: (s: EncodeState, v: number) => void, min: number, max: number }> = {
	ubyte: {
		read(s) { checkBounds(s, 1); const r = s.buffer.readUInt8(s.scan); s.scan += 1; return r; },
		write(s, v) { s.buffer.writeUInt8(v, s.scan); s.scan += 1; },
		min: 0, max: 255
	},
	byte: {
		read(s) { checkBounds(s, 1); const r = s.buffer.readInt8(s.scan); s.scan += 1; return r; },
		write(s, v) { s.buffer.writeInt8(v, s.scan); s.scan += 1; },
		min: -128, max: 127
	},
	ushort: {
		read(s) { checkBounds(s, 2); const r = s.buffer.readUInt16BE(s.scan); s.scan += 2; return r; },
		write(s, v) { s.buffer.writeUInt16BE(v, s.scan); s.scan += 2; },
		min: 0, max: 2 ** 16 - 1
	},
	short: {
		read(s) { checkBounds(s, 2); const r = s.buffer.readInt16BE(s.scan); s.scan += 2; return r; },
		write(s, v) { s.buffer.writeInt16BE(v, s.scan); s.scan += 2; },
		min: -(2 ** 15), max: 2 ** 15 - 1
	},
	uint: {
		read(s) { checkBounds(s, 4); const r = s.buffer.readUInt32BE(s.scan); s.scan += 4; return r; },
		write(s, v) { s.buffer.writeUInt32BE(v, s.scan); s.scan += 4; },
		min: 0, max: 2 ** 32 - 1
	},
	int: {
		read(s) { checkBounds(s, 4); const r = s.buffer.readInt32BE(s.scan); s.scan += 4; return r; },
		write(s, v) { s.buffer.writeInt32BE(v, s.scan); s.scan += 4; },
		min: -(2 ** 31), max: 2 ** 31 - 1
	},
	uint_le: {
		read(s) { checkBounds(s, 4); const r = s.buffer.readUInt32LE(s.scan); s.scan += 4; return r; },
		write(s, v) { s.buffer.writeUint32LE(v, s.scan); s.scan += 4; },
		min: 0, max: 2 ** 32 - 1
	},
	ushort_le: {
		read(s) { checkBounds(s, 2); const r = s.buffer.readUInt16LE(s.scan); s.scan += 2; return r; },
		write(s, v) { s.buffer.writeUint16LE(v, s.scan); s.scan += 2; },
		min: 0, max: 2 ** 16 - 1
	},
	utribyte: {
		read(s) { checkBounds(s, 3); const r = s.buffer.readUIntBE(s.scan, 3); s.scan += 3; return r; },
		write(s, v) { s.buffer.writeUintBE(v, s.scan, 3); s.scan += 3; },
		min: 0, max: 2 ** 24 - 1
	},
	float: {
		read(s) { checkBounds(s, 4); const r = s.buffer.readFloatBE(s.scan); s.scan += 4; return r; },
		write(s, v) { s.buffer.writeFloatBE(v, s.scan); s.scan += 4; },
		min: Number.MIN_VALUE, max: Number.MAX_VALUE
	},
	varushort: {
		read(s) {
			checkBounds(s, 1);
			const firstByte = s.buffer.readUInt8(s.scan++);
			if ((firstByte & 0x80) == 0) { return firstByte; }
			checkBounds(s, 1);
			const secondByte = s.buffer.readUInt8(s.scan++);
			return ((firstByte & 0x7f) << 8) | secondByte;
		},
		write(s, v) {
			if (v < 0x80) { s.buffer.writeUInt8(v, s.scan++); }
			else { s.buffer.writeUint16BE(v | 0x8000, s.scan); s.scan += 2; }
		},
		min: 0, max: 2 ** 15 - 1
	},
	varshort: {
		read(s) {
			checkBounds(s, 1);
			const firstByte = s.buffer.readUInt8(s.scan++);
			if ((firstByte & 0x80) == 0) { return (firstByte << (32 - 7)) >> (32 - 7); }
			checkBounds(s, 1);
			const secondByte = s.buffer.readUInt8(s.scan++);
			return ((((firstByte & 0x7f) << 8) | secondByte) << (32 - 15)) >> (32 - 15);
		},
		write(s, v) {
			if (v < 0x40 && v >= -0x40) { s.buffer.writeUInt8(v & 0x7f, s.scan++); }
			else { s.buffer.writeInt16BE(v | 0x8000, s.scan); s.scan += 2; }
		},
		min: -(2 ** 14), max: 2 ** 14 - 1
	},
	varuint: {
		read(s) {
			checkBounds(s, 2);
			const firstWord = s.buffer.readUInt16BE(s.scan);
			s.scan += 2;
			if ((firstWord & 0x8000) == 0) { return firstWord; }
			else { checkBounds(s, 2); const secondWord = s.buffer.readUInt16BE(s.scan); s.scan += 2; return ((firstWord & 0x7fff) << 16) | secondWord; }
		},
		write(s, v) {
			if (v < 0x8000) { s.buffer.writeUInt16BE(v, s.scan); s.scan += 2; }
			else { s.buffer.writeUint32BE((v | 0x80000000) >>> 0, s.scan); s.scan += 4; }
		},
		min: 0, max: 2 ** 31 - 1
	},
	varnullint: {
		read(s) {
			checkBounds(s, 2);
			const firstWord = s.buffer.readUInt16BE(s.scan);
			s.scan += 2;
			if (firstWord == 0x7fff) { return -1; }
			else if ((firstWord & 0x8000) == 0) { return firstWord; }
			else { checkBounds(s, 2); const secondWord = s.buffer.readUInt16BE(s.scan); s.scan += 2; return ((firstWord & 0x7fff) << 16) | secondWord; }
		},
		write(s, v) {
			if (v == -1) { s.buffer.writeUint16BE(0x7fff, s.scan); s.scan += 2; }
			else if (v < 0x8000) { s.buffer.writeUInt16BE(v, s.scan); s.scan += 2; }
			else { s.buffer.writeUint32BE((v | 0x80000000) >>> 0, s.scan); s.scan += 4; }
		},
		min: -1, max: 2 ** 31 - 1
	},
	varint: {
		read(s) {
			checkBounds(s, 2);
			const firstWord = s.buffer.readUInt16BE(s.scan);
			s.scan += 2;
			if ((firstWord & 0x8000) == 0) { return (firstWord << (32 - 15)) >> (32 - 15); }
			checkBounds(s, 2);
			const secondWord = s.buffer.readUInt16BE(s.scan);
			s.scan += 2;
			return ((((firstWord & 0x7fff) << 16) | secondWord) << (32 - 31)) >> (32 - 31);
		},
		write(s, v) {
			if (v < 0x4000 && v >= -0x4000) { s.buffer.writeUInt16BE(v & 0x7fff, s.scan); s.scan += 2; }
			else { s.buffer.writeInt32BE(v | 0x800000, s.scan); s.scan += 4; }
		},
		min: -(2 ** 30), max: 2 ** 30 - 1
	}
}

parserPrimitives = {
	...Object.fromEntries(Object.entries(numberTypes).map<[string, ChunkParser]>(([k, e]) => [k, {
		read: e.read,
		write: (s, v: any) => {
			if (typeof v != "number" || v > e.max || v < e.min) { throw new Error(); }
			e.write(s, v);
		},
		getJsonSchema() { return { type: "number", maximum: e.max, minimum: e.min }; },
		getTypescriptType(indent) { return "number"; }
	}])),
	bool: {
		read(s: DecodeState) {
			const r = s.buffer.readUInt8(s.scan++);
			if (r != 0 && r != 1) { throw new Error("1 or 0 expected boolean value"); }
			return r != 0;
		},
		write(s: EncodeState, v: any) {
			if (typeof v != "boolean") { throw new Error("boolean expected"); }
			s.buffer.writeUInt8(+v, s.scan++);
		},
		getJsonSchema() { return { type: "boolean" }; },
		getTypescriptType(indent: string) { return "boolean"; }
	},
	string: stringParser([]),
	paddedstring: stringParser([0]),
}

parserFunctions = {
	ref: referenceValueParser,
	accum: intAccumolatorParser,
	opt: optParser,
	chunkedarray: chunkedArrayParser,
	bytesleft: bytesRemainingParser,
	buffer: bufferParser,
	nullarray: arrayNullTerminatedParser,
	array: arrayParser,
	struct: structParser,
	tuple: tuppleParser,

	...hardcodes,
	...parserPrimitives
}
