export default class DefaultMap<K, V> extends Map<K, V> {
	protected defaultFactory: (key: K) => V;

	constructor(defaultFactory: V | ((key: K) => V)) {
		super()

		if (typeof defaultFactory === 'function') {
			this.defaultFactory = defaultFactory as (key: K) => V
		} else {
			this.defaultFactory = () => defaultFactory
		}
	}

	public get(key: K): V {
		if (super.has(key)) {
			return super.get(key)!
		}

		const value = this.defaultFactory(key)
		this.set(key, value)
		return value
	}

	public getIgnoreDefault(key: K): V | undefined {
		return super.get(key)
	}
}
