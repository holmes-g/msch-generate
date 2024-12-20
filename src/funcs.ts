

/**Parses command line args. */
export function parseArgs(
	args: string[]
): [parsedArgs: { [index: string]: string|undefined }, mainArgs: string[]] {
	let parsedArgs: {
		[index: string]: string;
	} = {};
	let mainArgs: string[] = [];
	let i = 0;
	while (true) {
		i++;
		if (i > 1000) {
			throw new Error("Too many arguments!");
		}
		let arg = args.splice(0, 1)[0];
		if (arg == undefined) break;
		if (arg.startsWith("--")) {
			if (args[0]?.startsWith("-")) parsedArgs[arg.substring(2)] = "null";
			else parsedArgs[arg.substring(2)] = args.splice(0, 1)[0] ?? "null";
		} else if (arg.startsWith("-")) {
			if (args[0]?.startsWith("-")) parsedArgs[arg.substring(1)] = "null";
			else parsedArgs[arg.substring(1)] = args.splice(0, 1)[0] ?? "null";
		} else {
			mainArgs.push(arg);
		}
	}
	return [parsedArgs, mainArgs];
}

export function toHexCodes(buf: Buffer) {
	return Array.from(buf).map(el =>
		("00" + el.toString(16).toUpperCase()).slice(-2)
	);
}

export function fromHexCodes(str: string):Buffer {
	return Buffer.from(str.split(" ").map(el => parseInt(el, 16)));
}

/**Parses icons out of the data in the icons.properties file from the Mindustry source code. */
export function parseIcons(data:string[]) {
	const icons: {
		[id: string]: string;
	} = {};
	for(const line of data){
		if(line.length == 0) continue;
		try {
			icons[
				"_" + line.split("=")[1].split("|")[0].replaceAll("-","_")
			] = String.fromCodePoint(parseInt(line.split("=")[0]));
		} catch(err){
			if(!(err instanceof RangeError)){
				console.error(line);
				throw err;
			}
		}
	}
	return icons;
}

class Message extends Error {
	name = "Message";
}

export function fail(message:string):never {
	throw new Message(message);
}
export function crash(message:string):never {
	throw new Error(message);
}
export function impossible():never {
	throw new Error(`this shouldn't be possible...`);
}

/** `object` must not have any properties that are not specified in the type definition. */
export function getKey<T extends {}, K extends PropertyKey>(object:T, key:K):(T extends unknown ? T[K & keyof T] : never) | undefined {
	if(object instanceof Object)
		crash(`getKey() is unsafe on an object that inherits from Object.prototype, because it will cause type unsoundness if key is "__proto__" or "hasOwnProperty"`);
	return (object as any)[key] as (T extends unknown ? T[K & keyof T] : never) | undefined;
}

export function tryRunOr<T>(callback:() => T, errorHandler:(err:Message) => unknown):boolean {
	try {
		callback();
		return true;
	} catch(err){
		if(err instanceof Message){
			errorHandler(err);
			return false;
		} else throw err;
	}
}
